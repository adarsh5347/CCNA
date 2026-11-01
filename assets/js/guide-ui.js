import { studyGuide, getChapterById } from "./guide/index.js?v=77";
import { state, byId, safeHTML, showToast } from "./core.js?v=77";
import { startChapterSession, ensureBank } from "./quiz-engine.js?v=79";

let currentChapterId = "v1c01";
let currentVolumeFilter = "all"; // "all" | "1" | "2"
let currentDomainFilter = "all";
let currentSearchQuery = "";
let currentHubTab = "chapters"; // "chapters" | "commands" | "glossary"

function getChapterStats(chapterId) {
  const chStats = (state.analytics && state.analytics.chapter && state.analytics.chapter[chapterId]) || { total: 0, correct: 0 };
  const acc = chStats.total > 0 ? Math.round((chStats.correct / chStats.total) * 100) : null;
  ensureBank();
  const qCount = state.bank ? state.bank.filter((q) => q.chapter === chapterId).length : 0;
  return { total: chStats.total, correct: chStats.correct, acc, qCount };
}

function formatInlineCode(str) {
  return safeHTML(str).replace(/`([^`]+)`/g, "<code>$1</code>");
}

function getFilteredChapters() {
  const q = currentSearchQuery.trim().toLowerCase();
  return studyGuide.filter((ch) => {
    if (currentVolumeFilter !== "all" && String(ch.volume) !== currentVolumeFilter) return false;
    if (currentDomainFilter !== "all" && ch.domain !== currentDomainFilter) return false;
    if (!q) return true;
    if (ch.title.toLowerCase().includes(q) || ch.id.toLowerCase().includes(q) || ch.summary.toLowerCase().includes(q)) return true;
    if ((ch.keyPoints || []).some((kp) => kp.toLowerCase().includes(q))) return true;
    if ((ch.keyTerms || []).some((kt) => kt.term.toLowerCase().includes(q) || kt.def.toLowerCase().includes(q))) return true;
    if ((ch.commands || []).some((c) => c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q))) return true;
    return false;
  });
}

export function renderGuideSummaryBanner() {
  const totalChapters = studyGuide.length;
  const totalCommands = studyGuide.reduce((s, c) => s + (c.commands ? c.commands.length : 0), 0);
  const totalTerms = studyGuide.reduce((s, c) => s + (c.keyTerms ? c.keyTerms.length : 0), 0);
  const chMap = (state.analytics && state.analytics.chapter) || {};
  const practicedCount = studyGuide.filter((c) => chMap[c.id] && chMap[c.id].total > 0).length;
  const masteredCount = studyGuide.filter((c) => chMap[c.id] && chMap[c.id].total >= 3 && (chMap[c.id].correct / chMap[c.id].total) >= 0.8).length;

  const elChapters = byId("guideStatChapters");
  const elPracticed = byId("guideStatPracticed");
  const elCommands = byId("guideStatCommands");
  const elTerms = byId("guideStatTerms");

  if (elChapters) elChapters.textContent = `${totalChapters} (Vol 1 & 2)`;
  if (elPracticed) elPracticed.textContent = `${practicedCount} / ${totalChapters} (${masteredCount} Mastered)`;
  if (elCommands) elCommands.textContent = `${totalCommands}+ IOS Commands`;
  if (elTerms) elTerms.textContent = `${totalTerms}+ Key Terms`;
}

export function renderChapterSidebar() {
  const listEl = byId("guideChapterList");
  if (!listEl) return;

  const filtered = getFilteredChapters();
  if (filtered.length === 0) {
    listEl.innerHTML = `<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:12.5px;">No chapters match your search/filter.</div>`;
    return;
  }

  // Ensure currentChapterId is valid; if not in filtered list, keep it or select first filtered
  if (!filtered.some((c) => c.id === currentChapterId)) {
    currentChapterId = filtered[0].id;
  }

  const mobileSelect = byId("guideMobileChapterSelect");
  if (mobileSelect) {
    mobileSelect.innerHTML = filtered
      .map(
        (ch) =>
          `<option value="${safeHTML(ch.id)}" ${ch.id === currentChapterId ? "selected" : ""}>Vol ${ch.volume} Ch ${ch.chapter}: ${safeHTML(ch.title)}</option>`
      )
      .join("");
  }

  listEl.innerHTML = filtered.map((ch) => {
    const active = ch.id === currentChapterId;
    const stats = getChapterStats(ch.id);
    let badgeHtml = `<span style="font-size:10px;color:var(--text-muted);font-family:var(--font-mono);">${stats.qCount} Qs</span>`;
    if (stats.acc !== null) {
      const color = stats.acc >= 80 ? "#10b981" : stats.acc >= 60 ? "#f59e0b" : "#ef4444";
      badgeHtml = `<span style="font-size:10px;font-weight:700;color:${color};font-family:var(--font-mono);">${stats.acc}%</span>`;
    }
    return `
      <button class="guide-ch-item${active ? " active" : ""}" data-ch-id="${safeHTML(ch.id)}" style="width:100%;text-align:left;padding:10px 12px;border-radius:8px;border:1px solid ${active ? "#00f2fe" : "rgba(255,255,255,0.06)"};background:${active ? "rgba(0,242,254,0.1)" : "rgba(6,9,19,0.45)"};cursor:pointer;display:flex;flex-direction:column;gap:4px;transition:all 0.2s;">
        <div style="display:flex;justify-content:space-between;align-items:center;width:100%;gap:6px;">
          <span style="font-family:var(--font-mono);font-size:10.5px;font-weight:700;color:${ch.volume === 1 ? "#00f2fe" : "#a855f7"};text-transform:uppercase;">Vol ${ch.volume} · Ch ${ch.chapter}</span>
          ${badgeHtml}
        </div>
        <div style="font-size:12.5px;font-weight:600;color:#f8fafc;line-height:1.35;">${safeHTML(ch.title)}</div>
        <div style="font-size:10.5px;color:var(--text-muted);">${safeHTML(ch.domain)}</div>
      </button>
    `;
  }).join("");

  listEl.querySelectorAll("[data-ch-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentChapterId = btn.dataset.chId;
      if (window.innerWidth <= 768) {
        listEl.classList.remove("mobile-toc-expanded");
        const tocBtn = byId("btnToggleMobileToc");
        if (tocBtn) tocBtn.textContent = "📑 Show All 48 Chapters";
      }
      renderChapterSidebar();
      renderChapterDetail();
      const readerEl = byId("guideReaderPanel");
      if (readerEl) readerEl.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

export function renderChapterDetail() {
  const panel = byId("guideReaderPanel");
  if (!panel) return;

  const ch = getChapterById(currentChapterId) || studyGuide[0];
  if (!ch) return;

  const stats = getChapterStats(ch.id);
  const idx = studyGuide.findIndex((x) => x.id === ch.id);
  const prevCh = idx > 0 ? studyGuide[idx - 1] : null;
  const nextCh = idx >= 0 && idx < studyGuide.length - 1 ? studyGuide[idx + 1] : null;

  let masteryBadge = `<span class="badge" style="background:rgba(148,163,184,0.12);color:#94a3b8;border-color:rgba(148,163,184,0.3);">Not Practiced Yet</span>`;
  if (stats.acc !== null) {
    const color = stats.acc >= 80 ? "#10b981" : stats.acc >= 60 ? "#f59e0b" : "#ef4444";
    const statusText = stats.acc >= 80 ? "Mastered" : stats.acc >= 60 ? "In Progress" : "Needs Review";
    masteryBadge = `<span class="badge" style="color:${color};border-color:${color};background:rgba(0,0,0,0.3);">🎯 ${statusText}: ${stats.acc}% (${stats.correct}/${stats.total} solved)</span>`;
  }

  const examTopicsHtml = (ch.examTopics || []).map((t) => `
    <span class="badge" style="background:rgba(0,242,254,0.06);border-color:rgba(0,242,254,0.25);color:#e2e8f0;font-size:11.5px;padding:4px 10px;">✔ ${safeHTML(t)}</span>
  `).join("");

  const keyPointsHtml = (ch.keyPoints || []).map((kp, i) => `
    <div style="display:flex;gap:12px;align-items:flex-start;padding:12px 14px;background:rgba(6,9,19,0.5);border:1px solid rgba(255,255,255,0.06);border-left:3px solid #00f2fe;border-radius:8px;">
      <span style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:#00f2fe;background:rgba(0,242,254,0.1);padding:2px 7px;border-radius:4px;flex-shrink:0;margin-top:1px;">${String(i + 1).padStart(2, "0")}</span>
      <p style="margin:0;font-size:13.5px;line-height:1.6;color:#e2e8f0;">${formatInlineCode(kp)}</p>
    </div>
  `).join("");

  const commandsHtml = (ch.commands && ch.commands.length > 0)
    ? `
      <div style="margin-top:24px;">
        <h4 style="font-size:15px;color:#10b981;margin:0 0 12px 0;display:flex;align-items:center;gap:8px;">💻 Cisco IOS CLI Commands &amp; Verification (${ch.commands.length})</h4>
        <div style="overflow-x:auto;border:1px solid rgba(16,185,129,0.25);border-radius:10px;background:rgba(6,9,19,0.65);">
          <table style="width:100%;border-collapse:collapse;font-size:12.5px;">
            <thead>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.08);text-align:left;background:rgba(16,185,129,0.08);">
                <th style="padding:10px 12px;color:#10b981;font-family:var(--font-mono);">Command Syntax</th>
                <th style="padding:10px 12px;color:#94a3b8;width:95px;">Mode</th>
                <th style="padding:10px 12px;color:#e2e8f0;">Purpose / Description</th>
                <th style="padding:10px 12px;width:68px;text-align:right;">Copy</th>
              </tr>
            </thead>
            <tbody>
              ${ch.commands.map((c) => `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                  <td style="padding:10px 12px;font-family:var(--font-mono);color:#34d399;font-weight:600;">${safeHTML(c.cmd)}</td>
                  <td style="padding:10px 12px;"><span class="badge" style="font-size:10px;padding:2px 6px;margin:0;">${safeHTML(c.mode || "ios")}</span></td>
                  <td style="padding:10px 12px;color:#cbd5e1;line-height:1.45;">${formatInlineCode(c.desc)}</td>
                  <td style="padding:10px 12px;text-align:right;">
                    <button class="ghost btn-copy-cmd" data-cmd="${safeHTML(c.cmd)}" style="padding:4px 8px;font-size:11px;border:1px solid rgba(255,255,255,0.12);">Copy</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `
    : `
      <div style="margin-top:24px;padding:14px;border-radius:8px;background:rgba(255,255,255,0.03);border:1px dashed rgba(255,255,255,0.12);font-size:12.5px;color:var(--text-muted);">
        ℹ️ This chapter focuses on architectural and mathematical foundations rather than device-specific CLI commands.
      </div>
    `;

  const termsHtml = (ch.keyTerms || []).map((kt) => `
    <div style="padding:12px 14px;border-radius:8px;background:rgba(13,19,36,0.7);border:1px solid rgba(255,255,255,0.07);">
      <div style="font-weight:700;color:#38bdf8;font-size:13px;margin-bottom:4px;">${safeHTML(kt.term)}</div>
      <div style="font-size:12.5px;color:#cbd5e1;line-height:1.5;">${formatInlineCode(kt.def)}</div>
    </div>
  `).join("");

  const tipsHtml = (ch.tips || []).map((tip) => `
    <div style="padding:12px 14px;border-radius:8px;background:rgba(245,158,11,0.07);border:1px solid rgba(245,158,11,0.3);display:flex;gap:10px;align-items:flex-start;">
      <span style="font-size:16px;line-height:1.2;">⚠️</span>
      <div style="font-size:13px;color:#fde68a;line-height:1.55;">${formatInlineCode(tip)}</div>
    </div>
  `).join("");

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;border-bottom:1px solid var(--border-color);padding-bottom:18px;margin-bottom:20px;">
      <div style="flex:1;min-width:260px;">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
          <span class="badge" style="background:rgba(0,242,254,0.12);border-color:#00f2fe;color:#00f2fe;font-weight:700;">Official Cert Guide · Volume ${ch.volume} · Chapter ${ch.chapter}</span>
          <span class="badge">${safeHTML(ch.domain)}</span>
          <span class="badge" style="color:var(--text-muted);">📄 Pages ${safeHTML(ch.pages)}</span>
          ${masteryBadge}
        </div>
        <h3 style="font-size:24px;margin:0 0 8px 0;color:#fff;">${safeHTML(ch.title)}</h3>
        <p style="margin:0;font-size:13.5px;line-height:1.65;color:#cbd5e1;">${formatInlineCode(ch.summary)}</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end;">
        <button id="btnPracticeChapter" class="primary magnetic-btn" style="padding:10px 18px;font-size:13px;white-space:nowrap;">
          ⚡ Practice This Chapter (${stats.qCount} Qs)
        </button>
      </div>
    </div>

    <div style="margin-bottom:22px;">
      <h4 style="font-size:12px;text-transform:uppercase;letter-spacing:0.6px;color:var(--text-muted);margin:0 0 8px 0;">Cisco 200-301 Exam Blueprint Objectives</h4>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">${examTopicsHtml}</div>
    </div>

    <div style="margin-bottom:24px;">
      <h4 style="font-size:15px;color:#00f2fe;margin:0 0 12px 0;">📌 Core Concepts &amp; Technical Deep Dive (${(ch.keyPoints || []).length} Key Points)</h4>
      <div style="display:flex;flex-direction:column;gap:10px;">${keyPointsHtml}</div>
    </div>

    ${commandsHtml}

    <div style="margin-top:24px;">
      <h4 style="font-size:15px;color:#f59e0b;margin:0 0 12px 0;">🎯 Exam Tips, Traps &amp; Rapid Mnemonics</h4>
      <div style="display:flex;flex-direction:column;gap:10px;">${tipsHtml}</div>
    </div>

    <div style="margin-top:24px;">
      <h4 style="font-size:15px;color:#38bdf8;margin:0 0 12px 0;">🔤 Chapter Key Terms Glossary (${(ch.keyTerms || []).length} Terms)</h4>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;">${termsHtml}</div>
    </div>

    <div style="margin-top:28px;padding-top:18px;border-top:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
      <div>
        ${prevCh ? `<button class="secondary" id="btnPrevCh" style="font-size:12.5px;padding:8px 14px;">⬅️ Vol ${prevCh.volume} Ch ${prevCh.chapter}: ${safeHTML(prevCh.title)}</button>` : ""}
      </div>
      <button class="primary" id="btnPracticeChapterBottom" style="font-size:12.5px;padding:8px 18px;">⚡ Drill Chapter ${ch.chapter} Questions (${stats.qCount} Qs)</button>
      <div>
        ${nextCh ? `<button class="secondary" id="btnNextCh" style="font-size:12.5px;padding:8px 14px;">Vol ${nextCh.volume} Ch ${nextCh.chapter}: ${safeHTML(nextCh.title)} ➡️</button>` : ""}
      </div>
    </div>
  `;

  const launchDrill = () => startChapterSession(ch.id, ch.title);
  const btnTop = byId("btnPracticeChapter");
  const btnBot = byId("btnPracticeChapterBottom");
  if (btnTop) btnTop.addEventListener("click", launchDrill);
  if (btnBot) btnBot.addEventListener("click", launchDrill);

  const btnPrev = byId("btnPrevCh");
  if (btnPrev && prevCh) {
    btnPrev.addEventListener("click", () => {
      currentChapterId = prevCh.id;
      renderChapterSidebar();
      renderChapterDetail();
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
  const btnNext = byId("btnNextCh");
  if (btnNext && nextCh) {
    btnNext.addEventListener("click", () => {
      currentChapterId = nextCh.id;
      renderChapterSidebar();
      renderChapterDetail();
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  panel.querySelectorAll(".btn-copy-cmd").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cmd = btn.dataset.cmd || "";
      if (navigator.clipboard) {
        navigator.clipboard.writeText(cmd).then(() => showToast(`Copied: ${cmd}`, "ok", 1800));
      }
    });
  });
}

export function renderGlobalCommandsExplorer() {
  const container = byId("guideCommandsView");
  if (!container) return;

  const q = currentSearchQuery.trim().toLowerCase();
  const rows = [];
  for (const ch of studyGuide) {
    if (currentVolumeFilter !== "all" && String(ch.volume) !== currentVolumeFilter) continue;
    if (currentDomainFilter !== "all" && ch.domain !== currentDomainFilter) continue;
    for (const c of ch.commands || []) {
      if (q && !c.cmd.toLowerCase().includes(q) && !c.desc.toLowerCase().includes(q) && !ch.title.toLowerCase().includes(q)) continue;
      rows.push({ ch, c });
    }
  }

  container.innerHTML = `
    <div style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
      <strong style="color:#10b981;font-size:14px;">Showing ${rows.length} Cisco IOS &amp; Host CLI Commands</strong>
      <span style="font-size:12px;color:var(--text-muted);">Click any chapter badge to open that chapter's full study guide</span>
    </div>
    <div style="overflow-x:auto;border:1px solid rgba(16,185,129,0.25);border-radius:10px;background:rgba(6,9,19,0.65);">
      <table style="width:100%;border-collapse:collapse;font-size:12.5px;">
        <thead>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.08);text-align:left;background:rgba(16,185,129,0.08);">
            <th style="padding:10px 12px;color:#00f2fe;width:110px;">Chapter</th>
            <th style="padding:10px 12px;color:#10b981;font-family:var(--font-mono);">Command Syntax</th>
            <th style="padding:10px 12px;color:#94a3b8;width:95px;">Mode</th>
            <th style="padding:10px 12px;color:#e2e8f0;">Description</th>
            <th style="padding:10px 12px;width:68px;text-align:right;">Copy</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(({ ch, c }) => `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
              <td style="padding:10px 12px;">
                <button class="ghost" data-open-ch="${safeHTML(ch.id)}" style="padding:3px 8px;font-size:11px;border:1px solid rgba(0,242,254,0.3);color:#00f2fe;">V${ch.volume} Ch${ch.chapter}</button>
              </td>
              <td style="padding:10px 12px;font-family:var(--font-mono);color:#34d399;font-weight:600;">${safeHTML(c.cmd)}</td>
              <td style="padding:10px 12px;"><span class="badge" style="font-size:10px;padding:2px 6px;margin:0;">${safeHTML(c.mode || "ios")}</span></td>
              <td style="padding:10px 12px;color:#cbd5e1;line-height:1.45;">${formatInlineCode(c.desc)}</td>
              <td style="padding:10px 12px;text-align:right;">
                <button class="ghost btn-copy-cmd" data-cmd="${safeHTML(c.cmd)}" style="padding:4px 8px;font-size:11px;border:1px solid rgba(255,255,255,0.12);">Copy</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;

  container.querySelectorAll("[data-open-ch]").forEach((btn) => {
    btn.addEventListener("click", () => openGuideChapter(btn.dataset.openCh));
  });
  container.querySelectorAll(".btn-copy-cmd").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cmd = btn.dataset.cmd || "";
      if (navigator.clipboard) {
        navigator.clipboard.writeText(cmd).then(() => showToast(`Copied: ${cmd}`, "ok", 1800));
      }
    });
  });
}

