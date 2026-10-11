# NetOps Command — Cisco CCNA 200-301 Preparation Platform

A production-ready, interactive single-page learning platform for Cisco CCNA 200-301 certification prep. Built with high performance, mobile-first design, and offline PWA capability.

- **Production URL**: [https://ccna-prep-platform.vercel.app](https://ccna-prep-platform.vercel.app)
- **Source Repository**: [https://github.com/adarsh5347/CCNA.git](https://github.com/adarsh5347/CCNA)

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Vanilla JavaScript (ES6+ Modules), native DOM manipulation, semantic HTML5, custom CSS3. **No bundlers or frameworks (no React, Webpack, or Vite).**
- **Hosting**: Vercel (static edge delivery with immutable asset caching).
- **Backend & Database**: Firebase Authentication (Google popup sign-in) + Cloud Firestore with multi-tab offline local persistence.
- **Serverless API**: Firebase Cloud Functions (Node.js 20 runtime) for Razorpay payment processing and subscription management.
- **Offline / PWA**: Progressive Web App with service worker caching (`sw.js`) and network-first fallback.

---

## 🚀 Core Features

1. **Adaptive Quiz Engine** (`assets/js/quiz-engine.js`):
   - Blueprint-weighted question selection across all 6 Cisco CCNA domains.
   - Spaced Repetition engine targeting weak topics dynamically.
   - Modes: Study Mode, Quick 20-Question Quiz, Smart Adaptive Quiz, Missed Questions drill, and full 120-Question Pearson VUE Exam Simulation.
2. **Virtual IOS Lab Center** (`assets/js/labs.js`):
   - 10 guided virtual Cisco IOS CLI configuration labs (VLANs, ROAS, OSPF, ACLs, DHCP, NAT Overload, STP, EtherChannel, WLC, VPN).
3. **Subnetting Suite** (`assets/js/subnetting.js`):
   - IPv4 bitwise calculation engine, CIDR speed challenge timer, 32-bit binary grid breakdown, and local speed leaderboard.
4. **Packet Traversal Simulator** (`assets/js/topology.js`):
   - Multi-topology visual packet tracing (ARP, DHCP, NAT, OSPF, STP, ACLs) with live interactive Cisco CLI command terminal.
5. **Video Learning Hub** (`assets/js/videos.js`):
   - 126 CCNA video lecture lessons with cloud-synchronized watch status.
6. **Monetization & Access Control**:
   - **Free Tier**: Unlimited subnetting, 5 virtual labs, 30 curated videos, study quiz mode, basic progress analytics.
   - **Premium Tier (₹299/mo or ₹999 lifetime)**: Full 120-question exam drills, all 10 virtual labs, full 126-video catalog, advanced heatmap analytics, ⭐ Premium topbar badge.
   - Serverless order creation and HMAC-SHA256 signature verification via Razorpay Cloud Functions.
   - Idempotent webhook receiver (`handleRazorpayWebhook`).

---

## 📁 Repository Structure

```
├── assets/
│   ├── css/
│   │   └── styles.css          # Design system, animations, and mobile layout rules
│   └── js/
│       ├── app.js              # Application entry, routing, modal managers, global error boundary
│       ├── core.js             # State management, sound engine, XP mechanics, analytics schema
│       ├── auth.js             # Google auth listener, guest-to-user state merging, profile UI
│       ├── firebase.js         # Firebase App, Auth, Firestore multi-tab offline persistence
│       ├── config.js           # Public Firebase credentials & Razorpay Key ID
│       ├── subscription.js     # Subscription state, paywall gating, Razorpay checkout modal
│       ├── account.js          # User account dashboard & payment history table
│       ├── admin.js            # Admin dashboard: telemetry analytics & manual UID access controls
│       ├── quiz-engine.js      # Exam engine, scoring formulas, readiness score, pass probability
│       ├── data.js             # Official CCNA blueprint + 241-question bank database
│       ├── labs.js             # 10 interactive Cisco IOS configuration labs
│       ├── topology.js         # Packet traversal SVG animation & CLI simulator
│       ├── subnetting.js       # IPv4 subnetting calculator & speed challenge
│       ├── videos.js           # 126 video lecture course database
│       └── cli.js              # Cisco IOS syntax parser & normalization engine
├── functions/                  # Firebase Cloud Functions (backend)
│   ├── index.js                # Serverless endpoints: createRazorpayOrder, verifyRazorpayPayment, handleRazorpayWebhook
│   └── package.json            # Node.js 20 dependencies
├── .env.example                # Template documenting required environment variables
├── firestore.rules             # Firestore security rules enforcing user isolation
├── firebase.json               # Firebase CLI project configuration
├── .firebaserc                 # Firebase project binding (ccna-prep-platform)
├── vercel.json                 # Vercel deployment headers (caching & COOP popup headers)
├── manifest.json               # PWA web app manifest
├── sw.js                       # PWA Service Worker (currently ccna-prep-v65)
├── index.html                  # Single-page application entry shell
└── CHANGELOG.md                # Release and change tracking history
```

---

## 💻 Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/adarsh5347/CCNA.git
   cd CCNA
   ```
2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
3. Run a local static HTTP server (e.g., via Python or Node):
   ```bash
   # Using Python 3:
   python -m http.server 8080

   # Or using npx:
   npx serve .
   ```
4. Open `http://localhost:8080` in your browser.

---

## 🚢 Deployment Checklist

1. **Static Frontend (Vercel)**:
   - Changes pushed to `main` automatically deploy to Vercel.
   - Always verify that the Service Worker cache version in `sw.js` and script query strings in `index.html` match (`v65`).
2. **Backend Functions & Security Rules (Firebase)**:
   ```bash
   firebase login
   firebase functions:config:set razorpay.key_id="rzp_live_..." razorpay.key_secret="..."
   firebase deploy --only functions,firestore:rules
   ```
3. **Razorpay Webhook Configuration**:
   - URL: `https://us-central1-ccna-prep-platform.cloudfunctions.net/handleRazorpayWebhook`
   - Events: `payment.captured`, `payment.failed`
