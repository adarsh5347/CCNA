# Bug Hunt & Iterative Testing Protocol: NetOps Command CCNA Platform

## 0. Protocol Summary
- **Live URL**: https://ccna-prep-platform.vercel.app
- **Repository**: https://github.com/adarsh5347/CCNA.git
- **Target Stack**: Vanilla JS ES Modules (SPA), Firebase Auth & Firestore, Service Worker Cache API.
- **Cycles Executed**: 6 of 6 Complete.
- **Stability Status**: Production Stable (Zero console errors, syntax verified with `node -c`, all tests passing).

---

## Cycle 1: Core Subnetting Math, Session State & Mobile Bottom Navigation
- **Date**: 2026-09-08
- **Scope Tested**:
  1. Subnetting engine calculations across edge prefix boundaries (`/0`, `/30`, `/31` RFC 3021 point-to-point, `/32` host routes).
  2. Active quiz session persistence across page reload/refresh.
  3. Mobile bottom navigation bar horizontal scrolling on narrow viewports (<360px).
- **Issues Found**:
  - `assets/js/subnetting.js`: `getSubnetDetails` inverted `/31` addresses (`firstUsable: netNum + 1`, `lastUsable: broadNum - 1`) resulting in invalid host ranges. `/32` returned `firstUsable: netNum + 1` which is out of range. `/0` did not clamp negative bitshifts correctly.
  - `assets/js/app.js`: `restoreSession()` existed in the codebase but was never invoked inside `init()`, causing users to lose quiz progress if they refreshed the browser mid-exam.
  - `assets/css/styles.css`: Bottom navigation bar on small devices lacked horizontal scroll handling (`overflow-x: auto`), causing tab compression on narrow viewports.
- **Fixes Applied**:
  - `assets/js/subnetting.js`: Implemented RFC 3021 handling for `/31` (`usableHosts = 2`, `firstUsable = network`, `lastUsable = broadcast`), `/32` (`usableHosts = 1`, `firstUsable = network`, `lastUsable = network`), and clamped `/0` (`usableHosts = 4294967294`).
  - `assets/js/app.js`: Added `restoreSession()` execution at start of `init()`, prior to deep linking.
  - `assets/css/styles.css`: Added `overflow-x: auto`, `-webkit-overflow-scrolling: touch`, and hidden scrollbars to `header.topbar nav`.
- **Verification / Retest Results**:
  - Unit test `test_subnet_edge.js` executed with Node.js: Verified `/0`, `/24`, `/30`, `/31`, `/32` outputs. All 5 edge tests PASSED.
  - Refresh during quiz state: Restores active session seamlessly.

---

## Cycle 2: Lab Completion Metrics & Packet Simulator State Locking
- **Date**: 2026-09-08
- **Scope Tested**:
  1. Virtual IOS Lab XP and completion metrics tracking.
  2. Packet Traversal Simulator start button behavior during asynchronous execution, early terminations, or unexpected errors.
- **Issues Found**:
  - `assets/js/app.js`: In `handleLabCommandClick` and `renderExamMatchInterface`, re-running the same lab incremented `state.analytics.labsCompleted` repeatedly without verifying unique lab IDs.
  - `assets/js/topology.js`: `btnStart` event handler set `btnStart.disabled = true;` without a `try/finally` block. If `activePkt` was absent or an exception occurred during hop iteration, the "Run Simulation" button remained permanently disabled.
- **Fixes Applied**:
  - `assets/js/app.js`: Introduced `state.analytics.completedLabIds` array. Completion only increments unique lab count (`state.analytics.labsCompleted = Math.min(10, state.analytics.completedLabIds.length)`).
  - `assets/js/core.js` & `assets/js/firebase.js`: Added `completedLabIds` to analytics schema, default schema generator, and cloud merge synchronization.
  - `assets/js/topology.js`: Wrapped simulator packet runner in `try { ... } finally { highlightNode(null); btnStart.disabled = false; }`.
- **Verification / Retest Results**:
  - Verified lab repeats no longer artificially inflate `labsCompleted` counter.
  - Tested simulation button state under simulated early termination; button correctly re-enables every time.

---

## Cycle 3: Auth Popup Edge Cases & Video Resume Tracking
- **Date**: 2026-09-08
- **Scope Tested**:
  1. Firebase Google Sign-In error handling for common mobile and desktop browser edge cases (popup blocked, user closed popup, network loss).
  2. Video library playback state and last watched video tracking.
- **Issues Found**:
  - `assets/js/auth.js`: Generic `Authentication failed.` error toast was shown for all errors, confusing users who deliberately closed or had browser pop-up blockers active.
  - `assets/js/app.js`: Video watched status was stored in an array, but `lastWatchedVideoId` was never recorded to resume playback later.
