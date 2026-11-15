# NetOps Command — DOM & CSS Contract Reference (Phase 0 Safety Net)

This document defines the strict contract between the JavaScript modules (`assets/js/**`) and the HTML/CSS layer (`index.html`, `assets/css/styles.css`). During the Apple-inspired visual redesign (Phases 1–12), **every item in this contract must be preserved** unless the corresponding JavaScript module is explicitly updated in the same commit and verified with `node tools/tests/verify_e2e.mjs` and `node tools/tests/verify_lighthouse_fixes.mjs`.

---

## 1. Application Pages & SPA Routing Contract

### 1.1 The 11 Page Containers (`section.page#<id>`)
`setPage(page, push)` in `assets/js/app.js` requires each page to be an element with `id="<page>"` and class `.page`:

| Page ID | Location in `index.html` | Initializer / Renderer | Notes |
|---|---|---|---|
| `#home` | Inside `<main class="container">` | `renderHome()`, `ensureTraversalInit()` | Default landing route (`?page=home` or `/`) |
| `#subnet` | Inside `<main class="container">` | `ensureSubnetInit()` | Subnet Trainer, VLSM Calculator, Flashcards |
| `#labs` | Inside `<main class="container">` | `ensureLabsInit()` | 10 Virtual Cisco IOS CLI Labs |
| `#analytics` | Inside `<main class="container">` | `renderAnalytics()`, `renderAchievements()` | Readiness Rings, Trend Log, Study Planner |
| `#videos` | Inside `<main class="container">` | `ensureVideosInit()`, `renderVideos()` | 126 Video Lessons + Modal Player |
| `#guide` | Inside `<main class="container">` | `ensureStudyGuideInit()` (lazy `guide-ui.js`) | 48 OCG Chapters, Commands & Glossary |
| `#support` | Inside `<main class="container">` | `setupSupportDesk()` | Incident Ticket Form + Honeypot + Rate Limit |
| `#engine` | Inside `<main class="container">` | `startSession()`, `restoreSession()` | Exam/Study/Quiz Engine (Locks mobile viewport) |
| `#pricing` | Currently after `</main>` | `renderPricingPage()` | Free Access / Plan Status |
| `#account` | Currently after `</main>` | `renderAccountPage()` | Profile, Auth State, Subscription Status |
| `#admin` | Currently after `</main>` | `renderAdminDashboard()` | Owner-only (`isAdmin()` gated) |

### 1.2 Global Routing Attributes
- `body[data-active-page="<page>"]` — Written by `setPage()` and by the inline `<head>` bootstrap script on initial load. CSS rules for mobile exam lock and `#netCanvas` throttling depend on `body[data-active-page="engine"]`.
- `html[data-theme="dark" | "light"]` and `body[data-theme="dark" | "light"]` — Written by `applyTheme()` and the inline `<head>` theme script.
- `[data-page="<page>"]` — Global click router in `navSetup()` (`document.addEventListener("click", e => e.target.closest("[data-page]"))`). Toggles `.active` when `dataset.page === page`.
- `#mobileBottomNav [data-mobile-nav="dashboard" | "study" | "practice" | "labs" | "more"]` — 5-tab mobile bottom bar. Toggles `.active` and `aria-current="page"`.
- `#mobileMoreSheet [data-more-action="simulator" | "flashcards" | "subnet" | "vlsm" | "analytics" | "planner" | "videos" | "support" | "account" | "admin"]` — Mobile More bottom sheet actions.

---

## 2. Cross-Module Shared DOM IDs (Highest Risk)

These 9 IDs are referenced across **3 or more JavaScript modules** (`app.js`, `quiz-engine.js`, `review.js`, `timer.js`). They must never be renamed, removed, or duplicated:

