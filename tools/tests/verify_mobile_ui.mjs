import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");
const CHROME_PATH = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

const VIEWPORTS = [
  { name: "320x700", w: 320, h: 700, mobile: true },
  { name: "360x800", w: 360, h: 800, mobile: true },
  { name: "390x844", w: 390, h: 844, mobile: true },
  { name: "430x932", w: 430, h: 932, mobile: true },
  { name: "768x1024", w: 768, h: 1024, mobile: true },
  { name: "1366x768", w: 1366, h: 768, mobile: false },
  { name: "1440x900", w: 1440, h: 900, mobile: false },
  { name: "1920x1080", w: 1920, h: 1080, mobile: false }
];

const PAGES = ["home", "guide", "subnet", "labs", "analytics", "videos", "support", "account", "pricing"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function startStaticServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const u = new URL(req.url, "http://127.0.0.1");
      let p = decodeURIComponent(u.pathname);
      if (p === "/") p = "/index.html";
      const fp = path.join(DIST, p);
      fs.readFile(fp, (err, data) => {
        if (err) { res.writeHead(404); res.end(); return; }
        res.writeHead(200, { "Content-Type": MIME[path.extname(fp)] || "application/octet-stream", "Cache-Control": "no-store" });
        res.end(data);
      });
    });
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port }));
  });
}

async function getWsUrl(port) {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const list = await res.json();
      const pageTarget = list.find((t) => t.type === "page");
      if (pageTarget?.webSocketDebuggerUrl) return pageTarget.webSocketDebuggerUrl;
    } catch {}
    await sleep(150);
  }
  throw new Error("Timed out waiting for headless Chromium debugger");
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.pending = new Map();
    this.pageErrors = [];
  }
  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((res, rej) => { this.ws.onopen = res; this.ws.onerror = rej; });
    this.ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
        else resolve(msg.result);
      } else if (msg.method === "Runtime.exceptionThrown") {
        this.pageErrors.push(msg.params?.exceptionDetails?.text || "Runtime exception");
      }
    };
  }
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async eval(expr) {
    const res = await this.send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception?.description || res.exceptionDetails.text);
    }
    return res.result?.value;
  }
  close() { try { this.ws.close(); } catch {} }
}

