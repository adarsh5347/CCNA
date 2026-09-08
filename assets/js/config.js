// Firebase project configuration credentials
// Copy these values from the Project Settings in your Firebase Console
export const firebaseConfig = {
  apiKey: "AIzaSyA9SZdtWUxecIuc9-ElizaIHTEiw648D6o",
  authDomain: "ccna-prep-platform.firebaseapp.com",
  projectId: "ccna-prep-platform",
  storageBucket: "ccna-prep-platform.firebasestorage.app",
  messagingSenderId: "738402326601",
  appId: "1:738402326601:web:2fb22f32441b0856174798",
  measurementId: "G-BEVQDX14EQ"
};

// ─── Razorpay Configuration ────────────────────────────────────────────────
// Replace with your actual Razorpay Key ID from https://dashboard.razorpay.com/
// This is the PUBLIC key only — safe to include in frontend code.
// NEVER put your Razorpay Secret Key here. It lives in Firebase Functions config.
export const razorpayConfig = {
  keyId: "rzp_test_XXXXXXXXXXXXXXXX",  // ← Replace with your Razorpay Key ID
  name: "NetOps Command",
  description: "CCNA 200-301 Premium Access",
  image: "https://ccna-prep-platform.vercel.app/assets/icon.svg",
  theme: { color: "#00f2fe" }
};

// ─── Plan Pricing ─────────────────────────────────────────────────────────
// Amounts in paise (INR smallest unit). ₹299 = 29900 paise.
export const PLAN_CONFIG = {
  monthly: {
    amount: 29900,
    label: "Monthly",
    displayPrice: "₹299/month",
    description: "Full premium access, renews monthly"
  },
  lifetime: {
    amount: 99900,
    label: "Lifetime",
    displayPrice: "₹999 one-time",
    description: "Full premium access, pay once forever"
  }
};

// ─── Cloud Functions Base URL ──────────────────────────────────────────────
// Your Firebase Cloud Functions region endpoint.
// Update this after deploying your functions.
export const CLOUD_FUNCTIONS_REGION = "us-central1";
export const FIREBASE_PROJECT_ID = "ccna-prep-platform";
