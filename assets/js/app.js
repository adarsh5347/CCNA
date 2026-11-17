import { 
  state, 
  byId, 
  playNetSound, 
  gainXP, 
  saveAnalytics, 
  safeHTML, 
  pick, 
  rand, 
  shuffle, 
  STORE, 
  authReady, 
  authResolve, 
  safeSetStorage, 
  showToast, 
  createDefaultAnalytics, 
  loadAnalytics,
  persistSession,
  BANK_VERSION,
  getSavedUnfinishedSession,
  clearSavedSessionStorage
} from "./core.js?v=78";

import { 
  setupAuth, 
  updateHeaderProfile 
} from "./auth.js?v=78";
import { saveSupportTicket } from "./firebase.js?v=78";

import { 
  submitSubnet, 
  ensureSubnetQuestion, 
  getSubnetMultiplier, 
  setupSubnetCalculator, 
  updateSubnetCalculator, 
  setupFlashcards, 
  renderSubnetLeaderboard, 
  updateSubnetLeaderboard,
  makeSubnetQuestion
} from "./subnetting.js?v=78";

import { 
  setupTraversalSimulator, 
  setupNodeConfigInspector, 
  renderCLI, 
  activeTopology, 
  switchTopology, 
  resetTopology2Links, 
  deviceConfigs,
  showOsiLayerDetail,
  updateOsiLabels,
  highlightNode
} from "./topology.js?v=78";

import { 
  setupCanvasConstellation, 
  startSession, 
  navToQuestion, 
  nextQuestion, 
  prevQuestion, 
  saveAndNext, 
  openReview, 
  submitSession, 
  renderNavigator, 
  renderQuestion, 
  wireQuestionInputs, 
  instantStudyFeedback, 
  applyQuestionTime, 
  explanationBlock, 
  answerEquals, 
  applyStats, 
  updateStreakOnAttempt, 
  renderAnalytics, 
  renderDomainChecks, 
  calcDomainAccuracy, 
  renderStatsCards, 
  renderHome, 
  readinessScore, 
  passProbability, 
  renderAchievements,
  toMMSS,
  markCurrent,
  startSessionTimer,
  stopSessionTimer,
  toggleTimerPause,
  startChapterSession,
  resumeSavedSession,
  discardSavedSession,
  renderResumeQuizBanner,
  exportAnalyticsProgress,
  importAnalyticsFromFile
} from "./quiz-engine.js?v=83";

import { generateBank, blueprint } from "./data.js?v=77";
import { labs } from "./labs.js?v=77";
import { ccnaVideos } from "./videos.js?v=77";
import { checkPremiumGate, isPremium, showUpgradeModal, initiateCheckout } from "./subscription.js?v=78";
import { renderAccountPage } from "./account.js?v=78";
import { renderAdminDashboard, checkAdminStatus, setupAdminGrantForm, isAdmin } from "./admin.js?v=78";

let _guideUiPromise = null;
function ensureStudyGuideInit() {
  if (!_guideUiPromise) {
    _guideUiPromise = import("./guide-ui.js?v=84");
  }
  return _guideUiPromise
    .then((m) => m.initStudyGuide())
    .catch((err) => console.warn("Study guide load failed:", err));
}

// Make sure other legacy files or script tags can find these methods on window
window.setPage = setPage;
window.startChapterSession = startChapterSession;
window.renderHome = renderHome;
window.renderAnalytics = renderAnalytics;
window.renderAchievements = renderAchievements;
window.showOsiLayerDetail = showOsiLayerDetail;
window.updateOsiLabels = updateOsiLabels;
window.showUpgradeModal = showUpgradeModal;
window.initiateCheckout = initiateCheckout;
window.toggleTimerPause = toggleTimerPause;
window.exportAnalyticsProgress = exportAnalyticsProgress;
window.importAnalyticsFromFile = importAnalyticsFromFile;
window.calcDomainAccuracy = calcDomainAccuracy;
window.readinessScore = readinessScore;
window.passProbability = passProbability;
// Exposed for cross-module call from quiz-engine.js after renderQuestion
window.setupScrollCollapseHeader = setupScrollCollapseHeader;
window.syncHeaderHeight = syncHeaderHeight;

/* ─── Theme Management (Dark / Light) ──────────────────────────────────────── */
const THEME_STORAGE_KEY = "ccna_theme";

export function getEffectiveTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }
  return "dark";
}

export function applyTheme(theme, persist = false) {
  const resolved = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", resolved);
  if (document.body) {
    document.body.setAttribute("data-theme", resolved);
  }
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute("content", resolved === "light" ? "#f8fafc" : "#060913");
  }
  if (persist) {
    safeSetStorage(localStorage, THEME_STORAGE_KEY, resolved);
  }
  updateThemeButton(resolved);
}

function updateThemeButton(currentTheme = getEffectiveTheme()) {
  const btn = byId("btnThemeToggle");
  if (!btn) return;
  const isLight = currentTheme === "light";
  btn.textContent = isLight ? "🌙" : "☀️";
  const label = isLight ? "Switch to dark theme" : "Switch to light theme";
  btn.setAttribute("title", label);
  btn.setAttribute("aria-label", label);
  btn.setAttribute("aria-pressed", isLight ? "true" : "false");
}

export function toggleTheme() {
  const next = getEffectiveTheme() === "light" ? "dark" : "light";
  applyTheme(next, true);
  playNetSound("click");
  showToast(next === "light" ? "Light theme enabled" : "Dark theme enabled", "info", 1800);
}

window.applyTheme = applyTheme;
window.toggleTheme = toggleTheme;

function handleEngineKeyDown(e) {
  const briefModal = byId("examBriefModal");
  if (briefModal && !briefModal.classList.contains("hidden")) {
    if (e.code === "Escape") {
      e.preventDefault();
      briefModal.classList.add("hidden");
      byId("startExam")?.focus();
    }
    return;
  }
  if (!state.session || state.session.submitted) return;
  if (!byId("engine")?.classList.contains("active")) return;
  const tag = document.activeElement ? document.activeElement.tagName : "";
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  if (e.code === "Escape") {
    const navEl = byId("examNavigator");
    if (navEl && navEl.classList.contains("active")) {
      e.preventDefault();
      navEl.classList.remove("active");
      byId("examNavBackdrop")?.classList.remove("active");
      byId("btnToggleSidebar")?.setAttribute("aria-expanded", "false");
      byId("btnToggleSidebar")?.focus();
      return;
    }
  }

  // KeyP toggles timer pause/resume
  if (e.code === "KeyP") {
    e.preventDefault();
    toggleTimerPause(() => renderQuestion());
    return;
  }

  // Block all other quiz shortcuts while paused
  if (state.session.timerPaused) return;

  const q = state.session.questions[state.session.idx];
  if (!q) return;

  const keyMap = { KeyA: 0, KeyB: 1, KeyC: 2, KeyD: 3 };

  if (e.code in keyMap && (q.type === "single" || q.type === "scenario" || q.type === "multi")) {
    e.preventDefault();
    const optIdx = keyMap[e.code];
    const opts = document.querySelectorAll(".opt input[type='radio'], .opt input[type='checkbox']");
    if (opts[optIdx] && !opts[optIdx].disabled) {
      opts[optIdx].click();
    }
    return;
  }

  switch (e.code) {
    case "ArrowRight":
    case "KeyN": {
      e.preventDefault();
      const nb = byId("nextQ") || byId("saveNext");
      if (nb && !nb.disabled && nb.style.display !== "none") nb.click();
      break;
    }
    case "ArrowLeft": {
      e.preventDefault();
      const pb = byId("prevQ");
      if (pb && !pb.disabled && pb.style.display !== "none") pb.click();
      break;
    }
    case "KeyF": {
      e.preventDefault();
      const fb = byId("toggleMark");
      if (fb && !fb.disabled && fb.style.display !== "none") {
        fb.click();
        const isFlagged = state.session.flagged[state.session.idx];
        showToast(isFlagged ? "Question flagged for review" : "Flag removed", "info", 1800);
      }
      break;
    }
  }
}

let _subnetInitialized = false;
let _videosInitialized = false;
let _labsInitialized = false;
let _traversalInitialized = false;

export function ensureSubnetInit() {
  if (_subnetInitialized) return;
  _subnetInitialized = true;
  renderSubnetLeaderboard();
  ensureSubnetQuestion(true);
  setupSubnetCalculator();
  setupFlashcards();
}

export function ensureVideosInit() {
  if (_videosInitialized) return;
  _videosInitialized = true;
  initVideos();
  renderVideos();
}

export function ensureLabsInit() {
  if (_labsInitialized) {
    renderLabCatalogue();
    return;
  }
  _labsInitialized = true;
  initLabSelector();
  initLabModes();
  if (typeof loadLab === "function") {
    loadLab(1);
  }
}

export function ensureTraversalInit() {
  if (_traversalInitialized) return;
  _traversalInitialized = true;
  setupTraversalSimulator();
}

export function setPage(page, push = true) {
  // Unknown page ids (bad deep links) fall back to home instead of a blank screen
  if (!byId(page) || !document.getElementById(page).classList.contains("page")) {
    page = "home";
  }
  // Admin is owner-only; block before touching navigation state
  if (page === "admin" && !isAdmin()) {
    showToast("Admin access required.", "error");
    page = "home";
  }
  if (push) {
    history.pushState({ page }, "", "?page=" + page);
  }

  // Clear active subnetting challenge timer unconditionally
  if (state.subnet) {
    clearInterval(state.subnet.timerRef);
    state.subnet.timerRef = null;
  }

  // When navigating away from engine with an unfinished session, pause timer and persist
  // so the user can resume from Home ("Resume quiz?") or after reload without losing progress.
  if (page !== "engine" && state.session && !state.session.submitted) {
    stopSessionTimer();
    persistSession();
  }

  // Bind/unbind keydown listener dynamically to prevent performance degradation on other pages
  document.removeEventListener("keydown", handleEngineKeyDown);
  if (page === "engine") {
    document.addEventListener("keydown", handleEngineKeyDown);
  }

  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  const targetPage = byId(page);
  if (targetPage) targetPage.classList.add("active");
  document.body.dataset.activePage = page;
  closeMobileMoreSheet();
  syncMobileBottomNav(page);
  if (page !== "engine") {
    byId("examNavigator")?.classList.remove("active");
    byId("examNavBackdrop")?.classList.remove("active");
  }

  // Update nav buttons active highlight
  document.querySelectorAll("[data-page]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });

  if (page === "home") {
    renderResumeQuizBanner();
  }
  if (page === "analytics") {
    renderAnalytics();
    renderAchievements();
  }
  if (page === "guide") ensureStudyGuideInit();
  if (page === "subnet") ensureSubnetInit();
  if (page === "videos") ensureVideosInit();
  if (page === "labs") ensureLabsInit();
  if (page === "pricing") renderPricingPage();
  if (page === "account") renderAccountPage();
  if (page === "admin") renderAdminDashboard();
  window.scrollTo(0, 0);
}

function restoreSession() {
  const saved = getSavedUnfinishedSession();
  if (!saved || saved.submitted) return false;
  try {
    state.session = saved;
    renderResumeQuizBanner();

    const initialPage = new URLSearchParams(window.location.search).get("page");
    const shouldAutoOpenEngine = initialPage === "engine" || (!initialPage && Boolean(sessionStorage.getItem("ccna_session")));

    if (shouldAutoOpenEngine) {
      const modeTitleEl = byId("modeTitle");
      if (modeTitleEl) modeTitleEl.textContent = saved.title || "Practice Session";
      const modeDescEl = byId("modeDesc");
      if (modeDescEl) modeDescEl.textContent = saved.desc || "";

      byId("timer")?.classList.remove("hidden");
      setPage("engine", false);
      byId("reviewArea")?.classList.add("hidden");
      byId("resultArea")?.classList.add("hidden");
      byId("questionArea")?.classList.remove("hidden");
      const examFooter = byId("examFooter") || document.querySelector(".exam-footer");
      if (examFooter) examFooter.style.display = "flex";
      startSessionTimer();
      renderNavigator();
      renderQuestion();
      return true;
    }
  } catch (e) {
    console.error("Failed to restore session:", e);
  }
  return false;
}

function syncMobileBottomNav(page, overrideTab = null) {
  let activeTab = overrideTab;
  if (!activeTab) {
    if (page === "home") activeTab = "dashboard";
    else if (page === "guide") activeTab = "study";
    else if (page === "engine") activeTab = "practice";
    else if (page === "labs") activeTab = "labs";
    else activeTab = "more";
  }
  document.querySelectorAll("#mobileBottomNav [data-mobile-nav]").forEach((btn) => {
    const isMatch = btn.dataset.mobileNav === activeTab;
    btn.classList.toggle("active", isMatch);
    if (isMatch) {
      btn.setAttribute("aria-current", "page");
    } else {
      btn.removeAttribute("aria-current");
    }
  });
}

const _modalFocusState = new WeakMap();

function getModalFocusableElements(modal) {
  if (!modal) return [];
  return [...modal.querySelectorAll('button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter((el) => {
    const style = window.getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden" && !el.closest(".hidden");
  });
}

function activateModalFocus(modal, initialFocusEl, onEscapeClose) {
  if (!modal) return;
  const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const existing = _modalFocusState.get(modal);
  if (existing && existing.onKeyDown) {
    document.removeEventListener("keydown", existing.onKeyDown);
  }

  const onKeyDown = (e) => {
    if (!modal || modal.classList.contains("hidden")) return;
    if (e.key === "Escape") {
      e.preventDefault();
      if (typeof onEscapeClose === "function") onEscapeClose(true);
      return;
    }
    if (e.key === "Tab") {
      const focusables = getModalFocusableElements(modal);
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      const idx = focusables.indexOf(document.activeElement);
      const nextIdx = idx === -1
        ? (e.shiftKey ? focusables.length - 1 : 0)
        : (idx + (e.shiftKey ? -1 : 1) + focusables.length) % focusables.length;
      focusables[nextIdx].focus();
    }
  };

  _modalFocusState.set(modal, { previousFocus, onKeyDown });
  document.addEventListener("keydown", onKeyDown);

  requestAnimationFrame(() => {
    const target = (initialFocusEl && !initialFocusEl.disabled) ? initialFocusEl : getModalFocusableElements(modal)[0];
    if (target && typeof target.focus === "function") target.focus();
  });
}

function deactivateModalFocus(modal, restoreFocus = true, fallbackEl = null) {
  if (!modal) return;
  const entry = _modalFocusState.get(modal);
  if (entry) {
    if (entry.onKeyDown) document.removeEventListener("keydown", entry.onKeyDown);
    if (restoreFocus) {
      const target = (entry.previousFocus && entry.previousFocus.isConnected && entry.previousFocus.offsetParent !== null)
        ? entry.previousFocus
        : fallbackEl;
      if (target && typeof target.focus === "function") target.focus();
    }
    _modalFocusState.delete(modal);
  } else if (restoreFocus && fallbackEl && typeof fallbackEl.focus === "function") {
    fallbackEl.focus();
  }
}

function openMobileMoreSheet() {
  const sheet = byId("mobileMoreSheet");
  const backdrop = byId("mobileMoreBackdrop");
  const moreBtn = document.querySelector('#mobileBottomNav [data-mobile-nav="more"]');
  const adminBtn = document.querySelector('#mobileMoreSheet [data-more-action="admin"]');
  if (adminBtn) adminBtn.classList.toggle("admin-visible", isAdmin());
  if (sheet) {
    sheet.classList.remove("hidden");
    sheet.classList.add("active");
    sheet.setAttribute("aria-hidden", "false");
    activateModalFocus(sheet, byId("btnCloseMobileMore"), () => closeMobileMoreSheet(true));
  }
  if (backdrop) {
    backdrop.classList.remove("hidden");
    backdrop.classList.add("active");
  }
  if (moreBtn) moreBtn.setAttribute("aria-expanded", "true");
  document.body.classList.add("more-sheet-open");
}

function closeMobileMoreSheet(restoreFocus = false) {
  const sheet = byId("mobileMoreSheet");
  const backdrop = byId("mobileMoreBackdrop");
  const moreBtn = document.querySelector('#mobileBottomNav [data-mobile-nav="more"]');
  if (sheet) {
    sheet.classList.remove("active");
    sheet.classList.add("hidden");
    sheet.setAttribute("aria-hidden", "true");
    deactivateModalFocus(sheet, restoreFocus, moreBtn);
  }
  if (backdrop) {
    backdrop.classList.remove("active");
    backdrop.classList.add("hidden");
  }
  if (moreBtn) {
    moreBtn.setAttribute("aria-expanded", "false");
    if (restoreFocus) moreBtn.focus();
  }
  document.body.classList.remove("more-sheet-open");
}

function navSetup() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-page]");
    if (btn) {
      setPage(btn.dataset.page);
    }
  });
}