export function renderGlobalGlossaryExplorer() {
  const container = byId("guideGlossaryView");
  if (!container) return;

  const q = currentSearchQuery.trim().toLowerCase();
  const terms = [];
  for (const ch of studyGuide) {
    if (currentVolumeFilter !== "all" && String(ch.volume) !== currentVolumeFilter) continue;
    if (currentDomainFilter !== "all" && ch.domain !== currentDomainFilter) continue;
    for (const kt of ch.keyTerms || []) {
      if (q && !kt.term.toLowerCase().includes(q) && !kt.def.toLowerCase().includes(q) && !ch.title.toLowerCase().includes(q)) continue;
      terms.push({ ch, kt });
    }
  }
  terms.sort((a, b) => a.kt.term.localeCompare(b.kt.term));

  container.innerHTML = `
    <div style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
      <strong style="color:#38bdf8;font-size:14px;">Showing ${terms.length} Official Cert Guide Key Terms (A–Z)</strong>
      <span style="font-size:12px;color:var(--text-muted);">Click any chapter badge to jump to that chapter</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:12px;">
      ${terms.map(({ ch, kt }) => `
        <div style="padding:14px;border-radius:10px;background:rgba(13,19,36,0.75);border:1px solid rgba(255,255,255,0.07);display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;">
              <strong style="color:#38bdf8;font-size:13.5px;">${safeHTML(kt.term)}</strong>
              <button class="ghost" data-open-ch="${safeHTML(ch.id)}" style="padding:2px 7px;font-size:10px;border:1px solid rgba(0,242,254,0.3);color:#00f2fe;flex-shrink:0;">V${ch.volume} Ch${ch.chapter}</button>
            </div>
            <p style="margin:0;font-size:12.5px;color:#cbd5e1;line-height:1.5;">${formatInlineCode(kt.def)}</p>
          </div>
        </div>
      `).join("")}
    </div>
  `;

  container.querySelectorAll("[data-open-ch]").forEach((btn) => {
    btn.addEventListener("click", () => openGuideChapter(btn.dataset.openCh));
  });
}