| ID | Referenced By | Role & Contract |
|---|---|---|
| `#questionArea` | `app.js`, `quiz-engine.js`, `review.js` | Main question card container (`.scroll`). Toggles `.hidden` and `.is-paused`. Scroll root for `.scroll-sentinel` IntersectionObserver. |
| `#reviewArea` | `app.js`, `quiz-engine.js`, `review.js` | Pre-submit question review table container (`.scroll`). Toggles `.hidden`. |
| `#resultArea` | `app.js`, `quiz-engine.js`, `review.js` | Post-submit results & answer review container (`.scroll`). Toggles `.hidden`. |
| `#prevQ` | `app.js`, `quiz-engine.js`, `review.js` | Footer "Previous" button. Must contain `.btn-full-text` and `.btn-mobile-text` child `<span>`s. |
| `#saveNext` | `app.js`, `quiz-engine.js`, `review.js` | Footer "Next" button. Hidden on last question when `submitSession` is shown. |
| `#submitSession` | `app.js`, `quiz-engine.js`, `review.js` | Footer "Submit Quiz/Exam" button. `innerHTML` is rewritten with `.btn-full-text` and `.btn-mobile-text`. |
| `#toggleMark` | `app.js`, `quiz-engine.js`, `review.js` | Footer "Mark For Review" button. Toggles `aria-pressed="true"|"false"` and updates `.btn-full-text` / `.btn-mobile-text`. |
| `#openReview` | `app.js`, `quiz-engine.js`, `review.js` | Footer "Review" button. Hidden when in post-submit inspect mode. |
| `#timer` | `app.js`, `quiz-engine.js`, `timer.js` | Exam header timer wrapper. Toggles `.hidden`, `.paused`, `.warn` (<25% left), `.danger` (<10% left). Contains `#timerRingFill` (`stroke-dashoffset` base circumference `94.25`) and `#timerText`. |

---

## 3. Runtime-Generated DOM IDs (36 IDs Created in JS Templates)

These 36 IDs **do not exist in static `index.html`** — they are injected dynamically via `innerHTML` or `document.createElement` inside JavaScript modules. Any redesign of these components must edit the JS template strings:

