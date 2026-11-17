import {
  state,
  byId,
  playNetSound,
  gainXP,
  getLevelInfo,
  saveAnalytics,
  safeHTML,
  pick,
  rand,
  shuffle,
  showToast,
  persistSession,
  validateAnalyticsSchema,
  createDefaultAnalytics,
  migrateBankVersion,
  getSavedUnfinishedSession,
  clearSavedSessionStorage
} from "./core.js?v=78";
import { blueprint, generateBank } from "./data.js?v=77";
import { ccnaVideos } from "./videos.js?v=77";
import {
  toMMSS,
  startSessionTimer,
  toggleTimerPause,
  updateTimerDisplay,
  stopSessionTimer,
  registerTimerHandlers
} from "./timer.js?v=78";
import {
  getLocalDateStr,
  normalizeDateStr,
  getCalendarDayDiff,
  getDisplayStreak,
  getStreakBadgeInfo,
  updateStreakOnAttempt
} from "./streak.js?v=78";
import {
  openReview,
  closeReview,
  formatQuestionAnswer,
  buildFinishReviewHTML,
  wireFinishReviewInteractions,
  registerReviewHandlers,
  isQuestionAnswered
} from "./review.js?v=83";

export {
  toMMSS,
  startSessionTimer,
  toggleTimerPause,
  updateTimerDisplay,
  stopSessionTimer,
  getLocalDateStr,
  normalizeDateStr,
  getCalendarDayDiff,
  getDisplayStreak,
  getStreakBadgeInfo,
  updateStreakOnAttempt,
  openReview,
  closeReview,
  formatQuestionAnswer,
  buildFinishReviewHTML,
  wireFinishReviewInteractions
};

// We need these utility page/navigation functions from app.js / global scope
// Question bank text uses light markdown (`code` and **bold**); escape first, then render it.
function md(str) {
  const s = safeHTML(str);
  if (typeof s !== "string") return s;
  return s
    .replace(/`([^`\n]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
}

function setPage(pageId) {
  if (window.setPage) window.setPage(pageId);
}

registerTimerHandlers({
  onTimeout: () => submitSession(true),
  onPauseRender: () => renderQuestion()
});

registerReviewHandlers({
  onJump: (idx) => navToQuestion(idx),
  onSubmit: (force) => submitSession(force),
  onRenderQuestion: () => renderQuestion()
});

export function readinessScore() {
  const a = state.analytics;
  if (!a || !a.totalQ) return 0;
  
  // 1. Overall Accuracy (80% weight)
  const overallAcc = (a.correct / a.totalQ) * 100;

  // 2. Domain Balance Accuracy (20% weight across attempted domains)
  const attemptedDomains = blueprint.map((d) => a.domain && a.domain[d.name]).filter((s) => s && s.total > 0);
  let domainAcc = overallAcc;
  if (attemptedDomains.length > 0) {
    const sumDomainAcc = attemptedDomains.reduce((sum, s) => sum + ((s.correct / s.total) * 100), 0);
    domainAcc = sumDomainAcc / attemptedDomains.length;
  }

  const baseScore = overallAcc * 0.8 + domainAcc * 0.2;

  // 3. Volume Confidence Factor (scales smoothly up to 1.0 at 50 solved questions)
  const volumeFactor = Math.min(1, Math.max(0.2, a.totalQ / 50));

  return Math.round(baseScore * volumeFactor);
}

export function passProbability() {
  const a = state.analytics;
  if (!a || !a.totalQ) return 0;
  return Math.max(5, Math.min(98, Math.round(readinessScore() * 0.95 + 5)));
}

export function readinessLabel(score) {
  const a = state.analytics;
  if (!a || !a.totalQ) return "Not Started";
  if (score < 50) return "Beginner";
  if (score < 70) return "Intermediate";
  if (score < 85) return "Exam Ready";
  return "Likely Pass";
}

export function calcDomainAccuracy() {
  const out = {};
  blueprint.forEach((d) => {
    const s = state.analytics.domain[d.name] || { total: 0, correct: 0 };
    out[d.name] = s.total ? Math.round((s.correct / s.total) * 100) : 0;
  });
  return out;
}

export function renderStatsCards(targetId, cards) {
  const el = byId(targetId);
  if (el) {
    const nextHtml = cards.map((c) => {
      const strVal = String(c.v ?? "");
      const isLongText = strVal.length > 12;
      return `<div class="stat"><div class="k">${c.k}</div><div class="v"${isLongText ? ' style="font-size: 16px; line-height: 1.35; overflow-wrap: anywhere;"' : ""}>${c.v}</div></div>`;
    }).join("");
    if (el.innerHTML !== nextHtml) {
      el.innerHTML = nextHtml;
    }
  }
}

const ENGINE_MODE_LABELS = {
  study: "GUIDED LEARNING · INSTANT COACHING",
  quiz: "TIMED SECTION QUIZ",
  exam: "CERTIFICATION SIMULATION · 120 MIN",
  smart: "ADAPTIVE WEAK-DOMAIN DRILL",
  missed: "SPACED REPETITION RECOVERY"
};

function syncEngineModeChrome(session) {
  const shell = document.querySelector("#engine .exam-shell");
  if (shell) {
    shell.classList.remove("mode-study", "mode-quiz", "mode-exam", "mode-smart", "mode-missed");
    if (session?.mode) shell.classList.add(`mode-${session.mode}`);
  }
  const subEl = byId("engineModeSubtitle");
  if (subEl) {
    subEl.textContent = ENGINE_MODE_LABELS[session?.mode] || "CCNA 200-301";
  }
}

export function resumeSavedSession() {
  const saved = getSavedUnfinishedSession();
  if (!saved || saved.submitted) return false;
  ensureBank();
  state.session = saved;

  const modeTitleEl = byId("modeTitle");
  if (modeTitleEl) modeTitleEl.textContent = saved.title || "Practice Session";
  const modeDescEl = byId("modeDesc");
  if (modeDescEl) modeDescEl.textContent = saved.desc || "";
  syncEngineModeChrome(saved);

  byId("timer")?.classList.remove("hidden");
  persistSession();
  setPage("engine");
  byId("reviewArea")?.classList.add("hidden");
  byId("resultArea")?.classList.add("hidden");
  byId("questionArea")?.classList.remove("hidden");
  const examFooter = byId("examFooter") || document.querySelector(".exam-footer");
  if (examFooter) examFooter.style.display = "flex";

  startSessionTimer();
  renderNavigator();
  renderQuestion();
  return true;
}

export function discardSavedSession() {
  stopSessionTimer();
  state.session = null;
  clearSavedSessionStorage();
  renderResumeQuizBanner();
  showToast("Unfinished quiz session discarded.", "info");
}

export function renderResumeQuizBanner() {
  const homeSection = byId("home");
  if (!homeSection) return;
  let banner = byId("resumeQuizBanner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "resumeQuizBanner";
    banner.className = "card resume-banner hidden";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Resume unfinished quiz");
    homeSection.insertBefore(banner, homeSection.firstElementChild);
  }

  const saved = getSavedUnfinishedSession();
  if (!saved || saved.submitted || !Array.isArray(saved.questions) || saved.questions.length === 0) {
    banner.classList.add("hidden");
    banner.innerHTML = "";
    return;
  }

  const totalQ = saved.questions.length;
  const curQ = Math.min(totalQ, (Number(saved.idx) || 0) + 1);
  const answeredCount = saved.questions.filter((q, i) => isQuestionAnswered(q, saved.answers?.[i])).length;
  const remTime = toMMSS(saved.timeLeft || 0);

  banner.innerHTML = `
    <div class="resume-banner-inner">
      <div class="resume-banner-info">
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:4px;">
          <span class="badge" style="border-color:rgba(0,242,254,0.45);color:var(--brand);margin:0;">⏸ Unfinished Quiz</span>
          <strong style="font-size:15px;">Resume quiz? — ${safeHTML(saved.title || "Practice Quiz")}</strong>
        </div>
        <p class="muted" style="margin:0; font-size:13px;">
          Question ${curQ} of ${totalQ} &nbsp;·&nbsp; ${answeredCount}/${totalQ} answered &nbsp;·&nbsp; ⏱ ${remTime} left${saved.timerPaused ? " (Paused)" : ""}
        </p>
      </div>
      <div class="resume-banner-actions">
        <button type="button" id="btnResumeSavedQuiz" class="primary" aria-label="Resume unfinished quiz">▶ Resume Quiz</button>
        <button type="button" id="btnDiscardSavedQuiz" class="secondary" aria-label="Discard unfinished quiz">✕ Discard</button>
      </div>
    </div>
  `;
  banner.classList.remove("hidden");

  byId("btnResumeSavedQuiz")?.addEventListener("click", () => {
    resumeSavedSession();
  });
  byId("btnDiscardSavedQuiz")?.addEventListener("click", () => {
    discardSavedSession();
  });
}

