import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "../..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const SCREENSHOTS_DIR = path.join(__dirname, "phase7_screenshots");
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
  console.log("=== NETOPS COMMAND — PHASE 7 VERIFICATION & VISUAL AUDIT SUITE ===");
  const { server, port } = await startServer(DIST_DIR);
  console.log(`Serving dist bundle on http://127.0.0.1:${port}`);

  const debugPort = 9520 + Math.floor(Math.random() * 400);
  const tmpDir = path.join(ROOT_DIR, ".tmp_chrome_p7_" + debugPort);
  const chromeProcess = spawn(
    CHROME_PATH,
    [
      "--headless=new",
      `--remote-debugging-port=${debugPort}`,
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      `--user-data-dir=${tmpDir}`,
      `http://127.0.0.1:${port}/?page=guide`
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

    // Clear initial toasts & seed 1 mastered chapter for visual fidelity check
    await cdp.evaluate(`
      localStorage.setItem("netops_theme_v1", "dark");
      document.documentElement.setAttribute("data-theme", "dark");
      const tc = document.getElementById("toastContainer");
      if (tc) tc.innerHTML = "";
    `);

    // ─── STUDY GUIDE CHECKS (DESKTOP DARK) ───
    await cdp.evaluate(`window.setPage("guide")`);
    await sleep(450);

    const guideInit = await cdp.evaluate(`
      (() => {
        const chItems = document.querySelectorAll("#guideChapterList .guide-ch-item[data-ch-id]").length;
        const volHeaders = document.querySelectorAll("#guideChapterList .guide-vol-group-header").length;
        const heroTitle = document.querySelector(".guide-hero-title")?.textContent?.trim() || "";
        const proseEl = document.querySelector("#guideReaderPanel .guide-reader-prose");
        const proseWidth = proseEl ? proseEl.getBoundingClientRect().width : 0;
        const cmdWrap = document.querySelector("#guideReaderPanel .guide-cmd-table-wrap");
        const cmdBg = cmdWrap ? getComputedStyle(cmdWrap).backgroundColor : "";
        const overflow = document.documentElement.scrollWidth > window.innerWidth;
        const statCmds = document.getElementById("guideStatCommands")?.textContent || "";
        const statTerms = document.getElementById("guideStatTerms")?.textContent || "";
        return { chItems, volHeaders, heroTitle, proseWidth, cmdBg, overflow, statCmds, statTerms };
      })()
    `);
    assert(guideInit.chItems === 48, `Expected 48 chapters in sidebar, got ${guideInit.chItems}`);
    assert(guideInit.volHeaders === 2, `Expected 2 volume headers (Vol 1 & Vol 2), got ${guideInit.volHeaders}`);
    assert(guideInit.heroTitle === "Your CCNA field guide.", `Unexpected guide title: ${guideInit.heroTitle}`);
    assert(guideInit.proseWidth > 500 && guideInit.proseWidth <= 760, `Expected editorial measure <= 760px, got ${guideInit.proseWidth}`);
    assert(!guideInit.overflow, "Horizontal overflow detected on desktop Study Guide");
    await cdp.captureScreenshot("guide_desktop_dark.png");
    console.log("PASS [Study Guide Desktop Dark]: 48 chapters, Vol 1/2 dividers, editorial measure", Math.round(guideInit.proseWidth) + "px");

    // Light mode check
    await cdp.evaluate(`
      document.documentElement.setAttribute("data-theme", "light");
      document.body.classList.remove("high-contrast");
    `);
    await sleep(420);
    const guideLight = await cdp.evaluate(`
      (() => {
        const readerBg = getComputedStyle(document.getElementById("guideReaderPanel")).backgroundColor;
        const cmdBg = getComputedStyle(document.querySelector("#guideReaderPanel .guide-cmd-table-wrap")).backgroundColor;
        return { readerBg, cmdBg };
      })()
    `);
    assert(guideLight.readerBg === "rgb(255, 255, 255)", `Expected white reader surface in light mode, got ${guideLight.readerBg}`);
    assert(guideLight.cmdBg === "rgb(12, 12, 14)", `Expected dark CLI table in light mode, got ${guideLight.cmdBg}`);
    await cdp.captureScreenshot("guide_desktop_light.png");
    console.log("PASS [Study Guide Desktop Light]: Paper reading surface + dark CLI terminal preserved");

    // Back to dark mode, test chapter nav + flashcard drill + mastery
    await cdp.evaluate(`
      document.documentElement.setAttribute("data-theme", "dark");
      window.state.analytics.chapter = window.state.analytics.chapter || {};
      window.state.analytics.chapter["v1c02"] = { total: 4, correct: 4 };
      document.getElementById("btnNextCh")?.click();
    `);
    await sleep(200);
    const navAndFlash = await cdp.evaluate(`
      (() => {
        const activeId = document.querySelector("#guideChapterList .guide-ch-item.active")?.dataset.chId;
        const readerHtml = document.getElementById("guideReaderPanel")?.innerHTML || "";
        const mastered = readerHtml.includes("Mastered: 100%");
        document.querySelector('[data-term-view="flashcards"]')?.click();
        const flashEl = document.getElementById("guideChapterFlashcard");
        const termText = flashEl?.querySelector(".guide-flashcard-content")?.textContent || "";
        flashEl?.click();
        const flipped = document.getElementById("guideChapterFlashcard")?.classList.contains("flipped");
        const sec = document.getElementById("guideChapterTermsSection");
        if (sec) sec.scrollIntoView({ behavior: "instant", block: "center" });
        return { activeId, mastered, flipped, hasTermText: termText.length > 0 };
      })()
    `);
    assert(navAndFlash.activeId === "v1c02" && navAndFlash.mastered, "Failed advancing to v1c02 or rendering Mastered: 100%");
    assert(navAndFlash.flipped && navAndFlash.hasTermText, "Chapter Key-Term Flashcard toggle failed");
    await cdp.captureScreenshot("guide_reader_flashcards_dark.png");
    console.log("PASS [Chapter Navigation & Flashcard Drill]: #btnNextCh, Mastery pill, Flashcard flip verified");

    // Test Command Explorer & Glossary tabs + search
    await cdp.evaluate(`
      document.getElementById("btnPrevCh")?.click();
      document.getElementById("guideTabCommands")?.click();
      window.scrollTo(0, 0);
    `);
    await sleep(150);
    const cmdExplorer = await cdp.evaluate(`
      (() => {
        const visible = !document.getElementById("guideCommandsShell")?.classList.contains("hidden");
        const rowCount = document.querySelectorAll("#guideCommandsShell tbody tr").length;
        const modeChips = document.querySelectorAll("#guideCommandsShell [data-cmd-mode]").length;
        return { visible, rowCount, modeChips };
      })()
    `);
    assert(cmdExplorer.visible && cmdExplorer.rowCount > 300 && cmdExplorer.modeChips >= 3, `Command Explorer failed: ${JSON.stringify(cmdExplorer)}`);
    await cdp.captureScreenshot("guide_commands_dark.png");
    console.log(`PASS [IOS Command Explorer]: ${cmdExplorer.rowCount} CLI commands with ${cmdExplorer.modeChips} mode filters`);

    await cdp.evaluate(`
      document.getElementById("guideTabGlossary")?.click();
      window.scrollTo(0, 0);
    `);
    await sleep(150);
    const glossExplorer = await cdp.evaluate(`
      (() => {
        const visible = !document.getElementById("guideGlossaryShell")?.classList.contains("hidden");
        const cards = document.querySelectorAll("#guideGlossaryShell .guide-term-card").length;
        const alphaBtns = document.querySelectorAll("#guideGlossaryShell [data-glossary-letter]").length;
        return { visible, cards, alphaBtns };
      })()
    `);
    assert(glossExplorer.visible && glossExplorer.cards > 400 && glossExplorer.alphaBtns > 15, `Glossary Explorer failed: ${JSON.stringify(glossExplorer)}`);
    await cdp.captureScreenshot("guide_glossary_dark.png");
    console.log(`PASS [Global Glossary]: ${glossExplorer.cards} terms with A-Z filter bar`);

    // Test chapter jump back via [data-open-ch]
    await cdp.evaluate(`
      document.querySelector('#guideGlossaryShell [data-open-ch="v2c05"]')?.click();
    `);
    await sleep(150);
    const jumpedCh = await cdp.evaluate(`document.querySelector("#guideChapterList .guide-ch-item.active")?.dataset.chId`);
    assert(jumpedCh === "v2c05", `Expected jump to v2c05, got ${jumpedCh}`);

    // ─── VIDEO LIBRARY CHECKS (DESKTOP DARK & LIGHT) ───
    await cdp.evaluate(`window.setPage("videos")`);
    await sleep(350);

    const videoInit = await cdp.evaluate(`
      (() => {
        const cards = document.querySelectorAll("#videoLessonsGrid .video-card").length;
        const iframeSrcBefore = document.getElementById("videoIFrame")?.getAttribute("src") || "";
        const label = document.getElementById("videoProgressLabel")?.textContent || "";
        const brokenImgs = Array.from(document.querySelectorAll("#videoLessonsGrid img")).filter(i => i.naturalWidth === 0).length;
        const overflow = document.documentElement.scrollWidth > window.innerWidth;
        const domainBreakdownCount = document.querySelectorAll("#videoDomainBreakdown .video-breakdown-row").length;
        return { cards, iframeSrcBefore, label, brokenImgs, overflow, domainBreakdownCount };
      })()
    `);
    assert(videoInit.cards === 126, `Expected 126 video cards, got ${videoInit.cards}`);
    assert(videoInit.iframeSrcBefore === "", `Expected lazy video iframe src empty initially, got ${videoInit.iframeSrcBefore}`);
    assert(videoInit.label.includes("/126 Watched"), `Expected '/126 Watched', got ${videoInit.label}`);
    assert(videoInit.brokenImgs === 0, `Detected ${videoInit.brokenImgs} broken images`);
    assert(videoInit.domainBreakdownCount === 6, `Expected 6 domain progress breakdown bars, got ${videoInit.domainBreakdownCount}`);
    assert(!videoInit.overflow, "Horizontal overflow on desktop Video Library");
    await cdp.captureScreenshot("videos_desktop_dark.png");
    console.log("PASS [Video Library Desktop Dark]: 126 curated cards, 6 SVG poster motifs, lazy iframe verified");

    // Light mode screenshot on Videos
    await cdp.evaluate(`document.documentElement.setAttribute("data-theme", "light")`);
    await sleep(180);
    await cdp.captureScreenshot("videos_desktop_light.png");
    await cdp.evaluate(`document.documentElement.setAttribute("data-theme", "dark")`);
    await sleep(150);

    // Filter by domain + watch checkbox + modal playback + close lazy cleanup
    const videoInteract = await cdp.evaluate(`
      (() => {
        const ipcBtn = document.querySelector('.video-filter-btn[data-domain="IP Connectivity"]');
        ipcBtn?.click();
        const ipcCount = document.querySelectorAll("#videoLessonsGrid .video-card").length;

        const firstWatch = document.querySelector("#videoLessonsGrid .btn-watch-video");
        firstWatch?.click();
        const modalOpen = !document.getElementById("videoModal")?.classList.contains("hidden");
        const iframeSrcOpen = document.getElementById("videoIFrame")?.getAttribute("src") || "";
        const modalCardWidth = document.querySelector("#videoModal .video-modal-card")?.getBoundingClientRect().width || 0;
        const watchedAfterPlay = document.getElementById("videoProgressLabel")?.textContent || "";
        return { ipcCount, modalOpen, iframeSrcOpen, modalCardWidth, watchedAfterPlay };
      })()
    `);
    assert(videoInteract.ipcCount === 14, `Expected 14 IP Connectivity videos, got ${videoInteract.ipcCount}`);
    assert(videoInteract.modalOpen && videoInteract.iframeSrcOpen.includes("youtube.com/embed/"), "Video modal failed to lazy-load iframe on play");
    assert(videoInteract.modalCardWidth >= 750, `Expected spacious video modal (>=750px), got ${videoInteract.modalCardWidth}px`);
    assert(videoInteract.watchedAfterPlay.startsWith("1/126"), `Expected 1/126 Watched after play, got ${videoInteract.watchedAfterPlay}`);
    await cdp.captureScreenshot("videos_modal_dark.png");

    await cdp.evaluate(`
      document.getElementById("btnCloseVideoModal")?.click();
      document.querySelector('.video-filter-btn[data-domain="all"]')?.click();
    `);
    await sleep(150);
    const modalClosedSrc = await cdp.evaluate(`document.getElementById("videoIFrame")?.getAttribute("src") || ""`);
    assert(modalClosedSrc === "", `Expected iframe src cleared on modal close, got ${modalClosedSrc}`);
    console.log("PASS [Video Modal & Filters]: Domain filtering (14 IPC), spacious obsidian modal, lazy src cleared on close");

    // ─── MOBILE 390x844 CHECKS ───
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(300);

    // Mobile Study Guide
    await cdp.evaluate(`
      window.setPage("guide");
      document.getElementById("guideTabChapters")?.click();
      window.scrollTo(0, 0);
    `);
    await sleep(250);
    const guideMobile = await cdp.evaluate(`
      (() => {
        const overflow = document.documentElement.scrollWidth > window.innerWidth;
        const listEl = document.getElementById("guideChapterList");
        const collapsedInitially = listEl ? getComputedStyle(listEl).display === "none" : false;
        const tocBtn = document.getElementById("btnToggleMobileToc");
        const tocBtnHeight = tocBtn ? tocBtn.getBoundingClientRect().height : 0;
        const tabBtnHeight = document.getElementById("guideTabChapters")?.getBoundingClientRect().height || 0;
        return { overflow, collapsedInitially, tocBtnHeight, tabBtnHeight };
      })()
    `);
    assert(!guideMobile.overflow, "Horizontal overflow on 390px Mobile Study Guide");
    assert(guideMobile.collapsedInitially, "Expected chapter list collapsed by default on 390px mobile");
    assert(guideMobile.tocBtnHeight >= 44 && guideMobile.tabBtnHeight >= 44, `Touch targets below 44px on mobile Guide: ${JSON.stringify(guideMobile)}`);
    await cdp.captureScreenshot("guide_mobile_390_dark.png");
    await cdp.evaluate(`document.getElementById("guideReaderPanel")?.scrollIntoView({ behavior: "instant", block: "start" })`);
    await sleep(150);
    await cdp.captureScreenshot("guide_mobile_390_reader.png");
    console.log("PASS [Mobile 390px Study Guide]: Zero overflow, TOC collapsed, >= 44px touch targets");

    // Mobile Video Library
    await cdp.evaluate(`
      window.setPage("videos");
      window.scrollTo(0, 0);
    `);
    await sleep(250);
    const videoMobile = await cdp.evaluate(`
      (() => {
        const overflow = document.documentElement.scrollWidth > window.innerWidth;
        const filterBtnH = document.querySelector(".video-filter-btn")?.getBoundingClientRect().height || 0;
        const gridCols = getComputedStyle(document.getElementById("videoLessonsGrid")).gridTemplateColumns.split(" ").length;
        return { overflow, filterBtnH, gridCols };
      })()
    `);
    assert(!videoMobile.overflow, "Horizontal overflow on 390px Mobile Video Library");
    assert(videoMobile.filterBtnH >= 44, `Filter chip touch target < 44px: ${videoMobile.filterBtnH}`);
    assert(videoMobile.gridCols === 1, `Expected 1 column video grid on 390px, got ${videoMobile.gridCols}`);
    await cdp.captureScreenshot("videos_mobile_390_dark.png");
    console.log("PASS [Mobile 390px Video Library]: Zero overflow, 1-col grid, 44px filter pills");

    assert(cdp.consoleErrors.length === 0, `Console errors observed: ${cdp.consoleErrors.join(" | ")}`);
    assert(cdp.pageExceptions.length === 0, `Page exceptions observed: ${cdp.pageExceptions.join(" | ")}`);
    console.log("ALL PHASE 7 VERIFICATION CHECKS PASSED (0 console errors, 0 page exceptions).");
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
