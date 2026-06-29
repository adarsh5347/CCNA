import { blueprint, generateBank } from "./data.js";
import { loginWithGoogle, logout, onAuthChange, saveUserProgress, loadUserProgress, mergeProgress } from "./firebase.js";
import { labs } from "./labs.js";
import { bugsData, cliOutputs } from "./cli.js";

let authResolve;
const authReady = new Promise((resolve) => {
  authResolve = resolve;
});

function safeSetStorage(storage, key, value) {
  try {
    storage.setItem(key, value);
  } catch (e) {
    console.error("Storage Quota Exceeded or Storage Error:", e);
    showToast("Storage limit reached. Some progress may not be saved locally.", "warn");
  }
}

/* ─── Toast Notification System ─────────────────────────── */
function showToast(message, type = "info", duration = 3500) {
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

function dismissToast(toast) {
  if (toast.classList.contains("dismissing")) return;
  toast.classList.add("dismissing");
  toast.addEventListener("animationend", () => toast.remove(), { once: true });
}

const STORE = "ccna_full_site_v1";

const state = {
  seed: Math.floor(Math.random() * 1000000) + 1,
  bank: [],
  analytics: {
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
    missedIds: []
  },
  session: null,
  subnet: { mode: "Easy", q: null, score: 0, attempts: 0, streak: 0, timerVal: 30, timerRef: null, leaderboard: (() => { try { return JSON.parse(localStorage.getItem("subnet_leaderboard")) || []; } catch { return []; } })() },
  lab: { currentLabId: 1, mode: "step", completedSteps: {}, userCommands: [], currentPrompt: "Switch(config)#" },
  user: null,
  muted: localStorage.getItem("ccna_muted") === "true",
  highContrast: localStorage.getItem("ccna_high_contrast") === "true",
  simBugsFixed: {}
};

function safeHTML(str) {
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

function rand() {
  return Math.random();
}

function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}

function shuffle(arr) {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

function loadAnalytics() {
  const base = {
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
    simPathsRun: { ospf: false, roas: false }
  };
  try {
    const key = (typeof state !== 'undefined' && state && state.user) ? `${STORE}_${state.user.uid}` : STORE;
    const raw = localStorage.getItem(key);
    if (!raw) return base;
    return { ...base, ...JSON.parse(raw) };
  } catch {
    return base;
  }
}

function validateAnalyticsSchema(data) {
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
  return true;
}

function saveAnalytics(quiet = false) {
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

function persistSession() {
  if (!state.session) {
    sessionStorage.removeItem("ccna_session");
    return;
  }
  const copy = { ...state.session };
  delete copy.timer;
  safeSetStorage(sessionStorage, "ccna_session", JSON.stringify(copy));
}

function restoreSession() {
  const raw = sessionStorage.getItem("ccna_session");
  if (!raw) return false;
  try {
    const saved = JSON.parse(raw);
    if (saved && !saved.submitted) {
      state.session = saved;
      const timer = byId("timer");
      if (timer) {
        timer.classList.remove("hidden", "warn", "danger");
        timer.textContent = toMMSS(state.session.timeLeft);
      }
      state.session.timer = setInterval(() => {
        state.session.timeLeft = Math.max(0, state.session.timeLeft - 1);
        const tEl = byId("timer");
        if (tEl) {
          tEl.textContent = toMMSS(state.session.timeLeft);
          tEl.classList.toggle("warn", state.session.timeLeft <= 600 && state.session.timeLeft > 180);
          tEl.classList.toggle("danger", state.session.timeLeft <= 180);
        }
        persistSession();
        if (state.session.timeLeft <= 0) submitSession(true);
      }, 1000);
      
      setPage("engine");
      byId("reviewArea").classList.add("hidden");
      byId("resultArea").classList.add("hidden");
      byId("questionArea").classList.remove("hidden");
      const examFooter = byId("examFooter") || document.querySelector(".exam-footer");
      if (examFooter) examFooter.style.display = "flex";
      renderNavigator();
      renderQuestion();
      return true;
    }
  } catch (e) {
    console.error("Failed to restore session:", e);
  }
  return false;
}

function byId(id) {
  return document.getElementById(id);
}

function setPage(page, push = true) {
  if (push) {
    history.pushState({ page }, "", "?page=" + page);
  }
  // Clear active subnetting challenge timer unconditionally
  if (state.subnet) {
    clearInterval(state.subnet.timerRef);
    state.subnet.timerRef = null;
  }

  // Clear active study/exam session if navigating away from engine page
  if (page !== "engine" && state.session && !state.session.submitted) {
    if (!confirm("You have an active quiz session. Are you sure you want to leave? Your progress will be lost.")) return;
    if (state.session.timer) clearInterval(state.session.timer);
    const headerTimerEl = byId("headerTimer");
    if (headerTimerEl) headerTimerEl.classList.add("hidden");
    state.session = null;
    persistSession();
  }

  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  byId(page).classList.add("active");

  // Update nav buttons active highlight
  document.querySelectorAll("[data-page]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });

  if (page === "analytics") renderAnalytics();
  if (page === "subnet") ensureSubnetQuestion(true);
  window.scrollTo(0, 0);
}

function navSetup() {
  document.querySelectorAll("[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => setPage(btn.dataset.page));
  });
}

function readinessScore() {
  const a = state.analytics;
  if (!a || !a.totalQ) return 0;
  const acc = (a.correct / a.totalQ) * 100;
  const avgSec = a.totalTime / a.totalQ;
  const speed = Math.max(0, Math.min(100, 100 - ((avgSec - 45) * 0.9)));
  const baseScore = acc * 0.75 + speed * 0.25;

  const solvedCount = a.totalQ || 0;
  const quizzesCompleted = a.attempts ? a.attempts.length : 0;
  const qFactor = Math.min(1, solvedCount / 150);
  const quizFactor = Math.min(1, quizzesCompleted / 5);
  const volumeMultiplier = 0.5 * qFactor + 0.5 * quizFactor;

  return Math.round(baseScore * volumeMultiplier);
}

function passProbability() {
  const a = state.analytics;
  if (!a || !a.totalQ) return 0;
  return Math.max(5, Math.min(98, Math.round(readinessScore() * 0.92 + 5)));
}

function readinessLabel(score) {
  const a = state.analytics;
  if (!a || !a.totalQ) return "Not Started";
  if (score < 50) return "Beginner";
  if (score < 70) return "Intermediate";
  if (score < 85) return "Exam Ready";
  return "Likely Pass";
}

function getLevelInfo(xp) {
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

function gainXP(amount) {
  const oldXp = state.analytics.xp || 0;
  const oldInfo = getLevelInfo(oldXp);

  state.analytics.xp = oldXp + amount;
  showToast(`+${amount} XP Gained`, "info", 2000);
  saveAnalytics(true);
  updateHeaderProfile();
  renderAchievements();

  const newInfo = getLevelInfo(state.analytics.xp);
  if (newInfo.level > oldInfo.level) {
    triggerLevelUpModal(newInfo.level, newInfo.label);
  }
}

function triggerLevelUpModal(level, label) {
  const overlay = document.createElement("div");
  overlay.id = "levelUpOverlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(2, 4, 10, 0.95);
    z-index: 10000;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(15px);
    transition: all 0.5s ease;
    opacity: 0;
  `;
  
  overlay.innerHTML = `
    <div class="level-up-card" style="
      background: linear-gradient(135deg, rgba(6, 9, 19, 0.9), rgba(13, 25, 43, 0.9));
      border: 2px solid #00f2fe;
      box-shadow: 0 0 50px rgba(0, 242, 254, 0.4), inset 0 0 20px rgba(0, 242, 254, 0.2);
      border-radius: 24px;
      padding: 40px 60px;
      text-align: center;
      position: relative;
      overflow: hidden;
      transform: scale(0.7);
      transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      max-width: 480px;
      width: 90%;
    ">
      <div style="
        position: absolute;
        top: -100px;
        left: -100px;
        width: 300px;
        height: 300px;
        background: radial-gradient(circle, rgba(0,242,254,0.15) 0%, transparent 70%);
        pointer-events: none;
      "></div>
      
      <div class="level-badge" style="
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: rgba(6,9,19,0.9);
        border: 4px solid #ff5e3a;
        box-shadow: 0 0 30px rgba(255, 94, 58, 0.4);
        margin: 0 auto 20px auto;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        position: relative;
        animation: pulseLevel 2s infinite ease-in-out;
      ">
        <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #ff9233; letter-spacing: 1.5px;">Level</span>
        <span style="font-family: 'Bebas Neue', sans-serif; font-size: 52px; line-height: 1; color: #fff; text-shadow: 0 0 10px rgba(255,94,58,0.5);">${level}</span>
      </div>
      
      <h2 style="
        font-family: 'Bebas Neue', sans-serif;
        font-size: 44px;
        letter-spacing: 2px;
        background: linear-gradient(to right, #00f2fe, #10b981);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin: 0 0 8px 0;
        text-transform: uppercase;
      ">Promoted!</h2>
      
      <p style="
        font-size: 18px;
        font-weight: 600;
        color: #fff;
        margin: 0 0 4px 0;
      ">${label}</p>
      
      <p style="
        color: var(--text-muted);
        font-size: 13px;
        line-height: 1.4;
        margin: 0 0 24px 0;
      ">Your network command privileges have been elevated. Keep solving questions and configuring switches to reach the top!</p>
      
      <button id="levelUpCloseBtn" class="primary" style="
        padding: 12px 36px;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 1px;
        border-radius: 10px;
      ">Acknowledge</button>
    </div>
  `;
  
  document.body.appendChild(overlay);
  playNetSound("success");
  
  if (window.triggerSuccessExplosion) {
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        const x = window.innerWidth * (0.2 + Math.random() * 0.6);
        const y = window.innerHeight * (0.3 + Math.random() * 0.4);
        window.triggerSuccessExplosion(x, y, i % 2 === 0 ? "#00f2fe" : "#ff5e3a");
      }, i * 300);
    }
  }
  
  setTimeout(() => {
    overlay.style.opacity = "1";
    overlay.querySelector(".level-up-card").style.transform = "scale(1)";
  }, 50);
  
  const closeBtn = overlay.querySelector("#levelUpCloseBtn");
  const close = () => {
    playNetSound("click");
    overlay.style.opacity = "0";
    overlay.querySelector(".level-up-card").style.transform = "scale(0.8)";
    setTimeout(() => {
      overlay.remove();
    }, 500);
  };
  
  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
}

function updateHeaderProfile() {
  const xp = state.analytics.xp || 0;
  const info = getLevelInfo(xp);
  const badge = byId("headerXPBadge");
  if (badge) {
    badge.textContent = `Lvl ${info.level} (${info.label}) - ${xp} XP`;
  }
}

function calcDomainAccuracy() {
  const out = {};
  blueprint.forEach((d) => {
    const s = state.analytics.domain[d.name] || { total: 0, correct: 0 };
    out[d.name] = s.total ? Math.round((s.correct / s.total) * 100) : 0;
  });
  return out;
}

function renderStatsCards(targetId, cards) {
  const el = byId(targetId);
  if (el) {
    el.innerHTML = cards.map((c) => `<div class="stat"><div class="k">${c.k}</div><div class="v">${c.v}</div></div>`).join("");
  }
}

function renderHome() {
  const rs = readinessScore();
  const pp = passProbability();
  
  // Remove skeleton loader animations when real telemetry data is hydrated
  document.querySelectorAll(".stat.skeleton").forEach((el) => {
    el.classList.remove("skeleton");
  });
  
  const heroReadiness = byId("heroReadiness");
  const heroReadinessBar = byId("heroReadinessBar");
  const heroQuestions = byId("heroQuestions");
  const heroQuizzes = byId("heroQuizzes");
  const heroStreak = byId("heroStreak");
  const heroLabs = byId("heroLabs");
  
  if (heroReadiness) heroReadiness.textContent = `${rs}%`;
  if (heroReadinessBar) heroReadinessBar.style.width = `${rs}%`;
  if (heroQuestions) heroQuestions.textContent = state.analytics.totalQ || 0;
  if (heroQuizzes) heroQuizzes.textContent = state.analytics.attempts ? state.analytics.attempts.length : 0;
  if (heroStreak) heroStreak.textContent = `${state.analytics.streak || 0} Days`;
  if (heroLabs) heroLabs.textContent = `${state.analytics.labsCompleted || 0} / 10`;
  
  updateHeaderProfile();

  const easy = Math.round(state.bank.length * 0.4);
  const medium = Math.round(state.bank.length * 0.4);
  const hard = state.bank.length - easy - medium;
  renderStatsCards("bankStats", [
    { k: "Total Questions", v: state.bank.length },
    { k: "Distribution", v: "Blueprint Matched" },
    { k: "Easy", v: easy },
    { k: "Medium", v: medium },
    { k: "Hard", v: hard },
    { k: "Question Types", v: "Single/Multi/Matching/Drag/Scenario" }
  ]);

  // Identify two weakest domains for Smart Adaptive Quiz
  const domainAccuracies = blueprint.map((d) => {
    const s = state.analytics.domain[d.name] || { total: 0, correct: 0 };
    const acc = s.total ? Math.round((s.correct / s.total) * 100) : 0;
    return { name: d.name, acc, total: s.total };
  });

  // Filter out any domain where attempted < 5
  const qualifying = domainAccuracies.filter(item => item.total >= 5);

  if (qualifying.length < 2) {
    state.weakDomains = [];
    state.useSmartFallback = true;
    const smartQuizInfo = byId("smartQuizInfo");
    if (smartQuizInfo) {
      smartQuizInfo.innerHTML = `<strong>Current Focus Areas:</strong><br />
        Cross-domain random fallback (fewer than 2 domains with &ge; 5 attempts)`;
    }
  } else {
    state.useSmartFallback = false;
    qualifying.sort((a, b) => {
      if (a.acc !== b.acc) return a.acc - b.acc;
      return a.total - b.total; // Prefer fewer attempts for discovery
    });
    const weakest = qualifying.slice(0, 2);
    state.weakDomains = weakest.map((w) => w.name);

    const smartQuizInfo = byId("smartQuizInfo");
    if (smartQuizInfo) {
      smartQuizInfo.innerHTML = `<strong>Current Focus Areas:</strong><br />
        1. ${weakest[0].name} (${weakest[0].acc}%)<br />
        2. ${weakest[1].name} (${weakest[1].acc}%)`;
    }
  }

  // Render Spaced Repetition information
  const missedCount = (state.analytics.missedIds || []).length;
  const missedQuizInfo = byId("missedQuizInfo");
  if (missedQuizInfo) {
    if (missedCount === 0) {
      missedQuizInfo.innerHTML = `<strong>Status:</strong> Clear!<br />You have 0 incorrect questions to review. Great job!`;
      const btn = byId("startMissedQuiz");
      if (btn) {
        btn.disabled = true;
        btn.style.opacity = 0.5;
        btn.style.pointerEvents = "none";
      }
    } else {
      missedQuizInfo.innerHTML = `<strong>Status:</strong> Needs review.<br />You have ${missedCount} incorrect question${missedCount > 1 ? 's' : ''} pending.`;
      const btn = byId("startMissedQuiz");
      if (btn) {
        btn.disabled = false;
        btn.style.opacity = 1;
        btn.style.pointerEvents = "auto";
      }
    }
  }
}

function renderDomainChecks() {
  const wrap = byId("domainChecks");
  if (wrap) {
    wrap.innerHTML = blueprint.map((d, i) => `<label><input class="qdomain" type="checkbox" value="${d.name}" ${i === 0 ? "checked" : ""} /> ${d.name} (${d.weight}%)</label>`).join("<br />");
  }
}

function weakTopicBoost(q) {
  const t = state.analytics.topic[q.topic] || { total: 0, correct: 0 };
  const acc = t.total ? t.correct / t.total : 0.55;
  return Math.max(0.2, 1.3 - acc);
}

function weightedSelection(count, domains) {
  const set = domains && domains.length ? new Set(domains) : null;
  const pool = state.bank.filter((q) => !set || set.has(q.domain));
  const scored = pool.map((q) => ({ q, w: weakTopicBoost(q) * (q.difficulty === "Hard" ? 0.9 : 1) }));
  const out = [];
  const used = new Set();

  let total = scored.reduce((s, x) => s + x.w, 0);

  while (out.length < count && used.size < scored.length) {
    let r = rand() * total;
    for (const item of scored) {
      if (used.has(item.q.id)) continue;
      r -= item.w;
      if (r <= 0) {
        used.add(item.q.id);
        out.push(item.q);
        total -= item.w;
        break;
      }
    }
  }
  return out;
}

function examSelection() {
  const list = [];
  blueprint.forEach((d) => {
    const n = Math.round((d.weight / 100) * 120);
    list.push(...shuffle(state.bank.filter((q) => q.domain === d.name)).slice(0, Math.max(1, n)));
  });
  return shuffle(list).slice(0, 120);
}

function toMMSS(sec) {
  const m = Math.floor(Math.max(0, sec) / 60).toString().padStart(2, "0");
  const s = Math.floor(Math.max(0, sec) % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function startSession(mode) {
  state.bank = shuffle(state.bank);
  // Validate that session will have questions
  let conf;
  if (mode === "study") {
    conf = {
      title: "Study Mode",
      desc: "Instant feedback with explanations and Cisco exam coaching.",
      showFeedback: true,
      hideScoreUntilEnd: false,
      minutes: 45,
      questions: weightedSelection(40, [])
    };
  } else if (mode === "quiz") {
    let minutes = Number(byId("quizDuration").value);
    let count = Number(byId("quizCount").value);
    if (isNaN(minutes) || minutes <= 0 || minutes > 300) {
      minutes = 30;
      if (byId("quizDuration")) byId("quizDuration").value = 30;
    }
    if (isNaN(count) || count <= 0 || count > 100) {
      count = 20;
      if (byId("quizCount")) byId("quizCount").value = 20;
    }
    const domains = [...document.querySelectorAll(".qdomain:checked")].map((x) => x.value);
    conf = {
      title: "Section Quiz Mode",
      desc: "Timed domain-focused quiz.",
      showFeedback: false,
      hideScoreUntilEnd: false,
      minutes,
      questions: weightedSelection(count, domains)
    };
  } else if (mode === "smart") {
    const weakDomains = state.weakDomains || [];
    const isFallback = state.useSmartFallback || weakDomains.length < 2;
    let count = 15;
    if (!isFallback) {
      count = Number(byId("smartQuizCount").value);
      if (isNaN(count) || count <= 0 || count > 100) {
        count = 15;
      }
    }
    conf = {
      title: isFallback ? "Smart Adaptive Quiz (Fallback)" : "Smart Adaptive Quiz",
      desc: isFallback 
        ? "Random cross-domain 15-question set (need at least 5 attempts on 2+ domains to personalize)." 
        : `Focused study on your weakest areas: ${weakDomains.join(" & ")}.`,
      showFeedback: true,
      hideScoreUntilEnd: false,
      minutes: count * 2,
      questions: weightedSelection(count, isFallback ? [] : weakDomains)
    };
  } else if (mode === "missed") {
    let count = Number(byId("missedQuizCount").value);
    if (isNaN(count) || count <= 0 || count > 100) {
      count = 10;
      if (byId("missedQuizCount")) byId("missedQuizCount").value = 10;
    }
    const missedList = state.bank.filter((q) => (state.analytics.missedIds || []).includes(q.id));
    conf = {
      title: "Spaced Repetition Quiz",
      desc: "Reviewing questions you previously answered incorrectly.",
      showFeedback: true,
      hideScoreUntilEnd: false,
      minutes: count * 2,
      questions: shuffle(missedList).slice(0, count)
    };
  } else {
    conf = {
      title: "Real Exam Mode",
      desc: "Pearson VUE behavior: no feedback and score at end only.",
      showFeedback: false,
      hideScoreUntilEnd: true,
      minutes: 120,
      questions: examSelection()
    };
  }

  if (!conf.questions || conf.questions.length === 0) {
    showToast("No questions available for the selected filters. Please select at least one domain.", "warn", 4000);
    return;
  }

  showToast(`${conf.title} initiated. Practice engine active.`, "info", 3000);

  if (state.session && state.session.timer) clearInterval(state.session.timer);

  state.session = {
    mode,
    ...conf,
    idx: 0,
    answers: {},
    flagged: {},
    feedback: {},
    statsApplied: {},
    startedAt: Date.now(),
    qStartAt: Date.now(),
    timeLeft: conf.minutes * 60,
    timer: null,
    submitted: false
  };
  persistSession();

  const modeTitleEl = byId("modeTitle");
  if (modeTitleEl) modeTitleEl.textContent = conf.title;
  const modeDescEl = byId("modeDesc");
  if (modeDescEl) modeDescEl.textContent = conf.desc;

  const timer = byId("timer");
  timer.classList.remove("hidden", "warn", "danger");
  timer.textContent = toMMSS(state.session.timeLeft);

  state.session.timer = setInterval(() => {
    state.session.timeLeft = Math.max(0, state.session.timeLeft - 1);
    timer.textContent = toMMSS(state.session.timeLeft);
    timer.classList.toggle("warn", state.session.timeLeft <= 600 && state.session.timeLeft > 180);
    timer.classList.toggle("danger", state.session.timeLeft <= 180);
    if (state.session.timeLeft <= 0) submitSession(true);
  }, 1000);

  setPage("engine");
  byId("reviewArea").classList.add("hidden");
  byId("resultArea").classList.add("hidden");
  byId("questionArea").classList.remove("hidden");
  const examFooter = byId("examFooter") || document.querySelector(".exam-footer");
  if (examFooter) examFooter.style.display = "flex";
  renderNavigator();
  renderQuestion();
}

function navToQuestion(i) {
  state.session.idx = Math.max(0, Math.min(state.session.questions.length - 1, i));
  state.session.qStartAt = Date.now();
  persistSession();
  renderNavigator();
  renderQuestion();

  // Scroll question area and window to top
  const qa = byId("questionArea");
  if (qa) qa.scrollTop = 0;
  window.scrollTo(0, 0);

  // Close mobile drawer if it's active
  const sidebar = document.querySelector(".left");
  const backdrop = byId("sidebarBackdrop");
  if (sidebar && sidebar.classList.contains("active")) {
    sidebar.classList.remove("active");
  }
  if (backdrop && backdrop.classList.contains("active")) {
    backdrop.classList.remove("active");
  }
}

function renderNavigator() {
  const s = state.session;
  byId("qNav").innerHTML = s.questions.map((_, i) => {
    let cls = "qbtn";
    if (i === s.idx) cls += " current";
    if (s.answers[i] != null) cls += " answered";
    if (s.flagged[i]) cls += " flagged";
    return `<button class="${cls}" data-qnav="${i}">${i + 1}</button>`;
  }).join("");

  const qCounterEl = byId("qCounter");
  if (qCounterEl) qCounterEl.textContent = `Q ${s.idx + 1} / ${s.questions.length}`;
  const answeredCount = Object.keys(s.answers).length;
  const pct = Math.round((answeredCount / s.questions.length) * 100);
  const fillEl = byId("progressFill");
  if (fillEl) fillEl.style.width = `${pct}%`;
  const pctEl = byId("progressPct");
  if (pctEl) pctEl.textContent = `${pct}%`;
  const navMetaEl = byId("navMeta");
  if (navMetaEl) navMetaEl.textContent = `Answered: ${answeredCount} | Flagged: ${Object.values(s.flagged).filter(Boolean).length}`;

  byId("qNav").querySelectorAll("[data-qnav]").forEach((b) => {
    b.addEventListener("click", () => navToQuestion(Number(b.dataset.qnav)));
  });
}

function markCurrent() {
  const s = state.session;
  s.flagged[s.idx] = !s.flagged[s.idx];
  persistSession();
  renderNavigator();
}

function answerEquals(q, ans) {
  if (ans == null) return false;
  if (q.type === "single" || q.type === "scenario") return ans === q.correct[0];
  if (q.type === "multi") {
    if (!Array.isArray(ans)) return false;
    return [...ans].sort((a, b) => a - b).join(",") === [...q.correct].sort((a, b) => a - b).join(",");
  }
  if (q.type === "matching") {
    if (!ans) return false;
    return q.pairs.every((p, i) => ans[i] === p[1]);
  }
  if (q.type === "dragdrop") {
    if (!Array.isArray(ans)) return false;
    return ans.join("||") === q.order.join("||");
  }
  return false;
}

// xpGain removed

function applyStats(q, ok, sec) {
  const a = state.analytics;
  a.totalQ += 1;
  if (ok) a.correct += 1;
  a.totalTime += sec;

  if (!a.domain[q.domain]) a.domain[q.domain] = { total: 0, correct: 0 };
  a.domain[q.domain].total += 1;
  if (ok) a.domain[q.domain].correct += 1;

  if (!a.topic[q.topic]) a.topic[q.topic] = { total: 0, correct: 0 };
  a.topic[q.topic].total += 1;
  if (ok) a.topic[q.topic].correct += 1;
}

// refreshAchievements removed

function explanationBlock(q, ok) {
  if (!state.session.showFeedback) return "";
  const e = q.expl;
  return `
    <section class="block ${ok ? "correct" : "wrong"}">
      <h4>Detailed Explanation</h4>
      <p><strong>Correct answer:</strong> ${safeHTML(e.correct)}</p>
      <p><strong>Why correct:</strong> ${safeHTML(e.why)}</p>
      <p><strong>Why others are wrong:</strong></p>
      <ul>
        ${e.wrong.map(w => `<li>${safeHTML(w)}</li>`).join("")}
      </ul>
      <p><strong>Cisco exam tip:</strong> ${safeHTML(e.tip)}</p>
      <p><strong>Memory trick:</strong> ${safeHTML(e.memory)}</p>
      <p><strong>Real world example:</strong> ${safeHTML(e.real)}</p>
      <p><strong>Related commands:</strong> ${e.commands.map(x => safeHTML(x)).join(" | ")}</p>
    </section>
  `;
}

function renderQuestion() {
  const s = state.session;
  const q = s.questions[s.idx];
  if (!q) return;

  let html = `
    <span class="badge">${safeHTML(q.domain)}</span><span class="badge">${safeHTML(q.topic)}</span>
    ${q.scenario ? `<div class="block"><strong>Scenario:</strong> ${safeHTML(q.scenario)}</div>` : ""}
    <h3>${safeHTML(q.text)}</h3>
    <div class="meta">
      <div><strong>Difficulty</strong><br />${safeHTML(q.difficulty)}</div>
      <div><strong>Exam Weight</strong><br />${safeHTML(q.examWeight)}</div>
      <div><strong>Topic Domain</strong><br />${safeHTML(q.domain)}</div>
      <div><strong>Expected Frequency</strong><br />${safeHTML(q.frequency)}</div>
    </div>
    ${q.topology ? `<div class="block">${safeHTML(q.topology).replace(/\n/g, "<br />")}</div>` : ""}
    ${q.cli ? `<div class="block cli">${safeHTML(q.cli).replace(/\n/g, "<br />")}</div>` : ""}
    ${q.packet ? `<div class="block packet">Packet: ${safeHTML(q.packet)}</div>` : ""}
  `;

  if (q.type === "single" || q.type === "scenario") {
    const v = s.answers[s.idx];
    html += q.options.map((o, i) => {
      const letter = String.fromCharCode(65 + i);
      const isSelected = v === i;
      return `<label class="opt${isSelected ? ' selected' : ''}" data-idx="${i}">
        <input type="radio" name="single" value="${i}" ${isSelected ? "checked" : ""}/ aria-label="Option ${letter}">
        <span class="opt-key" aria-hidden="true">${letter}</span>
        <span>${safeHTML(o)}</span>
      </label>`;
    }).join("");
  } else if (q.type === "multi") {
    const selected = Array.isArray(s.answers[s.idx]) ? s.answers[s.idx] : [];
    html += q.options.map((o, i) => {
      const letter = String.fromCharCode(65 + i);
      const isSelected = selected.includes(i);
      return `<label class="opt${isSelected ? ' selected' : ''}" data-idx="${i}">
        <input type="checkbox" value="${i}" ${isSelected ? "checked" : ""} aria-label="Option ${letter}">
        <span class="opt-key" aria-hidden="true">${letter}</span>
        <span>${safeHTML(o)}</span>
      </label>`;
    }).join("");
  } else if (q.type === "matching") {
    const cur = s.answers[s.idx] || {};
    q.pairs.forEach((pair, i) => {
      if (!s._matchOpts) s._matchOpts = {};
      if (!s._matchOpts[s.idx]) s._matchOpts[s.idx] = shuffle(q.pairs.map((x) => x[1]));
      const opts = s._matchOpts[s.idx];
      html += `<div class="opt"><strong>${safeHTML(pair[0])}</strong><br /><select data-match="${i}"><option value="">Select</option>${opts.map((x) => `<option ${cur[i] === x ? "selected" : ""} value="${x}">${safeHTML(x)}</option>`).join("")}</select></div>`;
    });
  } else {
    const order = s.answers[s.idx] || [...q.order];
    order.forEach((step, i) => {
      html += `<div class="opt"><strong>${i + 1}.</strong> ${safeHTML(step)}<div class="inline"><button class="ghost" data-up="${i}">Up</button><button class="ghost" data-down="${i}">Down</button></div></div>`;
    });
  }

  const ok = s.feedback[s.idx];
  if (ok != null) html += explanationBlock(q, ok);

  byId("questionArea").innerHTML = html;
  
  // Toggle footer navigation buttons based on current question index
  const prevBtn = byId("prevQ");
  const markBtn = byId("toggleMark");
  const openReviewBtn = byId("openReview");
  const saveNextBtn = byId("saveNext");
  const submitSessionBtn = byId("submitSession");

  if (prevBtn) {
    prevBtn.style.display = "";
    prevBtn.disabled = (s.idx === 0);
  }
  if (markBtn) markBtn.style.display = "";
  if (openReviewBtn) openReviewBtn.style.display = "";

  if (s.idx === s.questions.length - 1) {
    if (saveNextBtn) saveNextBtn.style.display = "none";
    if (submitSessionBtn) {
      submitSessionBtn.style.display = "";
      submitSessionBtn.textContent = s.mode === "exam" ? "Submit Exam" : "Submit Quiz";
    }
  } else {
    if (saveNextBtn) saveNextBtn.style.display = "";
    if (submitSessionBtn) submitSessionBtn.style.display = "none";
  }

  wireQuestionInputs();
}

function wireQuestionInputs() {
  const s = state.session;
  const q = s.questions[s.idx];

  byId("questionArea").querySelectorAll("input[type='radio'][name='single']").forEach((el) => {
    el.addEventListener("change", (e) => {
      s.answers[s.idx] = Number(el.value);
      instantStudyFeedback(e);
      persistSession();
      renderNavigator();
    });
  });

  byId("questionArea").querySelectorAll("input[type='checkbox']").forEach((el) => {
    el.addEventListener("change", (e) => {
      s.answers[s.idx] = [...byId("questionArea").querySelectorAll("input[type='checkbox']:checked")].map((x) => Number(x.value));
      instantStudyFeedback(e);
      persistSession();
      renderNavigator();
    });
  });

  byId("questionArea").querySelectorAll("[data-match]").forEach((el) => {
    el.addEventListener("change", (e) => {
      const cur = s.answers[s.idx] || {};
      cur[Number(el.dataset.match)] = el.value;
      s.answers[s.idx] = cur;
      instantStudyFeedback(e);
      persistSession();
      renderNavigator();
    });
  });

  byId("questionArea").querySelectorAll("[data-up]").forEach((el) => {
    el.addEventListener("click", (e) => {
      const i = Number(el.dataset.up);
      const list = s.answers[s.idx] || [...q.order];
      if (i <= 0) return;
      [list[i], list[i - 1]] = [list[i - 1], list[i]];
      s.answers[s.idx] = list;
      instantStudyFeedback(e);
      persistSession();
      renderQuestion();
      renderNavigator();
    });
  });

  byId("questionArea").querySelectorAll("[data-down]").forEach((el) => {
    el.addEventListener("click", (e) => {
      const i = Number(el.dataset.down);
      const list = s.answers[s.idx] || [...q.order];
      if (i >= list.length - 1) return;
      [list[i], list[i + 1]] = [list[i + 1], list[i]];
      s.answers[s.idx] = list;
      instantStudyFeedback(e);
      persistSession();
      renderQuestion();
      renderNavigator();
    });
  });
}

function instantStudyFeedback(e) {
  const s = state.session;
  if (s.mode !== "study") return;
  const q = s.questions[s.idx];
  const ans = s.answers[s.idx];
  const ok = answerEquals(q, ans);
  s.feedback[s.idx] = ok;

  if (!s.statsApplied) s.statsApplied = {};
  if (!s.statsApplied[s.idx]) {
    s.statsApplied[s.idx] = true;
    applyStats(q, ok, 35);
  }

  // Update missedIds list
  if (!state.analytics.missedIds) state.analytics.missedIds = [];
  if (ok) {
    state.analytics.missedIds = state.analytics.missedIds.filter(id => id !== q.id);
    gainXP(10);

    // Trigger success particle explosion
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    if (e && e.clientX && e.clientY) {
      x = e.clientX;
      y = e.clientY;
    } else if (e && e.target) {
      const rect = e.target.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }
    if (window.triggerSuccessExplosion) {
      window.triggerSuccessExplosion(x, y, "#10b981");
    }
  } else {
    if (!state.analytics.missedIds.includes(q.id)) {
      state.analytics.missedIds.push(q.id);
    }
  }

  saveAnalytics();
  renderQuestion();
  renderHome();
}

function nextQuestion() {
  navToQuestion(state.session.idx + 1);
}

function prevQuestion() {
  navToQuestion(state.session.idx - 1);
}

function saveAndNext() {
  applyQuestionTime();
  nextQuestion();
}

function applyQuestionTime() {
  const s = state.session;
  const spent = Math.max(3, Math.floor((Date.now() - s.qStartAt) / 1000));
  state.analytics.totalTime += spent;
  s.qStartAt = Date.now();
}

function openReview() {
  const s = state.session;
  const unanswered = s.questions.filter((_, i) => s.answers[i] == null).length;
  let html = `<h3>Review Screen</h3><p>Unanswered: ${unanswered} | Flagged: ${Object.values(s.flagged).filter(Boolean).length}</p><div class="review-table">`;
  s.questions.forEach((q, i) => {
    html += `<div class="review-row"><div>Q${i + 1}</div><div>${q.domain} - ${q.topic}</div><div>${s.answers[i] != null ? "Answered" : "Pending"}</div><div><button class="ghost" data-jump="${i}">Open</button></div></div>`;
  });
  html += "</div>";
  if (s.mode === "exam") html += `<div class="inline"><button class="primary" id="finalizeFromReview">Finalize Exam</button></div>`;

  byId("reviewArea").innerHTML = html;
  byId("reviewArea").classList.remove("hidden");
  byId("questionArea").classList.add("hidden");
  byId("resultArea").classList.add("hidden");

  const ra = byId("reviewArea");
  if (ra) ra.scrollTop = 0;
  window.scrollTo(0, 0);

  byId("reviewArea").querySelectorAll("[data-jump]").forEach((b) => {
    b.addEventListener("click", () => {
      byId("reviewArea").classList.add("hidden");
      byId("questionArea").classList.remove("hidden");
      navToQuestion(Number(b.dataset.jump));
    });
  });

  const f = byId("finalizeFromReview");
  if (f) f.addEventListener("click", () => submitSession(true));

  // Hide normal navigation buttons and show only Submit Session in footer
  const prevBtn = byId("prevQ");
  const markBtn = byId("toggleMark");
  const openReviewBtn = byId("openReview");
  const saveNextBtn = byId("saveNext");
  const submitSessionBtn = byId("submitSession");

  if (prevBtn) prevBtn.style.display = "none";
  if (markBtn) markBtn.style.display = "none";
  if (openReviewBtn) openReviewBtn.style.display = "none";
  if (saveNextBtn) saveNextBtn.style.display = "none";
  if (submitSessionBtn) {
    submitSessionBtn.style.display = "";
    submitSessionBtn.textContent = s.mode === "exam" ? "Submit Exam" : "Submit Quiz";
  }
}

function submitSession(force) {
  const s = state.session;
  if (!s || s.submitted) return;

  const answeredCount = s.answers.filter((a) => a != null).length;
  if (answeredCount === 0 && !force) {
    if (!confirm("You haven't answered any questions. Are you sure you want to submit?")) {
      return;
    }
  }

  if (s.mode === "exam" && !force) {
    openReview();
    return;
  }

  s.submitted = true;
  clearInterval(s.timer);
  persistSession();
  const timer = byId("timer");
  if (timer) timer.classList.add("hidden");

  let correct = 0;
  const domain = {};
  const wrong = [];

  if (!state.analytics.missedIds) state.analytics.missedIds = [];
  s.questions.forEach((q, i) => {
    const ok = answerEquals(q, s.answers[i]);
    if (ok) {
      correct += 1;
      state.analytics.missedIds = state.analytics.missedIds.filter(id => id !== q.id);
      if (s.mode !== "study") {
        gainXP(10);
      }
    } else {
      if (!state.analytics.missedIds.includes(q.id)) {
        state.analytics.missedIds.push(q.id);
      }
    }
    if (!domain[q.domain]) domain[q.domain] = { total: 0, correct: 0 };
    domain[q.domain].total += 1;
    if (ok) domain[q.domain].correct += 1;
    if (!s.statsApplied) s.statsApplied = {};
    if (!s.statsApplied[i]) {
      s.statsApplied[i] = true;
      applyStats(q, ok, 55);
    }
    if (!ok) wrong.push({ i, q });
  });

  const total = s.questions.length;
  const pct = Math.round((correct / total) * 100);
  
  if (pct >= 80) gainXP(30);
  updateStreakOnAttempt();
  
  state.analytics.studyMin += Math.round((Date.now() - s.startedAt) / 60000);
  state.analytics.attempts.push({
    mode: s.mode,
    total,
    correct,
    score: pct,
    at: new Date().toISOString()
  });
  state.analytics.attempts = state.analytics.attempts.slice(-40);

  saveAnalytics(true);
  showToast(`Session submitted! Score: ${pct}%`, "ok", 4000);
  renderHome();

  const weak = Object.entries(domain).map(([k, v]) => ({ k, p: Math.round((v.correct / v.total) * 100) })).sort((a, b) => a.p - b.p).slice(0, 2);
  const strong = Object.entries(domain).map(([k, v]) => ({ k, p: Math.round((v.correct / v.total) * 100) })).sort((a, b) => b.p - a.p).slice(0, 2);

  let html = `<h2>Session Complete: ${s.title}</h2><div class="grid stats">`;
  html += `<div class="stat"><div class="k">Score</div><div class="v">${pct}%</div></div>`;
  html += `<div class="stat"><div class="k">Correct</div><div class="v">${correct}/${total}</div></div>`;
  html += `<div class="stat"><div class="k">Readiness</div><div class="v">${readinessLabel(readinessScore())}</div></div>`;
  html += `<div class="stat"><div class="k">Pass Probability</div><div class="v">${passProbability()}%</div></div>`;
  html += `</div>`;

  html += `<div class="card"><h3>Domain Performance</h3>${Object.entries(domain).map(([d, v]) => {
    const pct = Math.round((v.correct / v.total) * 100);
    const color = pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ff5e3a";
    return `
      <div class="domain-item">
        <div class="domain-header">
          <strong>${d}</strong>
          <span class="pct">${v.correct}/${v.total} (${pct}%)</span>
        </div>
        <div class="progress"><div style="width:${pct}%; background:${color};"></div></div>
      </div>
    `;
  }).join("")}</div>`;
  html += `<div class="grid stats"><div class="stat"><div class="k">Weak Areas</div><div class="v" style="font-size:16px">${weak.map((x) => `${x.k} (${x.p}%)`).join("<br />")}</div></div><div class="stat"><div class="k">Strong Areas</div><div class="v" style="font-size:16px">${strong.map((x) => `${x.k} (${x.p}%)`).join("<br />")}</div></div><div class="stat"><div class="k">Recommended Next Quiz</div><div class="v" style="font-size:15px">15 questions / 15 mins on ${weak.map((x) => x.k).join(" + ")}</div></div></div>`;

  if (s.mode !== "exam") {
    html += `<div class="card"><h3>Review (first 20 misses)</h3>${wrong.slice(0, 20).map((x) => `<div class="output"><strong>Q${x.i + 1}</strong> ${x.q.topic} | Correct: ${x.q.expl.correct}<br /><span style="display:block; margin-top:6px; color:#a1b2c8"><strong>Explanation:</strong> ${safeHTML(x.q.expl.why)}</span><span style="display:block; margin-top:4px; color:#a1b2c8"><strong>Tip:</strong> ${safeHTML(x.q.expl.tip)}</span></div>`).join("") || "No incorrect answers."}</div>`;
  } else {
    let statusText = "";
    let statusColor = "";
    let readinessDesc = "";
    
    if (pct >= 85) {
      statusText = "CCNA READY (Highly Prepared)";
      statusColor = "#10b981";
      readinessDesc = "Outstanding performance! Your score is above the safety margin for the Cisco 200-301. You demonstrate a solid grasp of core networking protocols, CLI commands, and automation architecture. We recommend scheduling your real exam immediately.";
    } else if (pct >= 75) {
      statusText = "PREPARED WITH MINOR GAPS";
      statusColor = "#f59e0b";
      readinessDesc = "Good attempt! You have a solid foundation but are operating right near the boundary passing score. We recommend targeting your weak domains (specifically reviewing CLI command syntax and subnet boundary calculations) for another 1-2 weeks before booking the official exam.";
    } else {
      statusText = "NOT READY (Major Gaps Found)";
      statusColor = "#ff5e3a";
      readinessDesc = "Study recommended. Your score is below the typical Cisco passing threshold. We suggest systematically reviewing the official Cisco Press certification guides for the highlighted weak domains, building practical lab configurations, and re-attempting practice exams.";
    }

    const weakDomains = Object.entries(domain)
      .map(([k, v]) => ({ name: k, pct: Math.round((v.correct / v.total) * 100) }))
      .filter(d => d.pct < 80)
      .sort((a, b) => a.pct - b.pct);

    let recommendedReadings = "";
    if (weakDomains.length > 0) {
      recommendedReadings = weakDomains.map(d => {
        let refs = "";
        if (d.name === "Network Fundamentals") refs = "Volume 1, Part I & Part IV (Subnetting)";
        else if (d.name === "Network Access") refs = "Volume 1, Part II & Part III (VLANs, STP, EtherChannel)";
        else if (d.name === "IP Connectivity") refs = "Volume 1, Part V (Routing) & Part VI (OSPF)";
        else if (d.name === "IP Services") refs = "Volume 2, Part III (DHCP, NAT, NTP, QoS)";
        else if (d.name === "Security Fundamentals") refs = "Volume 2, Part I & Part II (ACLs, Port Security, Snooping)";
        else if (d.name === "Automation and Programmability") refs = "Volume 2, Part V (APIs, JSON, Ansible/Puppet/Chef)";
        return `<li><strong>${d.name} (${d.pct}%):</strong> Study <u>${refs}</u></li>`;
      }).join("");
    } else {
      recommendedReadings = "<li>All domains scoring above 80%! Maintain your edge by reviewing OSPF configurations and Automation APIs.</li>";
    }

    html += `
      <div class="card" style="border: 2px solid ${statusColor}; border-radius: 8px; padding: 20px; background: rgba(255,255,255,0.02); margin-top: 20px;">
        <h3 style="color: ${statusColor}; margin-top: 0;">CCNA 200-301 Official Readiness Analysis</h3>
        
        <div style="margin-bottom: 15px;">
          <strong>Readiness Assessment Status:</strong>
          <span style="display: inline-block; padding: 4px 10px; border-radius: 4px; font-weight: bold; background: ${statusColor}; color: #ffffff; margin-left: 8px;">
            ${statusText}
          </span>
        </div>
        
        <p style="color: #a1b2c8; line-height: 1.6; margin-bottom: 20px;">
          ${readinessDesc}
        </p>
        
        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 20px 0;" />
        
        <h4>Recommended Cisco Press Review Chapters:</h4>
        <ul style="color: #a1b2c8; padding-left: 20px; line-height: 1.8;">
          ${recommendedReadings}
        </ul>
        
        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 20px 0;" />
        
        <h4>Verification of Key Competencies:</h4>
        <table style="width: 100%; border-collapse: collapse; text-align: left; color: #a1b2c8; font-size: 14px;">
          <thead>
            <tr style="border-bottom: 1px solid #334155; color: #ffffff;">
              <th style="padding: 8px 0;">CCNA Blueprint Domain</th>
              <th style="padding: 8px 0; text-align: right;">Your Score</th>
              <th style="padding: 8px 0; text-align: right;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(domain).map(([name, val]) => {
              const score = Math.round((val.correct / val.total) * 100);
              const status = score >= 80 ? "Pass" : score >= 60 ? "Borderline" : "Needs Review";
              const col = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ff5e3a";
              return `
                <tr style="border-bottom: 1px solid #1e293b;">
                  <td style="padding: 10px 0;">${name}</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: bold; color: ${col};">${score}%</td>
                  <td style="padding: 10px 0; text-align: right; color: ${col}; font-weight: 500;">${status}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
      
      <div class="card" style="margin-top: 20px;">
        <h3>Detailed Question Review</h3>
        <p style="font-size:0.9em; color:#a1b2c8; margin-bottom:15px;">Below is the review list of your questions, detailing your answers versus correct answers and standard explanations.</p>
        ${s.questions.map((q, idx) => {
          const userAns = s.answers[idx];
          const ok = answerEquals(q, userAns);
          
          let userAnsText = "";
          let correctAnsText = "";
          
          if (q.type === "single" || q.type === "scenario") {
            userAnsText = userAns !== undefined ? `${String.fromCharCode(65 + userAns)}. ${q.options[userAns]}` : "No Answer";
            correctAnsText = `${String.fromCharCode(65 + q.correct[0])}. ${q.options[q.correct[0]]}`;
          } else if (q.type === "multi") {
            const list = Array.isArray(userAns) ? userAns : [];
            userAnsText = list.length > 0 ? list.map(v => String.fromCharCode(65 + v)).join(", ") : "No Answer";
            correctAnsText = q.correct.map(v => String.fromCharCode(65 + v)).join(", ");
          } else if (q.type === "matching") {
            userAnsText = userAns ? JSON.stringify(userAns) : "No Answer";
            correctAnsText = "Matching format resolved correctly";
          } else {
            userAnsText = userAns ? userAns.join(" -> ") : "No Answer";
            correctAnsText = q.order.join(" -> ");
          }
          
          return `
            <div class="output" style="border-left: 4px solid ${ok ? '#10b981' : '#ff5e3a'}; margin-bottom: 15px; padding: 12px; background: rgba(255,255,255,0.01);">
              <strong>Q${idx + 1} (${q.topic})</strong> — 
              <span style="font-weight: bold; color: ${ok ? '#10b981' : '#ff5e3a'};">${ok ? 'CORRECT' : 'INCORRECT'}</span>
              <br />
              <div style="margin-top: 6px; font-size: 0.95em;"><strong>Question:</strong> ${safeHTML(q.text)}</div>
              <div style="margin-top: 4px; font-size: 0.95em; color: ${ok ? '#10b981' : '#ff5e3a'};"><strong>Your Answer:</strong> ${safeHTML(userAnsText)}</div>
              ${!ok ? `<div style="margin-top: 4px; font-size: 0.95em; color: #10b981;"><strong>Correct Answer:</strong> ${safeHTML(correctAnsText)}</div>` : ""}
              <div style="margin-top: 8px; font-size: 0.95em; color: #a1b2c8; border-top: 1px dotted #334155; padding-top: 6px;">
                <strong>Explanation:</strong> ${safeHTML(q.expl.why)}
              </div>
              <div style="margin-top: 4px; font-size: 0.95em; color: #a1b2c8;">
                <strong>Tip:</strong> ${safeHTML(q.expl.tip)}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  html += `<div class="inline"><button id="backHome" class="primary">Back Home</button><button id="goAnalytics" class="secondary">Open Analytics</button></div>`;

  byId("resultArea").innerHTML = html;
  byId("resultArea").classList.remove("hidden");
  byId("reviewArea").classList.add("hidden");
  byId("questionArea").classList.add("hidden");
  const examFooter = byId("examFooter") || document.querySelector(".exam-footer");
  if (examFooter) examFooter.style.display = "none";

  const rsa = byId("resultArea");
  if (rsa) rsa.scrollTop = 0;
  window.scrollTo(0, 0);

  byId("backHome").addEventListener("click", () => setPage("home"));
  byId("goAnalytics").addEventListener("click", () => setPage("analytics"));
}

function updateStreakOnAttempt() {
  const todayStr = new Date().toDateString();
  const lastAttemptDateStr = state.analytics.lastAttemptDate;
  if (!lastAttemptDateStr) {
    state.analytics.streak = 1;
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    if (lastAttemptDateStr === yesterdayStr) {
      state.analytics.streak = (state.analytics.streak || 0) + 1;
    } else if (lastAttemptDateStr !== todayStr) {
      state.analytics.streak = 1;
    }
  }
  state.analytics.lastAttemptDate = todayStr;
}

function renderAnalytics() {
  const attempts = state.analytics.attempts || [];
  const narrativeEl = byId("analyticsNarrative");
  
  if (attempts.length === 0) {
    if (narrativeEl) narrativeEl.classList.add("hidden");
    
    // Render Empty State UI in place of domain breakdown
    byId("analyticsStats").innerHTML = "";
    byId("domainBreakdown").innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📡</div>
        <h3>No telemetry data available</h3>
        <p>Complete at least one practice quiz or simulated exam to compile telemetry diagnostics and compute your CCNA readiness metrics across all 6 Cisco blueprint domains.</p>
        <button class="primary" onclick="setPage('home')">Start Practice Session</button>
      </div>
    `;
    
    byId("trend").innerHTML = `
      <div class="empty-state" style="padding: var(--sp-6) 0;">
        <p style="color: var(--text-secondary); font-size: var(--text-sm);">No active telemetry trends detected.</p>
      </div>
    `;
    
    renderAchievements();
    return;
  }

  const da = calcDomainAccuracy();
  const weak = Object.entries(da).sort((a, b) => a[1] - b[1])[0];
  const strong = Object.entries(da).sort((a, b) => b[1] - a[1])[0];
  const avg = state.analytics.totalQ ? Math.round(state.analytics.totalTime / state.analytics.totalQ) : 0;
  const pp = passProbability();
  const rs = readinessScore();

  // Render narrative summary
  if (narrativeEl) {
    let narrativeText = "";
    if (rs >= 85) {
      narrativeText = `Excellent progress! Your readiness score is <strong>${rs}%</strong>, indicating a high likelihood of passing the CCNA exam. Continue to review your weak areas, particularly <strong>${weak[0]}</strong> (${weak[1]}%), to maintain peak performance.`;
    } else if (rs >= 70) {
      narrativeText = `You are in the intermediate readiness zone at <strong>${rs}%</strong>. You demonstrate solid competency in <strong>${strong[0]}</strong> (${strong[1]}%), but security and connectivity controls remain critical improvement vectors. Focus heavily on <strong>${weak[0]}</strong> (${weak[1]}%) to cross the exam readiness threshold.`;
    } else {
      narrativeText = `Telemetry analysis indicates an active readiness score of <strong>${rs}%</strong>. To construct a reliable pass margin, prioritize high-impact study sessions. Your weakest domain is currently <strong>${weak[0]}</strong> (${weak[1]}%), which represents the largest leverage point for boosting your overall rating.`;
    }
    narrativeEl.innerHTML = `<h3>Telemetry Insights</h3><p>${narrativeText}</p>`;
    narrativeEl.classList.remove("hidden");
  }

  renderStatsCards("analyticsStats", [
    { k: "Overall Readiness Score", v: `${rs}%` },
    { k: "CCNA Pass Probability", v: `${pp}%` },
    { k: "Quizzes Completed", v: attempts.length },
    { k: "Study Hours", v: (state.analytics.studyMin / 60).toFixed(1) },
    { k: "Average Time Per Question", v: `${avg}s` },
    { k: "Weakest Domain", v: weak ? `${weak[0]} (${weak[1]}%)` : "N/A" },
    { k: "Strongest Domain", v: strong ? `${strong[0]} (${strong[1]}%)` : "N/A" }
  ]);

  // Render circular accuracy metrics using SVGs
  const dasharray = 132;
  byId("domainBreakdown").innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--sp-4);">
      ${blueprint.map((d) => {
        const p = da[d.name] || 0;
        const color = p >= 80 ? "var(--color-ok)" : p >= 50 ? "var(--color-warn)" : "var(--color-danger)";
        const dashoffset = Math.round(dasharray * (1 - p / 100));
        return `
          <div class="domain-ring-card">
            <div class="domain-ring" style="position: relative; display: flex; align-items: center; justify-content: center;">
              <svg viewBox="0 0 52 52">
                <circle class="ring-bg" cx="26" cy="26" r="21"></circle>
                <circle class="ring-fill" cx="26" cy="26" r="21" stroke="${color}" stroke-dasharray="${dasharray}" stroke-dashoffset="${dashoffset}"></circle>
              </svg>
              <span class="ring-label" style="color: ${color};">${p}%</span>
            </div>
            <div class="domain-ring-info">
              <strong>${d.name}</strong>
              <span>Exam Weight: ${d.weight}%</span>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;

  const rec = attempts.slice(-10);
  byId("trend").innerHTML = rec.map((a, i) => `
    <div class="output">
      Attempt ${i + 1}: ${a.mode.toUpperCase()} | <strong>${a.score}%</strong> (${a.correct}/${a.total} correct) | <span style="color: var(--text-secondary);">${new Date(a.at).toLocaleString()}</span>
    </div>
  `).join("");
    
  renderAchievements();
}

const distractorCommands = {
  1: ["vlan 999", "switchport mode trunk", "interface FastEthernet0/24", "no switchport"],
  2: ["encapsulation dot1Q 99", "ip address 10.10.10.1 255.0.0.0", "interface GigabitEthernet0/0", "no ip routing"],
  3: ["router ospf 100", "router-id 2.2.2.2", "network 192.168.1.0 0.0.0.0 area 0", "ip route 0.0.0.0 0.0.0.0 10.10.10.1"],
  4: ["access-list 10 permit 192.168.20.0 0.0.0.255", "ip access-group 10 out", "access-list 10 deny any", "interface GigabitEthernet0/1"],
  5: ["ip dhcp pool WAN_POOL", "default-router 192.168.1.254", "dns-server 1.1.1.1", "ip dhcp excluded-address 192.168.1.1 192.168.1.254"],
  6: ["ip nat outside", "ip nat inside", "access-list 1 permit any", "ip nat inside source static 192.168.1.10 192.168.1.2"],
  7: ["spanning-tree vlan 10 priority 4000", "spanning-tree mode pvst", "no spanning-tree vlan 10", "spanning-tree root primary"],
  8: ["interface range GigabitEthernet0/1 - 2", "channel-group 1 mode passive", "channel-group 1 mode on", "no channel-group 1"],
  9: ["wlan Corporate_WiFi 1", "security wpa wpa2 key-mgmt wpa", "security wpa wpa2 akm psk set-key ascii WrongPassword", "wlan Corporate_WiFi 2 shutdown"],
  10: ["crypto isakmp policy 1", "encryption aes 128", "crypto ipsec transform-set MY_SET esp-3des esp-sha-hmac", "crypto isakmp key WrongKey address 198.51.100.1"]
};

function initLabSelector() {
  const sel = byId("labSelector");
  if (!sel) return;
  sel.innerHTML = labs.map((l) => `<option value="${l.id}">Lab ${l.id}: ${l.title}</option>`).join("");
  sel.addEventListener("change", () => {
    state.lab.currentLabId = Number(sel.value);
    loadLab(state.lab.currentLabId);
  });
}

function initLabModes() {
  const modes = [
    { id: "btnModeStep", mode: "step" },
    { id: "btnModeChallenge", mode: "challenge" },
    { id: "btnModeExam", mode: "exam" }
  ];
  modes.forEach(m => {
    const btn = byId(m.id);
    if (btn) {
      btn.addEventListener("click", () => {
        playNetSound("click");
        modes.forEach(o => {
          const b = byId(o.id);
          if (b) b.className = "ghost";
        });
        btn.className = "primary";
        state.lab.mode = m.mode;
        loadLab(state.lab.currentLabId);
      });
    }
  });
}

function drawLabTopology(lab) {
  const container = byId("labTopologyContainer");
  if (!container) return;
  
  let svg = `
    <svg viewBox="0 0 500 160" width="100%" height="100%" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
      <line x1="100" y1="80" x2="250" y2="80" stroke="#00f2fe" stroke-width="2" />
      <line x1="250" y1="80" x2="400" y2="80" stroke="#10b981" stroke-width="2" />
      
      <g transform="translate(100, 80)">
        <circle r="16" fill="#060913" stroke="#00f2fe" stroke-width="2" />
        <text y="4" font-family="Space Grotesk" font-size="8" fill="#fff" text-anchor="middle">💻 Host</text>
      </g>
      
      <g transform="translate(250, 80)">
        <rect x="-18" y="-12" width="36" height="24" rx="4" fill="#060913" stroke="#00f2fe" stroke-width="2" />
        <text y="4" font-family="Space Grotesk" font-size="8" fill="#fff" text-anchor="middle">🎛️ SW-1</text>
      </g>
      
      <g transform="translate(400, 80)">
        <circle r="16" fill="#060913" stroke="#10b981" stroke-width="2" />
        <text y="4" font-family="Space Grotesk" font-size="8" fill="#fff" text-anchor="middle">🌐 R-1</text>
      </g>
    </svg>
  `;
  container.innerHTML = svg;
}

function renderLabObjectives(lab) {
  const list = byId("labObjectivesList");
  if (!list) return;
  
  list.innerHTML = lab.objectives.map((obj, idx) => {
    const done = state.lab.completedSteps[idx];
    const icon = done ? "✔" : "⏳";
    const color = done ? "#10b981" : "var(--text-muted)";
    return `
      <div style="display: flex; align-items: flex-start; gap: 8px; color: ${color};">
        <span>${icon}</span>
        <span>${obj}</span>
      </div>
    `;
  }).join("");
}

function loadLab(labId) {
  const lab = labs.find(l => l.id === labId);
  if (!lab) return;
  
  state.lab.currentLabId = labId;
  state.lab.completedSteps = {};
  state.lab.userCommands = [];
  state.lab.currentPrompt = (labId === 1 || labId === 7 || labId === 8) ? "Switch(config)#" : "Router(config)#";
  
  drawLabTopology(lab);
  renderLabObjectives(lab);
  
  const output = byId("labCliOutput");
  const prompt = byId("labCliPrompt");
  const inputs = byId("labInteractiveInputs");
  const feedback = byId("labFeedbackBox");
  
  if (feedback) feedback.style.display = "none";
  
  const initialHost = (labId === 1 || labId === 7 || labId === 8) ? "Switch" : "Router";
  
  if (state.lab.mode === "step" || state.lab.mode === "challenge") {
    if (output) {
      output.textContent = `Cisco IOS Software, Catalyst L3 Switch Software, Version 15.2...\n\n${initialHost}# configure terminal\nEnter configuration commands, one per line. End with CNTL/Z.\n`;
    }
    if (prompt) prompt.textContent = `${initialHost}(config)#`;
    
    let cmds = lab.commands.map((c, i) => ({ cmd: c.cmd, idx: i, correct: true }));
    if (state.lab.mode === "challenge") {
      const dists = distractorCommands[lab.id] || [];
      dists.forEach(d => {
        cmds.push({ cmd: d, idx: -1, correct: false });
      });
    }
    cmds = shuffle(cmds);
    
    if (inputs) {
      inputs.innerHTML = cmds.map(c => `
        <button class="secondary btn-lab-cmd" data-cmd="${c.cmd}" style="padding: 4px 8px; font-size: 11px; font-family: var(--font-mono); text-transform: none; margin: 2px;">${c.cmd}</button>
      `).join("");
      
      inputs.querySelectorAll(".btn-lab-cmd").forEach(btn => {
        btn.addEventListener("click", () => {
          handleLabCommandClick(btn.dataset.cmd, lab);
        });
      });
    }
  } else if (state.lab.mode === "exam") {
    if (output) {
      output.innerHTML = `<div style="font-size:12px; color:#fff; font-style:italic; margin-bottom:8px;">Match each configuration objective to its correct Cisco IOS command. Click an objective, then click its matching command below.</div>`;
    }
    if (prompt) prompt.textContent = "Exam Mode";
    
    renderExamMatchInterface(lab);
  }
}

function handleLabCommandClick(cmd, lab) {
  const nextExpectedIdx = state.lab.userCommands.length;
  const nextExpectedCmd = lab.commands[nextExpectedIdx].cmd;
  const output = byId("labCliOutput");
  const prompt = byId("labCliPrompt");
  const feedback = byId("labFeedbackBox");
  
  if (feedback) feedback.style.display = "none";
  
  const currentHost = (lab.id === 1 || lab.id === 7 || lab.id === 8) ? "Switch" : "Router";
  
  if (cmd === nextExpectedCmd) {
    playNetSound("hop");
    state.lab.userCommands.push(cmd);
    
    if (cmd.startsWith("interface") || cmd.startsWith("int ")) {
      state.lab.currentPrompt = `${currentHost}(config-if)#`;
    } else if (cmd.startsWith("router ospf") || cmd.startsWith("router rip")) {
      state.lab.currentPrompt = `${currentHost}(config-router)#`;
    } else if (cmd.startsWith("vlan ")) {
      state.lab.currentPrompt = `${currentHost}(config-vlan)#`;
    } else if (cmd.startsWith("wlan ")) {
      state.lab.currentPrompt = `${currentHost}(config-wlan)#`;
    } else if (cmd.startsWith("crypto isakmp") || cmd.startsWith("crypto ipsec")) {
      state.lab.currentPrompt = `${currentHost}(config-crypto)#`;
    } else if (cmd.startsWith("exit")) {
      state.lab.currentPrompt = `${currentHost}(config)#`;
    }
    
    if (output) {
      output.textContent += `${prompt.textContent} ${cmd}\n`;
      output.scrollTop = output.scrollHeight;
    }
    if (prompt) prompt.textContent = state.lab.currentPrompt;
    
    const completedCount = state.lab.userCommands.length;
    lab.objectives.forEach((obj, idx) => {
      const threshold = Math.min(lab.commands.length, Math.ceil((idx + 1) * (lab.commands.length / lab.objectives.length)));
      if (completedCount >= threshold) {
        if (!state.lab.completedSteps[idx]) {
          state.lab.completedSteps[idx] = true;
          playNetSound("success");
        }
      }
    });
    
    renderLabObjectives(lab);
    
    if (state.lab.userCommands.length === lab.commands.length) {
      playNetSound("success");
      if (output) {
        output.textContent += `\n%CONFIG-5-SUCCESS: Laboratory configuration completed successfully. All objectives met.\n`;
        output.scrollTop = output.scrollHeight;
      }
      if (feedback) {
        feedback.style.display = "block";
        feedback.style.background = "#10b981";
        feedback.style.color = "#000";
        feedback.textContent = `✔ Lab Completed! +50 XP Awarded.`;
      }
      gainXP(50);
      
      state.analytics.labsCompleted = Math.min(10, (state.analytics.labsCompleted || 0) + 1);
      saveAnalytics();
      renderHome();
      
      const inputs = byId("labInteractiveInputs");
      if (inputs) inputs.innerHTML = `<span style="color:#10b981; font-weight:bold;">✔ Lab Passed!</span>`;
    }
  } else {
    playNetSound("block");
    if (output) {
      output.textContent += `${prompt.textContent} ${cmd}\n% Invalid input detected or command mismatch.\n`;
      output.scrollTop = output.scrollHeight;
    }
    if (feedback) {
      feedback.style.display = "block";
      feedback.style.background = "#ff5e3a";
      feedback.style.color = "#fff";
      feedback.textContent = `❌ Incorrect command sequence. Try again.`;
    }
  }
}

function renderExamMatchInterface(lab) {
  const output = byId("labCliOutput");
  const inputs = byId("labInteractiveInputs");
  if (!output || !inputs) return;
  
  state.lab.selectedObjIdx = null;
  state.lab.selectedCmdText = null;
  state.lab.matches = {};
  
  const shuffledCmds = shuffle(lab.commands.map((c, i) => ({ text: c.cmd, originalIdx: i })));
  
  output.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%;">
      <div>
        <h5 style="color: #00f2fe; margin-top: 0; margin-bottom: 6px;">Objectives / Steps</h5>
        <div id="examObjColumn" style="display: flex; flex-direction: column; gap: 4px; overflow-y:auto; max-height:160px;">
          ${lab.commands.map((c, i) => `
            <div class="exam-item exam-obj-item" data-obj-idx="${i}" style="border: 1px solid var(--border-color); padding: 4px; border-radius: 4px; font-size: 10px; cursor: pointer; background: rgba(255,255,255,0.02); min-height: 36px;">
              ${i+1}. ${c.desc}
              <div class="matched-val" id="matchedVal-${i}" style="color: #10b981; font-weight: bold; font-family: var(--font-mono); font-size: 9.5px; margin-top: 2px;"></div>
            </div>
          `).join("")}
        </div>
      </div>
      <div>
        <h5 style="color: #00f2fe; margin-top: 0; margin-bottom: 6px;">IOS Commands</h5>
        <div id="examCmdColumn" style="display: flex; flex-direction: column; gap: 4px; overflow-y:auto; max-height:160px;">
          ${shuffledCmds.map((c, i) => `
            <div class="exam-item exam-cmd-item" data-cmd-text="${c.text}" style="border: 1px solid var(--border-color); padding: 4px; border-radius: 4px; font-size: 10px; cursor: pointer; font-family: var(--font-mono); background: rgba(255,255,255,0.02); min-height: 36px; display:flex; align-items:center;">
              ${c.text}
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
  
  inputs.innerHTML = `
    <button id="btnSubmitExamMatches" class="primary" style="width: 100%; height: 32px; font-size: 12px;">Submit Configuration Matches</button>
  `;
  
  const objItems = output.querySelectorAll(".exam-obj-item");
  const cmdItems = output.querySelectorAll(".exam-cmd-item");
  
  objItems.forEach(item => {
    item.addEventListener("click", () => {
      playNetSound("click");
      objItems.forEach(el => el.style.borderColor = "var(--border-color)");
      item.style.borderColor = "#00f2fe";
      state.lab.selectedObjIdx = Number(item.dataset.objIdx);
      checkAndApplyMatch();
    });
  });
  
  cmdItems.forEach(item => {
    item.addEventListener("click", () => {
      playNetSound("click");
      cmdItems.forEach(el => el.style.borderColor = "var(--border-color)");
      item.style.borderColor = "#00f2fe";
      state.lab.selectedCmdText = item.dataset.cmdText;
      checkAndApplyMatch();
    });
  });
  
  function checkAndApplyMatch() {
    if (state.lab.selectedObjIdx !== null && state.lab.selectedCmdText !== null) {
      const objIdx = state.lab.selectedObjIdx;
      const cmdText = state.lab.selectedCmdText;
      
      state.lab.matches[objIdx] = cmdText;
      
      const matchLabel = byId(`matchedVal-${objIdx}`);
      if (matchLabel) {
        matchLabel.textContent = `Matched: ${cmdText}`;
      }
      
      objItems.forEach(el => el.style.borderColor = "var(--border-color)");
      cmdItems.forEach(el => el.style.borderColor = "var(--border-color)");
      state.lab.selectedObjIdx = null;
      state.lab.selectedCmdText = null;
    }
  }
  
  const btnSubmit = byId("btnSubmitExamMatches");
  if (btnSubmit) {
    btnSubmit.addEventListener("click", () => {
      let correctCount = 0;
      lab.commands.forEach((c, idx) => {
        if (state.lab.matches[idx] === c.cmd) {
          correctCount++;
        }
      });
      
      const total = lab.commands.length;
      const feedback = byId("labFeedbackBox");
      
      if (correctCount === total) {
        playNetSound("success");
        if (feedback) {
          feedback.style.display = "block";
          feedback.style.background = "#10b981";
          feedback.style.color = "#000";
          feedback.textContent = `✔ Exam passed! ${correctCount}/${total} correct matches. +50 XP Awarded.`;
        }
        gainXP(50);
        
        lab.objectives.forEach((_, i) => {
          state.lab.completedSteps[i] = true;
        });
        renderLabObjectives(lab);
        
        state.analytics.labsCompleted = Math.min(10, (state.analytics.labsCompleted || 0) + 1);
        saveAnalytics();
        renderHome();
        
        inputs.innerHTML = `<span style="color:#10b981; font-weight:bold;">✔ Lab Passed!</span>`;
      } else {
        playNetSound("block");
        if (feedback) {
          feedback.style.display = "block";
          feedback.style.background = "#ff5e3a";
          feedback.style.color = "#fff";
          feedback.textContent = `❌ Exam failed. ${correctCount}/${total} correct matches. Try again.`;
        }
      }
    });
  }
}

function renderAchievements() {
  const a = state.analytics;
  const rs = readinessScore();
  const da = calcDomainAccuracy();
  
  const badges = [
    {
      id: "first_lab",
      title: "First Lab",
      desc: "Complete your first virtual configuration lab.",
      unlocked: (a.labsCompleted || 0) >= 1,
      icon: "🧪"
    },
    {
      id: "100_questions",
      title: "100 Questions",
      desc: "Solve 100 or more questions in the preparation engine.",
      unlocked: (a.totalQ || 0) >= 100,
      icon: "📚"
    },
    {
      id: "subnet_master",
      title: "Subnet Master",
      desc: "Achieve a subnetting streak multiplier of x10 in arcade mode.",
      unlocked: (a.subnetMaxStreak || 0) >= 10,
      icon: "⚡"
    },
    {
      id: "ospf_expert",
      title: "OSPF Expert",
      desc: "Reach 80% or higher accuracy in the IP Connectivity domain.",
      unlocked: (da["IP Connectivity"] || 0) >= 80 && (a.domain["IP Connectivity"]?.total || 0) >= 5,
      icon: "🕸️"
    },
    {
      id: "routing_champion",
      title: "Routing Champion",
      desc: "Successfully run OSPF and ROAS packet traversal paths.",
      unlocked: a.simPathsRun && a.simPathsRun.ospf && a.simPathsRun.roas,
      icon: "🏆"
    },
    {
      id: "streaks",
      title: "Streak Fanatic",
      desc: "Maintain a study streak of 3 or more consecutive days.",
      unlocked: (a.streak || 0) >= 3,
      icon: "🔥"
    },
    {
      id: "ccna_ready",
      title: "CCNA Ready",
      desc: "Achieve an Overall Readiness Score of 85% or higher.",
      unlocked: rs >= 85,
      icon: "🎓"
    }
  ];
  
  let html = `
    <h3 style="margin-bottom:12px;">🏆 Professional Certification Badges</h3>
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:12px;">
  `;
  
  badges.forEach(b => {
    const border = b.unlocked ? "border: 1px solid #10b981; background: rgba(16,185,129,0.03);" : "border: 1px solid rgba(255,255,255,0.05); opacity:0.5;";
    const badgeColor = b.unlocked ? "#10b981" : "#64748b";
    html += `
      <div style="padding:12px; border-radius:10px; ${border} display:flex; align-items:center; gap:12px;">
        <span style="font-size:24px; color:${badgeColor}">${b.icon}</span>
        <div>
          <h5 style="margin:0 0 2px 0; font-size:13px; color:${b.unlocked ? '#fff' : '#64748b'};">${b.title}</h5>
          <p style="margin:0; font-size:10.5px; color:var(--text-muted); line-height:1.3;">${b.desc}</p>
        </div>
      </div>
    `;
  });
  
  html += `</div>`;
  
  let panel = byId("achievementsPanel");
  if (!panel) {
    panel = document.createElement("section");
    panel.id = "achievementsPanel";
    panel.className = "card";
    panel.style.marginTop = "20px";
    
    const analyticsPage = byId("analytics");
    if (analyticsPage) {
      analyticsPage.appendChild(panel);
    }
  }
  
  if (panel) {
    panel.innerHTML = html;
  }
}

function ipToNum(ip) {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function numToIp(num) {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255
  ].join(".");
}

function getSubnetMask(prefix) {
  const mask = [0, 0, 0, 0];
  let bits = prefix;
  for (let i = 0; i < 4; i++) {
    const use = Math.max(0, Math.min(8, bits));
    mask[i] = use === 0 ? 0 : 256 - Math.pow(2, 8 - use);
    bits -= use;
  }
  return mask.join(".");
}

function getSubnetDetails(ipStr, prefix) {
  const ipNum = ipToNum(ipStr);
  const maskNum = (prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0);
  const netNum = (ipNum & maskNum) >>> 0;
  const broadNum = (netNum | ~maskNum) >>> 0;
  
  return {
    ip: ipStr,
    prefix: prefix,
    mask: numToIp(maskNum),
    wildcard: numToIp(~maskNum >>> 0),
    network: numToIp(netNum),
    broadcast: numToIp(broadNum),
    firstUsable: numToIp((netNum + 1) >>> 0),
    lastUsable: numToIp((broadNum - 1) >>> 0),
    totalHosts: Math.pow(2, 32 - prefix),
    usableHosts: prefix >= 31 ? 0 : Math.pow(2, 32 - prefix) - 2
  };
}

function generateRandomIP() {
  const octets = [];
  const type = Math.random();
  if (type < 0.3) {
    octets.push(10);
    octets.push(Math.floor(Math.random() * 256));
    octets.push(Math.floor(Math.random() * 256));
    octets.push(Math.floor(Math.random() * 256));
  } else if (type < 0.6) {
    octets.push(172);
    octets.push(16 + Math.floor(Math.random() * 16));
    octets.push(Math.floor(Math.random() * 256));
    octets.push(Math.floor(Math.random() * 256));
  } else {
    octets.push(192);
    octets.push(168);
    octets.push(Math.floor(Math.random() * 256));
    octets.push(Math.floor(Math.random() * 256));
  }
  return octets.join(".");
}

function makeSubnetQuestion(mode) {
  const prefixes = mode === "Easy" ? [24, 25, 26, 27, 28, 29, 30] :
                   mode === "Medium" ? [20, 21, 22, 23, 24, 25, 26, 27, 28] :
                   [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
  const prefix = pick(prefixes);
  const qTypes = ["mask", "wildcard", "hosts", "network", "broadcast", "first", "last"];
  const qType = pick(qTypes);
  const ip = generateRandomIP();
  const details = getSubnetDetails(ip, prefix);

  let prompt = "";
  let answer = "";
  let note = "";

  switch (qType) {
    case "mask":
      prompt = `What subnet mask corresponds to /${prefix}?`;
      answer = details.mask;
      note = `For /${prefix}, the subnet mask is ${details.mask}.`;
      break;
    case "wildcard":
      prompt = `What wildcard mask corresponds to /${prefix}?`;
      answer = details.wildcard;
      note = `Wildcard mask is calculated as 255.255.255.255 minus subnet mask (${details.mask}), which is ${details.wildcard}.`;
      break;
    case "hosts":
      prompt = `How many usable hosts are in /${prefix}?`;
      answer = String(details.usableHosts);
      note = `Usable hosts formula: 2^(32 - prefix) - 2. For /${prefix}, 2^(32 - ${prefix}) - 2 = ${details.usableHosts}.`;
      break;
    case "network":
      prompt = `What is the Network ID (Subnet ID) for IP address ${ip}/${prefix}?`;
      answer = details.network;
      note = `Perform bitwise AND of IP ${ip} and mask ${details.mask} to get Network ID: ${details.network}.`;
      break;
    case "broadcast":
      prompt = `What is the Broadcast IP address for IP address ${ip}/${prefix}?`;
      answer = details.broadcast;
      note = `Broadcast IP is the last address in the subnet block (Network ID + block size - 1): ${details.broadcast}.`;
      break;
    case "first":
      prompt = `What is the first usable IP address for IP address ${ip}/${prefix}?`;
      answer = details.firstUsable;
      note = `First usable host IP is Network ID + 1: ${details.firstUsable}.`;
      break;
    case "last":
      prompt = `What is the last usable IP address for IP address ${ip}/${prefix}?`;
      answer = details.lastUsable;
      note = `Last usable host IP is Broadcast IP - 1: ${details.lastUsable}.`;
      break;
  }

  return { prompt, answer, note, details };
}

function getSubnetMultiplier() {
  const streak = state.subnet.streak || 0;
  if (streak >= 9) return 5;
  if (streak >= 6) return 4;
  if (streak >= 3) return 2;
  return 1;
}

function updateSubnetLeaderboard(score) {
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem("ccna_subnet_leaderboard")) || [];
  } catch (e) {
    list = [];
  }
  const dateStr = new Date().toLocaleDateString();
  list.push({ date: dateStr, score: score, mode: "Timed" });
  list.sort((a, b) => b.score - a.score);
  list = list.slice(0, 5); // top 5
  safeSetStorage(localStorage, "ccna_subnet_leaderboard", JSON.stringify(list));
  renderSubnetLeaderboard();
}

function renderSubnetLeaderboard() {
  const container = byId("subnetLeaderboard");
  if (!container) return;
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem("ccna_subnet_leaderboard")) || [];
  } catch (e) {}
  
  if (list.length === 0) {
    container.innerHTML = `<span style="font-style: italic;">No high scores registered yet. Complete a Timed Challenge!</span>`;
    return;
  }
  
  let html = `<ol style="margin: 0; padding-left: 20px; color: var(--text-muted);">`;
  list.forEach((item) => {
    html += `<li style="margin-bottom: 4px;"><strong>${item.score} correct</strong> - ${item.date} (${item.mode})</li>`;
  });
  html += `</ol>`;
  container.innerHTML = html;
}

function ensureSubnetQuestion(force) {
  const mode = state.subnet.mode || "Easy";
  
  // Update tabs buttons active styling
  const btns = {
    Easy: byId("btnSubnetEasy"),
    Medium: byId("btnSubnetMedium"),
    Hard: byId("btnSubnetHard"),
    Timed: byId("btnSubnetTimed")
  };
  Object.keys(btns).forEach(m => {
    const btn = btns[m];
    if (btn) {
      if (m === mode) {
        btn.classList.add("primary");
        btn.classList.remove("secondary");
      } else {
        btn.classList.remove("primary");
        btn.classList.add("secondary");
      }
    }
  });

  const timerDisplay = byId("subnetTimerDisplay");
  const streakDisplay = byId("subnetStreakDisplay");
  const xpDisplay = byId("subnetXPDisplay");
  const subnetSubmit = byId("subnetSubmit");
  const subnetSkip = byId("subnetSkip");
  const subnetAnswer = byId("subnetAnswer");

  if (xpDisplay) {
    xpDisplay.textContent = `XP: ${state.analytics.xp || 0}`;
  }

  if (mode === "Timed") {
    if (timerDisplay) {
      timerDisplay.style.display = "block";
      timerDisplay.textContent = `Time Left: ${state.subnet.timeLeft || 30}s`;
    }
    if (force) {
      state.subnet.timeLeft = 30;
      state.subnet.score = 0;
      state.subnet.attempts = 0;
      state.subnet.streak = 0;
      if (subnetSubmit) subnetSubmit.disabled = false;
      if (subnetSkip) subnetSkip.disabled = false;
      if (subnetAnswer) subnetAnswer.disabled = false;
      if (timerDisplay) timerDisplay.textContent = `Time Left: 30s`;
      
      if (state.subnet.timerRef) clearInterval(state.subnet.timerRef);
      state.subnet.timerRef = setInterval(() => {
        const isSubnetPage = byId("subnet") && byId("subnet").classList.contains("active");
        if (isSubnetPage && state.subnet.mode === "Timed") {
          state.subnet.timeLeft = Math.max(0, state.subnet.timeLeft - 1);
          if (state.subnet.timeLeft <= 0) {
            state.subnet.timeLeft = 0;
            clearInterval(state.subnet.timerRef);
            state.subnet.timerRef = null;
            
            playNetSound("block");
            if (subnetSubmit) subnetSubmit.disabled = true;
            if (subnetSkip) subnetSkip.disabled = true;
            if (subnetAnswer) subnetAnswer.disabled = true;
            
            byId("subnetOut").innerHTML = `
              <strong style="color: #ff5e3a;">Challenge Ended!</strong><br/>
              Your Score: <strong>${state.subnet.score}</strong> correct out of <strong>${state.subnet.attempts}</strong> attempts.<br/>
              Streak Max Multiplier reached: <strong>x${state.subnet.multiplier || 1}</strong>
            `;
            
            updateSubnetLeaderboard(state.subnet.score);
            
            if (state.subnet.score > (state.analytics.subnetMaxStreak || 0)) {
              state.analytics.subnetMaxStreak = state.subnet.score;
              saveAnalytics();
            }
          }
          if (timerDisplay) {
            timerDisplay.textContent = `Time Left: ${state.subnet.timeLeft}s`;
          }
        } else {
          clearInterval(state.subnet.timerRef);
          state.subnet.timerRef = null;
        }
      }, 1000);
    }
  } else {
    if (state.subnet.timerRef) {
      clearInterval(state.subnet.timerRef);
      state.subnet.timerRef = null;
    }
    if (timerDisplay) {
      timerDisplay.style.display = "none";
    }
    if (subnetSubmit) subnetSubmit.disabled = false;
    if (subnetSkip) subnetSkip.disabled = false;
    if (subnetAnswer) subnetAnswer.disabled = false;
  }

  const mult = getSubnetMultiplier();
  state.subnet.multiplier = mult;
  if (streakDisplay) {
    streakDisplay.textContent = `Multiplier: x${mult} (Streak: ${state.subnet.streak})`;
  }

  if (force || !state.subnet.q) {
    state.subnet.q = makeSubnetQuestion(mode === "Timed" ? "Hard" : mode);
    byId("subnetPrompt").innerHTML = `<strong>Question:</strong> ${state.subnet.q.prompt}`;
    if (force) {
      byId("subnetOut").innerHTML = "";
      const diagram = byId("subnetRangeDiagram");
      if (diagram) {
        diagram.innerHTML = `<span style="font-style: italic;">Submit an answer to visualize host ranges, network ID, and broadcast boundaries.</span>`;
      }
    }
  }
}

function submitSubnet() {
  const ansInput = byId("subnetAnswer");
  if (!ansInput) return;
  const ans = ansInput.value.trim();
  if (!ans) return;

  const q = state.subnet.q;
  if (!q) return;

  const isCorrect = ans.toLowerCase() === q.answer.toLowerCase();
  state.subnet.attempts = (state.subnet.attempts || 0) + 1;

  const diagram = byId("subnetRangeDiagram");

  if (isCorrect) {
    playNetSound("success");
    state.subnet.score = (state.subnet.score || 0) + 1;
    state.subnet.streak = (state.subnet.streak || 0) + 1;
    
    const mult = getSubnetMultiplier();
    const baseXP = state.subnet.mode === "Easy" ? 5 : state.subnet.mode === "Medium" ? 10 : 15;
    const gainedXP = baseXP * mult;
    
    gainXP(gainedXP);

    // Trigger success particle explosion at the submit button
    const submitBtn = byId("subnetSubmit");
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    if (submitBtn) {
      const rect = submitBtn.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }
    if (window.triggerSuccessExplosion) {
      window.triggerSuccessExplosion(x, y, "#00f2fe");
    }
    
    if (state.subnet.mode === "Timed") {
      state.subnet.timeLeft = Math.min(30, state.subnet.timeLeft + 5);
      const timerDisplay = byId("subnetTimerDisplay");
      if (timerDisplay) {
        timerDisplay.textContent = `Time Left: ${state.subnet.timeLeft}s`;
      }
    }

    byId("subnetOut").innerHTML = `
      <span style="color:#10b981; font-weight:bold;">✔ Correct!</span> (+${gainedXP} XP)<br />
      Expected: <strong>${q.answer}</strong><br />
      ${q.note}
    `;

    if (diagram && q.details) {
      const d = q.details;
      diagram.innerHTML = `
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 11px;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-color); color: #00f2fe;">
              <th style="padding: 4px;">Property</th>
              <th style="padding: 4px;">IP Address Details</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style="padding: 4px; color: #a7f3d0;">Network ID</td><td style="padding: 4px; font-weight:bold;">${d.network}</td></tr>
            <tr><td style="padding: 4px; color: #a7f3d0;">Usable Range</td><td style="padding: 4px;">${d.firstUsable} - ${d.lastUsable}</td></tr>
            <tr><td style="padding: 4px; color: #a7f3d0;">Broadcast IP</td><td style="padding: 4px; font-weight:bold;">${d.broadcast}</td></tr>
            <tr><td style="padding: 4px; color: #a7f3d0;">Subnet Mask</td><td style="padding: 4px;">${d.mask}</td></tr>
            <tr><td style="padding: 4px; color: #a7f3d0;">Wildcard Mask</td><td style="padding: 4px;">${d.wildcard}</td></tr>
            <tr><td style="padding: 4px; color: #a7f3d0;">Usable Hosts</td><td style="padding: 4px;">${d.usableHosts}</td></tr>
          </tbody>
        </table>
      `;
    }
  } else {
    playNetSound("block");
    state.subnet.streak = 0;
    
    byId("subnetOut").innerHTML = `
      <span style="color:#ff5e3a; font-weight:bold;">❌ Incorrect</span><br />
      Expected: <strong>${q.answer}</strong><br />
      ${q.note}
    `;

    if (diagram && q.details) {
      const d = q.details;
      diagram.innerHTML = `
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 11px;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-color); color: #00f2fe;">
              <th style="padding: 4px;">Property</th>
              <th style="padding: 4px;">IP Address Details</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style="padding: 4px; color: #a7f3d0;">Network ID</td><td style="padding: 4px; font-weight:bold;">${d.network}</td></tr>
            <tr><td style="padding: 4px; color: #a7f3d0;">Usable Range</td><td style="padding: 4px;">${d.firstUsable} - ${d.lastUsable}</td></tr>
            <tr><td style="padding: 4px; color: #a7f3d0;">Broadcast IP</td><td style="padding: 4px; font-weight:bold;">${d.broadcast}</td></tr>
            <tr><td style="padding: 4px; color: #a7f3d0;">Subnet Mask</td><td style="padding: 4px;">${d.mask}</td></tr>
            <tr><td style="padding: 4px; color: #a7f3d0;">Wildcard Mask</td><td style="padding: 4px;">${d.wildcard}</td></tr>
            <tr><td style="padding: 4px; color: #a7f3d0;">Usable Hosts</td><td style="padding: 4px;">${d.usableHosts}</td></tr>
          </tbody>
        </table>
      `;
    }
  }

  ansInput.value = "";
  renderAchievements();

  state.subnet.q = makeSubnetQuestion(state.subnet.mode === "Timed" ? "Hard" : state.subnet.mode);
  setTimeout(() => {
    byId("subnetPrompt").innerHTML = `<strong>Question:</strong> ${state.subnet.q.prompt}`;
    ansInput.focus();
  }, 1800);
}

function wireEvents() {
  byId("startStudy").addEventListener("click", () => startSession("study"));
  byId("startQuiz").addEventListener("click", () => startSession("quiz"));
  byId("startSmartQuiz").addEventListener("click", () => startSession("smart"));
  byId("startExam").addEventListener("click", () => startSession("exam"));

  // Dashboard Launch controls
  const btnLaunchStudy = byId("btnLaunchStudy");
  const btnLaunchExam = byId("btnLaunchExam");
  const btnLaunchLabs = byId("btnLaunchLabs");

  if (btnLaunchStudy) {
    btnLaunchStudy.addEventListener("click", () => {
      setPage("engine");
      startSession("study");
    });
  }
  if (btnLaunchExam) {
    btnLaunchExam.addEventListener("click", () => {
      setPage("engine");
      startSession("exam");
    });
  }
  if (btnLaunchLabs) {
    btnLaunchLabs.addEventListener("click", () => {
      setPage("labs");
    });
  }

  // Audio/Contrast controls
  const btnMute = byId("btnMuteToggle");
  if (btnMute) {
    btnMute.addEventListener("click", () => {
      state.muted = !state.muted;
      safeSetStorage(localStorage, "ccna_muted", state.muted);
      updateMuteButton();
      playNetSound("click");
    });
  }

  const btnContrast = byId("btnToggleContrast");
  if (btnContrast) {
    btnContrast.addEventListener("click", () => {
      state.highContrast = !state.highContrast;
      safeSetStorage(localStorage, "ccna_high_contrast", state.highContrast);
      updateContrastButton();
      playNetSound("click");
      showToast(state.highContrast ? "High contrast mode on" : "High contrast mode off", "info", 2000);
    });
  }

  /* ─── Keyboard Shortcuts (Quiz Engine) ─────────────────── */
  document.addEventListener("keydown", (e) => {
    // Only activate when in the quiz engine and not in a text field
    if (!state.session || state.session.submitted) return;
    const tag = document.activeElement ? document.activeElement.tagName : "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const q = state.session.questions[state.session.idx];
    if (!q) return;

    const keyMap = { KeyA: 0, KeyB: 1, KeyC: 2, KeyD: 3 };

    if (e.code in keyMap && (q.type === "single" || q.type === "scenario" || q.type === "multi")) {
      e.preventDefault();
      const optIdx = keyMap[e.code];
      const opts = document.querySelectorAll(".opt input[type='radio'], .opt input[type='checkbox']");
      if (opts[optIdx]) {
        opts[optIdx].click();
        // Visually highlight the selected opt-key
        const labels = document.querySelectorAll(".opt");
        labels.forEach((l, i) => l.classList.toggle("selected", i === optIdx));
      }
      return;
    }

    switch (e.code) {
      case "ArrowRight":
      case "KeyN": {
        e.preventDefault();
        const nb = byId("nextQ") || byId("saveNext");
        if (nb && !nb.disabled) nb.click();
        break;
      }
      case "ArrowLeft":
      case "KeyP": {
        e.preventDefault();
        const pb = byId("prevQ");
        if (pb && !pb.disabled) pb.click();
        break;
      }
      case "KeyF": {
        e.preventDefault();
        const fb = byId("toggleMark");
        if (fb) {
          fb.click();
          const isFlagged = state.session.flagged[state.session.idx];
          showToast(isFlagged ? "Question flagged for review" : "Flag removed", "info", 1800);
        }
        break;
      }
    }
  });

  // Troubleshooting mode updates
  const chkTrouble = byId("chkTroubleshooting");
  if (chkTrouble) {
    chkTrouble.addEventListener("change", () => {
      playNetSound("click");
      state.simBugsFixed = {}; // reset solved states to allow fresh testing
      if (state.inspectedNode) {
        renderCLI(state.inspectedNode);
      }
    });
  }

  const selectPacket = byId("simPacketType");
  if (selectPacket) {
    selectPacket.addEventListener("change", () => {
      if (state.inspectedNode) {
        renderCLI(state.inspectedNode);
      }
    });
  }

  // Subnetting arcade difficulty tabs
  const btnEasy = byId("btnSubnetEasy");
  const btnMedium = byId("btnSubnetMedium");
  const btnHard = byId("btnSubnetHard");
  const btnTimed = byId("btnSubnetTimed");

  if (btnEasy) btnEasy.addEventListener("click", () => { playNetSound("click"); state.subnet.mode = "Easy"; ensureSubnetQuestion(true); });
  if (btnMedium) btnMedium.addEventListener("click", () => { playNetSound("click"); state.subnet.mode = "Medium"; ensureSubnetQuestion(true); });
  if (btnHard) btnHard.addEventListener("click", () => { playNetSound("click"); state.subnet.mode = "Hard"; ensureSubnetQuestion(true); });
  if (btnTimed) btnTimed.addEventListener("click", () => { playNetSound("click"); state.subnet.mode = "Timed"; ensureSubnetQuestion(true); });

  byId("subnetSubmit").addEventListener("click", submitSubnet);
  byId("subnetSkip").addEventListener("click", () => {
    playNetSound("click");
    state.subnet.q = makeSubnetQuestion(state.subnet.mode === "Timed" ? "Hard" : state.subnet.mode);
    ensureSubnetQuestion(false);
  });

  const ansInput = byId("subnetAnswer");
  if (ansInput) {
    ansInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        submitSubnet();
      }
    });
  }

  const openReviewBtn = byId("openReview");
  if (openReviewBtn) openReviewBtn.addEventListener("click", openReview);

  const toggleMarkBtn = byId("toggleMark");
  if (toggleMarkBtn) toggleMarkBtn.addEventListener("click", markCurrent);

  const exitBtn = byId("exitSession");
  if (exitBtn) {
    exitBtn.addEventListener("click", () => {
      if (state.session?.timer) clearInterval(state.session.timer);
      const timerEl = byId("timer");
      if (timerEl) timerEl.classList.add("hidden");
      setPage("home");
    });
  }

  const prevQBtn = byId("prevQ");
  if (prevQBtn) prevQBtn.addEventListener("click", prevQuestion);

  const nextQBtn = byId("nextQ");
  if (nextQBtn) nextQBtn.addEventListener("click", nextQuestion);

  const saveNextBtn = byId("saveNext");
  if (saveNextBtn) saveNextBtn.addEventListener("click", saveAndNext);

  const submitSessionBtn = byId("submitSession");
  if (submitSessionBtn) submitSessionBtn.addEventListener("click", () => submitSession(false));

  const btnFullScreen = byId("btnToggleFullScreen");
  if (btnFullScreen) {
    btnFullScreen.addEventListener("click", () => {
      playNetSound("click");
      const shell = document.querySelector(".exam-shell");
      if (!document.fullscreenElement) {
        shell?.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable full-screen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    });
  }

  const btnMissed = byId("startMissedQuiz");
  if (btnMissed) {
    btnMissed.addEventListener("click", () => startSession("missed"));
  }

  // Sidebar drawer handlers
  const sidebarNav = byId("examNavigator");
  const btnToggleNav = byId("btnToggleSidebar");
  const btnCloseNav = byId("btnCloseSidebar");
  if (sidebarNav && btnToggleNav && btnCloseNav) {
    btnToggleNav.addEventListener("click", () => {
      sidebarNav.classList.add("active");
    });
    btnCloseNav.addEventListener("click", () => {
      sidebarNav.classList.remove("active");
    });
  }

  // Reset progress handler
  const btnReset = byId("btnResetProgress");
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (confirm("Are you sure you want to reset all your progress statistics? This action cannot be undone.")) {
        const fresh = {
          attempts: [],
          domain: {},
          topic: {},
          totalQ: 0,
          correct: 0,
          totalTime: 0,
          studyMin: 0,
          xp: 0,
          ach: {},
          missedIds: []
        };
        state.analytics = fresh;
        saveAnalytics(true);
        renderHome();
        renderAnalytics();
        showToast("Progress statistics reset successfully.", "info", 4000);
      }
    });
  }

  // Onboarding modal wire-up
  const onboarding = byId("onboardingModal");
  const dismissBtn = byId("btnOnboardingDismiss");
  if (onboarding && dismissBtn) {
    if (!localStorage.getItem("ccna_onboarded")) {
      onboarding.classList.remove("hidden");
    }
    dismissBtn.addEventListener("click", () => {
      playNetSound("success");
      onboarding.classList.add("hidden");
      safeSetStorage(localStorage, "ccna_onboarded", "true");
    });
  }

  // Study planner generation hook
  const btnGeneratePlan = byId("btnGeneratePlan");
  if (btnGeneratePlan) {
    btnGeneratePlan.addEventListener("click", () => {
      playNetSound("click");
      const targetDateStr = byId("studyExamDate").value;
      const dailyHours = Number(byId("studyDailyHours").value);
      const outBox = byId("studyPlanOutput");
      if (!outBox) return;

      if (!targetDateStr) {
        showToast("Please select a target exam date.", "warn");
        return;
      }

      const targetDate = new Date(targetDateStr);
      const today = new Date();
      const diffTime = targetDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        showToast("Target exam date must be in the future!", "warn");
        return;
      }

      const totalStudyVolume = 120;
      const currentXP = state.analytics.xp || 0;
      const progressXPFactor = Math.min(0.9, currentXP / 5000);
      const remainingHours = Math.max(10, Math.round(totalStudyVolume * (1 - progressXPFactor)));
      const requiredHoursPerDay = remainingHours / diffDays;

      outBox.style.display = "block";

      let planHtml = `
        <h4 style="color:#00f2fe; margin-top:0; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">📋 Generated Study Route</h4>
        <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-weight:bold; font-size:12.5px;">
          <span>Days Remaining: ${diffDays}</span>
          <span>Estimated Hours Needed: ${remainingHours}h</span>
        </div>
      `;

      if (dailyHours < requiredHoursPerDay) {
        planHtml += `
          <div style="background:rgba(239, 68, 68, 0.08); border:1px solid rgba(239, 68, 68, 0.25); color:#f87171; padding:8px 12px; border-radius:6px; margin-bottom:12px; font-size:11.5px;">
            <strong>⚠ Schedule Alert:</strong> Your target of ${dailyHours} hours/day is insufficient to cover the remaining ${remainingHours} hours. Increase daily target to <strong>${requiredHoursPerDay.toFixed(1)}</strong> hours or push back exam date.
          </div>
        `;
      } else {
        planHtml += `
          <div style="background:rgba(16, 185, 129, 0.08); border:1px solid rgba(16, 185, 129, 0.25); color:#34d399; padding:8px 12px; border-radius:6px; margin-bottom:12px; font-size:11.5px;">
            <strong>✔ Target Achievable:</strong> You are fully on track! A study pace of ${dailyHours} hours/day exceeds the required ${requiredHoursPerDay.toFixed(1)} hours/day.
          </div>
        `;
      }

      const weakDomains = state.weakDomains || [];
      planHtml += `
        <div style="margin-bottom:10px;">
          <strong>Target Practice Metrics:</strong><br />
          • Solve at least <strong>${Math.max(5, Math.round(15 / dailyHours))}</strong> questions per day.<br />
          • Practice 1 CLI lab configurations twice a week.
        </div>
      `;

      if (weakDomains.length > 0) {
        planHtml += `
          <div style="margin-top:10px; border-top:1px solid rgba(255,255,255,0.05); padding-top:8px;">
            <strong>Domain Focus Recommendations:</strong> Use Spaced Repetition or Smart Adaptive practice filters focusing on your weakest domains: 
            <span style="color:#f59e0b; font-weight:bold;">${weakDomains.join(", ")}</span>.
          </div>
        `;
      }

      outBox.innerHTML = planHtml;
    });
  }
}

function setupAuth() {
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
        merged = {
          attempts: [],
          domain: {},
          topic: {},
          totalQ: 0,
          correct: 0,
          totalTime: 0,
          studyMin: 0,
          xp: 0,
          ach: {},
          missedIds: [],
          simPathsRun: { ospf: false, roas: false }
        };
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
      }

      state.analytics = merged;

      // Clear guest progress so it isn't merged again on next login
      if (didMergeGuest) {
        safeSetStorage(localStorage, `${STORE}_backup`, guestRaw);
        localStorage.removeItem(STORE);
      }

      safeSetStorage(localStorage, userKey, JSON.stringify(state.analytics));
      saveUserProgress(user.uid, state.analytics);

      renderHome();
      renderAnalytics();
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
      state.analytics = guestData ? JSON.parse(guestData) : {
        attempts: [],
        domain: {},
        topic: {},
        totalQ: 0,
        correct: 0,
        totalTime: 0,
        studyMin: 0,
        xp: 0,
        ach: {},
        missedIds: [],
        simPathsRun: { ospf: false, roas: false }
      };
      state.analytics.missedIds = state.analytics.missedIds || [];
      state.analytics.simPathsRun = state.analytics.simPathsRun || { ospf: false, roas: false };

      renderHome();
      renderAnalytics();
    }
    authResolve();
  });
}

// Web Audio API Helpers for NOC sound effects
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playNetSound(type) {
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

let currentOsiData = null; // Holds the active step's OSI details

function showOsiLayerDetail(layerNum) {
  const descBox = byId("osiLayerDescBox");
  if (!descBox) return;
  
  if (!currentOsiData) {
    descBox.innerHTML = `<span style="color: var(--text-muted); font-style: italic;">No active packet simulation. Run a simulation to inspect layers.</span>`;
    return;
  }
  
  const layerKey = "l" + layerNum;
  const data = currentOsiData[layerKey];
  
  if (data && data.val !== "-") {
    descBox.innerHTML = `
      <strong style="color: #00f2fe;">Layer ${layerNum} details:</strong><br/>
      <div style="margin-top: 4px; font-family: var(--font-mono); color: #a7f3d0; font-size:12px;">Field Value: ${data.val}</div>
      <div style="margin-top: 6px;">${data.desc}</div>
    `;
  } else {
    descBox.innerHTML = `
      <strong style="color: var(--text-muted);">Layer ${layerNum} details:</strong><br/>
      <div style="margin-top: 4px; font-style: italic;">Not applicable / Not encapsulated at this hop.</div>
    `;
  }
}

function updateOsiLabels(osiData) {
  const l4Val = byId("osi-l4-val");
  const l3Val = byId("osi-l3-val");
  const l2Val = byId("osi-l2-val");
  const l1Val = byId("osi-l1-val");
  
  if (!osiData) {
    if (l4Val) l4Val.textContent = "-";
    if (l3Val) l3Val.textContent = "-";
    if (l2Val) l2Val.textContent = "-";
    if (l1Val) l1Val.textContent = "-";
    return;
  }
  
  if (l4Val) l4Val.textContent = osiData.l4 ? osiData.l4.val : "-";
  if (l3Val) l3Val.textContent = osiData.l3 ? osiData.l3.val : "-";
  if (l2Val) l2Val.textContent = osiData.l2 ? osiData.l2.val : "-";
  if (l1Val) l1Val.textContent = osiData.l1 ? osiData.l1.val : "-";
}

function highlightNode(nodeId, isBlocked = false) {
  const nodes = ["pc", "switch", "router", "firewall", "wan", "pc-sales", "ip-phone", "sw-branch", "r-branch", "hq-core", "fw-branch", "hq-server"];
  nodes.forEach(n => {
    const el = byId(`node-${n}`);
    if (el) {
      if (n === nodeId) {
        el.setAttribute("stroke-width", "4");
        if (isBlocked) {
          el.setAttribute("fill", "rgba(255, 94, 58, 0.25)");
          el.setAttribute("stroke", "#ff5e3a");
        } else {
          el.setAttribute("fill", "rgba(0, 242, 254, 0.2)");
          let origStroke = "#00f2fe";
          if (n === "router" || n === "wan" || n === "r-branch" || n === "hq-core" || n === "hq-server") {
            origStroke = "#10b981";
          } else if (n === "firewall" || n === "fw-branch") {
            origStroke = "#ff5e3a";
          }
          el.setAttribute("stroke", origStroke);
        }
      } else {
        el.setAttribute("stroke-width", "2");
        el.setAttribute("fill", "#060913");
        let origStroke = "#00f2fe";
        if (n === "router" || n === "wan" || n === "r-branch" || n === "hq-core" || n === "hq-server") {
          origStroke = "#10b981";
        } else if (n === "firewall" || n === "fw-branch") {
          origStroke = "#ff5e3a";
        }
        el.setAttribute("stroke", origStroke);
      }
    }
  });
}

const deviceConfigs = {
  pc: `
<strong style="color: #00f2fe; font-size: 13px;">💻 Device: Host PC (End Station)</strong>
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<strong>IP Address:</strong> 192.168.1.10
<strong>Subnet Mask:</strong> 255.255.255.0
<strong>Default Gateway:</strong> 192.168.1.1 (R-1)
<strong>MAC Address:</strong> 0050.7966.6800
<strong>NIC Status:</strong> UP (1000BASE-T Full)
<strong>Active Connections:</strong> TCP 192.168.1.10:49152 -> 8.8.8.8:80 (ESTABLISHED)
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<span style="color: #10b981;">💡 CCNA Command Tip:</span>
Use <code>ipconfig /all</code> to inspect network adapters, and <code>arp -a</code> to view the local ARP table.
  `,
  switch: `
<strong style="color: #00f2fe; font-size: 13px;">🎛️ Device: Switch SW-1 (Catalyst 2960)</strong>
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<strong>VLAN Database:</strong>
  - VLAN 10 (LAN Users): Ports Fa0/1, Fa0/2
  - VLAN 99 (Management): IP 192.168.1.250/24
<strong>Spanning Tree Protocol (STP):</strong>
  - Mode: PVST+ (Rapid)
  - Bridge ID Priority: 32768 (MAC: 00e0.f901.abcd)
  - Status: Root Bridge for VLAN 10
<strong>MAC Address Table:</strong>
  - 0050.7966.6800 -> Port Fa0/1 [Dynamic, Age: 42s]
  - 0011.2233.4455 -> Port Gi0/1 [Dynamic, Age: 120s]
  - 55aa.bbcc.ddee -> Port Gi0/2 [Dynamic, Age: 88s]
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<span style="color: #10b981;">💡 CCNA Command Tip:</span>
Use <code>show mac address-table</code> to verify bridging learning, and <code>show vlan brief</code> to view port memberships.
  `,
  router: `
<strong style="color: #00f2fe; font-size: 13px;">🌐 Device: Router R-1 (Cisco ISR 4331)</strong>
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<strong>Interfaces:</strong>
  - Gi0/0/0 (LAN Gateway): 192.168.1.1/24 (UP) - <i>ip helper-address 10.10.10.1</i>
  - Gi0/0/1 (WAN Uplink): 192.168.1.2/30 (UP) - <i>ip nat outside</i>
<strong>Routing Table (OSPF Area 0):</strong>
  - C 192.168.1.0/24 is directly connected, Gi0/0/0
  - C 192.168.1.2/30 is directly connected, Gi0/0/1
  - O*E2 0.0.0.0/0 [110/1] via 192.168.1.2, 00:45:12, Gi0/0/1
<strong>Dynamic NAT Table:</strong>
  - Inside Local: 192.168.1.10:49152 <-> Inside Global: 192.168.1.2:1024
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<span style="color: #10b981;">💡 CCNA Command Tip:</span>
Use <code>show ip route</code> to inspect routing decisions, and <code>show ip interface brief</code> to verify line protocol status.
  `,
  firewall: `
<strong style="color: #00f2fe; font-size: 13px;">🔒 Device: Firewall FW-1 (Cisco ASA 5506-X)</strong>
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<strong>Security Zones:</strong>
  - Inside (Gi1/1): Security Level 100 (Trust) - IP: 192.168.1.254/24
  - Outside (Gi1/2): Security Level 0 (Untrust) - IP: 192.168.1.3/30
<strong>Active Access-Control List (OUTSIDE_IN):</strong>
  - 10 permit tcp any host 192.168.1.10 eq 80 (HTTP)
  - 20 permit tcp any host 192.168.1.10 eq 443 (HTTPS)
  - 30 deny tcp any any eq 23 (Telnet block) [Matches: 14 hits]
  - 40 deny ip any any (Implicit Deny)
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<span style="color: #10b981;">💡 CCNA Command Tip:</span>
Use <code>show access-list</code> to check rule hit-counts, and <code>show conn</code> to audit stateful sessions.
  `,
  wan: `
<strong style="color: #00f2fe; font-size: 13px;">☁️ WAN Cloud Server (Destination 8.8.8.8)</strong>
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<strong>Endpoint IP:</strong> 8.8.8.8 (Google DNS / Public Web Host)
<strong>Autonomous System:</strong> AS 15169 (Google LLC)
<strong>BGP Peerings:</strong> Established with ISP Edge Routers
<strong>Supported Protocols:</strong> ICMP (Echo), TCP (80, 443), UDP (53)
<strong>Route Path:</strong> 192.168.1.2 -> ISP Edge AS65001 -> Core WAN -> 8.8.8.8
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<span style="color: #10b981;">💡 CCNA Command Tip:</span>
Use <code>tracert 8.8.8.8</code> to map the TTL-expired ICMP hops traversing Internet Autonomous Systems.
  `,
  "pc-sales": `
<strong style="color: #00f2fe; font-size: 13px;">💻 Device: Sales PC (VLAN 10 client)</strong>
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<strong>IP Address:</strong> 10.10.10.10
<strong>Subnet Mask:</strong> 255.255.255.0
<strong>Default Gateway:</strong> 10.10.10.1 (R-Branch subinterface Gi0/0.10)
<strong>MAC Address:</strong> 00aa.bbcc.1010
<strong>Active Port:</strong> SW-Branch port Fa0/1 (VLAN 10)
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<span style="color: #10b981;">💡 CCNA Command Tip:</span>
On Windows clients, use <code>route print</code> to verify default gateway settings, and <code>ipconfig /renew</code> to acquire fresh DHCP bindings.
  `,
  "ip-phone": `
<strong style="color: #00f2fe; font-size: 13px;">📞 Device: Voice IP Phone (VLAN 20 voice client)</strong>
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<strong>IP Address:</strong> 10.10.20.10
<strong>Subnet Mask:</strong> 255.255.255.0
<strong>Default Gateway:</strong> 10.10.20.1 (R-Branch subinterface Gi0/0.20)
<strong>MAC Address:</strong> 00bb.ccdd.2020
<strong>Active Port:</strong> SW-Branch port Fa0/2 (VLAN 20 - Voice VLAN)
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<span style="color: #10b981;">💡 CCNA Command Tip:</span>
Use <code>show interface &lt;id&gt; switchport</code> on the switch to verify that a port has both a data VLAN and a voice VLAN tag assigned.
  `,
  "sw-branch": `
<strong style="color: #00f2fe; font-size: 13px;">🎛️ Device: Branch Switch SW-Branch (Catalyst 2960)</strong>
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<strong>Interface Configurations:</strong>
  - Fa0/1: Access VLAN 10 (Sales PC)
  - Fa0/2: Access VLAN 10, Voice VLAN 20 (IP Phone)
  - Gi0/1: 802.1Q Trunk to R-Branch (Allowed: 10,20)
<strong>802.1Q Native VLAN:</strong> VLAN 1 (Default)
<strong>VLAN Database:</strong>
  - VLAN 10: Sales (10.10.10.0/24)
  - VLAN 20: Voice (10.10.20.0/24)
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<span style="color: #10b981;">💡 CCNA Command Tip:</span>
Use <code>switchport trunk allowed vlan add &lt;vlan&gt;</code> to specify active broadcast boundaries over trunks, protecting switch backplane performance.
  `,
  "r-branch": `
<strong style="color: #00f2fe; font-size: 13px;">🌐 Device: Branch Router R-Branch (ISR 4321)</strong>
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<strong>Router-on-a-Stick Subinterfaces:</strong>
  - Gi0/0.10 (VLAN 10): 10.10.10.1/24 (encapsulation dot1Q 10)
  - Gi0/0.20 (VLAN 20): 10.10.20.1/24 (encapsulation dot1Q 20)
<strong>EtherChannel LACP Config:</strong>
  - Port-Channel 1: Gi0/1, Gi0/2 (mode active)
  - IP Address Po1: 192.168.100.1/30
<strong>Crypto Map Config (VPN):</strong>
  - crypto map MYMAP 10 ipsec-isakmp
  - match address VPN_ACL (permit 10.10.10.0/24 to 172.16.100.0/24)
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<span style="color: #10b981;">💡 CCNA Command Tip:</span>
Use <code>show interface port-channel 1</code> to audit bundle status, and <code>show crypto ipsec sa</code> to check active security tunnels.
  `,
  "hq-core": `
<strong style="color: #00f2fe; font-size: 13px;">🎛️ Device: HQ Core L3 Switch (Catalyst 3850)</strong>
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<strong>EtherChannel Config:</strong>
  - Port-Channel 1: Gi1/0/1, Gi1/0/2 (mode active - LACP)
  - IP Address: 192.168.100.2/30 (no switchport)
<strong>Routing Table (OSPF Area 0):</strong>
  - O 10.10.10.0/24 [110/2] via 192.168.100.1
  - C 172.16.100.0/24 is directly connected, Gi1/0/24
<strong>Inter-VLAN SVI Interfaces:</strong>
  - Interface VLAN 100: 172.16.100.1/24
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<span style="color: #10b981;">💡 CCNA Command Tip:</span>
Use <code>show etherchannel summary</code> to audit LACP member ports. State code (P) means bundled, (D) means down/suspended.
  `,
  "fw-branch": `
<strong style="color: #00f2fe; font-size: 13px;">🔒 Device: HQ Firewall FW-Branch (ASA 5515)</strong>
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<strong>IPSec VPN Tunnel Configuration:</strong>
  - Crypto map outside_map 10 match VPN_ACL
  - Peer IP address: 192.0.2.1 (R-Branch outside IP)
  - Transform Set: ESP-AES-256 ESP-SHA-HMAC
<strong>Security Policies:</strong>
  - permit esp any any
  - permit udp any any eq 500 (ISAKMP)
  - permit udp any any eq 4500 (NAT Traversal)
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<span style="color: #10b981;">💡 CCNA Command Tip:</span>
Use <code>show crypto isakmp sa</code> to inspect Phase 1 negotiation state (should read MM_ACTIVE).
  `,
  "hq-server": `
<strong style="color: #00f2fe; font-size: 13px;">🖥️ Device: HQ Server (Private Datacenter Host)</strong>
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<strong>IP Address:</strong> 172.16.100.5
<strong>Subnet Mask:</strong> 255.255.255.0
<strong>Default Gateway:</strong> 172.16.100.1 (HQ-Core switch)
<strong>Supported Services:</strong> HTTPS (443), SSH (22), Database (3306)
<strong>Access Policy:</strong> Private subnets only (VPN/Trunk routing required)
<hr style="border-color: rgba(255,255,255,0.08); margin: 6px 0;" />
<span style="color: #10b981;">💡 CCNA Command Tip:</span>
Server hosting requires static routing or local gateway configuration. Audit with <code>netstat -ano</code> to view active listening ports.
  `
};

function renderCLI(nodeName) {
  const container = byId("nodeConfigContent");
  if (!container) return;

  const isTrouble = byId("chkTroubleshooting")?.checked;
  const currentPacketType = byId("simPacketType")?.value;
  const bug = bugsData[currentPacketType];

  if (isTrouble && bug && bug.node === nodeName && !state.simBugsFixed[currentPacketType]) {
    let optionsHtml = bug.options.map((opt, idx) => `
      <option value="${idx}">${opt.label}</option>
    `).join("");

    container.innerHTML = `
      <div style="background:#090d16; border:1px solid #ff5e3a; padding:12px; border-radius:8px;">
        <div style="color:#ff5e3a; font-weight:bold; margin-bottom:6px; font-size:13px; text-transform:uppercase;">⚠ TROUBLESHOOTING INJECTOR - ${nodeName.toUpperCase()}</div>
        <p style="margin:0 0 10px 0; color:#cbd5e1; font-size:12.5px;">${bug.desc}</p>
        <div style="background:#000; padding:8px; border-radius:4px; font-family:var(--font-mono); color:#f87171; font-size:11px; margin-bottom:12px; white-space:pre-wrap;">% Error Log: ${bug.errorLog}</div>
        
        <div style="display:flex; flex-direction:column; gap:8px;">
          <label style="font-size:11px; color:#94a3b8; font-weight:bold;">Select correct Cisco configuration to apply:</label>
          <select id="cliTroubleFixSelect" style="width:100%; font-family:var(--font-mono); font-size:11px; background:#111827; border:1px solid #374151; color:#fff; padding:6px; border-radius:6px;">
            ${optionsHtml}
          </select>
          <button id="btnApplyTroubleFix" class="primary" style="align-self:flex-start; margin-top:4px; padding:6px 14px; font-size:11.5px; border-radius:6px;">Apply Configuration</button>
        </div>
        
        <div style="display:flex; flex-direction:column; gap:8px; margin-top:14px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:12px;">
          <label style="font-size:11px; color:#94a3b8; font-weight:bold;">Or type the exact Cisco configuration command manually (supports aliases like "int gi0/0"):</label>
          <input type="text" id="cliTroubleTypedInput" placeholder="e.g. interface GigabitEthernet0/0/0" style="width:100%; font-family:var(--font-mono); font-size:11px; background:#111827; border:1px solid #374151; color:#fff; padding:6px; border-radius:6px;" />
          <button id="btnApplyTypedTroubleFix" class="secondary" style="align-self:flex-start; padding:6px 14px; font-size:11.5px; border-radius:6px;">Submit Command</button>
        </div>
        
        <div id="cliTroubleResult" style="margin-top:12px; font-family:var(--font-mono); font-size:11px; white-space:pre-wrap; display:none;"></div>
      </div>
    `;

    const btnApply = byId("btnApplyTroubleFix");
    if (btnApply) {
      btnApply.addEventListener("click", () => {
        const select = byId("cliTroubleFixSelect");
        const selectedIdx = select.value;
        const option = bug.options[selectedIdx];
        const resultDiv = byId("cliTroubleResult");

        if (option.correct) {
          playNetSound("success");
          state.simBugsFixed[currentPacketType] = true;
          
          if (resultDiv) {
            resultDiv.style.display = "block";
            resultDiv.style.color = "#10b981";
            resultDiv.innerHTML = `
${nodeName.toUpperCase()}# configure terminal
Enter configuration commands, one per line. End with CNTL/Z.
${nodeName.toUpperCase()}(config)# ${option.cmd.trim().replace(/\n/g, '\n' + nodeName.toUpperCase() + '(config)# ')}
${nodeName.toUpperCase()}(config)# end
${nodeName.toUpperCase()}# write memory
% Building configuration...
% [OK] Configuration applied successfully. Status: synchronized.
✔ Bug resolved! +30 XP rewarded.
            `;
          }
          
          gainXP(30);
          
          setTimeout(() => {
            renderCLI(nodeName);
          }, 2500);
        } else {
          playNetSound("block");
          if (resultDiv) {
            resultDiv.style.display = "block";
            resultDiv.style.color = "#ff5e3a";
            resultDiv.innerHTML = `
${nodeName.toUpperCase()}# configure terminal
${nodeName.toUpperCase()}(config)# ${option.cmd.trim().replace(/\n/g, '\n' + nodeName.toUpperCase() + '(config)# ')}
% Invalid command configuration. Rejected by Cisco IOS CLI syntax analyzer.
            `;
          }
        }
      });
    }

    const btnApplyTyped = byId("btnApplyTypedTroubleFix");
    if (btnApplyTyped) {
      btnApplyTyped.addEventListener("click", () => {
        const typedInput = byId("cliTroubleTypedInput");
        const val = typedInput.value.trim().toLowerCase();
        const resultDiv = byId("cliTroubleResult");
        if (!val) return;
        
        const correctOption = bug.options.find(o => o.correct);
        if (!correctOption) return;
        
        const cleanTyped = val.replace(/\s+/g, " ")
                            .replace(/^interface\s/, "int ")
                            .replace(/^gigabitethernet/, "gi")
                            .replace(/^fastethernet/, "fa")
                            .replace(/^ethernet/, "eth")
                            .replace(/^shutdown/, "shut")
                            .replace(/^no shutdown/, "no shut");
                            
        const cleanCorrect = correctOption.cmd.toLowerCase().replace(/\s+/g, " ")
                            .replace(/^interface\s/, "int ")
                            .replace(/^gigabitethernet/, "gi")
                            .replace(/^fastethernet/, "fa")
                            .replace(/^ethernet/, "eth")
                            .replace(/^shutdown/, "shut")
                            .replace(/^no shutdown/, "no shut");
                            
        const typedLines = cleanTyped.split(/\s*\\n\s*|\s*\n\s*/);
        const correctLines = cleanCorrect.split(/\s*\\n\s*|\s*\n\s*/);
        
        let allMatch = typedLines.length === correctLines.length && typedLines.every((line, idx) => {
          return line.trim() === correctLines[idx].trim();
        });
        
        if (allMatch) {
          playNetSound("success");
          state.simBugsFixed[currentPacketType] = true;
          if (resultDiv) {
            resultDiv.style.display = "block";
            resultDiv.style.color = "#10b981";
            resultDiv.innerHTML = `
${nodeName.toUpperCase()}# configure terminal
Enter configuration commands, one per line. End with CNTL/Z.
${nodeName.toUpperCase()}(config)# ${correctOption.cmd.trim().replace(/\n/g, '\n' + nodeName.toUpperCase() + '(config)# ')}
${nodeName.toUpperCase()}(config)# end
${nodeName.toUpperCase()}# write memory
% Building configuration...
% [OK] Configuration applied successfully. Status: synchronized.
✔ Bug resolved! +30 XP rewarded.
            `;
          }
          gainXP(30);
          setTimeout(() => { renderCLI(nodeName); }, 2500);
        } else {
          playNetSound("block");
          if (resultDiv) {
            resultDiv.style.display = "block";
            resultDiv.style.color = "#ff5e3a";
            resultDiv.innerHTML = `% Invalid command: "${typedInput.value}"\nRejected by Cisco IOS CLI parser. (Hint: check correct command syntax/options)`;
          }
        }
      });
    }
  } else {
    const cmdList = cliOutputs[nodeName];
    if (!cmdList) {
      container.innerHTML = `
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
          <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); padding:12px; border-radius:8px;">
            ${deviceConfigs[nodeName] || 'No configuration data available.'}
          </div>
          <div style="background:#090d16; border:1px solid rgba(255,255,255,0.08); padding:12px; border-radius:8px; display:flex; justify-content:center; align-items:center; color:var(--text-muted); font-style:italic; font-size:11.5px;">
            CLI terminal access disabled / not supported on WAN endpoints.
          </div>
        </div>
      `;
      return;
    }

    const commandOptions = Object.keys(cmdList).map(cmd => `
      <option value="${cmd}">${cmd}</option>
    `).join("");

    container.innerHTML = `
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
        <!-- Left: Static Config Info -->
        <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); padding:12px; border-radius:8px; font-size:11.5px; line-height:1.5; color:#94a3b8;">
          ${deviceConfigs[nodeName] || 'No configuration data available.'}
        </div>
        
        <!-- Right: Interactive CLI Console -->
        <div style="background:#090d16; border:1px solid rgba(255,255,255,0.08); padding:12px; border-radius:8px; display:flex; flex-direction:column; gap:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="color:#00f2fe; font-size:12px;">Cisco IOS CLI - ${nodeName.toUpperCase()}</strong>
            <span style="font-family:var(--font-mono); font-size:10.5px; color:#10b981;">STATUS: Online</span>
          </div>
          
          <div style="display:flex; gap:8px; align-items:center;">
            <span style="font-family:var(--font-mono); font-size:11px; color:#cbd5e1;">${nodeName.toUpperCase()}#</span>
            <select id="cliCommandSelect" style="flex:1; font-family:var(--font-mono); font-size:11px; background:#111827; border:1px solid #374151; color:#fff; padding:6px; border-radius:6px;">
              <option value="">-- Run show command --</option>
              ${commandOptions}
            </select>
          </div>

          <div id="cliOutputTerminal" style="background:#000; border:1px solid rgba(255,255,255,0.05); padding:10px; border-radius:6px; font-family:var(--font-mono); color:#a7f3d0; font-size:11px; height:120px; overflow-y:auto; white-space:pre-wrap;">${nodeName.toUpperCase()}# </div>
        </div>
      </div>
    `;

    const select = byId("cliCommandSelect");
    const terminal = byId("cliOutputTerminal");
    if (select && terminal) {
      select.addEventListener("change", () => {
        const cmd = select.value;
        if (!cmd) {
          terminal.innerHTML = `${nodeName.toUpperCase()}# `;
          return;
        }
        playNetSound("click");
        const output = cmdList[cmd];
        terminal.innerHTML = `${nodeName.toUpperCase()}# ${cmd}\n${output}`;
        terminal.scrollTop = terminal.scrollHeight;
      });
    }
  }
}