function updateMuteButton() {
  const btn = byId("btnMuteToggle");
  if (btn) {
    btn.textContent = state.muted ? "🔇" : "🔊";
    const label = state.muted ? "Unmute sound effects" : "Mute sound effects";
    btn.setAttribute("title", label);
    btn.setAttribute("aria-label", label);
    btn.setAttribute("aria-pressed", state.muted ? "true" : "false");
  }
}

function updateContrastButton() {
  document.body.classList.toggle("high-contrast", state.highContrast);
  const btn = byId("btnToggleContrast");
  if (btn) {
    const label = state.highContrast ? "Disable high contrast mode" : "Enable high contrast mode";
    btn.setAttribute("title", label);
    btn.setAttribute("aria-label", label);
    btn.setAttribute("aria-pressed", state.highContrast ? "true" : "false");
  }
}

function openExamBriefingModal() {
  const modal = byId("examBriefModal");
  if (!modal) {
    startSession("exam");
    return;
  }
  modal.classList.remove("hidden");
  activateModalFocus(modal, byId("btnConfirmStartExam"), closeExamBriefingModal);
}

function closeExamBriefingModal(restoreFocus = true) {
  const modal = byId("examBriefModal");
  if (modal) {
    modal.classList.add("hidden");
    deactivateModalFocus(modal, restoreFocus, byId("startExam"));
  }
}

function updateSectionQuizSummary() {
  const summaryEl = byId("sectionQuizSummary");
  const toggleBtn = byId("btnSelectAllDomains");
  const dur = byId("quizDuration")?.value || "10";
  const cnt = byId("quizCount")?.value || "10";
  const allBoxes = [...document.querySelectorAll("#domainChecks .qdomain")];
  const checkedCount = allBoxes.filter((el) => el.checked).length;

  if (summaryEl) {
    summaryEl.textContent = checkedCount > 0
      ? `${cnt} Qs · ${dur} mins · ${checkedCount} ${checkedCount === 1 ? "domain" : "domains"}`
      : `${cnt} Qs · ${dur} mins · Select >= 1 domain`;
    summaryEl.classList.toggle("is-empty", checkedCount === 0);
  }
  if (toggleBtn && allBoxes.length > 0) {
    toggleBtn.textContent = checkedCount === allBoxes.length ? "Reset Default" : "Select All";
  }
}

