import {
  isFirebaseConfigured,
  hasSavedAuthSessionHint,
  getCachedFirebaseAuth,
  getCachedFirestoreDb,
  getFirebaseApp,
  getFirebaseAuth,
  getFirestoreDb,
  loadFirebaseAuthModule,
  loadFirestoreModule
} from "./firebase-lazy.js?v=84";

let _registeredAuthCallback = null;
let _authListenerUnsub = null;
let _authAttachPromise = null;

function normalizeLocalDate(raw) {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) return null;
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isFirebaseEnabled() {
  return isFirebaseConfigured();
}

export function getFirestoreDB() {
  return getCachedFirestoreDb();
}

export {
  getFirebaseApp,
  getFirebaseAuth,
  getFirestoreDb,
  getCachedFirebaseAuth,
  getCachedFirestoreDb
};

async function ensureAuthListenerAttached() {
  if (_authListenerUnsub) return _authListenerUnsub;
  if (_authAttachPromise) return _authAttachPromise;

  _authAttachPromise = (async () => {
    const authBundle = await loadFirebaseAuthModule();
    if (!authBundle || !authBundle.auth) {
      _authAttachPromise = null;
      return null;
    }
    const { auth, onAuthStateChanged } = authBundle;
    _authListenerUnsub = onAuthStateChanged(auth, (user) => {
      if (_registeredAuthCallback) {
        _registeredAuthCallback(user);
      }
    });
    return _authListenerUnsub;
  })();

  return _authAttachPromise;
}

export async function loginWithGoogle() {
  if (!isFirebaseConfigured()) {
    alert("Please configure your Firebase credentials in assets/js/config.js first.");
    return null;
  }
  const authBundle = await loadFirebaseAuthModule();
  if (!authBundle || !authBundle.auth) {
    const netErr = new Error("Firebase Auth unavailable");
    netErr.code = "auth/network-request-failed";
    throw netErr;
  }
  await ensureAuthListenerAttached();
  const { auth, GoogleAuthProvider, signInWithPopup } = authBundle;
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.warn("Login failed:", error?.code || error?.message || error);
    throw error;
  }
}

export async function logout() {
  try {
    localStorage.removeItem("ccna_last_uid");
  } catch {}
  if (!isFirebaseConfigured()) return;
  const authBundle = await loadFirebaseAuthModule();
  if (!authBundle || !authBundle.auth) return;
  try {
    await authBundle.signOut(authBundle.auth);
  } catch (error) {
    console.warn("Logout failed:", error?.message || error);
    throw error;
  }
}

export function onAuthChange(callback) {
  _registeredAuthCallback = callback;

  if (!isFirebaseConfigured()) {
    callback(null);
    return () => {};
  }

  // Only load Firebase Auth on initial page load if a persisted signed-in session must be restored.
  // Otherwise initialize guest state immediately with zero Firebase network requests;
  // clicking "Sign In" (loginWithGoogle) will lazy-load Auth and attach the listener on demand.
  if (!hasSavedAuthSessionHint()) {
    callback(null);
    return () => {
      if (_authListenerUnsub) _authListenerUnsub();
    };
  }

  const restoreSessionAfterPaint = async () => {
    const unsub = await ensureAuthListenerAttached();
    if (!unsub && _registeredAuthCallback) {
      // Offline or CDN blocked: fall back to local guest state without console errors
      _registeredAuthCallback(null);
    }
  };

  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(() => {
      restoreSessionAfterPaint();
    }, { timeout: 1500 });
  } else {
    setTimeout(restoreSessionAfterPaint, 120);
  }

  return () => {
    if (_authListenerUnsub) _authListenerUnsub();
  };
}