function setupNodeConfigInspector() {
  const nodes = document.querySelectorAll(".topo-node");
  if (!nodes) return;

  nodes.forEach(node => {
    node.addEventListener("click", () => {
      playNetSound("click");
      const nodeName = node.getAttribute("data-node");
      state.inspectedNode = nodeName;
      
      document.querySelectorAll(".topo-node").forEach(el => {
        el.classList.remove("inspected");
      });
      node.classList.add("inspected");
      setTimeout(() => {
        node.classList.remove("inspected");
      }, 1500);

      renderCLI(nodeName);
    });
  });
}

// Global active topology state
let activeTopology = 1;

function resetTopology2Links() {
  const link1 = byId("link-rbranch-hq1");
  const link2 = byId("link-rbranch-hq2");
  if (link1) {
    link1.setAttribute("stroke", "#10b981");
    link1.setAttribute("stroke-width", "2");
  }
  if (link2) {
    link2.setAttribute("stroke", "#10b981");
    link2.setAttribute("stroke-width", "2");
  }
  const statusLink1 = byId("status-lacp-link1");
  if (statusLink1) {
    statusLink1.setAttribute("fill", "#10b981");
  }
}

function setupTraversalSimulator() {
  const btnStart = byId("btnStartSim");
  const btnReset = byId("btnResetSim");
  const logContent = byId("simLogContent");
  
  const btnTopo1 = byId("btnTopo1");
  const btnTopo2 = byId("btnTopo2");
  const svg1 = byId("topoSvg");
  const svg2 = byId("topoSvg2");

  if (!btnStart || !btnReset || !logContent) return;

  const sleep = (ms) => new Promise(res => setTimeout(res, ms));

  setupNodeConfigInspector();

  // OSI Stack click handlers
  document.querySelectorAll(".osi-layer").forEach(layerEl => {
    layerEl.addEventListener("click", () => {
      playNetSound("click");
      document.querySelectorAll(".osi-layer").forEach(el => el.classList.remove("active"));
      layerEl.classList.add("active");
      const layerNum = layerEl.getAttribute("data-layer");
      showOsiLayerDetail(layerNum);
    });
  });

  // Dynamic selector updates
  function updatePacketTypeSelect() {
    const select = byId("simPacketType");
    if (!select) return;
    select.innerHTML = "";
    
    if (activeTopology === 1) {
      select.innerHTML = `
        <option value="dhcp">DHCP Request (Broadcast Drill)</option>
        <option value="ping">ICMP Echo Request (Ping to 8.8.8.8)</option>
        <option value="nat">HTTP Web Request (NAT Overload PAT)</option>
        <option value="stp">STP BPDU Frame (Switch STP Election)</option>
        <option value="arp">ARP Request/Reply (MAC Address Resolution)</option>
        <option value="ospf">OSPF Hello Adjacency (Link State Update)</option>
        <option value="acl">Firewall ACL Block (Telnet Access Denied)</option>
      `;
    } else {
      select.innerHTML = `
        <option value="roas">Router-on-a-Stick (ROAS Inter-VLAN Routing)</option>
        <option value="lacp">LACP EtherChannel (Link Bundling & Failover)</option>
        <option value="vpn">IPSec VPN Tunnel (Site-to-Site Encapsulation)</option>
      `;
    }
  }

  function switchTopology(topoNum) {
    activeTopology = topoNum;
    playNetSound("click");
    
    btnStart.disabled = false;
    const pkt1 = byId("simPacket");
    const pkt2 = byId("simPacket2");
    if (pkt1) pkt1.style.opacity = "0";
    if (pkt2) pkt2.style.opacity = "0";
    
    logContent.innerHTML = "<div>System Ready. Select a packet simulation and click 'Run Simulation'.</div>";
    currentOsiData = null;
    updateOsiLabels(null);
    const descBox = byId("osiLayerDescBox");
    if (descBox) {
      descBox.innerHTML = `<span style="color: var(--text-muted); font-style: italic;">Run a simulation and click any OSI layer tab above to inspect the active hop encapsulation details.</span>`;
    }
    document.querySelectorAll(".osi-layer").forEach(el => el.classList.remove("active"));
    highlightNode(null);
    resetTopology2Links();

    if (activeTopology === 1) {
      if (svg1) svg1.style.display = "block";
      if (svg2) svg2.style.display = "none";
      if (btnTopo1) { btnTopo1.className = "primary"; }
      if (btnTopo2) { btnTopo2.className = "secondary"; }
    } else {
      if (svg1) svg1.style.display = "none";
      if (svg2) svg2.style.display = "block";
      if (btnTopo1) { btnTopo1.className = "secondary"; }
      if (btnTopo2) { btnTopo2.className = "primary"; }
    }
    
    updatePacketTypeSelect();
  }

  if (btnTopo1) btnTopo1.addEventListener("click", () => switchTopology(1));
  if (btnTopo2) btnTopo2.addEventListener("click", () => switchTopology(2));

  btnStart.addEventListener("click", async () => {
    btnStart.disabled = true;
    const type = byId("simPacketType").value;
    const activePkt = activeTopology === 1 ? byId("simPacket") : byId("simPacket2");
    if (!activePkt) return;

    // Reset member links in case of LACP simulation rerun
    resetTopology2Links();

    const isTrouble = byId("chkTroubleshooting")?.checked;
    const bug = bugsData[type];
    const isBugActive = isTrouble && bug && !state.simBugsFixed[type];

    let path = [];
    if (type === "dhcp") {
      path = [
        {
          node: "pc", x: 80, y: 140, name: "Host PC", color: "#00f2fe",
          headers: "L2: Broadcast | L3: 0.0.0.0 -> 255.255.255.255 | UDP: 68 -> 67",
          desc: "Host PC has no IP address yet. It broadcasts a <strong>DHCPDISCOVER</strong> packet out of its interface to request local configurations.",
          osi: {
            l4: { val: "UDP 68 -> 67", desc: "UDP Transport layer: Client port 68 communicates with server port 67." },
            l3: { val: "0.0.0.0 -> 255.255.255.255", desc: "IP Network layer: Source is 0.0.0.0 (DHCP client holds no IP) and Destination is 255.255.255.255 (local broadcast)." },
            l2: { val: "0050.7966.6800 -> FFFF.FFFF.FFFF", desc: "Ethernet Data Link layer: Frame carries source MAC address and targets the broadcast address FFFF.FFFF.FFFF." },
            l1: { val: "Copper Ethernet (Fa0/1)", desc: "Physical Layer: Electrical signals travel through Cat6 Twisted Pair copper wiring at 100 Mbps (Full Duplex)." }
          }
        },
        {
          node: "switch", x: 240, y: 140, name: "Switch SW-1", color: "#00f2fe",
          headers: "L2: Broadcast MAC | VLAN: Tag 10",
          desc: "SW-1 receives the Layer 2 broadcast. Since it is a broadcast MAC destination, the switch floods the frame out all active access ports within VLAN 10.",
          osi: {
            l4: { val: "UDP 68 -> 67", desc: "UDP segment remains encapsulated inside the IP packet." },
            l3: { val: "0.0.0.0 -> 255.255.255.255", desc: "Layer 3 payload is not examined by the Layer 2 switch." },
            l2: { val: "0050.7966.6800 -> FFFF.FFFF.FFFF", desc: "SW-1 checks its MAC table. Finding a broadcast destination, it floods the frame to all active ports on VLAN 10." },
            l1: { val: "Trunk Link (Gi0/1)", desc: "Trunk connection transmits frame with an 802.1Q tag identifying it as VLAN 10." }
          }
        },
        {
          node: "router", x: 400, y: 80, name: "Core Router R-1", color: "#10b981",
          headers: "L2: Router Interface -> Unicast Gateway | L3: 192.168.1.1 -> 10.10.10.1",
          desc: "R-1 intercepts the broadcast. Since <code>ip helper-address 10.10.10.1</code> is configured, R-1 decapsulates the L2 broadcast, updates Src/Dst IPs, and routes it to the WAN as a unicast packet.",
          osi: {
            l4: { val: "UDP 67 -> 67", desc: "UDP layer: R-1 decapsulates the packet and acts as a DHCP Relay agent (helper address)." },
            l3: { val: "192.168.1.1 -> 10.10.10.1", desc: "R-1 updates the Source IP to its gateway IP (192.168.1.1) and unicasts the packet to the DHCP Server (10.10.10.1)." },
            l2: { val: "0011.2233.4455 -> WAN MAC", desc: "Data Link Layer: Re-encapsulated with WAN interface Source MAC and WAN Gateway Destination MAC." },
            l1: { val: "Gigabit WAN (Gi0/2)", desc: "Physical transmission: Fiber/Copper carrier link towards WAN Gateway." }
          }
        },
        {
          node: "wan", x: 600, y: 140, name: "WAN Gateway", color: "#10b981",
          headers: "L2: Unicast WAN | L3: 10.10.10.1 -> 10.10.10.10 | UDP: 67 -> 68",
          desc: "The DHCP server receives the request, reserves an IP, and replies back with a <strong>DHCPOFFER</strong>. The configuration returns back along the path.",
          osi: {
            l4: { val: "UDP 67 -> 68", desc: "The DHCP server processes the request, reserves an IP config, and replies with a DHCPOFFER segment." },
            l3: { val: "10.10.10.10 -> 192.168.1.1", desc: "IP Layer: Source is Server (10.10.10.10) and Destination is R-1's relay IP (192.168.1.1)." },
            l2: { val: "WAN MAC -> 0011.2233.4455", desc: "WAN Layer 2 encapsulation handles unicast forwarding back to the router's outside WAN interface." },
            l1: { val: "WAN Carrier", desc: "Physical: Transit across public WAN infrastructure." }
          }
        }
      ];
    } else if (type === "ping") {
      path = [
        {
          node: "pc", x: 80, y: 140, name: "Host PC", color: "#00f2fe",
          headers: "L2: Unicast Gateway | L3: 192.168.1.10 -> 8.8.8.8 | ICMP: Type 8 Code 0",
          desc: "Host PC initiates an ICMP Echo Request (Ping) to Google DNS. Since the destination is on a foreign subnet, the PC targets the default gateway MAC address.",
          osi: {
            l4: { val: "ICMP Type 8 Code 0", desc: "ICMP Protocol: Echo Request packet created to verify end-to-end IP reachability." },
            l3: { val: "192.168.1.10 -> 8.8.8.8", desc: "IP Layer: Dest IP (8.8.8.8) is outside local subnet; routing table targets default gateway 192.168.1.1." },
            l2: { val: "0050.7966.6800 -> 0011.2233.4455", desc: "Ethernet Frame: Source MAC is Host, Destination MAC is R-1's gateway interface (resolved via ARP)." },
            l1: { val: "Copper Ethernet (Fa0/1)", desc: "Physical Layer: Tx over copper Cat5e cabling." }
          }
        },
        {
          node: "switch", x: 240, y: 140, name: "Switch SW-1", color: "#00f2fe",
          headers: "L2: Forwarding to R-1 Uplink",
          desc: "SW-1 queries its MAC address table. It finds R-1's MAC address on the uplink trunk interface and forwards the frame directly.",
          osi: {
            l4: { val: "ICMP Type 8 Code 0", desc: "ICMP payload is carried transparently." },
            l3: { val: "192.168.1.10 -> 8.8.8.8", desc: "Layer 3 IP headers are unread by the bridge." },
            l2: { val: "0050.7966.6800 -> 0011.2233.4455", desc: "SW-1 checks its MAC table. Finds R-1's MAC on Gi0/1 and forwards the frame directly." },
            l1: { val: "Trunk Link (Gi0/1)", desc: "Physical: Gigabit Ethernet uplink trunk." }
          }
        },
        {
          node: "router", x: 400, y: 80, name: "Core Router R-1", color: "#10b981",
          headers: "L3: Route Lookup LPM | WAN Interface",
          desc: "R-1 decapsulates Layer 2. It performs a Routing Table lookup. Finding a route for 8.8.8.8/32 via OSPF/Static towards WAN, it re-encapsulates the frame and sends it.",
          osi: {
            l4: { val: "ICMP Type 8 Code 0", desc: "ICMP payload is carried transparently." },
            l3: { val: "192.168.1.10 -> 8.8.8.8", desc: "R-1 decapsulates L2, performs LPM route lookup, matches default route 0.0.0.0/0 via Gi0/1 WAN interface." },
            l2: { val: "0011.2233.4455 -> ISP MAC", desc: "L2 header rewritten: Source is R-1 WAN MAC, Destination is next-hop ISP gateway MAC." },
            l1: { val: "Fiber WAN (Gi0/1)", desc: "Physical: WAN optical transceiver conversion." }
          }
        },
        {
          node: "wan", x: 600, y: 140, name: "WAN Server", color: "#10b981",
          headers: "L3: 8.8.8.8 -> 192.168.1.10 | ICMP: Type 0 Code 0 (Echo Reply)",
          desc: "Google Server processes the ping request and replies back with an <strong>ICMP Echo Reply</strong>, returning the expected <code>!!!!!</code> output in the console.",
          osi: {
            l4: { val: "ICMP Type 0 Code 0", desc: "ICMP Protocol: Server receives Echo Request and responds with an Echo Reply." },
            l3: { val: "8.8.8.8 -> 192.168.1.10", desc: "IP Layer: Source is 8.8.8.8, Destination is the PC IP (returning back through NAT/PAT router)." },
            l2: { val: "ISP MAC -> 0011.2233.4455", desc: "Data Link: Framed for return delivery to the Router's WAN interface." },
            l1: { val: "WAN Fiber", desc: "Physical: Optical link transit." }
          }
        }
      ];
    } else if (type === "nat") {
      path = [
        {
          node: "pc", x: 80, y: 140, name: "Host PC", color: "#00f2fe",
          headers: "L3: 192.168.1.10 -> 8.8.8.8 | TCP Src Port 49152 -> Dst Port 80 (HTTP)",
          desc: "PC requests a webpage. It allocates a random private source port (49152) and initiates a TCP handshake request.",
          osi: {
            l4: { val: "TCP 49152 -> 80", desc: "TCP Layer: Random high-source port 49152 initiates a 3-way handshake (SYN) to HTTP port 80." },
            l3: { val: "192.168.1.10 -> 8.8.8.8", desc: "IP Layer: Private inside source IP targeted to public web server." },
            l2: { val: "0050.7966.6800 -> 0011.2233.4455", desc: "Ethernet Frame directed to default gateway." },
            l1: { val: "Copper Ethernet (Fa0/1)", desc: "Physical Layer: Local LAN copper cabling." }
          }
        },
        {
          node: "switch", x: 240, y: 140, name: "Switch SW-1", color: "#00f2fe",
          headers: "L2: Forwarding to R-1",
          desc: "SW-1 forwards the frame directly towards the Core Router gateway port.",
          osi: {
            l4: { val: "TCP 49152 -> 80", desc: "TCP segment encapsulated." },
            l3: { val: "192.168.1.10 -> 8.8.8.8", desc: "IP header untouched." },
            l2: { val: "0050.7966.6800 -> 0011.2233.4455", desc: "Forwarded via MAC table entry for R-1." },
            l1: { val: "Uplink trunk", desc: "Physical: LAN uplink." }
          }
        },
        {
          node: "router", x: 400, y: 80, name: "Core Router R-1", color: "#10b981",
          headers: "L3 NAT Translation: 192.168.1.10:49152 -> 192.168.1.2:1024 | TCP Src Port translated to 1024",
          desc: "R-1 performs <strong>Network Address Translation (NAT Overload/PAT)</strong>. It translates the private source IP to the public WAN IP, and maps the port to 1024 to support multiple internal hosts.",
          osi: {
            l4: { val: "TCP 1024 -> 80", desc: "TCP Layer: Source Port translated from 49152 to 1024 (PAT) to uniquely map the local host." },
            l3: { val: "192.168.1.2 -> 8.8.8.8", desc: "IP Layer: Source IP translated from Private (192.168.1.10) to Router WAN Public IP (192.168.1.2)." },
            l2: { val: "0011.2233.4455 -> ISP MAC", desc: "Ethernet: Rewritten with WAN Source MAC." },
            l1: { val: "WAN Uplink", desc: "Physical: WAN transmission." }
          }
        },
        {
          node: "wan", x: 600, y: 140, name: "WAN Web Server", color: "#10b981",
          headers: "L3: 8.8.8.8 -> 192.168.1.2 | L4: TCP Src 80 -> Dst 1024",
          desc: "The public server receives the request, processes the TCP segment, and responds back to public gateway IP 192.168.1.2. R-1 will translate this back to the private host.",
          osi: {
            l4: { val: "TCP 80 -> 1024", desc: "TCP Layer: Web Server replies with TCP SYN-ACK segment to translated port 1024." },
            l3: { val: "8.8.8.8 -> 192.168.1.2", desc: "IP Layer: Destined to the Router's public IP address. R-1 will translate it back to the PC." },
            l2: { val: "ISP MAC -> WAN MAC", desc: "Data Link: Unicast delivery to router's outside MAC." },
            l1: { val: "WAN Carrier", desc: "Physical: Public WAN transit." }
          }
        }
      ];
    } else if (type === "stp") {
      path = [
        {
          node: "pc", x: 80, y: 140, name: "Host PC", color: "#ff5e3a",
          headers: "STP Status: Edge Port (PortFast)",
          desc: "PC does not process Spanning Tree BPDUs. The switch port is configured with PortFast to transition immediately to the forwarding state.",
          osi: {
            l4: { val: "-", desc: "Not applicable: Spanning Tree operates at Layer 2." },
            l3: { val: "-", desc: "Not applicable: STP does not use Layer 3 IP routing." },
            l2: { val: "-", desc: "STP PortFast: Host PC interface immediately bypasses Listening/Learning states to prevent DHCP timeouts." },
            l1: { val: "Ethernet copper", desc: "Physical: Link remains active." }
          }
        },
        {
          node: "switch", x: 240, y: 140, name: "Switch SW-1", color: "#00f2fe",
          headers: "L2 BPDU Multicast: 0180.C200.0000 | STP Role: ROOT BRIDGE",
          desc: "SW-1 periodically generates STP BPDUs. Having the lowest Bridge ID, SW-1 is elected as the Root Bridge for VLAN 10.",
          osi: {
            l4: { val: "-", desc: "Not applicable." },
            l3: { val: "-", desc: "Not applicable." },
            l2: { val: "BPDU Bridge Priority 32768", desc: "SW-1 transmits Configuration Bridge Protocol Data Units (BPDUs) to multicast MAC 0180.C200.0000. It claims to be Root Bridge." },
            l1: { val: "Trunk link (Gi0/2)", desc: "Physical: BPDU frames broadcasted out trunk interface." }
          }
        },
        {
          node: "firewall", x: 400, y: 200, name: "Firewall FW-1", color: "#ff5e3a",
          headers: "STP Role: Blocking Port / Non-Root Port",
          desc: "FW-1's backup interface receives the BPDU. To prevent a physical loop in the network, STP transitions this interface to the <strong>Blocking</strong> state.",
          osi: {
            l4: { val: "-", desc: "Not applicable." },
            l3: { val: "-", desc: "Not applicable." },
            l2: { val: "BPDU Blocked", desc: "FW-1's backup interface receives the BPDU. To prevent a physical loop, the interface transitions to the BLOCKING state." },
            l1: { val: "Trunk link", desc: "Physical: Blocking applied logically at port interface." }
          }
        }
      ];
    } else if (type === "arp") {
      path = [
        {
          node: "pc", x: 80, y: 140, name: "Host PC", color: "#00f2fe",
          headers: "L2: MAC Broadcast | L3: ARP Request",
          desc: "Host PC needs to send a packet to a remote address, but doesn't know its gateway's MAC address. It broadcasts an **ARP Request**.",
          osi: {
            l4: { val: "-", desc: "Not applicable: ARP handles IP-to-MAC resolution and has no L4 transport header." },
            l3: { val: "ARP Request (Target IP: 192.168.1.1)", desc: "ARP Protocol: Query payload asking for the MAC address associated with gateway IP 192.168.1.1." },
            l2: { val: "0050.7966.6800 -> FFFF.FFFF.FFFF", desc: "Data Link: Frame sent to Broadcast MAC (FFFF.FFFF.FFFF) to reach all nodes in the local broadcast domain." },
            l1: { val: "Copper Ethernet (Fa0/1)", desc: "Physical: Electrical signals transmitted over Cat6 copper wire." }
          }
        },
        {
          node: "switch", x: 240, y: 140, name: "Switch SW-1", color: "#00f2fe",
          headers: "L2: Flood Broadcast | VLAN: Tag 10",
          desc: "SW-1 receives the broadcast frame, learns Host's MAC on port Fa0/1, and floods the frame out all ports in VLAN 10.",
          osi: {
            l4: { val: "-", desc: "Not applicable." },
            l3: { val: "ARP Request (Target IP: 192.168.1.1)", desc: "ARP request payload unchanged." },
            l2: { val: "0050.7966.6800 -> FFFF.FFFF.FFFF", desc: "SW-1 receives the broadcast frame, learns Host's MAC on port Fa0/1, and floods the frame out all ports in VLAN 10." },
            l1: { val: "Trunk Link (Gi0/1)", desc: "Trunk link transmits frame with VLAN 10 802.1Q header tag." }
          }
        },
        {
          node: "router", x: 400, y: 80, name: "Core Router R-1", color: "#10b981",
          headers: "L2: MAC Unicast Reply | L3: ARP Reply",
          desc: "R-1 identifies itself as the owner of 192.168.1.1 and replies back with an **ARP Reply** containing its MAC address.",
          osi: {
            l4: { val: "-", desc: "Not applicable." },
            l3: { val: "ARP Reply (Sender IP: 192.168.1.1)", desc: "ARP Protocol: R-1 identifies itself as the owner of 192.168.1.1 and compiles an ARP Reply payload." },
            l2: { val: "0011.2233.4455 -> 0050.7966.6800", desc: "Data Link: Frame is unicast directly back to the Host PC MAC address since its location is now known." },
            l1: { val: "Gigabit Ethernet (Gi0/0)", desc: "Physical: Fast transmission over router copper interface." }
          }
        },
        {
          node: "switch", x: 240, y: 140, name: "Switch SW-1", color: "#10b981",
          headers: "L2: Forwarding Unicast Reply",
          desc: "SW-1 checks its MAC table, finds the PC on Fa0/1, and forwards the ARP Reply directly to the PC.",
          osi: {
            l4: { val: "-", desc: "Not applicable." },
            l3: { val: "ARP Reply (Sender IP: 192.168.1.1)", desc: "ARP payload remains encapsulated." },
            l2: { val: "0011.2233.4455 -> 0050.7966.6800", desc: "SW-1 checks its MAC table. Finds 0050.7966.6800 is on port Fa0/1, and forwards the frame only to that port." },
            l1: { val: "Access Link (Fa0/1)", desc: "Physical: Sent down local port Fa0/1 towards Host." }
          }
        },
        {
          node: "pc", x: 80, y: 140, name: "Host PC", color: "#10b981",
          headers: "ARP Cache Updated",
          desc: "The Host PC decapsulates the reply and updates its local ARP table. It can now send unicast packets.",
          osi: {
            l4: { val: "-", desc: "Not applicable." },
            l3: { val: "ARP Reply Processed", desc: "ARP Protocol: PC decapsulates the reply and updates its local ARP Cache table (associates 192.168.1.1 with 0011.2233.4455)." },
            l2: { val: "0011.2233.4455 -> 0050.7966.6800", desc: "Data Link: Unicast frame successfully received and verified." },
            l1: { val: "Copper Ethernet", desc: "Physical: Host NIC receives electrical signals." }
          }
        }
      ];
    } else if (type === "ospf") {
      path = [
        {
          node: "router", x: 400, y: 80, name: "Core Router R-1", color: "#10b981",
          headers: "L2: Multicast MAC | L3: Multicast 224.0.0.5 | OSPF Hello",
          desc: "R-1 multicasts an **OSPF Hello** packet to discover potential neighbors on the local segment. It uses multicast IP 224.0.0.5.",
          osi: {
            l4: { val: "OSPF Protocol 89", desc: "Transport Layer: OSPF runs directly over IP (IP Protocol 89). Sends an OSPF Hello packet." },
            l3: { val: "192.168.1.1 -> 224.0.0.5", desc: "IP Layer: Source IP is R-1, Destination is multicast 224.0.0.5 (All OSPF Routers)." },
            l2: { val: "0011.2233.4455 -> 0100.5E00.0005", desc: "Data Link: IP multicast 224.0.0.5 maps to OSPF multicast MAC 0100.5E00.0005." },
            l1: { val: "Trunk Link (Gi0/1)", desc: "Physical: Gigabit uplink interface." }
          }
        },
        {
          node: "switch", x: 240, y: 140, name: "Switch SW-1", color: "#10b981",
          headers: "L2: OSPF Multicast Forwarding",
          desc: "SW-1 forwards the OSPF multicast packet out all ports participating in OSPF Area 0.",
          osi: {
            l4: { val: "OSPF Protocol 89", desc: "OSPF payload remains encapsulated." },
            l3: { val: "192.168.1.1 -> 224.0.0.5", desc: "IP header untouched." },
            l2: { val: "0011.2233.4455 -> 0100.5E00.0005", desc: "SW-1 forwards OSPF multicast frames to all ports participating in OSPF Area 0." },
            l1: { val: "Trunk Link (Gi0/2)", desc: "Physical: Forwarded out the interface leading to FW-1." }
          }
        },
        {
          node: "firewall", x: 400, y: 200, name: "Firewall FW-1", color: "#ff5e3a",
          headers: "L3: OSPF Adjacency Established",
          desc: "FW-1 validates area configuration parameters, and replies with its Hello packet. Bidirectional relationship (2-WAY state) is established.",
          osi: {
            l4: { val: "OSPF Hello Reply", desc: "OSPF Protocol: FW-1 processes the Hello packet, validates area configurations, and replies with its Hello packet." },
            l3: { val: "192.168.1.254 -> 224.0.0.5", desc: "IP Layer: FW-1 sends OSPF Hello back to multicast address 224.0.0.5." },
            l2: { val: "55aa.bbcc.ddee -> 0100.5E00.0005", desc: "Data Link: Multicast MAC addressing is used to target all neighboring OSPF routers." },
            l1: { val: "Gigabit Link", desc: "Physical: Signals travel over firewall interface." }
          }
        }
      ];
    } else if (type === "acl") {
      path = [
        {
          node: "pc", x: 80, y: 140, name: "Host PC", color: "#00f2fe",
          headers: "L3: 192.168.1.10 -> 8.8.8.8 | TCP Dst Port 23 (Telnet)",
          desc: "Host PC attempts to open a Telnet session (port 23) to a remote server. The packet goes through SW-1.",
          osi: {
            l4: { val: "TCP Src 51234 -> Dst 23", desc: "TCP Layer: Host attempts a connection to Telnet port 23 (unencrypted administration)." },
            l3: { val: "192.168.1.10 -> 8.8.8.8", desc: "IP Layer: Unicast packet targeted to remote server 8.8.8.8." },
            l2: { val: "0050.7966.6800 -> 55aa.bbcc.ddee", desc: "Data Link: Framed to FW-1's inside interface MAC address." },
            l1: { val: "Copper Ethernet (Fa0/1)", desc: "Physical: Data converted into copper Ethernet signals." }
          }
        },
        {
          node: "switch", x: 240, y: 140, name: "Switch SW-1", color: "#00f2fe",
          headers: "L2: Forwarding to FW-1",
          desc: "SW-1 forwards the frame directly towards the default gateway FW-1 based on MAC table mapping.",
          osi: {
            l4: { val: "TCP Src 51234 -> Dst 23", desc: "TCP segment remains encapsulated." },
            l3: { val: "192.168.1.10 -> 8.8.8.8", desc: "IP routing data unread." },
            l2: { val: "0050.7966.6800 -> 55aa.bbcc.ddee", desc: "SW-1 forwards unicast frame directly towards FW-1's interface based on MAC lookup." },
            l1: { val: "Trunk Link (Gi0/2)", desc: "Physical: Gigabit link transit." }
          }
        },
        {
          node: "firewall", x: 400, y: 200, name: "Firewall FW-1", color: "#ff5e3a", isBlocked: true,
          headers: "ACL Denied Rule 30 | PACKET DROPPED",
          desc: "FW-1 inspects the incoming traffic. The rule <code>deny tcp any any eq 23</code> matches. <strong>The packet is dropped immediately.</strong>",
          osi: {
            l4: { val: "TCP Src 51234 -> Dst 23", desc: "TCP segment is inspected. Destination Port 23 matches deny policy." },
            l3: { val: "192.168.1.10 -> 8.8.8.8", desc: "IP Layer: Firewall denies traffic from inside network to outside for Telnet." },
            l2: { val: "0050.7966.6800 -> 55aa.bbcc.ddee", desc: "Data Link: Frame is discarded immediately. No Layer 2 transmission occurs on the WAN uplink." },
            l1: { val: "No Transmission", desc: "Physical Layer: The packet is dropped in memory; no electrical signals are sent on the egress interface." }
          }
        }
      ];
    } else if (type === "roas") {
      path = [
        {
          node: "pc-sales", x: 60, y: 180, name: "Sales PC (VLAN 10)", color: "#00f2fe",
          headers: "L2: Tag 10 | L3: 10.10.10.10 -> 10.10.20.10 | TCP: 51000 -> 80",
          desc: "PC-Sales (VLAN 10) targets a web service on IP-Phone (VLAN 20). Since they are on different subnets, the PC targets its gateway IP 10.10.10.1.",
          osi: {
            l4: { val: "TCP Src 51000 -> Dst 80", desc: "TCP Layer: Client initiates HTTP connection request to voice device." },
            l3: { val: "10.10.10.10 -> 10.10.20.10", desc: "IP Layer: Source IP is Sales client (10.10.10.10), Destination is Phone (10.10.20.10)." },
            l2: { val: "00aa.bbcc.1010 -> Gateway MAC", desc: "Data Link: Frame matches PC-Sales source MAC and targets default gateway interface." },
            l1: { val: "Copper Ethernet (Fa0/1)", desc: "Physical Layer: Tx over Category 6 copper access cable." }
          }
        },
        {
          node: "sw-branch", x: 200, y: 130, name: "SW-Branch Switch", color: "#00f2fe",
          headers: "L2 Trunk: VLAN Tag 10",
          desc: "SW-Branch receives the frame on access port Fa0/1, adds an 802.1Q tag for VLAN 10, and forwards it over the Trunk Gi0/1 uplink towards the router.",
          osi: {
            l4: { val: "TCP Src 51000 -> Dst 80", desc: "Payload remains encapsulated." },
            l3: { val: "10.10.10.10 -> 10.10.20.10", desc: "IP header untouched." },
            l2: { val: "802.1Q Tag: VLAN 10", desc: "SW-Branch inserts the VLAN 10 tag to identify traffic source across shared trunk trunks." },
            l1: { val: "Trunk Link (Gi0/1)", desc: "Physical: Gigabit Trunk fiber transceiver." }
          }
        },
        {
          node: "r-branch", x: 360, y: 130, name: "R-Branch Router", color: "#10b981",
          headers: "L3 Routing: Gi0/0.10 -> Gi0/0.20 | Tag rewritten to VLAN 20",
          desc: "R-Branch processes the tagged frame on subinterface Gi0/0.10. It strips the VLAN tag, decapsulates L2, routes the packet to virtual subinterface Gi0/0.20, and re-encapsulates it with a VLAN 20 tag.",
          osi: {
            l4: { val: "TCP Src 51000 -> Dst 80", desc: "Payload remains encapsulated." },
            l3: { val: "10.10.10.10 -> 10.10.20.10", desc: "R-Branch performs routing lookup, forwarding packets between subnet subinterfaces Gi0/0.10 and Gi0/0.20." },
            l2: { val: "802.1Q Tag: VLAN 20", desc: "Data Link: Re-encapsulated with R-Branch interface MAC as source and a VLAN 20 trunk tag." },
            l1: { val: "Trunk Link (Gi0/1)", desc: "Physical: Sent back down the same physical port channel (Router-on-a-Stick loop)." }
          }
        },
        {
          node: "sw-branch", x: 200, y: 130, name: "SW-Branch Switch", color: "#10b981",
          headers: "L2 Access: VLAN tag stripped",
          desc: "SW-Branch receives the VLAN 20 tagged frame. It checks its MAC table, finds the IP-Phone on access port Fa0/2, strips the 802.1Q tag, and forwards the standard frame.",
          osi: {
            l4: { val: "TCP Src 51000 -> Dst 80", desc: "Payload remains encapsulated." },
            l3: { val: "10.10.10.10 -> 10.10.20.10", desc: "IP header untouched." },
            l2: { val: "Untagged Access Frame", desc: "SW-Branch strips the VLAN 20 tag prior to final delivery to access port Fa0/2." },
            l1: { val: "Access Link (Fa0/2)", desc: "Physical: Downlink FastEthernet cable." }
          }
        },
        {
          node: "ip-phone", x: 60, y: 80, name: "Voice IP Phone", color: "#10b981",
          headers: "L3: Connection Accepted",
          desc: "The IP-Phone (VLAN 20) receives the frame, decapsulates the TCP segment, and processes the HTTP request. ROAS traversal successful!",
          osi: {
            l4: { val: "TCP Dst 80", desc: "TCP Layer: Service accepts connection on port 80." },
            l3: { val: "10.10.10.10 -> 10.10.20.10", desc: "IP Layer: Destination matches voice IP address." },
            l2: { val: "00bb.ccdd.2020 MAC Match", desc: "Data Link: Unicast frame matches target device NIC MAC address." },
            l1: { val: "Copper Ethernet", desc: "Physical: NIC converts electrical pulses." }
          }
        }
      ];
    } else if (type === "lacp") {
      path = [
        {
          node: "r-branch", x: 360, y: 130, name: "R-Branch Router", color: "#10b981",
          headers: "L2 LACP: Channel-Group 1 Active",
          desc: "R-Branch load-balances outbound traffic to the Core network over bundled Port-Channel 1. Traffic exits Member Link 1.",
          osi: {
            l4: { val: "TCP Src 50123 -> Dst 443", desc: "Transport Layer: TCP HTTPS traffic." },
            l3: { val: "10.10.10.10 -> 172.16.100.5", desc: "IP Layer: Destination is HQ Server." },
            l2: { val: "Port-Channel 1 (LACP)", desc: "Data Link: LACP bundles multiple physical interfaces into a logical Port-Channel to increase bandwidth and redundancy." },
            l1: { val: "Gigabit Link 1", desc: "Physical Layer: Traffic is hash-balanced to Member Interface Gi0/2." }
          }
        },
        {
          node: "r-branch", x: 360, y: 130, name: "R-Branch (LACP Member Failure)", color: "#ff5e3a",
          headers: "LACP Alert: Member Link 1 DOWN | Egress switchover",
          desc: "Member Link 1 experiences a physical failure. LACP immediately redirects all traffic to active Member Link 2. Transmission continues seamlessly without session drops.",
          osi: {
            l4: { val: "TCP Src 50123 -> Dst 443", desc: "TCP session remains alive without timeouts." },
            l3: { val: "10.10.10.10 -> 172.16.100.5", desc: "Routing table path remains unchanged." },
            l2: { val: "LACP Dynamic Failover", desc: "LACP removes Member Link 1 from the channel bundle and immediately redirects traffic to active Member Link 2." },
            l1: { val: "Gigabit Link 2 (Failover)", desc: "Physical Layer: Egress traffic shifts dynamically to Member Interface Gi0/3." }
          }
        },
        {
          node: "hq-core", x: 520, y: 80, name: "HQ Core L3 Switch", color: "#10b981",
          headers: "L2: Port-Channel 1 Received | Forwarding to Server",
          desc: "HQ-Core receives the packet on Port-Channel 1. The LACP failover was transparent to the routing layer, avoiding any packet drops.",
          osi: {
            l4: { val: "TCP Src 50123 -> Dst 443", desc: "TCP session remains fully established." },
            l3: { val: "10.10.10.10 -> 172.16.100.5", desc: "HQ-Core acts as L3 router for core subnets." },
            l2: { val: "Port-Channel 1 (LACP)", desc: "LACP processes logical incoming frame; MAC database resolves destination on local Gi0/24." },
            l1: { val: "Gigabit Link 2", desc: "Physical: Incoming signals processed on Gi0/2." }
          }
        },
        {
          node: "hq-server", x: 640, y: 80, name: "HQ Server", color: "#10b981",
          headers: "L3: Destination Reached",
          desc: "HQ Server receives the packet. EtherChannel ensured high availability even during a physical fiber link break.",
          osi: {
            l4: { val: "TCP Dst 443", desc: "TCP Layer: HTTPS handshake completed." },
            l3: { val: "10.10.10.10 -> 172.16.100.5", desc: "IP Layer: Matches datacenter host." },
            l2: { val: "Unicast Frame", desc: "Data Link: Datacenter standard frame." },
            l1: { val: "Copper Ethernet", desc: "Physical Layer: Server NIC reception." }
          }
        }
      ];
    } else if (type === "vpn") {
      path = [
        {
          node: "r-branch", x: 360, y: 130, name: "R-Branch Router", color: "#00f2fe",
          headers: "L3: Crypto Map Match | IPSec Encapsulation",
          desc: "R-Branch inspects outbound packet. Traffic matches the Crypto ACL (10.10.10.0/24 to 172.16.100.0/24). R-Branch initiates IPSec Tunnel Mode encryption.",
          osi: {
            l4: { val: "IPSec ESP (Protocol 50)", desc: "Transport Layer: Original TCP header is encrypted and encapsulated inside an Encapsulating Security Payload (ESP) header." },
            l3: { val: "WAN IP 192.0.2.1 -> 198.51.100.1", desc: "IP Layer: Private source/destination IPs are encrypted. A new public IP header is prepended (R-Branch WAN to FW-Branch WAN)." },
            l2: { val: "WAN MAC Gateway", desc: "Data Link: Unicast frame directed to outside ISP router." },
            l1: { val: "WAN Carrier", desc: "Physical: Sent over public ISP uplink." }
          }
        },
        {
          node: "fw-branch", x: 520, y: 180, name: "FW-Branch Firewall (VPN Peer)", color: "#10b981",
          headers: "L3: IPSec Decapsulation",
          desc: "The VPN Gateway (FW-Branch) intercepts the ESP packet. Finding a valid Security Association (SA), it decapsulates the ESP wrapper, decrypts the payload, and reveals the original private IP headers.",
          osi: {
            l4: { val: "TCP Src 50123 -> Dst 443", desc: "Transport Layer: Original TCP header decrypted and exposed." },
            l3: { val: "10.10.10.10 -> 172.16.100.5", desc: "IP Layer: Original private IP headers are revealed and routed to internal interface." },
            l2: { val: "Internal MAC Rewrite", desc: "Data Link: Framed for core forwarding." },
            l1: { val: "Gigabit Link", desc: "Physical: Decoded packet routed internally." }
          }
        },
        {
          node: "hq-server", x: 640, y: 80, name: "HQ Server", color: "#10b981",
          headers: "L3: Destination Reached | Private Session Secured",
          desc: "HQ Server receives the decrypted private packet. Site-to-site IPSec VPN secured the transaction across the untrusted public Internet.",
          osi: {
            l4: { val: "TCP Dst 443", desc: "TCP Layer: Secure web service receives transaction." },
            l3: { val: "10.10.10.10 -> 172.16.100.5", desc: "IP Layer: Datacenter Server private destination match." },
            l2: { val: "Unicast Frame", desc: "Data Link: Private LAN framing." },
            l1: { val: "Copper Ethernet", desc: "Physical Layer: NIC reception." }
          }
        }
      ];
    }

    activePkt.style.opacity = "1";
    logContent.innerHTML = "";
    let blocked = false;

    for (let i = 0; i < path.length; i++) {
      const step = path[i];
      
      const isBlockedHop = isBugActive && (i === bug.failureHopIndex);
      if (isBlockedHop) {
        step.isBlocked = true;
        step.headers = `L3: ERROR | ${bug.errorLog}`;
        step.desc = `<strong>[DROPPED]</strong> Packet dropped at ${step.name}. Reason: ${bug.desc}`;
      }

      currentOsiData = step.osi || null;
      
      updateOsiLabels(step.osi);

      let highestLayer = 1;
      if (step.osi) {
        if (step.osi.l4 && step.osi.l4.val !== "-") highestLayer = 4;
        else if (step.osi.l3 && step.osi.l3.val !== "-") highestLayer = 3;
        else if (step.osi.l2 && step.osi.l2.val !== "-") highestLayer = 2;
      }
      
      document.querySelectorAll(".osi-layer").forEach(el => {
        if (el.getAttribute("data-layer") == highestLayer) {
          el.classList.add("active");
        } else {
          el.classList.remove("active");
        }
      });
      showOsiLayerDetail(highestLayer);

      highlightNode(step.node, step.isBlocked);

      // Check for special LACP member link failure styling
      if (type === "lacp" && activeTopology === 2) {
        if (i === 1) {
          const link1 = byId("link-rbranch-hq1");
          if (link1) {
            link1.setAttribute("stroke", "#ff5e3a");
            link1.setAttribute("stroke-width", "3");
          }
          const link2 = byId("link-rbranch-hq2");
          if (link2) {
            link2.setAttribute("stroke", "#10b981");
            link2.setAttribute("stroke-width", "3");
          }
          const statusLink1 = byId("status-lacp-link1");
          if (statusLink1) {
            statusLink1.setAttribute("fill", "#ff5e3a");
          }
        }
      }

      activePkt.setAttribute("cx", step.x);
      activePkt.setAttribute("cy", step.y);
      if (step.isBlocked) {
        activePkt.setAttribute("fill", "#ff5e3a");
        activePkt.style.filter = "drop-shadow(0 0 8px #ff5e3a)";
        playNetSound("block");
      } else {
        activePkt.setAttribute("fill", step.color || "#00f2fe");
        activePkt.style.filter = `drop-shadow(0 0 8px ${step.color || "#00f2fe"})`;
        playNetSound("hop");
      }

      const stepDiv = document.createElement("div");
      stepDiv.style.borderLeft = `3px solid ${step.isBlocked ? "#ff5e3a" : step.color}`;
      stepDiv.style.paddingLeft = "8px";
      stepDiv.style.marginBottom = "6px";
      stepDiv.innerHTML = `
        <strong style="color:${step.isBlocked ? "#ff5e3a" : step.color};">[HOP ${i + 1}: ${step.name}]</strong><br/>
        <span style="font-size:11px; color:#94a3b8; font-family:var(--font-mono);">${step.headers}</span><br/>
        <span>${step.desc}</span>
      `;
      logContent.appendChild(stepDiv);

      const logPanel = byId("simLogPanel");
      if (logPanel) logPanel.scrollTop = logPanel.scrollHeight;

      if (step.isBlocked) {
        blocked = true;
        break;
      }

      const speed = Number(byId("simSpeed")?.value || 2200);
      await sleep(speed);
    }

    if (blocked) {
      const finishDiv = document.createElement("div");
      finishDiv.style.textAlign = "center";
      finishDiv.style.marginTop = "8px";
      finishDiv.style.color = "#ff5e3a";
      finishDiv.style.fontWeight = "bold";
      finishDiv.innerHTML = `❌ Traversal Blocked by Security Policy.`;
      logContent.appendChild(finishDiv);
    } else {
      playNetSound("success");
      const finishDiv = document.createElement("div");
      finishDiv.style.textAlign = "center";
      finishDiv.style.marginTop = "8px";
      finishDiv.style.color = "#10b981";
      finishDiv.style.fontWeight = "bold";
      finishDiv.innerHTML = `✔ Traversal Completed Successfully.`;
      logContent.appendChild(finishDiv);

      if (type === "ospf" || type === "roas") {
        state.analytics.simPathsRun = state.analytics.simPathsRun || { ospf: false, roas: false };
        state.analytics.simPathsRun[type] = true;
        saveAnalytics();
        renderAchievements();
      }
    }

    await sleep(1000);
    highlightNode(null);
    btnStart.disabled = false;
  });

  btnReset.addEventListener("click", () => {
    btnStart.disabled = false;
    const pkt1 = byId("simPacket");
    const pkt2 = byId("simPacket2");
    if (pkt1) {
      pkt1.style.opacity = "0";
      pkt1.setAttribute("cx", "80");
      pkt1.setAttribute("cy", "140");
    }
    if (pkt2) {
      pkt2.style.opacity = "0";
      pkt2.setAttribute("cx", "60");
      pkt2.setAttribute("cy", "180");
    }
    logContent.innerHTML = "<div>System Ready. Select a packet simulation and click 'Run Simulation'.</div>";
    currentOsiData = null;
    updateOsiLabels(null);
    const descBox = byId("osiLayerDescBox");
    if (descBox) {
      descBox.innerHTML = `<span style="color: var(--text-muted); font-style: italic;">Run a simulation and click any OSI layer tab above to inspect the active hop encapsulation details.</span>`;
    }
    document.querySelectorAll(".osi-layer").forEach(el => el.classList.remove("active"));
    highlightNode(null);
    resetTopology2Links();
  });
}

