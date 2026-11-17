/**
 * NetOps Command — Admin & NOC Station Operations Module
 * Provides platform telemetry, station diagnostics, and operational controls.
 * Zero subscription dependencies and resilient local/cloud status reporting.
 */

import { state, byId, showToast, playNetSound, safeHTML } from "./core.js?v=78";
import { isOwnerUser } from "./subscription.js?v=78";
import { getDisplayStreak } from "./streak.js?v=78";

export function isAdmin() {
  return isOwnerUser(state.user);
}

// Show or hide every admin entry point depending on who is signed in
export async function checkAdminStatus() {
  const allowed = isAdmin();
  document.querySelectorAll('[data-page="admin"]').forEach((el) => {
    el.style.display = allowed ? "" : "none";
  });
  return allowed;
}

export async function renderAdminDashboard() {
  const statsEl = byId("adminStats");
  const activityEl = byId("adminRecentActivity");

  if (!isAdmin() || !state.user) {
    if (statsEl) {
      statsEl.innerHTML = `<div class="output admin-denied-banner" role="alert">Administrator authentication required to access NOC Command Station telemetry.</div>`;
    }
    if (activityEl) {
      activityEl.innerHTML = "";
    }
    return;
  }

  const totalQuestions = (state.bank && state.bank.length) || 635;
  const labsCount = 10;
  const videosCount = 126;
  const userXp = state.analytics ? (state.analytics.xp || 0) : 0;
  const userStreak = getDisplayStreak(state.analytics);
  const streakUnit = userStreak === 1 ? "Day" : "Days";
  const userLabsCompleted = state.analytics ? (state.analytics.labsCompleted || 0) : 0;
  const isOnline = navigator.onLine;

  if (statsEl) {
    statsEl.innerHTML = `
      <div class="grid stats admin-stats-grid">
        <div class="stat">
          <div class="k">Platform Mode</div>
          <div class="v admin-val-success">100% UNLOCKED</div>
        </div>
        <div class="stat">
          <div class="k">Question Bank</div>
          <div class="v admin-val-tint">${totalQuestions} Drills</div>
        </div>
        <div class="stat">
          <div class="k">Virtual Labs</div>
          <div class="v admin-val-success">${labsCount} / 10 Active</div>
        </div>
        <div class="stat">
          <div class="k">Video Lessons</div>
          <div class="v admin-val-warn">${videosCount} Categorized</div>
        </div>
        <div class="stat">
          <div class="k">Network Status</div>
          <div class="v ${isOnline ? "admin-val-success" : "admin-val-warn"}">${isOnline ? "Online (Cloud)" : "Offline (PWA)"}</div>
        </div>
        <div class="stat">
          <div class="k">Session XP</div>
          <div class="v admin-val-tint">${userXp} XP</div>
        </div>
        <div class="stat">
          <div class="k">Labs Passed</div>
          <div class="v admin-val-main">${userLabsCompleted} / 10</div>
        </div>
        <div class="stat">
          <div class="k">Active Streak</div>
          <div class="v admin-val-warn">${userStreak} ${streakUnit}</div>
        </div>
      </div>
    `;
  }

  if (activityEl) {
    const currentUid = state.user.uid;
    const currentName = state.user.displayName || state.user.email || "Authenticated Admin";

    activityEl.innerHTML = `
      <div class="card admin-controls-card">
        <h4 class="admin-controls-heading">Station Controls &amp; Utilities</h4>
        <p class="admin-controls-meta">
          Active Operator: <strong>${safeHTML(currentName)}</strong> · UID: <code>${safeHTML(currentUid)}</code>
        </p>
        <div class="admin-controls-actions">
          <button id="adminBtnForceRefresh" type="button" class="secondary">Force Reload PWA Cache</button>
          <button id="adminBtnTestAudio" type="button" class="secondary">Test Audio Engine</button>
          <button id="adminBtnExportAnalytics" type="button" class="secondary">Export Station Analytics</button>
        </div>
      </div>
    `;

    // Bind station utility buttons
    const btnRefresh = byId("adminBtnForceRefresh");
    if (btnRefresh && !btnRefresh._bound) {
      btnRefresh._bound = true;
      btnRefresh.addEventListener("click", () => {
        showToast("Checking Service Worker update...", "info");
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.getRegistrations().then((regs) => {
            for (const reg of regs) reg.update();
            setTimeout(() => window.location.reload(), 600);
          });
        } else {
          window.location.reload();
        }
      });
    }

    const btnAudio = byId("adminBtnTestAudio");
    if (btnAudio && !btnAudio._bound) {
      btnAudio._bound = true;
      btnAudio.addEventListener("click", () => {
        playNetSound("success");
        showToast("Audio synthesizer operational.", "ok");
      });
    }

    const btnExport = byId("adminBtnExportAnalytics");
    if (btnExport && !btnExport._bound) {
      btnExport._bound = true;
      btnExport.addEventListener("click", () => {
        try {
          const blob = new Blob([JSON.stringify(state.analytics, null, 2)], { type: "application/json" });
          const blobUrl = URL.createObjectURL(blob);
          const dlAnchor = document.createElement("a");
          dlAnchor.href = blobUrl;
          dlAnchor.download = `ccna_analytics_backup_${Date.now()}.json`;
          document.body.appendChild(dlAnchor);
          dlAnchor.click();
          dlAnchor.remove();
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
          showToast("Analytics export downloaded.", "ok");
        } catch (e) {
          showToast("Export failed: " + e.message, "error");
        }
      });
    }
  }
}

export function setupAdminGrantForm() {
  // Grant form obsolete: all accounts permanently possess full access.
}

window.renderAdminDashboard = renderAdminDashboard;
window.checkAdminStatus = checkAdminStatus;
window.isAdmin = isAdmin;
window.setupAdminGrantForm = setupAdminGrantForm;
