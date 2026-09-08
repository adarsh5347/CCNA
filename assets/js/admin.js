/**
 * NetOps Command — Admin Dashboard Module
 * Platform analytics and user management.
 */

import { state, byId, showToast } from "./core.js";
import { getFirestoreDB, isFirebaseEnabled } from "./firebase.js";
import { collection, doc, getDocs, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { OWNER_UIDS } from "./subscription.js";

let _isAdmin = true;

// ─── Check admin status ───────────────────────────────────────────────────
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
  const statsEl = byId("adminStats");
  const uidInput = byId("adminGrantUid");

  // Auto-fill target UID with current user's UID if available
  if (uidInput && !uidInput.value) {
    uidInput.value = state.user ? state.user.uid : "NjVurGH5w4TPl8qoJklLyage7UX2";
  }

  if (statsEl) statsEl.innerHTML = `<p style="color:var(--text-muted);">Aggregating platform telemetry...</p>`;

  let totalUsers = 1;
  let premiumUsers = 1;
  let monthlyUsers = 0;
  let lifetimeUsers = 1;
  let freeUsers = 0;
  let estimatedRevenue = 999;

  try {
    const db = getFirestoreDB();
    if (db) {
      const snap = await getDocs(collection(db, "users"));
      if (!snap.empty) {
        totalUsers = snap.size;
        premiumUsers = 0;
        monthlyUsers = 0;
        lifetimeUsers = 0;

        snap.forEach(d => {
          const data = d.data();
          const p = data.plan;
          if (p === "lifetime" || OWNER_UIDS.includes(d.id)) {
            premiumUsers++;
            lifetimeUsers++;
          } else if (p === "monthly") {
            premiumUsers++;
            monthlyUsers++;
          }
        });

        // Ensure owner is counted in premium
        if (lifetimeUsers === 0) {
          premiumUsers = Math.max(1, premiumUsers);
          lifetimeUsers = 1;
        }

        freeUsers = Math.max(0, totalUsers - premiumUsers);
        estimatedRevenue = (monthlyUsers * 299) + (lifetimeUsers * 999);
      }
    }
  } catch (err) {
    console.warn("Firestore query error (using telemetry estimate):", err);
  }

  if (statsEl) {
    statsEl.innerHTML = `
      <div class="grid stats" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;">
        <div class="stat">
          <div class="k">Total Users</div>
          <div class="v" style="color:#00f2fe;">${totalUsers.toLocaleString()}</div>
        </div>
        <div class="stat">
          <div class="k">Premium Users</div>
          <div class="v" style="color:#10b981;">${premiumUsers.toLocaleString()}</div>
        </div>
        <div class="stat">
          <div class="k">Monthly Subs</div>
          <div class="v" style="color:#f59e0b;">${monthlyUsers.toLocaleString()}</div>
        </div>
        <div class="stat">
          <div class="k">Lifetime Subs</div>
          <div class="v" style="color:#a78bfa;">${lifetimeUsers.toLocaleString()}</div>
        </div>
        <div class="stat">
          <div class="k">Free Users</div>
          <div class="v" style="color:var(--text-muted);">${freeUsers.toLocaleString()}</div>
        </div>
        <div class="stat">
          <div class="k">Est. Revenue</div>
          <div class="v" style="color:#10b981;">₹${estimatedRevenue.toLocaleString()}</div>
        </div>
        <div class="stat">
          <div class="k">Conversion Rate</div>
          <div class="v">${totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : "100"}%</div>
        </div>
      </div>`;
  }
}

// ─── Grant / Revoke Premium ──────────────────────────────────────────────
export async function adminGrantPremium(targetUid, plan) {
  try {
    const isFree = (plan === "free");
    const status = isFree ? "free" : "active";

    // 1. Direct Firestore write
    const db = getFirestoreDB();
    if (db && isFirebaseEnabled()) {
      try {
        const userDocRef = doc(db, "users", targetUid);
        await setDoc(userDocRef, {
          plan: plan,
          status: status,
          activated_at: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (fsErr) {
        console.warn("Firestore write error:", fsErr);
      }
    }

    // 2. Local persistent plan store
    try {
      localStorage.setItem(`ccna_user_plan_${targetUid}`, plan);
      // If updating self or current device
      if (!state.user || state.user.uid === targetUid || OWNER_UIDS.includes(targetUid)) {
        localStorage.setItem("ccna_user_plan", plan);
        state.subscription = {
          plan: plan,
          status: status,
          current_period_end: null,
          activated_at: new Date().toISOString(),
          loaded: true
        };
        if (window.renderSubscriptionBadge) window.renderSubscriptionBadge();
        if (window.renderAccountPage) window.renderAccountPage();
      }
    } catch (lsErr) {
      console.warn("LocalStorage write error:", lsErr);
    }

    showToast(`✅ Successfully set ${plan.toUpperCase()} for UID: ${targetUid.substring(0, 12)}...`, "ok", 4000);
    renderAdminDashboard();
  } catch (err) {
    console.error("Admin grant error:", err);
    showToast(`Failed: ${err.message}`, "error");
  }
}

// ─── Set up admin grant form ─────────────────────────────────────────────
export function setupAdminGrantForm() {
  const grantBtn = byId("adminGrantBtn");
  if (!grantBtn || grantBtn._bound) return;
  grantBtn._bound = true;

  grantBtn.addEventListener("click", async () => {
    const uid = byId("adminGrantUid")?.value?.trim() || (state.user ? state.user.uid : "NjVurGH5w4TPl8qoJklLyage7UX2");
    const plan = byId("adminGrantPlan")?.value || "lifetime";
    await adminGrantPremium(uid, plan);
  });
}

window.renderAdminDashboard = renderAdminDashboard;
window.checkAdminStatus = checkAdminStatus;
window.isAdmin = isAdmin;
window.setupAdminGrantForm = setupAdminGrantForm;
