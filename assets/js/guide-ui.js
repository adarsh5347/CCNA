import { studyGuide, getChapterById } from "./guide/index.js?v=77";
import { state, byId, safeHTML, showToast } from "./core.js?v=78";
import { startChapterSession, ensureBank } from "./quiz-engine.js?v=83";

let currentChapterId = "v1c01";
let currentVolumeFilter = "all"; // "all" | "1" | "2"
let currentDomainFilter = "all";
let currentSearchQuery = "";
let currentHubTab = "chapters"; // "chapters" | "commands" | "glossary"
let currentCommandModeFilter = "all";
let currentGlossaryLetter = "all";

let chapterTermViewMode = "grid"; // "grid" | "flashcards"
let chapterFlashIndex = 0;
let chapterFlashFlipped = false;

const DOMAIN_SLUGS = {
  "Network Fundamentals": "fundamentals",
  "Network Access": "access",
  "IP Connectivity": "connectivity",
  "IP Services": "services",
  "Security Fundamentals": "security",
  "Automation and Programmability": "automation"
};

function getDomainSlug(domain) {
  return DOMAIN_SLUGS[domain] || "fundamentals";
}

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

function bindCopyButtons(rootEl) {
  if (!rootEl) return;
  rootEl.querySelectorAll(".btn-copy-cmd").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cmd = btn.dataset.cmd || "";
      const original = btn.textContent;
      const done = () => {
        btn.textContent = "Copied";
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove("copied");
        }, 1400);
        showToast(`Copied: ${cmd}`, "ok", 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(cmd).then(done).catch(() => showToast(`Command: ${cmd}`, "info", 2000));
      } else {
        showToast(`Command: ${cmd}`, "info", 2000);
      }
    });
  });
}

export function renderGuideSummaryBanner() {
  const totalChapters = studyGuide.length;
  const totalCommands = studyGuide.reduce((s, c) => s + (c.commands ? c.commands.length : 0), 0);
  const totalTerms = studyGuide.reduce((s, c) => s + (c.keyTerms ? c.keyTerms.length : 0), 0);
  const chMap = (state.analytics && state.analytics.chapter) || {};
  const practicedCount = studyGuide.filter((c) => chMap[c.id] && chMap[c.id].total > 0).length;
  const masteredCount = studyGuide.filter((c) => chMap[c.id] && chMap[c.id].total >= 3 && (chMap[c.id].correct / chMap[c.id].total) >= 0.8).length;
  const practicedPct = totalChapters > 0 ? Math.round((practicedCount / totalChapters) * 100) : 0;

  const elChapters = byId("guideStatChapters");
  const elPracticed = byId("guideStatPracticed");
  const elCommands = byId("guideStatCommands");
  const elTerms = byId("guideStatTerms");
  const elFill = byId("guideMasteryBarFill");
  const elMeta = byId("guideHeroProgressMeta");

  if (elChapters) elChapters.textContent = `${totalChapters} (Vol 1 & 2)`;
  if (elPracticed) elPracticed.textContent = `${practicedCount} / ${totalChapters} (${masteredCount} Mastered)`;
  if (elCommands) elCommands.textContent = `${totalCommands}+ IOS Commands`;
  if (elTerms) elTerms.textContent = `${totalTerms}+ Key Terms`;
  if (elFill) elFill.style.width = `${practicedPct}%`;
  if (elMeta) elMeta.textContent = `${practicedPct}% chapters practiced · ${masteredCount} mastered`;
}

function renderSidebarItem(ch) {
  const active = ch.id === currentChapterId;
  const stats = getChapterStats(ch.id);
  const domainSlug = getDomainSlug(ch.domain);

  let badgeClass = "guide-ch-badge neutral";
  let badgeText = `${stats.qCount} Qs`;
  if (stats.acc !== null) {
    if (stats.acc >= 80) badgeClass = "guide-ch-badge mastered";
    else if (stats.acc >= 60) badgeClass = "guide-ch-badge progress";
    else badgeClass = "guide-ch-badge review";
    badgeText = `${stats.acc}%`;
  }

  return `
    <button type="button" class="guide-ch-item${active ? " active" : ""}" data-ch-id="${safeHTML(ch.id)}" data-domain-accent="${domainSlug}" aria-current="${active ? "true" : "false"}">
      <div class="guide-ch-item-top">
        <span class="guide-ch-vol">Vol ${ch.volume} · Ch ${String(ch.chapter).padStart(2, "0")}</span>
        <span class="${badgeClass}">${badgeText}</span>
      </div>
      <div class="guide-ch-title">${safeHTML(ch.title)}</div>
      <div class="guide-ch-domain">${safeHTML(ch.domain)}</div>
    </button>
  `;
}