function setupCanvasConstellation() {
  const canvas = byId("netCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  
  let particles = [];
  let activeExplosionParticles = [];
  let animFrameId;

  class ExplosionParticle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 6;
      this.vy = (Math.random() - 0.5) * 6 - Math.random() * 2; // upwards bias
      this.radius = Math.random() * 3 + 1.5;
      this.alpha = 1;
      this.decay = Math.random() * 0.015 + 0.01;
      this.color = color || "#00f2fe";
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.05; // slight gravity
      this.alpha -= this.decay;
    }
    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
    }
  }

  window.triggerSuccessExplosion = (x, y, color) => {
    const explosionColor = color || (Math.random() < 0.5 ? "#00f2fe" : "#10b981");
    for (let i = 0; i < 40; i++) {
      activeExplosionParticles.push(new ExplosionParticle(x, y, explosionColor));
    }
  };

  const count = 45;
  let mouse = { x: null, y: null, radius: 120 };

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  // Cleanup any old listeners to prevent memory leak
  if (window._canvasResizeListener) {
    window.removeEventListener("resize", window._canvasResizeListener);
  }
  if (window._canvasMouseMoveListener) {
    window.removeEventListener("mousemove", window._canvasMouseMoveListener);
  }
  if (window._canvasMouseOutListener) {
    window.removeEventListener("mouseout", window._canvasMouseOutListener);
  }

  window._canvasResizeListener = resize;
  window.addEventListener("resize", resize);
  resize();

  const handleMouseMove = (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    // Spawn a gentle trail of glowing micro-particles
    if (Math.random() < 0.25 && activeExplosionParticles.length < 100) {
      const p = new ExplosionParticle(e.clientX, e.clientY, Math.random() < 0.5 ? "#00f2fe" : "#10b981");
      p.vx = (Math.random() - 0.5) * 1.5;
      p.vy = (Math.random() - 0.5) * 1.5;
      p.radius = Math.random() * 1.5 + 1;
      p.decay = 0.025; // fade out quickly
      activeExplosionParticles.push(p);
    }
  };
  window._canvasMouseMoveListener = handleMouseMove;
  window.addEventListener("mousemove", handleMouseMove);

  const handleMouseOut = () => {
    mouse.x = null;
    mouse.y = null;
  };
  window._canvasMouseOutListener = handleMouseOut;
  window.addEventListener("mouseout", handleMouseOut);

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.radius = Math.random() * 2 + 1;
    }
    update() {
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.vx += Math.cos(angle) * force * 0.2;
          this.vy += Math.sin(angle) * force * 0.2;
        }
      }

      this.vx *= 0.95;
      this.vy *= 0.95;

      this.vx += (Math.random() - 0.5) * 0.05;
      this.vy += (Math.random() - 0.5) * 0.05;

      const speed = Math.hypot(this.vx, this.vy);
      if (speed > 1.5) {
        this.vx = (this.vx / speed) * 1.5;
        this.vy = (this.vy / speed) * 1.5;
      }

      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 242, 254, 0.45)";
      ctx.fill();
    }
  }

  class NetworkPacket {
    constructor(p1, p2) {
      this.p1 = p1;
      this.p2 = p2;
      this.progress = Math.random();
      this.speed = Math.random() * 0.005 + 0.002;
    }
    update() {
      this.progress += this.speed;
      if (this.progress >= 1) {
        this.progress = 0;
        this.p1 = pick(particles);
        this.p2 = pick(particles);
      }
    }
    draw() {
      const x = this.p1.x + (this.p2.x - this.p1.x) * this.progress;
      const y = this.p1.y + (this.p2.y - this.p1.y) * this.progress;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = "#10b981";
      ctx.shadowColor = "#10b981";
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  class BinaryColumn {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * -canvas.height;
      this.vy = Math.random() * 1.5 + 0.8;
      this.chars = [];
      this.length = Math.floor(Math.random() * 8) + 4;
      for (let i = 0; i < this.length; i++) {
        this.chars.push(Math.random() < 0.5 ? "0" : "1");
      }
    }
    update() {
      this.y += this.vy;
      if (this.y > canvas.height) {
        this.y = -100;
        this.x = Math.random() * canvas.width;
        this.vy = Math.random() * 1.5 + 0.8;
      }
      if (Math.random() < 0.05) {
        this.chars[Math.floor(Math.random() * this.chars.length)] = Math.random() < 0.5 ? "0" : "1";
      }
    }
    draw() {
      ctx.font = "9px monospace";
      for (let i = 0; i < this.chars.length; i++) {
        const charY = this.y + i * 12;
        if (charY < 0 || charY > canvas.height) continue;
        const opacity = (i / this.chars.length) * 0.12;
        ctx.fillStyle = `rgba(16, 185, 129, ${opacity})`;
        ctx.fillText(this.chars[i], this.x, charY);
      }
    }
  }

  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }

  let floatPackets = [];
  for (let i = 0; i < 15; i++) {
    floatPackets.push(new NetworkPacket(pick(particles), pick(particles)));
  }

  let binaryColumns = [];
  for (let i = 0; i < 20; i++) {
    binaryColumns.push(new BinaryColumn());
  }

  // ExplosionParticle class and activeExplosionParticles defined at top of function scope

  const animate = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => p.draw());
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 242, 254, 0.05)`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      setTimeout(() => { animFrameId = requestAnimationFrame(animate); }, 500);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    binaryColumns.forEach(col => {
      col.update();
      col.draw();
    });

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.update();
      p.draw();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(0, 242, 254, ${0.15 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Connect mouse to nearby particles
    if (mouse.x !== null && mouse.y !== null) {
      particles.forEach(p => {
        const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (dist < mouse.radius) {
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `rgba(0, 242, 254, ${0.32 * (1 - dist / mouse.radius)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    }

    floatPackets.forEach(pkt => {
      pkt.update();
      pkt.draw();
    });

    activeExplosionParticles.forEach((p, idx) => {
      p.update();
      p.draw();
      if (p.alpha <= 0) {
        activeExplosionParticles.splice(idx, 1);
      }
    });

    animFrameId = requestAnimationFrame(animate);
  };
  animFrameId = requestAnimationFrame(animate);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(animFrameId);
    } else {
      animFrameId = requestAnimationFrame(animate);
    }
  });
}

