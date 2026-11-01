/**
 * NetOps Command — Subscription & Access Management Module
 * All platform features are 100% FREE & FULLY UNLOCKED for all candidates.
 * Subscription paywalls and payment requirements have been completely removed.
 */

import { state, showToast, byId } from "./core.js?v=77";
import { isFirebaseEnabled, getFirebaseAuth } from "./firebase.js?v=77";

export const OWNER_UIDS = ["NjVurGH5w4TPl8qoJklLyage7UX2"];

export function isOwnerUser(user) {
  if (!user || typeof user.uid !== "string" || !OWNER_UIDS.includes(user.uid)) return false;
  if (isFirebaseEnabled()) {
    const auth = getFirebaseAuth();
    const liveUser = auth && auth.currentUser;
    if (!liveUser || liveUser.uid !== user.uid) return false;
  }
  return true;



}

export function createDefaultSubscription() {
  return {
    plan: "lifetime",
    status: "active",
    current_period_end: null,
    activated_at: new Date().toISOString(),
    loaded: true
  };
}

export async function loadSubscription(uid) {
  state.subscription = createDefaultSubscription();
  try {
    localStorage.setItem("ccna_user_plan", "lifetime");
  } catch {}
  return state.subscription;
}

// All features are permanently unlocked for every user
export function isPremium() {
  return true;
}

// Gating check always permits access with zero paywall modals
export function checkPremiumGate(featureName) {
  return true;
}

// Remove any existing upgrade modal; never show upgrade prompt
export function showUpgradeModal(featureName = "") {
  const existing = byId("upgradeModal");
  if (existing) existing.remove();
}

// In case checkout is triggered from any legacy button
export async function initiateCheckout(plan) {
  showToast("All features are 100% free and fully unlocked! No payment required.", "ok", 4000);
}

export function getSubscriptionLabel() {
  return "⭐ Full Access";
}

export function renderSubscriptionBadge() {
  const badge = byId("headerSubscriptionBadge");
  if (badge) {
    badge.textContent = "⭐ Full Access";
    badge.style.display = "inline-flex";
  }
}

window.renderSubscriptionBadge = renderSubscriptionBadge;
window.isPremium = isPremium;
window.checkPremiumGate = checkPremiumGate;
window.showUpgradeModal = showUpgradeModal;
window.initiateCheckout = initiateCheckout;