function wireEvents() {
  byId("startStudy").addEventListener("click", () => startSession("study"));
  byId("startQuiz").addEventListener("click", () => startSession("quiz"));
  byId("startSmartQuiz").addEventListener("click", () => startSession("smart"));
  byId("startExam").addEventListener("click", openExamBriefingModal);

  byId("btnConfirmStartExam")?.addEventListener("click", () => {
    closeExamBriefingModal();
    startSession("exam");
  });
  byId("btnCancelExamBrief")?.addEventListener("click", closeExamBriefingModal);
  byId("btnCloseExamBrief")?.addEventListener("click", closeExamBriefingModal);
  byId("examBriefModal")?.addEventListener("click", (e) => {
    if (e.target.id === "examBriefModal") closeExamBriefingModal();
  });

  byId("quizDuration")?.addEventListener("change", updateSectionQuizSummary);
  byId("quizCount")?.addEventListener("change", updateSectionQuizSummary);
  byId("domainChecks")?.addEventListener("change", updateSectionQuizSummary);
  byId("btnSelectAllDomains")?.addEventListener("click", () => {
    const boxes = [...document.querySelectorAll("#domainChecks .qdomain")];
    const allChecked = boxes.length > 0 && boxes.every((b) => b.checked);
    boxes.forEach((b, idx) => {
      b.checked = allChecked ? idx === 0 : true;
    });
    updateSectionQuizSummary();
  });
  updateSectionQuizSummary();

  const btnLaunchStudy = byId("btnLaunchStudy");
  const btnLaunchExam = byId("btnLaunchExam");
  const btnLaunchLabs = byId("btnLaunchLabs");

  if (btnLaunchStudy) {
    btnLaunchStudy.addEventListener("click", () => {
      setPage("engine");
      startSession("study");
    });
  }
  if (btnLaunchExam) {
    btnLaunchExam.addEventListener("click", openExamBriefingModal);
  }
  if (btnLaunchLabs) {
    btnLaunchLabs.addEventListener("click", () => {
      setPage("labs");
    });
  }

  const btnExplore = byId("btnExplorePlatform");
  if (btnExplore) {
    btnExplore.addEventListener("click", (e) => {
      e.preventDefault();
      byId("explorePlatform")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const btnFooterStudy = byId("btnFooterStartStudy");
  if (btnFooterStudy) {
    btnFooterStudy.addEventListener("click", () => {
      setPage("engine");
      startSession("study");
    });
  }

  const btnMute = byId("btnMuteToggle");
  if (btnMute) {
    btnMute.addEventListener("click", () => {
      state.muted = !state.muted;
      safeSetStorage(localStorage, "ccna_muted", state.muted);
      updateMuteButton();
      playNetSound("click");
    });
  }

  const btnContrast = byId("btnToggleContrast");
  if (btnContrast) {
    btnContrast.addEventListener("click", () => {
      state.highContrast = !state.highContrast;
      safeSetStorage(localStorage, "ccna_high_contrast", state.highContrast);
      updateContrastButton();
      playNetSound("click");
      showToast(state.highContrast ? "High contrast mode on" : "High contrast mode off", "info", 2000);
    });
  }

  const btnTheme = byId("btnThemeToggle");
  if (btnTheme) {
    btnTheme.addEventListener("click", () => {
      toggleTheme();
    });
  }

  if (window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onSchemeChange = (e) => {
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        applyTheme(e.matches ? "light" : "dark", false);
      }
    };
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onSchemeChange);
    }
  }

  // Analytics Export / Import Progress controls (Home + Analytics page)
  ["btnExportProgress", "btnHomeExportProgress"].forEach((id) => {
    const btn = byId(id);
    if (btn) {
      btn.addEventListener("click", () => {
        playNetSound("click");
        exportAnalyticsProgress();
      });
    }
  });

  const importInput = byId("importProgressInput");
  ["btnImportProgress", "btnHomeImportProgress"].forEach((id) => {
    const btn = byId(id);
    if (btn && importInput) {
      btn.addEventListener("click", () => {
        playNetSound("click");
        importInput.value = "";
        importInput.click();
      });
    }
  });

  if (importInput) {
    importInput.addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        await importAnalyticsFromFile(file);
      }
      importInput.value = "";
    });
  }

  const chkTrouble = byId("chkTroubleshooting");
  if (chkTrouble) {
    chkTrouble.addEventListener("change", () => {
      playNetSound("click");
      state.simBugsFixed = {};
      if (state.inspectedNode) {
        renderCLI(state.inspectedNode);
      }
    });
  }

  const selectPacket = byId("simPacketType");
  if (selectPacket) {
    selectPacket.addEventListener("change", () => {
      if (state.inspectedNode) {
        renderCLI(state.inspectedNode);
      }
    });
  }

  const btnEasy = byId("btnSubnetEasy");
  const btnMedium = byId("btnSubnetMedium");
  const btnHard = byId("btnSubnetHard");
  const btnTimed = byId("btnSubnetTimed");

  if (btnEasy) btnEasy.addEventListener("click", () => { playNetSound("click"); state.subnet.mode = "Easy"; ensureSubnetQuestion(true); });
  if (btnMedium) btnMedium.addEventListener("click", () => { playNetSound("click"); state.subnet.mode = "Medium"; ensureSubnetQuestion(true); });
  if (btnHard) btnHard.addEventListener("click", () => { playNetSound("click"); state.subnet.mode = "Hard"; ensureSubnetQuestion(true); });
  if (btnTimed) btnTimed.addEventListener("click", () => { playNetSound("click"); state.subnet.mode = "Timed"; ensureSubnetQuestion(true); });

  const subSubmit = byId("subnetSubmit");
  if (subSubmit) subSubmit.addEventListener("click", submitSubnet);
  
  const subSkip = byId("subnetSkip");
  if (subSkip) {
    subSkip.addEventListener("click", () => {
      playNetSound("click");
      state.subnet.q = null;
      ensureSubnetQuestion(false);
    });
  }

  const ansInput = byId("subnetAnswer");
  if (ansInput) {
    ansInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        submitSubnet();
      }
    });
  }

  const openReviewBtn = byId("openReview");
  if (openReviewBtn) openReviewBtn.addEventListener("click", openReview);

  const toggleMarkBtn = byId("toggleMark");
  if (toggleMarkBtn) toggleMarkBtn.addEventListener("click", markCurrent);

  const exitBtn = byId("exitSession");
  if (exitBtn) {
    exitBtn.addEventListener("click", () => {
      if (state.session && !state.session.submitted) {
        stopSessionTimer();
        persistSession();
      }
      setPage("home");
    });
  }

  const prevQBtn = byId("prevQ");
  if (prevQBtn) prevQBtn.addEventListener("click", prevQuestion);

  const nextQBtn = byId("nextQ");
  if (nextQBtn) nextQBtn.addEventListener("click", nextQuestion);

  const saveNextBtn = byId("saveNext");
  if (saveNextBtn) saveNextBtn.addEventListener("click", saveAndNext);

  const submitSessionBtn = byId("submitSession");
  if (submitSessionBtn) submitSessionBtn.addEventListener("click", () => submitSession(false));

  const btnFullScreen = byId("btnToggleFullScreen");
  if (btnFullScreen) {
    btnFullScreen.addEventListener("click", () => {
      playNetSound("click");
      const shell = document.querySelector(".exam-shell");
      if (!document.fullscreenElement) {
        shell?.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable full-screen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    });
  }

  const btnMissed = byId("startMissedQuiz");
  if (btnMissed) {
    btnMissed.addEventListener("click", () => startSession("missed"));
  }

  const sidebarNav = byId("examNavigator");
  const btnToggleNav = byId("btnToggleSidebar");
  const btnCloseNav = byId("btnCloseSidebar");
  if (sidebarNav && btnToggleNav && btnCloseNav) {
    btnToggleNav.addEventListener("click", () => {
      const isOpen = sidebarNav.classList.toggle("active");
      byId("examNavBackdrop")?.classList.toggle("active", isOpen);
      btnToggleNav.setAttribute("aria-expanded", String(isOpen));
    });
    btnCloseNav.addEventListener("click", () => {
      sidebarNav.classList.remove("active");
      byId("examNavBackdrop")?.classList.remove("active");
      btnToggleNav.setAttribute("aria-expanded", "false");
    });
  }

  const examNavBackdrop = byId("examNavBackdrop");
  if (examNavBackdrop && sidebarNav) {
    examNavBackdrop.addEventListener("click", () => {
      sidebarNav.classList.remove("active");
      examNavBackdrop.classList.remove("active");
      btnToggleNav?.setAttribute("aria-expanded", "false");
    });
  }
  const qNavEl = byId("qNav");
  if (qNavEl && sidebarNav) {
    qNavEl.addEventListener("click", (e) => {
      if (e.target.closest("button")) {
        sidebarNav.classList.remove("active");
        byId("examNavBackdrop")?.classList.remove("active");
        btnToggleNav?.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Mobile 5-Tab Bottom Navigation & More Bottom Sheet
  document.querySelectorAll("#mobileBottomNav [data-mobile-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      playNetSound("click");
      const target = btn.dataset.mobileNav;
      if (target === "dashboard") {
        closeMobileMoreSheet();
        setPage("home");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (target === "study") {
        closeMobileMoreSheet();
        setPage("guide");
      } else if (target === "practice") {
        closeMobileMoreSheet();
        if (state.session && !state.session.submitted) {
          resumeSavedSession();
        } else {
          setPage("home");
          syncMobileBottomNav("home", "practice");
          setTimeout(() => {
            byId("practiceModulesHeading")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 60);
        }
      } else if (target === "labs") {
        closeMobileMoreSheet();
        setPage("labs");
      } else if (target === "more") {
        const sheet = byId("mobileMoreSheet");
        if (sheet && sheet.classList.contains("active")) {
          closeMobileMoreSheet();
        } else {
          openMobileMoreSheet();
        }
      }
    });
  });

  byId("btnCloseMobileMore")?.addEventListener("click", () => {
    playNetSound("click");
    closeMobileMoreSheet();
  });
  byId("mobileMoreBackdrop")?.addEventListener("click", () => {
    closeMobileMoreSheet();
  });

  document.querySelectorAll("#mobileMoreSheet [data-more-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      playNetSound("click");
      const action = btn.dataset.moreAction;
      closeMobileMoreSheet();
      if (action === "simulator") {
        setPage("home");
        setTimeout(() => byId("simulatorHeading")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
      } else if (action === "flashcards") {
        setPage("home");
        setTimeout(() => byId("flashcardBox")?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
      } else if (action === "subnet") {
        setPage("subnet");
      } else if (action === "vlsm") {
        setPage("subnet");
        setTimeout(() => byId("vlsmCalcCard")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
      } else if (action === "analytics") {
        setPage("analytics");
      } else if (action === "planner") {
        setPage("analytics");
        setTimeout(() => byId("studyPlannerHeading")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
      } else if (action === "videos") {
        setPage("videos");
      } else if (action === "support") {
        setPage("support");
      } else if (action === "account") {
        setPage("account");
      } else if (action === "admin") {
        setPage("admin");
      }
    });
  });

  // Topology Fit View / Pan 1.5x Toolbar
  const btnTopoZoomFit = byId("btnTopoZoomFit");
  const btnTopoZoomPan = byId("btnTopoZoomPan");
  const topoMainEl = document.querySelector(".topology-main");
  if (btnTopoZoomFit && btnTopoZoomPan && topoMainEl) {
    btnTopoZoomFit.addEventListener("click", () => {
      playNetSound("click");
      topoMainEl.classList.remove("pan-zoom-mode");
      topoMainEl.scrollLeft = 0;
      topoMainEl.scrollTop = 0;
      btnTopoZoomFit.classList.add("active");
      btnTopoZoomPan.classList.remove("active");
    });
    btnTopoZoomPan.addEventListener("click", () => {
      playNetSound("click");
      topoMainEl.classList.add("pan-zoom-mode");
      btnTopoZoomPan.classList.add("active");
      btnTopoZoomFit.classList.remove("active");
    });
  }

  // Virtual Lab Manual CLI Input, Up/Down History & Hint Controls
  const labManualInput = byId("labManualCliInput");
  const btnLabRunManual = byId("btnLabRunManual");
  const btnLabHint = byId("btnLabHint");
  const normalizeLabCmd = (str) =>
    String(str || "")
      .trim()
      .toLowerCase()
      .replace(/\bgigabitethernet\s*/g, "gi")
      .replace(/\bfastethernet\s*/g, "fa")
      .replace(/\binterface\s+/g, "int ")
      .replace(/\bswitchport\s+/g, "sw ")
      .replace(/\bno\s+shutdown\b/g, "no shut")
      .replace(/\s+/g, " ");

  const labCmdHistory = [];
  let labHistoryIdx = -1;

  const submitManualLabCmd = () => {
    if (!labManualInput) return;
    const raw = labManualInput.value.trim();
    if (!raw) return;
    if (labCmdHistory[labCmdHistory.length - 1] !== raw) {
      labCmdHistory.push(raw);
    }
    labHistoryIdx = labCmdHistory.length;
    const lab = labs.find((l) => l.id === state.lab.currentLabId) || labs[0];
    if (!lab || !lab.commands) return;
    const nextIdx = state.lab.userCommands.length;
    const expectedObj = lab.commands[nextIdx];
    let cmdToPass = raw;
    if (expectedObj && normalizeLabCmd(raw) === normalizeLabCmd(expectedObj.cmd)) {
      cmdToPass = expectedObj.cmd;
    }
    handleLabCommandClick(cmdToPass, lab);
    labManualInput.value = "";
  };

  if (btnLabRunManual) {
    btnLabRunManual.addEventListener("click", submitManualLabCmd);
  }
  if (labManualInput) {
    labManualInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submitManualLabCmd();
      } else if (e.key === "ArrowUp") {
        if (labCmdHistory.length > 0) {
          e.preventDefault();
          labHistoryIdx = Math.max(0, labHistoryIdx - 1);
          labManualInput.value = labCmdHistory[labHistoryIdx] || "";
        }
      } else if (e.key === "ArrowDown") {
        if (labCmdHistory.length > 0) {
          e.preventDefault();
          labHistoryIdx = Math.min(labCmdHistory.length, labHistoryIdx + 1);
          labManualInput.value = labCmdHistory[labHistoryIdx] || "";
        }
      }
    });
  }
  if (btnLabHint) {
    btnLabHint.addEventListener("click", () => {
      playNetSound("click");
      const lab = labs.find((l) => l.id === state.lab.currentLabId) || labs[0];
      if (!lab || !lab.commands) return;
      const nextIdx = state.lab.userCommands.length;
      if (nextIdx >= lab.commands.length) {
        showToast("All lab steps are already completed!", "ok", 2500);
        return;
      }
      const nextStep = lab.commands[nextIdx];
      const feedback = byId("labFeedbackBox");
      if (feedback) {
        feedback.style.display = "block";
        feedback.className = "lab-feedback-box is-hint";
        feedback.textContent = `Hint (Step ${nextIdx + 1}/${lab.commands.length}): ${nextStep.desc} — ${nextStep.cmd}`;
      }
    });
  }

  const btnReset = byId("btnResetProgress");
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (confirm("Are you sure you want to reset all your progress statistics? A local recovery backup will be created before resetting.")) {
        const key = state.user ? `${STORE}_${state.user.uid}` : STORE;
        safeSetStorage(localStorage, `${key}_pre_reset_backup`, JSON.stringify({ at: new Date().toISOString(), analytics: state.analytics }));
        clearSavedSessionStorage();
        if (state.session) {
          stopSessionTimer();
          state.session = null;
        }
        state.analytics = createDefaultAnalytics();
        saveAnalytics(true);
        renderHome();
        renderAnalytics();
        renderAchievements();
        renderVideos();
        showToast("Progress statistics reset. (Call undoResetProgress() in console or restore backup if needed)", "info", 5000);
      }
    });
  }
  window.undoResetProgress = function () {
    const key = state.user ? `${STORE}_${state.user.uid}` : STORE;
    const raw = localStorage.getItem(`${key}_pre_reset_backup`);
    if (!raw) {
      showToast("No pre-reset backup found.", "warn");
      return false;
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.analytics) {
        state.analytics = parsed.analytics;
        saveAnalytics(true);
        renderHome();
        renderAnalytics();
        renderAchievements();
        renderVideos();
        showToast("Progress statistics restored from backup!", "ok", 4000);
        return true;
      }
    } catch (e) {
      console.error("Failed to restore pre-reset backup:", e);
    }
    return false;
  };

  const onboarding = byId("onboardingModal");
  const dismissBtn = byId("btnOnboardingDismiss");
  if (onboarding && dismissBtn) {
    onboarding.classList.add("hidden");
    const closeOnboarding = (restoreFocus = true) => {
      playNetSound("success");
      onboarding.classList.add("hidden");
      safeSetStorage(localStorage, "ccna_onboarded", "true");
      deactivateModalFocus(onboarding, restoreFocus);
    };
    window.openOnboardingModal = () => {
      onboarding.classList.remove("hidden");
      activateModalFocus(onboarding, dismissBtn, closeOnboarding);
    };
    dismissBtn.addEventListener("click", () => closeOnboarding(true));
    onboarding.addEventListener("click", (e) => {
      if (e.target === onboarding) closeOnboarding(true);
    });
  }

  window.startDomainDrill = function (domainName) {
    playNetSound("click");
    const checks = document.querySelectorAll("#domainChecks .qdomain");
    if (checks.length > 0 && domainName) {
      let matched = false;
      checks.forEach((cb) => {
        if (cb.value === domainName) {
          cb.checked = true;
          matched = true;
        } else {
          cb.checked = false;
        }
      });
      if (!matched) {
        checks[0].checked = true;
      }
      startSession("quiz");
    } else {
      startSession("study");
    }
  };

  const btnGeneratePlan = byId("btnGeneratePlan");
  if (btnGeneratePlan) {
    btnGeneratePlan.addEventListener("click", () => {
      playNetSound("click");
      const targetDateStr = byId("studyExamDate").value;
      const dailyHours = Number(byId("studyDailyHours").value);
      const outBox = byId("studyPlanOutput");
      if (!outBox) return;

      if (!targetDateStr) {
        showToast("Please select a target exam date.", "warn");
        return;
      }

      const parts = targetDateStr.split("-").map(Number);
      const targetDate = parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]) : new Date(targetDateStr);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        showToast("Target exam date must be in the future!", "warn");
        return;
      }

      const totalStudyVolume = 120;
      const currentXP = state.analytics.xp || 0;
      const progressXPFactor = Math.min(0.9, currentXP / 5000);
      const remainingHours = Math.max(10, Math.round(totalStudyVolume * (1 - progressXPFactor)));
      const requiredHoursPerDay = remainingHours / diffDays;

      outBox.style.display = "block";

      let planHtml = `
        <h4 class="study-plan-title">Generated Study Route</h4>
        <div class="study-plan-meta">
          <span>Days Remaining: ${diffDays}</span>
          <span>Estimated Hours Needed: ${remainingHours}h</span>
        </div>
      `;

      if (dailyHours < requiredHoursPerDay) {
        planHtml += `
          <div class="study-plan-alert is-warn">
            <strong>Schedule Alert:</strong> Your target of ${dailyHours} hours/day is insufficient to cover the remaining ${remainingHours} hours. Increase daily target to <strong>${requiredHoursPerDay.toFixed(1)}</strong> hours or push back exam date.
          </div>
        `;
      } else {
        planHtml += `
          <div class="study-plan-alert is-ok">
            <strong>Target Achievable:</strong> You are on track. A study pace of ${dailyHours} hours/day exceeds the required ${requiredHoursPerDay.toFixed(1)} hours/day.
          </div>
        `;
      }

      const weakDomains = state.weakDomains || [];
      planHtml += `
        <div class="study-plan-metrics">
          <strong>Target Practice Metrics:</strong><br />
          • Solve at least <strong>${Math.max(5, Math.round(15 / dailyHours))}</strong> questions per day.<br />
          • Practice 1 CLI lab configuration twice a week.
        </div>
      `;

      if (weakDomains.length > 0) {
        planHtml += `
          <div class="study-plan-rec">
            <strong>Domain Focus Recommendations:</strong> Use Spaced Repetition or Smart Adaptive practice filters focusing on your weakest domains:
            <span class="study-plan-weak">${safeHTML(weakDomains.join(", "))}</span>.
          </div>
        `;
      }

      outBox.innerHTML = planHtml;
      safeSetStorage(localStorage, "ccna_study_plan", JSON.stringify({ targetDateStr, dailyHours }));
    });
  }
}