function setupSupportDesk() {
  const btn = byId("btnSubmitSupport");
  const out = byId("supportOut");
  if (!btn || !out) return;

  btn.addEventListener("click", () => {
    const name = byId("supportName").value.trim();
    const email = byId("supportEmail").value.trim();
    const priority = byId("supportPriority").value;
    const desc = byId("supportDesc").value.trim();

    if (!name || !email || !desc) {
      showToast("Please fill in all required fields.", "warn");
      return;
    }

    showToast("Incident ticket successfully logged ✓", "ok", 3000);
    out.innerHTML = `
      <strong style="color: #10b981;">Incident Logged Successfully!</strong><br />
      <strong>Ticket ID:</strong> INC-${Math.floor(100000 + Math.random() * 900000)}<br />
      <strong>Severity:</strong> ${priority}<br />
      <strong>Status:</strong> Assigned to Adarsh Poojari (Admin)<br />
      <span style="font-size: 12px; color: var(--text-muted);">A confirmation ticket detail was logged in local session cache. Administrator contact 9136398778 / adarshpoojari8630@gmail.com has been referenced.</span>
    `;
    out.classList.remove("hidden");

    // Reset inputs
    byId("supportName").value = "";
    byId("supportEmail").value = "";
    byId("supportDesc").value = "";
  });
}