export function renderChapterSidebar() {
  const listEl = byId("guideChapterList");
  const countEl = byId("guideSidebarCount");
  if (!listEl) return;

  const filtered = getFilteredChapters();
  if (countEl) {
    countEl.textContent = `${filtered.length} Chapter${filtered.length === 1 ? "" : "s"}`;
  }

  if (filtered.length === 0) {
    listEl.innerHTML = `<div class="guide-empty-state">No chapters match your search or filter.</div>`;
    return;
  }

  if (!filtered.some((c) => c.id === currentChapterId)) {
    currentChapterId = filtered[0].id;
    chapterFlashIndex = 0;
    chapterFlashFlipped = false;
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

  const vol1 = filtered.filter((ch) => ch.volume === 1);
  const vol2 = filtered.filter((ch) => ch.volume === 2);

  let html = "";
  if (vol1.length > 0) {
    html += `<div class="guide-vol-group-header"><span>Volume 1</span><span>${vol1.length} chapters</span></div>`;
    html += vol1.map(renderSidebarItem).join("");
  }
  if (vol2.length > 0) {
    html += `<div class="guide-vol-group-header"><span>Volume 2</span><span>${vol2.length} chapters</span></div>`;
    html += vol2.map(renderSidebarItem).join("");
  }
  listEl.innerHTML = html;

  listEl.querySelectorAll("[data-ch-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (currentChapterId !== btn.dataset.chId) {
        currentChapterId = btn.dataset.chId;
        chapterFlashIndex = 0;
        chapterFlashFlipped = false;
      }
      if (window.innerWidth <= 768) {
        listEl.classList.remove("mobile-toc-expanded");
        const tocBtn = byId("btnToggleMobileToc");
        if (tocBtn) {
          tocBtn.textContent = "Show All 48 Chapters";
          tocBtn.setAttribute("aria-expanded", "false");
        }
      }
      renderChapterSidebar();
      renderChapterDetail();
      const readerEl = byId("guideReaderPanel");
      if (readerEl) readerEl.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function renderChapterKeyTermsSection(ch) {
  const terms = ch.keyTerms || [];
  if (terms.length === 0) {
    return `<div class="guide-empty-state">No standalone glossary terms recorded for this chapter.</div>`;
  }

  if (chapterTermViewMode === "flashcards") {
    const safeIdx = Math.max(0, Math.min(chapterFlashIndex, terms.length - 1));
    const current = terms[safeIdx];
    const pct = Math.round(((safeIdx + 1) / terms.length) * 100);
    return `
      <div class="guide-flashcard-deck">
        <div class="guide-flashcard-top">
          <span class="guide-flashcard-counter">Card ${safeIdx + 1} of ${terms.length}</span>
          <div class="guide-flashcard-track"><div style="width:${pct}%"></div></div>
        </div>
        <button type="button" id="guideChapterFlashcard" class="guide-flashcard-card${chapterFlashFlipped ? " flipped" : ""}" aria-pressed="${chapterFlashFlipped ? "true" : "false"}">
          <span class="guide-flashcard-side-label">${chapterFlashFlipped ? "Definition" : "Key Term"}</span>
          <div class="guide-flashcard-content">${chapterFlashFlipped ? formatInlineCode(current.def) : safeHTML(current.term)}</div>
          <span class="guide-flashcard-hint">${chapterFlashFlipped ? "Click to show term" : "Click to reveal definition"}</span>
        </button>
        <div class="guide-flashcard-controls">
          <button type="button" id="btnGuideFlashPrev" class="secondary"${safeIdx === 0 ? " disabled" : ""}>Previous Card</button>
          <button type="button" id="btnGuideFlashFlip" class="primary">${chapterFlashFlipped ? "Show Term" : "Reveal Definition"}</button>
          <button type="button" id="btnGuideFlashNext" class="secondary"${safeIdx >= terms.length - 1 ? " disabled" : ""}>Next Card</button>
        </div>
      </div>
    `;
  }

  return `
    <div class="guide-terms-grid">
      ${terms.map((kt) => `
        <div class="guide-term-card">
          <div class="guide-term-title">${safeHTML(kt.term)}</div>
          <div class="guide-term-def">${formatInlineCode(kt.def)}</div>
        </div>
      `).join("")}
    </div>
  `;
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
  const chapterPct = Math.round(((idx + 1) / studyGuide.length) * 100);
  const domainSlug = getDomainSlug(ch.domain);

  let masteryBadge = `<span class="guide-status-pill neutral">Not Practiced Yet</span>`;
  if (stats.acc !== null) {
    const statusClass = stats.acc >= 80 ? "mastered" : stats.acc >= 60 ? "progress" : "review";
    const statusText = stats.acc >= 80 ? "Mastered" : stats.acc >= 60 ? "In Progress" : "Needs Review";
    masteryBadge = `<span class="guide-status-pill ${statusClass}">${statusText}: ${stats.acc}% (${stats.correct}/${stats.total} solved)</span>`;
  }

  const examTopicsHtml = (ch.examTopics || []).map((t) => `
    <span class="guide-topic-badge">${safeHTML(t)}</span>
  `).join("");

  const keyPointsHtml = (ch.keyPoints || []).map((kp, i) => `
    <div class="guide-kp-item">
      <span class="guide-kp-num">${String(i + 1).padStart(2, "0")}</span>
      <p class="guide-kp-text">${formatInlineCode(kp)}</p>
    </div>
  `).join("");

  const commandsHtml = (ch.commands && ch.commands.length > 0)
    ? `
      <section class="guide-section">
        <div class="guide-section-header">
          <h4 class="guide-section-title">Cisco IOS CLI Commands &amp; Verification</h4>
          <span class="guide-section-count">${ch.commands.length} command${ch.commands.length === 1 ? "" : "s"}</span>
        </div>
        <div class="guide-cmd-table-wrap">
          <div class="guide-terminal-chrome">
            <div class="guide-terminal-dots" aria-hidden="true"><span></span><span></span><span></span></div>
            <span class="guide-terminal-label">IOS-XE CLI Reference · Ch ${ch.chapter}</span>
          </div>
          <table class="guide-cmd-table">
            <thead>
              <tr>
                <th>Command Syntax</th>
                <th>Mode</th>
                <th>Purpose / Description</th>
                <th class="guide-cmd-copy-col">Copy</th>
              </tr>
            </thead>
            <tbody>
              ${ch.commands.map((c) => `
                <tr>
                  <td class="guide-cmd-syntax"><code>${safeHTML(c.cmd)}</code></td>
                  <td><span class="guide-mode-pill">${safeHTML(c.mode || "ios")}</span></td>
                  <td class="guide-cmd-desc">${formatInlineCode(c.desc)}</td>
                  <td class="guide-cmd-copy-col">
                    <button type="button" class="ghost btn-copy-cmd" data-cmd="${safeHTML(c.cmd)}">Copy</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </section>
    `
    : `
      <section class="guide-section">
        <div class="guide-info-note">
          This chapter focuses on architectural and mathematical foundations rather than device-specific IOS CLI commands.
        </div>
      </section>
    `;

  const tipsHtml = (ch.tips || []).map((tip) => `
    <div class="guide-tip-card">
      <svg class="guide-tip-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M10 3L2.5 16.5h15L10 3z" stroke-linejoin="round"/><path d="M10 8v4M10 14.5h.01" stroke-linecap="round"/></svg>
      <div class="guide-tip-text">${formatInlineCode(tip)}</div>
    </div>
  `).join("");

  panel.innerHTML = `
    <div class="guide-reader-prose">
      <div class="guide-reading-progress">
        <span class="guide-reading-step">Chapter ${idx + 1} of ${studyGuide.length}</span>
        <div class="guide-reading-track"><div style="width:${chapterPct}%"></div></div>
        <span class="guide-reading-pct">${chapterPct}% through syllabus</span>
      </div>

      <header class="guide-chapter-header">
        <div class="guide-chapter-header-main">
          <div class="guide-chapter-meta">
            <span class="guide-meta-pill guide-meta-vol">Official Cert Guide · Vol ${ch.volume} · Ch ${ch.chapter}</span>
            <span class="guide-meta-pill" data-domain-accent="${domainSlug}">${safeHTML(ch.domain)}</span>
            <span class="guide-meta-pill">Pages ${safeHTML(ch.pages)}</span>
            ${masteryBadge}
          </div>
          <h3 class="guide-chapter-title">${safeHTML(ch.title)}</h3>
          <p class="guide-chapter-summary">${formatInlineCode(ch.summary)}</p>
        </div>
        <div class="guide-chapter-cta-col">
          <button type="button" id="btnPracticeChapter" class="primary">
            Practice This Chapter (${stats.qCount} Qs)
          </button>
        </div>
      </header>

      <section class="guide-section">
        <h4 class="guide-section-eyebrow">Cisco 200-301 Exam Blueprint Objectives</h4>
        <div class="guide-topics-row">${examTopicsHtml}</div>
      </section>

      <section class="guide-section">
        <div class="guide-section-header">
          <h4 class="guide-section-title">Core Concepts &amp; Technical Deep Dive</h4>
          <span class="guide-section-count">${(ch.keyPoints || []).length} key points</span>
        </div>
        <div class="guide-kp-list">${keyPointsHtml}</div>
      </section>

      ${commandsHtml}

      <section class="guide-section">
        <div class="guide-section-header">
          <h4 class="guide-section-title">Exam Tips, Traps &amp; Rapid Mnemonics</h4>
          <span class="guide-section-count">${(ch.tips || []).length} exam callouts</span>
        </div>
        <div class="guide-tips-list">${tipsHtml}</div>
      </section>

      <section class="guide-section" id="guideChapterTermsSection">
        <div class="guide-section-header">
          <h4 class="guide-section-title">Chapter Key Terms Glossary (${(ch.keyTerms || []).length})</h4>
          <div class="guide-term-mode-switch" role="group" aria-label="Key term study view">
            <button type="button" class="guide-mini-tab${chapterTermViewMode === "grid" ? " active" : ""}" data-term-view="grid">Glossary Grid</button>
            <button type="button" class="guide-mini-tab${chapterTermViewMode === "flashcards" ? " active" : ""}" data-term-view="flashcards">Flashcard Drill</button>
          </div>
        </div>
        <div id="guideChapterTermsBody">${renderChapterKeyTermsSection(ch)}</div>
      </section>

      <footer class="guide-chapter-footer">
        <div class="guide-chapter-footer-nav">
          ${prevCh ? `<button type="button" class="secondary guide-nav-ch-btn" id="btnPrevCh">← Vol ${prevCh.volume} Ch ${prevCh.chapter}: ${safeHTML(prevCh.title)}</button>` : "<span></span>"}
        </div>
        <button type="button" class="primary" id="btnPracticeChapterBottom">Drill Chapter ${ch.chapter} (${stats.qCount} Qs)</button>
        <div class="guide-chapter-footer-nav guide-chapter-footer-next">
          ${nextCh ? `<button type="button" class="secondary guide-nav-ch-btn" id="btnNextCh">Vol ${nextCh.volume} Ch ${nextCh.chapter}: ${safeHTML(nextCh.title)} →</button>` : "<span></span>"}
        </div>
      </footer>
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
      chapterFlashIndex = 0;
      chapterFlashFlipped = false;
      renderChapterSidebar();
      renderChapterDetail();
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
  const btnNext = byId("btnNextCh");
  if (btnNext && nextCh) {
    btnNext.addEventListener("click", () => {
      currentChapterId = nextCh.id;
      chapterFlashIndex = 0;
      chapterFlashFlipped = false;
      renderChapterSidebar();
      renderChapterDetail();
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  panel.querySelectorAll("[data-term-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      chapterTermViewMode = btn.dataset.termView === "flashcards" ? "flashcards" : "grid";
      chapterFlashFlipped = false;
      renderChapterDetail();
      const termsSec = byId("guideChapterTermsSection");
      if (termsSec) termsSec.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });

  const rebindFlashcardControls = () => {
    const body = byId("guideChapterTermsBody");
    if (!body) return;
    const cardEl = byId("guideChapterFlashcard");
    const flipBtn = byId("btnGuideFlashFlip");
    const prevFlashBtn = byId("btnGuideFlashPrev");
    const nextFlashBtn = byId("btnGuideFlashNext");
    const toggleFlip = () => {
      chapterFlashFlipped = !chapterFlashFlipped;
      body.innerHTML = renderChapterKeyTermsSection(ch);
      rebindFlashcardControls();
    };
    if (cardEl) cardEl.addEventListener("click", toggleFlip);
    if (flipBtn) flipBtn.addEventListener("click", toggleFlip);
    if (prevFlashBtn) {
      prevFlashBtn.addEventListener("click", () => {
        if (chapterFlashIndex > 0) {
          chapterFlashIndex -= 1;
          chapterFlashFlipped = false;
          body.innerHTML = renderChapterKeyTermsSection(ch);
          rebindFlashcardControls();
        }
      });
    }
    if (nextFlashBtn) {
      nextFlashBtn.addEventListener("click", () => {
        if (chapterFlashIndex < (ch.keyTerms || []).length - 1) {
          chapterFlashIndex += 1;
          chapterFlashFlipped = false;
          body.innerHTML = renderChapterKeyTermsSection(ch);
          rebindFlashcardControls();
        }
      });
    }
  };
  rebindFlashcardControls();

  bindCopyButtons(panel);
}

export function renderGlobalCommandsExplorer() {
  const view = byId("guideCommandsView");
  const container = byId("guideCommandsShell") || view;
  if (!container) return;

  const q = currentSearchQuery.trim().toLowerCase();
  const baseRows = [];
  const modesSet = new Set();

  for (const ch of studyGuide) {
    if (currentVolumeFilter !== "all" && String(ch.volume) !== currentVolumeFilter) continue;
    if (currentDomainFilter !== "all" && ch.domain !== currentDomainFilter) continue;
    for (const c of ch.commands || []) {
      const m = (c.mode || "ios").toLowerCase();
      modesSet.add(m);
      if (q && !c.cmd.toLowerCase().includes(q) && !c.desc.toLowerCase().includes(q) && !ch.title.toLowerCase().includes(q)) continue;
      baseRows.push({ ch, c, mode: m });
    }
  }

  const modes = ["all", ...Array.from(modesSet).sort()];
  if (currentCommandModeFilter !== "all" && !modesSet.has(currentCommandModeFilter)) {
    currentCommandModeFilter = "all";
  }

  const rows = baseRows.filter((r) => currentCommandModeFilter === "all" || r.mode === currentCommandModeFilter);

  container.innerHTML = `
    <div class="guide-explorer-header">
      <div>
        <h3 class="guide-explorer-title">Global Cisco IOS Command Reference</h3>
        <p class="guide-explorer-sub">Showing ${rows.length} CLI commands. Select any chapter badge to open its full study guide.</p>
      </div>
      <div class="guide-mode-chips" role="group" aria-label="Filter commands by IOS mode">
        ${modes.map((m) => `
          <button type="button" class="guide-chip-btn${currentCommandModeFilter === m ? " active" : ""}" data-cmd-mode="${safeHTML(m)}">
            ${m === "all" ? "All Modes" : safeHTML(m)}
          </button>
        `).join("")}
      </div>
    </div>
    <div class="guide-cmd-table-wrap">
      <div class="guide-terminal-chrome">
        <div class="guide-terminal-dots" aria-hidden="true"><span></span><span></span><span></span></div>
        <span class="guide-terminal-label">Cisco IOS &amp; Host CLI Reference · ${rows.length} entries</span>
      </div>
      <table class="guide-cmd-table">
        <thead>
          <tr>
            <th>Chapter</th>
            <th>Command Syntax</th>
            <th>Mode</th>
            <th>Description</th>
            <th class="guide-cmd-copy-col">Copy</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(({ ch, c }) => `
            <tr>
              <td>
                <button type="button" class="ghost guide-ch-jump-btn" data-open-ch="${safeHTML(ch.id)}">V${ch.volume} Ch${ch.chapter}</button>
              </td>
              <td class="guide-cmd-syntax"><code>${safeHTML(c.cmd)}</code></td>
              <td><span class="guide-mode-pill">${safeHTML(c.mode || "ios")}</span></td>
              <td class="guide-cmd-desc">${formatInlineCode(c.desc)}</td>
              <td class="guide-cmd-copy-col">
                <button type="button" class="ghost btn-copy-cmd" data-cmd="${safeHTML(c.cmd)}">Copy</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;

  container.querySelectorAll("[data-cmd-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentCommandModeFilter = btn.dataset.cmdMode || "all";
      renderGlobalCommandsExplorer();
    });
  });

  container.querySelectorAll("[data-open-ch]").forEach((btn) => {
    btn.addEventListener("click", () => openGuideChapter(btn.dataset.openCh));
  });

  bindCopyButtons(container);
}

export function renderGlobalGlossaryExplorer() {
  const view = byId("guideGlossaryView");
  const container = byId("guideGlossaryShell") || view;
  if (!container) return;

  const q = currentSearchQuery.trim().toLowerCase();
  const baseTerms = [];
  const letterSet = new Set();

  for (const ch of studyGuide) {
    if (currentVolumeFilter !== "all" && String(ch.volume) !== currentVolumeFilter) continue;
    if (currentDomainFilter !== "all" && ch.domain !== currentDomainFilter) continue;
    for (const kt of ch.keyTerms || []) {
      if (q && !kt.term.toLowerCase().includes(q) && !kt.def.toLowerCase().includes(q) && !ch.title.toLowerCase().includes(q)) continue;
      const first = (kt.term.trim()[0] || "#").toUpperCase();
      const letter = /[A-Z]/.test(first) ? first : "#";
      letterSet.add(letter);
      baseTerms.push({ ch, kt, letter });
    }
  }
  baseTerms.sort((a, b) => a.kt.term.localeCompare(b.kt.term));

  const letters = ["all", ...Array.from(letterSet).sort()];
  if (currentGlossaryLetter !== "all" && !letterSet.has(currentGlossaryLetter)) {
    currentGlossaryLetter = "all";
  }

  const terms = baseTerms.filter((item) => currentGlossaryLetter === "all" || item.letter === currentGlossaryLetter);

  container.innerHTML = `
    <div class="guide-explorer-header">
      <div>
        <h3 class="guide-explorer-title">Official Cert Guide Key Terms (A–Z)</h3>
        <p class="guide-explorer-sub">Showing ${terms.length} terminology definitions. Select any chapter badge to read full context.</p>
      </div>
    </div>
    <div class="guide-alpha-bar" role="group" aria-label="Filter glossary by starting letter">
      ${letters.map((l) => `
        <button type="button" class="guide-alpha-btn${currentGlossaryLetter === l ? " active" : ""}" data-glossary-letter="${safeHTML(l)}">
          ${l === "all" ? "All" : safeHTML(l)}
        </button>
      `).join("")}
    </div>
    <div class="guide-terms-grid guide-terms-grid-global">
      ${terms.map(({ ch, kt }) => `
        <div class="guide-term-card">
          <div class="guide-term-card-top">
            <strong class="guide-term-title">${safeHTML(kt.term)}</strong>
            <button type="button" class="ghost guide-ch-jump-btn" data-open-ch="${safeHTML(ch.id)}">V${ch.volume} Ch${ch.chapter}</button>
          </div>
          <p class="guide-term-def">${formatInlineCode(kt.def)}</p>
        </div>
      `).join("")}
    </div>
  `;

  container.querySelectorAll("[data-glossary-letter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentGlossaryLetter = btn.dataset.glossaryLetter || "all";
      renderGlobalGlossaryExplorer();
    });
  });

  container.querySelectorAll("[data-open-ch]").forEach((btn) => {
    btn.addEventListener("click", () => openGuideChapter(btn.dataset.openCh));
  });
}

