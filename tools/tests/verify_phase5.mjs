import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "../..");
const SCREENSHOTS_DIR = path.join(__dirname, "phase5_screenshots");
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

async function runPhase5Verification() {
  console.log("==================================================");
  console.log("NETOPS COMMAND — PHASE 5 VERIFICATION SUITE");
  console.log("==================================================");

  const { server, port } = await startServer(ROOT_DIR);
  const debugPort = 9450 + Math.floor(Math.random() * 300);
  const userDataDir = path.join(
    process.env.TEMP || "C:\\Windows\\Temp",
    `ccna_p5_verify_${Date.now()}`
  );

  const chromeProc = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${userDataDir}`,
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--window-size=1440,900",
      "about:blank"
    ],
    { stdio: "ignore" }
  );

  let cdp;
  let checksPassed = 0;
  const totalChecks = 11;

  try {
    const wsUrl = await getDebuggerWebSocketUrl(debugPort);
    cdp = new CDPClient(wsUrl);
    await cdp.connect();

    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${port}/index.html` });
    await sleep(1500);

    // ─── 1. HERO SECTION HEADLINE & CTAS ───
    console.log("\n[Check 1/11] Verifying Hero section editorial headline, description & CTAs...");
    const heroInfo = await cdp.evaluate(`
      (() => {
        const titleEl = document.querySelector(".home-hero-title");
        const titleText = titleEl ? titleEl.textContent.trim().replace(/\\s+/g, " ") : "";
        const descEl = document.querySelector(".home-hero-desc");
        const descText = descEl ? descEl.textContent.trim() : "";
        const btnStudy = document.getElementById("btnLaunchStudy");
        const btnExplore = document.getElementById("btnExplorePlatform");
        const btnGuide = document.getElementById("btnLaunchGuide");
        const btnExam = document.getElementById("btnLaunchExam");
        const btnLabs = document.getElementById("btnLaunchLabs");
        const btnExport = document.getElementById("btnHomeExportProgress");
        const svg = document.querySelector(".home-hero-svg");

        return {
          hasHeadline: titleText.includes("Master the network.") && titleText.includes("Own your future."),
          hasDesc: descText.includes("Everything you need to prepare for CCNA 200-301"),
          hasPrimaryCta: Boolean(btnStudy && btnStudy.textContent.includes("Continue Learning")),
          hasExploreCta: Boolean(btnExplore && btnExplore.getAttribute("href") === "#explorePlatform"),
          hasContractButtons: Boolean(btnGuide && btnExam && btnLabs && btnExport),
          hasSvg: Boolean(svg && svg.getAttribute("viewBox") === "0 0 460 220")
        };
      })()
    `);

    assert(heroInfo.hasHeadline, "Hero title must contain 'Master the network. Own your future.'");
    assert(heroInfo.hasDesc, "Hero description must explain CCNA preparation.");
    assert(heroInfo.hasPrimaryCta, "Primary CTA '#btnLaunchStudy' must read 'Continue Learning'.");
    assert(heroInfo.hasExploreCta, "Secondary CTA '#btnExplorePlatform' must link to '#explorePlatform'.");
    assert(heroInfo.hasContractButtons, "Contract buttons (#btnLaunchGuide, #btnLaunchExam, etc.) must exist.");
    assert(heroInfo.hasSvg, "Abstract topology SVG must be rendered with viewBox '0 0 460 220'.");
    console.log("  ✔ Hero headline, editorial copy, primary/secondary CTAs, and SVG verified.");
    checksPassed++;

    // ─── 2. PREPARATION TELEMETRY & STATS ZERO-SHIFT ───
    console.log("\n[Check 2/11] Verifying Preparation Telemetry & Stats zero-shift state...");
    const statsInfo = await cdp.evaluate(`
      (() => {
        const rVal = document.getElementById("heroReadiness")?.textContent?.trim();
        const rBar = document.getElementById("heroReadinessBar")?.getAttribute("style");
        const qVal = document.getElementById("heroQuestions")?.textContent?.trim();
        const sVal = document.getElementById("heroStreak")?.textContent?.trim();
        const lVal = document.getElementById("heroLabs")?.textContent?.trim();
        const qzVal = document.getElementById("heroQuizzes")?.textContent?.trim();

        return { rVal, rBar, qVal, sVal, lVal, qzVal };
      })()
    `);

    assert(statsInfo.rVal === "0%", `Expected #heroReadiness to be '0%', got '${statsInfo.rVal}'`);
    assert(statsInfo.rBar?.includes("width: 0%"), `Expected #heroReadinessBar to have 'width: 0%', got '${statsInfo.rBar}'`);
    assert(statsInfo.qVal === "0", `Expected #heroQuestions to be '0', got '${statsInfo.qVal}'`);
    assert(statsInfo.sVal?.includes("0 Days"), `Expected #heroStreak to include '0 Days', got '${statsInfo.sVal}'`);
    assert(statsInfo.lVal?.includes("0 / 10"), `Expected #heroLabs to include '0 / 10', got '${statsInfo.lVal}'`);
    assert(statsInfo.qzVal === "0", `Expected #heroQuizzes to be '0', got '${statsInfo.qzVal}'`);
    console.log("  ✔ Pre-hydrated KPI stats (0%, width: 0%, 0, 🔥 0 Days, 0 / 10, 0) verified.");
    checksPassed++;

    // ─── 3. RESUME QUIZ BANNER STATE ───
    console.log("\n[Check 3/11] Verifying #resumeQuizBanner hidden empty state...");
    const bannerInfo = await cdp.evaluate(`
      (() => {
        const b = document.getElementById("resumeQuizBanner");
        return {
          exists: Boolean(b),
          isHidden: b?.classList.contains("hidden"),
          ariaLabel: b?.getAttribute("aria-label")
        };
      })()
    `);

    assert(bannerInfo.exists, "#resumeQuizBanner must be in the DOM.");
    assert(bannerInfo.isHidden, "#resumeQuizBanner must initially have class 'hidden'.");
    assert(bannerInfo.ariaLabel === "Resume unfinished quiz", "Expected aria-label 'Resume unfinished quiz'.");
    console.log("  ✔ #resumeQuizBanner correctly initialized as hidden region.");
    checksPassed++;

    // ─── 4. QUICK ACCESS NAVIGATION BAR ───
    console.log("\n[Check 4/11] Verifying Quick Access Navigation Bar...");
    const quickAccessInfo = await cdp.evaluate(`
      (() => {
        const nav = document.querySelector(".home-quick-access");
        const btns = nav ? [...nav.querySelectorAll(".quick-access-btn")] : [];
        const btnTexts = btns.map(b => b.textContent.trim());
        return {
          exists: Boolean(nav),
          btnCount: btns.length,
          btnTexts
        };
      })()
    `);

    assert(quickAccessInfo.exists, "Quick access navigation bar (.home-quick-access) must exist.");
    assert(quickAccessInfo.btnCount >= 6, `Expected at least 6 quick access buttons, got ${quickAccessInfo.btnCount}`);
    assert(quickAccessInfo.btnTexts.some(t => t.includes("Study Mode")), "Must contain Study Mode quick action.");
    assert(quickAccessInfo.btnTexts.some(t => t.includes("Section Quiz")), "Must contain Section Quiz quick action.");
    assert(quickAccessInfo.btnTexts.some(t => t.includes("Real Exam")), "Must contain Real Exam quick action.");
    assert(quickAccessInfo.btnTexts.some(t => t.includes("Virtual Labs")), "Must contain Virtual Labs quick action.");
    assert(quickAccessInfo.btnTexts.some(t => t.includes("Subnetting")), "Must contain Subnetting quick action.");
    assert(quickAccessInfo.btnTexts.some(t => t.includes("Video Library")), "Must contain Video Library quick action.");
    console.log(`  ✔ Quick access bar verified with ${quickAccessInfo.btnCount} actions.`);
    checksPassed++;

    // ─── 5. PRACTICE MODES SHOWCASE (5 MODES) ───
    console.log("\n[Check 5/11] Verifying 5 Practice & Simulation Modes...");
    const modesInfo = await cdp.evaluate(`
      (() => {
        const studyBtn = document.getElementById("startStudy");
        const quizBtn = document.getElementById("startQuiz");
        const examBtn = document.getElementById("startExam");
        const smartBtn = document.getElementById("startSmartQuiz");
        const missedBtn = document.getElementById("startMissedQuiz");

        const qDuration = document.getElementById("quizDuration");
        const qCount = document.getElementById("quizCount");
        const domainChecks = document.querySelectorAll("#domainChecks .qdomain");

        const smartInfo = document.getElementById("smartQuizInfo");
        const missedInfo = document.getElementById("missedQuizInfo");

        const featuredCard = document.querySelector(".mode-card-featured");

        return {
          hasStudy: Boolean(studyBtn),
          hasQuiz: Boolean(quizBtn),
          hasExam: Boolean(examBtn),
          hasSmart: Boolean(smartBtn),
          hasMissed: Boolean(missedBtn),
          durationOptions: qDuration ? qDuration.options.length : 0,
          countOptions: qCount ? qCount.options.length : 0,
          domainCount: domainChecks.length,
          hasSmartInfo: Boolean(smartInfo && smartInfo.textContent.includes("Current Focus Areas")),
          hasMissedInfo: Boolean(missedInfo && missedInfo.textContent.includes("Status")),
          hasFeaturedExam: Boolean(featuredCard && featuredCard.contains(examBtn))
        };
      })()
    `);

    assert(modesInfo.hasStudy, "Study Mode button #startStudy must exist.");
    assert(modesInfo.hasQuiz, "Quiz Mode button #startQuiz must exist.");
    assert(modesInfo.hasExam, "Exam Mode button #startExam must exist.");
    assert(modesInfo.hasSmart, "Smart Adaptive button #startSmartQuiz must exist.");
    assert(modesInfo.hasMissed, "Spaced Repetition button #startMissedQuiz must exist.");
    assert(modesInfo.durationOptions >= 3, "Duration select must have options.");
    assert(modesInfo.countOptions >= 3, "Questions select must have options.");
    assert(modesInfo.domainCount === 6, `Expected 6 domain filter checkboxes, found ${modesInfo.domainCount}`);
    assert(modesInfo.hasSmartInfo, "Smart Quiz focus area text must be pre-rendered.");
    assert(modesInfo.hasMissedInfo, "Spaced Repetition status text must be pre-rendered.");
    assert(modesInfo.hasFeaturedExam, "Real Exam card must have .mode-card-featured styling.");
    console.log("  ✔ All 5 practice modalities, selectors, and domain filters verified.");
    checksPassed++;

    // ─── 6. CCNA BLUEPRINT SECTION (6 DOMAINS) ───
    console.log("\n[Check 6/11] Verifying CCNA Blueprint Section with 6 domains...");
    const bpInfo = await cdp.evaluate(`
      (() => {
        const section = document.querySelector(".home-blueprint-section");
        const cards = section ? [...section.querySelectorAll(".blueprint-card")] : [];
        const titles = cards.map(c => c.querySelector(".blueprint-domain-title")?.textContent.trim());
        const weights = cards.map(c => c.querySelector(".badge")?.textContent.trim());
        return {
          exists: Boolean(section),
          count: cards.length,
          titles,
          weights
        };
      })()
    `);

    assert(bpInfo.exists, "Blueprint section must exist.");
    assert(bpInfo.count === 6, `Expected 6 blueprint domain cards, found ${bpInfo.count}`);
    assert(bpInfo.weights.some(w => w?.includes("20%")), "Must include 20% weight domains.");
    assert(bpInfo.weights.some(w => w?.includes("25%")), "Must include 25% IP Connectivity domain.");
    assert(bpInfo.weights.some(w => w?.includes("15%")), "Must include 15% Security Fundamentals domain.");
    assert(bpInfo.weights.some(w => w?.includes("10%")), "Must include 10% weight domains.");
    console.log(`  ✔ 6 CCNA Blueprint domains and percentage weights verified.`);
    checksPassed++;

    // ─── 7. EXPLORE THE PLATFORM PILLARS ───
    console.log("\n[Check 7/11] Verifying Explore the Platform ecosystem...");
    const exploreInfo = await cdp.evaluate(`
      (() => {
        const exp = document.getElementById("explorePlatform");
        const guideBtn = exp?.querySelector('[data-page="guide"]');
        const labsBtn = exp?.querySelector('[data-page="labs"]');
        const subnetBtn = exp?.querySelector('[data-page="subnet"]');
        const videosBtn = exp?.querySelector('[data-page="videos"]');
        const simHeading = document.getElementById("simulatorHeading");
        const topoSvg = document.getElementById("topoSvg");
        const flashcardBox = document.getElementById("flashcardBox");
        const bankStats = document.getElementById("bankStats");

        return {
          exists: Boolean(exp),
          hasGuide: Boolean(guideBtn),
          hasLabs: Boolean(labsBtn),
          hasSubnet: Boolean(subnetBtn),
          hasVideos: Boolean(videosBtn),
          hasSimulator: Boolean(simHeading && topoSvg),
          hasFlashcards: Boolean(flashcardBox),
          hasBankStats: Boolean(bankStats && bankStats.children.length === 6)
        };
      })()
    `);

    assert(exploreInfo.exists, "#explorePlatform section must exist.");
    assert(exploreInfo.hasGuide, "Cert guide feature card must exist.");
    assert(exploreInfo.hasLabs, "Virtual Labs feature card must exist.");
    assert(exploreInfo.hasSubnet, "Subnetting feature card must exist.");
    assert(exploreInfo.hasVideos, "Video Library feature card must exist.");
    assert(exploreInfo.hasSimulator, "Packet Simulator must be embedded inside Explore.");
    assert(exploreInfo.hasFlashcards, "Flashcards box must be embedded inside Explore.");
    assert(exploreInfo.hasBankStats, "Question bank stats must have 6 pre-populated cards.");
    console.log("  ✔ All 6 platform pillars, simulator, flashcards & bank distribution verified.");
    checksPassed++;

    // ─── 8. FINAL CLOSING CTA ───
    console.log("\n[Check 8/11] Verifying Final Closing Call to Action...");
    const ctaInfo = await cdp.evaluate(`
      (() => {
        const cta = document.querySelector(".home-closing-cta");
        const title = cta?.querySelector(".home-cta-title")?.textContent.trim().replace(/\\s+/g, " ");
        const btnStudy = document.getElementById("btnFooterStartStudy");
        const btnGuide = document.getElementById("btnFooterCertGuide");

        return {
          exists: Boolean(cta),
          hasTitle: title?.includes("Every packet has a path.") && title?.includes("Build the skills to understand it."),
          hasStudyBtn: Boolean(btnStudy && btnStudy.textContent.includes("Start Learning")),
          hasGuideBtn: Boolean(btnGuide && btnGuide.textContent.includes("Browse Cert Guide"))
        };
      })()
    `);

    assert(ctaInfo.exists, "Closing CTA (.home-closing-cta) must exist.");
    assert(ctaInfo.hasTitle, "Closing CTA must have editorial headline.");
    assert(ctaInfo.hasStudyBtn, "Closing CTA must have '#btnFooterStartStudy'.");
    assert(ctaInfo.hasGuideBtn, "Closing CTA must have '#btnFooterCertGuide'.");
    console.log("  ✔ Closing CTA card with editorial copy and launch actions verified.");
    checksPassed++;

    // ─── 9. THEME SWITCHING (DARK & LIGHT) ───
    console.log("\n[Check 9/11] Verifying Light & Dark theme styling on Homepage...");
    // Dark mode check
    const darkColors = await cdp.evaluate(`
      (() => {
        const hero = document.querySelector(".home-hero");
        const card = document.querySelector(".mode-card");
        const bgHero = getComputedStyle(hero).backgroundColor;
        const bgCard = getComputedStyle(card).backgroundColor;
        return { bgHero, bgCard };
      })()
    `);

    // Switch to Light mode
    await cdp.evaluate(`window.applyTheme("light", true);`);
    await sleep(400);

    const lightColors = await cdp.evaluate(`
      (() => {
        const hero = document.querySelector(".home-hero");
        const card = document.querySelector(".mode-card");
        const bgHero = getComputedStyle(hero).backgroundColor;
        const bgCard = getComputedStyle(card).backgroundColor;
        const textColor = getComputedStyle(hero.querySelector(".home-hero-title")).color;
        return { bgHero, bgCard, textColor };
      })()
    `);

    assert(lightColors.bgCard === "rgb(255, 255, 255)", `Expected light mode card background rgb(255, 255, 255), got ${lightColors.bgCard}`);
    console.log(`  ✔ Theme switching verified (Dark: ${darkColors.bgCard} -> Light: ${lightColors.bgCard}, Text: ${lightColors.textColor}).`);

    // Capture Light mode screenshot
    await cdp.captureScreenshot("02_desktop_1440_home_hero_light.png");

    // Switch back to Dark mode
    await cdp.evaluate(`window.applyTheme("dark", true);`);
    await sleep(400);

    // Capture Dark mode screenshot
    await cdp.captureScreenshot("01_desktop_1440_home_hero_dark.png");
    checksPassed++;

    // ─── 10. RESPONSIVE VIEWPORT TESTING & ZERO HORIZONTAL OVERFLOW ───
    console.log("\n[Check 10/11] Testing responsive viewports for zero horizontal overflow...");
    const viewports = [
      { name: "Desktop 1440", w: 1440, h: 900, shot: "03_desktop_1440_home_status_and_modes.png" },
      { name: "Small Desktop 1024", w: 1024, h: 768, shot: null },
      { name: "Lighthouse Desktop 982", w: 982, h: 731, shot: null },
      { name: "Tablet Portrait 768", w: 768, h: 1024, shot: "07_tablet_768_home_hero.png" },
      { name: "Mobile iPhone 390", w: 390, h: 844, shot: "08_mobile_390_home_hero.png" },
      { name: "Small Mobile 360", w: 360, h: 740, shot: "10_mobile_360_home_hero.png" }
    ];

    for (const vp of viewports) {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width: vp.w,
        height: vp.h,
        deviceScaleFactor: 1,
        mobile: vp.w <= 768
      });
      await sleep(250);

      const overflow = await cdp.evaluate(`
        (() => {
          const scrollW = document.documentElement.scrollWidth;
          const innerW = window.innerWidth;
          const bodyScrollW = document.body.scrollWidth;
          return { scrollW, innerW, bodyScrollW, hasOverflow: scrollW > innerW || bodyScrollW > innerW };
        })()
      `);

      assert(!overflow.hasOverflow, `Horizontal overflow detected at ${vp.name} (${vp.w}x${vp.h}): scrollWidth=${overflow.scrollW}, innerWidth=${overflow.innerW}`);
      console.log(`  ✔ ${vp.name} (${vp.w}px): 0 horizontal overflow (scrollWidth=${overflow.scrollW} <= innerWidth=${overflow.innerW}).`);

      if (vp.shot) {
        await cdp.captureScreenshot(vp.shot);
      }
    }

    // Capture additional desktop section screenshots
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await sleep(200);

    // Scroll to explore
    await cdp.evaluate(`document.getElementById("explorePlatform")?.scrollIntoView({ block: "start" });`);
    await sleep(200);
    await cdp.captureScreenshot("04_desktop_1440_home_blueprint_and_explore.png");

    // Scroll to simulator
    await cdp.evaluate(`document.getElementById("simulatorHeading")?.scrollIntoView({ block: "start" });`);
    await sleep(200);
    await cdp.captureScreenshot("05_desktop_1440_home_simulator_and_flashcards.png");

    // Scroll to bottom CTA
    await cdp.evaluate(`document.querySelector(".home-closing-cta")?.scrollIntoView({ block: "start" });`);
    await sleep(200);
    await cdp.captureScreenshot("06_desktop_1440_home_closing_cta.png");

    // Capture mobile modes screenshot
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await sleep(200);
    await cdp.evaluate(`document.getElementById("practiceModulesHeading")?.scrollIntoView({ block: "start" });`);
    await sleep(200);
    await cdp.captureScreenshot("09_mobile_390_home_modes.png");

    checksPassed++;

    // ─── 11. ZERO CONSOLE ERRORS & EXCEPTIONS ───
    console.log("\n[Check 11/11] Verifying console errors and uncaught exceptions...");
    assert(cdp.consoleErrors.length === 0, `Detected console errors: ${JSON.stringify(cdp.consoleErrors)}`);
    assert(cdp.pageExceptions.length === 0, `Detected page exceptions: ${JSON.stringify(cdp.pageExceptions)}`);
    console.log("  ✔ 0 console errors, 0 uncaught exceptions.");
    checksPassed++;

    console.log("\n==================================================");
    console.log(`🎉 ALL ${checksPassed}/${totalChecks} PHASE 5 HOMEPAGE CHECKS PASSED!`);
    console.log(`📸 Screenshots saved to: ${SCREENSHOTS_DIR}`);
    console.log("==================================================");
  } finally {
    if (cdp) cdp.close();
    try {
      chromeProc.kill();
    } catch {}
    server.close();
  }
}

runPhase5Verification().catch((err) => {
  console.error("\n❌ PHASE 5 VERIFICATION FAILED:", err);
  process.exit(1);
});