function updateMuteButton() {
  const btn = byId("btnMuteToggle");
  if (btn) {
    btn.textContent = state.muted ? "🔇" : "🔊";
    btn.setAttribute("title", state.muted ? "Unmute Sound" : "Mute Sound");
  }
}

function updateContrastButton() {
  document.body.classList.toggle("high-contrast", state.highContrast);
  const btn = byId("btnToggleContrast");
  if (btn) {
    btn.setAttribute("title", state.highContrast ? "Disable High Contrast" : "Enable High Contrast");
  }
}



function updateSubnetCalculator() {
  const ipInput = byId("calcIp");
  const cidrInput = byId("calcCidr");
  if (!ipInput || !cidrInput) return;

  const ipStr = ipInput.value.trim();
  const cidr = Number(cidrInput.value);

  // Update CIDR value text
  const calcCidrVal = byId("calcCidrVal");
  if (calcCidrVal) calcCidrVal.textContent = `/${cidr}`;

  // Validate IP
  const parts = ipStr.split('.').map(p => p.trim());
  let isValid = true;
  if (parts.length !== 4) {
    isValid = false;
  } else {
    for (const p of parts) {
      const n = Number(p);
      if (p === "" || isNaN(n) || n < 0 || n > 255 || n.toString() !== p) {
        isValid = false;
        break;
      }
    }
  }

  if (!isValid) {
    ipInput.style.borderColor = "#ff5e3a";
    ipInput.style.boxShadow = "0 0 10px rgba(255, 94, 58, 0.25)";
    return;
  }

  ipInput.style.borderColor = "";
  ipInput.style.boxShadow = "";

  const ipNum = ipToNum(ipStr);
  if (ipNum === null) return;
  
  const maskNum = cidr === 32 ? 0xFFFFFFFF : (~(0xFFFFFFFF >>> cidr)) >>> 0;
  const wildcardNum = (~maskNum) >>> 0;
  const netNum = (ipNum & maskNum) >>> 0;
  const broadNum = (netNum | wildcardNum) >>> 0;

  // Mask
  byId("calcMask").textContent = numToIp(maskNum);
  // Wildcard
  byId("calcWildcard").textContent = numToIp(wildcardNum);
  // Network Address
  byId("calcNetwork").textContent = numToIp(netNum);
  // Broadcast Address
  byId("calcBroadcast").textContent = numToIp(broadNum);

  // Usable range & host count
  let hosts = 0;
  let rangeStr = "N/A";
  if (cidr <= 30) {
    hosts = Math.pow(2, 32 - cidr) - 2;
    rangeStr = `${numToIp(netNum + 1)} - ${numToIp(broadNum - 1)}`;
  } else if (cidr === 31) {
    hosts = 2;
    rangeStr = `${numToIp(netNum)} - ${numToIp(broadNum)}`;
  } else {
    hosts = 1;
    rangeStr = numToIp(netNum);
  }

  byId("calcHosts").textContent = hosts.toLocaleString();
  byId("calcRange").textContent = rangeStr;

  // Address Class
  const firstOctet = (ipNum >>> 24) & 255;
  let ipClass = "Class A";
  if (firstOctet >= 128 && firstOctet <= 191) ipClass = "Class B";
  else if (firstOctet >= 192 && firstOctet <= 223) ipClass = "Class C";
  else if (firstOctet >= 224 && firstOctet <= 239) ipClass = "Class D (Multicast)";
  else if (firstOctet >= 240) ipClass = "Class E (Experimental)";
  byId("calcClass").textContent = ipClass;

  // Scope check
  let scope = "Public";
  if (firstOctet === 10) scope = "Private (RFC 1918)";
  else if (firstOctet === 172 && ((ipNum >>> 16) & 255) >= 16 && ((ipNum >>> 16) & 255) <= 31) scope = "Private (RFC 1918)";
  else if (firstOctet === 192 && ((ipNum >>> 16) & 255) === 168) scope = "Private (RFC 1918)";
  else if (firstOctet === 127) scope = "Loopback (Localhost)";
  else if (firstOctet === 169 && ((ipNum >>> 16) & 255) === 254) scope = "Link-Local (APIPA)";
  byId("calcScope").textContent = scope;

  // Render Bit Grid
  const bitGrid = byId("calcBitGrid");
  if (bitGrid) {
    let gridHtml = "";
    const ipBin = ipNum.toString(2).padStart(32, '0');
    for (let octet = 0; octet < 4; octet++) {
      gridHtml += `<span style="display: inline-flex; gap: 3px; align-items: center; white-space: nowrap; margin: 2px 4px;">`;
      for (let bit = 0; bit < 8; bit++) {
        const i = octet * 8 + bit;
        const bitNum = i + 1;
        const isNet = bitNum <= cidr;
        const bitVal = ipBin[i];
        
        const bg = isNet ? "background: rgba(0, 242, 254, 0.12); border: 1px solid rgba(0, 242, 254, 0.35); color: #00f2fe; box-shadow: 0 0 5px rgba(0,242,254,0.15);" : "background: rgba(255, 94, 58, 0.08); border: 1px solid rgba(255, 94, 58, 0.25); color: #ff9233; box-shadow: 0 0 5px rgba(255,94,58,0.1);";
        
        gridHtml += `<div style="width: 18px; height: 26px; display: inline-flex; align-items: center; justify-content: center; font-size: 11.5px; border-radius: 4px; ${bg} transition: var(--transition-smooth);">${bitVal}</div>`;
      }
      gridHtml += `</span>`;
      if (octet < 3) {
        gridHtml += `<span style="font-size: 16px; color: var(--text-muted); font-weight: bold; align-self: center; margin: 0 1px;">.</span>`;
      }
    }
    bitGrid.innerHTML = gridHtml;
  }

  // Dynamic highlighting of cheat sheet row
  const rows = document.querySelectorAll(".cheat-sheet-row");
  rows.forEach(row => {
    const rowCidr = Number(row.dataset.cidr);
    if (rowCidr === cidr) {
      row.classList.add("highlighted-row");
      row.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      row.classList.remove("highlighted-row");
    }
  });
}

