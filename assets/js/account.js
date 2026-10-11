/**
 * NetOps Command — Account Dashboard Module
 * Shows user's engineer profile and platform full access status.
 */

import { state, byId } from "./core.js?v=74";

export function renderAccountPage() {
  renderAccountHeader();
  renderCurrentPlan();
  renderPaymentHistory();
}

function renderAccountHeader() {
  const nameEl = byId("accountUserName");
  const emailEl = byId("accountUserEmail");
  const photoEl = byId("accountUserPhoto");

  if (nameEl) nameEl.textContent = state.user ? (state.user.displayName || "Engineer") : "Engineer";
  if (emailEl) emailEl.textContent = state.user ? (state.user.email || "") : "Signed In";
  if (photoEl && state.user && state.user.photoURL) {
    photoEl.src = state.user.photoURL;
    photoEl.style.display = "block";
  }
}

function renderCurrentPlan() {
  const planEl = byId("accountPlanLabel");
  const planDetailsEl = byId("accountPlanDetails");
  const upgradeSection = byId("accountUpgradeSection");

  if (planEl) planEl.textContent = "⭐ Full Access (100% Free)";

  if (planDetailsEl) {
    planDetailsEl.innerHTML = `
      <p style="color:#10b981;font-size:13px;margin:0;">✅ All Features Fully Unlocked — All 10 virtual IOS labs, 120-question exam drills, and 126 video lectures are permanently accessible.</p>
      <p style="color:var(--text-muted);font-size:12px;margin:4px 0 0 0;">Status: Full Unlocked Access · No subscription or payments required.</p>
    `;
  }
  if (upgradeSection) upgradeSection.style.display = "none";
}

async function renderPaymentHistory() {
  const historyEl = byId("accountPaymentHistory");
  if (!historyEl) return;
  historyEl.innerHTML = `<p style="color:var(--text-muted);font-size:13px;">Platform is completely free — no billing or payment records needed.</p>`;
}

window.renderAccountPage = renderAccountPage;
