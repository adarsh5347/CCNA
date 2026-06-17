import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { firebaseConfig } from './config.js';

let app = null;
let auth = null;
let db = null;
let enabled = false;

// Check if credentials have been provided by checking if apiKey is set
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY") {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    enabled = true;
    console.log("Firebase initialized successfully.");
  } catch (error) {
    console.error("Error initializing Firebase:", error);
  }
} else {
  console.log("Firebase is not initialized (placeholder credentials detected). Running in local mode.");
}

export function isFirebaseEnabled() {
  return enabled;
}

export async function loginWithGoogle() {
  if (!enabled) {
    alert("Please configure your Firebase credentials in assets/js/config.js first.");
    return null;
  }
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
}

export async function logout() {
  if (!enabled) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
}

export function onAuthChange(callback) {
  if (!enabled) {
    // Call callback with null immediately since auth is disabled
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function saveUserProgress(userId, data) {
  if (!enabled || !db) return;
  try {
    const userDocRef = doc(db, "users", userId);
    // Overwrite/update the document with the fresh progress state
    await setDoc(userDocRef, {
      analytics: data,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error("Error saving user progress:", error);
  }
}

export async function loadUserProgress(userId) {
  if (!enabled || !db) return null;
  try {
    const userDocRef = doc(db, "users", userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data().analytics || null;
    }
  } catch (error) {
    console.error("Error loading user progress:", error);
  }
  return null;
}

// Function to merge local progress with cloud progress to ensure no data is lost
export function mergeProgress(local, cloud) {
  if (!local) return cloud;
  if (!cloud) return local;

  const merged = { ...local };

  // Take the highest value metrics
  merged.totalQ = Math.max(local.totalQ || 0, cloud.totalQ || 0);
  merged.correct = Math.max(local.correct || 0, cloud.correct || 0);
  merged.xp = Math.max(local.xp || 0, cloud.xp || 0);
  merged.studyMin = Math.max(local.studyMin || 0, cloud.studyMin || 0);
  merged.totalTime = Math.max(local.totalTime || 0, cloud.totalTime || 0);
  merged.labsCompleted = Math.max(local.labsCompleted || 0, cloud.labsCompleted || 0);
  merged.subnetMaxStreak = Math.max(local.subnetMaxStreak || 0, cloud.subnetMaxStreak || 0);
  merged.streak = Math.max(local.streak || 0, cloud.streak || 0);

  // Merge simPathsRun
  const localPaths = local.simPathsRun || { ospf: false, roas: false };
  const cloudPaths = cloud.simPathsRun || { ospf: false, roas: false };
  merged.simPathsRun = {
    ospf: localPaths.ospf || cloudPaths.ospf || false,
    roas: localPaths.roas || cloudPaths.roas || false
  };

  // Merge missedIds
  const localMissed = local.missedIds || [];
  const cloudMissed = cloud.missedIds || [];
  merged.missedIds = Array.from(new Set([...localMissed, ...cloudMissed]));

  // Merge achievements (keep any that are unlocked in either)
  merged.ach = { ...(local.ach || {}), ...(cloud.ach || {}) };

  // Merge domain analytics
  const allDomains = new Set([
    ...Object.keys(local.domain || {}),
    ...Object.keys(cloud.domain || {})
  ]);
  merged.domain = {};
  allDomains.forEach(domain => {
    const l = (local.domain && local.domain[domain]) || { total: 0, correct: 0 };
    const c = (cloud.domain && cloud.domain[domain]) || { total: 0, correct: 0 };
    merged.domain[domain] = {
      total: Math.max(l.total, c.total),
      correct: Math.max(l.correct, c.correct)
    };
  });

  // Merge topic analytics
  const allTopics = new Set([
    ...Object.keys(local.topic || {}),
    ...Object.keys(cloud.topic || {})
  ]);
  merged.topic = {};
  allTopics.forEach(topic => {
    const l = (local.topic && local.topic[topic]) || { total: 0, correct: 0 };
    const c = (cloud.topic && cloud.topic[topic]) || { total: 0, correct: 0 };
    merged.topic[topic] = {
      total: Math.max(l.total, c.total),
      correct: Math.max(l.correct, c.correct)
    };
  });

  // Merge attempts lists (sort chronologically and keep last 40)
  const allAttempts = [
    ...(local.attempts || []),
    ...(cloud.attempts || [])
  ];
  // Filter duplicates based on unique timestamps
  const uniqueAttempts = [];
  const seenTimestamps = new Set();
  allAttempts.forEach(att => {
    if (att && att.at && !seenTimestamps.has(att.at)) {
      seenTimestamps.add(att.at);
      uniqueAttempts.push(att);
    }
  });
  // Sort by date ascending and slice last 40
  merged.attempts = uniqueAttempts
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
    .slice(-40);

  return merged;
}
