import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, "../../dist");
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
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
        const acceptEncoding = req.headers["accept-encoding"] || "";
        if (acceptEncoding.includes("gzip") && (ext === ".html" || ext === ".css" || ext === ".js")) {
          const gz = zlib.gzipSync(data);
          res.writeHead(200, {
            "Content-Type": MIME[ext] || "application/octet-stream",
            "Content-Encoding": "gzip",
            "Cache-Control": "no-store"
          });
          res.end(gz);
        } else {
          res.writeHead(200, {
            "Content-Type": MIME[ext] || "application/octet-stream",
            "Cache-Control": "no-store"
          });
          res.end(data);
        }
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
    this.id = 0;
    this.pending = new Map();
    this.consoleErrors = [];
    this.pageExceptions = [];
    this.networkRequests = [];
    this.frameNavigations = [];
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method === "Runtime.consoleAPICalled") {
        if (msg.params.type === "error") {
          const text = (msg.params.args || [])
            .map((a) => a.value ?? a.description ?? "")
            .join(" ");
          this.consoleErrors.push(text);
        }
      } else if (msg.method === "Runtime.exceptionThrown") {
        const details = msg.params.exceptionDetails;
        this.pageExceptions.push(
          details?.exception?.description || details?.text || "Unknown exception"
        );
      } else if (msg.method === "Network.requestWillBeSent") {
        this.networkRequests.push(msg.params.request.url);
      } else if (msg.method === "Page.frameNavigated") {
        if (!msg.params.frame.parentId) {
          this.frameNavigations.push(msg.params.frame.url);
        }
      }
    };
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
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
        "Evaluation error: " +
          (res.exceptionDetails.exception?.description || res.exceptionDetails.text)
      );
    }
    return res.result?.value;
  }

  close() {
    try {
      this.ws.close();
    } catch {}
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function assert(cond, msg) {
  if (!cond) throw new Error("ASSERTION FAILED: " + msg);
}

async function runAudit() {
  if (!fs.existsSync(path.join(DIST, "index.html"))) {
    throw new Error("dist/index.html not found. Run 'npm run build' first.");
  }

  const { server, port } = await startServer(DIST);
  const debugPort = 9350 + Math.floor(Math.random() * 400);
  const userDataDir = path.join(
    process.env.TEMP || "C:\\Windows\\Temp",
    `ccna_lh_verify_${Date.now()}`
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
  try {
    const wsUrl = await getDebuggerWebSocketUrl(debugPort);
    cdp = new CDPClient(wsUrl);
    await cdp.connect();
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Network.enable");

    // ─── 1. Test /?page=home in fresh incognito session at 982x731 (Lighthouse Desktop viewport) ───
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 982,
      height: 731,
      deviceScaleFactor: 1,
      mobile: false
    });
    await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
      source: `
        window.__clsEntries = [];
        try {
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                window.__clsEntries.push({
                  value: entry.value,
                  startTime: Math.round(entry.startTime),
                  sources: (entry.sources || []).map(s => ({
                    node: s.node ? (s.node.tagName + (s.node.id ? "#" + s.node.id : "") + (s.node.className ? "." + String(s.node.className).replace(/\\s+/g, ".") : "")) : "unknown",
                    prev: s.previousRect ? { x: s.previousRect.x, y: s.previousRect.y, w: s.previousRect.width, h: s.previousRect.height } : null,
                    curr: s.currentRect ? { x: s.currentRect.x, y: s.currentRect.y, w: s.currentRect.width, h: s.currentRect.height } : null
                  }))
                });
              }
            }
          }).observe({ type: "layout-shift", buffered: true });
        } catch (e) {}
      `
    });

    cdp.networkRequests = [];
    cdp.frameNavigations = [];
    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${port}/?page=home` });
    await sleep(2600);

    const homeMetrics = await cdp.evaluate(`
      (() => {
        const nav = performance.getEntriesByType("navigation")[0];
        const paints = Object.fromEntries(performance.getEntriesByType("paint").map(p => [p.name, Math.round(p.startTime)]));
        const resources = performance.getEntriesByType("resource");
        const renderBlocking = resources.filter(r => r.renderBlockingStatus === "blocking").map(r => r.name);
        const hasTitle = Boolean(document.title && document.title.length > 10);
        const hasMetaDesc = Boolean(document.querySelector('meta[name="description"]')?.getAttribute("content"));
        const hasViewport = Boolean(document.querySelector('meta[name="viewport"]')?.getAttribute("content"));
        const hasLang = document.documentElement.getAttribute("lang") === "en";
        const hasOgTitle = Boolean(document.querySelector('meta[property="og:title"]')?.getAttribute("content"));
        return {
          clsTotal: (window.__clsEntries || []).reduce((s, e) => s + e.value, 0),
          clsEntries: window.__clsEntries || [],
          fcpMs: paints["first-contentful-paint"] ?? null,
          domCompleteMs: nav ? Math.round(nav.domComplete) : null,
          renderBlocking,
          seoChecks: { hasTitle, hasMetaDesc, hasViewport, hasLang, hasOgTitle }
        };
      })()
    `);

    console.log("Home CLS at 982x731:", JSON.stringify({ total: homeMetrics.clsTotal, entries: homeMetrics.clsEntries }));
    assert(homeMetrics.clsTotal < 0.01, `Expected CLS < 0.01 on /?page=home, got ${homeMetrics.clsTotal}`);
    assert(homeMetrics.renderBlocking.length === 0, `Expected 0 render-blocking resources on /?page=home, got ${JSON.stringify(homeMetrics.renderBlocking)}`);
    assert(
      Object.values(homeMetrics.seoChecks).every(Boolean),
      `Expected all SEO checks to pass on /?page=home: ${JSON.stringify(homeMetrics.seoChecks)}`
    );

    const homeNavCount = cdp.frameNavigations.filter((u) => u.includes("?page=home")).length;
    assert(homeNavCount === 1, `Expected exactly 1 navigation to /?page=home (no self-redirect), got ${homeNavCount}`);

    const homeFirebaseReqs = cdp.networkRequests.filter((u) => u.includes("firebasejs"));
    assert(
      homeFirebaseReqs.length === 0,
      `Expected 0 Firebase SDK requests on initial load of /?page=home, got ${JSON.stringify(homeFirebaseReqs)}`
    );

    const homeGuideReqs = cdp.networkRequests.filter((u) => u.includes("/guide/"));
    assert(
      homeGuideReqs.length === 0,
      `Expected 0 Study Guide chapter requests on initial load of /?page=home, got ${JSON.stringify(homeGuideReqs)}`
    );
    console.log(
      `1. /?page=home verified: CLS=${homeMetrics.clsTotal.toFixed(4)}, FCP=${homeMetrics.fcpMs}ms, Render-Blocking=${homeMetrics.renderBlocking.length}, 0 redirects, 0 Firebase requests, 0 Study Guide requests.`
    );

    // ─── 2. Test /?page=engine in fresh session ───
    cdp.networkRequests = [];
    cdp.frameNavigations = [];
    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${port}/?page=engine` });
    await sleep(2200);

    const engineMetrics = await cdp.evaluate(`
      (() => {
        const paints = Object.fromEntries(performance.getEntriesByType("paint").map(p => [p.name, Math.round(p.startTime)]));
        const resources = performance.getEntriesByType("resource");
        const renderBlocking = resources.filter(r => r.renderBlockingStatus === "blocking").map(r => r.name);
        return {
          clsTotal: (window.__clsEntries || []).reduce((s, e) => s + e.value, 0),
          clsEntries: window.__clsEntries || [],
          fcpMs: paints["first-contentful-paint"] ?? null,
          renderBlocking
        };
      })()
    `);
    console.log("Engine CLS at 982x731:", JSON.stringify({ total: engineMetrics.clsTotal, entries: engineMetrics.clsEntries }));
    assert(engineMetrics.clsTotal < 0.01, `Expected CLS < 0.01 on /?page=engine, got ${engineMetrics.clsTotal}`);
    assert(engineMetrics.renderBlocking.length === 0, `Expected 0 render-blocking resources on /?page=engine, got ${JSON.stringify(engineMetrics.renderBlocking)}`);

    const engineNavCount = cdp.frameNavigations.filter((u) => u.includes("?page=engine")).length;
    assert(engineNavCount === 1, `Expected 1 navigation to /?page=engine (no self-redirect), got ${engineNavCount}`);

    const engineFirebaseReqs = cdp.networkRequests.filter((u) => u.includes("firebasejs"));
    assert(
      engineFirebaseReqs.length === 0,
      `Expected 0 Firebase SDK requests on initial load of /?page=engine, got ${JSON.stringify(engineFirebaseReqs)}`
    );

    // Check Accessibility on /?page=engine: heading-order and label-content-name-mismatch
    const engineA11y = await cdp.evaluate(`
      (() => {
        const headings = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].filter(el => {
          return el.offsetParent !== null && getComputedStyle(el).visibility !== "hidden";
        });
        const levels = headings.map(h => ({ tag: h.tagName, id: h.id, text: h.textContent.trim().slice(0, 35), level: Number(h.tagName.slice(1)) }));
        let skippedHeading = null;
        for (let i = 1; i < levels.length; i++) {
          if (levels[i].level > levels[i - 1].level + 1) {
            skippedHeading = { prev: levels[i - 1], curr: levels[i] };
            break;
          }
        }

        const buttons = [...document.querySelectorAll("button[aria-label]")].filter(b => b.offsetParent !== null);
        const mismatches = [];
        for (const btn of buttons) {
          const aria = (btn.getAttribute("aria-label") || "").trim().toLowerCase();
          const clone = btn.cloneNode(true);
          clone.querySelectorAll('[aria-hidden="true"], .btn-mobile-text, .sr-only').forEach(n => n.remove());
          const vis = clone.textContent.replace(/[^a-zA-Z0-9\\s]/g, "").trim().toLowerCase();
          if (vis && !aria.includes(vis)) {
            mismatches.push({ id: btn.id, vis, aria });
          }
        }

        const modeTitleTag = document.getElementById("modeTitle")?.tagName;
        const hasInlinedCss = Boolean(document.getElementById("inlined-styles") || document.getElementById("critical-css"));
        const hasGstaticPreconnect = Boolean(document.querySelector('link[rel="preconnect"][href="https://www.gstatic.com"]'));

        return { levels, skippedHeading, mismatches, modeTitleTag, hasInlinedCss, hasGstaticPreconnect };
      })()
    `);
    assert(engineA11y.modeTitleTag === "H2", `Expected #modeTitle to be H2, got ${engineA11y.modeTitleTag}`);
    assert(!engineA11y.skippedHeading, `Heading order skip detected on /?page=engine: ${JSON.stringify(engineA11y.skippedHeading)}`);
    assert(engineA11y.mismatches.length === 0, `Label-content-name mismatches detected: ${JSON.stringify(engineA11y.mismatches)}`);
    assert(engineA11y.hasInlinedCss, "Expected inlined CSS in <head> of dist/index.html");
    assert(engineA11y.hasGstaticPreconnect, "Expected <link rel=preconnect href=https://www.gstatic.com>");
    console.log(
      `2. /?page=engine verified: CLS=${engineMetrics.clsTotal.toFixed(4)}, FCP=${engineMetrics.fcpMs}ms, Render-Blocking=${engineMetrics.renderBlocking.length}, 0 redirects, 0 Firebase requests, sequential heading order (h1 -> h2#modeTitle), 0 label-content-name mismatches.`
    );

    // ─── 3. Verify on-demand loading of firebase-auth.js and firebase-firestore.js ───
    cdp.networkRequests = [];
    await cdp.evaluate(`
      (async () => {
        const mod = await import("/assets/js/firebase-lazy.js?v=84");
        await mod.getFirebaseAuth();
      })()
    `);
    const authReqsAfterDemand = cdp.networkRequests.filter((u) => u.includes("firebase-auth.js") || u.includes("firebase-app.js"));
    const fsReqsDuringAuthOnly = cdp.networkRequests.filter((u) => u.includes("firebase-firestore.js"));
    assert(authReqsAfterDemand.length >= 2, `Expected firebase-app.js and firebase-auth.js to load when getFirebaseAuth() is called`);
    assert(fsReqsDuringAuthOnly.length === 0, `Expected firebase-firestore.js NOT to load when only Auth is requested`);

    await cdp.evaluate(`
      (async () => {
        const mod = await import("/assets/js/firebase-lazy.js?v=84");
        await mod.getFirestoreDb();
      })()
    `);
    const fsReqsAfterDemand = cdp.networkRequests.filter((u) => u.includes("firebase-firestore.js"));
    assert(fsReqsAfterDemand.length >= 1, `Expected firebase-firestore.js to load when getFirestoreDb() is called`);
    console.log("3. Lazy Firebase wrapper verified: firebase-auth.js and firebase-firestore.js load strictly on demand.");

    assert(cdp.consoleErrors.length === 0, `Console errors: ${JSON.stringify(cdp.consoleErrors)}`);
    assert(cdp.pageExceptions.length === 0, `Page exceptions: ${JSON.stringify(cdp.pageExceptions)}`);
    console.log("ALL LIGHTHOUSE PERFORMANCE & ACCESSIBILITY FIXES VERIFIED!");
  } finally {
    if (cdp) cdp.close();
    try {
      chromeProc.kill();
    } catch {}
    server.close();
  }
}

runAudit().catch((err) => {
  console.error(err);
  process.exit(1);
});