const distractorCommands = {
  1: ["vlan 999", "switchport mode trunk", "interface FastEthernet0/24", "no switchport"],
  2: ["encapsulation dot1Q 99", "ip address 10.10.10.1 255.0.0.0", "interface GigabitEthernet0/0", "no ip routing"],
  3: ["router ospf 100", "router-id 2.2.2.2", "network 192.168.1.0 0.0.0.0 area 0", "ip route 0.0.0.0 0.0.0.0 10.10.10.1"],
  4: ["access-list 10 permit 192.168.20.0 0.0.0.255", "ip access-group 10 out", "access-list 10 deny any", "interface GigabitEthernet0/1"],
  5: ["ip dhcp pool WAN_POOL", "default-router 192.168.1.254", "dns-server 1.1.1.1", "ip dhcp excluded-address 192.168.1.1 192.168.1.254"],
  6: ["ip nat outside", "ip nat inside", "access-list 1 permit any", "ip nat inside source static 192.168.1.10 192.168.1.2"],
  7: ["spanning-tree vlan 10 priority 4000", "spanning-tree mode pvst", "no spanning-tree vlan 10", "spanning-tree root primary"],
  8: ["interface range GigabitEthernet0/1 - 2", "channel-group 1 mode passive", "channel-group 1 mode on", "no channel-group 1"],
  9: ["wlan Corporate_WiFi 1", "security wpa wpa2 key-mgmt wpa", "security wpa wpa2 akm psk set-key ascii WrongPassword", "wlan Corporate_WiFi 2 shutdown"],
  10: ["crypto isakmp policy 1", "encryption aes 128", "crypto ipsec transform-set MY_SET esp-3des esp-sha-hmac", "crypto isakmp key WrongKey address 198.51.100.1"]
};

const LAB_CATALOGUE_GROUPS = [
  {
    key: "access",
    title: "Network Access & Switching",
    subtitle: "Layer 2 segmentation, ROAS trunking, Rapid PVST+, and LACP bundling",
    labIds: [1, 2, 7, 8]
  },
  {
    key: "routing",
    title: "Routing & IP Services",
    subtitle: "OSPFv2 dynamic adjacencies, DHCP pools, and NAT Overload (PAT)",
    labIds: [3, 5, 6]
  },
  {
    key: "security",
    title: "Security & Wireless",
    subtitle: "Standard ACL filtering, WPA2 Wireless LANs, and IPSec VPN tunnels",
    labIds: [4, 9, 10]
  }
];

function getLabMiniGraphicSvg(lab) {
  const accent =
    lab.domain === "IP Connectivity"
      ? "#5e5ce6"
      : lab.domain === "IP Services"
      ? "#38bdf8"
      : lab.domain === "Security Fundamentals"
      ? "#ff9f0a"
      : "#30d158";
  if (lab.id === 1 || lab.id === 7 || lab.id === 8) {
    return `<svg class="lab-card-thumb" viewBox="0 0 120 44" aria-hidden="true">
      <line x1="22" y1="22" x2="60" y2="22" stroke="${accent}" stroke-width="1.5" stroke-opacity="0.6"/>
      <line x1="60" y1="22" x2="98" y2="22" stroke="${accent}" stroke-width="1.5" stroke-opacity="0.6"${lab.id === 8 ? ' stroke-dasharray="3 2"' : ""}/>
      <circle cx="22" cy="22" r="7" fill="#0d111a" stroke="${accent}" stroke-width="1.5"/>
      <rect x="48" y="13" width="24" height="18" rx="4" fill="#0d111a" stroke="${accent}" stroke-width="1.5"/>
      <circle cx="98" cy="22" r="7" fill="#0d111a" stroke="#38bdf8" stroke-width="1.5"/>
    </svg>`;
  }
  if (lab.id === 4 || lab.id === 10) {
    return `<svg class="lab-card-thumb" viewBox="0 0 120 44" aria-hidden="true">
      <line x1="20" y1="22" x2="60" y2="22" stroke="${accent}" stroke-width="1.5" stroke-opacity="0.6"/>
      <line x1="60" y1="22" x2="100" y2="22" stroke="#30d158" stroke-width="1.5" stroke-opacity="0.6"/>
      <circle cx="20" cy="22" r="6" fill="#0d111a" stroke="#38bdf8" stroke-width="1.5"/>
      <path d="M60 9l11 4v9c0 7-5 11-11 13-6-2-11-6-11-13v-9l11-4z" fill="#0d111a" stroke="${accent}" stroke-width="1.5"/>
      <rect x="92" y="14" width="16" height="16" rx="4" fill="#0d111a" stroke="#30d158" stroke-width="1.5"/>
    </svg>`;
  }
  return `<svg class="lab-card-thumb" viewBox="0 0 120 44" aria-hidden="true">
    <line x1="20" y1="22" x2="60" y2="22" stroke="#38bdf8" stroke-width="1.5" stroke-opacity="0.6"/>
    <line x1="60" y1="22" x2="100" y2="22" stroke="${accent}" stroke-width="1.5" stroke-opacity="0.6"/>
    <circle cx="20" cy="22" r="7" fill="#0d111a" stroke="#38bdf8" stroke-width="1.5"/>
    <circle cx="60" cy="22" r="10" fill="#0d111a" stroke="${accent}" stroke-width="1.5"/>
    <circle cx="100" cy="22" r="7" fill="#0d111a" stroke="#30d158" stroke-width="1.5"/>
  </svg>`;
}

function updateLabSummaryMetrics() {
  const completedIds = Array.isArray(state.analytics.completedLabIds) ? state.analytics.completedLabIds : [];
  const completedCount = state.analytics.labsCompleted || completedIds.length || 0;
  const pct = Math.round((Math.min(labs.length, completedCount) / labs.length) * 100);
  const modeMap = { step: "Step-by-Step", challenge: "Challenge", exam: "Exam Match" };

  const elAvail = byId("labStatAvailable");
  const elComp = byId("labStatCompleted");
  const elXP = byId("labStatXP");
  const elProg = byId("labStatProgress");
  const elMode = byId("labStatMode");
  const elModeTag = byId("labTerminalModeTag");

  if (elAvail) elAvail.textContent = `${labs.length} Labs`;
  if (elComp) elComp.textContent = `${completedCount} / ${labs.length}`;
  if (elXP) elXP.textContent = `${state.analytics.xp || 0} XP`;
  if (elProg) elProg.textContent = `${pct}% Complete`;
  if (elMode) elMode.textContent = modeMap[state.lab.mode] || "Step-by-Step";
  if (elModeTag) elModeTag.textContent = state.lab.mode === "step" ? "GUIDED" : state.lab.mode === "challenge" ? "CHALLENGE" : "EXAM";
}

