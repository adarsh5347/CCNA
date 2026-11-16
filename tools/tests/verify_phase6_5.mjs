import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "../..");
const SCREENSHOTS_DIR = path.join(__dirname, "phase6_5_screenshots");
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
  console.log("=== NETOPS COMMAND — PHASE 6.5 VERIFICATION & VISUAL AUDIT SUITE ===");
  const { server, port } = await startServer(ROOT_DIR);
  console.log(`Ephemeral test server started on http://127.0.0.1:${port}`);

  const debugPort = 9420 + Math.floor(Math.random() * 400);
  const tmpDir = path.join(ROOT_DIR, ".tmp_chrome_p65_" + debugPort);
  const chromeProcess = spawn(
    CHROME_PATH,
    [
      "--headless=new",
      `--remote-debugging-port=${debugPort}`,
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      `--user-data-dir=${tmpDir}`,
      `http://127.0.0.1:${port}/?page=home`
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
    await sleep(250);

    // Clear initial toasts if any
    await cdp.evaluate(`
      const tc = document.getElementById("toastContainer");
      if (tc) tc.innerHTML = "";
    `);

    // ─── CHECK 1: First-Screen Onboarding & CTA Visual Integrity ───
    const check1 = await cdp.evaluate(`
      (() => {
        const modal = document.getElementById("onboardingModal");
        const btnPrimary = document.getElementById("btnLaunchStudy");
        const btnSecondary = document.getElementById("btnExplorePlatform");
        const ribbon = document.querySelector(".noc-telemetry-ribbon");
        const consoleBox = document.querySelector(".home-hero-visual.noc-dark-console");

        const pStyle = getComputedStyle(btnPrimary);
        const sStyle = getComputedStyle(btnSecondary);
        const cStyle = getComputedStyle(consoleBox);

        return {
          modalHidden: Boolean(modal && modal.classList.contains("hidden")),
          primaryBg: pStyle.backgroundColor,
          primaryColor: pStyle.color,
          secondaryTextDec: sStyle.textDecorationLine,
          hasRibbon: Boolean(ribbon),
          consoleBg: cStyle.backgroundColor
        };
      })()
    `);
    assert(check1.modalHidden, "Check 1 failed: onboardingModal blocked first screen");
    assert(check1.primaryBg === "rgb(0, 113, 227)", `Check 1 failed: #btnLaunchStudy bg expected rgb(0, 113, 227), got ${check1.primaryBg}`);
    assert(check1.secondaryTextDec === "none", `Check 1 failed: #btnExplorePlatform text-decoration expected none, got ${check1.secondaryTextDec}`);
    assert(check1.hasRibbon && check1.consoleBg === "rgb(9, 13, 22)", `Check 1 failed: NetOps dark console missing (${check1.consoleBg})`);
    console.log("[PASS] 1. First-screen unobstructed, Apple Blue Primary CTA (#0071E3), Secondary Link Button & Dark Hero Console verified.");

    // ─── CHECK 2: Segmented Composition, Blueprint Distribution & 2x2 Explore ───
    const check2 = await cdp.evaluate(`
      (() => {
        const statsGrouped = document.querySelector(".home-stats-grouped");
        const statsCount = statsGrouped ? statsGrouped.querySelectorAll(".stat").length : 0;
        const specLists = document.querySelectorAll(".mode-spec-list").length;
        const bpStrip = document.querySelector(".blueprint-distribution-strip");
        const bpSegs = bpStrip ? bpStrip.querySelectorAll(".bp-seg").length : 0;
        const drillBtns = document.querySelectorAll(".bp-drill-link").length;
        const exploreCols = getComputedStyle(document.querySelector(".explore-grid")).gridTemplateColumns.split(" ").length;
        const ticker = document.querySelector(".noc-system-ticker");

        return { statsCount, specLists, bpSegs, drillBtns, exploreCols, hasTicker: Boolean(ticker) };
      })()
    `);
    assert(check2.statsCount === 5, `Check 2 failed: grouped stats count=${check2.statsCount}`);
    assert(check2.specLists >= 2 && check2.bpSegs === 6 && check2.drillBtns === 6, `Check 2 failed: ${JSON.stringify(check2)}`);
    assert(check2.exploreCols === 2 && check2.hasTicker, `Check 2 failed: exploreCols=${check2.exploreCols}`);
    console.log("[PASS] 2. Grouped KPI strip, 3+2 Practice Modes, 100% Blueprint Distribution Bar, Drill buttons & 2x2 Explore verified.");

    // Capture Dark Desktop Home Screenshots (Hero, Modes+Blueprint, Explore+Focused Simulator)
    await cdp.evaluate(`window.applyTheme("dark"); window.scrollTo(0, 0);`);
    await sleep(250);
    await cdp.captureScreenshot("01_home_1440_dark_hero.png");

    await cdp.evaluate(`document.getElementById("practiceModulesHeading")?.scrollIntoView({ block: "start" });`);
    await sleep(250);
    await cdp.captureScreenshot("02_home_1440_dark_modes_blueprint.png");

    await cdp.evaluate(`document.querySelector(".home-blueprint-section")?.scrollIntoView({ block: "start" });`);
    await sleep(250);
    await cdp.captureScreenshot("02b_home_1440_dark_blueprint_explore.png");

    await cdp.evaluate(`document.getElementById("nocSimulatorSection")?.scrollIntoView({ block: "start" });`);
    await sleep(250);
    await cdp.captureScreenshot("03_home_1440_dark_explore_simulator.png");

    // ─── CHECK 3: Progressive Disclosure NOC Simulator Workbench ───
    const check3 = await cdp.evaluate(`
      (() => {
        const drawer = document.getElementById("nocConsoleDrawer");
        const initiallyClosed = drawer ? !drawer.open : false;
        // Click Switch SW-1 node inside topoSvg to verify auto-open!
        const swNode = document.querySelector('#topoSvg .topo-node[data-node="switch"]');
        swNode?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        const openedAfterClick = drawer ? drawer.open : false;
        const cfgText = document.getElementById("nodeConfigContent")?.textContent || "";

        return { initiallyClosed, openedAfterClick, hasCliOutput: cfgText.length > 30 };
      })()
    `);
    assert(check3.initiallyClosed && check3.openedAfterClick && check3.hasCliOutput, `Check 3 failed: ${JSON.stringify(check3)}`);
    await sleep(250);
    await cdp.captureScreenshot("04_home_1440_dark_simulator_drawer_open.png");
    console.log("[PASS] 3. NOC Simulator progressive disclosure drawer auto-opens on node inspection and displays IOS CLI output.");

    // Capture Light Desktop Home Screenshots
    await cdp.evaluate(`
      document.getElementById("nocConsoleDrawer").open = false;
      window.applyTheme("light");
      window.scrollTo(0, 0);
    `);
    await sleep(300);
    const lightHome = await cdp.evaluate(`
      (() => {
        const heroBg = getComputedStyle(document.querySelector(".home-hero")).backgroundColor;
        const consoleBg = getComputedStyle(document.querySelector(".home-hero-visual.noc-dark-console")).backgroundColor;
        const simBg = getComputedStyle(document.getElementById("nocSimulatorSection")).backgroundColor;
        const modeBg = getComputedStyle(document.querySelector(".mode-card")).backgroundColor;
        return { heroBg, consoleBg, simBg, modeBg };
      })()
    `);
    assert(lightHome.modeBg === "rgb(255, 255, 255)", `Light home mode card expected white, got ${lightHome.modeBg}`);
    assert(lightHome.consoleBg === "rgb(9, 13, 22)" && lightHome.simBg === "rgb(9, 13, 22)", `Dark engineering consoles must retain dark contrast in Light mode: ${JSON.stringify(lightHome)}`);
    await cdp.captureScreenshot("05_home_1440_light_hero.png");

    await cdp.evaluate(`document.getElementById("practiceModulesHeading")?.scrollIntoView({ block: "start" });`);
    await sleep(250);
    await cdp.captureScreenshot("06_home_1440_light_modes_blueprint.png");

    await cdp.evaluate(`document.querySelector(".home-blueprint-section")?.scrollIntoView({ block: "start" });`);
    await sleep(250);
    await cdp.captureScreenshot("06b_home_1440_light_blueprint_explore.png");
    console.log("[PASS] 4. Light Mode editorial bright sections vs intentional Dark NOC Technical Consoles contrast verified.");

    // ─── CHECK 5: passProbability Empty vs Active Code Path Validation ───
    const probValidation = await cdp.evaluate(`
      (() => {
        window.state.analytics.attempts = [];
        window.state.analytics.totalQ = 0;
        window.state.analytics.correct = 0;
        const emptyProb = window.passProbability();

        window.state.analytics.totalQ = 5;
        window.state.analytics.correct = 0;
        const minClampedProb = window.passProbability();

        return { emptyProb, minClampedProb };
      })()
    `);
    assert(probValidation.emptyProb === 0 && probValidation.minClampedProb === 5, `Check 5 failed: ${JSON.stringify(probValidation)}`);
    console.log("[PASS] 5. Verified passProbability() contract: 0% for empty state (early return), 5% minimum clamp when totalQ > 0.");

    // ─── CHECK 6: Actionable Analytics, Next Focus Panel & Fixed Domain/Trend Rendering ───
    await cdp.evaluate(`
      const today = new Date();
      const todayStr = today.getFullYear() + "-" + String(today.getMonth()+1).padStart(2,"0") + "-" + String(today.getDate()).padStart(2,"0");
      window.state.analytics.lastAttemptDate = todayStr;
      window.state.analytics.attempts = [
        { mode: "quiz", score: 65, correct: 13, total: 20, at: new Date(Date.now() - 86400000 * 3).toISOString() },
        { mode: "domain", score: 75, correct: 15, total: 20, at: new Date(Date.now() - 86400000 * 2).toISOString() },
        { mode: "exam", score: 82, correct: 41, total: 50, at: new Date(Date.now() - 86400000).toISOString() },
        { mode: "quiz", score: 88, correct: 22, total: 25, at: new Date().toISOString() }
      ];
      window.state.analytics.totalQ = 115;
      window.state.analytics.correct = 91;
      window.state.analytics.xp = 345;
      window.state.analytics.studyMin = 210;
      window.state.analytics.totalTime = 2400;
      window.state.analytics.labsCompleted = 3;
      window.state.analytics.subnetMaxStreak = 12;
      window.state.analytics.streak = 4;
      window.state.analytics.domain = {
        "Network Fundamentals": { total: 25, correct: 22 },
        "Network Access": { total: 20, correct: 16 },
        "IP Connectivity": { total: 30, correct: 25 },
        "IP Services": { total: 15, correct: 8 },
        "Security Fundamentals": { total: 15, correct: 12 },
        "Automation and Programmability": { total: 10, correct: 8 }
      };
      window.applyTheme("dark");
      window.setPage("analytics");
      window.renderAnalytics();
      window.scrollTo(0, 0);
    `);
    await sleep(300);

    const check6 = await cdp.evaluate(`
      (() => {
        const focusTitle = document.getElementById("nextFocusDomainTitle")?.textContent || "";
        const focusBtn = document.getElementById("btnNextFocusCta")?.textContent || "";
        const plannerStyle = getComputedStyle(document.getElementById("btnJumpPlanner"));
        const statsCount = document.querySelectorAll("#analyticsStats .stat").length;
        const domainCards = Array.from(document.querySelectorAll("#domainBreakdown .domain-ring-card"));
        const domainCols = getComputedStyle(document.querySelector(".analytics-domains-grid")).gridTemplateColumns.split(" ").length;
        const weakRingStroke = document.querySelector("#domainBreakdown .is-weak-domain .ring-fill")?.getAttribute("stroke") || "";
        const badgeHeight = document.querySelector("#domainBreakdown .domain-weight-pill")?.getBoundingClientRect().height || 0;
        const trendSvg = document.querySelector("#trend .trend-chart-svg");

        return {
          focusTitle,
          focusBtn,
          plannerIsStyledBtn: plannerStyle.textDecorationLine === "none",
          statsCount,
          domainCardCount: domainCards.length,
          domainCols,
          weakRingStroke,
          badgeHeight,
          trendAspect: trendSvg?.getAttribute("preserveAspectRatio")
        };
      })()
    `);
    assert(check6.focusTitle.includes("IP Services") && check6.focusTitle.includes("53%"), `Check 6 failed: next focus mismatch ${check6.focusTitle}`);
    assert(check6.focusBtn.includes("Practice IP Services Now"), `Check 6 failed: focus CTA=${check6.focusBtn}`);
    assert(check6.plannerIsStyledBtn && check6.statsCount === 6 && check6.domainCardCount === 6 && check6.domainCols === 3, `Check 6 failed: ${JSON.stringify(check6)}`);
    assert(check6.badgeHeight > 0 && check6.badgeHeight < 30, `Check 6 failed: domain weight pill wrapped abnormally height=${check6.badgeHeight}`);
    assert(check6.trendAspect === "xMidYMid meet", `Check 6 failed: SVG preserveAspectRatio=${check6.trendAspect}`);
    console.log("[PASS] 6. Actionable 'Your Next Focus' (IP Services 53%), 6-metric strip, 3x2 domain cards, and proportioned SVG chart verified.");

    // Capture Dark Analytics Screenshots
    await cdp.captureScreenshot("07_analytics_1440_dark_top.png");

    await cdp.evaluate(`document.getElementById("analyticsDomainSection")?.scrollIntoView({ block: "start" });`);
    await sleep(250);
    await cdp.captureScreenshot("08_analytics_1440_dark_domains_trend.png");

    await cdp.evaluate(`document.getElementById("achievementsPanel")?.scrollIntoView({ block: "start" });`);
    await sleep(250);
    await cdp.captureScreenshot("09_analytics_1440_dark_achievements_planner.png");

    // Capture Light Analytics Screenshots
    await cdp.evaluate(`window.applyTheme("light"); window.scrollTo(0, 0);`);
    await sleep(300);
    await cdp.captureScreenshot("10_analytics_1440_light_top.png");

    await cdp.evaluate(`document.getElementById("analyticsDomainSection")?.scrollIntoView({ block: "start" });`);
    await sleep(250);
    await cdp.captureScreenshot("11_analytics_1440_light_domains.png");

    // ─── CHECK 7: Test Domain Drill Click -> Quiz Session ───
    const drillRes = await cdp.evaluate(`
      (() => {
        document.getElementById("btnNextFocusCta")?.click();
        const activePage = document.body.getAttribute("data-active-page");
        const modeTitle = document.getElementById("modeTitle")?.textContent || "";
        window.setPage("home");
        document.getElementById("btnDiscardSavedQuiz")?.click();
        const tc = document.getElementById("toastContainer");
        if (tc) tc.innerHTML = "";
        return { activePage, modeTitle };
      })()
    `);
    assert(drillRes.activePage === "engine", `Check 7 failed: startDomainDrill did not navigate to engine (${drillRes.activePage})`);
    console.log("[PASS] 7. Interactive Weak-Domain Drill CTA ('Practice IP Services Now') launches targeted quiz engine.");

    // ─── CHECK 8: Responsive Viewports & Zero Overflow across Home + Analytics ───
    const viewports = [
      { w: 1440, h: 900, mobile: false, label: "Desktop 1440" },
      { w: 1024, h: 768, mobile: false, label: "Small Desktop 1024" },
      { w: 982, h: 731, mobile: false, label: "Lighthouse 982" },
      { w: 768, h: 1024, mobile: true, label: "Tablet 768", homeShot: "12_home_768_tablet_dark.png" },
      { w: 390, h: 844, mobile: true, label: "Mobile 390", homeShot: "13_home_390_mobile_dark.png", analyticsShot: "14_analytics_390_mobile_dark.png" },
      { w: 360, h: 740, mobile: true, label: "Mobile 360", analyticsLightShot: "15_analytics_360_mobile_light.png" }
    ];

    for (const vp of viewports) {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width: vp.w,
        height: vp.h,
        deviceScaleFactor: 1,
        mobile: vp.mobile
      });
      await cdp.evaluate(`window.applyTheme("dark"); window.setPage("home"); window.scrollTo(0, 0);`);
      await sleep(220);

      const ovHome = await cdp.evaluate(`({ docW: document.documentElement.scrollWidth, winW: window.innerWidth })`);
      assert(ovHome.docW <= ovHome.winW, `Home overflow at ${vp.w}px: scrollWidth=${ovHome.docW} > ${ovHome.winW}`);
      if (vp.homeShot) await cdp.captureScreenshot(vp.homeShot);

      await cdp.evaluate(`window.setPage("analytics"); window.renderAnalytics(); window.scrollTo(0, 0);`);
      await sleep(220);
      const ovAnalytics = await cdp.evaluate(`({ docW: document.documentElement.scrollWidth, winW: window.innerWidth })`);
      assert(ovAnalytics.docW <= ovAnalytics.winW, `Analytics overflow at ${vp.w}px: scrollWidth=${ovAnalytics.docW} > ${ovAnalytics.winW}`);
      if (vp.analyticsShot) await cdp.captureScreenshot(vp.analyticsShot);

      if (vp.analyticsLightShot) {
        await cdp.evaluate(`window.applyTheme("light"); window.scrollTo(0, 0);`);
        await sleep(220);
        await cdp.captureScreenshot(vp.analyticsLightShot);
      }
    }
    console.log("[PASS] 8. Verified 0 horizontal overflow across 1440px, 1024px, 982px, 768px, 390px, and 360px on both Home & Analytics.");

    // ─── CHECK 9: Zero Console Errors & Page Exceptions ───
    assert(cdp.consoleErrors.length === 0, `Console errors detected: ${JSON.stringify(cdp.consoleErrors)}`);
    assert(cdp.pageExceptions.length === 0, `Page exceptions detected: ${JSON.stringify(cdp.pageExceptions)}`);
    console.log("[PASS] 9. Zero JavaScript console errors or uncaught exceptions.");

    const shotFiles = fs.readdirSync(SCREENSHOTS_DIR).filter((f) => f.endsWith(".png"));
    console.log(`\n🎉 ALL PHASE 6.5 VERIFICATION CHECKS PASSED! (${shotFiles.length} screenshots captured in tools/tests/phase6_5_screenshots/)`);
  } finally {
    if (cdp) cdp.close();
    try { chromeProcess.kill(); } catch {}
    server.close();
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  }
}

run().catch((err) => {
  console.error("\n❌ PHASE 6.5 VERIFICATION FAILED:", err);
  process.exit(1);
});
