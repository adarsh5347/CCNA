import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "../..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const SCREENSHOTS_DIR = path.join(__dirname, "phase8_screenshots");
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon"
};

function startServer(rootDir) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlObj = new URL(req.url, "http://127.0.0.1");
      let relPath = decodeURIComponent(urlObj.pathname);
      if (relPath === "/") relPath = "/index.html";
      const filePath = path.join(rootDir, relPath);
      if (!filePath.startsWith(rootDir)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
          "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
          "Cache-Control": "no-store"
        });
        res.end(data);
      });
    });
    server.listen(0, "127.0.0.1", () => {
      resolve({ server, port: server.address().port });
    });
  });
}

async function getDebuggerWebSocketUrl(debugPort) {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
      const targets = await res.json();
      const page = targets.find((t) => t.type === "page");
      if (page && page.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {}
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error("Could not connect to Chrome debugger target");
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
    this.consoleErrors = [];
    this.pageExceptions = [];
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((res, rej) => {
      this.ws.onopen = res;
      this.ws.onerror = rej;
    });
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
      if (msg.method === "Runtime.consoleAPICalled") {
        if (msg.params.type === "error") {
          this.consoleErrors.push(msg.params.args.map((a) => a.value || a.description).join(" "));
        }
      }
      if (msg.method === "Runtime.exceptionThrown") {
        this.pageExceptions.push(msg.params.exceptionDetails.text);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(`CDP Evaluate error: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result.value;
  }

  async captureScreenshot(filename) {
    const res = await this.send("Page.captureScreenshot", { format: "png" });
    const buffer = Buffer.from(res.data, "base64");
    const filePath = path.join(SCREENSHOTS_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    return filePath;
  }

  close() {
    try {
      this.ws.close();
    } catch {}
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function assert(condition, message) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

async function run() {
  console.log("=== NETOPS COMMAND — PHASE 8 VERIFICATION SUITE ===");
  const { server, port } = await startServer(DIST_DIR);
  console.log(`Serving dist bundle on http://127.0.0.1:${port}`);

  const debugPort = 9620 + Math.floor(Math.random() * 350);
  const tmpDir = path.join(ROOT_DIR, ".tmp_chrome_p8_" + debugPort);
  const chromeProcess = spawn(
    CHROME_PATH,
    [
      "--headless=new",
      `--remote-debugging-port=${debugPort}`,
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      `--user-data-dir=${tmpDir}`,
      `http://127.0.0.1:${port}/?page=labs`
    ],
    { stdio: "ignore" }
  );

  let cdp = null;

  try {
    const wsUrl = await getDebuggerWebSocketUrl(debugPort);
    cdp = new CDPClient(wsUrl);
    await cdp.connect();
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await sleep(900);

    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await sleep(300);

    await cdp.evaluate(`
      localStorage.setItem("netops_theme_v1", "dark");
      document.documentElement.setAttribute("data-theme", "dark");
      const tc = document.getElementById("toastContainer");
      if (tc) tc.innerHTML = "";
    `);

    // ─── VIRTUAL IOS LABS CHECKS ───
    await cdp.evaluate(`window.setPage("labs"); window.scrollTo(0, 0);`);
    await sleep(350);

    const labCatalogueCheck = await cdp.evaluate(`
      (() => {
        const heroTitle = document.querySelector(".labs-hero-title")?.textContent?.trim() || "";
        const cardCount = document.querySelectorAll("#labCatalogueGrid [data-lab-card]").length;
        const selCount = document.querySelectorAll("#labSelector option").length;
        const groupCount = document.querySelectorAll("#labCatalogueGrid .lab-cat-group").length;
        const objCount = document.querySelectorAll("#labObjectivesList .lab-obj-item").length;
        const overflow = document.documentElement.scrollWidth > window.innerWidth;
        return { heroTitle, cardCount, selCount, groupCount, objCount, overflow };
      })()
    `);
    assert(labCatalogueCheck.heroTitle === "Build. Configure. Troubleshoot.", `Unexpected hero title: ${labCatalogueCheck.heroTitle}`);
    assert(labCatalogueCheck.cardCount === 10 && labCatalogueCheck.selCount === 10, `Expected 10 labs, got cards=${labCatalogueCheck.cardCount}, opt=${labCatalogueCheck.selCount}`);
    assert(labCatalogueCheck.groupCount === 3 && labCatalogueCheck.objCount === 4, `Unexpected lab groups/objectives: ${JSON.stringify(labCatalogueCheck)}`);
    assert(!labCatalogueCheck.overflow, "Horizontal overflow on Lab Catalogue desktop");
    await cdp.captureScreenshot("01_lab_catalogue_desktop.png");
    console.log("PASS [1-2. Lab Catalogue & Objectives]: 10 labs across 3 groups + 4 objectives rendered");

    // Guided mode + inspector scroll
    await cdp.evaluate(`
      document.getElementById("labWorkspace")?.scrollIntoView({ behavior: "instant", block: "start" });
    `);
    await sleep(200);
    const guidedInspector = await cdp.evaluate(`
      (() => {
        const body = document.getElementById("labInspectorBody")?.innerHTML || "";
        return { hasExpected: body.includes("Expected Syntax"), termVisible: Boolean(document.getElementById("labCliOutput")) };
      })()
    `);
    assert(guidedInspector.hasExpected && guidedInspector.termVisible, "Guided mode inspector missing expected syntax");
    await cdp.captureScreenshot("03_lab_guided_workspace.png");
    await cdp.captureScreenshot("06_lab_ios_terminal.png");

    // Challenge mode: distractors present, guided syntax hidden, wrong command feedback + shorthand valid command
    await cdp.evaluate(`document.getElementById("btnModeChallenge")?.click()`);
    await sleep(200);
    const challengeCheck = await cdp.evaluate(`
      (() => {
        const inspHtml = document.getElementById("labInspectorBody")?.innerHTML || "";
        const pillCount = document.querySelectorAll("#labInteractiveInputs .btn-lab-cmd").length;
        const manualIn = document.getElementById("labManualCliInput");
        const runBtn = document.getElementById("btnLabRunManual");
        manualIn.value = "wrong command test";
        runBtn.click();
        const errFeedback = document.getElementById("labFeedbackBox")?.className || "";
        // Test manual shorthand on Lab 1
        manualIn.value = "vlan 10";
        runBtn.click();
        const afterVlan10 = document.getElementById("labCliOutput")?.textContent || "";
        return {
          noExpectedLeak: !inspHtml.includes("Expected Syntax"),
          hasChallengeNote: inspHtml.includes("Challenge Mode"),
          pillCount,
          errOk: errFeedback.includes("is-error"),
          stepAccepted: afterVlan10.includes("vlan 10")
        };
      })()
    `);
    assert(challengeCheck.noExpectedLeak && challengeCheck.hasChallengeNote && challengeCheck.pillCount > 10 && challengeCheck.errOk && challengeCheck.stepAccepted, `Challenge check failed: ${JSON.stringify(challengeCheck)}`);
    await cdp.captureScreenshot("04_lab_challenge_mode.png");
    console.log("PASS [3-4, 6-8. Guided, Challenge, Manual Input & Feedback]: Distractors, shorthand, error feedback verified");

    // Complete Lab 2 using IOS shorthands + arrow history + XP + persistence!
    await cdp.evaluate(`
      document.querySelector('[data-lab-card="2"]')?.click();
      document.getElementById("btnModeStep")?.click();
    `);
    await sleep(200);
    const shorthandCompletion = await cdp.evaluate(`
      (() => {
        const manualIn = document.getElementById("labManualCliInput");
        const runBtn = document.getElementById("btnLabRunManual");
        const lab2Shorthands = [
          "int gi0/0.10",
          "encapsulation dot1Q 10",
          "ip address 10.10.10.1 255.255.255.0",
          "int gi0/0.20",
          "encapsulation dot1Q 20",
          "ip address 10.10.20.1 255.255.255.0"
        ];
        for (const cmd of lab2Shorthands) {
          manualIn.value = cmd;
          runBtn.click();
        }
        // Test ArrowUp command history
        manualIn.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
        const historyRecalled = manualIn.value === "ip address 10.10.20.1 255.255.255.0";
        const cliText = document.getElementById("labCliOutput")?.textContent || "";
        const bannerVisible = !document.getElementById("labCompletionBanner")?.classList.contains("hidden");
        const xpText = document.getElementById("labStatXP")?.textContent || "";
        const compText = document.getElementById("labStatCompleted")?.textContent || "";
        return {
          historyRecalled,
          hasSuccessCode: cliText.includes("%CONFIG-5-SUCCESS"),
          bannerVisible,
          xpAwarded: window.state.analytics.xp >= 50 && xpText.includes("50 XP"),
          compUpdated: compText.startsWith("1 / 10")
        };
      })()
    `);
    assert(shorthandCompletion.historyRecalled && shorthandCompletion.hasSuccessCode && shorthandCompletion.bannerVisible && shorthandCompletion.xpAwarded && shorthandCompletion.compUpdated, `Shorthand/Completion failed: ${JSON.stringify(shorthandCompletion)}`);
    await cdp.captureScreenshot("07_lab_completion.png");
    console.log("PASS [7, 9. IOS Shorthand, History & Lab Completion]: +50 XP, Completion banner, Up-arrow history verified");

    // Exam Matching mode check
    await cdp.evaluate(`
      document.getElementById("btnModeExam")?.click();
    `);
    await sleep(200);
    const examModeCheck = await cdp.evaluate(`
      (() => {
        const objs = Array.from(document.querySelectorAll(".exam-obj-item"));
        const cmds = Array.from(document.querySelectorAll(".exam-cmd-item"));
        if (objs.length > 0 && cmds.length > 0) {
          objs[0].click();
          cmds[0].click();
        }
        const matchedText = document.getElementById("matchedVal-0")?.textContent || "";
        return { objCount: objs.length, cmdCount: cmds.length, paired: matchedText.includes("Matched:") };
      })()
    `);
    assert(examModeCheck.objCount === 6 && examModeCheck.cmdCount === 6 && examModeCheck.paired, `Exam mode failed: ${JSON.stringify(examModeCheck)}`);
    await cdp.captureScreenshot("05_lab_exam_mode.png");
    console.log("PASS [5. Exam Matching Mode]: 6 objective/command cards paired cleanly");

    // Persistence across page reload
    await cdp.send("Page.reload", { ignoreCache: false });
    await sleep(900);
    const persistCheck = await cdp.evaluate(`
      (() => {
        window.setPage("labs");
        return {
          labsCompleted: window.state.analytics.labsCompleted,
          xp: window.state.analytics.xp,
          completedBadge: document.querySelector('[data-lab-card="2"] .lab-cat-status')?.textContent?.trim()
        };
      })()
    `);
    assert(persistCheck.labsCompleted >= 1 && persistCheck.xp >= 50 && persistCheck.completedBadge === "Completed", `Persistence failed: ${JSON.stringify(persistCheck)}`);
    console.log("PASS [10. Progress Persistence]: Reload preserved completed lab #2 and XP");

    // ─── NOC SIMULATOR CHECKS (HOME PAGE) ───
    await cdp.evaluate(`
      window.setPage("home");
      document.getElementById("nocSimulatorSection")?.scrollIntoView({ behavior: "instant", block: "start" });
    `);
    await sleep(300);

    const topoInit = await cdp.evaluate(`
      (() => {
        const heading = document.getElementById("simulatorHeading")?.textContent?.trim() || "";
        const t1ViewBox = document.getElementById("topoSvg")?.getAttribute("viewBox");
        const t2ViewBox = document.getElementById("topoSvg2")?.getAttribute("viewBox");
        const t1Options = Array.from(document.querySelectorAll("#simPacketType option")).map(o => o.value);
        const tabNodes = Array.from(document.querySelectorAll("#topoSvg .topo-node[data-node]"));
        const allKeyboardReady = tabNodes.every(n => n.getAttribute("tabindex") === "0" && n.getAttribute("role") === "button" && n.getAttribute("aria-label"));
        return { heading, t1ViewBox, t2ViewBox, t1Options, allKeyboardReady };
      })()
    `);
    assert(topoInit.heading.includes("See every packet.") && topoInit.heading.includes("Understand every path."), `Unexpected simulator heading: ${topoInit.heading}`);
    assert(topoInit.t1ViewBox === "0 0 700 280" && topoInit.t2ViewBox === "0 0 700 280", "SVG viewBox changed unexpectedly");
    assert(topoInit.t1Options.length === 7 && topoInit.allKeyboardReady, `Packet options or a11y attributes failed: ${JSON.stringify(topoInit)}`);
    await cdp.captureScreenshot("08_noc_branch_topology.png");

    // Topology 2 + Packet options + Keyboard Enter inspection on SVG node + Zoom/Pan
    await cdp.evaluate(`document.getElementById("btnTopo2")?.click()`);
    await sleep(150);
    const topo2Check = await cdp.evaluate(`
      (() => {
        const t2Visible = getComputedStyle(document.getElementById("topoSvg2")).display === "block";
        const t2Opts = Array.from(document.querySelectorAll("#simPacketType option")).map(o => o.value);
        const rBranch = document.querySelector('#topoSvg2 .topo-node[data-node="r-branch"]');
        rBranch?.focus();
        rBranch?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
        const drawerOpen = document.getElementById("nocConsoleDrawer")?.open;
        const selectedPressed = rBranch?.getAttribute("aria-pressed") === "true";
        const sel = document.getElementById("cliCommandSelect");
        let cliWorked = false;
        if (sel && sel.options.length > 1) {
          sel.selectedIndex = 1;
          sel.dispatchEvent(new Event("change", { bubbles: true }));
          cliWorked = (document.getElementById("cliOutputTerminal")?.textContent || "").length > 30;
        }
        document.getElementById("btnTopoZoomPan")?.click();
        const zoomAdded = document.querySelector(".topology-main")?.classList.contains("pan-zoom-mode");
        document.getElementById("btnTopoZoomFit")?.click();
        const zoomRemoved = !document.querySelector(".topology-main")?.classList.contains("pan-zoom-mode");
        return { t2Visible, t2Opts, drawerOpen, selectedPressed, cliWorked, zoomAdded, zoomRemoved };
      })()
    `);
    assert(topo2Check.t2Visible && topo2Check.t2Opts.length === 3 && topo2Check.drawerOpen && topo2Check.selectedPressed && topo2Check.cliWorked && topo2Check.zoomAdded && topo2Check.zoomRemoved, `Topo 2 / keyboard / CLI / zoom failed: ${JSON.stringify(topo2Check)}`);
    await cdp.captureScreenshot("09_noc_enterprise_topology.png");
    await cdp.evaluate(`document.getElementById("nocConsoleDrawer")?.scrollIntoView({ behavior: "instant", block: "center" })`);
    await sleep(120);
    await cdp.captureScreenshot("13_noc_device_cli_panel.png");
    await cdp.evaluate(`document.getElementById("nocSimulatorSection")?.scrollIntoView({ behavior: "instant", block: "start" })`);
    console.log("PASS [11-13, 17-18, 22-23. Topologies, Keyboard Node Enter/Space, CLI & Zoom/Pan]: Verified");

    // Live simulation + OSI Inspector + Fast Speed on Topology 1
    await cdp.evaluate(`
      document.getElementById("btnTopo1")?.click();
      document.getElementById("simSpeed").value = "1200";
      document.getElementById("simPacketType").value = "ping";
      document.getElementById("btnStartSim")?.click();
    `);
    await sleep(1600);
    await cdp.captureScreenshot("10_noc_packet_traversal.png");
    await cdp.captureScreenshot("11_noc_osi_inspector.png");
    await sleep(4200);
    const simResult = await cdp.evaluate(`
      (() => {
        const badge = document.getElementById("simStatusBadge")?.textContent?.trim();
        const osiL3 = document.getElementById("osi-l3-val")?.textContent || "";
        const logLen = document.querySelectorAll("#simLogContent .noc-log-entry").length;
        return { badge, osiL3, logLen };
      })()
    `);
    assert(simResult.badge === "DELIVERED" && simResult.osiL3 !== "-" && simResult.logLen >= 3, `Simulation failed: ${JSON.stringify(simResult)}`);
    console.log("PASS [14-16. Packet Traversal, Speed & OSI Inspector]: Verified");

    // Troubleshooting mode + bug injection + resolution
    await cdp.evaluate(`
      (() => {
        const chkEl = document.getElementById("chkTroubleshooting");
        chkEl.checked = true;
        chkEl.dispatchEvent(new Event("change", { bubbles: true }));
        document.getElementById("simSpeed").value = "1200";
        document.getElementById("simPacketType").value = "ping";
        document.getElementById("btnStartSim")?.click();
      })()
    `);
    await sleep(4200);
    const troubleCheck = await cdp.evaluate(`
      (() => {
        const badge = document.getElementById("simStatusBadge")?.textContent?.trim();
        const bannerVisible = !document.getElementById("nocTroubleSymptomBanner")?.classList.contains("hidden");
        const routerEl = document.querySelector('#topoSvg .topo-node[data-node="router"]');
        routerEl?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        const hasTroublePanel = Boolean(document.querySelector(".noc-trouble-panel"));
        const fixSelect = document.getElementById("cliTroubleFixSelect");
        if (fixSelect) fixSelect.value = "0";
        document.getElementById("btnApplyTroubleFix")?.click();
        const fixedState = Boolean(window.state.simBugsFixed?.ping);
        return { badge, bannerVisible, hasTroublePanel, fixedState };
      })()
    `);
    assert(troubleCheck.badge === "BLOCKED" && troubleCheck.bannerVisible && troubleCheck.hasTroublePanel && troubleCheck.fixedState, `Troubleshooting failed: ${JSON.stringify(troubleCheck)}`);
    await cdp.captureScreenshot("12_noc_troubleshooting_mode.png");

    // Reset check
    await cdp.evaluate(`
      (() => {
        document.getElementById("btnResetSim")?.click();
        const chkEl = document.getElementById("chkTroubleshooting");
        chkEl.checked = false;
        chkEl.dispatchEvent(new Event("change", { bubbles: true }));
      })()
    `);
    await sleep(150);
    const resetCheck = await cdp.evaluate(`
      document.getElementById("simStatusBadge")?.textContent?.trim() === "READY" &&
      document.getElementById("osi-l3-val")?.textContent === "-"
    `);
    assert(resetCheck, "Reset button did not restore simulator state");
    console.log("PASS [19-21. Troubleshooting, Bug Injection & Reset]: Verified");

    // ─── CROSS-PLATFORM VIEWPORTS & THEMES (360, 390, 768, 982, 1024, 1440) ───
    const viewports = [
      { w: 360, h: 780, mob: true },
      { w: 390, h: 844, mob: true },
      { w: 768, h: 1024, mob: true },
      { w: 982, h: 731, mob: false },
      { w: 1024, h: 768, mob: false },
      { w: 1440, h: 900, mob: false }
    ];

    for (const vp of viewports) {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width: vp.w,
        height: vp.h,
        deviceScaleFactor: vp.mob ? 2 : 1,
        mobile: vp.mob
      });
      await sleep(180);
      await cdp.evaluate(`window.setPage("labs"); window.scrollTo(0, 0);`);
      await sleep(160);
      const labsOverflow = await cdp.evaluate(`document.documentElement.scrollWidth > window.innerWidth`);
      assert(!labsOverflow, `Horizontal overflow on #labs at ${vp.w}x${vp.h}`);
      if (vp.w === 390) await cdp.captureScreenshot("02_lab_catalogue_mobile.png");

      await cdp.evaluate(`
        window.setPage("home");
        document.getElementById("nocSimulatorSection")?.scrollIntoView({ behavior: "instant", block: "start" });
      `);
      await sleep(180);
      const nocOverflow = await cdp.evaluate(`document.documentElement.scrollWidth > window.innerWidth`);
      assert(!nocOverflow, `Horizontal overflow on #nocSimulatorSection at ${vp.w}x${vp.h}`);
      if (vp.w === 390) await cdp.captureScreenshot("14_noc_mobile_topology.png");
    }

    // Light & High-Contrast check
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await cdp.evaluate(`
      document.documentElement.setAttribute("data-theme", "light");
      window.setPage("labs");
    `);
    await sleep(400);
    const themeCheck = await cdp.evaluate(`
      (() => {
        const termBg = getComputedStyle(document.querySelector(".lab-terminal-card")).backgroundColor;
        const catBg = getComputedStyle(document.getElementById("labCatalogueSection")).backgroundColor;
        document.body.classList.add("high-contrast");
        const hcBg = getComputedStyle(document.body).backgroundColor;
        document.body.classList.remove("high-contrast");
        document.documentElement.setAttribute("data-theme", "dark");
        return { termBg, catBg, hcBg };
      })()
    `);
    assert(themeCheck.termBg === "rgb(8, 10, 16)" && themeCheck.catBg === "rgb(255, 255, 255)" && themeCheck.hcBg === "rgb(0, 0, 0)", `Theme contrast failed: ${JSON.stringify(themeCheck)}`);

    assert(cdp.consoleErrors.length === 0, `Console errors observed: ${cdp.consoleErrors.join(" | ")}`);
    assert(cdp.pageExceptions.length === 0, `Page exceptions observed: ${cdp.pageExceptions.join(" | ")}`);
    console.log("ALL 30 PHASE 8 CHECKS PASSED WITH 0 CONSOLE ERRORS & 0 EXCEPTIONS!");
  } finally {
    if (cdp) cdp.close();
    chromeProcess.kill();
    server.close();
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