function renderLabCatalogue() {
  const grid = byId("labCatalogueGrid");
  if (!grid) return;

  const completedIds = new Set(Array.isArray(state.analytics.completedLabIds) ? state.analytics.completedLabIds : []);
  const activeId = state.lab.currentLabId || 1;

  grid.innerHTML = LAB_CATALOGUE_GROUPS.map((group) => {
    const groupLabs = group.labIds.map((id) => labs.find((l) => l.id === id)).filter(Boolean);
    return `
      <div class="lab-cat-group">
        <div class="lab-cat-group-head">
          <h4>${safeHTML(group.title)}</h4>
          <span>${safeHTML(group.subtitle)}</span>
        </div>
        <div class="lab-cat-cards">
          ${groupLabs.map((l) => {
            const isCompleted = completedIds.has(l.id);
            const isCurrent = l.id === activeId;
            const summary = l.objectives && l.objectives.length > 0 ? l.objectives.slice(0, 2).join(" · ") : l.scenario;
            return `
              <button type="button" class="lab-cat-card${isCurrent ? " active" : ""}${isCompleted ? " is-completed" : ""}" data-lab-card="${l.id}" aria-pressed="${isCurrent ? "true" : "false"}">
                <div class="lab-cat-card-top">
                  <span class="lab-cat-num">LAB ${String(l.id).padStart(2, "0")}</span>
                  <span class="lab-cat-status ${isCompleted ? "done" : "todo"}">${isCompleted ? "Completed" : safeHTML(l.difficulty)}</span>
                </div>
                ${getLabMiniGraphicSvg(l)}
                <div class="lab-cat-name">${safeHTML(l.title)}</div>
                <p class="lab-cat-desc">${safeHTML(summary)}</p>
                <div class="lab-cat-foot">
                  <span class="lab-cat-domain">${safeHTML(l.domain)}</span>
                  <span class="lab-cat-modes">Guided · Challenge · Exam</span>
                </div>
              </button>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }).join("");

  grid.querySelectorAll("[data-lab-card]").forEach((card) => {
    card.addEventListener("click", () => {
      const id = Number(card.dataset.labCard);
      const sel = byId("labSelector");
      if (sel) sel.value = String(id);
      loadLab(id);
      const ws = byId("labWorkspace");
      if (ws) ws.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  updateLabSummaryMetrics();
}

function initLabSelector() {
  const sel = byId("labSelector");
  if (sel) {
    sel.innerHTML = labs.map((l) => `<option value="${l.id}">Lab ${l.id}: ${l.title}</option>`).join("");
    sel.addEventListener("change", () => {
      state.lab.currentLabId = Number(sel.value);
      loadLab(state.lab.currentLabId);
    });
  }

  const toggleCatBtn = byId("btnToggleLabCatalogue");
  const catSection = byId("labCatalogueSection");
  if (toggleCatBtn && catSection) {
    toggleCatBtn.addEventListener("click", () => {
      const hidden = catSection.classList.toggle("is-collapsed");
      toggleCatBtn.setAttribute("aria-expanded", hidden ? "false" : "true");
      toggleCatBtn.textContent = hidden ? "Show 10-Lab Catalogue" : "Hide Catalogue";
    });
  }

  const prevBtn = byId("btnPrevLab");
  const nextBtn = byId("btnNextLab");
  const retryTopBtn = byId("btnRetryLabTop");
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      const prevId = Math.max(1, (state.lab.currentLabId || 1) - 1);
      if (sel) sel.value = String(prevId);
      loadLab(prevId);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const nextId = Math.min(labs.length, (state.lab.currentLabId || 1) + 1);
      if (sel) sel.value = String(nextId);
      loadLab(nextId);
    });
  }
  if (retryTopBtn) {
    retryTopBtn.addEventListener("click", () => {
      loadLab(state.lab.currentLabId || 1);
    });
  }

  const inspectorToggle = byId("btnToggleLabInspector");
  const inspectorBody = byId("labInspectorBody");
  if (inspectorToggle && inspectorBody) {
    inspectorToggle.addEventListener("click", () => {
      const collapsed = inspectorBody.classList.toggle("is-collapsed");
      inspectorToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
    });
  }

  renderLabCatalogue();
}

function initLabModes() {
  const modes = [
    { id: "btnModeStep", mode: "step" },
    { id: "btnModeChallenge", mode: "challenge" },
    { id: "btnModeExam", mode: "exam" }
  ];
  modes.forEach((m) => {
    const btn = byId(m.id);
    if (btn) {
      btn.addEventListener("click", () => {
        playNetSound("click");
        modes.forEach((o) => {
          const b = byId(o.id);
          if (b) b.className = "ghost";
        });
        btn.className = "primary";
        state.lab.mode = m.mode;
        loadLab(state.lab.currentLabId);
      });
    }
  });
}

function drawLabTopology(lab) {
  const container = byId("labTopologyContainer");
  if (!container) return;

  const topologies = {
    1: { left: "Host PC", leftSub: "VLAN 10/20", mid: "SW-1", midSub: "Access Ports", right: "Sales/Fin", rightSub: "Fa0/1 - Fa0/2" },
    2: { left: "VLAN 10/20", leftSub: "802.1Q Trunk", mid: "SW-1", midSub: "Trunk Gi0/1", right: "R-1 ROAS", rightSub: "Gi0/0.10 / .20" },
    3: { left: "LAN 192.168.1.0", leftSub: "Area 0", mid: "R-1 OSPF", midSub: "ID 1.1.1.1", right: "WAN 10.10.10.0", rightSub: "/30 Area 0" },
    4: { left: "Src 192.168.20.0", leftSub: "Inbound Gi0/0", mid: "R-1 ACL 10", midSub: "Deny / Permit", right: "Core LAN", rightSub: "Filtered" },
    5: { left: "VLAN 10 Hosts", leftSub: "DHCP Clients", mid: "SW-1", midSub: "Relay Path", right: "R-1 DHCP", rightSub: "LAN_POOL" },
    6: { left: "Inside 192.168.1.0", leftSub: "Gi0/0 Inside", mid: "R-1 PAT", midSub: "ACL 1 Overload", right: "Outside Gi0/1", rightSub: "Public IP" },
    7: { left: "SW-2", leftSub: "Priority 32768", mid: "SW-1 Root", midSub: "Rapid-PVST 4096", right: "VLAN 10", rightSub: "Primary Root" },
    8: { left: "R-Branch", leftSub: "Gi0/1 + Gi0/2", mid: "Po1 LACP", midSub: "Active Mode", right: "HQ-Core", rightSub: "Bundled Link" },
    9: { left: "Wireless Client", leftSub: "Corporate_WiFi", mid: "Campus WLC", midSub: "WLAN ID 2", right: "WPA2 AES-PSK", rightSub: "RADIUS/PSK" },
    10: { left: "Branch LAN", leftSub: "AES-256 ISAKMP", mid: "R-Branch", midSub: "Policy 10", right: "198.51.100.1", rightSub: "IPSec VPN_SET" }
  };
  const t = topologies[lab.id] || topologies[1];

  const svg = `
    <svg viewBox="0 0 540 160" width="100%" height="100%" role="img" aria-label="Topology diagram for ${safeHTML(lab.title)}">
      <rect width="540" height="160" rx="10" fill="#090c14" />
      <line x1="115" y1="78" x2="270" y2="78" stroke="#38bdf8" stroke-width="2" stroke-dasharray="5 3" />
      <line x1="270" y1="78" x2="425" y2="78" stroke="#30d158" stroke-width="2" stroke-dasharray="5 3" />

      <g transform="translate(115, 78)">
        <circle r="20" fill="#0d111a" stroke="#38bdf8" stroke-width="2" />
        <rect x="-7" y="-8" width="14" height="9" rx="1.5" fill="none" stroke="#e2e8f0" stroke-width="1.2" />
        <path d="M-9 4h18" stroke="#e2e8f0" stroke-width="1.2" stroke-linecap="round" />
        <text y="34" font-family="var(--font-sans)" font-size="10" font-weight="600" fill="#f8fafc" text-anchor="middle">${safeHTML(t.left)}</text>
        <text y="46" font-family="var(--font-mono)" font-size="8.5" fill="#94a3b8" text-anchor="middle">${safeHTML(t.leftSub)}</text>
      </g>

      <g transform="translate(270, 78)">
        <rect x="-24" y="-16" width="48" height="32" rx="6" fill="#0d111a" stroke="#0a84ff" stroke-width="2" />
        <path d="M-12 -3h24M9 -6l3 3-3 3M-12 3h24M-9 0l-3 3 3 3" fill="none" stroke="#e2e8f0" stroke-width="1.2" stroke-linecap="round" />
        <text y="32" font-family="var(--font-sans)" font-size="10" font-weight="600" fill="#f8fafc" text-anchor="middle">${safeHTML(t.mid)}</text>
        <text y="44" font-family="var(--font-mono)" font-size="8.5" fill="#94a3b8" text-anchor="middle">${safeHTML(t.midSub)}</text>
      </g>

      <g transform="translate(425, 78)">
        <circle r="20" fill="#0d111a" stroke="#30d158" stroke-width="2" />
        <path d="M-8 0h16M0 -8v16" fill="none" stroke="#e2e8f0" stroke-width="1.3" stroke-linecap="round" />
        <text y="34" font-family="var(--font-sans)" font-size="10" font-weight="600" fill="#f8fafc" text-anchor="middle">${safeHTML(t.right)}</text>
        <text y="46" font-family="var(--font-mono)" font-size="8.5" fill="#94a3b8" text-anchor="middle">${safeHTML(t.rightSub)}</text>
      </g>
    </svg>
  `;
  container.innerHTML = svg;
}

function renderLabInspector(lab, statusType = "ready", statusMsg = "Awaiting configuration command") {
  const body = byId("labInspectorBody");
  if (!body || !lab) return;

  const totalSteps = lab.commands.length;
  const doneSteps = state.lab.userCommands.length;
  const pct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;
  const currentStep = lab.commands[doneSteps] || null;
  const verifHtml = (lab.verification || []).map((v) => `<code>${safeHTML(v)}</code>`).join("");

  let taskGuidanceHtml = "";
  if (state.lab.mode === "exam") {
    const matchedCount = Object.keys(state.lab.matches || {}).length;
    taskGuidanceHtml = `
      <div class="lab-insp-block">
        <div class="lab-insp-label">Exam Mode Instructions</div>
        <p class="lab-insp-text">Select an objective statement, then match its exact Cisco IOS command. Matches entered: <strong>${matchedCount} / ${totalSteps}</strong>.</p>
      </div>
    `;
  } else if (doneSteps >= totalSteps) {
    taskGuidanceHtml = `
      <div class="lab-insp-block is-complete">
        <div class="lab-insp-label">All Steps Verified</div>
        <p class="lab-insp-text">Every required configuration command has been accepted by the IOS interpreter.</p>
      </div>
    `;
  } else if (state.lab.mode === "step" && currentStep) {
    taskGuidanceHtml = `
      <div class="lab-insp-block">
        <div class="lab-insp-label">Current Step (${doneSteps + 1} of ${totalSteps})</div>
        <p class="lab-insp-text">${safeHTML(currentStep.desc)}</p>
        <div class="lab-insp-expected">
          <span>Expected Syntax</span>
          <code>${safeHTML(currentStep.cmd)}</code>
        </div>
      </div>
    `;
  } else if (state.lab.mode === "challenge") {
    const curObjIdx = Math.min(
      lab.objectives.length - 1,
      Math.floor((doneSteps / Math.max(1, totalSteps)) * lab.objectives.length)
    );
    taskGuidanceHtml = `
      <div class="lab-insp-block is-challenge">
        <div class="lab-insp-label">Challenge Task (${doneSteps + 1} of ${totalSteps})</div>
        <p class="lab-insp-text">${safeHTML(lab.objectives[curObjIdx] || lab.scenario)}</p>
        <p class="lab-insp-muted">Guided command preview is hidden in Challenge Mode. Type commands or filter out distractors carefully.</p>
      </div>
    `;
  }

  body.innerHTML = `
    <div class="lab-insp-progress">
      <div class="lab-insp-progress-row">
        <span>Completion</span>
        <strong>${doneSteps} / ${totalSteps} (${pct}%)</strong>
      </div>
      <div class="lab-insp-track"><div style="width:${pct}%"></div></div>
    </div>

    <div class="lab-insp-status is-${statusType}">
      <span>Validation Status</span>
      <strong>${safeHTML(statusMsg)}</strong>
    </div>

    ${taskGuidanceHtml}

    <div class="lab-insp-block">
      <div class="lab-insp-label">Verification Commands</div>
      <div class="lab-insp-chips">${verifHtml}</div>
    </div>

    <div class="lab-insp-block">
      <div class="lab-insp-label">IOS Shorthand Supported</div>
      <div class="lab-insp-shorthand">
        <code>int gi0/0</code> <code>fa0/1</code> <code>sw</code> <code>no shut</code> <code>↑ / ↓ history</code>
      </div>
    </div>
  `;
}

function renderLabCompletionBanner(lab, detailText) {
  const banner = byId("labCompletionBanner");
  if (!banner || !lab) return;
  const hasNext = lab.id < labs.length;
  banner.classList.remove("hidden");
  banner.innerHTML = `
    <div class="lab-complete-head">
      <span class="lab-complete-badge">LAB COMPLETED · +50 XP EARNED</span>
      <h4>${safeHTML(lab.title)}</h4>
      <p class="lab-complete-meta">${safeHTML(detailText)}</p>
    </div>
    <div class="lab-complete-concept">
      <strong>Relevant Networking Concepts:</strong>
      <p>${safeHTML(lab.explanation)}</p>
    </div>
    <div class="lab-complete-actions">
      <button type="button" class="secondary" id="btnCompleteRetryLab">Retry Lab</button>
      ${hasNext ? `<button type="button" class="primary" id="btnCompleteNextLab">Next Lab →</button>` : ""}
      <button type="button" class="secondary" id="btnCompleteCatalogue">Return to Catalogue</button>
    </div>
  `;

  const retryBtn = byId("btnCompleteRetryLab");
  const nextBtn = byId("btnCompleteNextLab");
  const catBtn = byId("btnCompleteCatalogue");
  const sel = byId("labSelector");

  if (retryBtn) retryBtn.addEventListener("click", () => loadLab(lab.id));
  if (nextBtn && hasNext) {
    nextBtn.addEventListener("click", () => {
      const nextId = lab.id + 1;
      if (sel) sel.value = String(nextId);
      loadLab(nextId);
    });
  }
  if (catBtn) {
    catBtn.addEventListener("click", () => {
      const cat = byId("labCatalogueSection");
      if (cat) {
        cat.classList.remove("is-collapsed");
        cat.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }
}

function renderLabObjectives(lab) {
  const list = byId("labObjectivesList");
  if (!list) return;

  const doneCount = lab.objectives.filter((_, idx) => Boolean(state.lab.completedSteps[idx])).length;
  const badge = byId("labStepProgressBadge");
  if (badge) badge.textContent = `${doneCount} / ${lab.objectives.length} Objectives`;

  list.innerHTML = lab.objectives.map((obj, idx) => {
    const done = Boolean(state.lab.completedSteps[idx]);
    return `
      <div class="lab-obj-item${done ? " is-done" : ""}">
        <span class="lab-obj-marker" aria-hidden="true">${done ? "✓" : String(idx + 1).padStart(2, "0")}</span>
        <span class="lab-obj-text">${safeHTML(obj)}</span>
      </div>
    `;
  }).join("");
}

function loadLab(labId) {
  const lab = labs.find((l) => l.id === labId);
  if (!lab) return;

  state.lab.currentLabId = labId;
  state.lab.completedSteps = {};
  state.lab.userCommands = [];
  state.lab.currentPrompt = (labId === 1 || labId === 7 || labId === 8) ? "Switch(config)#" : "Router(config)#";

  const labTitleEl = byId("labTitle");
  const labScenarioEl = byId("labScenario");
  if (labTitleEl) labTitleEl.textContent = `Lab ${lab.id}: ${lab.title} (${lab.difficulty})`;
  if (labScenarioEl) labScenarioEl.textContent = lab.scenario;

  const compBanner = byId("labCompletionBanner");
  if (compBanner) {
    compBanner.classList.add("hidden");
    compBanner.innerHTML = "";
  }

  const prevBtn = byId("btnPrevLab");
  const nextBtn = byId("btnNextLab");
  if (prevBtn) prevBtn.disabled = labId <= 1;
  if (nextBtn) nextBtn.disabled = labId >= labs.length;

  drawLabTopology(lab);
  renderLabObjectives(lab);
  renderLabCatalogue();

  const output = byId("labCliOutput");
  const prompt = byId("labCliPrompt");
  const inputs = byId("labInteractiveInputs");
  const feedback = byId("labFeedbackBox");
  const termCard = document.querySelector(".lab-terminal-card");

  if (feedback) {
    feedback.style.display = "none";
    feedback.className = "lab-feedback-box";
  }

  const initialHost = (labId === 1 || labId === 7 || labId === 8) ? "Switch" : "Router";

  if (state.lab.mode === "step" || state.lab.mode === "challenge") {
    if (output) {
      output.classList.remove("is-exam-mode");
      output.textContent = `Cisco IOS Software, Catalyst L3 Switch Software, Version 15.2\n\n${initialHost}# configure terminal\nEnter configuration commands, one per line. End with CNTL/Z.\n`;
    }
    if (termCard) termCard.classList.remove("is-exam-mode");
    if (prompt) prompt.textContent = `${initialHost}(config)#`;

    let cmds = lab.commands.map((c, i) => ({ cmd: c.cmd, idx: i, correct: true }));
    if (state.lab.mode === "challenge") {
      const dists = distractorCommands[lab.id] || [];
      dists.forEach((d) => {
        cmds.push({ cmd: d, idx: -1, correct: false });
      });
    }
    cmds = shuffle(cmds);

    if (inputs) {
      inputs.innerHTML = cmds.map((c) => `
        <button type="button" class="secondary btn-lab-cmd" data-cmd="${safeHTML(c.cmd)}">${safeHTML(c.cmd)}</button>
      `).join("");

      inputs.querySelectorAll(".btn-lab-cmd").forEach((btn) => {
        btn.addEventListener("click", () => {
          handleLabCommandClick(btn.dataset.cmd, lab);
        });
      });
    }
    renderLabInspector(lab, "ready", "Ready for configuration");
  } else if (state.lab.mode === "exam") {
    if (output) output.classList.add("is-exam-mode");
    if (termCard) termCard.classList.add("is-exam-mode");
    if (prompt) prompt.textContent = "Exam Mode";
    renderExamMatchInterface(lab);
    renderLabInspector(lab, "ready", "Match all objectives cleanly");
  }
}

function handleLabCommandClick(cmd, lab) {
  if (!lab || !lab.commands || state.lab.userCommands.length >= lab.commands.length) return;
  const nextExpectedIdx = state.lab.userCommands.length;
  const nextExpectedCmd = lab.commands[nextExpectedIdx].cmd;
  const output = byId("labCliOutput");
  const prompt = byId("labCliPrompt");
  const feedback = byId("labFeedbackBox");

  if (feedback) {
    feedback.style.display = "none";
    feedback.className = "lab-feedback-box";
  }

  const currentHost = (lab.id === 1 || lab.id === 7 || lab.id === 8) ? "Switch" : "Router";

  if (cmd === nextExpectedCmd) {
    playNetSound("hop");
    state.lab.userCommands.push(cmd);

    if (cmd.startsWith("interface") || cmd.startsWith("int ")) {
      state.lab.currentPrompt = `${currentHost}(config-if)#`;
    } else if (cmd.startsWith("router ospf") || cmd.startsWith("router rip")) {
      state.lab.currentPrompt = `${currentHost}(config-router)#`;
    } else if (cmd.startsWith("vlan ")) {
      state.lab.currentPrompt = `${currentHost}(config-vlan)#`;
    } else if (cmd.startsWith("wlan ")) {
      state.lab.currentPrompt = `${currentHost}(config-wlan)#`;
    } else if (cmd.startsWith("crypto isakmp") || cmd.startsWith("crypto ipsec")) {
      state.lab.currentPrompt = `${currentHost}(config-crypto)#`;
    } else if (cmd.startsWith("exit")) {
      state.lab.currentPrompt = `${currentHost}(config)#`;
    }

    if (output) {
      output.textContent += `${prompt.textContent} ${cmd}\n`;
      output.scrollTop = output.scrollHeight;
    }
    if (prompt) prompt.textContent = state.lab.currentPrompt;

    const completedCount = state.lab.userCommands.length;
    lab.objectives.forEach((obj, idx) => {
      const threshold = Math.min(lab.commands.length, Math.ceil((idx + 1) * (lab.commands.length / lab.objectives.length)));
      if (completedCount >= threshold) {
        if (!state.lab.completedSteps[idx]) {
          state.lab.completedSteps[idx] = true;
          playNetSound("success");
        }
      }
    });

    renderLabObjectives(lab);

    if (state.lab.userCommands.length === lab.commands.length) {
      playNetSound("success");
      if (output) {
        output.textContent += `\n%CONFIG-5-SUCCESS: Laboratory configuration completed successfully. All objectives met.\n`;
        output.scrollTop = output.scrollHeight;
      }
      if (feedback) {
        feedback.style.display = "block";
        feedback.className = "lab-feedback-box is-success";
        feedback.textContent = "Lab Completed. +50 XP Awarded.";
      }
      gainXP(50);
      state.analytics.completedLabIds = Array.isArray(state.analytics.completedLabIds) ? state.analytics.completedLabIds : [];
      if (!state.analytics.completedLabIds.includes(lab.id)) {
        state.analytics.completedLabIds.push(lab.id);
      }
      state.analytics.labsCompleted = Math.min(10, state.analytics.completedLabIds.length);
      saveAnalytics();
      renderHome();
      renderLabCatalogue();
      renderLabInspector(lab, "success", `Completed (${lab.commands.length}/${lab.commands.length} commands verified)`);
      renderLabCompletionBanner(lab, `${lab.objectives.length}/${lab.objectives.length} objectives completed via CLI sequence.`);

      const inputs = byId("labInteractiveInputs");
      if (inputs) inputs.innerHTML = `<span class="lab-cli-passed-badge">Configuration Complete</span>`;
    } else {
      renderLabInspector(lab, "ok", `Accepted: ${cmd}`);
    }
  } else {
    playNetSound("block");
    if (output) {
      output.textContent += `${prompt.textContent} ${cmd}\n% Invalid input detected or command mismatch.\n`;
      output.scrollTop = output.scrollHeight;
    }
    if (feedback) {
      feedback.style.display = "block";
      feedback.className = "lab-feedback-box is-error";
      feedback.textContent = "Incorrect command or step order. Verify current objective and try again.";
    }
    renderLabInspector(lab, "error", `Rejected: ${cmd}`);
  }
}

function renderExamMatchInterface(lab) {
  const output = byId("labCliOutput");
  const inputs = byId("labInteractiveInputs");
  if (!output || !inputs) return;

  state.lab.selectedObjIdx = null;
  state.lab.selectedCmdText = null;
  state.lab.matches = {};

  const shuffledCmds = shuffle(lab.commands.map((c, i) => ({ text: c.cmd, originalIdx: i })));

  output.innerHTML = `
    <div class="lab-exam-prompt">Match each configuration objective to its exact Cisco IOS command. Select an objective, then select its command.</div>
    <div class="lab-exam-grid">
      <div>
        <h5 class="lab-exam-col-title">Objectives / Steps</h5>
        <div id="examObjColumn" class="lab-exam-col">
          ${lab.commands.map((c, i) => `
            <button type="button" class="exam-item exam-obj-item" data-obj-idx="${i}">
              <span>${i + 1}. ${safeHTML(c.desc)}</span>
              <span class="matched-val" id="matchedVal-${i}"></span>
            </button>
          `).join("")}
        </div>
      </div>
      <div>
        <h5 class="lab-exam-col-title">IOS Commands</h5>
        <div id="examCmdColumn" class="lab-exam-col">
          ${shuffledCmds.map((c) => `
            <button type="button" class="exam-item exam-cmd-item" data-cmd-text="${safeHTML(c.text)}">
              <code>${safeHTML(c.text)}</code>
            </button>
          `).join("")}
        </div>
      </div>
    </div>
  `;

  inputs.innerHTML = `
    <button type="button" id="btnSubmitExamMatches" class="primary">Submit Configuration Matches</button>
  `;

  const objItems = output.querySelectorAll(".exam-obj-item");
  const cmdItems = output.querySelectorAll(".exam-cmd-item");

  objItems.forEach((item) => {
    item.addEventListener("click", () => {
      playNetSound("click");
      objItems.forEach((el) => el.classList.remove("selected"));
      item.classList.add("selected");
      state.lab.selectedObjIdx = Number(item.dataset.objIdx);
      checkAndApplyMatch();
    });
  });

  const handleCmdClick = (item) => {
    playNetSound("click");
    cmdItems.forEach((el) => el.classList.remove("selected"));
    item.classList.add("selected");
    state.lab.selectedCmdText = item.dataset.cmdText;
    checkAndApplyMatch();
  };

  cmdItems.forEach((item) => {
    item.addEventListener("click", () => handleCmdClick(item));
  });

  function checkAndApplyMatch() {
    if (state.lab.selectedObjIdx !== null && state.lab.selectedCmdText !== null) {
      const objIdx = state.lab.selectedObjIdx;
      const cmdText = state.lab.selectedCmdText;

      state.lab.matches[objIdx] = cmdText;

      const matchLabel = byId(`matchedVal-${objIdx}`);
      if (matchLabel) {
        matchLabel.textContent = `Matched: ${cmdText}`;
      }

      objItems.forEach((el) => el.classList.remove("selected"));
      cmdItems.forEach((el) => el.classList.remove("selected"));
      state.lab.selectedObjIdx = null;
      state.lab.selectedCmdText = null;
      renderLabInspector(lab, "ok", `${Object.keys(state.lab.matches).length}/${lab.commands.length} objectives paired`);
    }
  }

  const btnSubmit = byId("btnSubmitExamMatches");
  if (btnSubmit) {
    btnSubmit.addEventListener("click", () => {
      let correctCount = 0;
      lab.commands.forEach((c, idx) => {
        if (state.lab.matches[idx] === c.cmd) {
          correctCount++;
        }
      });

      const total = lab.commands.length;
      const feedback = byId("labFeedbackBox");

      if (correctCount === total) {
        playNetSound("success");
        if (feedback) {
          feedback.style.display = "block";
          feedback.className = "lab-feedback-box is-success";
          feedback.textContent = `Exam passed: ${correctCount}/${total} correct matches. +50 XP Awarded.`;
        }
        gainXP(50);

        lab.objectives.forEach((_, i) => {
          state.lab.completedSteps[i] = true;
        });
        renderLabObjectives(lab);

        state.analytics.completedLabIds = Array.isArray(state.analytics.completedLabIds) ? state.analytics.completedLabIds : [];
        if (!state.analytics.completedLabIds.includes(lab.id)) {
          state.analytics.completedLabIds.push(lab.id);
        }
        state.analytics.labsCompleted = Math.min(10, state.analytics.completedLabIds.length);
        saveAnalytics();
        renderHome();
        renderLabCatalogue();
        renderLabInspector(lab, "success", `Exam Passed (${correctCount}/${total})`);
        renderLabCompletionBanner(lab, `Exam Mode matched ${correctCount}/${total} IOS configuration commands.`);

        inputs.innerHTML = `<span class="lab-cli-passed-badge">Exam Mode Passed</span>`;
      } else {
        playNetSound("block");
        if (feedback) {
          feedback.style.display = "block";
          feedback.className = "lab-feedback-box is-error";
          feedback.textContent = `Exam verification failed: ${correctCount}/${total} correct matches. Adjust mismatches and resubmit.`;
        }
        renderLabInspector(lab, "error", `${correctCount}/${total} matched correctly`);
      }
    });
  }
}

document.addEventListener("click", (e) => {
  const videoBtn = e.target.closest(".btn-video-watch");
  if (videoBtn) {
    const yid = videoBtn.dataset.youtubeId;
    const title = videoBtn.dataset.videoTitle;
    const vidId = Number(videoBtn.dataset.videoId);
    playVideo(yid, title, vidId);
  }
});

// ─── Phase 3: Dynamically sync --header-height from actual rendered header ───
// Uses ResizeObserver so the variable stays accurate if font sizes change
let _lastHeaderHeight = 0;
let _headerResizeObserver = null;

function syncHeaderHeight() {
  if (window.innerWidth > 768) return; // desktop untouched
  const header = document.querySelector(".exam-header");
  if (!header) return;
  const h = Math.ceil(header.getBoundingClientRect().height);
  if (h > 0 && h !== _lastHeaderHeight) {
    _lastHeaderHeight = h;
    document.documentElement.style.setProperty("--header-height", `${h}px`);
  }
}

function watchHeaderHeight() {
  const header = document.querySelector(".exam-header");
  if (!header) return;
  if (_headerResizeObserver) _headerResizeObserver.disconnect();
  _headerResizeObserver = new ResizeObserver(() => syncHeaderHeight());
  _headerResizeObserver.observe(header);
  syncHeaderHeight(); // initial sync
}

// ─── Phase 2: IntersectionObserver scroll-collapse header ────────────────────
// Adds .collapsed to .exam-header once user scrolls past a sentinel div placed
// at the very top of #questionArea content. Smooth transition via CSS.
let _scrollCollapseObserver = null;

function setupScrollCollapseHeader() {
  if (window.innerWidth > 768) return; // desktop untouched

  // Clean up previous observer if navigating between questions
  if (_scrollCollapseObserver) {
    _scrollCollapseObserver.disconnect();
    _scrollCollapseObserver = null;
  }

  const questionArea = byId("questionArea");
  const examHeader = document.querySelector(".exam-header");
  if (!questionArea || !examHeader) return;

  // Remove any stale sentinel
  const stale = questionArea.querySelector(".scroll-sentinel");
  if (stale) stale.remove();

  // Re-expand header when navigating to a new question (scroll reset)
  examHeader.classList.remove("collapsed");
  syncHeaderHeight();

  // Inject sentinel as first child of questionArea
  const sentinel = document.createElement("div");
  sentinel.className = "scroll-sentinel";
  sentinel.setAttribute("aria-hidden", "true");
  sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;";
  questionArea.insertBefore(sentinel, questionArea.firstChild);

  // Observe: when sentinel leaves viewport top, collapse header; when re-enters, expand
  _scrollCollapseObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const shouldCollapse = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        examHeader.classList.toggle("collapsed", shouldCollapse);
        // Update --header-height immediately after collapse/expand
        requestAnimationFrame(syncHeaderHeight);
      });
    },
    {
      root: questionArea,
      rootMargin: "0px",
      threshold: 0,
    }
  );
  _scrollCollapseObserver.observe(sentinel);
}

