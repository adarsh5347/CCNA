# NetOps Command — Cisco CCNA 200-301 Engineering Suite

An independent, production-ready single-page web application for Cisco CCNA 200-301 certification preparation. Built with modular ES6+ JavaScript, a Precision Engineering token-driven design system, accessibility compliance (WCAG 2.2 AA), strict CSP/security headers, and offline-first PWA caching.

- **Live Deployment**: [https://ccna-prep-platform.vercel.app](https://ccna-prep-platform.vercel.app)
- **Source Repository**: [https://github.com/adarsh5347/CCNA](https://github.com/adarsh5347/CCNA)

---

## Tech Stack & Architecture

- **Frontend**: Vanilla ES6+ JavaScript modules (`assets/js/`), semantic HTML5 (`index.html`), modular CSS (`assets/css/` — dark, light, and high-contrast themes). Zero frontend frameworks.
- **Build Pipeline**: `esbuild`-powered static optimizer (`tools/build.mjs`) that bundles CSS partials, minifies all JS/CSS assets into `dist/`, and inlines critical minified CSS into `dist/index.html` for `0` render-blocking stylesheet requests and `0.0000` CLS.
- **Hosting & Security**: Vercel static deployment (`vercel.json`) with `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, and a scoped `Content-Security-Policy`.
- **Cloud Auth & Persistence**: Lazy-loaded Firebase v10 SDK (`assets/js/firebase-lazy.js`, `assets/js/firebase.js`) for on-demand Google Sign-In and Cloud Firestore progress sync with multi-tab persistence (`firestore.rules`).
- **Offline PWA**: Service Worker (`sw.js`, cache `ccna-prep-v86`) with network-first caching, query-string normalization, Study Guide precache, and SPA navigation fallback, plus `manifest.json`.
- **Access Model**: 100% free and permanently unlocked across all 635 questions, 48 Study Guide chapters, 126 video lessons, and 10 virtual IOS labs (`assets/js/subscription.js`).

---

## Core Modules

1. **Adaptive Quiz & Examination Engine** (`assets/js/quiz-engine.js`, `review.js`, `timer.js`)
   - 635 blueprint-mapped questions across 6 CCNA 200-301 domains (`assets/js/qb/`).
   - Modes: Study Mode, Section Quiz, Smart Adaptive Quiz, Spaced Repetition (Missed Questions), and 120-Question Timed Examination with pre-exam briefing modal, question flagging, pause handling, keyboard shortcuts (`A–D`, `ArrowLeft`/`ArrowRight`/`N`, `F`, `P`), and post-submit review.
2. **Structured CCNA Study Guide** (`assets/js/guide-ui.js`, `assets/js/guide/`)
   - 48 Official Cert Guide chapters loaded lazily on first visit (`v1p1`–`v2p2`), complete with chapter drills, CLI command reference, and searchable A–Z glossary.
3. **Curated Video Library** (`assets/js/videos.js`)
   - 126 structured CCNA lessons with domain filtering, search, modal player with keyboard navigation, and synced watch tracking.
4. **Virtual IOS Lab Center** (`assets/js/labs.js`, `cli.js`)
   - 10 guided Cisco IOS CLI configuration labs (VLANs, ROAS, OSPF, ACLs, DHCP, NAT Overload, STP, EtherChannel, WLC, VPN) across Guided, Challenge, and Exam modes.
5. **NOC Packet Traversal Simulator** (`assets/js/topology.js`)
   - Interactive topology inspector visualizing Layer 1–7 packet flow and Cisco IOS troubleshooting commands.
6. **Subnetting Academy, VLSM Architect & Flashcards** (`assets/js/subnetting.js`)
   - Multi-tier subnetting drills, 30s timed challenge, 32-bit binary breakdown, CIDR cheat sheet, VLSM calculator, and rapid-recall flashcards.
7. **Analytics & Study Planner** (`assets/js/quiz-engine.js`, `streak.js`)
   - Weighted readiness calculation, pass probability estimate, streak tracking, achievement badges, exam-date planner, and JSON export/import backups.
8. **Support Desk, Account & Admin Station** (`assets/js/app.js`, `account.js`, `admin.js`)
   - Validated support ticket submission with honest cloud vs. offline local receipt reporting, guest/cloud account management with portable JSON backups, and UID-restricted NOC admin diagnostics enforced by `firestore.rules`.

---

## Repository Structure

```text
├── assets/
│   ├── css/
│   │   ├── styles.css                # Modular CSS entry manifest
│   │   ├── base/                     # Tokens & resets
│   │   ├── layout/                   # Topbar, buttons, grids, forms
│   │   ├── components/               # Rings, review, toasts
│   │   ├── pages/                    # Study guide, labs, subnetting, exam, QA polish CSS
│   │   ├── themes/                   # Light theme overrides
│   │   └── responsive/               # Mobile shell (<768px) & compact desktop rules
│   ├── js/
│   │   ├── app.js                    # Entry point, SPA routing, modals, support desk, labs/videos UI
│   │   ├── core.js                   # State, storage helpers, XP levels, analytics schema
│   │   ├── auth.js                   # Google auth listener & guest/cloud state merge
│   │   ├── firebase.js / -lazy.js    # On-demand Firebase Auth & Firestore persistence
│   │   ├── config.js                 # Public Firebase configuration
│   │   ├── quiz-engine.js            # Scoring, readiness, analytics, session lifecycle
│   │   ├── data.js & qb/             # Blueprint definition & 635-question modular bank
│   │   ├── guide-ui.js & guide/      # Lazy-loaded 48-chapter Study Guide & glossary
│   │   ├── labs.js & cli.js          # 10 Virtual IOS labs & CLI parser
│   │   ├── topology.js               # Packet traversal SVG & IOS troubleshooting
│   │   ├── subnetting.js             # Subnet trainer, VLSM engine & flashcards
│   │   ├── videos.js                 # 126 curated video lessons
│   │   ├── account.js                # Account dashboard & backup actions
│   │   ├── admin.js                  # Owner-restricted NOC station controls
│   │   └── subscription.js           # Free full-access flags & owner UID check
│   └── icon.svg
├── tools/
│   ├── build.mjs                     # Production builder -> dist/
│   ├── validate-qb.mjs               # Question bank & guide schema validator
│   └── tests/                        # CDP headless verification scripts & visual baselines
├── firestore.rules                   # Firestore authorization & ticket validation rules
├── vercel.json                       # Vercel headers, caching & Content-Security-Policy
├── manifest.json                     # PWA manifest
├── sw.js                             # Service Worker (ccna-prep-v86)
├── robots.txt & sitemap.xml          # Crawler directives & public route map
└── index.html                        # Application shell
```

---

## Local Development & Verification

```bash
# Install dev dependencies (esbuild)
npm install

# Build production bundle into dist/
npm run build

# Serve dist/ locally (or root during development)
npx serve dist
```

### Automated Verification Suites (requires Google Chrome)

```bash
# Core end-to-end flows, persistence, routing & streaks
node tools/tests/verify_e2e.mjs

# Performance (CLS, render-blocking CSS, lazy Firebase & guide loading) & accessibility baselines
node tools/tests/verify_lighthouse_fixes.mjs

# Phase 11 complete application QA, WCAG 2.2 AA, PWA offline & security suite
node tools/tests/verify_phase11.mjs
```
