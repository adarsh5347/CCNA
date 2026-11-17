import { saveUserProgress } from "./firebase.js?v=78";

export const STORE = "ccna_full_site_v1";

export let authResolve;
export const authReady = new Promise((resolve) => {
  authResolve = resolve;
});

export function safeSetStorage(storage, key, value) {
  try {
    storage.setItem(key, value);
  } catch (e) {
    console.error("Storage Quota Exceeded or Storage Error:", e);
    showToast("Storage limit reached. Some progress may not be saved locally.", "warn");
  }
}

/* ─── Toast Notification System ─────────────────────────── */
export function showToast(message, type = "info", duration = 3500) {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const activeToasts = [...container.querySelectorAll(".toast:not(.dismissing)")];
  while (activeToasts.length >= 2) {
    const oldest = activeToasts.shift();
    if (oldest) oldest.remove();
  }
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", "alert");
  toast.textContent = message;
  toast.addEventListener("click", () => dismissToast(toast));
  container.appendChild(toast);
  setTimeout(() => dismissToast(toast), duration);
}

export function dismissToast(toast) {
  if (toast.classList.contains("dismissing")) return;
  toast.classList.add("dismissing");
  toast.addEventListener("animationend", () => toast.remove(), { once: true });
  setTimeout(() => {
    if (toast.isConnected) toast.remove();
  }, 280);
}

