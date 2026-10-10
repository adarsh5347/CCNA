/**
 * NetOps Command — Admin & NOC Station Operations Module
 * Provides platform telemetry, station diagnostics, and operational controls.
 * Zero subscription dependencies and resilient local/cloud status reporting.
 */

import { state, byId, showToast, playNetSound } from "./core.js";
import { isFirebaseEnabled, getFirestoreDB } from "./firebase.js";

export async function checkAdminStatus() {
  const adminNavBtn = byId("btnNavAdmin");
  if (adminNavBtn) {
    adminNavBtn.style.display = "inline-flex";
  }
  return true;
}

export function isAdmin() {
  return true;
}

export async function renderAdminDashboard() {
  const statsEl = byId("adminStats");
  const activityEl = byId("adminRecentActivity");

  const totalQuestions = (state.bank && state.bank.length) || 328;
  const labsCount = 10;
  const videosCount = 126;
  const userXp = state.analytics ? (state.analytics.xp || 0) : 0;
  const userStreak = state.analytics ? (state.analytics.streak || 0) : 0;
  const userLabsCompleted = state.analytics ? (state.analytics.labsCompleted || 0) : 0;
  const isOnline = navigator.onLine;

  if (statsEl) {
    statsEl.innerHTML = `
      <div class="grid stats" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;">
        <div class="stat">
          <div class="k">Platform Mode</div>
          <div class="v" style="color:#10b981;font-size:16px;">100% UNLOCKED</div>
        </div>
        <div class="stat">
          <div class="k">Question Bank</div>
          <div class="v" style="color:#00f2fe;">${totalQuestions} Drills</div>
        </div>
        <div class="stat">
          <div class="k">Virtual Labs</div>
          <div class="v" style="color:#10b981;">${labsCount} / 10 Active</div>
        </div>
        <div class="stat">
          <div class="k">Video Lessons</div>
          <div class="v" style="color:#f59e0b;">${videosCount} Categorized</div>
        </div>
        <div class="stat">
          <div class="k">Network Status</div>
          <div class="v" style="color:${isOnline ? "#10b981" : "#f59e0b"};">${isOnline ? "Online (Cloud)" : "Offline (PWA)"}</div>
        </div>
        <div class="stat">
          <div class="k">Session XP</div>
          <div class="v" style="color:#00f2fe;">${userXp} XP</div>
        </div>
        <div class="stat">
          <div class="k">Labs Passed</div>
          <div class="v" style="color:#a78bfa;">${userLabsCompleted} / 10</div>
        </div>
        <div class="stat">
          <div class="k">Active Streak</div>
          <div class="v" style="color:#f59e0b;">🔥 ${userStreak} Days</div>
        </div>
      </div>
    `;
  }

  if (activityEl) {
    const currentUid = state.user ? state.user.uid : "Local Guest Engineer";
    const currentName = state.user ? (state.user.displayName || state.user.email) : "Adarsh Poojari (Owner)";
    
    activityEl.innerHTML = `
      <div class="card" style="border:1px solid var(--border-color);padding:20px;margin-top:20px;">
        <h4 style="margin-top:0;color:#00f2fe;font-size:15px;">Station Controls & Utilities</h4>
        <p style="color:var(--text-muted);font-size:12px;margin-bottom:16px;">
          Active Station: <strong>${currentName}</strong> &nbsp;·&nbsp; UID: <code>${currentUid}</code>
        </p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <button id="adminBtnForceRefresh" class="secondary" style="font-size:12px;padding:8px 14px;">
            🔄 Force Reload PWA Cache
          </button>
          <button id="adminBtnTestAudio" class="secondary" style="font-size:12px;padding:8px 14px;">
            🔊 Test Audio Engine
          </button>
          <button id="adminBtnExportAnalytics" class="secondary" style="font-size:12px;padding:8px 14px;">
            💾 Export Station Analytics
          </button>
        </div>
      </div>
    `;

    // Bind station utility buttons
    const btnRefresh = byId("adminBtnForceRefresh");
    if (btnRefresh && !btnRefresh._bound) {
      btnRefresh._bound = true;
      btnRefresh.addEventListener("click", () => {
        showToast("Updating Service Worker and refreshing...", "info");
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.getRegistrations().then(regs => {
            for (let reg of regs) reg.update();
            setTimeout(() => window.location.reload(true), 600);
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
          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.analytics, null, 2));
          const dlAnchor = document.createElement("a");
          dlAnchor.setAttribute("href", dataStr);
          dlAnchor.setAttribute("download", `ccna_analytics_backup_${Date.now()}.json`);
          dlAnchor.click();
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
