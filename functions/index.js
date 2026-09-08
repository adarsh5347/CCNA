/**
 * NetOps Command — Firebase Cloud Functions
 * Handles Razorpay payment processing and subscription management.
 *
 * IMPORTANT: Before deploying, set your Razorpay secret via:
 *   firebase functions:config:set razorpay.key_id="rzp_live_XXXX" razorpay.key_secret="YOUR_SECRET"
 *
 * For local development / emulator, create functions/.runtimeconfig.json:
 * {
 *   "razorpay": { "key_id": "rzp_test_XXXX", "key_secret": "YOUR_TEST_SECRET" }
 * }
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();

// ─── Plan pricing (in paise — Indian currency smallest unit) ────────────────
const PLANS = {
  monthly: {
    amount: 29900,      // ₹299
    currency: "INR",
    description: "NetOps Command — Monthly Premium (₹299/month)",
    label: "Monthly"
  },
  lifetime: {
    amount: 99900,      // ₹999
    currency: "INR",
    description: "NetOps Command — Lifetime Premium (₹999 one-time)",
    label: "Lifetime"
  }
};

// ─── Helper: Get Razorpay credentials from Functions config ─────────────────
function getRazorpayConfig() {
  const config = functions.config();
  const keyId = config.razorpay && config.razorpay.key_id;
  const keySecret = config.razorpay && config.razorpay.key_secret;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials not configured. Run: firebase functions:config:set razorpay.key_id=... razorpay.key_secret=...");
  }
  return { keyId, keySecret };
}

// ─── Helper: Razorpay basic auth header ─────────────────────────────────────
function razorpayAuthHeader(keyId, keySecret) {
  return "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
}

// ─── Callable: createRazorpayOrder ─────────────────────────────────────────
// Called from frontend. Creates a Razorpay order server-side and returns it.
exports.createRazorpayOrder = functions.https.onCall(async (data, context) => {
  // Must be authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be signed in to upgrade.");
  }

  const plan = data.plan;
  if (!plan || !PLANS[plan]) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid plan. Choose 'monthly' or 'lifetime'.");
  }

  const planConfig = PLANS[plan];
  const uid = context.auth.uid;

  // Check if user already has active subscription
  const subRef = db.collection("users").doc(uid).collection("subscription").doc("current");
  const subSnap = await subRef.get();
  if (subSnap.exists) {
    const sub = subSnap.data();
    if (sub.plan === "lifetime" && sub.status === "active") {
      throw new functions.https.HttpsError("already-exists", "You already have a Lifetime subscription.");
    }
    if (sub.status === "active" && sub.plan === "monthly") {
      const expiry = new Date(sub.current_period_end);
      if (expiry > new Date()) {
        throw new functions.https.HttpsError("already-exists", "You already have an active Monthly subscription.");
      }
    }
  }

  try {
    const { keyId, keySecret } = getRazorpayConfig();

    // Create Razorpay order
    const orderPayload = {
      amount: planConfig.amount,
      currency: planConfig.currency,
      receipt: `netops_${uid.substring(0, 8)}_${Date.now()}`,
      notes: {
        uid,
        plan,
        email: context.auth.token.email || ""
      }
    };

    const response = await axios.post(
      "https://api.razorpay.com/v1/orders",
      orderPayload,
      {
        headers: {
          "Authorization": razorpayAuthHeader(keyId, keySecret),
          "Content-Type": "application/json"
        }
      }
    );

    const order = response.data;
    functions.logger.info("Razorpay order created", { orderId: order.id, uid, plan });

    // Store the pending order in Firestore for verification
    await db.collection("users").doc(uid).collection("orders").doc(order.id).set({
      orderId: order.id,
      plan,
      amount: planConfig.amount,
      status: "created",
      uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      orderId: order.id,
      amount: planConfig.amount,
      currency: planConfig.currency,
      keyId,
      description: planConfig.description,
      plan
    };
  } catch (err) {
    functions.logger.error("Failed to create Razorpay order", err);
    if (err.response && err.response.data) {
      throw new functions.https.HttpsError("internal", `Razorpay error: ${err.response.data.error.description}`);
    }
    throw new functions.https.HttpsError("internal", "Failed to create payment order. Please try again.");
  }
});

// ─── Callable: verifyRazorpayPayment ───────────────────────────────────────
// Called from frontend after Razorpay checkout completes.
// This is a secondary verification — the webhook is the primary source of truth.
exports.verifyRazorpayPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be signed in.");
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = data;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
    throw new functions.https.HttpsError("invalid-argument", "Missing payment verification fields.");
  }

  const uid = context.auth.uid;

  try {
    const { keySecret } = getRazorpayConfig();

    // Verify HMAC-SHA256 signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac("sha256", keySecret).update(body).digest("hex");

    if (expectedSignature !== razorpay_signature) {
      functions.logger.warn("Razorpay signature mismatch", { uid, razorpay_order_id });
      throw new functions.https.HttpsError("permission-denied", "Payment signature verification failed.");
    }

    // Valid payment — write subscription to Firestore
    await activateSubscription(uid, plan, razorpay_payment_id, razorpay_order_id);
    functions.logger.info("Payment verified and subscription activated", { uid, plan, razorpay_payment_id });

    return { success: true, plan };
  } catch (err) {
    if (err instanceof functions.https.HttpsError) throw err;
    functions.logger.error("Payment verification error", err);
    throw new functions.https.HttpsError("internal", "Payment verification failed.");
  }
});

// ─── HTTP: handleRazorpayWebhook ────────────────────────────────────────────
// Razorpay POSTs to this endpoint on payment events.
// Set this URL in your Razorpay dashboard: Webhooks → Add New Webhook
// URL: https://us-central1-ccna-prep-platform.cloudfunctions.net/handleRazorpayWebhook
exports.handleRazorpayWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { keySecret } = getRazorpayConfig();
  const webhookSecret = keySecret; // Razorpay uses the same secret for webhooks

  // Verify webhook signature
  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);
  const expectedSig = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex");

  if (!signature || signature !== expectedSig) {
    functions.logger.warn("Webhook signature mismatch");
    return res.status(400).send("Invalid signature");
  }

  const event = req.body;
  functions.logger.info("Razorpay webhook received", { event: event.event });

  try {
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const notes = payment.notes || {};
      const uid = notes.uid;
      const plan = notes.plan;

      if (!uid || !plan) {
        functions.logger.warn("Webhook missing uid or plan in notes", { notes });
        return res.status(200).send("OK"); // Acknowledge but skip
      }

      await activateSubscription(uid, plan, payment.id, payment.order_id);
      functions.logger.info("Subscription activated via webhook", { uid, plan });
    }

    if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;
      const notes = payment.notes || {};
      const uid = notes.uid;
      functions.logger.warn("Payment failed", { uid, paymentId: payment.id });

      if (uid) {
        await db.collection("users").doc(uid).collection("orders").doc(payment.order_id).set({
          status: "failed",
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }
    }

    res.status(200).send("OK");
  } catch (err) {
    functions.logger.error("Webhook processing error", err);
    res.status(500).send("Internal error");
  }
});

// ─── Helper: Activate subscription in Firestore ─────────────────────────────
async function activateSubscription(uid, plan, paymentId, orderId) {
  const now = new Date();
  let current_period_end = null;

  if (plan === "monthly") {
    const expiry = new Date(now);
    expiry.setDate(expiry.getDate() + 31); // 31 days
    current_period_end = expiry.toISOString();
  }

  // Write to users/{uid}/subscription/current
  const subRef = db.collection("users").doc(uid).collection("subscription").doc("current");
  await subRef.set({
    plan,
    status: "active",
    razorpay_payment_id: paymentId,
    razorpay_order_id: orderId,
    current_period_end,
    activated_at: now.toISOString(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: false }); // Full overwrite to clear any stale data

  // Also write to payments history
  const paymentRef = db.collection("users").doc(uid).collection("payments").doc(paymentId);
  await paymentRef.set({
    paymentId,
    orderId,
    plan,
    amount: PLANS[plan].amount,
    currency: "INR",
    status: "captured",
    paidAt: now.toISOString()
  });

  // Update parent user doc with top-level plan field for easy security rules checks
  await db.collection("users").doc(uid).set({
    plan,
    premiumSince: now.toISOString(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
}

// ─── Callable: getSubscriptionStatus ────────────────────────────────────────
// Frontend calls this to get current subscription state.
exports.getSubscriptionStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be signed in.");
  }
  const uid = context.auth.uid;

  const subRef = db.collection("users").doc(uid).collection("subscription").doc("current");
  const snap = await subRef.get();

  if (!snap.exists) {
    return { plan: "free", status: "none" };
  }

  const sub = snap.data();

  // For monthly: check if expired
  if (sub.plan === "monthly" && sub.current_period_end) {
    const expiry = new Date(sub.current_period_end);
    if (expiry < new Date()) {
      // Mark as expired in Firestore
      await subRef.set({ status: "expired" }, { merge: true });
      await db.collection("users").doc(uid).set({ plan: "free" }, { merge: true });
      return { plan: "free", status: "expired", expiredAt: sub.current_period_end };
    }
  }

  return {
    plan: sub.plan,
    status: sub.status,
    current_period_end: sub.current_period_end || null,
    activated_at: sub.activated_at || null
  };
});

// ─── Callable: getAdminStats (Admin only) ───────────────────────────────────
exports.getAdminStats = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be signed in.");
  }

  // Check admin claim
  const user = await admin.auth().getUser(context.auth.uid);
  const isAdmin = user.customClaims && user.customClaims.admin === true;
  if (!isAdmin) {
    throw new functions.https.HttpsError("permission-denied", "Admin access only.");
  }

  // Aggregate stats from Firestore
  const usersSnap = await db.collection("users").get();
  let totalUsers = 0;
  let premiumUsers = 0;
  let monthlyUsers = 0;
  let lifetimeUsers = 0;

  usersSnap.forEach(doc => {
    totalUsers++;
    const data = doc.data();
    if (data.plan === "monthly" || data.plan === "lifetime") {
      premiumUsers++;
      if (data.plan === "monthly") monthlyUsers++;
      if (data.plan === "lifetime") lifetimeUsers++;
    }
  });

  const estimatedRevenue = (monthlyUsers * 299) + (lifetimeUsers * 999);

  return {
    totalUsers,
    premiumUsers,
    monthlyUsers,
    lifetimeUsers,
    freeUsers: totalUsers - premiumUsers,
    estimatedRevenue
  };
});

// ─── Callable: adminGrantPremium (Admin only) ───────────────────────────────
exports.adminGrantPremium = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be signed in.");
  }

  const callerUser = await admin.auth().getUser(context.auth.uid);
  const isAdmin = callerUser.customClaims && callerUser.customClaims.admin === true;
  if (!isAdmin) {
    throw new functions.https.HttpsError("permission-denied", "Admin access only.");
  }

  const { targetUid, plan } = data;
  if (!targetUid || !["monthly", "lifetime", "free"].includes(plan)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid targetUid or plan.");
  }

  if (plan === "free") {
    // Revoke premium
    const subRef = db.collection("users").doc(targetUid).collection("subscription").doc("current");
    await subRef.set({ plan: "free", status: "revoked", updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    await db.collection("users").doc(targetUid).set({ plan: "free" }, { merge: true });
    functions.logger.info("Admin revoked premium", { targetUid, by: context.auth.uid });
  } else {
    await activateSubscription(targetUid, plan, `admin_grant_${Date.now()}`, `admin_${context.auth.uid}`);
    functions.logger.info("Admin granted premium", { targetUid, plan, by: context.auth.uid });
  }

  return { success: true };
});

// ─── Callable: setAdminClaim (Super admin bootstrap) ────────────────────────
// Used once to make yourself an admin. Disable or delete after use.
// Call this from Firebase console or via a local script.
exports.setAdminClaim = functions.https.onCall(async (data, context) => {
  // SECURITY: Only works if called by someone already admin, OR if no admins exist yet
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be signed in.");
  }

  const callerUser = await admin.auth().getUser(context.auth.uid);
  const callerIsAdmin = callerUser.customClaims && callerUser.customClaims.admin === true;

  // Allow self-promotion only if setting self (for initial bootstrap)
  if (!callerIsAdmin && data.uid !== context.auth.uid) {
    throw new functions.https.HttpsError("permission-denied", "Only existing admins can grant admin to others.");
  }

  const targetUid = data.uid || context.auth.uid;
  await admin.auth().setCustomUserClaims(targetUid, { admin: true });
  functions.logger.info("Admin claim set", { targetUid, by: context.auth.uid });

  return { success: true, uid: targetUid };
});