const cheatSheetMasks = [
  { cidr: 32, mask: "255.255.255.255", wildcard: "0.0.0.0", hosts: "1", size: "1" },
  { cidr: 31, mask: "255.255.255.254", wildcard: "0.0.0.1", hosts: "2", size: "2" },
  { cidr: 30, mask: "255.255.255.252", wildcard: "0.0.0.3", hosts: "2 (Usable)", size: "4" },
  { cidr: 29, mask: "255.255.255.248", wildcard: "0.0.0.7", hosts: "6 (Usable)", size: "8" },
  { cidr: 28, mask: "255.255.255.240", wildcard: "0.0.0.15", hosts: "14 (Usable)", size: "16" },
  { cidr: 27, mask: "255.255.255.224", wildcard: "0.0.0.31", hosts: "30 (Usable)", size: "32" },
  { cidr: 26, mask: "255.255.255.192", wildcard: "0.0.0.63", hosts: "62 (Usable)", size: "64" },
  { cidr: 25, mask: "255.255.255.128", wildcard: "0.0.0.127", hosts: "126 (Usable)", size: "128" },
  { cidr: 24, mask: "255.255.255.0", wildcard: "0.0.0.255", hosts: "254 (Usable)", size: "256" },
  { cidr: 23, mask: "255.255.254.0", wildcard: "0.0.1.255", hosts: "510 (Usable)", size: "512" },
  { cidr: 22, mask: "255.255.252.0", wildcard: "0.0.3.255", hosts: "1,022 (Usable)", size: "1,024" }
];