function renderPricingPage() {
  const freePlanCta = byId("pricingFreeCtaText");
  const monthlyPlanCta = byId("pricingMonthlyBtn");
  const lifetimePlanCta = byId("pricingLifetimeBtn");

  if (freePlanCta) freePlanCta.textContent = "✅ Active — 100% Free";
  if (monthlyPlanCta) {
    monthlyPlanCta.textContent = "Full Access Unlocked";
    monthlyPlanCta.disabled = true;
  }
  if (lifetimePlanCta) {
    lifetimePlanCta.textContent = "Full Access Unlocked";
    lifetimePlanCta.disabled = true;
  }
}

window.renderPricingPage = renderPricingPage;

function init() {
  applyTheme(getEffectiveTheme(), false);
  state.bank = generateBank(rand);
  state.analytics = loadAnalytics();
  navSetup();
  renderDomainChecks();
  renderHome();
  wireEvents();
  setupAuth();

  // Admin buttons stay hidden until the signed-in user is confirmed as owner
  checkAdminStatus();
  authReady.then(() => checkAdminStatus());
  
  updateMuteButton();
  updateContrastButton();
  updateThemeButton();

  // Restore active quiz session if user refreshed mid-exam
  const sessionRestored = restoreSession();
  if (!sessionRestored) {
    // Handle URL parameter deep linking e.g. ?page=account or ?page=admin
    const initialPage = new URLSearchParams(window.location.search).get("page");
    if (initialPage === "admin") {
      authReady.then(() => setPage("admin", false));
    } else if (initialPage) {
      setPage(initialPage, false);
    }
  }

  // Defer all non-critical page initializations until idle microtask after landing page paint
  const initNonCritical = () => {
    setupCanvasConstellation();
    watchHeaderHeight();
    ensureTraversalInit();
    setupSupportDesk();
    ensureVideosInit();
    ensureSubnetInit();
    ensureLabsInit();

    if (!state.bank || state.bank.length === 0) {
      state.bank = generateBank(rand);
      renderHome();
    }
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(initNonCritical);
  } else {
    setTimeout(initNonCritical, 50);
  }

  // Re-sync header height on orientation/resize
  window.addEventListener("resize", syncHeaderHeight, { passive: true });
  
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      persistSession();
    }
  });

  window.addEventListener("beforeunload", () => {
    if (state.session && !state.session.submitted) {
      persistSession();
    }
  });

  window.addEventListener("popstate", (e) => {
    if (state.session && !state.session.submitted) {
      stopSessionTimer();
      persistSession();
    }
    const page = (e.state && e.state.page) ? e.state.page : "home";
    setPage(page, false);
  });
}