export function safeHTML(str) {
  if (typeof str !== "string") return str;
  let escaped = str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
  escaped = escaped
    .replace(/&lt;b&gt;/g, "<b>").replace(/&lt;\/b&gt;/g, "</b>")
    .replace(/&lt;i&gt;/g, "<i>").replace(/&lt;\/i&gt;/g, "</i>")
    .replace(/&lt;br\s*\/*&gt;/g, "<br />")
    .replace(/&lt;code&gt;/g, "<code>").replace(/&lt;\/code&gt;/g, "</code>")
    .replace(/&lt;strong&gt;/g, "<strong>").replace(/&lt;\/strong&gt;/g, "</strong>")
    .replace(/&lt;pre&gt;/g, "<pre>").replace(/&lt;\/pre&gt;/g, "</pre>");
  return escaped;
}

export function rand() {
  return Math.random();
}

export function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}

export function shuffle(arr) {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

export function byId(id) {
  return document.getElementById(id);
}

// Bump whenever question ids change meaning (bank rebuild). Stored ids from older versions
// (state.analytics.missedIds) would otherwise point at unrelated questions.
export const BANK_VERSION = 3;

export function migrateBankVersion(a) {
  if (!a || typeof a !== "object") return a;
  if (!a.chapter || typeof a.chapter !== "object") a.chapter = {};
  if (a.bankVersion !== BANK_VERSION) {
    a.missedIds = [];
    a.bankVersion = BANK_VERSION;
  }
  return a;
}

export function createDefaultAnalytics() {
  return {
    bankVersion: BANK_VERSION,
    attempts: [],
    domain: {},
    topic: {},
    chapter: {},
    totalQ: 0,
    correct: 0,
    totalTime: 0,
    studyMin: 0,
    xp: 0,
    streak: 0,
    lastAttemptDate: null,
    labsCompleted: 0,
    completedLabIds: [],
    lastWatchedVideoId: null,
    subnetMaxStreak: 0,
    ach: {},
    simPathsRun: { ospf: false, roas: false },
    missedIds: [],
    watchedVideos: []
  };
}

export function validateAnalyticsSchema(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
  const requiredNums = ['totalQ', 'correct', 'xp', 'studyMin', 'totalTime', 'labsCompleted', 'subnetMaxStreak', 'streak'];
  for (const key of requiredNums) {
    if (typeof data[key] !== 'number' || !Number.isFinite(data[key]) || data[key] < 0) return false;
  }
  if (data.lastAttemptDate != null && typeof data.lastAttemptDate !== 'string') return false;
  if (!data.simPathsRun || typeof data.simPathsRun !== 'object') return false;
  if (!Array.isArray(data.missedIds)) return false;
  if (data.completedLabIds && !Array.isArray(data.completedLabIds)) return false;
  if (!data.ach || typeof data.ach !== 'object') return false;
  if (!data.domain || typeof data.domain !== 'object') return false;
  if (!data.topic || typeof data.topic !== 'object') return false;
  if (data.chapter && typeof data.chapter !== 'object') return false;
  if (!Array.isArray(data.attempts)) return false;
  if (data.watchedVideos && !Array.isArray(data.watchedVideos)) return false;
  return true;
}

export function loadAnalytics() {
  const base = createDefaultAnalytics();
  try {
    const key = (typeof state !== 'undefined' && state && state.user) ? `${STORE}_${state.user.uid}` : STORE;
    const raw = localStorage.getItem(key);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    return migrateBankVersion({ ...base, ...parsed, bankVersion: parsed.bankVersion });
  } catch {
    return base;
  }
}

export function saveAnalytics(quiet = false) {
  authReady.then(() => {
    if (!validateAnalyticsSchema(state.analytics)) {
      console.error("Analytics schema validation failed! Aborting save.");
      showToast("Telemetry save failed: schema mismatch.", "error");
      return;
    }
    const key = state.user ? `${STORE}_${state.user.uid}` : STORE;
    safeSetStorage(localStorage, key, JSON.stringify(state.analytics));
    if (state.user) {
      saveUserProgress(state.user.uid, state.analytics)
        .then((synced) => {
          if (!quiet) showToast(synced ? "Telemetry synced to Cloud" : "Telemetry saved locally", synced ? "ok" : "info");
        })
        .catch(err => {
          console.error("Cloud sync failed:", err);
          if (!quiet) showToast("Local save complete (offline)", "warn");
        });
    } else {
      if (!quiet) showToast("Telemetry saved locally", "info");
    }
  });
}

// Web Audio API Helpers for NOC sound effects
let audioCtx = null;

export function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

export function playNetSound(type) {
  if (state.muted) return;
  try {
    initAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    
    if (type === "hop") {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "success") {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.06, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.2);
      });
    } else if (type === "block") {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(150, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.setValueAtTime(0.12, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === "click") {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1000, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch (e) {
    console.warn("Web Audio API failed or blocked:", e);
  }
}

export function getLevelInfo(xp) {
  const level = Math.floor((xp || 0) / 100) + 1;
  const labels = {
    1: "Cable Puller",
    2: "Jr. Network Administrator",
    3: "Network Security Associate",
    4: "Senior Infrastructure Engineer",
    5: "Lead Network Architect"
  };
  const labelKey = Math.min(5, level);
  return {
    level,
    label: labels[labelKey] || "Lead Network Architect",
    currentXP: (xp || 0) % 100,
    nextXP: 100
  };
}

export function gainXP(amount) {
  const oldXp = state.analytics.xp || 0;
  state.analytics.xp = oldXp + amount;
  showToast(`+${amount} XP Gained`, "info", 2000);
  saveAnalytics(true);
  if (window.updateHeaderProfile) {
    window.updateHeaderProfile();
  }
}

export function getSavedSessionStorageKey() {
  const uid = (typeof state !== "undefined" && state && state.user) ? state.user.uid : "guest";
  return `ccna_saved_session_${uid}`;
}

export function clearSavedSessionStorage() {
  try { sessionStorage.removeItem("ccna_session"); } catch (e) {}
  try { localStorage.removeItem(getSavedSessionStorageKey()); } catch (e) {}
}

export function normalizeRestoredSession(saved) {
  if (!saved || typeof saved !== "object") return null;
  const currentUid = state.user ? state.user.uid : "guest";
  if (saved.bankVersion !== BANK_VERSION || (saved.uid && saved.uid !== currentUid)) {
    return null;
  }
  if (saved.submitted || !Array.isArray(saved.questions) || saved.questions.length === 0) {
    return null;
  }
  if (saved.answers && !Array.isArray(saved.answers)) {
    const arr = new Array(saved.questions.length).fill(null);
    Object.keys(saved.answers).forEach((key) => {
      const idx = Number(key);
      if (!isNaN(idx) && idx >= 0 && idx < arr.length) {
        arr[idx] = saved.answers[key];
      }
    });
    saved.answers = arr;
  } else if (!Array.isArray(saved.answers)) {
    saved.answers = new Array(saved.questions.length).fill(null);
  }
  saved.idx = Math.max(0, Math.min(saved.questions.length - 1, Number(saved.idx) || 0));
  saved.flagged = saved.flagged && typeof saved.flagged === "object" ? saved.flagged : {};
  saved.revealed = saved.revealed && typeof saved.revealed === "object" ? saved.revealed : {};
  saved.feedback = saved.feedback && typeof saved.feedback === "object" ? saved.feedback : {};
  saved.statsApplied = saved.statsApplied && typeof saved.statsApplied === "object" ? saved.statsApplied : {};
  saved.timerPaused = Boolean(saved.timerPaused);
  if (!saved.totalDurationSec) {
    saved.totalDurationSec = (Number(saved.minutes) || Math.ceil((Number(saved.timeLeft) || 60) / 60)) * 60;
  }
  if (saved.timerPaused) {
    saved.timeLeft = Math.max(1, Number(saved.timeLeft) || saved.totalDurationSec);
    saved.deadlineAt = Date.now() + saved.timeLeft * 1000;
  } else if (typeof saved.deadlineAt === "number" && saved.deadlineAt > 0) {
    saved.timeLeft = Math.max(0, Math.round((saved.deadlineAt - Date.now()) / 1000));
  } else {
    saved.timeLeft = Math.max(0, Number(saved.timeLeft) || saved.totalDurationSec);
    saved.deadlineAt = Date.now() + saved.timeLeft * 1000;
  }
  return saved;
}

export function getSavedUnfinishedSession() {
  if (state.session && !state.session.submitted) {
    return state.session;
  }
  for (const raw of [
    (() => { try { return sessionStorage.getItem("ccna_session"); } catch { return null; } })(),
    (() => { try { return localStorage.getItem(getSavedSessionStorageKey()); } catch { return null; } })()
  ]) {
    if (!raw) continue;
    try {
      const normalized = normalizeRestoredSession(JSON.parse(raw));
      if (normalized) return normalized;
    } catch {}
  }
  return null;
}

export function persistSession() {
  if (!state || !state.session || state.session.submitted) {
    clearSavedSessionStorage();
    return;
  }
  try {
    const copy = { ...state.session, bankVersion: BANK_VERSION, uid: state.user ? state.user.uid : "guest" };
    delete copy.timer;
    const serialized = JSON.stringify(copy);
    try {
      sessionStorage.setItem("ccna_session", serialized);
    } catch (e) {}
    try {
      localStorage.setItem(getSavedSessionStorageKey(), serialized);
    } catch (e) {
      // Fallback: keep lightweight copy without duplicating if quota exceeded
    }
  } catch (e) {
    console.error("Session persistence failed:", e);
  }
}

export const state = {
  seed: Math.floor(Math.random() * 1000000) + 1,
  bank: [],
  analytics: createDefaultAnalytics(),
  session: null,
  subnet: {
    mode: "Easy",
    q: null,
    score: 0,
    attempts: 0,
    streak: 0,
    timerVal: 30,
    timerRef: null,
    leaderboard: (() => {
      try {
        return JSON.parse(localStorage.getItem("ccna_subnet_leaderboard")) || [];
      } catch {
        return [];
      }
    })()
  },
  lab: { currentLabId: 1, mode: "step", completedSteps: {}, userCommands: [], currentPrompt: "Switch(config)#" },
  subscription: {
    plan: "lifetime",
    status: "active",
    current_period_end: null,
    activated_at: null,
    loaded: true
  },
  muted: localStorage.getItem("ccna_muted") === "true",
  highContrast: localStorage.getItem("ccna_high_contrast") === "true",
  simBugsFixed: {}
};

// Bind state to window so other non-module scripts/older references can access it if needed
window.state = state;