function setupSubnetCalculator() {
  const ipInput = byId("calcIp");
  const cidrInput = byId("calcCidr");
  if (!ipInput || !cidrInput) return;

  ipInput.addEventListener("input", updateSubnetCalculator);
  cidrInput.addEventListener("input", updateSubnetCalculator);

  document.querySelectorAll(".calc-preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      playNetSound("click");
      cidrInput.value = btn.dataset.mask;
      updateSubnetCalculator();
    });
  });

  const sheetBody = byId("cheatSheetBody");
  if (sheetBody) {
    sheetBody.innerHTML = cheatSheetMasks.map(m => `
      <tr class="cheat-sheet-row" data-cidr="${m.cidr}">
        <td style="padding: 6px;">/${m.cidr}</td>
        <td style="padding: 6px;">${m.mask}</td>
        <td style="padding: 6px;">${m.wildcard}</td>
        <td style="padding: 6px; color: #10b981;">${m.hosts}</td>
        <td style="padding: 6px; color: #00f2fe;">${m.size}</td>
      </tr>
    `).join("");
  }

  updateSubnetCalculator();
}

/* --- CCNA Rapid Recall Flashcards Deck --- */
let currentFlashcardIdx = 0;
let flashcardFlipped = false;

const ccnaFlashcards = [
  {
    topic: "Routing Protocols",
    q: "What is the default Administrative Distance (AD) of OSPF?",
    a: "110",
    note: "OSPF relies on path cost (bandwidth) to determine the best path, with an AD of 110."
  },
  {
    topic: "Routing Protocols",
    q: "What is the default Administrative Distance (AD) of EIGRP?",
    a: "90",
    note: "EIGRP uses a composite metric (bandwidth and delay by default) and has an AD of 90."
  },
  {
    topic: "Routing Protocols",
    q: "What is the default Administrative Distance (AD) of RIP?",
    a: "120",
    note: "RIP uses hop count as its metric (maximum 15 hops) and has an AD of 120."
  },
  {
    topic: "IP Services",
    q: "Which port does SSH use, and what layer does it operate on?",
    a: "TCP Port 22 (Layer 4)",
    note: "SSH provides secure command-line access. Telnet uses unencrypted TCP Port 23."
  },
  {
    topic: "IP Services",
    q: "Which port does DHCP Server listen on, and which port does DHCP Client use?",
    a: "Server: UDP Port 67, Client: UDP Port 68",
    note: "DHCP processes use UDP packets to dynamically allocate network parameters to hosts."
  },
  {
    topic: "Security Fundamentals",
    q: "What range of numbers represents Standard IP Access Control Lists (ACLs)?",
    a: "1 - 99 and 1300 - 1999",
    note: "Standard ACLs filter traffic based *only* on source IP address and should be applied close to destination."
  },
  {
    topic: "Security Fundamentals",
    q: "What range of numbers represents Extended IP Access Control Lists (ACLs)?",
    a: "100 - 199 and 2000 - 2699",
    note: "Extended ACLs filter by source, destination, protocol type (TCP/UDP), and port number."
  },
  {
    topic: "Network Access",
    q: "What is the default bridge priority value for Spanning Tree Protocol (STP)?",
    a: "32768",
    note: "Bridge ID consists of Priority (default 32768) + System ID Extension (VLAN ID) + MAC Address."
  },
  {
    topic: "Network Access",
    q: "What is the destination MAC address for an ARP Request frame?",
    a: "FF:FF:FF:FF:FF:FF",
    note: "ARP Requests are broadcast frames sent to all devices on the local segment to resolve an IP to MAC."
  },
  {
    topic: "IP Connectivity",
    q: "What is the OSPFv2 link-state multicast destination IP address for all SPF routers?",
    a: "224.0.0.5",
    note: "All OSPF routers listen on 224.0.0.5. DR/BDR routers also listen on 224.0.0.6."
  },
  {
    topic: "IP Connectivity",
    q: "What is the default Administrative Distance (AD) of a Static Route?",
    a: "1",
    note: "Static routes are highly trusted and have a default AD of 1. Directly connected networks have AD of 0."
  },
  {
    topic: "IP Services",
    q: "Which port does NTP (Network Time Protocol) use?",
    a: "UDP Port 123",
    note: "NTP synchronizes clocks across networking devices for accurate log timestamps."
  },
  {
    topic: "IP Connectivity",
    q: "What IPv6 address prefix represents Link-Local addresses?",
    a: "FE80::/10",
    note: "Link-local addresses are auto-configured on every IPv6-enabled interface and are only routable locally."
  },
  {
    topic: "IP Connectivity",
    q: "What IPv6 multicast address represents the All-Nodes multicast group?",
    a: "FF02::1",
    note: "FF02::1 acts as the local broadcast equivalent for all IPv6 hosts on the link segment."
  },
  {
    topic: "Network Access",
    q: "What is the default priority value for HSRP (Hot Standby Router Protocol)?",
    a: "100",
    note: "HSRP priority default is 100. The router with the highest HSRP priority is elected as the Active router."
  }
];