export function renderHome() {
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
  if (heroStreak) {
    const streakInfo = getStreakBadgeInfo(getDisplayStreak(state.analytics));
    if (heroStreak.innerHTML !== streakInfo.html) {
      heroStreak.innerHTML = streakInfo.html;
    }
  }
  if (heroLabs) heroLabs.textContent = `${state.analytics.labsCompleted || 0} / 10`;
  
  renderResumeQuizBanner();

  if (window.updateHeaderProfile) window.updateHeaderProfile();

  const bankLength = state.bank ? state.bank.length : 0;
  const easy = state.bank ? state.bank.filter(q => q.difficulty === "Easy").length : 0;
  const medium = state.bank ? state.bank.filter(q => q.difficulty === "Medium").length : 0;
  const hard = state.bank ? state.bank.filter(q => q.difficulty === "Hard").length : 0;
  const targetTotal = blueprint.reduce((s, d) => s + d.count, 0);
  const coveragePct = Math.round(((bankLength || targetTotal) / targetTotal) * 100);
  renderStatsCards("bankStats", [
    { k: "Total Questions", v: bankLength || targetTotal },
    { k: "Blueprint Coverage", v: `${coveragePct}%` },
    { k: "Easy", v: easy || 75 },
    { k: "Medium", v: medium || 101 },
    { k: "Hard", v: hard || 65 },
    { k: "Question Types", v: "Single / Multi / Matching / Drag / Scenario" }
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

export function renderDomainChecks() {
  const wrap = byId("domainChecks");
  if (wrap && wrap.children.length === 0) {
    wrap.innerHTML = blueprint.map((d, i) => `<label><input class="qdomain" type="checkbox" value="${d.name}" ${i === 0 ? "checked" : ""} /> ${d.name} (${d.weight}%)</label>`).join("");
  }
}

export function weakTopicBoost(q) {
  const t = state.analytics.topic[q.topic] || { total: 0, correct: 0 };
  const acc = t.total ? t.correct / t.total : 0.55;
  // Adaptive difficulty tier multiplier based on user proficiency in this topic
  let diffMultiplier = 1.0;
  if (t.total < 3) {
    // Beginner / unpracticed topic: favor Easy heavily, reduce Hard
    if (q.difficulty === "Easy") diffMultiplier = 1.5;
    else if (q.difficulty === "Medium") diffMultiplier = 0.9;
    else if (q.difficulty === "Hard") diffMultiplier = 0.4;
  } else if (acc >= 0.75) {
    // Advanced: student has mastered basics, ramp up Hard and Medium
    if (q.difficulty === "Easy") diffMultiplier = 0.5;
    else if (q.difficulty === "Medium") diffMultiplier = 1.2;
    else if (q.difficulty === "Hard") diffMultiplier = 1.6;
  } else {
    // Intermediate: standard gradual spread
    if (q.difficulty === "Easy") diffMultiplier = 1.0;
    else if (q.difficulty === "Medium") diffMultiplier = 1.2;
    else if (q.difficulty === "Hard") diffMultiplier = 0.8;
  }
  return Math.max(0.2, (1.3 - acc) * diffMultiplier);
}

const DIFF_ORDER = { Easy: 1, Medium: 2, Hard: 3 };

export function weightedSelection(count, domains, gradualOrder = true) {
  const set = domains && domains.length ? new Set(domains) : null;
  const pool = state.bank.filter((q) => !set || set.has(q.domain));
  // Shuffle scored pool before weighted iteration to prevent deterministic ordering
  const scored = shuffle(pool.map((q) => ({ q, w: weakTopicBoost(q) })));
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

  // Gradual progression: sequence the delivered session from Easy (foundations) -> Medium (application) -> Hard (troubleshooting)
  if (gradualOrder) {
    out.sort((a, b) => (DIFF_ORDER[a.difficulty] || 2) - (DIFF_ORDER[b.difficulty] || 2));
  }

  return out;
}

export function examSelection() {
  const list = [];
  blueprint.forEach((d) => {
    const n = Math.round((d.weight / 100) * 120);
    list.push(...shuffle(state.bank.filter((q) => q.domain === d.name)).slice(0, Math.max(1, n)));
  });
  return shuffle(list).slice(0, 120);
}

export function ensureBank() {
  if (!state.bank || state.bank.length === 0) {
    state.bank = generateBank(rand);
  }
  return state.bank;
}

export function startChapterSession(chapterId, chapterTitle = "") {
  ensureBank();
  const chQs = shuffle(state.bank.filter((q) => q.chapter === chapterId));
  if (!chQs.length) {
    showToast(`No practice questions found for chapter ${chapterId}.`, "warn", 3500);
    return;
  }
  // Order Easy -> Medium -> Hard for gradual chapter mastery
  chQs.sort((a, b) => (DIFF_ORDER[a.difficulty] || 2) - (DIFF_ORDER[b.difficulty] || 2));

  const m = /^v(\d+)c(\d+)$/i.exec(chapterId);
  const label = m ? `Vol ${m[1]} Ch ${Number(m[2])}` : chapterId.toUpperCase();
  const conf = {
    title: `${label}${chapterTitle ? `: ${chapterTitle}` : ""} Drill`,
    desc: `Official Cert Guide Chapter Drill (${chQs.length} questions, Easy → Medium → Hard with instant coaching).`,
    showFeedback: true,
    hideScoreUntilEnd: false,
    minutes: Math.max(15, chQs.length * 2),
    questions: chQs
  };

  showToast(`${conf.title} initiated (${chQs.length} questions).`, "info", 3000);

  stopSessionTimer();

  const totalDurationSec = conf.minutes * 60;
  state.session = {
    mode: "study",
    chapterId,
    ...conf,
    idx: 0,
    answers: new Array(conf.questions.length).fill(null),
    flagged: {},
    revealed: {},
    feedback: {},
    statsApplied: {},
    startedAt: Date.now(),
    qStartAt: Date.now(),
    totalDurationSec,
    timeLeft: totalDurationSec,
    deadlineAt: Date.now() + totalDurationSec * 1000,
    timerPaused: false,
    pausedAt: null,
    timer: null,
    submitted: false
  };
  persistSession();

  const modeTitleEl = byId("modeTitle");
  if (modeTitleEl) modeTitleEl.textContent = conf.title;
  const modeDescEl = byId("modeDesc");
  if (modeDescEl) modeDescEl.textContent = conf.desc;
  syncEngineModeChrome(state.session);

  byId("timer")?.classList.remove("hidden");
  startSessionTimer();

  setPage("engine");
  byId("reviewArea").classList.add("hidden");
  byId("resultArea").classList.add("hidden");
  byId("questionArea").classList.remove("hidden");
  const examFooter = byId("examFooter") || document.querySelector(".exam-footer");
  if (examFooter) examFooter.style.display = "flex";
  renderNavigator();
  renderQuestion();
}

export function startSession(mode) {
  ensureBank();
  state.bank = shuffle(state.bank);
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
      title: "CCNA Certification Exam",
      desc: "Timed 120-question exam simulation: answer keys locked until final submission.",
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

  stopSessionTimer();

  const totalDurationSec = conf.minutes * 60;
  state.session = {
    mode,
    ...conf,
    idx: 0,
    answers: new Array(conf.questions.length).fill(null),
    flagged: {},
    revealed: {},
    feedback: {},
    statsApplied: {},
    startedAt: Date.now(),
    qStartAt: Date.now(),
    totalDurationSec,
    timeLeft: totalDurationSec,
    deadlineAt: Date.now() + totalDurationSec * 1000,
    timerPaused: false,
    pausedAt: null,
    timer: null,
    submitted: false
  };
  persistSession();

  const modeTitleEl = byId("modeTitle");
  if (modeTitleEl) modeTitleEl.textContent = conf.title;
  const modeDescEl = byId("modeDesc");
  if (modeDescEl) modeDescEl.textContent = conf.desc;
  syncEngineModeChrome(state.session);

  byId("timer")?.classList.remove("hidden");
  startSessionTimer();

  setPage("engine");
  byId("reviewArea").classList.add("hidden");
  byId("resultArea").classList.add("hidden");
  byId("questionArea").classList.remove("hidden");
  const examFooter = byId("examFooter") || document.querySelector(".exam-footer");
  if (examFooter) examFooter.style.display = "flex";
  renderNavigator();
  renderQuestion();
}

export function navToQuestion(i) {
  const s = state.session;
  if (!s) return;
  s.idx = Math.max(0, Math.min(s.questions.length - 1, i));
  s.qStartAt = Date.now();
  persistSession();
  renderNavigator();
  renderQuestion();

  const qa = byId("questionArea");
  if (qa) qa.scrollTop = 0;
  window.scrollTo(0, 0);

  const sidebar = document.querySelector(".left");
  const backdrop = byId("sidebarBackdrop");
  const examBackdrop = byId("examNavBackdrop");
  if (sidebar && sidebar.classList.contains("active")) {
    sidebar.classList.remove("active");
  }
  if (backdrop && backdrop.classList.contains("active")) {
    backdrop.classList.remove("active");
  }
  if (examBackdrop && examBackdrop.classList.contains("active")) {
    examBackdrop.classList.remove("active");
  }
}

export function renderNavigator() {
  const s = state.session;
  if (!s || !Array.isArray(s.questions)) return;
  if (!s.flagged) s.flagged = {};
  if (!s.revealed) s.revealed = {};

  const navEl = byId("qNav");
  if (navEl) {
    navEl.innerHTML = s.questions.map((q, i) => {
      const isCurrent = i === s.idx;
      const isAns = isQuestionAnswered(q, s.answers[i]);
      const isFlag = Boolean(s.flagged[i]);
      const isRev = Boolean(s.revealed[i]);
      let cls = "qbtn";
      if (isCurrent) cls += " current";
      if (isAns) cls += " answered";
      if (isFlag) cls += " flagged";
      if (isRev) cls += " revealed";
      const labelParts = [`Question ${i + 1}`];
      if (isCurrent) labelParts.push("current");
      if (isAns) labelParts.push("answered");
      if (isFlag) labelParts.push("flagged");
      if (isRev) labelParts.push("answer revealed");
      return `<button type="button" class="${cls}" data-qnav="${i}" aria-label="${labelParts.join(", ")}" aria-current="${isCurrent ? "step" : "false"}">${i + 1}</button>`;
    }).join("");

    navEl.querySelectorAll("[data-qnav]").forEach((b) => {
      b.addEventListener("click", () => navToQuestion(Number(b.dataset.qnav)));
    });
  }

  const qCounterEl = byId("qCounter");
  if (qCounterEl) qCounterEl.textContent = `Q ${s.idx + 1} / ${s.questions.length}`;
  const answeredCount = s.questions.filter((q, i) => isQuestionAnswered(q, s.answers[i])).length;
  const flaggedCount = Object.values(s.flagged).filter(Boolean).length;
  const revealedCount = Object.values(s.revealed).filter(Boolean).length;
  const pct = Math.round(((s.idx + 1) / s.questions.length) * 100);
  const fillEl = byId("progressFill");
  if (fillEl) fillEl.style.width = `${pct}%`;
  const pctEl = byId("progressPct");
  if (pctEl) pctEl.textContent = `${pct}%`;
  const navMetaEl = byId("navMeta");
  if (navMetaEl) {
    navMetaEl.textContent = `Answered: ${answeredCount} | Flagged: ${flaggedCount}${revealedCount ? ` | Revealed: ${revealedCount}` : ""}`;
  }
}

export function markCurrent() {
  const s = state.session;
  if (!s || s.submitted || s.timerPaused) return;
  if (!s.flagged) s.flagged = {};
  const isFlagged = !s.flagged[s.idx];
  s.flagged[s.idx] = isFlagged;
  const markBtn = byId("toggleMark");
  if (markBtn) {
    markBtn.setAttribute("aria-pressed", isFlagged ? "true" : "false");
    markBtn.classList.toggle("is-flagged", isFlagged);
    const mFull = markBtn.querySelector(".btn-full-text");
    const mMobile = markBtn.querySelector(".btn-mobile-text");
    if (mFull) mFull.textContent = isFlagged ? "🚩 Unmark Review" : "🚩 Mark For Review";
    if (mMobile) mMobile.textContent = isFlagged ? "🚩 Unmark" : "🚩 Mark";
  }
  const qFlagBadge = byId("qHeaderFlagBadge");
  if (qFlagBadge) qFlagBadge.classList.toggle("hidden", !isFlagged);
  persistSession();
  renderNavigator();
}

export function revealCurrentAnswer() {
  const s = state.session;
  if (!s || s.submitted || s.timerPaused) return;
  if (!s.revealed) s.revealed = {};
  s.revealed[s.idx] = true;
  persistSession();
  renderNavigator();
  renderQuestion();
}

export function jumpToSubmittedQuestion(idx) {
  const s = state.session;
  if (!s) return;
  s.idx = Math.max(0, Math.min(s.questions.length - 1, Number(idx) || 0));
  byId("resultArea")?.classList.add("hidden");
  byId("reviewArea")?.classList.add("hidden");
  byId("questionArea")?.classList.remove("hidden");
  const examFooter = byId("examFooter") || document.querySelector(".exam-footer");
  if (examFooter) examFooter.style.display = "flex";
  renderNavigator();
  renderQuestion();
  window.scrollTo(0, 0);
}

export function returnToResults() {
  byId("questionArea")?.classList.add("hidden");
  byId("reviewArea")?.classList.add("hidden");
  byId("resultArea")?.classList.remove("hidden");
  const examFooter = byId("examFooter") || document.querySelector(".exam-footer");
  if (examFooter) examFooter.style.display = "none";
  window.scrollTo(0, 0);
}

export function answerEquals(q, ans) {
  const isMulti = q.type === "multi" || (Array.isArray(q.correct) && q.correct.length > 1);
  if (isMulti) {
    if (!Array.isArray(ans)) return false;
    return [...ans].sort((a, b) => a - b).join(",") === [...q.correct].sort((a, b) => a - b).join(",");
  }
  if (q.type === "single" || q.type === "scenario") return ans === q.correct[0];
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

export function applyStats(q, ok, sec = 0) {
  const a = state.analytics;
  a.totalQ += 1;
  if (ok) a.correct += 1;
  if (sec && typeof sec === "number") a.totalTime += sec;

  if (!a.domain[q.domain]) a.domain[q.domain] = { total: 0, correct: 0 };
  a.domain[q.domain].total += 1;
  if (ok) a.domain[q.domain].correct += 1;

  if (!a.topic[q.topic]) a.topic[q.topic] = { total: 0, correct: 0 };
  a.topic[q.topic].total += 1;
  if (ok) a.topic[q.topic].correct += 1;

  if (q.chapter) {
    if (!a.chapter) a.chapter = {};
    if (!a.chapter[q.chapter]) a.chapter[q.chapter] = { total: 0, correct: 0 };
    a.chapter[q.chapter].total += 1;
    if (ok) a.chapter[q.chapter].correct += 1;
  }
}

// Question topic -> video hub topic. Question topics come from the blueprint; video topics use
// the hub's own category names, so a plain string match misses most of them.
const VIDEO_TOPIC_MAP = {
  "osi/tcp-ip": "OSI / TCP-IP", "tcp/udp": "OSI / TCP-IP", "switching": "VLANs", "cabling": "Hardware",
  "ethernet": "Hardware", "cloud": "CCNA Core", "network architecture": "CCNA Core",
  "switch cli": "CCNA Core", "switch interfaces": "Hardware", "router cli": "CCNA Core",
  "ip routing": "CCNA Core", "ipv6 routing": "IPv6", "wan": "CCNA Core",
  "security architecture": "Security", "device security": "Security",
  "ipv4": "IPv4", "subnetting": "Subnetting", "ipv6": "IPv6", "wireless": "Wireless", "wlan": "Wireless",
  "virtualization": "CCNA Core", "vlans": "VLANs", "trunking": "VLANs", "dtp/vtp": "VLANs", "cdp/lldp": "CCNA Core",
  "stp": "STP", "etherchannel": "EtherChannel", "routing table": "CCNA Core", "static routes": "CCNA Core",
  "ospf": "OSPF", "fhrp": "FHRP / HSRP", "nat": "NAT", "ntp": "NTP", "dhcp": "DHCP", "dns": "DNS",
  "snmp": "SNMP", "syslog": "Syslog", "qos": "QoS", "ssh/tftp": "SSH", "threats": "Security", "acls": "ACLs",
  "port security": "Security", "dhcp snooping/dai": "Security", "aaa": "Security", "vpn": "Security",
  "wireless security": "Security", "sdn": "Automation", "controllers": "Automation", "rest/json": "APIs / Data",
  "config management": "DevOps / IAC"
};

export function findVideoForTopic(topic) {
  if (!topic) return null;
  const want = (VIDEO_TOPIC_MAP[String(topic).toLowerCase()] || topic).toLowerCase();
  return ccnaVideos.find((v) => String(v.topic || "").toLowerCase() === want) || null;
}

function formatChapterBadge(chapterId) {
  if (!chapterId) return "";
  const m = /^v(\d+)c(\d+)$/i.exec(chapterId);
  return m ? `OCG Vol ${m[1]} Ch ${Number(m[2])}` : String(chapterId).toUpperCase();
}

export function explanationBlock(q, ok, forceShow = false) {
  if (!forceShow && !state.session.showFeedback) return "";
  const e = q.expl;
  if (!e) return "";

  let videoBtnHtml = "";
  const matchedVideo = findVideoForTopic(q.topic);
  if (matchedVideo) {
    videoBtnHtml += `
        <button type="button" class="secondary btn-video-watch expl-resource-btn" data-youtube-id="${safeHTML(String(matchedVideo.youtubeId))}" data-video-title="${safeHTML(String(matchedVideo.title))}" data-video-id="${safeHTML(String(matchedVideo.id))}">📺 Watch Related Lesson</button>
      `;
  }
  if (q.chapter) {
    const chLabel = formatChapterBadge(q.chapter);
    videoBtnHtml += `
        <button type="button" class="secondary expl-guide-btn" onclick="window.openGuideChapter && window.openGuideChapter('${safeHTML(String(q.chapter))}')">📖 Open ${safeHTML(chLabel)} in Study Guide</button>
      `;
  }

  const wrongItems = Array.isArray(e.wrong) ? e.wrong.filter(Boolean) : [];
  const cmds = Array.isArray(e.commands) ? e.commands.filter(Boolean) : [];

  if (e.text && !e.why) {
    return `
      <section class="block expl-panel ${ok ? "correct" : "wrong"}" aria-live="polite">
        <div class="expl-panel-head">
          <h4>${ok ? "Verified Explanation" : "Detailed Explanation"}</h4>
        </div>
        <p>${md(e.text)}</p>
        ${e.tip ? `<div class="expl-tip-box"><strong>Exam Tip:</strong> ${md(e.tip)}</div>` : ""}
        ${cmds.length > 0 ? `<div class="expl-cmds-row"><strong>IOS Commands:</strong> ${cmds.map(x => `<code class="expl-cmd-chip">${safeHTML(x)}</code>`).join(" ")}</div>` : ""}
        ${videoBtnHtml ? `<div class="expl-resource-actions">${videoBtnHtml}</div>` : ""}
      </section>
    `;
  }

  return `
    <section class="block expl-panel ${ok ? "correct" : "wrong"}" aria-live="polite">
      <div class="expl-panel-head">
        <h4>${ok ? "Correct Answer Rationale" : "Detailed Explanation"}</h4>
        ${e.correct ? `<span class="expl-key-badge">Answer: ${safeHTML(e.correct)}</span>` : ""}
      </div>
      ${e.why ? `<p class="expl-why-lead">${md(e.why)}</p>` : ""}
      ${wrongItems.length > 0 ? `<div class="expl-distractors"><strong>Why other options are incorrect:</strong><ul>${wrongItems.map(w => `<li>${md(w)}</li>`).join("")}</ul></div>` : ""}
      ${e.tip ? `<div class="expl-tip-box"><strong>Cisco Exam Tip:</strong> ${md(e.tip)}</div>` : ""}
      ${e.memory ? `<div class="expl-memory-box"><strong>Memory Aid:</strong> ${md(e.memory)}</div>` : ""}
      ${e.real ? `<div class="expl-real-box"><strong>Production Scenario:</strong> ${md(e.real)}</div>` : ""}
      ${cmds.length > 0 ? `<div class="expl-cmds-row"><strong>Related IOS Commands:</strong> ${cmds.map(x => `<code class="expl-cmd-chip">${safeHTML(x)}</code>`).join(" ")}</div>` : ""}
      ${videoBtnHtml ? `<div class="expl-resource-actions">${videoBtnHtml}</div>` : ""}
    </section>
  `;
}

function getFormatBadgeLabel(q, isMulti) {
  if (isMulti) return "Multi-Select";
  if (q.type === "matching") return "Matching Pairs";
  if (q.type === "dragdrop" || Array.isArray(q.order)) return "Sequence Ordering";
  if (q.type === "scenario" || q.cli || q.topology || q.scenario) return "Technical Scenario";
  return "Single Choice";
}

export function renderQuestion() {
  const s = state.session;
  if (!s || !Array.isArray(s.questions)) return;
  const q = s.questions[s.idx];
  if (!q) return;

  if (!s.revealed) s.revealed = {};
  if (!s.flagged) s.flagged = {};
  if (!s.feedback) s.feedback = {};

  const isRevealed = Boolean(s.revealed[s.idx]);
  const isFlagged = Boolean(s.flagged[s.idx]);
  const isSubmitted = Boolean(s.submitted);
  const isChecked = s.feedback[s.idx] != null;
  const isPaused = Boolean(s.timerPaused) && !isSubmitted;
  const inputsDisabled = isPaused || isSubmitted || isRevealed;
  const isMulti = q.type === "multi" || (Array.isArray(q.correct) && q.correct.length > 1);
  const isExamMode = s.mode === "exam";

  const chBadge = q.chapter ? `<span class="badge q-badge-chapter">${safeHTML(formatChapterBadge(q.chapter))}</span>` : "";
  const formatLabel = getFormatBadgeLabel(q, isMulti);
  let html = "";

  if (isSubmitted) {
    html += `
      <div class="submitted-inspect-bar">
        <span class="inspect-bar-label">Inspecting Question ${s.idx + 1} of ${s.questions.length}</span>
        <button type="button" id="backToResultsBtn" class="primary" aria-label="Return to quiz results and review list">⬅️ Back to Results</button>
      </div>
    `;
  }

  html += `<article class="exam-question-card">`;
  html += `
    <div class="q-header-strip">
      <div class="q-header-badges">
        <span class="badge q-badge-num">Question ${s.idx + 1} of ${s.questions.length}</span>
        <span class="badge badge-neutral">${safeHTML(formatLabel)}</span>
        <span class="badge">${safeHTML(q.domain)}</span>
        ${q.topic ? `<span class="badge badge-neutral">${safeHTML(q.topic)}</span>` : ""}
        ${chBadge}
        <span id="qHeaderFlagBadge" class="badge badge-warning q-badge-flagged${isFlagged ? "" : " hidden"}">🚩 Flagged</span>
      </div>
    </div>
    ${q.scenario ? `<section class="block exam-exhibit exam-exhibit-scenario"><div class="exam-exhibit-head">SCENARIO BRIEF</div><div class="exam-exhibit-body">${safeHTML(q.scenario)}</div></section>` : ""}
    <h3 class="q-prompt-heading">${md(q.text)}</h3>
    <div class="meta">
      <div><strong>Difficulty</strong><span>${safeHTML(q.difficulty || "Standard")}</span></div>
      <div><strong>Exam Weight</strong><span>${safeHTML(q.examWeight || "Weighted")}</span></div>
      <div><strong>Topic Domain</strong><span>${safeHTML(q.domain)}</span></div>
      <div><strong>Expected Frequency</strong><span>${safeHTML(q.frequency || "Core")}</span></div>
    </div>
    ${q.topology ? `<section class="block exam-exhibit exam-exhibit-topo"><div class="exam-exhibit-head">NETWORK TOPOLOGY EXHIBIT</div><div class="exam-exhibit-body">${safeHTML(q.topology).replace(/\n/g, "<br />")}</div></section>` : ""}
    ${q.cli ? `<section class="block cli exam-exhibit exam-exhibit-cli"><div class="exam-exhibit-head">CISCO IOS CLI OUTPUT</div><div class="exam-exhibit-body">${safeHTML(q.cli).replace(/\n/g, "<br />")}</div></section>` : ""}
    ${q.packet ? `<section class="block packet exam-exhibit exam-exhibit-packet"><div class="exam-exhibit-head">PACKET HEADER EXHIBIT</div><div class="exam-exhibit-body">${safeHTML(q.packet)}</div></section>` : ""}
  `;

  // Highlight correct options when checked in study mode, revealed via Show Answer, or reviewing after submit
  const highlightOptions = (isChecked || isRevealed || isSubmitted) && Array.isArray(q.correct);
  const stateClass = (i, picked) => {
    if (!highlightOptions) return "";
    if (q.correct.includes(i)) return " correct";
    return picked ? " wrong" : "";
  };

  if (isMulti) {
    const selected = Array.isArray(s.answers[s.idx]) ? s.answers[s.idx] : [];
    const reqCount = Array.isArray(q.correct) ? q.correct.length : 2;
    html += `
      <div class="q-format-instruction multi-select-banner">
        <span>Select <strong>${reqCount}</strong> answer choices</span>
        <span id="multiSelectCounter" class="multi-count-pill${selected.length === reqCount ? " is-complete" : ""}">${selected.length} / ${reqCount} selected</span>
      </div>
    `;
    html += `<div class="options-list" role="group" aria-label="Multiple choice answer options">` + q.options.map((o, i) => {
      const letter = String.fromCharCode(65 + i);
      const isSelected = selected.includes(i);
      return `<label class="opt opt-multi${isSelected ? ' selected' : ''}${stateClass(i, isSelected)}${inputsDisabled ? ' disabled' : ''}" data-idx="${i}">
        <input type="checkbox" value="${i}" ${isSelected ? "checked" : ""} ${inputsDisabled ? "disabled" : ""} aria-checked="${isSelected ? "true" : "false"}" aria-label="Option ${letter}">
        <span class="opt-key" aria-hidden="true">${letter}</span>
        <span class="opt-text">${md(o)}</span>
      </label>`;
    }).join("") + `</div>`;
  } else if (q.type === "single" || q.type === "scenario") {
    const v = s.answers[s.idx];
    html += `<div class="q-format-instruction"><span>Choose the single best option (Keyboard <kbd>A</kbd>–<kbd>D</kbd>).</span></div>`;
    html += `<div class="options-list" role="radiogroup" aria-label="Answer options">` + q.options.map((o, i) => {
      const letter = String.fromCharCode(65 + i);
      const isSelected = v === i;
      return `<label class="opt opt-single${isSelected ? ' selected' : ''}${stateClass(i, isSelected)}${inputsDisabled ? ' disabled' : ''}" data-idx="${i}">
        <input type="radio" name="single" value="${i}" ${isSelected ? "checked" : ""} ${inputsDisabled ? "disabled" : ""} aria-checked="${isSelected ? "true" : "false"}" aria-label="Option ${letter}">
        <span class="opt-key" aria-hidden="true">${letter}</span>
        <span class="opt-text">${md(o)}</span>
      </label>`;
    }).join("") + `</div>`;
  } else if (q.type === "matching") {
    const cur = s.answers[s.idx] || {};
    html += `<div class="q-format-instruction"><span>Pair each item on the left with its matching definition on the right.</span></div>`;
    html += `<div class="options-list match-card-list" role="group" aria-label="Matching pairs">`;
    q.pairs.forEach((pair, i) => {
      if (!s._matchOpts) s._matchOpts = {};
      if (!s._matchOpts[s.idx]) s._matchOpts[s.idx] = shuffle(q.pairs.map((x) => x[1]));
      const opts = s._matchOpts[s.idx];
      const hasVal = Boolean(cur[i]);
      const matchState = (isChecked || isRevealed || isSubmitted)
        ? (cur[i] === pair[1] ? " correct" : " wrong")
        : "";
      html += `
        <div class="opt match-row${hasVal ? " has-match" : ""}${matchState}">
          <div class="match-left">
            <span class="match-num">${i + 1}</span>
            <strong>${md(pair[0])}</strong>
          </div>
          <div class="match-right">
            <select data-match="${i}" aria-label="Select match for ${safeHTML(pair[0])}" ${inputsDisabled ? "disabled" : ""}>
              <option value="">Select match…</option>
              ${opts.map((x) => `<option ${cur[i] === x ? "selected" : ""} value="${safeHTML(x)}">${safeHTML(x)}</option>`).join("")}
            </select>
          </div>
        </div>
      `;
    });
    html += `</div>`;
  } else {
    if (!s._dragInit) s._dragInit = {};
    if (!s._dragInit[s.idx]) {
      let start = shuffle([...q.order]);
      for (let tries = 0; tries < 20 && start.join("||") === q.order.join("||"); tries++) {
        start = shuffle([...q.order]);
      }
      if (start.join("||") === q.order.join("||") && start.length > 1) start = [...start.slice(1), start[0]];
      s._dragInit[s.idx] = start;
    }
    const order = s.answers[s.idx] || s._dragInit[s.idx];
    if (!s.answers[s.idx]) {
      s.answers[s.idx] = [...order];
      persistSession();
    }
    html += `<div class="q-format-instruction"><span>Arrange these ${order.length} items into correct operational sequence.</span></div>`;
    html += `<div class="options-list drag-card-list" role="group" aria-label="Ordering steps">`;
    order.forEach((step, i) => {
      const stepState = (isChecked || isRevealed || isSubmitted)
        ? (step === q.order[i] ? " correct" : " wrong")
        : "";
      html += `
        <div class="opt drag-step-row${stepState}">
          <span class="drag-pos">${i + 1}</span>
          <span class="drag-step-text">${md(step)}</span>
          <div class="drag-controls">
            <button type="button" class="secondary drag-move-btn" data-up="${i}" aria-label="Move step ${i + 1} up" ${inputsDisabled || i === 0 ? "disabled" : ""}>↑ Up</button>
            <button type="button" class="secondary drag-move-btn" data-down="${i}" aria-label="Move step ${i + 1} down" ${inputsDisabled || i === order.length - 1 ? "disabled" : ""}>↓ Down</button>
          </div>
        </div>
      `;
    });
    html += `</div>`;
  }

  // Action bar with Exam-mode answer reveal protection
  if (!isSubmitted) {
    const needsCheckBtn = s.mode === "study" && !isChecked && !isRevealed && (isMulti || q.type === "matching" || q.type === "dragdrop");
    html += `
      <div class="question-action-bar">
        ${needsCheckBtn ? `<button type="button" id="btnCheckAnswer" class="primary" ${isPaused ? "disabled" : ""}>Check Answer</button>` : ""}
        ${!isExamMode && !isRevealed && !isChecked ? `<button type="button" id="showAnswerBtn" class="secondary" ${isPaused ? "disabled" : ""} aria-label="Show correct answer (marks question as revealed and excludes from score)">👁️ Show Answer</button>` : ""}
        ${isExamMode ? `<span class="exam-lock-pill">Answer Key Locked Until Submission</span>` : ""}
        ${isRevealed ? `<span class="badge revealed-notice" role="status" aria-live="polite">Answer Revealed — Excluded from Score</span>` : ""}
        <button type="button" id="pauseTimerBtn" class="secondary" aria-pressed="${isPaused ? "true" : "false"}" aria-label="${isPaused ? "Resume quiz timer (Shortcut P)" : "Pause quiz timer (Shortcut P)"}">${isPaused ? "▶️ Resume Timer" : "⏸️ Pause Timer"}</button>
      </div>
    `;
  }

  const ok = s.feedback[s.idx];
  if (ok != null || isRevealed || isSubmitted) {
    const effectiveOk = isRevealed ? false : (ok != null ? ok : answerEquals(q, s.answers[s.idx]));
    if (q.type === "matching" || q.type === "dragdrop") {
      html += `<div class="block correct" style="margin-top:14px;"><strong>Correct Solution:</strong> ${formatQuestionAnswer(q, null, false)}</div>`;
    }
    html += explanationBlock(q, effectiveOk, isRevealed || isSubmitted);
  }
  html += `</article>`;

  if (isPaused) {
    html += `
      <div id="quizPausedOverlay" class="quiz-paused-overlay" role="dialog" aria-modal="false" aria-label="Quiz Paused">
        <div class="quiz-paused-card">
          <div class="quiz-paused-icon" aria-hidden="true">⏸️</div>
          <h4>Examination Timer Paused</h4>
          <p class="muted">Countdown halted without drift and inputs are locked. Press <kbd>P</kbd> or select Resume below to continue.</p>
          <button type="button" id="resumeFromOverlayBtn" class="primary" aria-label="Resume quiz timer">▶️ Resume Session</button>
        </div>
      </div>
    `;
  }

  const qa = byId("questionArea");
  if (qa) {
    qa.classList.toggle("is-paused", isPaused);
    qa.innerHTML = html;
  }

  const prevBtn = byId("prevQ");
  const markBtn = byId("toggleMark");
  const openReviewBtn = byId("openReview");
  const saveNextBtn = byId("saveNext");
  const submitSessionBtn = byId("submitSession");

  if (prevBtn) {
    prevBtn.style.display = "";
    prevBtn.disabled = (s.idx === 0) || isPaused;
    const pFull = prevBtn.querySelector(".btn-full-text");
    const pMobile = prevBtn.querySelector(".btn-mobile-text");
    if (pFull) pFull.textContent = "⬅️ Previous";
    if (pMobile) pMobile.textContent = "⬅️ Prev";
  }

  if (isSubmitted) {
    if (markBtn) markBtn.style.display = "none";
    if (openReviewBtn) openReviewBtn.style.display = "none";
    if (saveNextBtn) {
      saveNextBtn.style.display = s.idx < s.questions.length - 1 ? "" : "none";
      saveNextBtn.disabled = false;
    }
    if (submitSessionBtn) {
      submitSessionBtn.style.display = "";
      submitSessionBtn.innerHTML = `<span class="btn-full-text">⬅️ Back to Results</span><span class="btn-mobile-text">⬅️ Results</span>`;
    }
  } else {
    if (markBtn) {
      markBtn.style.display = "";
      markBtn.disabled = isPaused;
      markBtn.setAttribute("aria-pressed", isFlagged ? "true" : "false");
      markBtn.classList.toggle("is-flagged", isFlagged);
      const mFull = markBtn.querySelector(".btn-full-text");
      const mMobile = markBtn.querySelector(".btn-mobile-text");
      if (mFull) mFull.textContent = isFlagged ? "🚩 Unmark Review" : "🚩 Mark For Review";
      if (mMobile) mMobile.textContent = isFlagged ? "🚩 Unmark" : "🚩 Mark";
    }
    if (openReviewBtn) {
      openReviewBtn.style.display = "";
      openReviewBtn.disabled = isPaused;
    }

    if (s.idx === s.questions.length - 1) {
      if (saveNextBtn) saveNextBtn.style.display = "none";
      if (submitSessionBtn) {
        submitSessionBtn.style.display = "";
        submitSessionBtn.disabled = isPaused;
        const fullLabel = s.mode === "exam" ? "Submit Exam" : "Submit Quiz";
        submitSessionBtn.innerHTML = `<span class="btn-full-text">${fullLabel}</span><span class="btn-mobile-text">Submit</span>`;
      }
    } else {
      if (saveNextBtn) {
        saveNextBtn.style.display = "";
        saveNextBtn.disabled = isPaused;
      }
      if (submitSessionBtn) submitSessionBtn.style.display = "none";
    }
  }

  wireQuestionInputs();

  requestAnimationFrame(() => {
    const qArea = byId("questionArea");
    if (qArea) qArea.scrollTop = 0;
    if (window.setupScrollCollapseHeader) window.setupScrollCollapseHeader();
  });
}

function syncSelectedClasses() {
  byId("questionArea")?.querySelectorAll("label.opt").forEach((l) => {
    const inp = l.querySelector("input[type=radio], input[type=checkbox]");
    if (inp) {
      l.classList.toggle("selected", inp.checked);
      inp.setAttribute("aria-checked", inp.checked ? "true" : "false");
    }
  });
}

export function wireQuestionInputs() {
  const s = state.session;
  if (!s) return;
  const q = s.questions[s.idx];
  const qa = byId("questionArea");
  if (!qa) return;

  qa.querySelectorAll("input[type='radio'][name='single']").forEach((el) => {
    el.addEventListener("change", (e) => {
      if (s.timerPaused || s.submitted || s.revealed?.[s.idx]) return;
      s.answers[s.idx] = Number(el.value);
      syncSelectedClasses();
      persistSession();
      instantStudyFeedback(e);
      renderNavigator();
    });
  });

  qa.querySelectorAll("input[type='checkbox']").forEach((el) => {
    el.addEventListener("change", () => {
      if (s.timerPaused || s.submitted || s.revealed?.[s.idx]) return;
      const checked = [...qa.querySelectorAll("input[type='checkbox']:checked")].map((x) => Number(x.value));
      s.answers[s.idx] = checked;
      const counterEl = byId("multiSelectCounter");
      if (counterEl) {
        const req = Array.isArray(q.correct) ? q.correct.length : 2;
        counterEl.textContent = `${checked.length} / ${req} selected`;
        counterEl.classList.toggle("is-complete", checked.length === req);
      }
      syncSelectedClasses();
      persistSession();
      renderNavigator();
    });
  });

  qa.querySelectorAll("[data-match]").forEach((el) => {
    el.addEventListener("change", () => {
      if (s.timerPaused || s.submitted || s.revealed?.[s.idx]) return;
      const cur = s.answers[s.idx] || {};
      cur[Number(el.dataset.match)] = el.value;
      s.answers[s.idx] = cur;
      el.closest(".match-row")?.classList.toggle("has-match", Boolean(el.value));
      persistSession();
      renderNavigator();
    });
  });

  qa.querySelectorAll("[data-up]").forEach((el) => {
    el.addEventListener("click", () => {
      if (s.timerPaused || s.submitted || s.revealed?.[s.idx]) return;
      const i = Number(el.dataset.up);
      const list = s.answers[s.idx] || [...q.order];
      if (i <= 0) return;
      [list[i], list[i - 1]] = [list[i - 1], list[i]];
      s.answers[s.idx] = list;
      persistSession();
      renderQuestion();
      renderNavigator();
    });
  });

  qa.querySelectorAll("[data-down]").forEach((el) => {
    el.addEventListener("click", () => {
      if (s.timerPaused || s.submitted || s.revealed?.[s.idx]) return;
      const i = Number(el.dataset.down);
      const list = s.answers[s.idx] || [...q.order];
      if (i >= list.length - 1) return;
      [list[i], list[i + 1]] = [list[i + 1], list[i]];
      s.answers[s.idx] = list;
      persistSession();
      renderQuestion();
      renderNavigator();
    });
  });

  const checkBtn = byId("btnCheckAnswer");
  if (checkBtn) {
    checkBtn.addEventListener("click", (e) => {
      if (s.timerPaused || s.submitted) return;
      instantStudyFeedback(e);
    });
  }

  const showAnswerBtn = byId("showAnswerBtn");
  if (showAnswerBtn) {
    showAnswerBtn.addEventListener("click", () => {
      revealCurrentAnswer();
    });
  }

  const pauseTimerBtn = byId("pauseTimerBtn");
  if (pauseTimerBtn) {
    pauseTimerBtn.addEventListener("click", () => {
      toggleTimerPause(() => renderQuestion());
    });
  }

  const resumeOverlayBtn = byId("resumeFromOverlayBtn");
  if (resumeOverlayBtn) {
    resumeOverlayBtn.addEventListener("click", () => {
      if (s.timerPaused) {
        toggleTimerPause(() => renderQuestion());
      }
    });
  }

  const backToResultsBtn = byId("backToResultsBtn");
  if (backToResultsBtn) {
    backToResultsBtn.addEventListener("click", () => {
      returnToResults();
    });
  }
}

export function instantStudyFeedback(e) {
  const s = state.session;
  if (!s || s.mode !== "study") return;
  const q = s.questions[s.idx];
  const isRevealed = Boolean(s.revealed && s.revealed[s.idx]);
  const ans = s.answers[s.idx];
  const ok = !isRevealed && answerEquals(q, ans);
  s.feedback[s.idx] = ok;

  if (!s.statsApplied) s.statsApplied = {};
  if (!isRevealed && !s.statsApplied[s.idx]) {
    s.statsApplied[s.idx] = true;
    applyStats(q, ok, 35);
  }

  if (!state.analytics.missedIds) state.analytics.missedIds = [];
  if (ok) {
    state.analytics.missedIds = state.analytics.missedIds.filter(id => id !== q.id);
    gainXP(10);

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

  updateStreakOnAttempt();
  persistSession();
  renderQuestion();
  renderHome();
}

export function nextQuestion() {
  if (!state.session || state.session.timerPaused) return;
  navToQuestion(state.session.idx + 1);
}

export function prevQuestion() {
  if (!state.session || state.session.timerPaused) return;
  const ra = byId("reviewArea");
  if (ra && !ra.classList.contains("hidden")) {
    closeReview();
    return;
  }
  navToQuestion(state.session.idx - 1);
}

export function saveAndNext() {
  if (!state.session || state.session.timerPaused) return;
  if (!state.session.submitted) {
    applyQuestionTime();
  }
  nextQuestion();
}

export function applyQuestionTime() {
  const s = state.session;
  if (!s || s.timerPaused) return;
  const spent = Math.max(3, Math.floor((Date.now() - s.qStartAt) / 1000));
  state.analytics.totalTime += spent;
  s.qStartAt = Date.now();
}

export function submitSession(force) {
  const s = state.session;
  if (!s) return;
  if (s.submitted) {
    returnToResults();
    return;
  }

  const answeredCount = s.questions.filter((q, i) => isQuestionAnswered(q, s.answers[i])).length;
  const revealedCount = Object.values(s.revealed || {}).filter(Boolean).length;
  if (answeredCount === 0 && revealedCount === 0 && !force) {
    if (!confirm("You haven't answered any questions. Are you sure you want to submit?")) {
      return;
    }
  }

  const reviewOpen = !byId("reviewArea")?.classList.contains("hidden");
  if (s.mode === "exam" && !force && !reviewOpen) {
    openReview();
    return;
  }

  if (s.timerPaused && s.pausedAt) {
    const pausedDelta = Math.max(0, Date.now() - s.pausedAt);
    if (typeof s.startedAt === "number") s.startedAt += pausedDelta;
    s.pausedAt = null;
  }
  s.timerPaused = false;
  s.submitted = true;
  stopSessionTimer();
  persistSession();
  const timer = byId("timer");
  if (timer) timer.classList.add("hidden");

  let correct = 0;
  let scoredTotal = 0;
  const domain = {};

  if (!state.analytics.missedIds) state.analytics.missedIds = [];
  if (!s.statsApplied) s.statsApplied = {};

  s.questions.forEach((q, i) => {
    const isRev = Boolean(s.revealed && s.revealed[i]);
    const ok = !isRev && answerEquals(q, s.answers[i]);

    if (!isRev) {
      scoredTotal += 1;
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

      if (!s.statsApplied[i]) {
        s.statsApplied[i] = true;
        applyStats(q, ok, 0);
      }
    } else {
      // Revealed questions are excluded from score & XP, and queued for spaced repetition review
      if (!state.analytics.missedIds.includes(q.id)) {
        state.analytics.missedIds.push(q.id);
      }
      if (!domain[q.domain]) domain[q.domain] = { total: 0, correct: 0 };
    }
  });

  const total = s.questions.length;
  const pct = scoredTotal > 0 ? Math.round((correct / scoredTotal) * 100) : 0;
  
  if (scoredTotal > 0 && pct >= 80) gainXP(30);
  updateStreakOnAttempt();
  
  state.analytics.studyMin += Math.max(0, Math.round((Date.now() - s.startedAt) / 60000));
  state.analytics.attempts.push({
    mode: s.mode,
    total,
    scoredTotal,
    revealed: revealedCount,
    correct,
    score: pct,
    at: new Date().toISOString()
  });
  state.analytics.attempts = state.analytics.attempts.slice(-40);

  saveAnalytics(true);
  showToast(`Session submitted! Score: ${pct}%`, "ok", 4000);
  renderHome();

  const domainEntries = Object.entries(domain).filter(([, v]) => v.total > 0);
  const weak = domainEntries.map(([k, v]) => ({ k, p: Math.round((v.correct / v.total) * 100) })).sort((a, b) => a.p - b.p).slice(0, 2);
  const strong = domainEntries.map(([k, v]) => ({ k, p: Math.round((v.correct / v.total) * 100) })).sort((a, b) => b.p - a.p).slice(0, 2);
  const unansweredCount = s.questions.filter((q, i) => !isQuestionAnswered(q, s.answers[i])).length;
  const incorrectCount = Math.max(0, scoredTotal - correct);
  const totalSec = Number(s.totalDurationSec) || (Number(s.minutes) || 20) * 60;
  const elapsedSec = Math.max(0, totalSec - (Number(s.timeLeft) || 0));
  const timeUsedStr = toMMSS(elapsedSec);
  const scoreToneClass = pct >= 80 ? "is-pass" : pct >= 60 ? "is-mid" : "is-low";

  let html = `
    <div class="exam-results-shell" aria-live="polite">
      <div class="card exam-results-hero ${scoreToneClass}">
        <div class="exam-results-head">
          <div>
            <span class="exam-sub-kicker">ASSESSMENT REPORT // ${safeHTML(String(s.mode || "quiz").toUpperCase())}</span>
            <h2>${safeHTML(s.title)}</h2>
            <p class="exam-results-sub">Time Used: <strong>${timeUsedStr}</strong> &middot; ${total} Total Questions${revealedCount ? ` &middot; ${revealedCount} Revealed (Excluded)` : ""}</p>
          </div>
          <div class="exam-score-callout ${scoreToneClass}">
            <span class="exam-score-num">${pct}%</span>
            <span class="exam-score-label">${s.mode === "exam" ? (pct >= 80 ? "Pass Benchmark Met" : "Below Benchmark") : "Final Score"}</span>
          </div>
        </div>

        <div class="exam-results-kpis">
          <div class="er-kpi"><span class="k">Correct</span><strong class="v er-ok">${correct}/${scoredTotal}</strong></div>
          <div class="er-kpi"><span class="k">Incorrect</span><strong class="v er-bad">${incorrectCount}</strong></div>
          <div class="er-kpi"><span class="k">Unanswered</span><strong class="v">${unansweredCount}</strong></div>
          <div class="er-kpi"><span class="k">Time Used</span><strong class="v">${timeUsedStr}</strong></div>
          <div class="er-kpi"><span class="k">Readiness</span><strong class="v">${readinessLabel(readinessScore())}</strong></div>
          <div class="er-kpi"><span class="k">Pass Probability</span><strong class="v">${passProbability()}%</strong></div>
        </div>
      </div>
    </div>
  `;

  if (domainEntries.length > 0) {
    html += `<div class="card exam-domain-card"><h3>Domain Performance Breakdown</h3>${domainEntries.map(([d, v]) => {
      const domPct = Math.round((v.correct / v.total) * 100);
      const color = domPct >= 80 ? "#10b981" : domPct >= 50 ? "#f59e0b" : "#ef4444";
      return `
        <div class="domain-item">
          <div class="domain-header">
            <strong>${safeHTML(d)}</strong>
            <span class="pct">${v.correct}/${v.total} (${domPct}%)</span>
          </div>
          <div class="progress"><div style="width:${domPct}%; background:${color};"></div></div>
        </div>
      `;
    }).join("")}</div>`;
    html += `<div class="grid stats exam-focus-summary"><div class="stat"><div class="k">Weakest Domains</div><div class="v" style="font-size:15px">${weak.map((x) => `${safeHTML(x.k)} (${x.p}%)`).join("<br />") || "N/A"}</div></div><div class="stat"><div class="k">Strongest Domains</div><div class="v" style="font-size:15px">${strong.map((x) => `${safeHTML(x.k)} (${x.p}%)`).join("<br />") || "N/A"}</div></div><div class="stat"><div class="k">Recommended Next Practice</div><div class="v" style="font-size:14.5px">15 questions / 15 mins on ${weak.map((x) => safeHTML(x.k)).join(" + ") || "All Domains"}</div></div></div>`;
  }

  if (s.mode === "exam") {
    let statusText = "";
    let statusClass = "";
    let readinessDesc = "";

    if (pct >= 85) {
      statusText = "CCNA READY (Highly Prepared)";
      statusClass = "is-ready";
      readinessDesc = "Outstanding performance! Your score is above the safety margin for the Cisco 200-301 blueprint. You demonstrate a solid grasp of core networking protocols, CLI commands, and automation architecture.";
    } else if (pct >= 75) {
      statusText = "PREPARED WITH MINOR GAPS";
      statusClass = "is-marginal";
      readinessDesc = "Good attempt! You have a solid foundation near the exam passing boundary. Target your lowest-accuracy domains (especially CLI command verification and subnet calculations) before sitting the live certification exam.";
    } else {
      statusText = "NOT READY (Major Gaps Found)";
      statusClass = "is-gap";
      readinessDesc = "Additional preparation recommended. Your score falls below the target certification benchmark. Review the highlighted Official Cert Guide chapters, run Virtual IOS Labs, and practice timed section drills before scheduling.";
    }

    const weakDomains = domainEntries
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
        return `<li><strong>${safeHTML(d.name)} (${d.pct}%):</strong> Study <u>${refs}</u></li>`;
      }).join("");
    } else {
      recommendedReadings = "<li>All domains scoring above 80%. Maintain proficiency with mixed scenario drills and OSPF/Automation verification.</li>";
    }

    html += `
      <div class="card exam-readiness-panel ${statusClass}">
        <div class="exam-readiness-head">
          <h3>CCNA 200-301 Readiness Analysis</h3>
          <span class="exam-readiness-badge ${statusClass}">${statusText}</span>
        </div>
        <p class="exam-readiness-desc">${readinessDesc}</p>
        <div class="exam-readiness-refs">
          <h4>Recommended Official Cert Guide Review</h4>
          <ul>${recommendedReadings}</ul>
        </div>
      </div>
    `;
  }

  // Full Answer Review screen with All / Incorrect / Flagged filters and Jump to question links
  html += buildFinishReviewHTML(s, { answerEqualsFn: answerEquals });

  html += `<div class="exam-results-actions"><button id="backHome" class="primary">Return to Command Center</button><button id="goAnalytics" class="secondary">Open Analytics</button></div>`;

  const resultAreaEl = byId("resultArea");
  if (resultAreaEl) {
    resultAreaEl.innerHTML = html;
    resultAreaEl.classList.remove("hidden");
    wireFinishReviewInteractions(resultAreaEl, {
      onJumpToQuestion: (idx) => jumpToSubmittedQuestion(idx)
    });
    resultAreaEl.scrollTop = 0;
  }
  byId("reviewArea")?.classList.add("hidden");
  byId("questionArea")?.classList.add("hidden");
  const examFooter = byId("examFooter") || document.querySelector(".exam-footer");
  if (examFooter) examFooter.style.display = "none";

  window.scrollTo(0, 0);

  byId("backHome")?.addEventListener("click", () => setPage("home"));
  byId("goAnalytics")?.addEventListener("click", () => setPage("analytics"));
}

export function exportAnalyticsProgress() {
  try {
    const payload = JSON.stringify(state.analytics, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const dateStr = getLocalDateStr();
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ccna-progress-${dateStr}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    showToast(`Downloaded ccna-progress-${dateStr}.json`, "ok");
    return true;
  } catch (err) {
    console.error("Failed to export analytics:", err);
    showToast("Failed to export progress JSON.", "error");
    return false;
  }
}

export async function importAnalyticsFromFile(file) {
  if (!file) return false;
  try {
    const text = await file.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      showToast("Invalid progress file: JSON parse failed.", "error");
      return false;
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      showToast("Invalid progress file: root must be a JSON object.", "error");
      return false;
    }

    // Validate required numeric keys from core.js L118
    const requiredNums = [
      "totalQ",
      "correct",
      "xp",
      "studyMin",
      "totalTime",
      "labsCompleted",
      "subnetMaxStreak",
      "streak"
    ];
    for (const key of requiredNums) {
      if (typeof parsed[key] !== "number" || !Number.isFinite(parsed[key]) || parsed[key] < 0) {
        showToast(`Invalid progress file: missing or invalid numeric field "${key}".`, "error");
        return false;
      }
    }

    const base = createDefaultAnalytics();
    const candidate = {
      ...base,
      ...parsed
    };
    if (!validateAnalyticsSchema(candidate)) {
      showToast("Invalid progress file: failed analytics schema validation.", "error");
      return false;
    }

    if (!confirm("Overwrite your current progress with the imported file? This will replace your current telemetry and streak.")) {
      showToast("Progress import cancelled.", "info");
      return false;
    }

    if (candidate.lastAttemptDate) {
      candidate.lastAttemptDate = normalizeDateStr(candidate.lastAttemptDate);
    }
    state.analytics = migrateBankVersion(candidate);
    saveAnalytics(false);
    renderHome();
    renderAnalytics();
    if (window.updateHeaderProfile) window.updateHeaderProfile();
    showToast("Progress imported successfully!", "ok");
    return true;
  } catch (err) {
    console.error("Import progress error:", err);
    showToast("Failed to import progress file.", "error");
    return false;
  }
}

export function renderAnalytics() {
  const attempts = state.analytics.attempts || [];
  const narrativeEl = byId("analyticsNarrative");
  const narrativeTextEl = byId("analyticsNarrativeText");
  const da = calcDomainAccuracy();
  const rs = readinessScore();
  const pp = passProbability();
  const label = readinessLabel(rs);

  // Update Hero elements
  const heroScoreEl = byId("readinessHeroScore");
  if (heroScoreEl) heroScoreEl.textContent = `${rs}%`;

  const heroTierEl = byId("readinessTierTitle");
  if (heroTierEl) heroTierEl.textContent = label;

  const heroStatusPill = byId("readinessStatusPill");
  if (heroStatusPill) {
    heroStatusPill.textContent = rs >= 85 ? "Exam Ready Status" : rs >= 70 ? "Targeting Pass Margin" : rs > 0 ? "Diagnostic Foundation" : "Awaiting Diagnostic Data";
  }

  const heroRingFill = byId("readinessHeroRingFill");
  if (heroRingFill) {
    const circumference = 238.76;
    const offset = Math.round(circumference * (1 - rs / 100));
    heroRingFill.style.strokeDashoffset = offset;
    heroRingFill.style.stroke = rs >= 85 ? "var(--color-success, #30d158)" : rs >= 70 ? "var(--color-tint, #0071e3)" : rs >= 50 ? "var(--color-warning, #ff9f0a)" : "var(--color-danger, #ff453a)";
  }

  const passProbValEl = byId("readinessPassProbVal");
  if (passProbValEl) passProbValEl.textContent = `${pp}%`;

  const prepStatusEl = byId("analyticsPrepStatus");
  if (prepStatusEl) prepStatusEl.textContent = label;

  const lastActivityEl = byId("analyticsLastActivity");
  if (lastActivityEl) {
    if (attempts.length > 0 && attempts[attempts.length - 1].at) {
      try {
        lastActivityEl.textContent = `Last: ${new Date(attempts[attempts.length - 1].at).toLocaleDateString()}`;
      } catch {
        lastActivityEl.textContent = `Last: Session #${attempts.length}`;
      }
    } else {
      lastActivityEl.textContent = "Last activity: None";
    }
  }

  const weak = Object.entries(da).sort((a, b) => a[1] - b[1])[0];
  const strong = Object.entries(da).sort((a, b) => b[1] - a[1])[0];
  const totalQ = state.analytics.totalQ || 0;
  const correct = state.analytics.correct || 0;
  const overallAcc = totalQ ? Math.round((correct / totalQ) * 100) : 0;
  const avg = totalQ ? Math.round(state.analytics.totalTime / totalQ) : 0;
  const studyHours = ((state.analytics.studyMin || 0) / 60).toFixed(1);

  const domainFocusGuidance = {
    "Network Fundamentals": "Strengthen your understanding of IPv4/IPv6 addressing, subnetting math, cabling standards, and TCP/UDP transport operations.",
    "Network Access": "Strengthen your understanding of 802.1Q VLAN trunking, EtherChannel (LACP), Rapid PVST+, and Cisco wireless architectures.",
    "IP Connectivity": "Strengthen your understanding of IPv4/IPv6 routing tables, longest-prefix match, administrative distance, and single-area OSPFv2.",
    "IP Services": "Strengthen your understanding of Inside Source NAT (Static & PAT), DHCP server & relay, NTP synchronization, and SNMP/Syslog.",
    "Security Fundamentals": "Strengthen your understanding of standard & extended IPv4 ACLs, Layer 2 security (DHCP snooping, DAI, port-security), and AAA.",
    "Automation and Programmability": "Strengthen your understanding of RESTCONF, JSON data encoding, controller-based SDN architectures, and Ansible/Puppet/Chef."
  };

  // Update Narrative insight banner & Actionable Next Focus Box
  if (narrativeEl) {
    narrativeEl.classList.remove("hidden");
    let narrativeText = "";
    if (attempts.length === 0) {
      narrativeText = "Welcome to your Readiness Dashboard. Complete your first practice quiz, simulated exam, or virtual lab to compile real-time diagnostic telemetry, domain breakdown analytics, and your CCNA readiness rating.";
    } else if (rs >= 85) {
      narrativeText = `Excellent progress! Your readiness score is <strong>${rs}%</strong>, indicating a high likelihood of passing the CCNA exam. Continue to review your weak areas, particularly <strong>${weak[0]}</strong> (${weak[1]}%), to maintain peak performance.`;
    } else if (rs >= 70) {
      narrativeText = `You are in the intermediate readiness zone at <strong>${rs}%</strong>. You demonstrate solid competency in <strong>${strong[0]}</strong> (${strong[1]}%), but security and connectivity controls remain critical improvement vectors. Focus heavily on <strong>${weak[0]}</strong> (${weak[1]}%) to cross the exam readiness threshold.`;
    } else {
      narrativeText = `Telemetry analysis indicates an active readiness score of <strong>${rs}%</strong>. To construct a reliable pass margin, prioritize high-impact study sessions. Your weakest domain is currently <strong>${weak[0]}</strong> (${weak[1]}%), which represents the largest leverage point for boosting your overall rating.`;
    }
    if (narrativeTextEl) {
      narrativeTextEl.innerHTML = narrativeText;
    } else {
      narrativeEl.innerHTML = `<div class="analytics-narrative-eyebrow"><span>📡</span><span>Telemetry Insights</span></div><p class="analytics-narrative-content">${narrativeText}</p>`;
    }

    const focusTitleEl = byId("nextFocusDomainTitle");
    const focusDescEl = byId("nextFocusDomainDesc");
    const focusCtaEl = byId("btnNextFocusCta");
    if (focusTitleEl && focusDescEl && focusCtaEl) {
      if (attempts.length === 0 || !weak) {
        focusTitleEl.textContent = "Diagnostic Baseline Session";
        focusDescEl.textContent = "Start a Study Mode session or 10-question Section Quiz to establish your baseline accuracy across the 6 Cisco CCNA blueprint domains.";
        focusCtaEl.textContent = "Start Practice Session →";
        focusCtaEl.onclick = () => window.setPage("home");
      } else {
        const weakDomainName = weak[0];
        const weakAcc = weak[1];
        focusTitleEl.innerHTML = `${safeHTML(weakDomainName)} <span class="focus-acc-pill">${weakAcc}% accuracy</span>`;
        focusDescEl.textContent = domainFocusGuidance[weakDomainName] || `Strengthen your understanding of ${weakDomainName} objectives to raise your overall CCNA readiness.`;
        focusCtaEl.textContent = `⚡ Practice ${weakDomainName} Now →`;
        focusCtaEl.onclick = () => {
          if (window.startDomainDrill) window.startDomainDrill(weakDomainName);
          else window.setPage("home");
        };
      }
    }
  }

  // Render balanced 6-card KPI Telemetry Strip
  renderStatsCards("analyticsStats", [
    { k: "Questions Answered", v: totalQ },
    { k: "Overall Accuracy", v: `${overallAcc}%` },
    { k: "Quizzes Completed", v: attempts.length },
    { k: "Study Hours", v: `${studyHours}h` },
    { k: "Average Time / Question", v: `${avg}s` },
    { k: "Weakest Domain", v: weak && attempts.length > 0 ? `${weak[0]} (${weak[1]}%)` : "N/A" }
  ]);

  // Render Domain Breakdown cards (ALWAYS renders all 6 domains with .domain-ring-card)
  const dasharray = 132;
  const domainBreakdownEl = byId("domainBreakdown");
  if (domainBreakdownEl) {
    domainBreakdownEl.innerHTML = `
      <div class="analytics-domains-grid">
        ${blueprint.map((d) => {
          const s = state.analytics.domain && state.analytics.domain[d.name] ? state.analytics.domain[d.name] : { total: 0, correct: 0 };
          const p = da[d.name] || 0;
          const color = p >= 80 ? "var(--color-success, #30d158)" : p >= 50 ? "var(--color-warning, #ff9f0a)" : "var(--color-danger, #ff453a)";
          const dashoffset = Math.round(dasharray * (1 - p / 100));
          const isWeak = weak && weak[0] === d.name && attempts.length > 0;
          return `
            <div class="domain-ring-card${isWeak ? ' is-weak-domain' : ''}">
              <div class="domain-ring-card-top">
                <div class="domain-ring">
                  <svg viewBox="0 0 52 52" aria-hidden="true">
                    <circle class="ring-bg" cx="26" cy="26" r="21"></circle>
                    <circle class="ring-fill" cx="26" cy="26" r="21" stroke="${color}" stroke-dasharray="${dasharray}" stroke-dashoffset="${dashoffset}"></circle>
                  </svg>
                  <span class="ring-label" style="color: ${color};">${p}%</span>
                </div>
                <div class="domain-ring-info">
                  <div class="domain-badge-row">
                    <span class="domain-weight-pill">${d.weight}% Exam Weight</span>
                    ${isWeak ? '<span class="domain-focus-pill">Focus Area</span>' : ''}
                  </div>
                  <strong>${safeHTML(d.name)}</strong>
                  <span class="domain-sub-metric">${s.correct || 0} / ${s.total || 0} correct (${p}% accuracy)</span>
                </div>
              </div>
              <div class="domain-bar-wrap">
                <div class="domain-progress-bar">
                  <div class="domain-progress-fill" style="width: ${p}%; background: ${color};"></div>
                </div>
              </div>
              <div class="domain-card-actions">
                <span class="domain-target-note">Target: 80%+</span>
                <button type="button" class="domain-drill-btn" onclick="window.startDomainDrill && window.startDomainDrill('${safeHTML(d.name)}')">Practice Domain →</button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  // Render Trend Chart & Recent Sessions
  const trendEl = byId("trend");
  if (trendEl) {
    if (attempts.length === 0) {
      trendEl.innerHTML = `
        <div class="trend-empty-state">
          <div class="trend-empty-icon">📈</div>
          <h4 style="margin: 0 0 6px 0; font-size: 14px; color: var(--color-label);">No Active Telemetry Trends</h4>
          <p style="margin: 0 0 16px 0; font-size: 12.5px; color: var(--color-secondary-label);">Complete quizzes or practice sessions to visualize your score trajectory over time.</p>
          <button class="btn btn-primary btn-sm" onclick="window.setPage('home')">Start Practice Session</button>
        </div>
      `;
    } else {
      const recent = attempts.slice(-10);
      const points = recent.map((att, idx) => {
        const score = Math.max(0, Math.min(100, Number(att.score) || 0));
        const x = recent.length === 1 ? 430 : 75 + Math.round((idx / (recent.length - 1)) * 710);
        const y = Math.round(135 - (score / 100) * 100);
        return { x, y, score, idx: idx + 1, mode: att.mode || "quiz", correct: att.correct || 0, total: att.total || 0, at: att.at };
      });

      let pathD = "";
      let areaD = "";
      if (points.length === 1) {
        pathD = `M ${points[0].x - 40} ${points[0].y} L ${points[0].x + 40} ${points[0].y}`;
        areaD = `M ${points[0].x - 40} 135 L ${points[0].x - 40} ${points[0].y} L ${points[0].x + 40} ${points[0].y} L ${points[0].x + 40} 135 Z`;
      } else {
        pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
        areaD = `${pathD} L ${points[points.length - 1].x} 135 L ${points[0].x} 135 Z`;
      }

      const svgHtml = `
        <div class="trend-sparkline-wrap">
          <div class="trend-sparkline-header">
            <span>Score Trajectory (Last ${recent.length} Sessions)</span>
            <strong>Target: 80% Passing Benchmark</strong>
          </div>
          <svg class="trend-chart-svg" viewBox="0 0 860 165" preserveAspectRatio="xMidYMid meet" aria-label="Score Trend Chart">
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--color-tint)" stop-opacity="0.25" />
                <stop offset="100%" stop-color="var(--color-tint)" stop-opacity="0.0" />
              </linearGradient>
            </defs>
            <!-- Horizontal Reference Gridlines (Exact 1px/% scale: y = 135 - score) -->
            <line x1="50" y1="35" x2="820" y2="35" stroke="var(--color-separator)" stroke-width="1" />
            <text x="40" y="38" fill="var(--color-secondary-label)" font-size="10" text-anchor="end" font-family="var(--font-mono)">100%</text>

            <line x1="50" y1="55" x2="820" y2="55" stroke="var(--color-success, #30d158)" stroke-width="1.5" stroke-dasharray="5 4" opacity="0.75" />
            <text x="40" y="58" fill="var(--color-success, #30d158)" font-size="10" font-weight="700" text-anchor="end" font-family="var(--font-mono)">80%</text>

            <line x1="50" y1="85" x2="820" y2="85" stroke="var(--color-separator)" stroke-width="1" />
            <text x="40" y="88" fill="var(--color-secondary-label)" font-size="10" text-anchor="end" font-family="var(--font-mono)">50%</text>

            <line x1="50" y1="135" x2="820" y2="135" stroke="var(--color-separator)" stroke-width="1" />
            <text x="40" y="138" fill="var(--color-secondary-label)" font-size="10" text-anchor="end" font-family="var(--font-mono)">0%</text>

            <!-- Area fill and trend line -->
            <path d="${areaD}" fill="url(#trendGradient)"></path>
            <path d="${pathD}" fill="none" stroke="var(--color-tint)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>
            <!-- Data points -->
            ${points.map((p) => {
              const col = p.score >= 80 ? "var(--color-success, #30d158)" : p.score >= 60 ? "var(--color-warning, #ff9f0a)" : "var(--color-danger, #ff453a)";
              const labelY = p.y < 32 ? p.y + 18 : p.y - 10;
              return `
                <g>
                  <circle cx="${p.x}" cy="${p.y}" r="5" fill="var(--surface-card)" stroke="${col}" stroke-width="2.5"></circle>
                  <text x="${p.x}" y="${labelY}" fill="var(--color-label)" font-size="11" font-weight="700" text-anchor="middle" font-family="var(--font-mono)">${p.score}%</text>
                  <text x="${p.x}" y="153" fill="var(--color-secondary-label)" font-size="9.5" text-anchor="middle" font-family="var(--font-mono)">#${p.idx} ${safeHTML(String(p.mode).toUpperCase())}</text>
                </g>
              `;
            }).join("")}
          </svg>
        </div>
      `;

      const listHtml = `
        <div class="trend-sessions-list">
          ${recent.slice().reverse().map((att, idx) => {
            const score = Number(att.score) || 0;
            const col = score >= 80 ? "var(--color-success, #30d158)" : score >= 60 ? "var(--color-warning, #ff9f0a)" : "var(--color-danger, #ff453a)";
            const dateStr = att.at ? new Date(att.at).toLocaleDateString() : `Session #${attempts.length - idx}`;
            return `
              <div class="trend-row-item">
                <div style="font-size:13px; color:var(--color-label);">
                  <span class="trend-mode-badge">${safeHTML(String(att.mode || "quiz").toUpperCase())}</span>
                  <strong>${att.correct || 0}/${att.total || 0} Qs</strong>
                  <span style="color:var(--color-secondary-label); font-size:11.5px; margin-left:8px;">${safeHTML(dateStr)}</span>
                </div>
                <span class="trend-score-pill" style="color:${col};">${score}%</span>
              </div>
            `;
          }).join("")}
        </div>
      `;

      trendEl.innerHTML = svgHtml + listHtml;
    }
  }

  renderAchievements();
}

export function renderAchievements() {
  const a = state.analytics;
  const rs = readinessScore();
  const da = calcDomainAccuracy();
  const displayStreak = getDisplayStreak(a);
  const xp = a.xp || 0;
  const info = getLevelInfo(xp);

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
      title: "Century Club",
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
      title: "OSPF Specialist",
      desc: "Reach 80% or higher accuracy in the IP Connectivity domain (min 5 Qs).",
      unlocked: (da["IP Connectivity"] || 0) >= 80 && (a.domain && a.domain["IP Connectivity"] ? a.domain["IP Connectivity"].total : 0) >= 5,
      icon: "🕸️"
    },
    {
      id: "routing_champion",
      title: "Routing Champion",
      desc: "Successfully run OSPF and ROAS packet traversal paths.",
      unlocked: Boolean(a.simPathsRun && a.simPathsRun.ospf && a.simPathsRun.roas),
      icon: "🏆"
    },
    {
      id: "streaks",
      title: "Consistent Learner",
      desc: "Maintain a study streak of 3 or more consecutive days.",
      unlocked: displayStreak >= 3,
      icon: "🔥"
    },
    {
      id: "ccna_ready",
      title: "CCNA Certified Ready",
      desc: "Achieve an Overall Readiness Score of 85% or higher.",
      unlocked: rs >= 85,
      icon: "🎓"
    }
  ];

  let panel = byId("achievementsPanel");
  if (!panel) {
    panel = document.createElement("section");
    panel.id = "achievementsPanel";
    panel.className = "analytics-section-card";
    const analyticsPage = byId("analytics");
    if (analyticsPage) {
      analyticsPage.appendChild(panel);
    }
  }

  if (panel) {
    panel.innerHTML = `
      <div class="analytics-section-header">
        <div>
          <h3 class="analytics-section-title">🏆 Professional Certification Badges & Learner Level</h3>
          <p class="analytics-section-desc">Unlock milestones as you demonstrate hands-on networking proficiency, domain mastery, and study consistency.</p>
        </div>
      </div>

      <div class="achievements-level-banner">
        <div class="achievements-level-info">
          <span class="achievements-level-badge">Level ${info.level}</span>
          <span class="achievements-level-name">${safeHTML(info.label)}</span>
        </div>
        <div class="achievements-xp-bar-wrap">
          <div class="achievements-xp-meta">
            <span>Level Progression</span>
            <span>${info.currentXP} / 100 XP</span>
          </div>
          <div class="achievements-xp-bar">
            <div class="achievements-xp-fill" style="width: ${Math.min(100, info.currentXP)}%;"></div>
          </div>
        </div>
        <span class="achievements-streak-pill">🔥 ${displayStreak} Day Streak</span>
      </div>

      <div class="badges-grid">
        ${badges.map((b) => `
          <div class="badge-card ${b.unlocked ? 'unlocked' : 'locked'}">
            <div class="badge-card-icon" aria-hidden="true">${b.icon}</div>
            <div class="badge-card-body">
              <div class="badge-card-header">
                <h4 class="badge-card-title">${safeHTML(b.title)}</h4>
                <span class="badge-status-pill ${b.unlocked ? 'unlocked' : 'locked'}">
                  ${b.unlocked ? '✓ Unlocked' : '🔒 Locked'}
                </span>
              </div>
              <p class="badge-card-desc">${safeHTML(b.desc)}</p>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }
}

// Particle constellation canvas backdrop (disabled in Phase 3 for clean Apple/Linear shell; preserves DOM/API contract)
export function setupCanvasConstellation() {
  window.triggerSuccessExplosion = () => {};
  if (window._canvasResizeListener) {
    window.removeEventListener("resize", window._canvasResizeListener);
    window._canvasResizeListener = null;
  }
  if (window._canvasMouseMoveListener) {
    window.removeEventListener("mousemove", window._canvasMouseMoveListener);
    window._canvasMouseMoveListener = null;
  }
  if (window._canvasMouseOutListener) {
    window.removeEventListener("mouseout", window._canvasMouseOutListener);
    window._canvasMouseOutListener = null;
  }
}