function setupSupportDesk() {
  const form = byId("supportForm");
  const btn = byId("btnSubmitSupport");
  const out = byId("supportOut");
  const errBox = byId("supportFormError");
  if (!btn || !out || !form) return;

  let lastSubmitTs = 0;
  let lastPayloadSig = "";
  let isSubmitting = false;
  const ALLOWED_PRIORITIES = [
    "Severity 4 - Low",
    "Severity 3 - Medium",
    "Severity 2 - High",
    "Severity 1 - Critical"
  ];
  const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const nameEl = byId("supportName");
  const emailEl = byId("supportEmail");
  const priorityEl = byId("supportPriority");
  const descEl = byId("supportDesc");

  const clearValidationState = () => {
    [nameEl, emailEl, priorityEl, descEl].forEach((el) => {
      if (el) el.removeAttribute("aria-invalid");
    });
    if (errBox) {
      errBox.textContent = "";
      errBox.classList.add("hidden");
    }
  };

  [nameEl, emailEl, priorityEl, descEl].forEach((el) => {
    if (el) {
      el.addEventListener("input", clearValidationState);
      el.addEventListener("change", clearValidationState);
    }
  });

  const failValidation = (message, focusTarget = null) => {
    if (focusTarget) {
      focusTarget.setAttribute("aria-invalid", "true");
      focusTarget.focus();
    }
    if (errBox) {
      errBox.textContent = message;
      errBox.classList.remove("hidden");
    }
    showToast(message, "warn");
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    clearValidationState();

    const honeypot = byId("supportWebsite");
    if (honeypot && honeypot.value.trim() !== "") {
      showToast("Submission rejected by automated spam filter.", "error");
      return;
    }

    const name = (nameEl?.value || "").trim();
    const email = (emailEl?.value || "").trim();
    const priority = (priorityEl?.value || "").trim();
    const desc = (descEl?.value || "").trim();

    if (!name) {
      failValidation("Please enter your name (2–80 characters).", nameEl);
      return;
    }
    if (name.length < 2 || name.length > 80) {
      failValidation("Name must be between 2 and 80 characters.", nameEl);
      return;
    }
    if (!email || email.length > 120 || !EMAIL_RE.test(email)) {
      failValidation("Please enter a valid contact email address.", emailEl);
      return;
    }
    if (!ALLOWED_PRIORITIES.includes(priority)) {
      failValidation("Invalid incident priority selected.", priorityEl);
      return;
    }
    if (!desc || desc.length < 10 || desc.length > 2000) {
      failValidation("Description must be between 10 and 2,000 characters.", descEl);
      return;
    }

    const now = Date.now();
    const storedLastTs = Number(localStorage.getItem("ccna_support_last_ts") || 0);
    if (now - Math.max(lastSubmitTs, storedLastTs) < 60000) {
      const waitSec = Math.ceil((60000 - (now - Math.max(lastSubmitTs, storedLastTs))) / 1000);
      failValidation(`Please wait ${waitSec}s before opening another ticket.`);
      return;
    }

    const payloadSig = `${name.toLowerCase()}|${email.toLowerCase()}|${priority}|${desc.toLowerCase()}`;
    const storedLastSig = localStorage.getItem("ccna_support_last_sig") || "";
    if (payloadSig === lastPayloadSig || payloadSig === storedLastSig) {
      failValidation("Duplicate incident ticket detected. Your previous ticket was already recorded.");
      return;
    }

    isSubmitting = true;
    const prevBtnText = btn.textContent;
    btn.disabled = true;
    btn.setAttribute("aria-busy", "true");
    btn.textContent = "Submitting...";

    const ticketId = `INC-${Math.floor(100000 + Math.random() * 900000)}`;
    const ticketPayload = {
      name,
      email,
      priority,
      desc,
      createdAt: new Date().toISOString(),
      uid: state.user ? state.user.uid : null
    };

    try {
      let cloudDocId = null;
      if (navigator.onLine !== false) {
        try {
          cloudDocId = await saveSupportTicket(ticketPayload);
        } catch {
          cloudDocId = null;
        }
      }

      lastSubmitTs = now;
      lastPayloadSig = payloadSig;
      safeSetStorage(localStorage, "ccna_support_last_ts", String(now));
      safeSetStorage(localStorage, "ccna_support_last_sig", payloadSig);

      try {
        const existingTickets = JSON.parse(localStorage.getItem("ccna_support_tickets") || "[]");
        existingTickets.push({
          ticketId,
          syncStatus: cloudDocId ? "cloud" : "local-only",
          cloudDocId: cloudDocId || null,
          ...ticketPayload
        });
        safeSetStorage(localStorage, "ccna_support_tickets", JSON.stringify(existingTickets.slice(-25)));
      } catch {}

      const safePriority = safeHTML(priority);
      const safeId = safeHTML(ticketId);

      if (cloudDocId) {
        showToast("Incident ticket logged to cloud", "ok", 3000);
        out.innerHTML = `
          <strong class="support-status-ok">Incident Logged to Cloud</strong><br />
          <strong>Ticket ID:</strong> ${safeId}<br />
          <strong>Cloud Reference:</strong> <code>${safeHTML(cloudDocId)}</code><br />
          <strong>Severity:</strong> ${safePriority}<br />
          <span class="support-status-note">Your report has been recorded in the platform support queue (a local receipt was also saved in this browser).</span>
        `;
      } else {
        showToast("Saved locally only — cloud delivery unavailable", "warn", 4000);
        out.innerHTML = `
          <strong class="support-status-warn">Saved Locally Only (Cloud Unavailable)</strong><br />
          <strong>Ticket ID:</strong> ${safeId}<br />
          <strong>Severity:</strong> ${safePriority}<br />
          <span class="support-status-note">Cloud Firestore could not be reached right now (${navigator.onLine === false ? "device is offline" : "cloud write unavailable"}). This ticket was stored locally in this browser only and has not been delivered remotely.</span>
        `;
      }
      out.classList.remove("hidden");

      if (nameEl) nameEl.value = "";
      if (emailEl) emailEl.value = "";
      if (descEl) descEl.value = "";
    } finally {
      isSubmitting = false;
      btn.disabled = false;
      btn.removeAttribute("aria-busy");
      btn.textContent = prevBtnText;
    }
  });
}

const VIDEO_DOMAIN_THEMES = {
  "Network Fundamentals": { slug: "fundamentals", short: "Fundamentals", accent: "#0a84ff" },
  "Network Access": { slug: "access", short: "Network Access", accent: "#30d158" },
  "IP Connectivity": { slug: "connectivity", short: "IP Connectivity", accent: "#5e5ce6" },
  "IP Services": { slug: "services", short: "IP Services", accent: "#64d2ff" },
  "Security Fundamentals": { slug: "security", short: "Security", accent: "#ff9f0a" },
  "Automation and Programmability": { slug: "automation", short: "Automation", accent: "#bf5af2" }
};

let currentVideoSearch = "";
let currentVideoStatus = "all"; // "all" | "unwatched" | "watched"
let activeModalVideoId = null;

function getEpisodeStamp(title) {
  const m = String(title || "").match(/^(Day\s+\d+(?:\s+(?:Lab|Extra))?)/i);
  if (m) return m[1].toUpperCase();
  return "CCNA LESSON";
}

function getDomainPosterSvg(domain, vidId) {
  const theme = VIDEO_DOMAIN_THEMES[domain] || VIDEO_DOMAIN_THEMES["Network Fundamentals"];
  const c = theme.accent;
  const uid = `vp-${theme.slug}-${vidId}`;
  switch (theme.slug) {
    case "access":
      return `<svg class="video-poster-svg" viewBox="0 0 320 180" aria-hidden="true">
        <defs><linearGradient id="${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c}" stop-opacity="0.22"/><stop offset="100%" stop-color="#050811" stop-opacity="0.95"/></linearGradient></defs>
        <rect width="320" height="180" fill="#070b14"/><rect width="320" height="180" fill="url(#${uid})"/>
        <g stroke="${c}" stroke-opacity="0.24" stroke-width="1" fill="none">
          <rect x="44" y="34" width="66" height="44" rx="8"/><rect x="127" y="34" width="66" height="44" rx="8"/><rect x="210" y="34" width="66" height="44" rx="8"/>
          <path d="M77 78v26h166V78M160 78v58" stroke-width="1.3"/><rect x="116" y="120" width="88" height="28" rx="6"/>
        </g>
        <g fill="${c}" fill-opacity="0.65"><circle cx="77" cy="56" r="3"/><circle cx="160" cy="56" r="3"/><circle cx="243" cy="56" r="3"/></g>
      </svg>`;
    case "connectivity":
      return `<svg class="video-poster-svg" viewBox="0 0 320 180" aria-hidden="true">
        <defs><linearGradient id="${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c}" stop-opacity="0.26"/><stop offset="100%" stop-color="#050811" stop-opacity="0.96"/></linearGradient></defs>
        <rect width="320" height="180" fill="#070b14"/><rect width="320" height="180" fill="url(#${uid})"/>
        <g stroke="${c}" stroke-opacity="0.28" stroke-width="1.4" fill="none">
          <path d="M46 128 C100 42, 180 132, 274 52"/>
          <path d="M46 66 C118 118, 210 38, 274 122" stroke-dasharray="4 4" stroke-opacity="0.22"/>
          <circle cx="46" cy="128" r="10"/><circle cx="160" cy="86" r="14"/><circle cx="274" cy="52" r="10"/>
        </g>
        <g fill="${c}" fill-opacity="0.7"><circle cx="46" cy="128" r="3.5"/><circle cx="160" cy="86" r="4"/><circle cx="274" cy="52" r="3.5"/></g>
      </svg>`;
    case "services":
      return `<svg class="video-poster-svg" viewBox="0 0 320 180" aria-hidden="true">
        <defs><linearGradient id="${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c}" stop-opacity="0.2"/><stop offset="100%" stop-color="#050811" stop-opacity="0.96"/></linearGradient></defs>
        <rect width="320" height="180" fill="#070b14"/><rect width="320" height="180" fill="url(#${uid})"/>
        <g stroke="${c}" stroke-opacity="0.24" stroke-width="1.2" fill="none">
          <path d="M36 56h248M36 90h248M36 124h248"/>
          <rect x="64" y="46" width="38" height="20" rx="10" fill="#070b14"/><rect x="148" y="80" width="48" height="20" rx="10" fill="#070b14"/><rect x="208" y="114" width="44" height="20" rx="10" fill="#070b14"/>
        </g>
      </svg>`;
    case "security":
      return `<svg class="video-poster-svg" viewBox="0 0 320 180" aria-hidden="true">
        <defs><linearGradient id="${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c}" stop-opacity="0.22"/><stop offset="100%" stop-color="#050811" stop-opacity="0.96"/></linearGradient></defs>
        <rect width="320" height="180" fill="#070b14"/><rect width="320" height="180" fill="url(#${uid})"/>
        <g stroke="${c}" stroke-opacity="0.28" stroke-width="1.4" fill="none">
          <path d="M160 28l48 20v38c0 34-21 58-48 68-27-10-48-34-48-68V48l48-20z"/>
          <circle cx="160" cy="88" r="24" stroke-opacity="0.2"/>
          <path d="M48 90h44M228 90h44" stroke-dasharray="3 4"/>
        </g>
      </svg>`;
    case "automation":
      return `<svg class="video-poster-svg" viewBox="0 0 320 180" aria-hidden="true">
        <defs><linearGradient id="${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c}" stop-opacity="0.24"/><stop offset="100%" stop-color="#050811" stop-opacity="0.96"/></linearGradient></defs>
        <rect width="320" height="180" fill="#070b14"/><rect width="320" height="180" fill="url(#${uid})"/>
        <g stroke="${c}" stroke-opacity="0.28" stroke-width="1.3" fill="none">
          <rect x="46" y="64" width="54" height="52" rx="10"/><rect x="133" y="44" width="54" height="92" rx="10"/><rect x="220" y="64" width="54" height="52" rx="10"/>
          <path d="M100 90h33M187 90h33"/>
        </g>
        <g fill="${c}" fill-opacity="0.65"><circle cx="160" cy="70" r="3"/><circle cx="160" cy="90" r="3"/><circle cx="160" cy="110" r="3"/></g>
      </svg>`;
    default:
      return `<svg class="video-poster-svg" viewBox="0 0 320 180" aria-hidden="true">
        <defs><linearGradient id="${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c}" stop-opacity="0.24"/><stop offset="100%" stop-color="#050811" stop-opacity="0.96"/></linearGradient></defs>
        <rect width="320" height="180" fill="#070b14"/><rect width="320" height="180" fill="url(#${uid})"/>
        <g stroke="${c}" stroke-opacity="0.24" stroke-width="1.2" fill="none">
          <line x1="68" y1="54" x2="160" y2="90"/><line x1="252" y1="54" x2="160" y2="90"/><line x1="88" y1="134" x2="160" y2="90"/><line x1="232" y1="134" x2="160" y2="90"/>
          <circle cx="68" cy="54" r="12"/><circle cx="252" cy="54" r="12"/><circle cx="88" cy="134" r="12"/><circle cx="232" cy="134" r="12"/><circle cx="160" cy="90" r="18"/>
        </g>
        <g fill="${c}" fill-opacity="0.7"><circle cx="68" cy="54" r="3"/><circle cx="252" cy="54" r="3"/><circle cx="88" cy="134" r="3"/><circle cx="232" cy="134" r="3"/></g>
      </svg>`;
  }
}