function updateFlashcardUI() {
  const card = ccnaFlashcards[currentFlashcardIdx];
  const countSpan = byId("flashcardCount");
  const topicSpan = byId("flashcardTopic");
  const questionSpan = byId("flashcardQuestion");
  const answerSpan = byId("flashcardAnswer");
  const noteSpan = byId("flashcardNote");
  const innerCard = byId("flashcardInner");
  
  if (innerCard) {
    if (flashcardFlipped) {
      innerCard.classList.add("flipped");
    } else {
      innerCard.classList.remove("flipped");
    }
  }
  
  if (countSpan) countSpan.textContent = `Card ${currentFlashcardIdx + 1} / ${ccnaFlashcards.length}`;
  if (topicSpan) topicSpan.textContent = card.topic;
  if (questionSpan) questionSpan.textContent = card.q;
  if (answerSpan) answerSpan.textContent = card.a;
  if (noteSpan) noteSpan.textContent = card.note;
}

function setupFlashcards() {
  const innerCard = byId("flashcardInner");
  const btnPrev = byId("btnPrevFlashcard");
  const btnNext = byId("btnNextFlashcard");
  const btnFlip = byId("btnFlipFlashcard");
  
  if (innerCard) {
    innerCard.addEventListener("click", () => {
      playNetSound("click");
      flashcardFlipped = !flashcardFlipped;
      updateFlashcardUI();
    });
  }
  
  if (btnFlip) {
    btnFlip.addEventListener("click", (e) => {
      e.stopPropagation();
      playNetSound("click");
      flashcardFlipped = !flashcardFlipped;
      updateFlashcardUI();
    });
  }
  
  if (btnPrev) {
    btnPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      playNetSound("click");
      flashcardFlipped = false;
      currentFlashcardIdx = (currentFlashcardIdx - 1 + ccnaFlashcards.length) % ccnaFlashcards.length;
      updateFlashcardUI();
    });
  }
  
  if (btnNext) {
    btnNext.addEventListener("click", (e) => {
      e.stopPropagation();
      playNetSound("click");
      flashcardFlipped = false;
      currentFlashcardIdx = (currentFlashcardIdx + 1) % ccnaFlashcards.length;
      updateFlashcardUI();
    });
  }
  
  updateFlashcardUI();
}

function init() {
  state.bank = generateBank(rand);
  navSetup();
  renderDomainChecks();
  renderHome();
  renderAnalytics();
  wireEvents();
  setupAuth();
  setupCanvasConstellation();
  setupTraversalSimulator();
  setupSupportDesk();
  
  // Custom load sequence
  updateMuteButton();
  updateContrastButton();
  renderSubnetLeaderboard();
  ensureSubnetQuestion(true);
  setupSubnetCalculator();
  setupFlashcards();
  
  // Initialize virtual labs selector dropdown and execution modes
  initLabSelector();
  initLabModes();
  
  if (typeof loadLab === "function") {
    loadLab(1);
  }
  
  window.addEventListener("beforeunload", (e) => {
    if (state.session && !state.session.submitted) {
      e.preventDefault();
      e.returnValue = "You have an active CCNA quiz session. Are you sure you want to leave?";
      return e.returnValue;
    }
    if (state.subnet && state.subnet.timerRef) {
      e.preventDefault();
      e.returnValue = "You have an active subnetting challenge running. Are you sure you want to leave?";
      return e.returnValue;
    }
  });

  window.addEventListener("popstate", (e) => {
    if (state.session && !state.session.submitted) {
      if (!confirm("You have an active CCNA quiz session. Are you sure you want to leave? Your progress will be lost.")) {
        history.pushState({ page: "engine" }, "", "?page=engine");
        return;
      } else {
        if (state.session.timer) clearInterval(state.session.timer);
        const headerTimerEl = byId("headerTimer");
        if (headerTimerEl) headerTimerEl.classList.add("hidden");
        state.session = null;
        persistSession();
      }
    }
    const page = e.state?.page || "home";
    setPage(page, false);
  });
  
  if (!restoreSession()) {
    setPage("home");
  }

  /* ─── Premium 3D Perspective Tilt Interaction ───────────── */
  const initTiltEffect = () => {
    const card = document.querySelector(".hero-dashboard");
    if (!card) return;

    card.addEventListener("mousemove", (e) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Dampened 3D rotation angles for precision premium feel
      const rotateX = -(y / rect.height) * 4;
      const rotateY = (x / rect.width) * 4;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)";
    });
  };

  // Wire tilt effect immediately on landing page load
  setTimeout(initTiltEffect, 100);
}

init();