export async function saveUserProgress(userId, data) {
  if (!isFirebaseConfigured() || !userId) return false;
  const fs = await loadFirestoreModule();
  if (!fs || !fs.db) return false;
  try {
    const userDocRef = fs.doc(fs.db, "users", userId);
    await fs.setDoc(
      userDocRef,
      {
        analytics: data,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn("Error saving user progress:", error?.message || error);
    return false;
  }
}

export async function loadUserProgress(userId) {
  if (!isFirebaseConfigured() || !userId) return null;
  const fs = await loadFirestoreModule();
  if (!fs || !fs.db) return null;
  try {
    const userDocRef = fs.doc(fs.db, "users", userId);
    const snap = await fs.getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data().analytics || null;
    }
  } catch (error) {
    console.warn("Error loading user progress:", error?.message || error);
  }
  return null;
}

export async function saveSupportTicket(ticket) {
  if (!isFirebaseConfigured()) return null;
  const fs = await loadFirestoreModule();
  if (!fs || !fs.db) return null;
  try {
    const colRef = fs.collection(fs.db, "supportTickets");
    const docRef = await fs.addDoc(colRef, ticket);
    return docRef.id;
  } catch (error) {
    console.warn("Error saving support ticket to Firestore:", error?.message || error);
    return null;
  }
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

  // Merge streak + lastAttemptDate: normalize both dates to YYYY-MM-DD local and keep the newer one
  const localDate = normalizeLocalDate(local.lastAttemptDate);
  const cloudDate = normalizeLocalDate(cloud.lastAttemptDate);
  if (localDate && cloudDate) {
    if (localDate > cloudDate) {
      merged.lastAttemptDate = localDate;
      merged.streak = Math.max(0, Number(local.streak) || 0);
    } else if (cloudDate > localDate) {
      merged.lastAttemptDate = cloudDate;
      merged.streak = Math.max(0, Number(cloud.streak) || 0);
    } else {
      merged.lastAttemptDate = localDate;
      merged.streak = Math.max(Number(local.streak) || 0, Number(cloud.streak) || 0);
    }
  } else if (localDate) {
    merged.lastAttemptDate = localDate;
    merged.streak = Math.max(0, Number(local.streak) || 0);
  } else if (cloudDate) {
    merged.lastAttemptDate = cloudDate;
    merged.streak = Math.max(0, Number(cloud.streak) || 0);
  } else {
    merged.lastAttemptDate = null;
    merged.streak = Math.max(Number(local.streak) || 0, Number(cloud.streak) || 0);
  }

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
  // Question ids are only meaningful within one bank version; if either side is stale, the
  // merged result stays stale so migrateBankVersion() (core.js) will drop the dangling ids.
  merged.bankVersion = Math.min(local.bankVersion || 0, cloud.bankVersion || 0);

  // Merge achievements (keep any that are unlocked in either)
  merged.ach = { ...(local.ach || {}), ...(cloud.ach || {}) };

  // Merge domain analytics
  const allDomains = new Set([
    ...Object.keys(local.domain || {}),
    ...Object.keys(cloud.domain || {})
  ]);
  merged.domain = {};
  allDomains.forEach((domain) => {
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
  allTopics.forEach((topic) => {
    const l = (local.topic && local.topic[topic]) || { total: 0, correct: 0 };
    const c = (cloud.topic && cloud.topic[topic]) || { total: 0, correct: 0 };
    merged.topic[topic] = {
      total: Math.max(l.total, c.total),
      correct: Math.max(l.correct, c.correct)
    };
  });

  // Merge chapter analytics
  const allChapters = new Set([
    ...Object.keys(local.chapter || {}),
    ...Object.keys(cloud.chapter || {})
  ]);
  merged.chapter = {};
  allChapters.forEach((ch) => {
    const l = (local.chapter && local.chapter[ch]) || { total: 0, correct: 0 };
    const c = (cloud.chapter && cloud.chapter[ch]) || { total: 0, correct: 0 };
    merged.chapter[ch] = {
      total: Math.max(l.total, c.total),
      correct: Math.max(l.correct, c.correct)
    };
  });

  // Merge attempts lists (sort chronologically and keep last 40)
  const allAttempts = [...(local.attempts || []), ...(cloud.attempts || [])];
  const uniqueAttempts = [];
  const seenTimestamps = new Set();
  allAttempts.forEach((att) => {
    if (att && att.at && !seenTimestamps.has(att.at)) {
      seenTimestamps.add(att.at);
      uniqueAttempts.push(att);
    }
  });
  merged.attempts = uniqueAttempts
    .sort((a, b) => String(a.at).localeCompare(String(b.at)))
    .slice(-40);

  // Merge watched videos progress
  const localWatched = local.watchedVideos || [];
  const cloudWatched = cloud.watchedVideos || [];
  merged.watchedVideos = Array.from(new Set([...localWatched, ...cloudWatched]));

  // Merge unique completed lab IDs
  const localLabIds = local.completedLabIds || [];
  const cloudLabIds = cloud.completedLabIds || [];
  merged.completedLabIds = Array.from(new Set([...localLabIds, ...cloudLabIds]));
  merged.labsCompleted = Math.max(
    merged.labsCompleted || 0,
    merged.completedLabIds.length
  );

  // Preserve last watched video pointer
  merged.lastWatchedVideoId =
    local.lastWatchedVideoId || cloud.lastWatchedVideoId || null;

  return merged;
}