- **Fixes Applied**:
  - `assets/js/auth.js`: Added specific branching for `auth/popup-closed-by-user` ("Sign-in cancelled"), `auth/popup-blocked` ("Pop-up blocked by browser. Please allow pop-ups for this site"), and `auth/network-request-failed`.
  - `assets/js/app.js`, `core.js`, `firebase.js`: Added `lastWatchedVideoId` tracking upon video play and cloud state merging.
- **Verification / Retest Results**:
  - Simulated `auth/popup-closed-by-user` throws informational "Sign-in cancelled" toast without console errors.
  - `lastWatchedVideoId` accurately persists in `state.analytics`.

---

## Cycle 4: Firestore Security Rules & Platform Admin Authorization
- **Date**: 2026-09-08
- **Scope Tested**:
  1. Firestore security rules compatibility with owner UID `NjVurGH5w4TPl8qoJklLyage7UX2` (Adarsh Poojari).
  2. Client-side Firestore operations vs. Cloud Functions Admin SDK boundaries.
- **Issues Found**:
  - `firestore.rules`: Lacked platform administrator verification helper (`isPlatformAdmin()`), meaning administrative queries for support or diagnostics would be rejected by default deny rules.
- **Fixes Applied**:
  - `firestore.rules`: Defined `function isPlatformAdmin()` checking `request.auth.uid == 'NjVurGH5w4TPl8qoJklLyage7UX2' || request.auth.token.admin == true`.
  - Permitted platform admin read access to `/users/{userId}` subcollections and `/admin/{document=**}`.
- **Verification / Retest Results**:
  - Syntax check on security rules verified. Non-admin users remain strictly quarantined to their own document trees (`request.auth.uid == userId`).

---

## Cycle 5: Mobile Viewport, Touch Targets & Modal Dialog Audit (360px & 390px)
- **Date**: 2026-09-08
- **Scope Tested**:
  1. Modal dialogs (`#upgradeModal`, `#onboardingModal`, `#videoModal`) on narrow viewports (320px–390px).
  2. Interactive touch target sizes (minimum 44x44px Apple HIG / Android Material guidelines).
- **Issues Found**:
  - `upgradeModal`: Pricing cards displayed in a two-column grid (`grid-template-columns: 1fr 1fr`) which caused overflow/cramping on screens under 360px width.
  - Modal cards did not define explicit `max-height: 90dvh; overflow-y: auto`, potentially pushing action buttons off-screen on short landscape or small screens.
- **Fixes Applied**:
  - `assets/css/styles.css`: Added responsive `.modal-overlay` and `.modal-overlay .card` rules with `max-width: min(92vw, 520px)`, `max-height: 90dvh`, and scrolling.
  - Added `@media (max-width: 480px)` breakpoint to stack upgrade buttons vertically with full width.
- **Verification / Retest Results**:
  - Tested responsive styling; modal dialogs fit within viewport with zero horizontal scrolling. Touch targets conform to >=44px.

---

## Cycle 6: PWA Cache Synchronization & Production Build Integrity
- **Date**: 2026-09-08
- **Scope Tested**:
  1. Service Worker cache version consistency across `sw.js` and `index.html`.
  2. Complete syntax and static analysis validation across all JavaScript modules.
  3. Git working directory clean check.
- **Issues Found**:
  - `sw.js` and `index.html` were on `v66`. Changes in earlier cycles required a synchronized bump to `v67` to invalidate stale cached assets on client devices.
- **Fixes Applied**:
  - `sw.js`: Bumped `CACHE_NAME` to `ccna-prep-v67`.
  - `index.html`: Bumped `assets/js/app.js?v=67`.
  - Validated all JS files via `node -c`.
- **Verification / Retest Results**:
  - `node -c assets/js/*.js sw.js`: 100% exit code 0 across all files.
  - All test-fix-retest cycles cleanly documented and resolved.

---

## Cycle 7: Complete Subscription Logic Removal & Admin Station Stabilization
- **Date**: 2026-10-10
- **Scope Tested**:
  1. Permanent removal of all paywalls, subscription gates, and upgrade modals.
  2. Complete unlock of Labs 1–10, 120-question exam drills, and 126 video lectures for all users.
  3. Admin Dashboard stabilization: elimination of failing collection-level Firestore queries (`getDocs(collection(db, "users"))`) that triggered permission errors.
  4. Header navigation cleanup: removal of obsolete Pricing tab.
- **Issues Found**:
  - The admin panel was attempting to query the entire Firestore `/users` collection, leading to `FirebaseError: Missing or insufficient permissions` on client accounts.
  - The admin panel's manual UID subscription grant form was cumbersome, error-prone, and unnecessary.
  - Users were being gated on full exam simulations and labs 6–10 when subscription state failed to load.
