import { loginWithGoogle, logout, onAuthChange, saveUserProgress, loadUserProgress, mergeProgress } from "./firebase.js";
import { state, STORE, authResolve, safeSetStorage, showToast, createDefaultAnalytics, byId, getLevelInfo } from "./core.js";

// We need these UI functions from app.js / global scope
function refreshUI() {
  if (window.renderHome) window.renderHome();
  if (window.renderAnalytics) window.renderAnalytics();
}

export function updateHeaderProfile() {
  const xp = state.analytics.xp || 0;
  const info = getLevelInfo(xp);
  const badge = byId("headerXPBadge");
  if (badge) {
    badge.textContent = `Lvl ${info.level} (${info.label}) - ${xp} XP`;
  }
}

// Bind to window to allow core.js (gainXP) to update the header
window.updateHeaderProfile = updateHeaderProfile;

export function setupAuth() {
  const btnSignIn = byId("btnSignIn");
  const btnSignOut = byId("btnSignOut");
  const userProfile = byId("userProfile");
  const userPhoto = byId("userPhoto");
  const userName = byId("userName");

  btnSignIn.addEventListener("click", async () => {
    try {
      showToast("Opening Google Sign-In...", "info", 2000);
      await loginWithGoogle();
    } catch (err) {
      console.error("Login failed:", err);
      showToast("Authentication failed.", "error");
    }
  });

  btnSignOut.addEventListener("click", async () => {
    try {
      await logout();
      showToast("Signed out successfully.", "info");
    } catch (err) {
      console.error("Logout failed:", err);
      showToast("Failed to sign out.", "error");
    }
  });

  onAuthChange(async (user) => {
    try {
      state.user = user;
      if (user) {
        btnSignIn.classList.add("hidden");
        userProfile.classList.remove("hidden");
        userPhoto.src = user.photoURL || "";
        userName.textContent = user.displayName || user.email;

        showToast(`Welcome back, ${user.displayName || "Engineer"}!`, "ok");
        
        console.log("User logged in. Loading user profile progress...");
        const cloud = await loadUserProgress(user.uid);
        const userKey = `${STORE}_${user.uid}`;
        const localCached = localStorage.getItem(userKey);

        let merged = cloud || null;

        // Merge with local cached user progress if present
        if (localCached) {
          try {
            const parsedLocal = JSON.parse(localCached);
            merged = mergeProgress(parsedLocal, merged);
          } catch (e) {
            console.error("Error parsing local cached user progress:", e);
          }
        }

        // Merge with guest data if present
        const guestRaw = localStorage.getItem(STORE);
        let didMergeGuest = false;
        if (guestRaw) {
          try {
            const parsedGuest = JSON.parse(guestRaw);
            if (parsedGuest && (parsedGuest.xp > 0 || parsedGuest.totalQ > 0 || (parsedGuest.attempts && parsedGuest.attempts.length > 0))) {
              console.log("Merging guest progress into user profile...", parsedGuest);
              merged = mergeProgress(parsedGuest, merged);
              didMergeGuest = true;
              showToast("Merged local guest progress into your cloud profile.", "info", 4500);
            }
          } catch (e) {
            console.error("Error parsing guest progress:", e);
          }
        }

        if (!merged) {
          merged = createDefaultAnalytics();
        } else {
          merged.attempts = merged.attempts || [];
          merged.domain = merged.domain || {};
          merged.topic = merged.topic || {};
          merged.totalQ = merged.totalQ || 0;
          merged.correct = merged.correct || 0;
          merged.totalTime = merged.totalTime || 0;
          merged.studyMin = merged.studyMin || 0;
          merged.xp = merged.xp || 0;
          merged.ach = merged.ach || {};
          merged.missedIds = merged.missedIds || [];
          merged.simPathsRun = merged.simPathsRun || { ospf: false, roas: false };
          merged.watchedVideos = merged.watchedVideos || [];
        }

        state.analytics = merged;

        // Clear guest progress so it isn't merged again on next login
        if (didMergeGuest) {
          safeSetStorage(localStorage, `${STORE}_backup`, guestRaw);
          localStorage.removeItem(STORE);
        }

        safeSetStorage(localStorage, userKey, JSON.stringify(state.analytics));

        // Save progress and report feedback on failure
        saveUserProgress(user.uid, state.analytics)
          .then(() => {
            showToast("Telemetry synced to Cloud", "ok");
          })
          .catch((err) => {
            console.error("Cloud sync failed on login/merge:", err);
            showToast("Local save complete (offline)", "warn");
          });

        refreshUI();
      } else {
        btnSignIn.classList.remove("hidden");
        userProfile.classList.add("hidden");
        userPhoto.src = "";
        userName.textContent = "";

        console.log("User logged out. Restoring guest progress...");
        let guestData = localStorage.getItem(STORE);
        if (!guestData) {
          guestData = localStorage.getItem(`${STORE}_backup`);
        }

        let parsedGuest = null;
        if (guestData) {
          try {
            parsedGuest = JSON.parse(guestData);
          } catch (e) {
            console.error("Error parsing guest progress on logout:", e);
          }
        }

        state.analytics = parsedGuest || createDefaultAnalytics();
        state.analytics.missedIds = state.analytics.missedIds || [];
        state.analytics.simPathsRun = state.analytics.simPathsRun || { ospf: false, roas: false };
        state.analytics.watchedVideos = state.analytics.watchedVideos || [];

        refreshUI();
      }
    } catch (err) {
      console.error("Error in onAuthChange handler:", err);
    } finally {
      authResolve();
    }
  });
}