function updateGuideViewVisibility() {
  const chView = byId("guideChaptersShell");
  const cmdView = byId("guideCommandsView");
  const cmdShell = byId("guideCommandsShell");
  const glView = byId("guideGlossaryView");
  const glShell = byId("guideGlossaryShell");

  const isChapters = currentHubTab === "chapters";
  const isCommands = currentHubTab === "commands";
  const isGlossary = currentHubTab === "glossary";

  if (chView) {
    chView.style.display = isChapters ? "grid" : "none";
    chView.classList.toggle("hidden", !isChapters);
  }
  if (cmdView) {
    cmdView.style.display = isCommands ? "block" : "none";
    cmdView.classList.toggle("hidden", !isCommands);
  }
  if (cmdShell) {
    cmdShell.classList.toggle("hidden", !isCommands);
  }
  if (glView) {
    glView.style.display = isGlossary ? "block" : "none";
    glView.classList.toggle("hidden", !isGlossary);
  }
  if (glShell) {
    glShell.classList.toggle("hidden", !isGlossary);
  }

  document.querySelectorAll("[data-guide-tab]").forEach((btn) => {
    const active = btn.dataset.guideTab === currentHubTab;
    btn.className = active ? "primary" : "secondary";
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });

  if (isChapters) {
    renderChapterSidebar();
    renderChapterDetail();
  } else if (isCommands) {
    renderGlobalCommandsExplorer();
  } else {
    renderGlobalGlossaryExplorer();
  }
}

export function openGuideChapter(chapterId) {
  const ch = getChapterById(chapterId);
  if (!ch) return;
  currentChapterId = chapterId;
  chapterFlashIndex = 0;
  chapterFlashFlipped = false;
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
        chapterFlashIndex = 0;
        chapterFlashFlipped = false;
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
        tocBtn.textContent = expanded ? "Hide Chapter List" : "Show All 48 Chapters";
        tocBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
      });
    }
  }
  updateGuideViewVisibility();
}

window.openGuideChapter = openGuideChapter;