| ID | Created In | Consumed In | Element & Purpose |
|---|---|---|---|
| `#accountPaymentHistory` | `account.js` | `account.js` | Payment history container |
| `#accountUpgradeSection` | `account.js` | `account.js` | Plan status card in `#account` |
| `#achievementsPanel` | `quiz-engine.js` | `quiz-engine.js` | Dynamically appended `<section id="achievementsPanel">` inside `#analytics` |
| `#adminBtnExportAnalytics` | `admin.js` | `admin.js` | Admin export JSON button |
| `#adminBtnForceRefresh` | `admin.js` | `admin.js` | Admin SW cache purge button |
| `#adminBtnTestAudio` | `admin.js` | `admin.js` | Admin WebAudio test button |
| `#backHome` | `quiz-engine.js` | `quiz-engine.js` | Post-submit "Return to Command Center" button |
| `#backToQuizFromReview` | `review.js` | `review.js` | Pre-submit Review screen "Back to Quiz" button |
| `#backToResultsBtn` | `quiz-engine.js` | `quiz-engine.js` | Post-submit inspect bar "Back to Results" button |
| `#btnApplyTroubleFix` | `topology.js` | `topology.js` | Troubleshooting dropdown "Apply Configuration" button |
| `#btnApplyTypedTroubleFix` | `topology.js` | `topology.js` | Troubleshooting manual CLI "Submit Command" button |
| `#btnCheckAnswer` | `quiz-engine.js` | `quiz-engine.js` | Study-mode "Check Answer" button for `multi`/`matching`/`dragdrop` |
| `#btnDiscardSavedQuiz` | `quiz-engine.js` | `quiz-engine.js` | Home resume banner "Discard" button |
| `#btnLabAskAI` | `labs` (optional) | `app.js` | Optional AI lab helper button |
| `#btnNextCh` | `guide-ui.js` | `guide-ui.js` | Study Guide reader next-chapter button |
| `#btnPracticeChapter` | `guide-ui.js` | `guide-ui.js` | Study Guide reader top "Practice This Chapter" button |
| `#btnPracticeChapterBottom` | `guide-ui.js` | `guide-ui.js` | Study Guide reader bottom drill button |
| `#btnPrevCh` | `guide-ui.js` | `guide-ui.js` | Study Guide reader previous-chapter button |
| `#btnResumeSavedQuiz` | `quiz-engine.js` | `quiz-engine.js` | Home resume banner "Resume Quiz" button |
| `#btnSubmitExamMatches` | `app.js` | `app.js` | Virtual Labs Exam Mode "Submit Configuration Matches" button |
| `#cliCommandSelect` | `topology.js` | `topology.js` | Device inspector IOS `show` command `<select>` |
| `#cliOutputTerminal` | `topology.js` | `topology.js` | Device inspector IOS terminal output `<div>` |
| `#cliTroubleFixSelect` | `topology.js` | `topology.js` | Troubleshooting fix `<select>` |
| `#cliTroubleResult` | `topology.js` | `topology.js` | Troubleshooting CLI output `<div>` |
| `#cliTroubleTypedInput` | `topology.js` | `topology.js` | Troubleshooting manual CLI `<input>` |
| `#finalizeFromReview` | `review.js` | `review.js` | Exam-mode Review screen "Finalize Exam" button |
| `#goAnalytics` | `quiz-engine.js` | `quiz-engine.js` | Post-submit "View Telemetry" button |
| `#headerSubscriptionBadge` | `auth.js` | `auth.js` | Topbar subscription badge |
| `#nextQ` | `app.js` (optional) | `app.js` | Fallback next question button |
| `#pauseTimerBtn` | `quiz-engine.js` | `quiz-engine.js` | Question action bar "Pause/Resume Timer" button |
| `#pricingFreeCtaText` | `app.js` | `app.js` | Pricing card status text |
| `#pricingLifetimeBtn` | `app.js` | `app.js` | Pricing card button |
| `#pricingMonthlyBtn` | `app.js` | `app.js` | Pricing card button |
| `#quizPausedOverlay` | `quiz-engine.js` | `quiz-engine.js` | Full-card pause overlay (`#resumeFromOverlayBtn` inside) |
| `#resumeFromOverlayBtn` | `quiz-engine.js` | `quiz-engine.js` | "Resume Quiz" button inside `#quizPausedOverlay` |
| `#showAnswerBtn` | `quiz-engine.js` | `quiz-engine.js` | Question action bar "Show Answer" button |

---

## 4. Mobile Examination Viewport Lock & `--header-height` Contract

When `body[data-active-page="engine"]` is active on mobile viewports (`≤ 768px`):
1. **Viewport Lock:**
   - `#engine.page.active` becomes `position: fixed; inset: 0; height: 100dvh; overflow: hidden`.
   - `header.topbar` and `#mobileBottomNav` are hidden (`display: none !important`) so the exam occupies the full screen.
   - `.exam-header` is `position: sticky; top: 0` at the top of `.exam-shell`.
   - `#questionArea`, `#reviewArea`, and `#resultArea` (`.scroll`) are the **only** vertical scroll containers (`overflow-y: auto`), sized using `var(--header-height, 108px)` and `var(--footer-height, 68px)`.
   - `.exam-footer` is fixed at `bottom: 0; left: 0; right: 0; height: var(--footer-height, 68px)`.
2. **`--header-height` ResizeObserver (`app.js:1385–1404`):**
   - `syncHeaderHeight()` measures `document.querySelector(".exam-header").getBoundingClientRect().height` on viewports `≤ 768px` and sets `--header-height` on `document.documentElement`.
3. **Scroll-Collapse Header (`app.js:1411–1456`):**
   - `setupScrollCollapseHeader()` inserts `<div class="scroll-sentinel">` as the first child of `#questionArea` and observes it with an `IntersectionObserver` (`root: #questionArea`).
   - When `#questionArea` scrolls down past the sentinel, `.exam-header` receives `.collapsed` and `syncHeaderHeight()` updates `--header-height` on the next animation frame.

---

## 5. Required Utility & State Classes

