import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "../..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const SCREENSHOTS_DIR = path.join(__dirname, "phase9_screenshots");
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
          const text = msg.params.args.map((a) => a.value || a.description).join(" ");
          this.consoleErrors.push(text);
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
  console.log("=== NETOPS COMMAND — PHASE 9 VERIFICATION SUITE ===");
  const { server, port } = await startServer(DIST_DIR);
  console.log(`Serving dist bundle on http://127.0.0.1:${port}`);

  const debugPort = 9620 + Math.floor(Math.random() * 350);
  const tmpDir = path.join(ROOT_DIR, ".tmp_chrome_p9_" + debugPort);
  const chromeProcess = spawn(
    CHROME_PATH,
    [
      "--headless=new",
      `--remote-debugging-port=${debugPort}`,
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      `--user-data-dir=${tmpDir}`,
      `http://127.0.0.1:${port}/?page=subnet`
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
    await cdp.send("Network.enable");
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
      window.setPage("subnet");
      window.scrollTo(0, 0);
    `);
    await sleep(350);

    // ─── CHECK 1-2: Hero Editorial, Jump Navigation & Telemetry Strip ───
    const heroInfo = await cdp.evaluate(`
      (() => {
        const title = document.querySelector(".subnet-hero-title")?.textContent?.trim() || "";
        const jumps = document.querySelectorAll(".subnet-jump-pill").length;
        const modes = document.querySelectorAll("#subnet .subnet-mode-tabs button").length;
        const statModes = document.querySelector(".subnet-telemetry-strip")?.textContent || "";
        return { title, jumps, modes, has4Modes: statModes.includes("4 Modes") };
      })()
    `);
    assert(
      heroInfo.title.includes("Master the mathematics") &&
      heroInfo.title.includes("of networking.") &&
      heroInfo.jumps === 3 &&
      heroInfo.modes === 4 &&
      heroInfo.has4Modes,
      `Hero / Telemetry audit failed: ${JSON.stringify(heroInfo)}`
    );
    await cdp.captureScreenshot("01_subnet_hero_telemetry_dark.png");
    console.log("PASS [1-2. Academy Hero & Real Telemetry Strip]: Verified");

    // ─── CHECK 3-6: Mode Switch, Prompt Console, Hint Drawer, Correct Submission & Diagram ───
    await cdp.evaluate(`
      (() => {
        document.getElementById("btnSubnetMedium")?.click();
        document.getElementById("btnSubnetHint")?.click();
      })()
    `);
    await sleep(200);
    const hintCheck = await cdp.evaluate(`
      (() => {
        const hintBox = document.getElementById("subnetHintBox");
        const q = window.state.subnet.q;
        const text = hintBox?.textContent || "";
        const ans = String(q?.answer || "");
        const spoilersAnswer = (q?.qType === "network" || q?.qType === "broadcast" || q?.qType === "first" || q?.qType === "last") && ans.length > 4 && text.includes(ans);
        return {
          mode: window.state.subnet.mode,
          hintVisible: Boolean(hintBox && !hintBox.hidden),
          hasFormula: text.includes("Critical Octet"),
          spoilersAnswer
        };
      })()
    `);
    assert(
      hintCheck.mode === "Medium" && hintCheck.hintVisible && hintCheck.hasFormula && !hintCheck.spoilersAnswer,
      `Hint check failed: ${JSON.stringify(hintCheck)}`
    );

    await cdp.evaluate(`
      (() => {
        const ans = window.state.subnet.q.answer;
        document.getElementById("subnetAnswer").value = ans;
        document.getElementById("subnetSubmit").click();
        document.getElementById("subnetTrainerSection")?.scrollIntoView({ behavior: "instant", block: "start" });
      })()
    `);
    await sleep(250);
    const correctCheck = await cdp.evaluate(`
      (() => {
        const out = document.getElementById("subnetOut")?.textContent || "";
        const diag = document.getElementById("subnetRangeDiagram")?.textContent || "";
        const btnText = document.getElementById("subnetSubmit")?.textContent?.trim() || "";
        const attempted = document.getElementById("subnetStatAttempted")?.textContent;
        const acc = document.getElementById("subnetStatAccuracy")?.textContent;
        const hasInspectBtn = Boolean(document.getElementById("btnOpenInVlsm"));
        const hasBinarySplit = Boolean(document.querySelector("#subnetOut .subnet-binary-breakdown"));
        return {
          hasCorrectText: out.includes("Correct!"),
          hasDiagValues: diag.includes("Network ID") && diag.includes("Broadcast IP"),
          btnText,
          attempted,
          acc,
          hasInspectBtn,
          hasBinarySplit
        };
      })()
    `);
    assert(
      correctCheck.hasCorrectText &&
      correctCheck.hasDiagValues &&
      correctCheck.btnText === "Next Question" &&
      correctCheck.attempted === "1" &&
      correctCheck.acc === "100%" &&
      correctCheck.hasInspectBtn &&
      correctCheck.hasBinarySplit,
      `Correct answer submission failed: ${JSON.stringify(correctCheck)}`
    );
    await cdp.captureScreenshot("02_trainer_correct_breakdown_dark.png");

    // ─── CHECK 7-9: Next Question, Incorrect Submission & "Inspect in VLSM Calculator ->" ───
    await cdp.evaluate(`
      (() => {
        document.getElementById("subnetSubmit").click(); // Next Question
        document.getElementById("subnetAnswer").value = "0.0.0.0-invalid";
        document.getElementById("subnetSubmit").click();
      })()
    `);
    await sleep(250);
    const wrongCheck = await cdp.evaluate(`
      (() => {
        const out = document.getElementById("subnetOut")?.textContent || "";
        return {
          isIncorrect: out.includes("Incorrect."),
          showsSubmitted: out.includes("0.0.0.0-invalid"),
          attempted: document.getElementById("subnetStatAttempted")?.textContent,
          acc: document.getElementById("subnetStatAccuracy")?.textContent,
          streak: window.state.subnet.streak
        };
      })()
    `);
    assert(
      wrongCheck.isIncorrect && wrongCheck.showsSubmitted && wrongCheck.attempted === "2" && wrongCheck.acc === "50%" && wrongCheck.streak === 0,
      `Incorrect submission check failed: ${JSON.stringify(wrongCheck)}`
    );
    await cdp.captureScreenshot("03_trainer_incorrect_compare_dark.png");

    // Click "Inspect in VLSM Calculator ->" & verify Skip button too
    const vlsmJumpCheck = await cdp.evaluate(`
      (() => {
        const inspectBtn = document.getElementById("btnOpenInVlsm");
        const expIp = inspectBtn?.dataset.ip;
        const expPrefix = inspectBtn?.dataset.prefix;
        inspectBtn?.click();
        const loadedIp = document.getElementById("calcIp")?.value;
        const loadedCidr = document.getElementById("calcCidr")?.value;
        const loadedNum = document.getElementById("calcCidrNum")?.value;
        document.getElementById("subnetSkip")?.click();
        return { expIp, expPrefix, loadedIp, loadedCidr, loadedNum, afterSkipAnswered: window.state.subnet.answered };
      })()
    `);
    assert(
      vlsmJumpCheck.loadedIp === vlsmJumpCheck.expIp &&
      vlsmJumpCheck.loadedCidr === vlsmJumpCheck.expPrefix &&
      vlsmJumpCheck.loadedNum === vlsmJumpCheck.expPrefix &&
      vlsmJumpCheck.afterSkipAnswered === false,
      `Inspect in VLSM / Skip failed: ${JSON.stringify(vlsmJumpCheck)}`
    );
    console.log("PASS [3-9. Trainer Modes, Hints, Breakdown, Diagram, VLSM Jump & Skip]: Verified");

    // ─── CHECK 10-12: VLSM Math (/24, /26, /27, /28, /30, /31 RFC 3021, /32 Host Route) ───
    const mathCases = [
      { ip: "192.168.1.50", cidr: 24, net: "192.168.1.0", mask: "255.255.255.0", wild: "0.0.0.255", bcast: "192.168.1.255", hosts: "254", scope: "Private (RFC 1918)", cls: "Class C" },
      { ip: "192.168.10.75", cidr: 26, net: "192.168.10.64", mask: "255.255.255.192", wild: "0.0.0.63", bcast: "192.168.10.127", hosts: "62", scope: "Private (RFC 1918)", cls: "Class C" },
      { ip: "10.20.30.100", cidr: 27, net: "10.20.30.96", mask: "255.255.255.224", wild: "0.0.0.31", bcast: "10.20.30.127", hosts: "30", scope: "Private (RFC 1918)", cls: "Class A" },
      { ip: "172.16.5.35", cidr: 28, net: "172.16.5.32", mask: "255.255.255.240", wild: "0.0.0.15", bcast: "172.16.5.47", hosts: "14", scope: "Private (RFC 1918)", cls: "Class B" },
      { ip: "203.0.113.5", cidr: 30, net: "203.0.113.4", mask: "255.255.255.252", wild: "0.0.0.3", bcast: "203.0.113.7", hosts: "2", scope: "Public", cls: "Class C" },
      { ip: "198.51.100.10", cidr: 31, net: "198.51.100.10", mask: "255.255.255.254", wild: "0.0.0.1", bcast: "198.51.100.11", hosts: "2", scope: "Public", cls: "Class C", noteText: "RFC 3021" },
      { ip: "192.0.2.99", cidr: 32, net: "192.0.2.99", mask: "255.255.255.255", wild: "0.0.0.0", bcast: "192.0.2.99", hosts: "1", scope: "Public", cls: "Class C", noteText: "Host Route (/32)" }
    ];

    for (const c of mathCases) {
      const res = await cdp.evaluate(`
        (() => {
          const ipIn = document.getElementById("calcIp");
          const cidrNum = document.getElementById("calcCidrNum");
          ipIn.value = ${JSON.stringify(c.ip)};
          ipIn.dispatchEvent(new Event("input", { bubbles: true }));
          cidrNum.value = ${JSON.stringify(String(c.cidr))};
          cidrNum.dispatchEvent(new Event("input", { bubbles: true }));
          const special = document.getElementById("calcSpecialPrefixNote");
          return {
            net: document.getElementById("calcNetwork")?.textContent,
            mask: document.getElementById("calcMask")?.textContent,
            wild: document.getElementById("calcWildcard")?.textContent,
            bcast: document.getElementById("calcBroadcast")?.textContent,
            hosts: document.getElementById("calcHosts")?.textContent,
            scope: document.getElementById("calcScope")?.textContent,
            cls: document.getElementById("calcClass")?.textContent,
            netBits: document.getElementById("calcNetBits")?.textContent,
            hostBits: document.getElementById("calcHostBits")?.textContent,
            specialVisible: Boolean(special && !special.hidden),
            specialText: special?.textContent || "",
            bitSpans: document.querySelectorAll("#calcBitGrid span").length,
            bitCells: document.querySelectorAll("#calcBitGrid .bit-cell").length
          };
        })()
      `);
      assert(
        res.net === c.net &&
        res.mask === c.mask &&
        res.wild === c.wild &&
        res.bcast === c.bcast &&
        res.hosts === c.hosts &&
        res.scope === c.scope &&
        res.cls === c.cls &&
        res.netBits === String(c.cidr) &&
        res.hostBits === String(32 - c.cidr) &&
        res.bitSpans >= 32 &&
        res.bitCells === 32,
        `VLSM /${c.cidr} mismatch: got ${JSON.stringify(res)} expected ${JSON.stringify(c)}`
      );
      if (c.noteText) {
        assert(res.specialVisible && res.specialText.includes(c.noteText), `Expected special note "${c.noteText}" for /${c.cidr}`);
      } else {
        assert(!res.specialVisible, `Special note should be hidden for /${c.cidr}`);
      }
      if (c.cidr === 31) {
        await cdp.evaluate(`document.getElementById("vlsmCalcCard")?.scrollIntoView({ behavior: "instant", block: "start" });`);
        await sleep(160);
        await cdp.captureScreenshot("07_vlsm_rfc3021_31_32_and_validation.png");
      }
    }
    console.log("PASS [10-12. VLSM Exact Math Across /24, /26, /27, /28, /30, /31 RFC 3021, /32 Host Route]: Verified");

    // ─── CHECK 13-14: Invalid IPv4 & Out-of-Range CIDR Handling + Bit Cell Click ───
    const validationCases = await cdp.evaluate(`
      (() => {
        const ipIn = document.getElementById("calcIp");
        const cidrNum = document.getElementById("calcCidrNum");
        const msg = document.getElementById("calcValidationMsg");

        // Invalid IP
        ipIn.value = "999.168.1.1";
        ipIn.dispatchEvent(new Event("input", { bubbles: true }));
        const err1 = { hidden: msg.hidden, text: msg.textContent, net: document.getElementById("calcNetwork")?.textContent, ipInvalid: ipIn.classList.contains("is-invalid") };

        // Restore valid IP, test leading-zero IP
        ipIn.value = "192.168.01.1";
        ipIn.dispatchEvent(new Event("input", { bubbles: true }));
        const err2 = { hidden: msg.hidden, net: document.getElementById("calcNetwork")?.textContent };

        // Restore valid IP, test out-of-range CIDR = 33
        ipIn.value = "192.168.10.75";
        ipIn.dispatchEvent(new Event("input", { bubbles: true }));
        cidrNum.value = "33";
        cidrNum.dispatchEvent(new Event("input", { bubbles: true }));
        const err3 = { hidden: msg.hidden, badge: document.getElementById("calcCidrVal")?.textContent, cidrInvalid: cidrNum.classList.contains("is-invalid"), net: document.getElementById("calcNetwork")?.textContent };

        // Recover via clicking bit cell 25 (Bit 26 -> /26) first after setting valid /24
        cidrNum.value = "24";
        cidrNum.dispatchEvent(new Event("input", { bubbles: true }));
        document.querySelector('#calcBitGrid .bit-cell[data-bit-index="25"]')?.click();
        const recovered = {
          hidden: msg.hidden,
          badge: document.getElementById("calcCidrVal")?.textContent,
          net: document.getElementById("calcNetwork")?.textContent,
          hosts: document.getElementById("calcHosts")?.textContent,
          boundaryOk: document.querySelector('#calcBitGrid .bit-cell[data-bit-index="25"]')?.classList.contains("is-boundary")
        };

        return { err1, err2, err3, recovered };
      })()
    `);
    assert(
      !validationCases.err1.hidden && validationCases.err1.ipInvalid && validationCases.err1.net === "--" &&
      !validationCases.err2.hidden && validationCases.err2.net === "--" &&
      !validationCases.err3.hidden && validationCases.err3.badge === "/--" && validationCases.err3.cidrInvalid && validationCases.err3.net === "--" &&
      validationCases.recovered.hidden && validationCases.recovered.badge === "/26" && validationCases.recovered.net === "192.168.10.64" && validationCases.recovered.hosts === "62" && validationCases.recovered.boundaryOk,
      `Validation & Bit-Click failed: ${JSON.stringify(validationCases)}`
    );
    await cdp.evaluate(`document.getElementById("vlsmCalcCard")?.scrollIntoView({ behavior: "instant", block: "start" });`);
    await sleep(160);
    await cdp.captureScreenshot("06_vlsm_calculator_grid_dark.png");
    console.log("PASS [13-14. Strict IPv4/CIDR Validation & Interactive 32-Bit Click]: Verified");

    // ─── CHECK 15-16: Searchable CIDR Cheat Sheet, Preset Chips & Row Sync ───
    const cheatCheck = await cdp.evaluate(`
      (() => {
        const search = document.getElementById("cidrSearchInput");
        search.value = "255.255.255.240";
        search.dispatchEvent(new Event("input", { bubbles: true }));
        const filteredRows = document.querySelectorAll("#cheatSheetBody .cheat-sheet-row").length;
        document.querySelector('#cheatSheetBody .cheat-sheet-row[data-cidr="28"]')?.click();
        const badgeAfterClick = document.getElementById("calcCidrVal")?.textContent;
        search.value = "";
        search.dispatchEvent(new Event("input", { bubbles: true }));
        document.querySelector('.calc-preset-btn[data-mask="22"]')?.click();
        const presetCidr = document.getElementById("calcCidrVal")?.textContent;
        const presetHosts = document.getElementById("calcHosts")?.textContent;
        const highlighted = document.querySelector("#cheatSheetBody .cheat-sheet-row.highlighted-row")?.dataset.cidr;
        document.querySelector(".vlsm-cheatsheet-section")?.scrollIntoView({ behavior: "instant", block: "start" });
        return { filteredRows, badgeAfterClick, allRows: document.querySelectorAll("#cheatSheetBody .cheat-sheet-row").length, presetCidr, presetHosts, highlighted };
      })()
    `);
    assert(
      cheatCheck.filteredRows === 1 &&
      cheatCheck.badgeAfterClick === "/28" &&
      cheatCheck.allRows === 17 &&
      cheatCheck.presetCidr === "/22" &&
      cheatCheck.presetHosts === "1,022" &&
      cheatCheck.highlighted === "22",
      `Cheat sheet / presets failed: ${JSON.stringify(cheatCheck)}`
    );
    await sleep(200);
    await cdp.captureScreenshot("08_vlsm_cheat_sheet_search_dark.png");
    console.log("PASS [15-16. Searchable CIDR Cheat Sheet & Presets]: Verified");

    // ─── CHECK 17-20: 30-Second Timed Arcade Flow & Single Timer Completion ───
    await cdp.evaluate(`
      (() => {
        window.scrollTo(0, 0);
        document.getElementById("btnSubnetTimed")?.click();
      })()
    `);
    await sleep(1250);
    const timedMid = await cdp.evaluate(`
      (() => {
        const hud = document.getElementById("subnetArcadeHud");
        const timerTxt = document.getElementById("subnetTimerDisplay")?.textContent || "";
        const seconds = Number((timerTxt.match(/(\\d+)s/) || [])[1] || 30);
        const ans = window.state.subnet.q?.answer;
        document.getElementById("subnetAnswer").value = ans;
        document.getElementById("subnetSubmit").click();
        return {
          hudVisible: Boolean(hud && !hud.hidden),
          hasSingleTimer: Boolean(window.state.subnet.timerRef),
          secondsTicked: seconds < 30,
          scoreAfterCorrect: window.state.subnet.score
        };
      })()
    `);
    assert(
      timedMid.hudVisible && timedMid.hasSingleTimer && timedMid.secondsTicked && timedMid.scoreAfterCorrect === 1,
      `Timed Arcade active check failed: ${JSON.stringify(timedMid)}`
    );
    await cdp.captureScreenshot("04_timed_arcade_hud_dark.png");

    // Verify timer expiration cleanly using real interval countdown (fast-forward timeLeft = 1 before tick)
    await cdp.evaluate(`window.state.subnet.timeLeft = 1;`);
    await sleep(1150);
    const timedDone = await cdp.evaluate(`
      (() => {
        const summary = document.getElementById("subnetTimedSummary");
        const lbText = document.getElementById("subnetLeaderboard")?.textContent || "";
        const retryBtn = document.getElementById("btnRetryTimed");
        return {
          timerStopped: window.state.subnet.timerRef === null,
          summaryVisible: Boolean(summary && !summary.hidden),
          finalText: document.getElementById("subnetTimedFinalScore")?.textContent || "",
          lbRecorded: lbText.includes("1 correct"),
          submitDisabled: document.getElementById("subnetSubmit")?.disabled,
          hasRetry: Boolean(retryBtn)
        };
      })()
    `);
    assert(
      timedDone.timerStopped && timedDone.summaryVisible && timedDone.lbRecorded && timedDone.submitDisabled && timedDone.hasRetry,
      `Timed completion check failed: ${JSON.stringify(timedDone)}`
    );
    await cdp.captureScreenshot("05_timed_arcade_summary_leaderboard.png");

    // Verify Retry Timed restarts cleanly & switch back to Easy cleanly stopping interval
    await cdp.evaluate(`
      (() => {
        document.getElementById("btnRetryTimed")?.click();
      })()
    `);
    await sleep(150);
    const retryOk = await cdp.evaluate(`
      (() => {
        const restarted = window.state.subnet.timeLeft === 30 && Boolean(window.state.subnet.timerRef) && document.getElementById("subnetTimedSummary").hidden;
        document.getElementById("btnSubnetEasy")?.click();
        return { restarted, cleanedTimer: window.state.subnet.timerRef === null };
      })()
    `);
    assert(retryOk.restarted && retryOk.cleanedTimer, `Timed Retry/Cleanup failed: ${JSON.stringify(retryOk)}`);
    console.log("PASS [17-20. Timed Arcade HUD, Single Timer, Expiry, Leaderboard & Retry]: Verified");

    // ─── CHECK 21-24: Integrated Rapid Recall Deck (#subnetRecallSection) + #home Flashcards ───
    const recallCheck = await cdp.evaluate(`
      (() => {
        const sec = document.getElementById("subnetRecallSection");
        sec?.scrollIntoView({ behavior: "instant", block: "start" });
        const initCount = document.getElementById("subnetFlashCount")?.textContent;
        document.querySelector('#subnetRecallFilters button[data-category="Routing & OSPF"]')?.click();
        const filteredCount = document.getElementById("subnetFlashCount")?.textContent;
        document.getElementById("btnSubnetFlipFlash")?.click();
        const flipped = document.getElementById("subnetFlashInner")?.classList.contains("flipped");
        document.getElementById("btnSubnetNextFlash")?.click();
        const nextCount = document.getElementById("subnetFlashCount")?.textContent;
        document.getElementById("btnSubnetShuffleFlash")?.click();
        const shuffleActive = document.getElementById("btnSubnetShuffleFlash")?.classList.contains("is-active");
        document.querySelector('#subnetRecallFilters button[data-category="All"]')?.click();
        return { initCount, filteredCount, flipped, nextCount, shuffleActive };
      })()
    `);
    assert(
      recallCheck.initCount === "Card 1 / 24" &&
      recallCheck.filteredCount === "Card 1 / 5" &&
      recallCheck.flipped &&
      recallCheck.nextCount === "Card 2 / 5" &&
      recallCheck.shuffleActive,
      `Rapid Recall integrated deck failed: ${JSON.stringify(recallCheck)}`
    );
    await sleep(200);
    await cdp.captureScreenshot("09_rapid_recall_subnet_dark.png");

    // Check #home FlashcardBox continuity & CLS
    await cdp.evaluate(`
      (() => {
        window.setPage("home");
        document.getElementById("flashcardBox")?.scrollIntoView({ behavior: "instant", block: "center" });
      })()
    `);
    await sleep(250);
    const homeFcCheck = await cdp.evaluate(`
      (() => {
        const c1 = document.getElementById("flashcardCount")?.textContent;
        document.getElementById("btnFlipFlashcard")?.click();
        const flipped = document.getElementById("flashcardInner")?.classList.contains("flipped");
        document.getElementById("btnNextFlashcard")?.click();
        const c2 = document.getElementById("flashcardCount")?.textContent;
        document.getElementById("btnPrevFlashcard")?.click();
        const cBack = document.getElementById("flashcardCount")?.textContent;
        return { c1, flipped, c2, cBack };
      })()
    `);
    assert(
      homeFcCheck.c1 === "Card 1 / 24" && homeFcCheck.flipped && homeFcCheck.c2 === "Card 2 / 24" && homeFcCheck.cBack === "Card 1 / 24",
      `Home FlashcardBox failed: ${JSON.stringify(homeFcCheck)}`
    );
    await cdp.captureScreenshot("10_home_flashcard_box_dark.png");
    console.log("PASS [21-24. Integrated #subnet Recall Deck + Home #flashcardBox Continuity]: Verified");

    // ─── CHECK 25: Offline Functionality Verification ───
    await cdp.send("Network.emulateNetworkConditions", {
      offline: true,
      latency: 0,
      downloadThroughput: 0,
      uploadThroughput: 0
    });
    const offlineOk = await cdp.evaluate(`
      (() => {
        window.setPage("subnet");
        document.getElementById("calcIp").value = "10.0.0.15";
        document.getElementById("calcCidr").value = "29";
        document.getElementById("calcCidr").dispatchEvent(new Event("input", { bubbles: true }));
        const net = document.getElementById("calcNetwork")?.textContent;
        const hosts = document.getElementById("calcHosts")?.textContent;
        const q = window.state.subnet.q;
        document.getElementById("subnetAnswer").value = q.answer;
        document.getElementById("subnetSubmit").click();
        const fbOk = (document.getElementById("subnetOut")?.textContent || "").includes("Correct!");
        document.getElementById("btnSubnetNextFlash")?.click();
        return { net, hosts, fbOk };
      })()
    `);
    assert(offlineOk.net === "10.0.0.8" && offlineOk.hosts === "6" && offlineOk.fbOk, `Offline mode test failed: ${JSON.stringify(offlineOk)}`);
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 0,
      downloadThroughput: -1,
      uploadThroughput: -1
    });
    console.log("PASS [25. Offline Client-Side Subnet Math, Trainer & Flashcards]: Verified");

    // ─── CHECK 26-28: Light Theme & High Contrast Screenshots & Verification ───
    await cdp.evaluate(`
      document.documentElement.setAttribute("data-theme", "light");
      window.setPage("subnet");
      window.scrollTo(0, 0);
    `);
    await sleep(300);
    const lightCheck = await cdp.evaluate(`
      (() => {
        const promptBg = getComputedStyle(document.getElementById("subnetPrompt")).backgroundColor;
        const binaryBg = getComputedStyle(document.querySelector(".vlsm-binary-panel")).backgroundColor;
        const heroBg = getComputedStyle(document.querySelector(".subnet-hero-card")).backgroundColor;
        return { promptBg, binaryBg, heroBg };
      })()
    `);
    assert(
      lightCheck.promptBg === "rgb(10, 16, 29)" && lightCheck.binaryBg === "rgb(9, 14, 26)" && lightCheck.heroBg === "rgb(255, 255, 255)",
      `Light mode surface polarity failed: ${JSON.stringify(lightCheck)}`
    );
    await cdp.captureScreenshot("11_subnet_light_theme_desktop.png");

    await cdp.evaluate(`document.getElementById("vlsmCalcCard")?.scrollIntoView({ behavior: "instant", block: "start" });`);
    await sleep(200);
    await cdp.captureScreenshot("12_vlsm_light_theme_desktop.png");

    // High Contrast capture
    await cdp.evaluate(`
      document.documentElement.setAttribute("data-theme", "dark");
      document.body.classList.add("high-contrast");
      document.getElementById("vlsmCalcCard")?.scrollIntoView({ behavior: "instant", block: "start" });
    `);
    await sleep(200);
    const hcBg = await cdp.evaluate(`getComputedStyle(document.body).backgroundColor`);
    assert(hcBg === "rgb(0, 0, 0)", `High contrast body bg expected black, got ${hcBg}`);
    await cdp.captureScreenshot("14_vlsm_high_contrast_1440.png");
    await cdp.evaluate(`document.body.classList.remove("high-contrast");`);
    console.log("PASS [26-28. Light Theme & High Contrast Audits]: Verified");

    // ─── CHECK 29-30: Cross-Platform Viewports (360, 390, 768, 982, 1024, 1440) + Touch Target Check ───
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
      await sleep(160);
      await cdp.evaluate(`window.setPage("subnet"); window.scrollTo(0, 0);`);
      await sleep(140);
      const vpCheck = await cdp.evaluate(`
        (() => {
          const overflow = document.documentElement.scrollWidth > window.innerWidth;
          const scrollW = document.documentElement.scrollWidth;
          const innerW = window.innerWidth;
          const badButtons = [];
          document.querySelectorAll("#subnet button").forEach(btn => {
            if (!btn.offsetParent) return;
            const r = btn.getBoundingClientRect();
            if (r.height > 0 && r.height < 43.5) {
              badButtons.push({ id: btn.id || btn.textContent.trim().slice(0, 20), h: r.height });
            }
          });
          return { overflow, scrollW, innerW, badButtons };
        })()
      `);
      assert(!vpCheck.overflow, `Horizontal overflow at ${vp.w}x${vp.h}: scrollW=${vpCheck.scrollW}, innerW=${vpCheck.innerW}`);
      if (vp.mob) {
        assert(vpCheck.badButtons.length === 0, `Sub-44px buttons on mobile ${vp.w}: ${JSON.stringify(vpCheck.badButtons)}`);
      }
      if (vp.w === 390) {
        await cdp.evaluate(`document.getElementById("vlsmCalcCard")?.scrollIntoView({ behavior: "instant", block: "start" });`);
        await sleep(150);
        await cdp.captureScreenshot("13_subnet_mobile_390_dark.png");
      }
    }

    assert(cdp.consoleErrors.length === 0, `Console errors observed: ${cdp.consoleErrors.join(" | ")}`);
    assert(cdp.pageExceptions.length === 0, `Page exceptions observed: ${cdp.pageExceptions.join(" | ")}`);
    console.log("ALL 30 PHASE 9 CHECKS PASSED WITH 0 CONSOLE ERRORS & 0 EXCEPTIONS!");
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