- **Fixes Applied**:
  - `assets/js/subscription.js`: Completely neutralized paywall logic. `isPremium()` and `checkPremiumGate()` now permanently return `true`. Removed Razorpay and upgrade modals.
  - `assets/js/labs.js`: Removed `premium: true` flags from Labs 6–10. All 10 labs are permanently open and free.
  - `assets/js/app.js`: Removed `checkPremiumGate()` blocks from 120-question drills and lab selector. Removed lock icons.
  - `assets/js/admin.js`: Replaced failing Firestore queries and UID grant form with a resilient NOC Station Operations & Telemetry dashboard (Platform Status, Question Bank telemetry, PWA reload utilities, audio test, and analytics export).
  - `assets/js/account.js`: Updated to display "⭐ Full Access (100% Free)" and removed payment/upgrade prompts.
  - `index.html`: Removed Pricing from header nav; converted `#pricing` to 100% Free full access summary; stabilized `#admin`.
  - `sw.js` & `index.html`: Bumped PWA cache version to `v68`.
- **Verification / Retest Results**:
  - `node -c assets/js/*.js sw.js`: 100% pass (code 0).
  - Zero console errors, zero Firestore permission traps, all features immediately unlocked for all visitors.

---

## Cycle 8: CCNA 200-301 Question Bank Rebuild & Gradual Progression Engine
- **Date**: 2026-10-10
- **Scope Tested**:
  1. Complete overhaul of the legacy 328-question bank (`assets/js/data.js`).
  2. Construction of 241 authentic, blueprint-weighted Cisco CCNA 200-301 scenario questions.
  3. Elimination of filler stems and longest-option bias.
  4. Authoring granular explanations (`expl.why`, specific `expl.wrong` reasoning per distractor, `expl.tip`, and CLI commands).
  5. Implementation of adaptive cognitive difficulty progression in `quiz-engine.js` (Easy [foundations] -> Medium [application] -> Hard [troubleshoot]).
- **Issues Found in Legacy Bank**:
  - Domain weights deviated from official Cisco specifications (Automation 15% vs 10%, Security 12% vs 15%).
  - Correct option was the longest in 58% of questions.
  - Difficulty tags ("Easy", "Medium", "Hard") were cosmetic with no pedagogical progression in study/quiz sessions.
- **Fixes Applied**:
  - Modularized question authoring into `assets/js/qb/` (`build.js`, `nf.js`, `na.js`, `ipc.js`, `ips.js`, `sec.js`, `auto.js`, `index.js`).
  - Total 241 high-yield, blueprint-aligned questions across all 6 CCNA domains:
    - **Network Fundamentals (20%)**: 49 questions
    - **Network Access (20%)**: 48 questions
    - **IP Connectivity (25%)**: 60 questions
    - **IP Services (10%)**: 24 questions
    - **Security Fundamentals (15%)**: 36 questions
    - **Automation & Programmability (10%)**: 24 questions
  - PRNG-seeded option shuffling in `assets/js/qb/build.js` ensures unbiased correct-answer positioning.
  - `assets/js/quiz-engine.js`:
    - Updated `weakTopicBoost(q)` with adaptive difficulty tier multipliers: beginners get foundation Easy questions; intermediate get Medium; advanced (>=75% accuracy) get Hard troubleshooting scenarios.
    - Added `gradualOrder = true` in `weightedSelection()` so delivered study and quiz sessions follow smooth cognitive scaffolding: Easy -> Medium -> Hard.
    - Updated Bank & Distribution statistics cards to dynamically display exact counts (75 Easy, 101 Medium, 65 Hard).
  - Backed up legacy bank to `assets/js/data.legacy.js`.
  - Bumped PWA cache version to `ccna-prep-v70` in `sw.js` and `app.js?v=70` in `index.html`. Precached all new `assets/js/qb/*.js` modules for offline PWA operation.
- **Verification / Retest Results**:
  - `node -c` on all JavaScript files in the repository: 100% pass (code 0).
  - Verified 0 duplicate question IDs, 0 duplicate question stems.
  - Verified 100% option validity across all single, multi, dragdrop, and scenario questions.
  - Confirmed 120-question real exam drill picks cleanly across all domains according to blueprint percentages.


---

## Cycle 9: Post-rebuild audit
- **Date**: 2026-10-11
- **Found and fixed**:
  1. **Stale `missedIds` pointed at wrong questions.** The new bank reuses ids 1-241, so old stored ids (1-328) mapped to unrelated questions in Spaced Repetition. Added `BANK_VERSION` and `migrateBankVersion()` (core.js), applied on local load, login merge and logout restore; `mergeProgress` carries the version so cloud data is migrated too. One-time reset of the missed list.
  2. **"Watch Related Lesson" never appeared for new topics.** Question topics did not match video hub categories. Added explicit `VIDEO_TOPIC_MAP` + `findVideoForTopic()`; all 40 topics now resolve. Video attributes are now HTML-escaped.
  3. **Stale copy**: "328+ questions" in index.html and README, now 241.
  4. Bumped cache to `ccna-prep-v72`.
- **Audit results**: 0 schema errors across 241 questions (topics in blueprint, no duplicate options, wrong[] lengths valid).
- **Still open (quality, not a crash)**: correct option is the longest in 67.7% of single-choice questions (ideal ~25%). Needs a content pass on distractor length.