### 5.1 `.hidden`
- **Definition:** `.hidden { display: none !important; }`
- Used across **all modules** to show/hide modals, panels, banners, and engine views (`#questionArea`, `#reviewArea`, `#resultArea`, `#timer`, `#resumeQuizBanner`, `#onboardingModal`, `#videoModal`, `#authModal`, `#mobileMoreSheet`, `#supportOut`, `#analyticsNarrative`, `.review-card-item`, `#guideChaptersShell`, `#guideCommandsShell`, `#guideGlossaryShell`).
- **Must remain `display: none !important` in the highest-priority utility layer.**

### 5.2 Complete List of JS-Toggled State Classes (`classList`)
| Class | Target Elements | Module(s) | Meaning |
|---|---|---|---|
| `active` | `.page`, `[data-page]`, `#mobileBottomNav [data-mobile-nav]`, `#mobileMoreSheet`, `#mobileMoreBackdrop`, `#examNavigator`, `#examNavBackdrop`, `.osi-layer`, `.video-filter-btn`, `.review-filter-btn`, `#btnTopoZoomFit`, `#btnTopoZoomPan`, `.guide-ch-item` | `app.js`, `topology.js`, `review.js`, `guide-ui.js` | Active page/tab/drawer/filter |
| `hidden` | Modals, engine panels, review items, guide tabs, banners | All modules | `display: none !important` |
| `selected` | `label.opt` | `quiz-engine.js` | Selected radio/checkbox option row |
| `correct` / `wrong` | `label.opt`, `.opt`, `section.block` | `quiz-engine.js` | Answer validation highlight |
| `disabled` | `label.opt` | `quiz-engine.js` | Disabled option state when paused/revealed/submitted |
| `current` / `answered` / `flagged` / `revealed` | `#qNav button[data-qnav]` | `quiz-engine.js` | Question navigator pill states |
| `is-paused` | `#questionArea` | `quiz-engine.js` | Blurs/dims question card while timer is paused |
| `paused` / `warn` / `danger` | `#timer` | `timer.js` | Timer ring & badge state classes |
| `collapsed` | `.exam-header` | `app.js` | Compact mobile exam header on scroll |
| `flipped` | `#flashcardInner` | `subnetting.js` | 3D CSS flip state for flashcard |
| `highlighted-row` | `.cheat-sheet-row` | `subnetting.js` | Active CIDR row in subnet cheat sheet |
| `inspected` | `.topo-node` | `topology.js` | Pulse highlight on clicked SVG topology node |
| `pan-zoom-mode` | `.topology-main` | `app.js` | Mobile 1.5x pan/zoom mode on topology SVG |
| `mobile-toc-expanded` | `#guideChapterList` | `guide-ui.js` | Mobile Study Guide chapter list expansion |
| `admin-visible` | `#btnNavAdmin`, `[data-more-action="admin"]` | `admin.js`, `app.js` | Reveals Admin navigation for platform owner |
| `high-contrast` | `document.body` | `app.js` | High-contrast accessibility mode |
| `dismissing` | `.toast` | `core.js` | Toast exit animation class |

---

## 6. Direct `className =` Overwrites (Preserve Variant Names)

The following places assign `el.className = ...` directly instead of `classList.toggle`, which **wipes any additional classes** on those elements unless `primary`, `secondary`, and `ghost` remain the button variant class names:

1. `assets/js/core.js:24`: `toast.className = "toast toast-" + type` (`toast-info`, `toast-ok`, `toast-warn`, `toast-error`)
2. `assets/js/app.js:1028–1030`: Lab mode buttons (`#btnModeStep`, `#btnModeChallenge`, `#btnModeExam`) overwritten with `b.className = "ghost"` and `btn.className = "primary"`.
3. `assets/js/topology.js:554–560`: Topology selector buttons (`#btnTopo1`, `#btnTopo2`) overwritten with `btnTopo1.className = "primary"` / `"secondary"`.
4. `assets/js/guide-ui.js:399`: Study Guide hub tab buttons (`#guideTabChapters`, `#guideTabCommands`, `#guideTabGlossary`) overwritten with `btn.className = active ? "primary" : "secondary"`.
5. `assets/js/quiz-engine.js:193`: `#resumeQuizBanner` created with `banner.className = "resume-quiz-banner hidden"`.
6. `assets/js/quiz-engine.js:1769`: `#achievementsPanel` created with `panel.className = "card"`.
7. `assets/js/streak.js`: `#heroStreak` badge rendered with `class="streak-badge streak-{low|mid|high}"`.

