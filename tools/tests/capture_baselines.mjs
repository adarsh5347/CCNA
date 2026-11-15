import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "../..");
const BASELINES_DIR = path.join(__dirname, "baselines");
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const VIEWPORTS = [
  { width: 1440, height: 900, mobile: false, label: "1440px" },
  { width: 1024, height: 768, mobile: false, label: "1024px" },
  { width: 982, height: 731, mobile: false, label: "982px" },
  { width: 390, height: 844, mobile: true, label: "390px" },
  { width: 360, height: 740, mobile: true, label: "360px" }
];

const THEMES = ["dark", "light"];

const PAGES = [
  "home",
  "subnet",
  "labs",
  "analytics",
  "videos",
  "guide",
  "support",
  "engine",
  "pricing",
  "account",
  "admin"
];

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
    this.id = 0;
    this.pending = new Map();
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

async function captureAllBaselines() {
  const { server, port } = await startServer(ROOT_DIR);
  const debugPort = 9400 + Math.floor(Math.random() * 400);
  const userDataDir = path.join(
    process.env.TEMP || "C:\\Windows\\Temp",
    `ccna_baselines_${Date.now()}`
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
  const manifest = [];

  try {
    const wsUrl = await getDebuggerWebSocketUrl(debugPort);
    cdp = new CDPClient(wsUrl);
    await cdp.connect();
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }]
    });

    await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
      source: `
        localStorage.setItem("ccna_onboarded", "true");
      `
    });

    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${port}/` });

    for (let i = 0; i < 40; i++) {
      const ready = await cdp.evaluate(
        `Boolean(window.setPage && window.state && window.state.bank && window.state.bank.length > 0)`
      );
      if (ready) break;
      await sleep(100);
    }

    // Pre-initialize Study Guide so its chapters are ready for screenshots
    await cdp.evaluate(`
      (async () => {
        const g = await import("/assets/js/guide-ui.js?v=84");
        g.initStudyGuide();
      })()
    `);
    await sleep(150);

    let count = 0;
    for (const theme of THEMES) {
      await cdp.evaluate(`window.applyTheme("${theme}", true)`);
      await sleep(80);

      for (const vp of VIEWPORTS) {
        const outDir = path.join(BASELINES_DIR, theme, vp.label);
        fs.mkdirSync(outDir, { recursive: true });

        await cdp.send("Emulation.setDeviceMetricsOverride", {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 1,
          mobile: vp.mobile
        });
        await sleep(100);

        for (const pageId of PAGES) {
          if (pageId === "engine") {
            await cdp.evaluate(`
              (() => {
                window.setPage("home", false);
                document.getElementById("startStudy").click();
                // Deterministic Q0 from bank so every baseline screenshot shows the same question
                if (window.state.session && window.state.bank) {
                  const firstSingle = window.state.bank.find(q => q.id === "nf-001") || window.state.bank[0];
                  window.state.session.questions[0] = firstSingle;
                  window.state.session.idx = 0;
                  window.state.session.timeLeft = 1200;
                  document.querySelector('#qNav [data-qnav="0"]')?.click();
                  const timerText = document.getElementById("timerText");
                  if (timerText) timerText.textContent = "20:00";
                }
              })()
            `);
          } else if (pageId === "admin") {
            // Admin page is owner-gated in setPage("admin"); activate #admin section directly for visual baseline capture
            await cdp.evaluate(`
              (() => {
                window.setPage("home", false);
                document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
                const adminEl = document.getElementById("admin");
                if (adminEl) adminEl.classList.add("active");
                document.body.dataset.activePage = "admin";
                window.scrollTo(0, 0);
              })()
            `);
          } else {
            await cdp.evaluate(`
              (() => {
                window.setPage("${pageId}", false);
                window.scrollTo(0, 0);
              })()
            `);
          }

          await sleep(120);

          const shotRes = await cdp.send("Page.captureScreenshot", {
            format: "png",
            fromSurface: true
          });
          const filePath = path.join(outDir, `${pageId}.png`);
          const buf = Buffer.from(shotRes.data, "base64");
          fs.writeFileSync(filePath, buf);
          count++;
          manifest.push({
            theme,
            viewport: vp.label,
            width: vp.width,
            height: vp.height,
            page: pageId,
            bytes: buf.length,
            relPath: `tools/tests/baselines/${theme}/${vp.label}/${pageId}.png`
          });
        }
        console.log(`[Baselines] Captured ${PAGES.length} pages for theme=${theme}, viewport=${vp.label} (${vp.width}x${vp.height})`);
      }
    }

    fs.writeFileSync(
      path.join(BASELINES_DIR, "manifest.json"),
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          totalScreenshots: count,
          themes: THEMES,
          viewports: VIEWPORTS,
          pages: PAGES,
          files: manifest
        },
        null,
        2
      )
    );
    console.log(`Successfully captured ${count} baseline screenshots in ${BASELINES_DIR}`);
  } finally {
    if (cdp) cdp.close();
    try {
      chromeProc.kill();
    } catch {}
    server.close();
  }
}

captureAllBaselines().catch((err) => {
  console.error(err);
  process.exit(1);
});
