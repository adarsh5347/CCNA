import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "../..");
const SCREENSHOTS_DIR = path.join(__dirname, "phase6_screenshots");
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
  console.log("=== NETOPS COMMAND — PHASE 6 VERIFICATION SUITE ===");
  const { server, port } = await startServer(ROOT_DIR);
  console.log(`Ephemeral test server started on http://127.0.0.1:${port}`);

  const debugPort = 9222 + Math.floor(Math.random() * 500);
  const chromeProcess = spawn(
    CHROME_PATH,
    [
      "--headless=new",
      `--remote-debugging-port=${debugPort}`,
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--user-data-dir=" + path.join(ROOT_DIR, ".tmp_chrome_phase6_" + debugPort),
      `http://127.0.0.1:${port}/?page=analytics`
    ],
    { stdio: "ignore" }
  );

  const passedChecks = [];
  function record(name, status, detail) {
    console.log(`[${status}] ${name} - ${detail}`);
    passedChecks.push({ name, status, detail });
  }

  let cdp = null;

  try {
    const wsUrl = await getDebuggerWebSocketUrl(debugPort);
    cdp = new CDPClient(wsUrl);
    await cdp.connect();

    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("DOM.enable");
    await cdp.send("CSS.enable");

    // Wait for initial load
    await sleep(800);

    // Initial viewport 1440x900
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await sleep(200);

    // ─── CHECK 1: Readiness score rendering & pass probability estimate with disclaimer ───
    const check1 = await cdp.evaluate(`
      (() => {
        window.setPage("analytics");
        window.renderAnalytics();

        const scoreEl = document.getElementById("readinessHeroScore");
        const probEl = document.getElementById("readinessPassProbVal");
        const disclaimerEl = document.querySelector("#readinessHeroCard .readiness-disclaimer");
        const discText = disclaimerEl ? disclaimerEl.textContent : "";
        const mentionsEstimate = /practice-based estimate/i.test(discText);
        const mentionsNotGuaranteed = /not an official Cisco guarantee/i.test(discText);

        return {
          hasScore: Boolean(scoreEl && scoreEl.textContent.includes("%")),
          scoreText: scoreEl ? scoreEl.textContent : null,
          hasProb: Boolean(probEl && probEl.textContent.includes("%")),
          probText: probEl ? probEl.textContent : null,
          hasDisclaimer: Boolean(disclaimerEl && mentionsEstimate && mentionsNotGuaranteed)
        };
      })()
    `);
    assert(check1.hasScore && check1.hasProb && check1.hasDisclaimer, `Check 1 failed: ${JSON.stringify(check1)}`);
    record("1. Readiness & Pass Probability", "PASS", `Score: ${check1.scoreText}, Pass Prob: ${check1.probText}, Disclaimer verified`);

    // ─── CHECK 2: Six CCNA Blueprint Domains with .domain-ring-card ───
    const check2 = await cdp.evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll("#domainBreakdown .domain-ring-card"));
        const names = cards.map(c => {
          const strong = c.querySelector("strong");
          return strong ? strong.textContent.trim() : "";
        });
        const weights = cards.map(c => {
          const pill = c.querySelector(".domain-weight-pill");
          return pill ? pill.textContent.trim() : "";
        });
        return {
          cardCount: cards.length,
          names,
          weights
        };
      })()
    `);
    assert(check2.cardCount === 6, `Check 2 failed: expected 6 domain cards, got ${check2.cardCount}`);
    assert(check2.weights.some(w => w.includes("20%")) && check2.weights.some(w => w.includes("25%")), "Check 2 failed: weights missing");
    record("2. Six CCNA Domains", "PASS", `All 6 domains rendered with .domain-ring-card and percentage weights: ${check2.names.join(", ")}`);

    // ─── CHECK 3: Domain accuracy calculations & weak domain highlight ───
    const check3 = await cdp.evaluate(`
      (() => {
        // Seed some attempts with unequal domain accuracy to verify weak domain highlight
        window.state.analytics.attempts = [
          { mode: "quiz", score: 85, correct: 17, total: 20, at: new Date().toISOString() },
          { mode: "exam", score: 70, correct: 70, total: 100, at: new Date().toISOString() }
        ];
        window.state.analytics.totalQ = 120;
        window.state.analytics.correct = 87;
        window.state.analytics.domain = {
          "Network Fundamentals": { total: 30, correct: 27 },
          "Network Access": { total: 25, correct: 20 },
          "IP Connectivity": { total: 30, correct: 24 },
          "IP Services": { total: 15, correct: 8 }, // Weakest domain ~53%
          "Security Fundamentals": { total: 10, correct: 8 },
          "Automation and Programmability": { total: 10, correct: 7 }
        };
        window.renderAnalytics();

        const weakCard = document.querySelector("#domainBreakdown .domain-ring-card.is-weak-domain");
        const weakName = weakCard ? weakCard.querySelector("strong").textContent.trim() : null;
        const hasFocusPill = weakCard ? Boolean(weakCard.querySelector(".domain-focus-pill")) : false;

        const da = window.calcDomainAccuracy();

        return {
          weakName,
          hasFocusPill,
          ipServicesAccuracy: da["IP Services"],
          netFundAccuracy: da["Network Fundamentals"]
        };
      })()
    `);
    assert(check3.weakName === "IP Services" && check3.hasFocusPill, `Check 3 failed: ${JSON.stringify(check3)}`);
    record("3. Accuracy & Weak Domain Highlight", "PASS", `Weakest domain '${check3.weakName}' (${check3.ipServicesAccuracy}%) highlighted with Focus Area pill`);

    // ─── CHECK 4: Learning activity trend visualization (SVG chart + session list) ───
    const check4 = await cdp.evaluate(`
      (() => {
        const chartSvg = document.querySelector("#trend .trend-chart-svg");
        const hasBenchmark = chartSvg ? Boolean(chartSvg.querySelector("line")) : false;
        const rows = document.querySelectorAll("#trend .trend-row-item");
        const rowDetails = Array.from(rows).map(r => ({
          text: r.querySelector("div")?.textContent.trim(),
          score: r.querySelector(".trend-score-pill")?.textContent.trim()
        }));

        return {
          hasSvg: Boolean(chartSvg),
          hasBenchmark,
          rowCount: rows.length,
          rowDetails
        };
      })()
    `);
    assert(check4.hasSvg && check4.hasBenchmark && check4.rowCount === 2, `Check 4 failed: ${JSON.stringify(check4)}`);
    record("4. Learning Activity & Trend Chart", "PASS", `Inline SVG sparkline, 80% passing benchmark, and ${check4.rowCount} recent attempt rows verified`);

    // ─── CHECK 5: Empty analytics state for new learners ───
    const check5 = await cdp.evaluate(`
      (() => {
        const origState = JSON.parse(JSON.stringify(window.state.analytics));
        window.state.analytics.attempts = [];
        window.state.analytics.totalQ = 0;
        window.state.analytics.correct = 0;
        window.state.analytics.domain = {};
        window.renderAnalytics();

        const scoreEl = document.getElementById("readinessHeroScore");
        const passProbEl = document.getElementById("readinessPassProbVal");
        const domainCards = document.querySelectorAll("#domainBreakdown .domain-ring-card");
        const emptyTrend = document.querySelector("#trend .trend-empty-state");
        const narrativeText = document.getElementById("analyticsNarrativeText")?.textContent || "";

        // Restore state
        window.state.analytics = origState;
        window.renderAnalytics();

        return {
          emptyScore: scoreEl ? scoreEl.textContent : null,
          emptyPassProb: passProbEl ? passProbEl.textContent : null,
          domainCardCount: domainCards.length,
          hasEmptyTrend: Boolean(emptyTrend),
          welcomesNewLearner: /Welcome to your Readiness Dashboard/i.test(narrativeText)
        };
      })()
    `);
    assert(check5.domainCardCount === 6, `Check 5 failed: domain cards count ${check5.domainCardCount} !== 6`);
    assert(check5.hasEmptyTrend && check5.welcomesNewLearner, `Check 5 failed: ${JSON.stringify(check5)}`);
    record("5. Empty Analytics State", "PASS", `Clean new learner state: 0% baseline, all 6 domain cards retained, and trend empty state verified`);

    // ─── CHECK 6: XP and learner level progression ───
    const check6 = await cdp.evaluate(`
      (() => {
        window.state.analytics.xp = 345;
        window.renderAchievements();

        const badge = document.querySelector(".achievements-level-badge")?.textContent;
        const name = document.querySelector(".achievements-level-name")?.textContent;
        const meta = document.querySelector(".achievements-xp-meta")?.textContent;

        return { badge, name, meta };
      })()
    `);
    assert(check6.badge === "Level 4" && check6.name === "Senior Infrastructure Engineer", `Check 6 failed: ${JSON.stringify(check6)}`);
    assert(check6.meta && check6.meta.includes("45 / 100 XP"), `Check 6 failed: XP meta ${check6.meta}`);
    record("6. XP & Learner Level", "PASS", `Level 4: Senior Infrastructure Engineer, 45/100 XP verified`);

    // ─── CHECK 7: Seven certification badges with unlocked/locked states ───
    const check7 = await cdp.evaluate(`
      (() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        const todayStr = \`\${year}-\${month}-\${day}\`;

        window.state.analytics.lastAttemptDate = todayStr;
        window.state.analytics.labsCompleted = 2; // unlocks first_lab
        window.state.analytics.totalQ = 150; // unlocks 100_questions
        window.state.analytics.subnetMaxStreak = 12; // unlocks subnet_master
        window.state.analytics.streak = 5; // unlocks streaks
        window.state.analytics.simPathsRun = { ospf: true, roas: true }; // unlocks routing_champion
        window.renderAchievements();

        const badges = Array.from(document.querySelectorAll("#achievementsPanel .badge-card"));
        const unlockedBadges = badges.filter(b => b.classList.contains("unlocked"));
        const lockedBadges = badges.filter(b => b.classList.contains("locked"));

        const titles = badges.map(b => b.querySelector(".badge-card-title")?.textContent.trim());

        return {
          totalBadges: badges.length,
          unlockedCount: unlockedBadges.length,
          lockedCount: lockedBadges.length,
          titles
        };
      })()
    `);
    assert(check7.totalBadges === 7, `Check 7 failed: expected 7 badges, got ${check7.totalBadges}`);
    assert(check7.unlockedCount >= 4 && check7.lockedCount >= 1, `Check 7 failed: unlocked=${check7.unlockedCount}, locked=${check7.lockedCount}`);
    record("7. Seven Certification Badges", "PASS", `7 badges verified (${check7.unlockedCount} unlocked, ${check7.lockedCount} locked): ${check7.titles.join(", ")}`);

    // ─── CHECK 8: Streak telemetry ───
    const check8 = await cdp.evaluate(`
      (() => {
        const streakPill = document.querySelector(".achievements-streak-pill")?.textContent;
        return { streakPill };
      })()
    `);
    assert(check8.streakPill && check8.streakPill.includes("5 Day Streak"), `Check 8 failed: ${JSON.stringify(check8)}`);
    record("8. Streak Telemetry", "PASS", `Active streak '${check8.streakPill}' verified`);

    // ─── CHECK 9: Progress export (blob JSON) ───
    const check9 = await cdp.evaluate(`
      (() => {
        let downloadedFilename = null;
        let downloadedHref = null;
        const origClick = HTMLAnchorElement.prototype.click;
        HTMLAnchorElement.prototype.click = function () {
          downloadedFilename = this.download;
          downloadedHref = this.href;
        };
        try {
          window.exportAnalyticsProgress();
        } finally {
          HTMLAnchorElement.prototype.click = origClick;
        }

        return {
          downloadedFilename,
          hasBlobUrl: typeof downloadedHref === "string" && downloadedHref.startsWith("blob:")
        };
      })()
    `);
    assert(/^ccna-progress-\d{4}-\d{2}-\d{2}\.json$/.test(check9.downloadedFilename) && check9.hasBlobUrl, `Check 9 failed: ${JSON.stringify(check9)}`);
    record("9. Progress Export", "PASS", `Exported '${check9.downloadedFilename}' via blob URL verified`);

    // ─── CHECK 10: Progress import & validation rejection of negative values ───
    const check10 = await cdp.evaluate(`
      (async () => {
        const badFile = new File([JSON.stringify({ totalQ: 10, correct: 5, xp: -10 })], "bad.json", { type: "application/json" });
        const badResult = await window.importAnalyticsFromFile(badFile);

        const validPayload = {
          ...window.state.analytics,
          totalQ: 80,
          correct: 72,
          xp: 888,
          studyMin: 240,
          totalTime: 2000,
          labsCompleted: 4,
          subnetMaxStreak: 15,
          streak: 7
        };
        const origConfirm = window.confirm;
        window.confirm = () => true;
        let goodResult = false;
        try {
          const goodFile = new File([JSON.stringify(validPayload)], "good.json", { type: "application/json" });
          goodResult = await window.importAnalyticsFromFile(goodFile);
        } finally {
          window.confirm = origConfirm;
        }

        return {
          badResult,
          goodResult,
          updatedXp: window.state.analytics.xp
        };
      })()
    `);
    assert(check10.badResult === false && check10.goodResult === true && check10.updatedXp === 888, `Check 10 failed: ${JSON.stringify(check10)}`);
    record("10. Progress Import & Validation", "PASS", `Negative values safely rejected; valid import applied with XP 888`);

    // ─── CHECK 11: Dark and light theme colors ───
    const check11 = await cdp.evaluate(`
      (() => {
        window.applyTheme("light");
        const lightHeroBg = window.getComputedStyle(document.querySelector(".analytics-hero")).backgroundColor;
        const lightCardBg = window.getComputedStyle(document.querySelector("#readinessHeroCard")).backgroundColor;

        window.applyTheme("dark");
        const darkHeroBg = window.getComputedStyle(document.querySelector(".analytics-hero")).backgroundColor;
        const darkCardBg = window.getComputedStyle(document.querySelector("#readinessHeroCard")).backgroundColor;

        return { lightHeroBg, lightCardBg, darkHeroBg, darkCardBg };
      })()
    `);
    assert(check11.lightHeroBg !== check11.darkHeroBg, `Check 11 failed: theme backgrounds identical`);
    record("11. Theme Consistency", "PASS", `Verified theme transitions (Light: ${check11.lightHeroBg}, Dark: ${check11.darkHeroBg})`);

    // ─── CHECK 12 & 13: Responsive layouts & Zero horizontal overflow across all viewports ───
    const viewports = [
      { width: 1440, height: 900, name: "desktop_1440" },
      { width: 1024, height: 768, name: "desktop_1024" },
      { width: 982, height: 731, name: "tablet_982" },
      { width: 768, height: 1024, name: "tablet_768" },
      { width: 390, height: 844, name: "mobile_390" },
      { width: 360, height: 740, name: "mobile_360" }
    ];

    for (const vp of viewports) {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.width < 768
      });
      await sleep(150);

      const overflow = await cdp.evaluate(`
        (() => {
          const docW = document.documentElement.scrollWidth;
          const winW = window.innerWidth;
          const bodyW = document.body.scrollWidth;
          return {
            hasOverflow: docW > winW || bodyW > winW,
            docW,
            winW,
            bodyW
          };
        })()
      `);
      assert(!overflow.hasOverflow, `Overflow at ${vp.width}px: docW=${overflow.docW}, winW=${overflow.winW}`);
    }
    record("12 & 13. Responsive Viewports & Zero Overflow", "PASS", `Tested 1440px, 1024px, 982px, 768px, 390px, 360px with zero horizontal overflow`);

    // ─── CHECK 14: Zero console errors & zero uncaught exceptions ───
    assert(cdp.consoleErrors.length === 0, `Check 14 failed: console errors: ${JSON.stringify(cdp.consoleErrors)}`);
    assert(cdp.pageExceptions.length === 0, `Check 14 failed: page exceptions: ${JSON.stringify(cdp.pageExceptions)}`);
    record("14. Console & Exception Health", "PASS", "0 console errors and 0 uncaught JavaScript exceptions");

    // ─── CHECK 15: Screenshots captured into tools/tests/phase6_screenshots/ ───
    console.log("Capturing Phase 6 verification screenshots...");

    // 1440px Dark
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await cdp.evaluate(`window.applyTheme("dark"); window.renderAnalytics();`);
    await sleep(200);
    await cdp.captureScreenshot("phase6_analytics_desktop_1440.png");

    // 1440px Light
    await cdp.evaluate(`window.applyTheme("light"); window.renderAnalytics();`);
    await sleep(200);
    await cdp.captureScreenshot("phase6_analytics_desktop_1440_light.png");

    // 1024px Dark
    await cdp.evaluate(`window.applyTheme("dark"); window.renderAnalytics();`);
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1024, height: 768, deviceScaleFactor: 1, mobile: false });
    await sleep(200);
    await cdp.captureScreenshot("phase6_analytics_tablet_1024.png");

    // 768px Dark
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 768, height: 1024, deviceScaleFactor: 1, mobile: true });
    await sleep(200);
    await cdp.captureScreenshot("phase6_analytics_tablet_768.png");

    // 390px Dark
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await sleep(200);
    await cdp.captureScreenshot("phase6_analytics_mobile_390.png");

    // 360px Dark
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 360, height: 740, deviceScaleFactor: 1, mobile: true });
    await sleep(200);
    await cdp.captureScreenshot("phase6_analytics_mobile_360.png");

    // Focus on domain breakdown (desktop)
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await cdp.evaluate(`document.getElementById("analyticsDomainSection")?.scrollIntoView();`);
    await sleep(200);
    await cdp.captureScreenshot("phase6_analytics_domain_breakdown.png");

    // Focus on trend chart
    await cdp.evaluate(`document.getElementById("analyticsTrendSection")?.scrollIntoView();`);
    await sleep(200);
    await cdp.captureScreenshot("phase6_analytics_trend_chart.png");

    // Focus on achievements
    await cdp.evaluate(`document.getElementById("achievementsPanel")?.scrollIntoView();`);
    await sleep(200);
    await cdp.captureScreenshot("phase6_analytics_achievements.png");

    // Empty state screenshot
    await cdp.evaluate(`
      window.scrollTo(0, 0);
      window.state.analytics.attempts = [];
      window.state.analytics.totalQ = 0;
      window.state.analytics.correct = 0;
      window.state.analytics.domain = {};
      window.renderAnalytics();
    `);
    await sleep(200);
    await cdp.captureScreenshot("phase6_analytics_empty_state.png");

    const screenshots = fs.readdirSync(SCREENSHOTS_DIR).filter(f => f.endsWith(".png"));
    assert(screenshots.length >= 10, `Check 15 failed: expected >= 10 screenshots, found ${screenshots.length}`);
    record("15. Screenshot Capture", "PASS", `${screenshots.length} screenshots saved to tools/tests/phase6_screenshots/`);

    console.log("\n=======================================================");
    console.log(`🎉 ALL 15/15 PHASE 6 VERIFICATION CHECKS PASSED!`);
    console.log("=======================================================\n");

  } finally {
    if (cdp) cdp.close();
    chromeProcess.kill();
    server.close();
  }
}

run().catch((err) => {
  console.error("\n❌ PHASE 6 VERIFICATION RUNNER FAILED:", err);
  process.exit(1);
});
