# Changelog

All notable changes to the **NetOps Command (CCNA 200-301 Engine)** platform are documented in this file.

---

## [v65] - 2026-09-08
### Production Hardening & Mobile Optimization Pass
- **Mobile Quiz UI Fix**:
  - Replaced strict `100vh` overrides with proper `100vh` fallback preceding `100dvh` dynamic viewport unit on the app shell and quiz container.
  - Added dynamic safe area margin (`env(safe-area-inset-bottom)`) and established explicit bottom-padding (`calc(var(--bottom-nav-height) + var(--safe-bottom) + 52px)`) on `.scroll`.
  - Added `margin-bottom` and `scroll-margin-bottom` to `.options-list` and individual `.opt` cards, guaranteeing that the final answer choices are 100% visible and clickable on all mobile screen sizes (360×640, 390×844, 412×915).
- **Webhook Hardening & Idempotency**:
  - Made `activateSubscription` in `functions/index.js` idempotent by latching onto existing captured payment IDs in Firestore.
  - Implemented timing-safe HMAC-SHA256 signature verification (`crypto.timingSafeEqual`) in `handleRazorpayWebhook`.
  - Added `maxInstances: 10` hint to protect Cloud Functions against runaway billing or webhook retry storms.
- **Global Error Boundary**:
  - Trapped unhandled window errors and promise rejections in `app.js` with non-intrusive toast feedback, preventing app freezes.
- **Account Isolation**:
  - Prevented silent cross-account guest telemetry contamination when switching between multiple Google accounts on the same device.
- **Environment & Secrets**:
  - Created `.env.example` documenting all configuration parameters.
  - Verified clean git history with no exposed API secrets.
- **Documentation**:
  - Added comprehensive `README.md` and `CHANGELOG.md`.

---

## [v64] - 2026-09-08
- Bound owner UID `NjVurGH5w4TPl8qoJklLyage7UX2` directly to permanent Lifetime VIP + Platform Admin status.
- Converted Admin dashboard metrics to query Firestore telemetry directly, eliminating Cloud Function cold start delays for admin analytics.
- Made Admin buttons permanently visible in the topbar, profile menu, and home page hero.

---

## [v63] - 2026-09-08
- Added monetization architecture:
  - Razorpay payment order creation and signature verification Cloud Functions.
  - Frontend `subscription.js` client module with dynamic checkout modal.
  - `#pricing` comparison cards (Free, Monthly ₹299, Lifetime ₹999).
  - `#account` dashboard with active plan status and payment history.
  - `#admin` panel with platform metrics and manual UID access controls.
  - Gated 120-question exam mode and virtual labs 6–10 for free users.
- Updated `firestore.rules` with subcollection isolation.
- Bumped PWA service worker asset manifest.
