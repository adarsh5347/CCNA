import {
  state,
  byId,
  playNetSound,
  gainXP,
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

export function resumeSavedSession() {
  const saved = getSavedUnfinishedSession();
  if (!saved || saved.submitted) return false;
  ensureBank();
  state.session = saved;

  const modeTitleEl = byId("modeTitle");
  if (modeTitleEl) modeTitleEl.textContent = saved.title || "Practice Session";
  const modeDescEl = byId("modeDesc");
  if (modeDescEl) modeDescEl.textContent = saved.desc || "";

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
    const mFull = markBtn.querySelector(".btn-full-text");
    const mMobile = markBtn.querySelector(".btn-mobile-text");
    if (mFull) mFull.textContent = isFlagged ? "🚩 Unmark Review" : "🚩 Mark For Review";
    if (mMobile) mMobile.textContent = isFlagged ? "🚩 Unmark" : "🚩 Mark";
  }
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
        <button class="secondary btn-video-watch" style="margin-top: 12px; padding: 4px 10px; font-size: 11.5px; height: auto;" data-youtube-id="${safeHTML(String(matchedVideo.youtubeId))}" data-video-title="${safeHTML(String(matchedVideo.title))}" data-video-id="${safeHTML(String(matchedVideo.id))}">📺 Watch Related Lesson</button>
      `;
  }
  if (q.chapter) {
    const chLabel = formatChapterBadge(q.chapter);
    videoBtnHtml += `
        <button class="secondary" style="margin-top: 12px; margin-left: 6px; padding: 4px 10px; font-size: 11.5px; height: auto; border-color: rgba(0,242,254,0.35); color: #00f2fe;" onclick="window.openGuideChapter && window.openGuideChapter('${safeHTML(String(q.chapter))}')">📖 Open ${safeHTML(chLabel)} in Study Guide</button>
      `;
  }
  
  if (e.text && !e.why) {
    return `
      <section class="block ${ok ? "correct" : "wrong"}" aria-live="polite">
        <h4>Detailed Explanation</h4>
        <p>${md(e.text)}</p>
        ${e.tip ? `<p><strong>Cisco exam tip:</strong> ${md(e.tip)}</p>` : ""}
        ${videoBtnHtml}
      </section>
    `;
  }

  return `
    <section class="block ${ok ? "correct" : "wrong"}" aria-live="polite">
      <h4>Detailed Explanation</h4>
      <p><strong>Correct answer:</strong> ${safeHTML(e.correct || "")}</p>
      <p><strong>Why correct:</strong> ${md(e.why || "")}</p>
      <p><strong>Why others are wrong:</strong></p>
      <ul>
        ${(e.wrong || []).map(w => `<li>${md(w)}</li>`).join("")}
      </ul>
      ${e.tip ? `<p><strong>Cisco exam tip:</strong> ${md(e.tip)}</p>` : ""}
      ${e.memory ? `<p><strong>Memory trick:</strong> ${md(e.memory)}</p>` : ""}
      ${e.real ? `<p><strong>Real world example:</strong> ${md(e.real)}</p>` : ""}
      ${e.commands && e.commands.length > 0 ? `<p><strong>Related commands:</strong> ${e.commands.map(x => safeHTML(x)).join(" | ")}</p>` : ""}
      ${videoBtnHtml}
    </section>
  `;
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

  const chBadge = q.chapter ? `<span class="badge" style="border-color:rgba(16,185,129,0.45);color:#10b981;">📖 ${safeHTML(formatChapterBadge(q.chapter))}</span>` : "";
  let html = "";

  if (isSubmitted) {
    html += `
      <div class="submitted-inspect-bar">
        <span class="badge" style="border-color:rgba(0,242,254,0.45);color:var(--brand);margin:0;">📋 Reviewing Question ${s.idx + 1} of ${s.questions.length}</span>
        <button type="button" id="backToResultsBtn" class="primary" aria-label="Return to quiz results and review list">⬅️ Back to Results</button>
      </div>
    `;
  }

  html += `
    <span class="badge">${safeHTML(q.domain)}</span><span class="badge">${safeHTML(q.topic)}</span>${chBadge}
    ${q.scenario ? `<div class="block"><strong>Scenario:</strong> ${safeHTML(q.scenario)}</div>` : ""}
    <h3>${md(q.text)}</h3>
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

  const isMulti = q.type === "multi" || (Array.isArray(q.correct) && q.correct.length > 1);
  // Highlight correct options when checked in study mode, revealed via Show Answer, or reviewing after submit
  const highlightOptions = (isChecked || isRevealed || isSubmitted) && Array.isArray(q.correct);
  const stateClass = (i, picked) => {
    if (!highlightOptions) return "";
    if (q.correct.includes(i)) return " correct";
    return picked ? " wrong" : "";
  };

  if (isMulti) {
    const selected = Array.isArray(s.answers[s.idx]) ? s.answers[s.idx] : [];
    html += `<div class="options-list" role="group" aria-label="Multiple choice answer options">` + q.options.map((o, i) => {
      const letter = String.fromCharCode(65 + i);
      const isSelected = selected.includes(i);
      return `<label class="opt${isSelected ? ' selected' : ''}${stateClass(i, isSelected)}${inputsDisabled ? ' disabled' : ''}" data-idx="${i}">
        <input type="checkbox" value="${i}" ${isSelected ? "checked" : ""} ${inputsDisabled ? "disabled" : ""} aria-checked="${isSelected ? "true" : "false"}" aria-label="Option ${letter}">
        <span class="opt-key" aria-hidden="true">${letter}</span>
        <span>${md(o)}</span>
      </label>`;
    }).join("") + `</div>`;
  } else if (q.type === "single" || q.type === "scenario") {
    const v = s.answers[s.idx];
    html += `<div class="options-list" role="radiogroup" aria-label="Answer options">` + q.options.map((o, i) => {
      const letter = String.fromCharCode(65 + i);
      const isSelected = v === i;
      return `<label class="opt${isSelected ? ' selected' : ''}${stateClass(i, isSelected)}${inputsDisabled ? ' disabled' : ''}" data-idx="${i}">
        <input type="radio" name="single" value="${i}" ${isSelected ? "checked" : ""} ${inputsDisabled ? "disabled" : ""} aria-checked="${isSelected ? "true" : "false"}" aria-label="Option ${letter}">
        <span class="opt-key" aria-hidden="true">${letter}</span>
        <span>${md(o)}</span>
      </label>`;
    }).join("") + `</div>`;
  } else if (q.type === "matching") {
    const cur = s.answers[s.idx] || {};
    html += `<div class="options-list" role="group" aria-label="Matching pairs">`;
    q.pairs.forEach((pair, i) => {
      if (!s._matchOpts) s._matchOpts = {};
      if (!s._matchOpts[s.idx]) s._matchOpts[s.idx] = shuffle(q.pairs.map((x) => x[1]));
      const opts = s._matchOpts[s.idx];
      const matchState = (isChecked || isRevealed || isSubmitted)
        ? (cur[i] === pair[1] ? " correct" : " wrong")
        : "";
      html += `<div class="opt${matchState}" style="display: flex; flex-direction: column; align-items: stretch; gap: 8px;"><strong>${safeHTML(pair[0])}</strong><select data-match="${i}" aria-label="Select match for ${safeHTML(pair[0])}" ${inputsDisabled ? "disabled" : ""}><option value="">Select</option>${opts.map((x) => `<option ${cur[i] === x ? "selected" : ""} value="${safeHTML(x)}">${safeHTML(x)}</option>`).join("")}</select></div>`;
    });
    html += `</div>`;
  } else {
    if (!s._dragInit) s._dragInit = {};
    if (!s._dragInit[s.idx]) {
      // An untouched ordering question is auto-saved as its starting order below, so that
      // order must never equal the correct one or doing nothing would score as correct.
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
    html += `<div class="options-list" role="group" aria-label="Ordering steps">`;
    order.forEach((step, i) => {
      const stepState = (isChecked || isRevealed || isSubmitted)
        ? (step === q.order[i] ? " correct" : " wrong")
        : "";
      html += `<div class="opt${stepState}"><strong>${i + 1}.</strong> <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 16px; flex-wrap: wrap;"><span style="flex: 1; min-width: 150px;">${safeHTML(step)}</span><div class="inline" style="margin-top: 0; display: flex; gap: 8px;"><button type="button" class="secondary" data-up="${i}" aria-label="Move step ${i + 1} up" ${inputsDisabled ? "disabled" : ""} style="padding: 6px 12px; font-size: 11px; height: auto;">Up</button><button type="button" class="secondary" data-down="${i}" aria-label="Move step ${i + 1} down" ${inputsDisabled ? "disabled" : ""} style="padding: 6px 12px; font-size: 11px; height: auto;">Down</button></div></div></div>`;
    });
    html += `</div>`;
  }

  // Action bar for Show Answer, Check Answer (Study multi/matching/dragdrop), and Pause Timer
  if (!isSubmitted) {
    const needsCheckBtn = s.mode === "study" && !isChecked && !isRevealed && (isMulti || q.type === "matching" || q.type === "dragdrop");
    html += `
      <div class="question-action-bar" style="margin-top: 18px; display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
        ${needsCheckBtn ? `<button type="button" id="btnCheckAnswer" class="primary" ${isPaused ? "disabled" : ""}>Check Answer</button>` : ""}
        ${!isRevealed && !isChecked ? `<button type="button" id="showAnswerBtn" class="secondary" ${isPaused ? "disabled" : ""} aria-label="Show correct answer (marks question as revealed and excludes from score)">👁️ Show Answer</button>` : ""}
        ${isRevealed ? `<span class="badge revealed-notice" role="status" aria-live="polite">👁️ Answer Revealed — Excluded from Score</span>` : ""}
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

  if (isPaused) {
    html += `
      <div id="quizPausedOverlay" class="quiz-paused-overlay" role="dialog" aria-modal="false" aria-label="Quiz Paused">
        <div class="quiz-paused-card">
          <div class="quiz-paused-icon" aria-hidden="true">⏸️</div>
          <h4>Quiz Paused</h4>
          <p class="muted">Timer is paused and answer inputs are disabled. Press <kbd>P</kbd> or click below to continue.</p>
          <button type="button" id="resumeFromOverlayBtn" class="primary" aria-label="Resume quiz timer">▶️ Resume Quiz</button>
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

  // Phase 2: Reset scroll to top, then set up IntersectionObserver for header collapse
  // Guarded in a rAF so the DOM is fully painted before we measure/observe.
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
      s.answers[s.idx] = [...qa.querySelectorAll("input[type='checkbox']:checked")].map((x) => Number(x.value));
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

  let html = `<div aria-live="polite"><h2>Session Complete: ${safeHTML(s.title)}</h2><div class="grid stats">`;
  html += `<div class="stat"><div class="k">Score</div><div class="v">${pct}%</div></div>`;
  html += `<div class="stat"><div class="k">Correct</div><div class="v">${correct}/${scoredTotal}${revealedCount ? ` <span class="muted" style="font-size:12px;">(${revealedCount} revealed)</span>` : ""}</div></div>`;
  html += `<div class="stat"><div class="k">Readiness</div><div class="v">${readinessLabel(readinessScore())}</div></div>`;
  html += `<div class="stat"><div class="k">Pass Probability</div><div class="v">${passProbability()}%</div></div>`;
  html += `</div></div>`;

  if (domainEntries.length > 0) {
    html += `<div class="card"><h3>Domain Performance</h3>${domainEntries.map(([d, v]) => {
      const domPct = Math.round((v.correct / v.total) * 100);
      const color = domPct >= 80 ? "#10b981" : domPct >= 50 ? "#f59e0b" : "#ff5e3a";
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
    html += `<div class="grid stats"><div class="stat"><div class="k">Weak Areas</div><div class="v" style="font-size:16px">${weak.map((x) => `${x.k} (${x.p}%)`).join("<br />") || "N/A"}</div></div><div class="stat"><div class="k">Strong Areas</div><div class="v" style="font-size:16px">${strong.map((x) => `${x.k} (${x.p}%)`).join("<br />") || "N/A"}</div></div><div class="stat"><div class="k">Recommended Next Quiz</div><div class="v" style="font-size:15px">15 questions / 15 mins on ${weak.map((x) => x.k).join(" + ") || "All Domains"}</div></div></div>`;
  }

  if (s.mode === "exam") {
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
        
        <p style="color: var(--muted); line-height: 1.6; margin-bottom: 20px;">
          ${readinessDesc}
        </p>
        
        <hr style="border: 0; border-top: 1px solid var(--line); margin: 20px 0;" />
        
        <h4>Recommended Cisco Press Review Chapters:</h4>
        <ul style="color: var(--muted); padding-left: 20px; line-height: 1.8;">
          ${recommendedReadings}
        </ul>
      </div>
    `;
  }

  // Full Answer Review screen with All / Incorrect / Flagged filters and Jump to question links
  html += buildFinishReviewHTML(s, { answerEqualsFn: answerEquals });

  html += `<div class="inline" style="margin-top:20px;"><button id="backHome" class="primary">Back Home</button><button id="goAnalytics" class="secondary">Open Analytics</button></div>`;

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
  
  if (attempts.length === 0) {
    if (narrativeEl) narrativeEl.classList.add("hidden");
    
    byId("analyticsStats").innerHTML = "";
    byId("domainBreakdown").innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📡</div>
        <h3>No telemetry data available</h3>
        <p>Complete at least one practice quiz or simulated exam to compile telemetry diagnostics and compute your CCNA readiness metrics across all 6 Cisco blueprint domains.</p>
        <button class="primary" onclick="setPage('home')">Start Practice Session</button>
      </div>
    `;
    
    const trendEl = byId("trend");
    if (trendEl) {
      trendEl.innerHTML = `
        <div class="empty-state" style="padding: var(--sp-6) 0;">
          <p style="color: var(--text-secondary); font-size: var(--text-sm);">No active telemetry trends detected.</p>
        </div>
      `;
    }
    
    renderAchievements();
    return;
  }

  const da = calcDomainAccuracy();
  const weak = Object.entries(da).sort((a, b) => a[1] - b[1])[0];
  const strong = Object.entries(da).sort((a, b) => b[1] - a[1])[0];
  const avg = state.analytics.totalQ ? Math.round(state.analytics.totalTime / state.analytics.totalQ) : 0;
  const pp = passProbability();
  const rs = readinessScore();

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

  const trendEl = byId("trend");
  if (trendEl) {
    const recent = attempts.slice(-10).reverse();
    trendEl.innerHTML = `<div style="display:flex;flex-direction:column;gap:8px;">${recent.map((att, idx) => {
      const score = Number(att.score) || 0;
      const col = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
      const dateStr = att.at ? new Date(att.at).toLocaleDateString() : `Session #${attempts.length - idx}`;
      return `<div class="trend-row-item" style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 12px;border-radius:8px;background:var(--bg-elevated, rgba(6,9,19,0.55));border:1px solid var(--line, rgba(255,255,255,0.06));">
        <div style="font-size:12.5px;color:var(--text);"><strong>${safeHTML(String(att.mode || "quiz").toUpperCase())}</strong> · ${att.correct || 0}/${att.total || 0} Qs <span style="color:var(--text-muted);font-size:11px;margin-left:6px;">${safeHTML(dateStr)}</span></div>
        <span style="font-family:var(--font-mono);font-size:12.5px;font-weight:700;color:${col};">${score}%</span>
      </div>`;
    }).join("")}</div>`;
  }

  const dasharray = 132;
  byId("domainBreakdown").innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--sp-4);">
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

  renderAchievements();
}

export function renderAchievements() {
  const a = state.analytics;
  const rs = readinessScore();
  const da = calcDomainAccuracy();
  const displayStreak = getDisplayStreak(a);
  
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
      unlocked: displayStreak >= 3,
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
    const border = b.unlocked ? "border: 1px solid #10b981; background: rgba(16,185,129,0.03);" : "border: 1px solid var(--line, rgba(255,255,255,0.05)); opacity:0.5;";
    const badgeColor = b.unlocked ? "#10b981" : "#64748b";
    html += `
      <div style="padding:12px; border-radius:10px; ${border} display:flex; align-items:center; gap:12px;">
        <span style="font-size:24px; color:${badgeColor}">${b.icon}</span>
        <div>
          <h4 style="margin:0 0 2px 0; font-size:13px; color:${b.unlocked ? 'var(--text)' : '#64748b'};">${b.title}</h4>
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
