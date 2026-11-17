/**
 * NetOps Command — Account Dashboard Module
 * Shows engineer authentication status, cloud sync state, portable backups, and full-access status.
 */

import { state, byId, safeHTML } from "./core.js?v=78";
import { exportAnalyticsProgress } from "./quiz-engine.js?v=83";
import { loginWithGoogle, logout, isFirebaseEnabled } from "./firebase.js?v=78";

let _accountControlsBound = false;

function getInitials(name, email) {
  const src = String(name || email || "Guest").trim();
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase() || "G";
}

function bindAccountControls() {
  if (_accountControlsBound) return;
  _accountControlsBound = true;

  const btnSignIn = byId("accountBtnSignIn");
  if (btnSignIn) {
    btnSignIn.addEventListener("click", () => {
      const topSignIn = byId("btnSignIn");
      if (topSignIn) topSignIn.click();
      else loginWithGoogle().catch(() => {});
    });
  }

  const btnSignOut = byId("accountBtnSignOut");
  if (btnSignOut) {
    btnSignOut.addEventListener("click", () => {
      const topSignOut = byId("btnSignOut");
      if (topSignOut) topSignOut.click();
      else logout().catch(() => {});
    });
  }

  const btnExport = byId("accountBtnExport");
  if (btnExport) {
    btnExport.addEventListener("click", () => {
      exportAnalyticsProgress();
    });
  }

  const btnImport = byId("accountBtnImport");
  const importInput = byId("importProgressInput");
  if (btnImport && importInput) {
    btnImport.addEventListener("click", () => {
      importInput.value = "";
      importInput.click();
    });
  }
}

export function renderAccountPage() {
  bindAccountControls();
  renderAccountHeader();
  renderAccountSyncAndStats();
  renderCurrentPlan();
  renderPaymentHistory();
}

function renderAccountHeader() {
  const nameEl = byId("accountUserName");
  const emailEl = byId("accountUserEmail");
  const photoEl = byId("accountUserPhoto");
  const fallbackEl = byId("accountAvatarFallback");
  const badgeEl = byId("accountAuthBadge");
  const btnSignIn = byId("accountBtnSignIn");
  const btnSignOut = byId("accountBtnSignOut");

  const isSignedIn = Boolean(state.user);
  const displayName = isSignedIn
    ? (state.user.displayName || state.user.email || "Signed-In Engineer")
    : "Guest Engineer";

  if (nameEl) nameEl.textContent = displayName;

  if (emailEl) {
    emailEl.textContent = isSignedIn
      ? (state.user.email || "Authenticated Google Account")
      : "Guest session · Progress saved in local browser storage";
  }

  if (badgeEl) {
    badgeEl.textContent = isSignedIn ? "Signed In · Cloud Sync Ready" : "Guest Mode · Local Only";
    badgeEl.classList.toggle("is-authenticated", isSignedIn);
  }

  if (fallbackEl) {
    fallbackEl.textContent = isSignedIn ? getInitials(state.user.displayName, state.user.email) : "GE";
  }

  if (photoEl) {
    photoEl.onerror = () => {
      photoEl.style.display = "none";
      if (fallbackEl) fallbackEl.style.display = "flex";
    };
    if (isSignedIn && state.user.photoURL) {
      photoEl.src = state.user.photoURL;
      photoEl.alt = `${displayName} profile photo`;
      photoEl.style.display = "block";
      if (fallbackEl) fallbackEl.style.display = "none";
    } else {
      photoEl.removeAttribute("src");
      photoEl.alt = "";
      photoEl.style.display = "none";
      if (fallbackEl) fallbackEl.style.display = "flex";
    }
  }

  if (btnSignIn) btnSignIn.classList.toggle("hidden", isSignedIn);
  if (btnSignOut) btnSignOut.classList.toggle("hidden", !isSignedIn);
}

function renderAccountSyncAndStats() {
  const syncEl = byId("accountSyncStatus");
  const statsEl = byId("accountSessionStats");
  const a = state.analytics || {};

  if (syncEl) {
    if (!state.user) {
      syncEl.textContent = "Sign in with Google to synchronize quiz attempts, streaks, watched lessons, and lab completions across devices.";
    } else if (navigator.onLine === false) {
      syncEl.textContent = "Offline mode active — telemetry changes are persisted locally and sync when connectivity returns.";
    } else if (isFirebaseEnabled()) {
      syncEl.textContent = `Cloud sync active for ${state.user.email || state.user.uid}. Portable JSON backups remain available below.`;
    } else {
      syncEl.textContent = "Local browser persistence active.";
    }
  }

  if (statsEl) {
    const xp = Number(a.xp || 0);
    const totalQ = Number(a.totalQ || 0);
    const labsDone = Math.min(10, Number(a.labsCompleted || (a.completedLabIds || []).length || 0));
    const videosDone = Array.isArray(a.watchedVideos) ? a.watchedVideos.length : 0;
    statsEl.innerHTML = `
      <div class="stat"><div class="k">Total XP</div><div class="v">${safeHTML(String(xp))}</div></div>
      <div class="stat"><div class="k">Questions Answered</div><div class="v">${safeHTML(String(totalQ))}</div></div>
      <div class="stat"><div class="k">Virtual Labs</div><div class="v">${safeHTML(String(labsDone))} / 10</div></div>
      <div class="stat"><div class="k">Videos Watched</div><div class="v">${safeHTML(String(videosDone))} / 126</div></div>
    `;
  }
}

function renderCurrentPlan() {
  const planEl = byId("accountPlanLabel");
  const planDetailsEl = byId("accountPlanDetails");
  const upgradeSection = byId("accountUpgradeSection");

  if (planEl) planEl.textContent = "Full Access (100% Free)";

  if (planDetailsEl) {
    planDetailsEl.innerHTML = `
      <p class="account-access-ok">All Features Unlocked — 635 blueprint questions, 48 chapters, 10 virtual IOS CLI labs, and 126 video lessons require no subscription.</p>
      <p class="account-access-note">Status: Permanent Unrestricted Access</p>
    `;
  }
  if (upgradeSection) upgradeSection.classList.add("hidden");
}

async function renderPaymentHistory() {
  const historyEl = byId("accountPaymentHistory");
  if (!historyEl) return;
  historyEl.innerHTML = `<p class="account-history-note">This platform is 100% free — no billing or payment records exist.</p>`;
}

window.renderAccountPage = renderAccountPage;