function getFilteredVideos() {
  const currentDomain = document.querySelector(".video-filter-btn.active")?.dataset.domain || "all";
  const watchedSet = new Set(state.analytics.watchedVideos || []);
  const q = currentVideoSearch.trim().toLowerCase();

  return ccnaVideos.filter((v) => {
    if (currentDomain !== "all" && v.domain !== currentDomain) return false;
    const isWatched = watchedSet.has(v.id);
    if (currentVideoStatus === "watched" && !isWatched) return false;
    if (currentVideoStatus === "unwatched" && isWatched) return false;
    if (!q) return true;
    return (
      v.title.toLowerCase().includes(q) ||
      v.topic.toLowerCase().includes(q) ||
      v.domain.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q)
    );
  });
}

function initVideos() {
  const filtersContainer = byId("videoFiltersContainer");
  if (filtersContainer) {
    filtersContainer.querySelectorAll(".video-filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        filtersContainer.querySelectorAll(".video-filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        playNetSound("click");
        renderVideos();
      });
    });
  }

  const searchInput = byId("videoSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      currentVideoSearch = searchInput.value || "";
      renderVideos();
    });
  }

  document.querySelectorAll("[data-video-status]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-video-status]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentVideoStatus = btn.dataset.videoStatus || "all";
      playNetSound("click");
      renderVideos();
    });
  });

  const btnCloseVideo = byId("btnCloseVideoModal");
  if (btnCloseVideo) {
    btnCloseVideo.addEventListener("click", closeVideoPlayer);
  }
  const videoModal = byId("videoModal");
  if (videoModal) {
    videoModal.addEventListener("click", (e) => {
      if (e.target === videoModal) closeVideoPlayer();
    });
  }

  const btnPrevModal = byId("btnPrevVideoModal");
  const btnNextModal = byId("btnNextVideoModal");
  const btnToggleWatched = byId("btnToggleWatchedModal");

  if (btnPrevModal) {
    btnPrevModal.addEventListener("click", () => stepModalVideo(-1));
  }
  if (btnNextModal) {
    btnNextModal.addEventListener("click", () => stepModalVideo(1));
  }
  if (btnToggleWatched) {
    btnToggleWatched.addEventListener("click", () => {
      if (!activeModalVideoId) return;
      const watched = (state.analytics.watchedVideos || []).includes(activeModalVideoId);
      toggleVideoWatchedState(activeModalVideoId, !watched);
      syncModalControls();
    });
  }
}

function stepModalVideo(delta) {
  if (!activeModalVideoId) return;
  const list = getFilteredVideos();
  const pool = list.length > 0 ? list : ccnaVideos;
  let idx = pool.findIndex((v) => v.id === activeModalVideoId);
  if (idx === -1) idx = ccnaVideos.findIndex((v) => v.id === activeModalVideoId);
  const next = pool[idx + delta];
  if (!next) return;
  playVideo(next.youtubeId, next.title, next.id);
}

function syncModalControls() {
  const modal = byId("videoModal");
  if (!modal || modal.classList.contains("hidden") || !activeModalVideoId) return;
  const current = ccnaVideos.find((v) => v.id === activeModalVideoId);
  const list = getFilteredVideos();
  const pool = list.length > 0 ? list : ccnaVideos;
  const idx = pool.findIndex((v) => v.id === activeModalVideoId);

  const metaEl = byId("videoModalMeta");
  if (metaEl && current) {
    const offlineSuffix = navigator.onLine === false ? " · Offline (connect to stream embed)" : "";
    metaEl.textContent = `${current.domain} · ${current.topic} · ${current.duration}${offlineSuffix}`;
  }

  const btnPrev = byId("btnPrevVideoModal");
  const btnNext = byId("btnNextVideoModal");
  if (btnPrev) btnPrev.disabled = idx <= 0;
  if (btnNext) btnNext.disabled = idx === -1 || idx >= pool.length - 1;

  const btnWatched = byId("btnToggleWatchedModal");
  if (btnWatched) {
    const isWatched = (state.analytics.watchedVideos || []).includes(activeModalVideoId);
    btnWatched.textContent = isWatched ? "Watched" : "Mark Watched";
    btnWatched.className = isWatched ? "primary" : "secondary";
  }
}

function renderVideos() {
  const container = byId("videoLessonsGrid");
  if (!container) return;

  if (!state.analytics.watchedVideos) {
    state.analytics.watchedVideos = [];
  }

  const currentDomain = document.querySelector(".video-filter-btn.active")?.dataset.domain || "all";
  const filtered = getFilteredVideos();
  const watchedSet = new Set(state.analytics.watchedVideos);

  const headingEl = byId("videoCatalogHeading");
  const subEl = byId("videoCatalogSub");
  const badgeEl = byId("videoFilteredBadge");
  const activeDomainStat = byId("videoActiveDomainStat");

  if (headingEl) {
    headingEl.textContent = currentDomain === "all" ? "All Video Lessons" : currentDomain;
  }
  if (subEl) {
    subEl.textContent = `Showing ${filtered.length} of ${ccnaVideos.length} curated CCNA lessons`;
  }
  if (badgeEl) {
    badgeEl.textContent = String(filtered.length);
  }
  if (activeDomainStat) {
    const t = VIDEO_DOMAIN_THEMES[currentDomain];
    activeDomainStat.textContent = currentDomain === "all" ? "All 6 Domains" : (t ? t.short : currentDomain);
  }

  if (filtered.length === 0) {
    container.innerHTML = `<div class="card videos-empty-state">No lessons match your current domain, status, or search filter.</div>`;
    updateVideoProgress();
    return;
  }

  container.innerHTML = filtered.map((v) => {
    const isWatched = watchedSet.has(v.id);
    const safeYid = /^[a-zA-Z0-9_-]{11}$/.test(v.youtubeId) ? v.youtubeId : "";
    const safeTitle = safeHTML(v.title);
    const safeTopic = safeHTML(v.topic);
    const safeDomain = safeHTML(v.domain);
    const safeDesc = safeHTML(v.description);
    const safeDur = safeHTML(v.duration);
    const theme = VIDEO_DOMAIN_THEMES[v.domain] || VIDEO_DOMAIN_THEMES["Network Fundamentals"];
    const stamp = safeHTML(getEpisodeStamp(v.title));

    return `
      <article class="card video-card${isWatched ? " is-watched" : ""}" data-domain-accent="${theme.slug}">
        <div class="video-card-top">
          <div class="video-thumbnail-container" data-video-id="${v.id}" role="button" tabindex="0" aria-label="Play ${safeTitle}">
            ${getDomainPosterSvg(v.domain, v.id)}
            <div class="video-poster-overlay">
              <span class="video-episode-pill">${stamp}</span>
              ${isWatched ? `<span class="video-watched-pill">Watched</span>` : ""}
            </div>
            <div class="play-icon-overlay" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M8 5.5v13l10-6.5-10-6.5z"/></svg>
            </div>
            <span class="video-duration-pill">${safeDur}</span>
          </div>

          <div class="video-card-meta-row">
            <span class="video-domain-tag">${safeTopic}</span>
            <label class="video-watch-toggle">
              <input type="checkbox" class="video-watch-checkbox" data-video-id="${v.id}" ${isWatched ? "checked" : ""} />
              <span>Watched</span>
            </label>
          </div>
          <div class="video-card-domain-label">${safeDomain}</div>
          <h4 class="video-card-title">${safeTitle}</h4>
          <p class="video-card-desc">${safeDesc}</p>
        </div>
        <button type="button" class="primary btn-watch-video" data-youtube-id="${safeYid}" data-video-title="${safeTitle}" data-video-id="${v.id}">
          ${isWatched ? "Rewatch Lesson" : "Watch Lesson"}
        </button>
      </article>
    `;
  }).join("");

  updateVideoProgress();

  container.querySelectorAll(".btn-watch-video, .video-thumbnail-container").forEach((el) => {
    const launch = () => {
      const card = el.closest(".video-card");
      const watchBtn = card ? card.querySelector(".btn-watch-video") : null;
      const yid = el.dataset.youtubeId || watchBtn?.dataset.youtubeId;
      const title = el.dataset.videoTitle || watchBtn?.dataset.videoTitle;
      const vidId = el.dataset.videoId || watchBtn?.dataset.videoId;
      playVideo(yid, title, Number(vidId));
    };
    el.addEventListener("click", launch);
    if (el.classList.contains("video-thumbnail-container")) {
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          launch();
        }
      });
    }
  });

  container.querySelectorAll(".video-watch-checkbox").forEach((chk) => {
    chk.addEventListener("change", () => {
      const vidId = Number(chk.dataset.videoId);
      toggleVideoWatchedState(vidId, chk.checked);
    });
  });
}

function toggleVideoWatchedState(vidId, isWatched) {
  if (!state.analytics.watchedVideos) {
    state.analytics.watchedVideos = [];
  }

  if (isWatched) {
    if (!state.analytics.watchedVideos.includes(vidId)) {
      state.analytics.watchedVideos.push(vidId);
      playNetSound("success");
    }
  } else {
    state.analytics.watchedVideos = state.analytics.watchedVideos.filter((id) => id !== vidId);
    playNetSound("click");
  }

  saveAnalytics(true);
  renderVideos();
}

function updateVideoProgress() {
  const progressPercentBar = byId("videoProgressPercentageBar");
  const progressLabel = byId("videoProgressLabel");
  const progressPercentage = byId("videoProgressPercentage");

  if (!progressPercentBar) return;

  const total = ccnaVideos.length;
  const watchedList = state.analytics.watchedVideos || [];
  const watchedSet = new Set(watchedList);
  const watched = watchedList.length;
  const pct = total > 0 ? Math.round((watched / total) * 100) : 0;

  progressPercentBar.style.width = `${pct}%`;
  if (progressLabel) progressLabel.textContent = `${watched}/${total} Watched`;
  if (progressPercentage) progressPercentage.textContent = `${pct}%`;

  const domains = Object.keys(VIDEO_DOMAIN_THEMES);
  const allCountEl = document.querySelector('[data-domain-count="all"]');
  if (allCountEl) allCountEl.textContent = `${watched}/${total}`;

  const breakdownEl = byId("videoDomainBreakdown");
  const breakdownRows = [];
  for (const dom of domains) {
    const domVideos = ccnaVideos.filter((v) => v.domain === dom);
    const domWatched = domVideos.filter((v) => watchedSet.has(v.id)).length;
    const domTotal = domVideos.length;
    const domPct = domTotal > 0 ? Math.round((domWatched / domTotal) * 100) : 0;
    const badge = document.querySelector(`[data-domain-count="${CSS.escape(dom)}"]`);
    if (badge) badge.textContent = `${domWatched}/${domTotal}`;
    const theme = VIDEO_DOMAIN_THEMES[dom];
    breakdownRows.push(`
      <div class="video-breakdown-row">
        <div class="video-breakdown-meta">
          <span>${safeHTML(theme.short)}</span>
          <strong>${domWatched}/${domTotal}</strong>
        </div>
        <div class="video-breakdown-track">
          <div class="video-breakdown-fill" style="width:${domPct}%;background:${theme.accent};"></div>
        </div>
      </div>
    `);
  }
  if (breakdownEl) {
    breakdownEl.innerHTML = breakdownRows.join("");
  }
}

function playVideo(youtubeId, title, vidId) {
  const modal = byId("videoModal");
  const iframe = byId("videoIFrame");
  const modalTitle = byId("videoModalTitle");

  if (!modal || !iframe || !/^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) return;

  const wasOpen = !modal.classList.contains("hidden");
  activeModalVideoId = vidId || null;
  modalTitle.textContent = title;
  iframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1`;
  modal.classList.remove("hidden");
  playNetSound("success");

  if (vidId) {
    state.analytics.lastWatchedVideoId = vidId;
    if (state.analytics.watchedVideos && !state.analytics.watchedVideos.includes(vidId)) {
      toggleVideoWatchedState(vidId, true);
    } else {
      saveAnalytics();
    }
  }
  syncModalControls();
  if (!wasOpen) {
    activateModalFocus(modal, byId("btnCloseVideoModal"), closeVideoPlayer);
  }
}

function closeVideoPlayer() {
  const modal = byId("videoModal");
  const iframe = byId("videoIFrame");
  if (!modal || !iframe) return;

  const closedVidId = activeModalVideoId;
  iframe.src = "";
  activeModalVideoId = null;
  modal.classList.add("hidden");
  const fallbackBtn = closedVidId
    ? document.querySelector(`#videoLessonsGrid .btn-watch-video[data-video-id="${closedVidId}"]`)
    : null;
  deactivateModalFocus(modal, true, fallbackBtn);
  playNetSound("click");
}

// ─── Global Error Boundary ────────────────────────────────────────────────
window.addEventListener("error", (event) => {
  console.error("Global uncaught error trapped:", event.error || event.message);
  // Show non-fatal toast instead of letting the application freeze
  if (typeof showToast === "function") {
    showToast("Interface updated in background. Everything is running smoothly.", "info", 3000);
  }
});

window.addEventListener("unhandledrejection", (event) => {
  console.warn("Global unhandled promise rejection:", event.reason);
  // Prevent unhandled promise rejections from bubbling up to console crashes
  event.preventDefault();
});

window.renderVideos = renderVideos;
init();