---

## 7. Critical `querySelector` / `querySelectorAll` & `data-*` Hooks

| Selector / Attribute | Module | Purpose |
|---|---|---|
| `.opt input[type='radio'], .opt input[type='checkbox']` | `app.js`, `quiz-engine.js` | Keyboard shortcut (`A`–`D`) and answer selection |
| `#questionArea label.opt` | `quiz-engine.js` | Syncing `.selected` class and `aria-checked` |
| `[data-match]` | `quiz-engine.js` | Matching question `<select data-match="i">` |
| `[data-up]`, `[data-down]` | `quiz-engine.js` | Drag-and-drop ordering step move buttons |
| `#qNav [data-qnav]` | `quiz-engine.js`, `app.js` | Question navigator buttons |
| `.qdomain` | `quiz-engine.js` | Custom quiz domain filter checkboxes |
| `.review-card-item[data-review-idx][data-correct][data-flagged][data-revealed]` | `review.js` | Post-submit Answer Review cards |
| `.review-filter-btn[data-review-filter="all" \| "incorrect" \| "flagged"]` | `review.js` | Post-submit Answer Review filter buttons |
| `.btn-jump-question[data-jump-idx]` | `review.js` | Post-submit "Jump to question" button |
| `[data-jump]` | `review.js` | Pre-submit Review table "Open" button |
| `[data-ch-id]`, `[data-open-ch]`, `[data-guide-tab]` | `guide-ui.js` | Study Guide chapter & tab navigation |
| `.btn-copy-cmd[data-cmd]` | `guide-ui.js` | Study Guide IOS command copy buttons |
| `.btn-lab-cmd[data-cmd]` | `app.js` | Virtual IOS Lab command pill buttons |
| `.exam-obj-item[data-obj-idx]`, `.exam-cmd-item[data-cmd-text]` | `app.js` | Virtual IOS Lab Exam Mode matching items |
| `.video-filter-btn[data-domain]` | `app.js` | Video Library domain filter buttons |
| `.video-watch-checkbox[data-video-id]` | `app.js` | Video Library watched checkboxes |
| `.btn-watch-video[data-youtube-id][data-video-title][data-video-id]`, `.btn-video-watch` | `app.js`, `quiz-engine.js` | Video modal launch triggers |
| `.topo-node[data-node]`, `#node-<id>` | `topology.js` | Clickable SVG topology device nodes (`viewBox="0 0 700 280"`) |
| `.osi-layer[data-layer="1".."4"]` | `topology.js` | OSI Layer inspector tabs |
| `.calc-preset-btn[data-mask]`, `.cheat-sheet-row[data-cidr]` | `subnetting.js` | Subnet calculator mask presets & cheat sheet rows |
| `.flashcard-container` | `subnetting.js` | Touch swipe listener target for flashcards |

---

## 8. Build Pipeline Contract (`tools/build.mjs`)

- `tools/build.mjs` minifies `assets/css/styles.css` with esbuild and inlines it into `dist/index.html` by matching the `<style id="critical-css">...</style>` + `<link rel="preload" href="assets/css/styles.css..." ...>` block in `index.html`.
- **CLS Zero-Shift Contract:** `index.html` pre-populates `#heroStreak` (`🔥 0 Days`), `#headerXPBadge` (`Lvl 1 (Cadet) - 0 XP`), `#domainChecks` (6 domain pills), `#homeStats` (6 `.stat` cards), and `#simPacketType` so initial unhydrated DOM height equals post-JS hydrated height (`CLS = 0.0000` at both `982×731` and `1440×900`).
