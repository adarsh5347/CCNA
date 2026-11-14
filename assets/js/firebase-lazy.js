import { firebaseConfig } from "./config.js?v=84";

const FIREBASE_CDN_BASE = "https://www.gstatic.com/firebasejs/10.8.0";

let _appPromise = null;
let _authPromise = null;
let _firestorePromise = null;

let _cachedApp = null;
let _cachedAuth = null;
let _cachedAuthMod = null;
let _cachedDb = null;
let _cachedFirestoreMod = null;

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig &&
      firebaseConfig.apiKey &&
      firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY"
  );
}

/**
 * Checks whether the browser has a persisted signed-in session marker
 * so we only load firebase-auth.js on initial load when a session actually needs restoring.
 */
export function hasSavedAuthSessionHint() {
  try {
    if (localStorage.getItem("ccna_last_uid")) return true;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("firebase:authUser:")) return true;
    }
  } catch {}
  return false;
}

export function getCachedFirebaseApp() {
  return _cachedApp;
}

export function getCachedFirebaseAuth() {
  return _cachedAuth;
}

export function getCachedFirestoreDb() {
  return _cachedDb;
}

export async function getFirebaseApp() {
  if (!isFirebaseConfigured()) return null;
  if (_cachedApp) return _cachedApp;
  if (!_appPromise) {
    _appPromise = import(`${FIREBASE_CDN_BASE}/firebase-app.js`)
      .then(({ initializeApp }) => {
        _cachedApp = initializeApp(firebaseConfig);
        return _cachedApp;
      })
      .catch((err) => {
        _appPromise = null;
        console.warn("Firebase App SDK unavailable (offline or blocked):", err?.message || err);
        return null;
      });
  }
  return _appPromise;
}

export async function loadFirebaseAuthModule() {
  if (!isFirebaseConfigured()) return null;
  if (_cachedAuth && _cachedAuthMod) {
    return { auth: _cachedAuth, ..._cachedAuthMod };
  }
  if (!_authPromise) {
    _authPromise = Promise.all([
      getFirebaseApp(),
      import(`${FIREBASE_CDN_BASE}/firebase-auth.js`)
    ])
      .then(([app, authMod]) => {
        if (!app) {
          _authPromise = null;
          return null;
        }
        const {
          getAuth,
          signInWithPopup,
          GoogleAuthProvider,
          signOut,
          onAuthStateChanged
        } = authMod;
        _cachedAuth = getAuth(app);
        _cachedAuthMod = {
          signInWithPopup,
          GoogleAuthProvider,
          signOut,
          onAuthStateChanged
        };
        return { auth: _cachedAuth, ..._cachedAuthMod };
      })
      .catch((err) => {
        _authPromise = null;
        console.warn("Firebase Auth SDK unavailable (offline or blocked):", err?.message || err);
        return null;
      });
  }
  return _authPromise;
}

export async function getFirebaseAuth() {
  const res = await loadFirebaseAuthModule();
  return res ? res.auth : null;
}

export async function loadFirestoreModule() {
  if (!isFirebaseConfigured()) return null;
  if (_cachedDb && _cachedFirestoreMod) {
    return { db: _cachedDb, ..._cachedFirestoreMod };
  }
  if (!_firestorePromise) {
    _firestorePromise = Promise.all([
      getFirebaseApp(),
      import(`${FIREBASE_CDN_BASE}/firebase-firestore.js`)
    ])
      .then(([app, fsMod]) => {
        if (!app) {
          _firestorePromise = null;
          return null;
        }
        const {
          initializeFirestore,
          getFirestore,
          persistentLocalCache,
          persistentMultipleTabManager,
          doc,
          setDoc,
          getDoc,
          collection,
          addDoc
        } = fsMod;
        if (!_cachedDb) {
          try {
            _cachedDb = initializeFirestore(app, {
              localCache: persistentLocalCache({
                tabManager: persistentMultipleTabManager()
              })
            });
          } catch {
            _cachedDb = getFirestore(app);
          }
        }
        _cachedFirestoreMod = {
          doc,
          setDoc,
          getDoc,
          collection,
          addDoc
        };
        return { db: _cachedDb, ..._cachedFirestoreMod };
      })
      .catch((err) => {
        _firestorePromise = null;
        console.warn("Firebase Firestore SDK unavailable (offline or blocked):", err?.message || err);
        return null;
      });
  }
  return _firestorePromise;
}

export async function getFirestoreDb() {
  const res = await loadFirestoreModule();
  return res ? res.db : null;
}