function updateGuideViewVisibility() {
  const chView = byId("guideChaptersShell");
  const cmdView = byId("guideCommandsView");
  const glView = byId("guideGlossaryView");

  if (chView) chView.style.display = currentHubTab === "chapters" ? "grid" : "none";
  if (cmdView) cmdView.style.display = currentHubTab === "commands" ? "block" : "none";
  if (glView) glView.style.display = currentHubTab === "glossary" ? "block" : "none";

  document.querySelectorAll("[data-guide-tab]").forEach((btn) => {
    const active = btn.dataset.guideTab === currentHubTab;
    btn.className = active ? "primary" : "secondary";
  });

  if (currentHubTab === "chapters") {
    renderChapterSidebar();
    renderChapterDetail();
  } else if (currentHubTab === "commands") {
    renderGlobalCommandsExplorer();
  } else {
    renderGlobalGlossaryExplorer();
  }
}

export function openGuideChapter(chapterId) {
  const ch = getChapterById(chapterId);
  if (!ch) return;
  currentChapterId = chapterId;
  currentVolumeFilter = "all";
  currentDomainFilter = "all";
  currentSearchQuery = "";
  currentHubTab = "chapters";
  const searchInput = byId("guideSearchInput");
  if (searchInput) searchInput.value = "";
  const volSelect = byId("guideVolumeFilter");
  if (volSelect) volSelect.value = "all";
  const domSelect = byId("guideDomainFilter");
  if (domSelect) domSelect.value = "all";

  if (window.setPage) window.setPage("guide");
  updateGuideViewVisibility();
}

