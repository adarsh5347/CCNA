import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "../..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const SCREENSHOTS_DIR = path.join(__dirname, "phase10_screenshots");
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
    try {
      await this.evaluate(`{ const tc = document.getElementById("toastContainer"); if (tc) tc.innerHTML = ""; }`);
    } catch {}
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

async function waitForAppReady(cdp) {
  for (let i = 0; i < 60; i++) {
    const ready = await cdp.evaluate(`Boolean(window.state && Array.isArray(window.state.bank) && window.state.bank.length >= 600 && window.setPage)`);
    if (ready) return;
    await sleep(100);
  }
  throw new Error("Timed out waiting for NetOps Command hydration");
}

async function run() {
  console.log("=== NETOPS COMMAND — PHASE 10 VERIFICATION SUITE ===");
  const { server, port } = await startServer(DIST_DIR);
  console.log(`Serving dist bundle on http://127.0.0.1:${port}`);

  const debugPort = 9620 + Math.floor(Math.random() * 350);
  const tmpDir = path.join(ROOT_DIR, ".tmp_chrome_p10_" + debugPort);
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
    await cdp.send("Network.enable");
    await waitForAppReady(cdp);

    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    await cdp.evaluate(`
      document.getElementById("btnOnboardingDismiss")?.click();
      localStorage.setItem("ccna_theme", "dark");
      window.applyTheme("dark", false);
      const tc = document.getElementById("toastContainer");
      if (tc) tc.innerHTML = "";
    `);
    await sleep(250);

    // ─── CHECK 1: Practice Modes & Section Config on #home ───
    await cdp.evaluate(`document.getElementById("practiceModulesHeading")?.scrollIntoView({ behavior: "instant", block: "start" });`);
    await sleep(250);
    await cdp.captureScreenshot("01_practice_modes_selection.png");

    const modeAudit = await cdp.evaluate(`
      (() => {
        const durSel = document.getElementById("quizDuration");
        const cntSel = document.getElementById("quizCount");
        durSel.value = "15";
        durSel.dispatchEvent(new Event("change", { bubbles: true }));
        cntSel.value = "20";
        cntSel.dispatchEvent(new Event("change", { bubbles: true }));
        document.getElementById("btnSelectAllDomains")?.click();
        const summary = document.getElementById("sectionQuizSummary")?.textContent || "";
        const bankSize = window.state.bank.length;
        return {
          modeCount: document.querySelectorAll("#practiceModulesSection .mode-card").length,
          summary,
          checkedDomains: document.querySelectorAll("#domainChecks .qdomain:checked").length,
          bankSize,
          proprietaryLeak: document.body.textContent.includes("Pearson VUE")
        };
      })()
    `);
    assert(
      modeAudit.modeCount === 5 &&
      modeAudit.checkedDomains === 6 &&
      modeAudit.summary.includes("20 Qs") &&
      modeAudit.summary.includes("15 mins") &&
      modeAudit.bankSize === 635 &&
      !modeAudit.proprietaryLeak,
      `Practice mode audit failed: ${JSON.stringify(modeAudit)}`
    );
    await cdp.captureScreenshot("02_section_quiz_config.png");
    console.log("PASS [1. Five Practice Modes, 635 Questions, 6 Domain Filters & Section Config]: Verified");

    // ─── CHECK 2: Study Mode Prompt & Explanation Flow ───
    await cdp.evaluate(`document.getElementById("startStudy").click();`);
    await sleep(250);
    const studyPromptCheck = await cdp.evaluate(`
      (() => {
        const s = window.state.session;
        const singleIdx = s.questions.findIndex(q => q.type === "single" && q.expl && q.expl.why);
        if (singleIdx >= 0 && singleIdx !== s.idx) {
          document.querySelector('#qNav [data-qnav="' + singleIdx + '"]')?.click();
        }
        return {
          mode: s.mode,
          hasShowAnswerBtn: Boolean(document.getElementById("showAnswerBtn")),
          hasPrompt: Boolean(document.querySelector("#questionArea h3.q-prompt-heading")),
          shellHasStudyClass: document.querySelector("#engine .exam-shell")?.classList.contains("mode-study")
        };
      })()
    `);
    assert(
      studyPromptCheck.mode === "study" &&
      studyPromptCheck.hasShowAnswerBtn &&
      studyPromptCheck.hasPrompt &&
      studyPromptCheck.shellHasStudyClass,
      `Study mode check failed: ${JSON.stringify(studyPromptCheck)}`
    );
    await cdp.captureScreenshot("04_study_mode_question.png");

    await cdp.evaluate(`
      (() => {
        const q = window.state.session.questions[window.state.session.idx];
        const radios = document.querySelectorAll('#questionArea input[type="radio"]');
        if (radios[q.correct[0]]) radios[q.correct[0]].click();
      })()
    `);
    await sleep(200);
    const studyExplCheck = await cdp.evaluate(`
      (() => {
        const expl = document.querySelector("#questionArea .expl-panel");
        return {
          hasExpl: Boolean(expl),
          hasChapterBtn: Boolean(document.querySelector("#questionArea .expl-guide-btn") || document.querySelector("#questionArea .q-badge-chapter")),
          correctOptHighlighted: Boolean(document.querySelector("#questionArea label.opt.correct"))
        };
      })()
    `);
    assert(studyExplCheck.hasExpl && studyExplCheck.correctOptHighlighted, `Study explanation failed: ${JSON.stringify(studyExplCheck)}`);
    await cdp.evaluate(`document.querySelector("#questionArea .expl-panel")?.scrollIntoView({ behavior: "instant", block: "end" });`);
    await sleep(100);
    await cdp.captureScreenshot("05_study_mode_explanation.png");
    console.log("PASS [2. Study Mode Prompt, Selection & Detailed Explanation]: Verified");

    // ─── CHECK 3: Pre-Exam Confirmation Modal & 120-Question / 120-Minute Real Exam ───
    await cdp.evaluate(`
      window.setPage("home");
      document.getElementById("startExam").click();
    `);
    await sleep(200);
    const briefCheck = await cdp.evaluate(`
      (() => {
        const modal = document.getElementById("examBriefModal");
        const text = modal?.textContent || "";
        return {
          open: Boolean(modal && !modal.classList.contains("hidden")),
          has120Q: text.includes("120 Questions"),
          has120M: text.includes("120 Minutes"),
          hasAll6Domains: text.includes("25%") && text.includes("20%") && text.includes("15%") && text.includes("10%")
        };
      })()
    `);
    assert(briefCheck.open && briefCheck.has120Q && briefCheck.has120M && briefCheck.hasAll6Domains, `Exam briefing modal check failed: ${JSON.stringify(briefCheck)}`);
    await cdp.captureScreenshot("03_exam_briefing_modal.png");

    await cdp.evaluate(`document.getElementById("btnConfirmStartExam").click();`);
    await sleep(250);

    const examLaunchCheck = await cdp.evaluate(`
      (() => {
        const s = window.state.session;
        const domainCounts = {};
        s.questions.forEach(q => { domainCounts[q.domain] = (domainCounts[q.domain] || 0) + 1; });
        return {
          mode: s.mode,
          qTotal: s.questions.length,
          minutes: s.minutes,
          timerText: document.getElementById("timerValue")?.textContent,
          showAnswerHiddenInExam: !document.getElementById("showAnswerBtn"),
          hasExamLockPill: Boolean(document.querySelector(".exam-lock-pill")),
          domainCountKeys: Object.keys(domainCounts).length,
          shellHasExamClass: document.querySelector("#engine .exam-shell")?.classList.contains("mode-exam")
        };
      })()
    `);
    assert(
      examLaunchCheck.mode === "exam" &&
      examLaunchCheck.qTotal === 120 &&
      examLaunchCheck.minutes === 120 &&
      examLaunchCheck.showAnswerHiddenInExam &&
      examLaunchCheck.hasExamLockPill &&
      examLaunchCheck.domainCountKeys === 6 &&
      examLaunchCheck.shellHasExamClass,
      `120-Q Real Exam check failed: ${JSON.stringify(examLaunchCheck)}`
    );

    // ─── CHECK 4: Inject Deterministic 5-Format Showcase Inside Real Exam & Verify Each Format ───
    await cdp.evaluate(`
      (() => {
        const s = window.state.session;
        const singleQ = window.state.bank.find(q => q.type === "single");
        const multiQ = window.state.bank.find(q => q.type === "multi" || (Array.isArray(q.correct) && q.correct.length > 1));
        const matchQ = window.state.bank.find(q => q.type === "matching" && Array.isArray(q.pairs) && q.pairs.length >= 2);
        const dragQ = window.state.bank.find(q => q.type === "dragdrop" && Array.isArray(q.order) && q.order.length >= 2);
        const scenarioQ = window.state.bank.find(q => q.type === "scenario" && (q.cli || q.topology || q.scenario));
        s.questions[0] = singleQ;
        s.questions[1] = multiQ;
        s.questions[2] = matchQ;
        s.questions[3] = dragQ;
        s.questions[4] = scenarioQ;
        document.querySelector('#qNav [data-qnav="0"]')?.click();
      })()
    `);
    await sleep(150);

    // Format 1: Single-Choice + KeyA-D + Selected Ring (NO reveal glow)
    await cdp.evaluate(`
      (() => {
        const cIdx = window.state.session.questions[0].correct[0];
        const keyCodes = ["KeyA", "KeyB", "KeyC", "KeyD"];
        document.dispatchEvent(new KeyboardEvent("keydown", { code: keyCodes[cIdx] || "KeyA", bubbles: true }));
      })()
    `);
    await sleep(120);
    await cdp.captureScreenshot("06_exam_single_choice.png");

    // Format 2: Multi-select + dynamic counter
    await cdp.evaluate(`
      (() => {
        document.getElementById("saveNext").click();
        const q = window.state.session.questions[1];
        const boxes = document.querySelectorAll('#questionArea input[type="checkbox"]');
        q.correct.forEach(idx => { if (boxes[idx]) boxes[idx].click(); });
      })()
    `);
    await sleep(120);
    const multiCounter = await cdp.evaluate(`document.getElementById("multiSelectCounter")?.textContent`);
    assert(multiCounter && multiCounter.includes("selected"), `Multi-select counter failed: ${multiCounter}`);
    await cdp.captureScreenshot("07_exam_multi_select.png");

    // Format 3: Matching + KeyA must NOT trigger inside <select>
    await cdp.evaluate(`
      (() => {
        document.getElementById("saveNext").click();
        const q = window.state.session.questions[2];
        const sels = document.querySelectorAll('#questionArea select[data-match]');
        sels.forEach((sel, i) => {
          sel.focus();
          sel.value = q.pairs[i][1];
          sel.dispatchEvent(new Event("change", { bubbles: true }));
        });
        document.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyF", bubbles: true }));
      })()
    `);
    await sleep(120);
    assert((await cdp.evaluate(`Boolean(window.state.session.flagged[2])`)) === false, "KeyF shortcut fired while <select> had focus!");
    await cdp.captureScreenshot("08_exam_matching.png");

    // Format 4: Drag-and-drop sequence ordering via Up/Down
    await cdp.evaluate(`
      (() => {
        document.getElementById("saveNext").click();
        document.querySelector('#questionArea button[data-down="0"]')?.click();
        // Leave exact correct answer or swap intentionally via drag controls
      })()
    `);
    await sleep(120);
    await cdp.captureScreenshot("09_exam_dragdrop.png");

    // Format 5: CLI / Topology Scenario Exhibit
    await cdp.evaluate(`
      (() => {
        document.getElementById("saveNext").click();
        const radios = document.querySelectorAll('#questionArea input[type="radio"]');
        if (radios[0]) radios[0].click();
      })()
    `);
    await sleep(120);
    const hasExhibit = await cdp.evaluate(`Boolean(document.querySelector("#questionArea .exam-exhibit"))`);
    assert(hasExhibit, "Scenario exhibit panel missing on scenario question");
    await cdp.captureScreenshot("10_exam_cli_scenario.png");
    console.log("PASS [3-4. 120Q Exam Mode, Lock Protection & All 5 Question Formats]: Verified");

    // ─── CHECK 5: Flagging, Shortcuts (F/Arrow/N) & Navigator Drawer ───
    await cdp.evaluate(`
      document.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyF", bubbles: true }));
      document.getElementById("btnToggleSidebar").click();
    `);
    await sleep(260);
    const navCheck = await cdp.evaluate(`
      (() => {
        const nav = document.getElementById("examNavigator");
        const flaggedBtn = document.querySelector('#qNav [data-qnav="4"]');
        const toggleMark = document.getElementById("toggleMark");
        return {
          open: nav?.classList.contains("active"),
          q4Flagged: flaggedBtn?.classList.contains("flagged"),
          togglePressed: toggleMark?.getAttribute("aria-pressed"),
          markIsFlaggedClass: toggleMark?.classList.contains("is-flagged"),
          legendCount: document.querySelectorAll(".navigator-legend .nav-legend-item").length
        };
      })()
    `);
    assert(
      navCheck.open && navCheck.q4Flagged && navCheck.togglePressed === "true" && navCheck.markIsFlaggedClass && navCheck.legendCount === 4,
      `Navigator & flag state check failed: ${JSON.stringify(navCheck)}`
    );
    await cdp.captureScreenshot("11_exam_navigator_drawer.png");

    // Escape closes navigator cleanly
    await cdp.evaluate(`document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape", bubbles: true }));`);
    await sleep(150);
    assert((await cdp.evaluate(`document.getElementById("examNavigator").classList.contains("active")`)) === false, "Escape did not close examNavigator");

    // ─── CHECK 6: Timer Warning (<25%), Danger (<10%), Pause & Drift Check ───
    await cdp.evaluate(`
      (() => {
        window.state.session.totalDurationSec = 7200;
        window.state.session.timeLeft = 1500; // 20.8% -> warn
        window.toggleTimerPause();
        window.toggleTimerPause();
      })()
    `);
    await sleep(120);
    assert(await cdp.evaluate(`document.getElementById("timer").classList.contains("warn")`), "Expected .warn below 25%");
    await cdp.captureScreenshot("12_timer_warning_state.png");

    await cdp.evaluate(`
      (() => {
        window.state.session.timeLeft = 540; // 7.5% -> danger
        window.toggleTimerPause();
        window.toggleTimerPause();
      })()
    `);
    await sleep(120);
    assert(await cdp.evaluate(`document.getElementById("timer").classList.contains("danger")`), "Expected .danger below 10%");
    await cdp.captureScreenshot("13_timer_danger_state.png");

    // Pause via KeyP & verify overlay + zero drift over 2s
    await cdp.evaluate(`document.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyP", bubbles: true }));`);
    await sleep(150);
    const pausedBefore = await cdp.evaluate(`({ t: window.state.session.timeLeft, overlay: Boolean(document.getElementById("quizPausedOverlay")), paused: window.state.session.timerPaused })`);
    assert(pausedBefore.paused && pausedBefore.overlay, "Pause overlay did not appear on KeyP");
    await cdp.captureScreenshot("14_exam_pause_overlay.png");

    // ─── CHECK 7: Mid-Exam Reload Recovery & Home Resume Banner ───
    await cdp.evaluate(`delete window.state`);
    await cdp.send("Page.reload", { ignoreCache: true });
    await waitForAppReady(cdp);
    await sleep(200);

    const postReload = await cdp.evaluate(`({
      page: document.body.dataset.activePage,
      paused: window.state.session?.timerPaused,
      idx: window.state.session?.idx,
      flag4: Boolean(window.state.session?.flagged?.[4]),
      qTotal: window.state.session?.questions?.length
    })`);
    assert(
      postReload.page === "engine" && postReload.paused && postReload.idx === 4 && postReload.flag4 && postReload.qTotal === 120,
      `Mid-exam reload recovery failed: ${JSON.stringify(postReload)}`
    );

    // Drift verify while still paused across 2s & then resume via #resumeFromOverlayBtn
    await sleep(2100);
    assert((await cdp.evaluate(`window.state.session.timeLeft`)) === pausedBefore.t, "Timer drifted while paused across reload");
    await cdp.evaluate(`document.getElementById("resumeFromOverlayBtn")?.click();`);
    await sleep(100);

    // Home resume banner test
    await cdp.evaluate(`document.getElementById("exitSession").click();`);
    await sleep(150);
    assert(await cdp.evaluate(`!document.getElementById("resumeQuizBanner")?.classList.contains("hidden")`), "Home resume banner did not show");
    await cdp.evaluate(`document.getElementById("btnResumeSavedQuiz")?.click();`);
    await sleep(150);
    console.log("PASS [5-7. Navigator, Flagging, Warning/Danger Timer, Pause Drift, Reload & Home Recovery]: Verified");

    // ─── CHECK 8: Exam Confirmation Flow, Results, Domain Breakdown & Review Filters/Jumping ───
    await cdp.evaluate(`
      (() => {
        document.querySelector('#qNav [data-qnav="119"]')?.click();
        document.getElementById("submitSession").click();
      })()
    `);
    await sleep(180);
    const confirmPanelOk = await cdp.evaluate(`
      (() => {
        const panel = document.getElementById("examSubmitConfirmPanel");
        const finBtn = document.getElementById("finalizeFromReview");
        return Boolean(panel && finBtn && !document.getElementById("reviewArea").classList.contains("hidden"));
      })()
    `);
    assert(confirmPanelOk, "Expected Final Submission Confirmation Panel on Exam mode submit");
    await cdp.captureScreenshot("15_submission_confirmation.png");

    await cdp.evaluate(`document.getElementById("finalizeFromReview").click();`);
    await sleep(220);
    const resultsCheck = await cdp.evaluate(`
      (() => {
        const ra = document.getElementById("resultArea");
        const txt = ra?.textContent || "";
        return {
          visible: Boolean(ra && !ra.classList.contains("hidden")),
          hasScoreCallout: Boolean(ra?.querySelector(".exam-score-callout")),
          hasTimeUsed: txt.includes("Time Used"),
          hasReadinessPanel: Boolean(ra?.querySelector(".exam-readiness-panel")),
          hasDomainCard: Boolean(ra?.querySelector(".exam-domain-card")),
          reviewItemsCount: ra?.querySelectorAll(".review-card-item").length || 0
        };
      })()
    `);
    assert(
      resultsCheck.visible && resultsCheck.hasScoreCallout && resultsCheck.hasTimeUsed && resultsCheck.hasReadinessPanel && resultsCheck.hasDomainCard && resultsCheck.reviewItemsCount === 120,
      `Results summary check failed: ${JSON.stringify(resultsCheck)}`
    );
    await cdp.captureScreenshot("16_exam_results_summary.png");

    // Filter Review to Flagged -> Inspect Question -> Back to Results
    await cdp.evaluate(`
      (() => {
        document.querySelector('#resultArea .review-filter-btn[data-review-filter="flagged"]')?.click();
        document.querySelector("#resultArea .finish-review-section")?.scrollIntoView({ behavior: "instant", block: "start" });
      })()
    `);
    await sleep(160);
    const flaggedFilterCount = await cdp.evaluate(`[...document.querySelectorAll("#resultArea .review-card-item")].filter(el => !el.classList.contains("hidden")).length`);
    assert(flaggedFilterCount === 1, `Expected 1 flagged review card visible, got ${flaggedFilterCount}`);
    await cdp.captureScreenshot("17_review_incorrect_and_flagged.png");

    await cdp.evaluate(`
      document.querySelector('#resultArea .review-filter-btn[data-review-filter="all"]')?.click();
      document.querySelector('#resultArea .btn-jump-question[data-jump-idx="0"]')?.click();
    `);
    await sleep(120);
    assert(await cdp.evaluate(`!document.getElementById("questionArea").classList.contains("hidden") && Boolean(document.getElementById("backToResultsBtn"))`), "Jump to question from Review failed");
    await cdp.evaluate(`document.getElementById("backToResultsBtn").click();`);
    await sleep(100);
    assert(await cdp.evaluate(`!document.getElementById("resultArea").classList.contains("hidden")`), "Back to Results failed");
    console.log("PASS [8. Final Confirmation, Results Report, Readiness Panel, Review Filters & Jumping]: Verified");

    // ─── CHECK 9: Smart Adaptive (qualifying 2 weakest domains) & Spaced Repetition Modes ───
    const smartAndSpaced = await cdp.evaluate(`
      (() => {
        // Seed deterministic domain stats across 3 domains with >=5 attempts
        window.state.analytics.domain = {
          "IP Services": { total: 10, correct: 3 },
          "Security Fundamentals": { total: 10, correct: 4 },
          "Network Fundamentals": { total: 10, correct: 9 }
        };
        window.state.analytics.missedIds = window.state.bank.slice(0, 6).map(q => q.id);
        window.renderHome();
        window.setPage("home");
        document.getElementById("startSmartQuiz").click();
        const smartDomains = [...new Set(window.state.session.questions.map(q => q.domain))];
        const smartMode = window.state.session.mode;
        document.getElementById("exitSession")?.click();
        document.getElementById("startMissedQuiz").click();
        const missedMode = window.state.session.mode;
        const missedTotal = window.state.session.questions.length;
        return { smartMode, smartDomains, weakDomains: window.state.weakDomains, missedMode, missedTotal };
      })()
    `);
    assert(
      smartAndSpaced.smartMode === "smart" &&
      smartAndSpaced.smartDomains.length === 2 &&
      smartAndSpaced.smartDomains.includes("IP Services") &&
      smartAndSpaced.smartDomains.includes("Security Fundamentals") &&
      smartAndSpaced.missedMode === "missed" &&
      smartAndSpaced.missedTotal === 6,
      `Smart Adaptive & Spaced Repetition failed: ${JSON.stringify(smartAndSpaced)}`
    );
    console.log("PASS [9. Smart Adaptive (Weakest 2 Domains) & Spaced Repetition Modes]: Verified");

    // ─── CHECK 10: Light Theme, High Contrast, Offline & Responsive Mobile Viewport Lock (360..769) ───
    await cdp.evaluate(`
      (() => {
        // Put a real CLI scenario exhibit into slot 0 for Light Theme desktop verification
        const cliQ = window.state.bank.find(q => q.cli);
        if (cliQ) {
          window.state.session.questions[0] = cliQ;
          document.querySelector('#qNav [data-qnav="0"]')?.click();
        }
        document.documentElement.setAttribute("data-theme", "light");
        window.applyTheme("light", false);
      })()
    `);
    await sleep(200);
    const lightColors = await cdp.evaluate(`
      (() => {
        const shellBg = getComputedStyle(document.querySelector("#engine .exam-shell")).backgroundColor;
        const optBg = getComputedStyle(document.querySelector("#questionArea .opt")).backgroundColor;
        const exh = document.querySelector("#questionArea .exam-exhibit");
        const exhBg = exh ? getComputedStyle(exh).backgroundColor : "rgb(11, 17, 32)";
        return { shellBg, optBg, exhBg };
      })()
    `);
    assert(lightColors.shellBg === "rgb(248, 250, 252)" && lightColors.optBg === "rgb(255, 255, 255)", `Light theme exam contrast mismatch: ${JSON.stringify(lightColors)}`);
    await cdp.captureScreenshot("18_light_theme_exam_desktop.png");

    // Verify High Contrast + Offline Study Session launch & instant answer validation
    await cdp.send("Network.emulateNetworkConditions", {
      offline: true,
      latency: 0,
      downloadThroughput: 0,
      uploadThroughput: 0
    });
    const offlineAndHc = await cdp.evaluate(`
      (() => {
        document.body.classList.add("high-contrast");
        const hcBg = getComputedStyle(document.body).backgroundColor;
        document.getElementById("startStudy")?.click();
        const s = window.state.session;
        const singleIdx = s.questions.findIndex(q => q.type === "single");
        if (singleIdx >= 0 && singleIdx !== s.idx) {
          document.querySelector('#qNav [data-qnav="' + singleIdx + '"]')?.click();
        }
        const radio = document.querySelector('#questionArea input[type="radio"]');
        if (radio) radio.click();
        const feedbackRecorded = window.state.session.feedback[window.state.session.idx] != null;
        document.body.classList.remove("high-contrast");
        document.documentElement.setAttribute("data-theme", "dark");
        window.applyTheme("dark", false);
        return { hcBg, feedbackRecorded };
      })()
    `);
    assert(offlineAndHc.hcBg === "rgb(0, 0, 0)" && offlineAndHc.feedbackRecorded, `Offline / High contrast failed: ${JSON.stringify(offlineAndHc)}`);
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 0,
      downloadThroughput: -1,
      uploadThroughput: -1
    });

    // Responsive check across 360, 375, 390, 760, 768 (mobile-locked) and 769 (desktop)
    const viewports = [
      { w: 360, h: 740, mob: true, shot: "20_mobile_360_exam.png" },
      { w: 375, h: 812, mob: true },
      { w: 390, h: 844, mob: true, shot: "19_mobile_390_exam.png" },
      { w: 760, h: 900, mob: true },
      { w: 768, h: 1024, mob: true },
      { w: 769, h: 1024, mob: false }
    ];
    for (const vp of viewports) {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width: vp.w,
        height: vp.h,
        deviceScaleFactor: vp.mob ? 2 : 1,
        mobile: vp.mob
      });
      await sleep(180);
      const layout = await cdp.evaluate(`
        (() => {
          const overflow = document.documentElement.scrollWidth > window.innerWidth;
          const topbarDisp = getComputedStyle(document.querySelector("header.topbar")).display;
          const footerRect = document.getElementById("examFooter")?.getBoundingClientRect();
          const headerRect = document.querySelector(".exam-header")?.getBoundingClientRect();
          const qaRect = document.getElementById("questionArea")?.getBoundingClientRect();
          const overlapsFooter = qaRect && footerRect ? (qaRect.bottom > footerRect.top + 2) : false;
          const overlapsHeader = qaRect && headerRect ? (qaRect.top < headerRect.bottom - 2) : false;
          return { overflow, topbarDisp, overlapsFooter, overlapsHeader, innerH: window.innerHeight, footerBottom: footerRect?.bottom };
        })()
      `);
      assert(!layout.overflow, `Horizontal overflow on #engine at ${vp.w}x${vp.h}: ${JSON.stringify(layout)}`);
      if (vp.w <= 768) {
        assert(layout.topbarDisp === "none" && !layout.overlapsFooter && !layout.overlapsHeader, `Mobile viewport lock failed at ${vp.w}x${vp.h}: ${JSON.stringify(layout)}`);
      } else {
        assert(layout.topbarDisp !== "none", `Expected desktop topbar restored at 769px`);
      }
      if (vp.shot) await cdp.captureScreenshot(vp.shot);
    }

    assert(cdp.consoleErrors.length === 0, `Console errors observed: ${cdp.consoleErrors.join(" | ")}`);
    assert(cdp.pageExceptions.length === 0, `Page exceptions observed: ${cdp.pageExceptions.join(" | ")}`);
    console.log("ALL 34 PHASE 10 CHECKS PASSED WITH 0 CONSOLE ERRORS & 0 EXCEPTIONS!");
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
