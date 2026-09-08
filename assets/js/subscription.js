/**
 * NetOps Command — Subscription Management Module
 *
 * Handles client-side subscription state, premium gating, upgrade prompts,
 * and Razorpay checkout integration.
 *
 * The SOURCE OF TRUTH for premium status is Firestore (users/{uid}/subscription/current).
 * This module reads from Firestore on login and caches in state.subscription.
 * It NEVER trusts localStorage for premium status.
 */

import { state, showToast, byId } from "./core.js";
import { razorpayConfig, PLAN_CONFIG } from "./config.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js";
import { getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

// ─── Default subscription state ───────────────────────────────────────────
export function createDefaultSubscription() {
  return {
    plan: "free",
    status: "none",
    current_period_end: null,
    activated_at: null,
    loaded: false
  };
}

// ─── Load subscription from Cloud Function ───────────────────────────────
// Called after Google Sign-In completes. Populates state.subscription.
export async function loadSubscription(uid) {
  if (!uid) {
    state.subscription = createDefaultSubscription();
    return;
  }
  try {
    const functions = getFunctions(getApp(), "us-central1");
    const getStatus = httpsCallable(functions, "getSubscriptionStatus");
    const result = await getStatus({});
    state.subscription = {
      plan: result.data.plan || "free",
      status: result.data.status || "none",
      current_period_end: result.data.current_period_end || null,
      activated_at: result.data.activated_at || null,
      loaded: true
    };
  } catch (err) {
    console.warn("Could not load subscription status:", err.message);
    // Fail safe: treat as free user if CF unreachable
    state.subscription = createDefaultSubscription();
    state.subscription.loaded = true;
  }
}

// ─── Premium Status Check ─────────────────────────────────────────────────
export function isPremium() {
  if (!state.subscription || !state.subscription.loaded) return false;
  const { plan, status } = state.subscription;
  if (plan === "lifetime" && status === "active") return true;
  if (plan === "monthly" && status === "active") {
    // Double-check expiry client-side (server already checked, this is belt-and-suspenders)
    if (state.subscription.current_period_end) {
      return new Date(state.subscription.current_period_end) > new Date();
    }
    return true;
  }
  return false;
}

// ─── Check & Gate a Premium Feature ──────────────────────────────────────
// Returns true if allowed, false if blocked (and shows upgrade prompt).
export function checkPremiumGate(featureName) {
  if (isPremium()) return true;
  showUpgradeModal(featureName);
  return false;
}

// ─── Upgrade Modal ────────────────────────────────────────────────────────
export function showUpgradeModal(featureName = "") {
  // Remove existing modal if any
  const existing = byId("upgradeModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "upgradeModal";
  modal.className = "modal-overlay";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "upgradeModalTitle");
  modal.style.cssText = "position:fixed;inset:0;background:rgba(3,5,12,0.9);z-index:2000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);padding:16px;";

  const featureText = featureName ? `<p style="color:#f59e0b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">🔒 ${featureName} is a Premium feature</p>` : "";

  modal.innerHTML = `
    <div class="card" style="max-width:480px;width:100%;background:#0d1324;border:1.5px solid #00f2fe;border-radius:16px;padding:28px;box-shadow:0 0 30px rgba(0,242,254,0.2);animation:zoomIn 0.25s ease;">
      <h2 id="upgradeModalTitle" style="font-family:'Bebas Neue',sans-serif;font-size:30px;color:#00f2fe;margin-bottom:8px;">⭐ UPGRADE TO PREMIUM</h2>
      ${featureText}
      <p style="color:var(--text-muted);font-size:13px;line-height:1.6;margin-bottom:20px;">Unlock the full NetOps Command arsenal for your CCNA exam preparation.</p>

      <ul style="list-style:none;padding:0;margin-bottom:20px;display:flex;flex-direction:column;gap:8px;">
        <li style="color:#e2e8f0;font-size:13px;display:flex;gap:8px;"><span style="color:#10b981;">✓</span> Full 120-question Pearson VUE exam simulations</li>
        <li style="color:#e2e8f0;font-size:13px;display:flex;gap:8px;"><span style="color:#10b981;">✓</span> All 10 virtual IOS CLI labs (including VPN, WLC, NAT)</li>
        <li style="color:#e2e8f0;font-size:13px;display:flex;gap:8px;"><span style="color:#10b981;">✓</span> Full 126-video lecture library</li>
        <li style="color:#e2e8f0;font-size:13px;display:flex;gap:8px;"><span style="color:#10b981;">✓</span> Advanced analytics & weakness heatmap</li>
        <li style="color:#e2e8f0;font-size:13px;display:flex;gap:8px;"><span style="color:#10b981;">✓</span> ⭐ Premium badge in your profile</li>
      </ul>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <button id="upgradeMonthlyBtn" class="primary" style="padding:14px 8px;border-radius:10px;font-size:13px;text-align:center;cursor:pointer;">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:0.5px;">₹299</div>
          <div style="font-size:10px;opacity:0.8;">Monthly — cancel anytime</div>
        </button>
        <button id="upgradeLifetimeBtn" class="primary" style="padding:14px 8px;border-radius:10px;font-size:13px;text-align:center;cursor:pointer;background:linear-gradient(135deg,#f59e0b,#ff5e3a);border:none;position:relative;">
          <div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);background:#10b981;color:#fff;font-size:9px;font-weight:700;padding:2px 8px;border-radius:10px;white-space:nowrap;">BEST VALUE</div>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:0.5px;">₹999</div>
          <div style="font-size:10px;opacity:0.9;">Lifetime — pay once forever</div>
        </button>
      </div>

      <p style="text-align:center;color:var(--text-muted);font-size:11px;margin-bottom:16px;">🔒 Secure payments via Razorpay &nbsp;·&nbsp; Indian UPI, Cards, NetBanking accepted</p>

      <div style="display:flex;justify-content:flex-end;">
        <button id="upgradeModalClose" class="ghost" style="font-size:12px;padding:6px 14px;">Maybe later</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Bind buttons
  const closeBtn = byId("upgradeModalClose");
  if (closeBtn) closeBtn.addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });

  const monthlyBtn = byId("upgradeMonthlyBtn");
  if (monthlyBtn) monthlyBtn.addEventListener("click", () => {
    modal.remove();
    if (!state.user) {
      showToast("Please sign in first to upgrade.", "warn");
      return;
    }
    initiateCheckout("monthly");
  });

  const lifetimeBtn = byId("upgradeLifetimeBtn");
  if (lifetimeBtn) lifetimeBtn.addEventListener("click", () => {
    modal.remove();
    if (!state.user) {
      showToast("Please sign in first to upgrade.", "warn");
      return;
    }
    initiateCheckout("lifetime");
  });
}

// ─── Razorpay Checkout Flow ───────────────────────────────────────────────
export async function initiateCheckout(plan) {
  if (!state.user) {
    showToast("Please sign in to upgrade to Premium.", "warn");
    return;
  }

  if (!["monthly", "lifetime"].includes(plan)) {
    console.error("Invalid plan:", plan);
    return;
  }

  showToast("Preparing secure checkout...", "info", 3000);

  try {
    // Load Razorpay script dynamically if not already loaded
    await loadRazorpayScript();

    // Call Cloud Function to create order server-side
    const functions = getFunctions(getApp(), "us-central1");
    const createOrder = httpsCallable(functions, "createRazorpayOrder");
    const result = await createOrder({ plan });

    const { orderId, amount, currency, keyId, description } = result.data;

    // Open Razorpay modal
    const options = {
      key: keyId,
      amount,
      currency,
      name: razorpayConfig.name,
      description,
      image: razorpayConfig.image,
      order_id: orderId,
      theme: razorpayConfig.theme,
      prefill: {
        name: state.user.displayName || "",
        email: state.user.email || ""
      },
      handler: async function(response) {
        // Payment succeeded on Razorpay end — verify server-side
        showToast("Payment received! Activating your subscription...", "info", 4000);
        try {
          const verifyFn = httpsCallable(functions, "verifyRazorpayPayment");
          const verifyResult = await verifyFn({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan
          });

          if (verifyResult.data.success) {
            // Refresh subscription state
            await loadSubscription(state.user.uid);
            showToast(`🎉 Welcome to Premium! Your ${PLAN_CONFIG[plan].label} plan is now active.`, "ok", 6000);

            // Refresh UI
            if (window.renderHome) window.renderHome();
            if (window.updateHeaderProfile) window.updateHeaderProfile();
            if (window.renderSubscriptionBadge) window.renderSubscriptionBadge();

            // Navigate to home
            if (window.setPage) window.setPage("home");
          }
        } catch (verifyErr) {
          console.error("Payment verification failed:", verifyErr);
          showToast("Payment received but verification failed. Contact support — your payment is safe.", "warn", 8000);
        }
      },
      modal: {
        ondismiss: function() {
          showToast("Checkout cancelled.", "info", 2000);
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function(response) {
      console.error("Razorpay payment failed:", response.error);
      showToast(`Payment failed: ${response.error.description}`, "error", 5000);
    });
    rzp.open();

  } catch (err) {
    console.error("Checkout error:", err);
    if (err.code === "functions/already-exists") {
      showToast("You already have an active subscription!", "info");
    } else {
      showToast("Failed to open checkout. Please try again.", "error");
    }
  }
}

// ─── Utility: Load Razorpay JS Script ────────────────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK."));
    document.head.appendChild(script);
  });
}

// ─── Subscription Status Label ────────────────────────────────────────────
export function getSubscriptionLabel() {
  if (!state.subscription || !state.subscription.loaded) return "";
  if (isPremium()) {
    if (state.subscription.plan === "lifetime") return "⭐ Lifetime";
    if (state.subscription.plan === "monthly") {
      const expiry = state.subscription.current_period_end;
      if (expiry) {
        const d = new Date(expiry);
        const formatted = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
        return `⭐ Premium (until ${formatted})`;
      }
      return "⭐ Monthly Premium";
    }
  }
  return "Free Plan";
}

// ─── Render the subscription badge in header ──────────────────────────────
export function renderSubscriptionBadge() {
  const badge = byId("headerSubscriptionBadge");
  if (!badge) return;
  const label = getSubscriptionLabel();
  if (label && label !== "Free Plan") {
    badge.textContent = label;
    badge.style.display = "inline-flex";
    badge.classList.add("premium-badge");
  } else {
    badge.textContent = "";
    badge.style.display = "none";
    badge.classList.remove("premium-badge");
  }
}

// Expose for cross-module access
window.renderSubscriptionBadge = renderSubscriptionBadge;
window.showUpgradeModal = showUpgradeModal;
window.initiateCheckout = initiateCheckout;
window.isPremium = isPremium;
