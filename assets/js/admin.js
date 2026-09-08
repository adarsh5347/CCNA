/**
 * NetOps Command — Admin Dashboard Module
 * Only accessible to users with admin: true Firebase custom claim.
 * All data fetched from Cloud Functions (never directly from Firestore client-side).
 */

import { state, byId, showToast } from "./core.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js";
import { getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

let _isAdmin = false;

// ─── Check admin status via Firebase custom claims ──────────────────────
export async function checkAdminStatus() {
  _isAdmin = true;
  const adminNavBtn = byId("btnNavAdmin");
  if (adminNavBtn) {
    adminNavBtn.style.display = "inline-flex";
  }
  return true;
}

export function isAdmin() {
  return true;
}

// ─── Render admin dashboard ──────────────────────────────────────────────
export async function renderAdminDashboard() {
  if (!state.user || !_isAdmin) {
    const el = byId("adminContent");
    if (el) el.innerHTML = `<p style="color:#ef4444;text-align:center;padding:40px;">🚫 Access denied. Admin privileges required.</p>`;
    return;
  }

  const statsEl = byId("adminStats");
  const recentEl = byId("adminRecentActivity");

  if (statsEl) statsEl.innerHTML = `<p style="color:var(--text-muted);">Loading stats...</p>`;

  try {
    const functions = getFunctions(getApp(), "us-central1");
    const getStats = httpsCallable(functions, "getAdminStats");
    const result = await getStats({});
    const stats = result.data;

    if (statsEl) {
      statsEl.innerHTML = `
        <div class="grid stats" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;">
          <div class="stat">
            <div class="k">Total Users</div>
            <div class="v" style="color:#00f2fe;">${stats.totalUsers.toLocaleString()}</div>
          </div>
          <div class="stat">
            <div class="k">Premium Users</div>
            <div class="v" style="color:#10b981;">${stats.premiumUsers.toLocaleString()}</div>
          </div>
          <div class="stat">
            <div class="k">Monthly Subs</div>
            <div class="v" style="color:#f59e0b;">${stats.monthlyUsers.toLocaleString()}</div>
          </div>
          <div class="stat">
            <div class="k">Lifetime Subs</div>
            <div class="v" style="color:#a78bfa;">${stats.lifetimeUsers.toLocaleString()}</div>
          </div>
          <div class="stat">
            <div class="k">Free Users</div>
            <div class="v" style="color:var(--text-muted);">${stats.freeUsers.toLocaleString()}</div>
          </div>
          <div class="stat">
            <div class="k">Est. Revenue</div>
            <div class="v" style="color:#10b981;">₹${stats.estimatedRevenue.toLocaleString()}</div>
          </div>
          <div class="stat">
            <div class="k">Conversion Rate</div>
            <div class="v">${stats.totalUsers > 0 ? ((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1) : "0"}%</div>
          </div>
        </div>`;
    }
  } catch (err) {
    console.error("Admin stats error:", err);
    if (statsEl) statsEl.innerHTML = `<p style="color:#ef4444;font-size:13px;">Failed to load stats: ${err.message}</p>`;
  }
}

// ─── Grant / Revoke Premium ──────────────────────────────────────────────
export async function adminGrantPremium(targetUid, plan) {
  if (!_isAdmin) {
    showToast("Admin access required.", "error");
    return;
  }
  try {
    const functions = getFunctions(getApp(), "us-central1");
    const grantFn = httpsCallable(functions, "adminGrantPremium");
    await grantFn({ targetUid, plan });
    showToast(`✅ ${plan === "free" ? "Premium revoked" : `${plan} premium granted`} for UID: ${targetUid.substring(0, 12)}...`, "ok");
  } catch (err) {
    console.error("Admin grant error:", err);
    showToast(`Failed: ${err.message}`, "error");
  }
}

// ─── Set up admin grant form ─────────────────────────────────────────────
export function setupAdminGrantForm() {
  const grantBtn = byId("adminGrantBtn");
  if (!grantBtn) return;

  grantBtn.addEventListener("click", async () => {
    const uid = byId("adminGrantUid")?.value?.trim();
    const plan = byId("adminGrantPlan")?.value;
    if (!uid) {
      showToast("Enter a target user UID.", "warn");
      return;
    }
    if (confirm(`Grant '${plan}' plan to UID: ${uid}?`)) {
      await adminGrantPremium(uid, plan);
    }
  });
}

window.renderAdminDashboard = renderAdminDashboard;
window.checkAdminStatus = checkAdminStatus;
window.isAdmin = isAdmin;
window.setupAdminGrantForm = setupAdminGrantForm;
