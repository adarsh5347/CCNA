import { saveUserProgress } from "./firebase.js";

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

export function createDefaultAnalytics() {
  return {
    attempts: [],
    domain: {},
    topic: {},
    totalQ: 0,
    correct: 0,
    totalTime: 0,
    studyMin: 0,
    xp: 0,
    streak: 0,
    labsCompleted: 0,
    subnetMaxStreak: 0,
    ach: {},
    simPathsRun: { ospf: false, roas: false },
    missedIds: [],
    watchedVideos: []
  };
}

export function validateAnalyticsSchema(data) {
  if (!data || typeof data !== 'object') return false;
  const requiredNums = ['totalQ', 'correct', 'xp', 'studyMin', 'totalTime', 'labsCompleted', 'subnetMaxStreak', 'streak'];
  for (const key of requiredNums) {
    if (typeof data[key] !== 'number' || isNaN(data[key])) return false;
  }
  if (!data.simPathsRun || typeof data.simPathsRun !== 'object') return false;
  if (!Array.isArray(data.missedIds)) return false;
  if (!data.ach || typeof data.ach !== 'object') return false;
  if (!data.domain || typeof data.domain !== 'object') return false;
  if (!data.topic || typeof data.topic !== 'object') return false;
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
    return { ...base, ...JSON.parse(raw) };
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
        .then(() => {
          if (!quiet) showToast("Telemetry synced to Cloud", "ok");
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
  const lvl = Math.floor((xp || 0) / 100) + 1;
  const level = Math.min(5, lvl);
  const labels = {
    1: "Cable Puller",
    2: "Jr. Network Administrator",
    3: "Network Security Associate",
    4: "Senior Infrastructure Engineer",
    5: "Lead Network Architect"
  };
  return {
    level,
    label: labels[level] || "Lead Network Architect",
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
  user: null,
  muted: localStorage.getItem("ccna_muted") === "true",
  highContrast: localStorage.getItem("ccna_high_contrast") === "true",
  simBugsFixed: {}
};

// Bind state to window so other non-module scripts/older references can access it if needed
window.state = state;
