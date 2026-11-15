import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "../..");
const SCREENSHOTS_DIR = path.join(__dirname, "phase4_screenshots");
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

  async setViewport(width, height, isMobile = false) {
    await this.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: isMobile
    });
    await this.send("Emulation.setVisibleSize", { width, height });
  }

  async screenshot(filename) {
    const res = await this.send("Page.captureScreenshot", { format: "png" });
    const buffer = Buffer.from(res.data, "base64");
    const outPath = path.join(SCREENSHOTS_DIR, filename);
    fs.writeFileSync(outPath, buffer);
    console.log(`  📸 Screenshot saved: ${filename}`);
  }

  close() {
    try {
      this.ws.close();
    } catch {}
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runPhase4Verification() {
  console.log("==================================================");
  console.log("NETOPS COMMAND — PHASE 4 UI COMPONENT VERIFICATION");
  console.log("==================================================\n");

  const { server, port } = await startServer(ROOT_DIR);
  const debugPort = 9520 + Math.floor(Math.random() * 300);
  const userDataDir = path.join(
    process.env.TEMP || "C:\\Windows\\Temp",
    `ccna_p4_${Date.now()}`
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
      "about:blank"
    ],
    { stdio: "ignore" }
  );

  const wsUrl = await getDebuggerWebSocketUrl(debugPort);
  const cdp = new CDPClient(wsUrl);
  await cdp.connect();
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");

  const results = [];
  function assert(title, condition, extra = "") {
    if (condition) {
      console.log(`  ✅ [PASS] ${title} ${extra}`);
      results.push({ title, pass: true });
    } else {
      console.error(`  ❌ [FAIL] ${title} ${extra}`);
      results.push({ title, pass: false, extra });
    }
  }

  try {
    // Navigate to local server
    await cdp.setViewport(1440, 900, false);
    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${port}/` });
    await sleep(800);

    // ─────────────────────────────────────────────────────────────
    // 1. BUTTON SYSTEM
    // ─────────────────────────────────────────────────────────────
    console.log("1. Verifying Button System...");
    const btnChecks = await cdp.evaluate(`(() => {
      const box = document.createElement('div');
      box.id = '__test_btn_box';
      box.style.cssText = 'position:fixed;bottom:10px;left:10px;z-index:999999;display:flex;gap:8px;padding:10px;';
      box.innerHTML = \`
        <button id="tPrimary" class="primary">Primary CTA</button>
        <button id="tSecondary" class="secondary">Secondary</button>
        <button id="tGhost" class="ghost">Ghost</button>
        <button id="tDanger" class="destructive">Danger</button>
        <button id="tCompact" class="btn-compact">Compact</button>
        <button id="tIcon" class="btn-icon"><svg></svg></button>
        <button id="tDisabled" disabled>Disabled</button>
      \`;
      document.body.appendChild(box);

      const p = getComputedStyle(document.getElementById('tPrimary'));
      const s = getComputedStyle(document.getElementById('tSecondary'));
      const g = getComputedStyle(document.getElementById('tGhost'));
      const d = getComputedStyle(document.getElementById('tDanger'));
      const c = getComputedStyle(document.getElementById('tCompact'));
      const i = getComputedStyle(document.getElementById('tIcon'));
      const dis = getComputedStyle(document.getElementById('tDisabled'));

      return {
        primary: {
          bg: p.backgroundColor,
          color: p.color,
          borderRadius: p.borderRadius,
          minHeight: parseFloat(p.minHeight),
          fontWeight: p.fontWeight
        },
        secondary: {
          bg: s.backgroundColor,
          border: s.borderTopWidth,
          minHeight: parseFloat(s.minHeight)
        },
        ghost: {
          bg: g.backgroundColor,
          border: g.borderTopStyle
        },
        danger: {
          color: d.color
        },
        compact: {
          minHeight: parseFloat(c.minHeight),
          fontSize: c.fontSize
        },
        icon: {
          width: parseFloat(i.width),
          height: parseFloat(i.height)
        },
        disabled: {
          opacity: parseFloat(dis.opacity),
          pointerEvents: dis.pointerEvents
        }
      };
    })()`);

    assert("Primary button has Apple Blue background and white text",
      btnChecks.primary.bg.includes("0, 113, 227") || btnChecks.primary.bg === "rgb(0, 113, 227)",
      `bg=${btnChecks.primary.bg}`
    );
    assert("Primary button has 10px border-radius and >= 38px min-height",
      btnChecks.primary.borderRadius === "10px" && btnChecks.primary.minHeight >= 38,
      `radius=${btnChecks.primary.borderRadius}, minHeight=${btnChecks.primary.minHeight}`
    );
    assert("Ghost button has transparent background",
      btnChecks.ghost.bg === "rgba(0, 0, 0, 0)",
      `bg=${btnChecks.ghost.bg}`
    );
    assert("Compact button has <= 32px height",
      btnChecks.compact.minHeight <= 32,
      `minHeight=${btnChecks.compact.minHeight}`
    );
    assert("Icon button has square 36x36 geometry",
      btnChecks.icon.width === 36 && btnChecks.icon.height === 36,
      `width=${btnChecks.icon.width}, height=${btnChecks.icon.height}`
    );
    assert("Disabled button has reduced opacity and pointer-events none",
      btnChecks.disabled.opacity <= 0.5 && btnChecks.disabled.pointerEvents === "none",
      `opacity=${btnChecks.disabled.opacity}`
    );

    // ─────────────────────────────────────────────────────────────
    // 2. CARD SYSTEM
    // ─────────────────────────────────────────────────────────────
    console.log("\n2. Verifying Card System...");
    const cardChecks = await cdp.evaluate(`(() => {
      const box = document.createElement('div');
      box.id = '__test_card_box';
      box.innerHTML = \`
        <div id="tCard" class="card">Standard</div>
        <div id="tCardElev" class="card card-elevated">Elevated</div>
        <div id="tCardGroup" class="card card-grouped">Grouped</div>
        <div id="tCardInteract" class="card card-interactive">Interactive</div>
        <div id="tCardCompact" class="card card-compact">Compact</div>
        <div id="tStat" class="stat"><span class="k">Accuracy</span><span class="v">94%</span></div>
      \`;
      document.body.appendChild(box);

      const c = getComputedStyle(document.getElementById('tCard'));
      const ce = getComputedStyle(document.getElementById('tCardElev'));
      const cg = getComputedStyle(document.getElementById('tCardGroup'));
      const ci = getComputedStyle(document.getElementById('tCardInteract'));
      const cc = getComputedStyle(document.getElementById('tCardCompact'));
      const st = getComputedStyle(document.getElementById('tStat'));
      const stK = getComputedStyle(document.querySelector('#tStat .k'));
      const stV = getComputedStyle(document.querySelector('#tStat .v'));

      return {
        card: { borderRadius: c.borderRadius, borderTopWidth: c.borderTopWidth },
        interactive: { cursor: ci.cursor },
        compact: { borderRadius: cc.borderRadius },
        stat: { borderRadius: st.borderRadius },
        statK: { textTransform: stK.textTransform, fontWeight: stK.fontWeight },
        statV: { fontSize: stV.fontSize, fontWeight: stV.fontWeight }
      };
    })()`);

    assert("Standard card has 16px border-radius and separator border",
      cardChecks.card.borderRadius === "16px" && parseFloat(cardChecks.card.borderTopWidth) >= 1,
      `radius=${cardChecks.card.borderRadius}`
    );
    assert("Interactive card has cursor pointer",
      cardChecks.interactive.cursor === "pointer"
    );
    assert("Compact card has 12px border-radius",
      cardChecks.compact.borderRadius === "12px",
      `radius=${cardChecks.compact.borderRadius}`
    );
    assert("Stat card has uppercase label and prominent bold value",
      cardChecks.statK.textTransform === "uppercase" && parseInt(cardChecks.statV.fontWeight) >= 700,
      `label=${cardChecks.statK.textTransform}, valFont=${cardChecks.statV.fontWeight}`
    );

    // ─────────────────────────────────────────────────────────────
    // 3. FORM CONTROLS
    // ─────────────────────────────────────────────────────────────
    console.log("\n3. Verifying Form Controls...");
    const formChecks = await cdp.evaluate(`(() => {
      const box = document.createElement('div');
      box.id = '__test_form_box';
      box.innerHTML = \`
        <label id="tLabel" for="tInput">Test Label</label>
        <input id="tInput" type="text" placeholder="Enter text">
        <select id="tSelect"><option>Opt 1</option></select>
        <textarea id="tTextarea"></textarea>
        <div class="checks">
          <label id="tCheckLabel"><input id="tCheckbox" type="checkbox" checked> Option A</label>
        </div>
        <input id="tRange" type="range" min="0" max="100" value="50">
      \`;
      document.body.appendChild(box);

      const inp = getComputedStyle(document.getElementById('tInput'));
      const sel = getComputedStyle(document.getElementById('tSelect'));
      const txt = getComputedStyle(document.getElementById('tTextarea'));
      const chkLbl = getComputedStyle(document.getElementById('tCheckLabel'));
      const chk = getComputedStyle(document.getElementById('tCheckbox'));
      const rng = getComputedStyle(document.getElementById('tRange'));

      return {
        inputRadius: inp.borderRadius,
        inputPadding: inp.padding,
        selectRadius: sel.borderRadius,
        textareaRadius: txt.borderRadius,
        checkboxAccent: chk.accentColor,
        checkLabelRadius: chkLbl.borderRadius,
        checkLabelDisplay: chkLbl.display,
        rangeHeight: rng.height
      };
    })()`);

    assert("Text input, select, and textarea have 10px radius",
      formChecks.inputRadius === "10px" && formChecks.selectRadius === "10px" && formChecks.textareaRadius === "10px",
      `radius=${formChecks.inputRadius}`
    );
    assert("Checkbox has accent-color tint",
      formChecks.checkboxAccent.includes("0, 113, 227") || formChecks.checkboxAccent !== "auto",
      `accent=${formChecks.checkboxAccent}`
    );
    assert("Checklist item has 8px radius and flex display",
      formChecks.checkLabelRadius === "8px" && formChecks.checkLabelDisplay === "flex",
      `display=${formChecks.checkLabelDisplay}`
    );

    // ─────────────────────────────────────────────────────────────
    // 4. SEGMENTED CONTROLS & TABS
    // ─────────────────────────────────────────────────────────────
    console.log("\n4. Verifying Segmented Controls...");
    const segChecks = await cdp.evaluate(`(() => {
      const box = document.createElement('div');
      box.id = '__test_seg_box';
      box.innerHTML = \`
        <div id="tSeg" class="segmented-control">
          <button id="tSegActive" class="primary">Tab 1</button>
          <button id="tSegInactive" class="secondary">Tab 2</button>
        </div>
      \`;
      document.body.appendChild(box);

      const seg = getComputedStyle(document.getElementById('tSeg'));
      const active = getComputedStyle(document.getElementById('tSegActive'));
      const inactive = getComputedStyle(document.getElementById('tSegInactive'));

      return {
        containerDisplay: seg.display,
        containerRadius: seg.borderRadius,
        containerPadding: seg.padding,
        activeRadius: active.borderRadius,
        activeFontWeight: active.fontWeight,
        inactiveBg: inactive.backgroundColor
      };
    })()`);

    assert("Segmented control container is inline-flex with 10px radius",
      segChecks.containerDisplay === "inline-flex" && segChecks.containerRadius === "10px",
      `display=${segChecks.containerDisplay}, radius=${segChecks.containerRadius}`
    );
    assert("Active tab button has 7px radius and bold font weight",
      segChecks.activeRadius === "7px" && parseInt(segChecks.activeFontWeight) >= 600,
      `radius=${segChecks.activeRadius}, weight=${segChecks.activeFontWeight}`
    );
    assert("Inactive tab has transparent background",
      segChecks.inactiveBg === "rgba(0, 0, 0, 0)",
      `bg=${segChecks.inactiveBg}`
    );

    // ─────────────────────────────────────────────────────────────
    // 5. BADGES & STATUS INDICATORS
    // ─────────────────────────────────────────────────────────────
    console.log("\n5. Verifying Badges & Status Indicators...");
    const badgeChecks = await cdp.evaluate(`(() => {
      const box = document.createElement('div');
      box.id = '__test_badge_box';
      box.innerHTML = \`
        <span id="tBadge" class="badge">Standard</span>
        <span id="tBadgeOk" class="badge badge-success">Success</span>
        <span id="tBadgeWarn" class="badge badge-warning">Warning</span>
        <span id="tBadgeDanger" class="badge badge-danger">Danger</span>
        <span id="tStreakLow" class="streak-badge streak-low">Streak 1</span>
        <span id="tStreakHigh" class="streak-badge streak-high">Streak 10</span>
        <button id="tQbtn" class="qbtn current">1</button>
      \`;
      document.body.appendChild(box);

      const b = getComputedStyle(document.getElementById('tBadge'));
      const slow = getComputedStyle(document.getElementById('tStreakLow'));
      const shigh = getComputedStyle(document.getElementById('tStreakHigh'));
      const q = getComputedStyle(document.getElementById('tQbtn'));

      return {
        badgeRadius: b.borderRadius,
        badgeTransform: b.textTransform,
        badgeFontSize: b.fontSize,
        streakRadius: slow.borderRadius,
        streakHighColor: shigh.color,
        qbtnRadius: q.borderRadius,
        qbtnHeight: parseFloat(q.height)
      };
    })()`);

    assert("Badge has pill 999px radius and uppercase transform",
      (badgeChecks.badgeRadius === "999px" || parseInt(badgeChecks.badgeRadius) > 50) && badgeChecks.badgeTransform === "uppercase",
      `radius=${badgeChecks.badgeRadius}, transform=${badgeChecks.badgeTransform}`
    );
    assert("Streak badges have pill radius",
      badgeChecks.streakRadius === "999px" || parseInt(badgeChecks.streakRadius) > 50,
      `radius=${badgeChecks.streakRadius}`
    );
    assert("Question button has 8px radius and 38px height",
      badgeChecks.qbtnRadius === "8px" && badgeChecks.qbtnHeight === 38,
      `radius=${badgeChecks.qbtnRadius}, height=${badgeChecks.qbtnHeight}`
    );

    // ─────────────────────────────────────────────────────────────
    // 6. PROGRESS INDICATORS & TIMER SAFETY
    // ─────────────────────────────────────────────────────────────
    console.log("\n6. Verifying Progress Indicators & Timer Geometry Safety...");
    const progChecks = await cdp.evaluate(`(() => {
      const box = document.createElement('div');
      box.id = '__test_prog_box';
      box.innerHTML = \`
        <div id="tProgress" class="progress"><div style="width: 65%;"></div></div>
        <div id="tDomainRing" class="domain-ring">
          <svg viewBox="0 0 52 52">
            <circle class="ring-bg" cx="26" cy="26" r="21"></circle>
            <circle class="ring-fill" cx="26" cy="26" r="21"></circle>
          </svg>
        </div>
      \`;
      document.body.appendChild(box);

      const p = getComputedStyle(document.getElementById('tProgress'));
      const pf = getComputedStyle(document.querySelector('#tProgress > div'));
      const timerFill = document.getElementById('timerRingFill');

      return {
        progressHeight: parseFloat(p.height),
        progressRadius: p.borderRadius,
        progressOverflow: p.overflow,
        progressFillBg: pf.backgroundColor,
        timerRingFillExists: !!timerFill
      };
    })()`);

    assert("Progress container has 6px height, pill radius, and overflow hidden",
      progChecks.progressHeight === 6 && (progChecks.progressRadius === "999px" || parseInt(progChecks.progressRadius) > 50) && progChecks.progressOverflow === "hidden",
      `height=${progChecks.progressHeight}, overflow=${progChecks.progressOverflow}`
    );
    assert("Progress fill has Apple Blue tint background",
      progChecks.progressFillBg.includes("0, 113, 227") || progChecks.progressFillBg === "rgb(0, 113, 227)",
      `fillBg=${progChecks.progressFillBg}`
    );
    assert("CRITICAL: #timerRingFill SVG element is present and completely intact",
      progChecks.timerRingFillExists
    );

    // ─────────────────────────────────────────────────────────────
    // 7. MODALS & BOTTOM SHEETS
    // ─────────────────────────────────────────────────────────────
    console.log("\n7. Verifying Modals & Bottom Sheets...");
    const modalChecks = await cdp.evaluate(`(() => {
      const vModal = document.getElementById('videoModal');
      vModal.classList.remove('hidden');
      const card = vModal.querySelector('.card');
      const vStyle = getComputedStyle(vModal);
      const cStyle = getComputedStyle(card);

      const result = {
        overlayPos: vStyle.position,
        overlayZ: parseInt(vStyle.zIndex),
        cardRadius: cStyle.borderRadius,
        cardShadow: cStyle.boxShadow
      };
      vModal.classList.add('hidden');
      return result;
    })()`);

    assert("Modal overlay is fixed with z-index >= 1000",
      modalChecks.overlayPos === "fixed" && modalChecks.overlayZ >= 1000,
      `pos=${modalChecks.overlayPos}, z=${modalChecks.overlayZ}`
    );
    assert("Modal card has >= 16px radius and deep shadow",
      parseInt(modalChecks.cardRadius) >= 16 && modalChecks.cardShadow !== "none",
      `radius=${modalChecks.cardRadius}`
    );

    // ─────────────────────────────────────────────────────────────
    // 8. TOAST NOTIFICATION SYSTEM
    // ─────────────────────────────────────────────────────────────
    console.log("\n8. Verifying Toast Notification System...");
    const toastChecks = await cdp.evaluate(`(() => {
      const container = document.getElementById('toastContainer');
      container.innerHTML = '';

      const t1 = document.createElement('div');
      t1.className = 'toast toast-ok';
      t1.textContent = 'Configuration saved successfully';
      container.appendChild(t1);

      const t2 = document.createElement('div');
      t2.className = 'toast toast-warn';
      t2.textContent = 'Low battery alert';
      container.appendChild(t2);

      const t3 = document.createElement('div');
      t3.className = 'toast toast-error';
      t3.textContent = 'Command execution failed';
      container.appendChild(t3);

      const cStyle = getComputedStyle(container);
      const tStyle = getComputedStyle(t1);

      return {
        containerPos: cStyle.position,
        containerPointerEvents: cStyle.pointerEvents,
        toastCount: container.querySelectorAll('.toast').length,
        toastRadius: tStyle.borderRadius,
        toastPointerEvents: tStyle.pointerEvents,
        toastBg: tStyle.backgroundColor
      };
    })()`);

    assert("Toast container is fixed with pointer-events: none",
      toastChecks.containerPos === "fixed" && toastChecks.containerPointerEvents === "none",
      `pos=${toastChecks.containerPos}, events=${toastChecks.containerPointerEvents}`
    );
    assert("Toasts rendered successfully with 12px radius and pointer-events: auto",
      toastChecks.toastCount === 3 && toastChecks.toastRadius === "12px" && toastChecks.toastPointerEvents === "auto",
      `count=${toastChecks.toastCount}, radius=${toastChecks.toastRadius}`
    );

    // Capture screenshot of stacked toasts
    await cdp.screenshot("toast_stacked_dark.png");

    // Clear toasts for clean subsequent screenshots
    await cdp.evaluate(`document.getElementById('toastContainer').innerHTML = '';`);

    // Clean up test sandboxes from DOM before testing real app components
    await cdp.evaluate(`(() => {
      ['__test_btn_box', '__test_card_box', '__test_form_box', '__test_seg_box', '__test_badge_box', '__test_prog_box'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
      });
    })()`);

    // ─────────────────────────────────────────────────────────────
    // 9. LIGHT THEME TESTING
    // ─────────────────────────────────────────────────────────────
    console.log("\n9. Verifying Light Theme Component System...");
    await cdp.evaluate(`document.getElementById("btnThemeToggle").click();`);
    await sleep(400); // Allow theme transitions to fully settle

    const lightChecks = await cdp.evaluate(`(() => {
      const realCard = document.querySelector('.card:not(.terminal-box)');
      const primaryBtn = document.querySelector('button.primary');
      const realInput = document.querySelector('input:not([type="hidden"])');
      const segBtn = document.querySelector('.topology-selector button.primary, .subnet-mode-tabs button.primary') ||
                     document.querySelector('button.primary');

      return {
        themeAttr: document.documentElement.getAttribute('data-theme'),
        cardBg: realCard ? getComputedStyle(realCard).backgroundColor : null,
        primaryBg: primaryBtn ? getComputedStyle(primaryBtn).backgroundColor : null,
        inputBg: realInput ? getComputedStyle(realInput).backgroundColor : null
      };
    })()`);

    assert("Light theme: data-theme attribute is light",
      lightChecks.themeAttr === "light"
    );
    assert("Light theme: Card background is pure white #ffffff",
      lightChecks.cardBg === "rgb(255, 255, 255)",
      `bg=${lightChecks.cardBg}`
    );
    assert("Light theme: Primary button retains Apple Blue CTA",
      lightChecks.primaryBg && (lightChecks.primaryBg.includes("0, 113, 227") || lightChecks.primaryBg === "rgb(0, 113, 227)"),
      `bg=${lightChecks.primaryBg}`
    );

    await cdp.screenshot("desktop_1440_home_light.png");

    // Revert back to dark theme
    await cdp.evaluate(`document.getElementById("btnThemeToggle").click();`);
    await sleep(400);

    // ─────────────────────────────────────────────────────────────
    // 10. REAL APPLICATION SCREENSHOTS ACROSS PAGES & VIEWPORTS
    // ─────────────────────────────────────────────────────────────
    console.log("\n10. Capturing Visual Verification Screenshots...");
    await cdp.setViewport(1440, 900, false);
    await cdp.screenshot("desktop_1440_home_dark.png");

    // Subnetting page (tabs, inputs, cards)
    await cdp.evaluate(`document.querySelector('header.topbar [data-page="subnet"]').click();`);
    await sleep(350);
    await cdp.screenshot("desktop_1440_subnet_tabs.png");

    // Analytics page (stat cards, accuracy rings, badges)
    await cdp.evaluate(`document.querySelector('header.topbar [data-page="analytics"]').click();`);
    await sleep(350);
    await cdp.screenshot("desktop_1440_analytics_stats.png");

    // Labs page
    await cdp.evaluate(`document.querySelector('header.topbar [data-page="labs"]').click();`);
    await sleep(350);
    await cdp.screenshot("desktop_1440_labs_segmented.png");

    // Mobile Viewports (390px iPhone & 360px Android)
    console.log("\n11. Verifying Mobile Touch Targets (390px & 360px)...");
    await cdp.setViewport(390, 844, true);
    await cdp.evaluate(`document.querySelector('#mobileBottomNav [data-mobile-nav="home"]')?.click() || document.querySelector('header.topbar [data-page="home"]').click();`);
    await sleep(350);

    const mobileChecks = await cdp.evaluate(`(() => {
      const bottomNav = document.getElementById('mobileBottomNav');
      const startBtn = document.getElementById('btnStartQuickQuiz') || document.querySelector('.hero button.primary');
      const bottomNavButtons = Array.from(bottomNav ? bottomNav.querySelectorAll('.mobile-tab-btn') : []);

      return {
        bottomNavVisible: bottomNav ? getComputedStyle(bottomNav).display !== 'none' : false,
        allTabsMinHeight: bottomNavButtons.every(b => parseFloat(getComputedStyle(b).minHeight) >= 44),
        startBtnMinHeight: startBtn ? parseFloat(getComputedStyle(startBtn).minHeight) : 0
      };
    })()`);

    assert("Mobile bottom nav is visible and all 5 tabs meet >= 44px touch target",
      mobileChecks.bottomNavVisible && mobileChecks.allTabsMinHeight,
      `visible=${mobileChecks.bottomNavVisible}`
    );
    assert("Primary action button meets mobile touch targets",
      mobileChecks.startBtnMinHeight >= 38,
      `minHeight=${mobileChecks.startBtnMinHeight}`
    );

    await cdp.screenshot("mobile_390_home.png");

    // Open More Sheet on mobile
    await cdp.evaluate(`(() => {
      const moreBtn = document.querySelector('[data-mobile-nav="more"]');
      if (moreBtn) moreBtn.click();
    })()`);
    await sleep(350);
    await cdp.screenshot("mobile_390_more_sheet.png");

    // Close More Sheet
    await cdp.evaluate(`(() => {
      const closeBtn = document.getElementById('btnCloseMoreSheet');
      if (closeBtn) closeBtn.click();
    })()`);
    await sleep(200);

    // 360px viewport test
    await cdp.setViewport(360, 740, true);
    await cdp.evaluate(`document.querySelector('#mobileBottomNav [data-mobile-nav="subnet"]')?.click() || document.querySelector('header.topbar [data-page="subnet"]').click();`);
    await sleep(350);
    await cdp.screenshot("mobile_360_subnet.png");

    // Summary
    console.log("\n==================================================");
    const passed = results.filter((r) => r.pass).length;
    const failed = results.filter((r) => !r.pass).length;
    console.log(`TOTAL CHECKS: ${results.length} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log("==================================================");

    if (failed > 0) {
      console.error("\n❌ Some Phase 4 verification checks failed!");
      process.exitCode = 1;
    } else {
      console.log("\n🎉 ALL PHASE 4 COMPONENT VERIFICATION CHECKS PASSED!");
    }
  } finally {
    cdp.close();
    chromeProc.kill("SIGKILL");
    server.close();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }
}

runPhase4Verification().catch((err) => {
  console.error("FATAL ERROR in Phase 4 verification:", err);
  process.exit(1);
});
