/**
 * NetOps Command — Account Dashboard Module
 * Shows user's subscription plan, payment history, and upgrade options.
 */

import { state, byId, showToast } from "./core.js";
import { getFirestoreDB, isFirebaseEnabled } from "./firebase.js";
import { isPremium, getSubscriptionLabel, showUpgradeModal, initiateCheckout } from "./subscription.js";
import { collection, getDocs, orderBy, query, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export function renderAccountPage() {
  renderAccountHeader();
  renderCurrentPlan();
  renderPaymentHistory();
}

function renderAccountHeader() {
  const nameEl = byId("accountUserName");
  const emailEl = byId("accountUserEmail");
  const photoEl = byId("accountUserPhoto");

  if (nameEl) nameEl.textContent = state.user ? (state.user.displayName || "Engineer") : "Guest";
  if (emailEl) emailEl.textContent = state.user ? (state.user.email || "") : "Not signed in";
  if (photoEl && state.user && state.user.photoURL) {
    photoEl.src = state.user.photoURL;
    photoEl.style.display = "block";
  }
}

function renderCurrentPlan() {
  const planEl = byId("accountPlanLabel");
  const planDetailsEl = byId("accountPlanDetails");
  const upgradeSection = byId("accountUpgradeSection");

  if (!state.user) {
    if (planEl) planEl.textContent = "Sign in to manage your account";
    return;
  }

  const sub = state.subscription;
  const label = getSubscriptionLabel();

  if (planEl) planEl.textContent = label;

  if (isPremium()) {
    if (planDetailsEl) {
      let detailHTML = "";
      if (sub.plan === "lifetime") {
        detailHTML = `<p style="color:#10b981;font-size:13px;margin:0;">✅ Lifetime access — no renewal needed</p>
        <p style="color:var(--text-muted);font-size:12px;margin:4px 0 0 0;">Activated: ${sub.activated_at ? new Date(sub.activated_at).toLocaleDateString("en-IN") : "N/A"}</p>`;
      } else if (sub.plan === "monthly") {
        const expiryDate = sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "N/A";
        const isExpired = sub.current_period_end && new Date(sub.current_period_end) < new Date();
        detailHTML = `
        <p style="color:${isExpired ? "#ef4444" : "#10b981"};font-size:13px;margin:0;">${isExpired ? "⚠️ Subscription expired" : "✅ Monthly plan active"}</p>
        <p style="color:var(--text-muted);font-size:12px;margin:4px 0 0 0;">${isExpired ? "Expired" : "Renews"}: ${expiryDate}</p>`;
        if (isExpired && upgradeSection) {
          upgradeSection.style.display = "block";
        }
      }
      planDetailsEl.innerHTML = detailHTML;
    }

    // Hide upgrade section if premium
    if (upgradeSection && sub.plan === "lifetime") upgradeSection.style.display = "none";
    if (upgradeSection && sub.plan === "monthly" && !isExpiredSub()) upgradeSection.style.display = "none";
  } else {
    if (planDetailsEl) {
      planDetailsEl.innerHTML = `<p style="color:var(--text-muted);font-size:13px;margin:0;">Free tier — upgrade to unlock all features</p>`;
    }
    if (upgradeSection) upgradeSection.style.display = "block";
  }
}

function isExpiredSub() {
  const sub = state.subscription;
  return sub.plan === "monthly" && sub.current_period_end && new Date(sub.current_period_end) < new Date();
}

async function renderPaymentHistory() {
  const historyEl = byId("accountPaymentHistory");
  if (!historyEl) return;

  if (!state.user) {
    historyEl.innerHTML = `<p style="color:var(--text-muted);font-size:13px;">Sign in to view your payment history.</p>`;
    return;
  }

  if (!isFirebaseEnabled()) {
    historyEl.innerHTML = `<p style="color:var(--text-muted);font-size:13px;">Firebase not configured.</p>`;
    return;
  }

  historyEl.innerHTML = `<p style="color:var(--text-muted);font-size:13px;">Loading payment history...</p>`;

  try {
    const db = getFirestoreDB();
    const paymentsRef = collection(db, "users", state.user.uid, "payments");
    const q = query(paymentsRef, orderBy("paidAt", "desc"), limit(10));
    const snap = await getDocs(q);

    if (snap.empty) {
      historyEl.innerHTML = `<p style="color:var(--text-muted);font-size:13px;">No payment history found.</p>`;
      return;
    }

    const rows = snap.docs.map(doc => {
      const p = doc.data();
      const date = p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A";
      const amount = p.amount ? `₹${(p.amount / 100).toFixed(0)}` : "—";
      const plan = p.plan ? (p.plan.charAt(0).toUpperCase() + p.plan.slice(1)) : "—";
      return `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
          <td style="padding:10px 8px;font-size:12px;color:#e2e8f0;">${date}</td>
          <td style="padding:10px 8px;font-size:12px;color:#10b981;font-weight:600;">${amount}</td>
          <td style="padding:10px 8px;font-size:12px;color:#e2e8f0;">${plan} Premium</td>
          <td style="padding:10px 8px;font-size:11px;color:#10b981;">✅ Captured</td>
          <td style="padding:10px 8px;font-size:10px;color:var(--text-muted);font-family:'JetBrains Mono',monospace;">${p.paymentId ? p.paymentId.substring(0, 18) + "..." : "—"}</td>
        </tr>`;
    }).join("");

    historyEl.innerHTML = `
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.12);">
            <th style="padding:8px;font-size:11px;font-weight:600;color:var(--text-muted);text-align:left;">Date</th>
            <th style="padding:8px;font-size:11px;font-weight:600;color:var(--text-muted);text-align:left;">Amount</th>
            <th style="padding:8px;font-size:11px;font-weight:600;color:var(--text-muted);text-align:left;">Plan</th>
            <th style="padding:8px;font-size:11px;font-weight:600;color:var(--text-muted);text-align:left;">Status</th>
            <th style="padding:8px;font-size:11px;font-weight:600;color:var(--text-muted);text-align:left;">Payment ID</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  } catch (err) {
    console.error("Failed to load payment history:", err);
    historyEl.innerHTML = `<p style="color:var(--text-muted);font-size:13px;">Failed to load payment history.</p>`;
  }
}

window.renderAccountPage = renderAccountPage;