async function run() {
  assert(fs.existsSync(path.join(DIST, "index.html")), "dist/index.html missing — run npm run build first");
  const { server, port } = await startStaticServer();
  const dp = 9710 + Math.floor(Math.random() * 200);
  const profile = path.join(os.tmpdir(), `ccna_mobile_ui_${Date.now()}`);
  const proc = spawn(CHROME_PATH, [`--remote-debugging-port=${dp}`, `--user-data-dir=${profile}`, "--headless=new", "--disable-gpu", "--no-first-run", "about:blank"], { stdio: "ignore" });

  let cdp;
  try {
    cdp = new CDPClient(await getWsUrl(dp));
    await cdp.connect();
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: `localStorage.setItem("ccna_onboarded", "true");` });
    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${port}/` });
    await sleep(600);

    for (const vp of VIEWPORTS) {
      await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: vp.mobile, maxTouchPoints: vp.mobile ? 5 : 1 });
      await cdp.send("Emulation.setDeviceMetricsOverride", { width: vp.w, height: vp.h, deviceScaleFactor: vp.mobile ? 2 : 1, mobile: vp.mobile });
      await sleep(120);

      for (const pg of PAGES) {
        await cdp.eval(`window.setPage("${pg}", false);`);
        await sleep(pg === "guide" || pg === "analytics" ? 200 : 80);
        const res = await cdp.eval(`(() => {
          const vw = window.innerWidth;
          const docOverflow = document.documentElement.scrollWidth > vw + 1;
          const activeSec = document.getElementById("${pg}");
          const visible = (el) => el && el.offsetParent !== null && getComputedStyle(el).display !== "none" && getComputedStyle(el).visibility !== "hidden";
          const cards = [...activeSec.querySelectorAll(".card, .stat, .mode-card, .blueprint-card, .explore-feature-card, .video-card, .exam-question-card, .opt")].filter(visible);
          const overlaps = [];
          const outOfParent = [];
          const emptyGaps = [];

          const byParent = new Map();
          for (const c of cards) {
            const p = c.parentElement;
            if (!byParent.has(p)) byParent.set(p, []);
            byParent.get(p).push(c);
          }
          for (const [, group] of byParent) {
            for (let i = 0; i < group.length; i++) {
              for (let j = i + 1; j < group.length; j++) {
                const a = group[i].getBoundingClientRect();
                const b = group[j].getBoundingClientRect();
                const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
                const iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
                if (ix > 2 && iy > 2) overlaps.push({ a: group[i].className, b: group[j].className, ix, iy });
              }
            }
          }

          for (const c of cards) {
            const cr = c.getBoundingClientRect();
            const cs = getComputedStyle(c);
            const inHScroller = Boolean(c.closest(".lab-cat-cards, .noc-svg-stage"));
            if (!inHScroller && (cr.right > vw + 2 || cr.left < -2)) {
              outOfParent.push({ el: c.className, right: Math.round(cr.right), vw });
            }
            for (const ch of c.children) {
              if (!visible(ch)) continue;
              const chs = getComputedStyle(ch);
              if (chs.position === "absolute" || chs.position === "fixed") continue;
              const r = ch.getBoundingClientRect();
              if (r.width === 0 || r.height === 0) continue;
              if (r.right > cr.right + 3 || r.left < cr.left - 3 || r.bottom > cr.bottom + 3) {
                outOfParent.push({ parent: c.className, child: ch.tagName + "#" + ch.id });
              }
            }
            const lastChild = [...c.children].filter(el => visible(el) && getComputedStyle(el).position !== "absolute").pop();
            if (lastChild && !c.classList.contains("opt")) {
              const lr = lastChild.getBoundingClientRect();
              const gap = cr.bottom - lr.bottom - parseFloat(cs.paddingBottom || 0);
              if (gap > 100) emptyGaps.push({ card: c.className + "#" + (c.id || ""), gap: Math.round(gap) });
            }
          }

          const brandH1 = document.querySelector("header.topbar .brand h1");
          const h1Ok = !brandH1 || (brandH1.getBoundingClientRect().width >= 80 && brandH1.scrollWidth <= brandH1.clientWidth + 2);
          return { docOverflow, overlaps, outOfParent, emptyGaps, h1Ok };
        })()`);

        assert(!res.docOverflow, `${vp.name} #${pg} horizontal overflow`);
        assert.equal(res.overlaps.length, 0, `${vp.name} #${pg} overlaps: ${JSON.stringify(res.overlaps)}`);
        assert.equal(res.outOfParent.length, 0, `${vp.name} #${pg} outOfParent: ${JSON.stringify(res.outOfParent)}`);
        assert.equal(res.emptyGaps.length, 0, `${vp.name} #${pg} emptyGaps: ${JSON.stringify(res.emptyGaps)}`);
        assert(res.h1Ok, `${vp.name} #${pg} topbar brand h1 crushed or clipped`);
      }
    }

    // Functional check on 390x844 mobile: click #startStudy via real layout center check & verify toast non-overlap
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
    await cdp.eval(`window.setPage("home", false);`);
    await sleep(100);
    const studyBtnClickable = await cdp.eval(`(() => {
      const btn = document.getElementById("startStudy");
      btn.scrollIntoView({ behavior: "instant", block: "center" });
      const r = btn.getBoundingClientRect();
      const topEl = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      const ok = topEl === btn || btn.contains(topEl);
      if (ok) btn.click();
      return { ok, topEl: topEl?.tagName + "#" + topEl?.id + "." + topEl?.className };
    })()`);
    assert(studyBtnClickable.ok, `#startStudy center occluded: ${JSON.stringify(studyBtnClickable)}`);
    await sleep(200);
    const engineOk = await cdp.eval(`(() => {
      const onEngine = document.body.dataset.activePage === "engine";
      const toasts = [...document.querySelectorAll("#toastContainer .toast")].filter(el => el.offsetParent !== null);
      const badge = document.querySelector(".q-header-badges");
      let toastHitsBadges = false;
      if (badge) {
        const br = badge.getBoundingClientRect();
        for (const t of toasts) {
          const tr = t.getBoundingClientRect();
          const ix = Math.max(0, Math.min(tr.right, br.right) - Math.max(tr.left, br.left));
          const iy = Math.max(0, Math.min(tr.bottom, br.bottom) - Math.max(tr.top, br.top));
          if (ix > 4 && iy > 4) toastHitsBadges = true;
        }
      }
      return { onEngine, toastHitsBadges };
    })()`);
    assert(engineOk.onEngine, "Clicking #startStudy did not activate #engine");
    assert(!engineOk.toastHitsBadges, "Mobile toast notification overlapped question badges on #engine");

    assert.equal(cdp.pageErrors.length, 0, `Page errors: ${JSON.stringify(cdp.pageErrors)}`);
    console.log("PASS: Mobile & Desktop UI Geometry + Header + Toast + Study/Spaced-Repetition regression suite (8 viewports x 9 pages + engine)");
  } finally {
    if (cdp) cdp.close();
    try { proc.kill(); } catch {}
    await sleep(250);
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
    server.close();
  }
}

run().catch((err) => {
  console.error("VERIFY MOBILE UI FAILED:", err);
  process.exit(1);
});