let _guideBound = false;
export function initStudyGuide() {
  renderGuideSummaryBanner();
  if (!_guideBound) {
    _guideBound = true;
    const searchInput = byId("guideSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        currentSearchQuery = searchInput.value || "";
        updateGuideViewVisibility();
      });
    }
    const volSelect = byId("guideVolumeFilter");
    if (volSelect) {
      volSelect.addEventListener("change", () => {
        currentVolumeFilter = volSelect.value;
        updateGuideViewVisibility();
      });
    }
    const domSelect = byId("guideDomainFilter");
    if (domSelect) {
      domSelect.addEventListener("change", () => {
        currentDomainFilter = domSelect.value;
        updateGuideViewVisibility();
      });
    }
    document.querySelectorAll("[data-guide-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentHubTab = btn.dataset.guideTab;
        updateGuideViewVisibility();
      });
    });
    const mobileSelect = byId("guideMobileChapterSelect");
    if (mobileSelect) {
      mobileSelect.addEventListener("change", () => {
        currentChapterId = mobileSelect.value;
        renderChapterSidebar();
        renderChapterDetail();
        const readerEl = byId("guideReaderPanel");
        if (readerEl) readerEl.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    const tocBtn = byId("btnToggleMobileToc");
    if (tocBtn) {
      tocBtn.addEventListener("click", () => {
        const listEl = byId("guideChapterList");
        if (!listEl) return;
        const expanded = listEl.classList.toggle("mobile-toc-expanded");
        tocBtn.textContent = expanded ? "📑 Hide Chapter List" : "📑 Show All 48 Chapters";
      });
    }
  }
  updateGuideViewVisibility();
}

window.openGuideChapter = openGuideChapter;
