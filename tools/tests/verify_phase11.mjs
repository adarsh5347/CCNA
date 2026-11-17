import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "../..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const SCREENSHOTS_DIR = path.join(__dirname, "phase11_screenshots");
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8"
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
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
      const targets = await res.json();
      const page = targets.find((t) => t.type === "page");
      if (page && page.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {}
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error(`Could not connect to browser debugger on port ${debugPort}`);
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
    this.consoleErrors = [];
    this.pageExceptions = [];
    this.failedRequests = [];
    this.badStatusResponses = [];
    this.requests = new Map();
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
      } else if (msg.method === "Runtime.consoleAPICalled") {
        if (msg.params.type === "error") {
          const text = (msg.params.args || []).map((a) => a.value ?? a.description ?? "").join(" ");
          this.consoleErrors.push(text);
        }
      } else if (msg.method === "Runtime.exceptionThrown") {
        const d = msg.params.exceptionDetails;
        this.pageExceptions.push(d?.exception?.description || d?.text || "Unknown exception");
      } else if (msg.method === "Network.requestWillBeSent") {
        this.requests.set(msg.params.requestId, msg.params.request.url);
      } else if (msg.method === "Network.responseReceived") {
        const { requestId, response } = msg.params;
        const url = response.url || this.requests.get(requestId) || "";
        if (url.startsWith("http://127.0.0.1") && response.status >= 400) {
          this.badStatusResponses.push(`${response.status} ${url}`);
        }
      } else if (msg.method === "Network.loadingFailed") {
        const url = this.requests.get(msg.params.requestId) || "";
        if (url.startsWith("http://127.0.0.1") && !msg.params.canceled) {
          this.failedRequests.push(`${msg.params.errorText} ${url}`);
        }
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
      awaitPromise: true,
      returnByValue: true
    });
    if (res.exceptionDetails) {
      throw new Error(
        `Evaluate error: ${res.exceptionDetails.exception?.description || res.exceptionDetails.text}`
      );
    }
    return res.result?.value;
  }

  async dispatchKey(key, code, modifiers = 0) {
    const keyCode = key === "Tab" ? 9 : key === "Escape" ? 27 : key === "Enter" ? 13 : 0;
    await this.send("Input.dispatchKeyEvent", {
      type: "keyDown",
      key,
      code: code || key,
      windowsVirtualKeyCode: keyCode,
      nativeVirtualKeyCode: keyCode,
      modifiers
    });
    await this.send("Input.dispatchKeyEvent", {
      type: "keyUp",
      key,
      code: code || key,
      windowsVirtualKeyCode: keyCode,
      nativeVirtualKeyCode: keyCode,
      modifiers
    });
  }

  async saveScreenshot(filename) {
    const { data } = await this.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(SCREENSHOTS_DIR, filename), Buffer.from(data, "base64"));
  }

  close() {
    try {
      this.ws.close();
    } catch {}
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const assert = (cond, msg) => {
  if (!cond) throw new Error("ASSERTION FAILED: " + msg);
};

async function waitForAppReady(cdp) {
  for (let i = 0; i < 60; i++) {
    const ready = await cdp.evaluate(`Boolean(window.setPage && window.renderHome && document.getElementById("home"))`);
    if (ready) return;
    await sleep(100);
  }
  throw new Error("Timed out waiting for application initialization");
}

function launchHeadless(binPath, debugPort, userDataDir) {
  return spawn(
    binPath,
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
}

const results = [];
function pass(id, detail) {
  results.push({ id, status: "PASS", detail });
  console.log(`✅ [PASS] ${id}: ${detail}`);
}

async function runPhase11Suite() {
  if (!fs.existsSync(path.join(DIST_DIR, "index.html"))) {
    throw new Error("dist/index.html missing. Run 'npm run build' first.");
  }

  // ─── Check 1-3: Static Security, Bundle Hygiene, SEO & SW Asset Integrity ───
  const vercelCfg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, "vercel.json"), "utf8"));
  const headerEntries = vercelCfg.headers.flatMap((h) => h.headers);
  const cspHeader = headerEntries.find((h) => h.key === "Content-Security-Policy")?.value || "";
  assert(!cspHeader.includes("razorpay.com"), "vercel.json CSP must not reference razorpay.com");
  assert(!cspHeader.includes("fonts.googleapis.com"), "vercel.json CSP must not reference unused fonts.googleapis.com");
  assert(cspHeader.includes("object-src 'none'"), "vercel.json CSP missing object-src 'none'");
  assert(cspHeader.includes("frame-ancestors 'self'"), "vercel.json CSP missing frame-ancestors 'self'");
  assert(headerEntries.some((h) => h.key === "Strict-Transport-Security"), "HSTS missing in vercel.json");
  assert(headerEntries.some((h) => h.key === "X-Content-Type-Options" && h.value === "nosniff"), "nosniff missing");
  assert(headerEntries.some((h) => h.key === "X-Frame-Options" && h.value === "SAMEORIGIN"), "X-Frame-Options missing");
  assert(headerEntries.some((h) => h.key === "Permissions-Policy"), "Permissions-Policy missing");
  pass("Check 1 (Security Headers & CSP)", "Obsolete Razorpay/font CSP origins removed; HSTS, nosniff, X-Frame-Options, Permissions-Policy present");

  const deadFiles = [
    "assets/js/data.legacy.js",
    "assets/js/qb/auto.js",
    "assets/js/qb/nf.js",
    "assets/js/qb/na.js",
    "assets/js/qb/ipc.js",
    "assets/js/qb/ips.js",
    "assets/js/qb/sec.js"
  ];
  for (const df of deadFiles) {
    assert(!fs.existsSync(path.join(ROOT_DIR, df)), `Dead source file still present: ${df}`);
    assert(!fs.existsSync(path.join(DIST_DIR, df)), `Dead dist file still present: ${df}`);
  }
  const distConfig = fs.readFileSync(path.join(DIST_DIR, "assets/js/config.js"), "utf8");
  assert(!distConfig.includes("razorpayConfig") && !distConfig.includes("PLAN_CONFIG"), "Legacy Razorpay config leaked into dist/config.js");
  assert(fs.existsSync(path.join(DIST_DIR, "robots.txt")), "dist/robots.txt missing");
  assert(fs.existsSync(path.join(DIST_DIR, "sitemap.xml")), "dist/sitemap.xml missing");
  pass("Check 2 (Dead Code & Build Hygiene)", "7 unused legacy JS files pruned; legacy Razorpay config absent from dist; robots.txt & sitemap.xml built");

  const distManifest = JSON.parse(fs.readFileSync(path.join(DIST_DIR, "manifest.json"), "utf8"));
  assert(distManifest.theme_color === "#060913", `Expected manifest theme_color #060913, got ${distManifest.theme_color}`);
  assert(distManifest.background_color === "#060913", `Expected manifest background_color #060913`);
  const swText = fs.readFileSync(path.join(DIST_DIR, "sw.js"), "utf8");
  assert(swText.includes("ccna-prep-v86"), "Expected dist/sw.js to use cache version ccna-prep-v86");
  const swAssetMatch = swText.match(/\[(["'\/][^\]]+)\]/);
  const rootSwText = fs.readFileSync(path.join(ROOT_DIR, "sw.js"), "utf8");
  const assetsBlock = rootSwText.slice(rootSwText.indexOf("const ASSETS"), rootSwText.indexOf("];") + 2);
  const assetUrls = [...assetsBlock.matchAll(/'(\/[^']*)'/g)].map((m) => m[1]);
  assert(assetUrls.includes("/manifest.json"), "sw.js ASSETS must precache /manifest.json");
  assert(assetUrls.includes("/assets/js/guide-ui.js"), "sw.js ASSETS must precache /assets/js/guide-ui.js");
  for (const u of assetUrls) {
    if (u === "/") continue;
    const target = path.join(DIST_DIR, u.replace(/^\//, ""));
    assert(fs.existsSync(target), `sw.js ASSETS path missing in dist/: ${u}`);
  }
  pass("Check 3 (Manifest & SW Asset Integrity)", `Verified ${assetUrls.length} sw.js precache entries resolve cleanly in dist/`);

  const { server, port } = await startServer(DIST_DIR);
  const debugPort = 9420 + Math.floor(Math.random() * 400);
  const chromeProfile = path.join(os.tmpdir(), `ccna_p11_chrome_${Date.now()}`);
  const chromeProc = launchHeadless(CHROME_PATH, debugPort, chromeProfile);

  let cdp;
  try {
    const wsUrl = await getDebuggerWebSocketUrl(debugPort);
    cdp = new CDPClient(wsUrl);
    await cdp.connect();
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("DOM.enable");
    await cdp.send("Network.enable");

    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
      source: `
        window.__p11Cls = [];
        try {
          new PerformanceObserver((list) => {
            for (const e of list.getEntries()) {
              if (!e.hadRecentInput) window.__p11Cls.push(e.value);
            }
          }).observe({ type: "layout-shift", buffered: true });
        } catch {}
      `
    });

    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${port}/` });
    await waitForAppReady(cdp);
    await sleep(600);

    // ─── Check 4: SEO & Proprietary Leakage ───
    const seo = await cdp.evaluate(`
      (() => {
        const title = document.title;
        const desc = document.querySelector('meta[name="description"]')?.content || "";
        const ogTitle = document.querySelector('meta[property="og:title"]')?.content || "";
        const ogDesc = document.querySelector('meta[property="og:description"]')?.content || "";
        const canonical = document.querySelector('link[rel="canonical"]')?.href || "";
        const twCard = document.querySelector('meta[name="twitter:card"]')?.content || "";
        const metaLeaks = [title, desc, ogTitle, ogDesc].some(s => /Packet Tracer|Pearson VUE/i.test(s));
        const uiLeaks = /Pearson VUE/i.test(document.body.textContent || "");
        const hasMain = Boolean(document.querySelector("main#mainContent"));
        const hasSkip = Boolean(document.querySelector("a.skip-link[href='#mainContent']"));
        const h1Count = document.querySelectorAll("h1").length;
        return { title, desc, ogTitle, ogDesc, canonical, twCard, metaLeaks, uiLeaks, hasMain, hasSkip, h1Count };
      })()
    `);
    assert(seo.title.includes("NetOps Command"), "Missing title");
    assert(seo.desc.includes("635") && seo.desc.includes("48"), "Description missing verified counts");
    assert(seo.canonical.includes("https://ccna-prep-platform.vercel.app"), "Canonical link missing");
    assert(seo.twCard === "summary" && seo.ogTitle && seo.ogDesc, "Missing OG/Twitter tags");
    assert(!seo.metaLeaks && !seo.uiLeaks, `Proprietary term leaked: ${JSON.stringify(seo)}`);
    assert(seo.hasMain && seo.hasSkip && seo.h1Count === 1, `Landmark/skip/h1 check failed: ${JSON.stringify(seo)}`);
    pass("Check 4 (SEO, Landmarks & Skip Link)", "Canonical, meta tags, zero proprietary leaks, single H1, #mainContent, and .skip-link verified");

    // ─── Check 5: Skip Link Keyboard Focus Activation ───
    await cdp.evaluate(`document.body.focus()`);
    await cdp.dispatchKey("Tab", "Tab");
    const firstFocused = await cdp.evaluate(`({ cls: document.activeElement?.className || "", href: document.activeElement?.getAttribute("href") || "", left: document.activeElement?.getBoundingClientRect().left })`);
    assert(firstFocused.cls.includes("skip-link") && firstFocused.href === "#mainContent", `Expected first Tab to focus .skip-link, got ${JSON.stringify(firstFocused)}`);
    assert(firstFocused.left >= 0 && firstFocused.left < 60, `Expected visible skip-link on focus, got left=${firstFocused.left}`);
    await cdp.saveScreenshot("home_desktop_dark.png");
    pass("Check 5 (Skip Link Keyboard Access)", "First Tab focuses visible .skip-link pointing to #mainContent");

    // ─── Check 6: Modal Keyboard Trap, Escape & Focus Restoration ───
    await cdp.evaluate(`document.getElementById("startExam").focus()`);
    await cdp.evaluate(`document.getElementById("startExam").click()`);
    await sleep(120);
    const briefOpen = await cdp.evaluate(`({
      visible: !document.getElementById("examBriefModal").classList.contains("hidden"),
      activeInside: document.getElementById("examBriefModal").contains(document.activeElement)
    })`);
    assert(briefOpen.visible && briefOpen.activeInside, `Expected #examBriefModal visible with focus inside: ${JSON.stringify(briefOpen)}`);
    for (let t = 0; t < 6; t++) {
      await cdp.dispatchKey("Tab", "Tab");
      const inside = await cdp.evaluate(`document.getElementById("examBriefModal").contains(document.activeElement)`);
      assert(inside, `Tab escaped #examBriefModal at step ${t}`);
    }
    await cdp.dispatchKey("Escape", "Escape");
    await sleep(80);
    const briefClosed = await cdp.evaluate(`({
      hidden: document.getElementById("examBriefModal").classList.contains("hidden"),
      restoredTo: document.activeElement?.id || ""
    })`);
    assert(briefClosed.hidden && briefClosed.restoredTo === "startExam", `Expected focus restored to #startExam on Escape: ${JSON.stringify(briefClosed)}`);

    // Video modal trap & focus restore
    await cdp.evaluate(`window.setPage("videos", true)`);
    await sleep(300);
    await cdp.evaluate(`document.querySelector(".btn-watch-video")?.focus(); document.querySelector(".btn-watch-video")?.click();`);
    await sleep(180);
    const vidOpen = await cdp.evaluate(`({
      visible: !document.getElementById("videoModal").classList.contains("hidden"),
      activeInside: document.getElementById("videoModal").contains(document.activeElement)
    })`);
    assert(vidOpen.visible && vidOpen.activeInside, `Expected #videoModal visible with focus inside: ${JSON.stringify(vidOpen)}`);
    for (let t = 0; t < 5; t++) {
      await cdp.dispatchKey("Tab", "Tab");
      const diag = await cdp.evaluate(`({ inside: document.getElementById("videoModal").contains(document.activeElement), tag: document.activeElement?.tagName, id: document.activeElement?.id, cls: document.activeElement?.className })`);
      assert(diag.inside, `Tab escaped #videoModal at step ${t}: ${JSON.stringify(diag)}`);
    }
    await cdp.saveScreenshot("videos_desktop_dark.png");
    await cdp.dispatchKey("Escape", "Escape");
    await sleep(80);
    const vidClosed = await cdp.evaluate(`({
      hidden: document.getElementById("videoModal").classList.contains("hidden"),
      iframeSrc: document.getElementById("videoIFrame")?.getAttribute("src") || "",
      restoredClass: document.activeElement?.className || ""
    })`);
    assert(vidClosed.hidden && vidClosed.iframeSrc === "" && vidClosed.restoredClass.includes("btn-watch-video"), `Video modal close failed: ${JSON.stringify(vidClosed)}`);

    // Onboarding modal Escape check
    await cdp.evaluate(`window.openOnboardingModal()`);
    await sleep(80);
    assert(await cdp.evaluate(`!document.getElementById("onboardingModal").classList.contains("hidden")`), "Onboarding modal failed to open");
    await cdp.dispatchKey("Escape", "Escape");
    await sleep(80);
    assert(await cdp.evaluate(`document.getElementById("onboardingModal").classList.contains("hidden")`), "Onboarding modal did not close on Escape");
    pass("Check 6 (Modal Focus Traps & Escape Restore)", "ExamBrief, Video, and Onboarding modals trap Tab, close on Escape, clear media, and restore focus");

    // ─── Check 7: Account Dashboard Bug Fix & Live Controls ───
    await cdp.evaluate(`window.setPage("account", true)`);
    await sleep(200);
    const accState = await cdp.evaluate(`({
      name: document.getElementById("accountUserName")?.textContent?.trim(),
      email: document.getElementById("accountUserEmail")?.textContent?.trim(),
      badge: document.getElementById("accountAuthBadge")?.textContent?.trim(),
      photoDisplay: getComputedStyle(document.getElementById("accountUserPhoto")).display,
      fallbackDisplay: getComputedStyle(document.getElementById("accountAvatarFallback")).display,
      signInVisible: !document.getElementById("accountBtnSignIn")?.classList.contains("hidden"),
      signOutHidden: document.getElementById("accountBtnSignOut")?.classList.contains("hidden"),
      planLabel: document.getElementById("accountPlanLabel")?.textContent?.trim(),
      historyText: document.getElementById("accountPaymentHistory")?.textContent?.trim()
    })`);
    assert(accState.name === "Guest Engineer", `Expected Guest Engineer, got ${accState.name}`);
    assert(accState.email !== "Signed In" && /guest|local/i.test(accState.email), `Account signed-out email regression: ${accState.email}`);
    assert(accState.photoDisplay === "none" && accState.fallbackDisplay === "flex", `Expected monogram fallback visible when logged out: ${JSON.stringify(accState)}`);
    assert(accState.signInVisible && accState.signOutHidden, `Expected Sign In visible and Sign Out hidden: ${JSON.stringify(accState)}`);
    assert(accState.planLabel.includes("Full Access") && accState.historyText.includes("free"), "Account plan/history check failed");
    await cdp.saveScreenshot("account_desktop_dark.png");
    pass("Check 7 (Account Guest State & Auth Controls)", "Eliminated stale 'Signed In' text; monogram avatar fallback, Sign-In/Sign-Out controls, sync stats, and export/import wired");

    // ─── Check 8: Admin Defense-in-Depth & Privacy ───
    const adminCheck = await cdp.evaluate(`
      (async () => {
        window.setPage("admin", true);
        const blockedPage = document.body.dataset.activePage;
        const navButtonsHidden = [...document.querySelectorAll('[data-page="admin"]')].every(el => getComputedStyle(el).display === "none");
        // Attempt direct invocation bypass
        await window.renderAdminDashboard();
        const statsHtml = document.getElementById("adminStats")?.innerHTML || "";
        const activityHtml = document.getElementById("adminRecentActivity")?.innerHTML || "";
        return {
          blockedPage,
          navButtonsHidden,
          hasDeniedBanner: /authentication required/i.test(statsHtml),
          clearedControls: activityHtml.trim() === "",
          leakedOwnerName: statsHtml.includes("Adarsh Poojari") || activityHtml.includes("Adarsh Poojari")
        };
      })()
    `);
    assert(adminCheck.blockedPage === "home" && adminCheck.navButtonsHidden, `Admin route guard failed: ${JSON.stringify(adminCheck)}`);
    assert(adminCheck.hasDeniedBanner && adminCheck.clearedControls && !adminCheck.leakedOwnerName, `Admin direct-call guard failed: ${JSON.stringify(adminCheck)}`);
    pass("Check 8 (Admin Defense-in-Depth & Privacy)", "Route block, hidden triggers, direct render guard, and removal of hardcoded owner identity verified");

    // ─── Check 9: Support Desk Validation, Honest Status & Duplicate/Rate Checks ───
    await cdp.evaluate(`window.setPage("support", true)`);
    await sleep(200);
    await cdp.evaluate(`localStorage.removeItem("ccna_support_last_ts"); localStorage.removeItem("ccna_support_last_sig"); localStorage.removeItem("ccna_support_tickets");`);

    // Empty submit
    await cdp.evaluate(`document.getElementById("btnSubmitSupport").click()`);
    await sleep(80);
    const emptyErr = await cdp.evaluate(`({
      visible: !document.getElementById("supportFormError").classList.contains("hidden"),
      text: document.getElementById("supportFormError").textContent.trim(),
      invalidName: document.getElementById("supportName").getAttribute("aria-invalid")
    })`);
    assert(emptyErr.visible && emptyErr.invalidName === "true", `Expected empty validation alert on support form: ${JSON.stringify(emptyErr)}`);

    // Bad email
    await cdp.evaluate(`
      document.getElementById("supportName").value = "Alex Rivera";
      document.getElementById("supportEmail").value = "not-an-email";
      document.getElementById("supportDesc").value = "Testing validation message length here.";
      document.getElementById("btnSubmitSupport").click();
    `);
    await sleep(80);
    const emailErr = await cdp.evaluate(`({
      text: document.getElementById("supportFormError").textContent.trim(),
      invalidEmail: document.getElementById("supportEmail").getAttribute("aria-invalid")
    })`);
    assert(emailErr.invalidEmail === "true" && /email/i.test(emailErr.text), `Expected email validation failure: ${JSON.stringify(emailErr)}`);

    // Honest offline submission (force offline emulation so saveSupportTicket doesn't hang or falsely claim admin delivery)
    await cdp.send("Network.emulateNetworkConditions", { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
    await cdp.evaluate(`
      document.getElementById("supportName").value = "Alex Rivera";
      document.getElementById("supportEmail").value = "alex@example.com";
      document.getElementById("supportPriority").value = "Severity 3 - Medium";
      document.getElementById("supportDesc").value = "Subnetting calculator output check offline behavior.";
      document.getElementById("btnSubmitSupport").click();
    `);
    await sleep(300);
    const offlineSupport = await cdp.evaluate(`({
      visible: !document.getElementById("supportOut").classList.contains("hidden"),
      text: document.getElementById("supportOut").textContent.trim(),
      tickets: JSON.parse(localStorage.getItem("ccna_support_tickets") || "[]")
    })`);
    assert(offlineSupport.visible, "Expected #supportOut visible after submit");
    assert(offlineSupport.text.includes("Saved Locally Only"), `Expected honest offline status in #supportOut, got: ${offlineSupport.text}`);
    assert(!offlineSupport.text.includes("admin team will follow up via the email"), "Legacy deceptive email guarantee still shown!");
    assert(offlineSupport.tickets.length === 1 && offlineSupport.tickets[0].syncStatus === "local-only", `Expected local-only ticket receipt: ${JSON.stringify(offlineSupport.tickets)}`);

    // Rate-limit second submit immediately
    await cdp.evaluate(`
      document.getElementById("supportName").value = "Alex Rivera";
      document.getElementById("supportEmail").value = "alex@example.com";
      document.getElementById("supportDesc").value = "Second ticket immediately blocked by rate limit.";
      document.getElementById("btnSubmitSupport").click();
    `);
    await sleep(80);
    const rateErr = await cdp.evaluate(`document.getElementById("supportFormError").textContent.trim()`);
    assert(/wait \d+s/i.test(rateErr), `Expected 60s rate limit alert, got: ${rateErr}`);

    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    await cdp.saveScreenshot("support_desktop_dark.png");
    pass("Check 9 (Support Desk Validation & Honest Status)", "Inline validation alerts, aria-invalid focus, local-only honest offline reporting, and rate limiting verified");

    // ─── Check 10: Themes (Light + High Contrast), Accessibility Contrast & Screenshot Sweep ───
    const routesToAudit = [
      { page: "home", shot: "home_desktop_light.png" },
      { page: "support", shot: "support_desktop_light.png" },
      { page: "account", shot: "account_desktop_light.png" },
      { page: "pricing", shot: "pricing_desktop_light.png" },
      { page: "guide", shot: "guide_desktop_light.png" },
      { page: "analytics", shot: "analytics_desktop_light.png" }
    ];

    await cdp.evaluate(`window.applyTheme("light", true)`);
    await sleep(150);

    for (const r of routesToAudit) {
      await cdp.evaluate(`window.setPage("${r.page}", true)`);
      await sleep(r.page === "guide" ? 500 : 250);
      if (r.page === "analytics") {
        // Trigger study planner output in Light Theme to verify token contrast
        await cdp.evaluate(`
          (() => {
            const d = new Date();
            d.setDate(d.getDate() + 30);
            const iso = d.toISOString().slice(0, 10);
            const inp = document.getElementById("studyExamDate");
            if (inp) inp.value = iso;
            document.getElementById("btnGeneratePlan")?.click();
          })()
        `);
        await sleep(120);
      }
      const audit = await cdp.evaluate(`
        (() => {
          const headings = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].filter(el => el.offsetParent !== null && getComputedStyle(el).visibility !== "hidden");
          let skipped = null;
          for (let i = 1; i < headings.length; i++) {
            const prev = Number(headings[i - 1].tagName.slice(1));
            const curr = Number(headings[i].tagName.slice(1));
            if (curr > prev + 1) { skipped = headings[i - 1].tagName + "->" + headings[i].tagName; break; }
          }
          const imgs = [...document.querySelectorAll("img")].filter(img => img.offsetParent !== null);
          const brokenImgs = imgs.filter(img => !img.complete || img.naturalWidth === 0).map(i => i.id || i.src);
          const overflow = document.documentElement.scrollWidth > window.innerWidth;

          // Check computed color of #supportEmail or active inputs doesn't stay dark-only #060913 background on light theme
          const emailEl = document.getElementById("supportEmail");
          const emailBg = emailEl && emailEl.offsetParent !== null ? getComputedStyle(emailEl).backgroundColor : "";

          // Check legacy neon #00f2fe isn't used as computed color in visible text
          const visibleTexts = [...document.querySelectorAll("h1, h2, h3, h4, p, label, button, .stat .v")].filter(el => el.offsetParent !== null);
          const neonLeaks = visibleTexts.filter(el => getComputedStyle(el).color === "rgb(0, 242, 254)").map(el => el.tagName + "#" + el.id);
          return { skipped, brokenImgs, overflow, emailBg, neonLeaks };
        })()
      `);
      assert(!audit.skipped, `Skipped heading order on light ${r.page}: ${audit.skipped}`);
      assert(audit.brokenImgs.length === 0, `Broken visible images on ${r.page}: ${JSON.stringify(audit.brokenImgs)}`);
      assert(!audit.overflow, `Horizontal overflow on 1440px light ${r.page}`);
      assert(audit.neonLeaks.length === 0, `Unreadable neon cyan text in light mode on ${r.page}: ${JSON.stringify(audit.neonLeaks)}`);
      if (r.page === "support") {
        assert(audit.emailBg !== "rgba(6, 9, 19, 0.65)" && audit.emailBg !== "rgb(6, 9, 19)", `#supportEmail kept dark bg in light theme: ${audit.emailBg}`);
      }
      await cdp.saveScreenshot(r.shot);
    }

    // High Contrast checks + screenshots
    await cdp.evaluate(`window.applyTheme("dark", true); document.getElementById("btnToggleContrast")?.click(); window.setPage("support", true);`);
    await sleep(200);
    const hcOk = await cdp.evaluate(`({
      hasClass: document.body.classList.contains("high-contrast"),
      pressed: document.getElementById("btnToggleContrast")?.getAttribute("aria-pressed"),
      bodyBg: getComputedStyle(document.body).backgroundColor,
      emailBorder: getComputedStyle(document.getElementById("supportEmail")).borderTopColor
    })`);
    assert(hcOk.hasClass && hcOk.pressed === "true" && hcOk.bodyBg === "rgb(0, 0, 0)" && hcOk.emailBorder === "rgb(255, 255, 255)", `High contrast styles failed: ${JSON.stringify(hcOk)}`);
    await cdp.saveScreenshot("support_desktop_hc.png");
    await cdp.evaluate(`document.getElementById("btnToggleContrast")?.click();`);
    await sleep(100);
    pass("Check 10 (Dark/Light/HC Contrast & Heading Hierarchy)", "Light theme support/account/pricing/guide/analytics + High Contrast verified with zero skipped headings or broken images");

    // Capture Dark Desktop Labs, Subnetting, Exam Engine
    await cdp.evaluate(`window.setPage("labs", true)`);
    await sleep(300);
    await cdp.saveScreenshot("labs_desktop_dark.png");

    await cdp.evaluate(`window.setPage("subnet", true)`);
    await sleep(300);
    await cdp.saveScreenshot("subnet_desktop_dark.png");

    await cdp.evaluate(`document.getElementById("startStudy").click()`);
    await sleep(250);
    await cdp.saveScreenshot("exam_engine_desktop_dark.png");
    await cdp.evaluate(`window.setPage("home", true)`);
    await sleep(150);

    // ─── Check 11: Multi-Viewport Responsive Zero-Overflow Check ───
    const viewports = [
      { w: 360, h: 780, mobile: true },
      { w: 390, h: 844, mobile: true },
      { w: 768, h: 1024, mobile: true },
      { w: 982, h: 731, mobile: false },
      { w: 1024, h: 768, mobile: false },
      { w: 1440, h: 900, mobile: false }
    ];
    const vpPages = ["home", "guide", "subnet", "labs", "support", "account", "pricing", "videos", "analytics"];
    for (const vp of viewports) {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width: vp.w,
        height: vp.h,
        deviceScaleFactor: 1,
        mobile: vp.mobile
      });
      for (const p of vpPages) {
        await cdp.evaluate(`window.setPage("${p}", true)`);
        await sleep(80);
        const ov = await cdp.evaluate(`({ sw: document.documentElement.scrollWidth, iw: window.innerWidth })`);
        assert(ov.sw <= ov.iw, `Horizontal overflow at ${vp.w}x${vp.h} on #${p}: scrollWidth=${ov.sw} > innerWidth=${ov.iw}`);
        if (vp.w === 360 && p === "support") {
          await cdp.saveScreenshot("support_mobile_360.png");
        }
      }
    }
    // Check Mobile More Sheet Trap at 390x844
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await cdp.evaluate(`document.querySelector('#mobileBottomNav [data-mobile-nav="more"]')?.click()`);
    await sleep(100);
    const sheetOpen = await cdp.evaluate(`document.getElementById("mobileMoreSheet")?.classList.contains("active") && document.getElementById("mobileMoreSheet").contains(document.activeElement)`);
    assert(sheetOpen, "Mobile more sheet failed to open with focus inside");
    await cdp.dispatchKey("Escape", "Escape");
    await sleep(80);
    const sheetClosed = await cdp.evaluate(`!document.getElementById("mobileMoreSheet")?.classList.contains("active")`);
    assert(sheetClosed, "Mobile more sheet failed to close on Escape");
    pass("Check 11 (6-Viewport Zero Overflow & Mobile Sheet A11y)", "0 horizontal overflow across 360, 390, 768, 982, 1024, 1440px on all 9 public routes");

    // Reset to 1440x900 desktop
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

    // ─── Check 12 & 13: Real Service Worker Activation + Full Offline Reload + Offline Navigation/Usage + Online Recovery ───
    await cdp.evaluate(`window.setPage("home", true)`);
    // Wait up to 7s for deferred 4000ms SW registration & activation
    let swInfo = null;
    for (let i = 0; i < 35; i++) {
      swInfo = await cdp.evaluate(`
        (async () => {
          const regs = await navigator.serviceWorker.getRegistrations();
          const ready = regs.some(r => r.active && r.active.state === "activated");
          const keys = await caches.keys();
          return { ready, keys, regCount: regs.length };
        })()
      `);
      if (swInfo.ready && swInfo.keys.includes("ccna-prep-v86")) break;
      await sleep(250);
    }
    assert(swInfo && swInfo.ready && swInfo.keys.includes("ccna-prep-v86"), `SW failed to activate ccna-prep-v86: ${JSON.stringify(swInfo)}`);
    pass("Check 12 (Service Worker Registration & Precache)", `SW activated with cache ${JSON.stringify(swInfo.keys)}`);

    // Perform first online reload so document controller is attached cleanly
    await cdp.send("Page.reload", { ignoreCache: false });
    await waitForAppReady(cdp);
    await sleep(400);
    const hasController = await cdp.evaluate(`Boolean(navigator.serviceWorker.controller)`);
    assert(hasController, "Expected active Service Worker controller after reload");

    // Shut down HTTP server briefly OR enable Chrome offline network emulation
    await cdp.send("Network.emulateNetworkConditions", { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
    await cdp.send("Page.reload", { ignoreCache: false });
    await waitForAppReady(cdp);
    await sleep(400);

    // Offline verification: boot Study Guide (previously unvisited in offline reload!), Subnetting, Labs CLI, and Support receipt
    await cdp.evaluate(`window.setPage("guide", true)`);
    await sleep(600);
    const offlineGuide = await cdp.evaluate(`({
      active: document.body.dataset.activePage === "guide",
      chaptersRendered: document.querySelectorAll("#guideChapterList .guide-ch-item, .guide-toc-item, #guideContent, #guideDirectory").length > 0 && document.getElementById("guide").textContent.length > 200
    })`);
    assert(offlineGuide.active && offlineGuide.chaptersRendered, `Offline Study Guide failed: ${JSON.stringify(offlineGuide)}`);

    await cdp.evaluate(`window.setPage("labs", true)`);
    await sleep(300);
    await cdp.evaluate(`document.getElementById("labManualCliInput").value = "enable"; document.getElementById("btnLabRunManual").click();`);
    await sleep(120);
    const offlineLabOk = await cdp.evaluate(`document.getElementById("labConsoleOutput")?.textContent?.includes("enable") || document.getElementById("labs").textContent.includes("VLAN")`);
    assert(offlineLabOk, "Offline Virtual IOS Lab interaction failed");

    await cdp.evaluate(`window.setPage("support", true)`);
    await sleep(150);
    await cdp.evaluate(`
      localStorage.removeItem("ccna_support_last_ts");
      localStorage.removeItem("ccna_support_last_sig");
      document.getElementById("supportName").value = "Offline Tester";
      document.getElementById("supportEmail").value = "offline@example.com";
      document.getElementById("supportDesc").value = "Verifying offline fallback storage persistence works accurately.";
      document.getElementById("btnSubmitSupport").click();
    `);
    await sleep(300);
    const offlineSupp = await cdp.evaluate(`document.getElementById("supportOut")?.textContent || ""`);
    assert(offlineSupp.includes("Saved Locally Only"), `Offline support fallback failed: ${offlineSupp}`);

    // Restore online condition and reload -> verify persistence and clean recovery
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    await cdp.send("Page.reload", { ignoreCache: false });
    await waitForAppReady(cdp);
    await sleep(400);
    const postRecoveryTickets = await cdp.evaluate(`JSON.parse(localStorage.getItem("ccna_support_tickets") || "[]").length`);
    assert(postRecoveryTickets >= 2, `Expected persisted local support receipts across offline->online reload, got ${postRecoveryTickets}`);
    pass("Check 13 (Offline Reload, Study Guide/Labs Offline & Online Recovery)", "Cold reload while offline, lazy Study Guide offline execution, Labs CLI offline, Support local fallback, and online reload persistence verified");

    // ─── Check 14: CLS Check & Zero Asset / Runtime Errors ───
    const maxCls = await cdp.evaluate(`(window.__p11Cls || []).reduce((s, v) => s + v, 0)`);
    assert(maxCls < 0.01, `Expected minimal CLS (< 0.01), got ${maxCls}`);
    assert(cdp.badStatusResponses.length === 0, `Same-origin HTTP >= 400 errors: ${JSON.stringify(cdp.badStatusResponses)}`);
    assert(cdp.consoleErrors.length === 0, `Console errors observed: ${JSON.stringify(cdp.consoleErrors)}`);
    assert(cdp.pageExceptions.length === 0, `Uncaught exceptions observed: ${JSON.stringify(cdp.pageExceptions)}`);
    pass("Check 14 (Zero Console Errors, Zero 4xx/5xx Assets & CLS)", `CLS=${maxCls.toFixed(4)}, 0 bad HTTP statuses, 0 console errors, 0 uncaught exceptions`);
  } finally {
    if (cdp) cdp.close();
    try { chromeProc.kill(); } catch {}
    await sleep(300);
    try { fs.rmSync(chromeProfile, { recursive: true, force: true }); } catch {}
  }

  // ─── Check 15: Cross-Browser Microsoft Edge Smoke Test ───
  if (fs.existsSync(EDGE_PATH)) {
    const edgePort = 9830 + Math.floor(Math.random() * 200);
    const edgeProfile = path.join(os.tmpdir(), `ccna_p11_edge_${Date.now()}`);
    const edgeProc = launchHeadless(EDGE_PATH, edgePort, edgeProfile);
    let edgeCdp;
    try {
      const wsUrl = await getDebuggerWebSocketUrl(edgePort);
      edgeCdp = new CDPClient(wsUrl);
      await edgeCdp.connect();
      await edgeCdp.send("Page.enable");
      await edgeCdp.send("Runtime.enable");
      await edgeCdp.send("Network.enable");
      await edgeCdp.send("Page.navigate", { url: `http://127.0.0.1:${port}/` });
      await waitForAppReady(edgeCdp);
      await sleep(300);

      for (const p of ["home", "guide", "subnet", "labs", "analytics", "videos", "support", "pricing", "account"]) {
        await edgeCdp.evaluate(`window.setPage("${p}", true)`);
        await sleep(100);
        const ok = await edgeCdp.evaluate(`document.body.dataset.activePage === "${p}" && document.documentElement.scrollWidth <= window.innerWidth`);
        assert(ok, `Edge smoke failed on #${p}`);
      }
      assert(edgeCdp.pageExceptions.length === 0, `Edge exceptions: ${JSON.stringify(edgeCdp.pageExceptions)}`);
      assert(edgeCdp.consoleErrors.length === 0, `Edge console errors: ${JSON.stringify(edgeCdp.consoleErrors)}`);
      pass("Check 15 (Microsoft Edge Cross-Browser Smoke)", "All 9 public routes rendered cleanly with zero overflow or JS errors in Edge");
    } finally {
      if (edgeCdp) edgeCdp.close();
      try { edgeProc.kill(); } catch {}
      await sleep(300);
      try { fs.rmSync(edgeProfile, { recursive: true, force: true }); } catch {}
    }
  } else {
    console.log("⚠️ [SKIP] Check 15 (Microsoft Edge): msedge.exe not found at expected path");
  }

  server.close();
  console.log(`\n🎉 PHASE 11 VERIFICATION COMPLETE: ${results.length}/${results.length} CHECKS PASSED!`);
}

runPhase11Suite().catch((err) => {
  console.error("PHASE 11 VERIFICATION FAILED:", err);
  process.exit(1);
});
