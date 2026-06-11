import { blueprint, generateBank } from "./data.js";
import { loginWithGoogle, logout, onAuthChange, saveUserProgress, loadUserProgress, mergeProgress } from "./firebase.js";

const STORE = "ccna_full_site_v1";

const state = {
  seed: 301,
  bank: [],
  analytics: loadAnalytics(),
  session: null,
  subnet: { q: null, score: 0, attempts: 0, endAt: 0 },
  user: null
};

function rand() {
  state.seed = (state.seed * 1664525 + 1013904223) % 4294967296;
  return state.seed / 4294967296;
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
    ach: {}
  };
  try {
    const key = (state && state.user) ? `${STORE}_${state.user.uid}` : STORE;
    const raw = localStorage.getItem(key);
    if (!raw) return base;
    return { ...base, ...JSON.parse(raw) };
  } catch {
    return base;
  }
}

function saveAnalytics() {
  const key = state.user ? `${STORE}_${state.user.uid}` : STORE;
  localStorage.setItem(key, JSON.stringify(state.analytics));
  if (state.user) {
    saveUserProgress(state.user.uid, state.analytics);
  }
}

function byId(id) {
  return document.getElementById(id);
}

function setPage(page) {
  // Clear active study/exam session if navigating away from engine page
  if (page !== "engine" && state.session && !state.session.submitted) {
    if (state.session.timer) clearInterval(state.session.timer);
    byId("timer").classList.add("hidden");
    state.session = null;
  }

  // Clear active subnetting challenge timer if leaving subnetting page
  if (page !== "subnet" && state.subnet && state.subnet.timer) {
    clearInterval(state.subnet.timer);
    state.subnet.timer = null;
  }

  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  byId(page).classList.add("active");
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
  return Math.round(acc * 0.75 + speed * 0.25);
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

// Ranks removed

function calcDomainAccuracy() {
  const out = {};
  blueprint.forEach((d) => {
    const s = state.analytics.domain[d.name] || { total: 0, correct: 0 };
    out[d.name] = s.total ? Math.round((s.correct / s.total) * 100) : 0;
  });
  return out;
}

function renderStatsCards(targetId, cards) {
  byId(targetId).innerHTML = cards.map((c) => `<div class="stat"><div class="k">${c.k}</div><div class="v">${c.v}</div></div>`).join("");
}

function renderHome() {
  const rs = readinessScore();
  const pp = passProbability();
  const avg = state.analytics.totalQ ? Math.round(state.analytics.totalTime / state.analytics.totalQ) : 0;
  renderStatsCards("heroStats", [
    { k: "Overall Readiness Score", v: `${rs}%` },
    { k: "CCNA Pass Probability", v: `${pp}%` },
    { k: "Readiness Level", v: readinessLabel(rs) },
    { k: "Study Hours", v: (state.analytics.studyMin / 60).toFixed(1) },
    { k: "Average Time Per Question", v: `${avg}s` }
  ]);

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

  domainAccuracies.sort((a, b) => {
    if (a.acc !== b.acc) return a.acc - b.acc;
    return a.total - b.total; // Prefer fewer attempts for discovery
  });

  const weakest = domainAccuracies.slice(0, 2);
  state.weakDomains = weakest.map((w) => w.name);

  const smartQuizInfo = byId("smartQuizInfo");
  if (smartQuizInfo) {
    smartQuizInfo.innerHTML = `<strong>Current Focus Areas:</strong><br />
      1. ${weakest[0].name} (${weakest[0].total ? weakest[0].acc + '%' : 'No attempts'})<br />
      2. ${weakest[1].name} (${weakest[1].total ? weakest[1].acc + '%' : 'No attempts'})`;
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
  wrap.innerHTML = blueprint.map((d, i) => `<label><input class="qdomain" type="checkbox" value="${d.name}" ${i === 0 ? "checked" : ""} /> ${d.name} (${d.weight}%)</label>`).join("<br />");
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
    const minutes = Number(byId("quizDuration").value);
    const count = Number(byId("quizCount").value);
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
    const count = Number(byId("smartQuizCount").value);
    const weakDomains = state.weakDomains || [];
    conf = {
      title: "Smart Adaptive Quiz",
      desc: `Focused study on your weakest areas: ${weakDomains.join(" & ")}.`,
      showFeedback: true,
      hideScoreUntilEnd: false,
      minutes: count * 2,
      questions: weightedSelection(count, weakDomains)
    };
  } else if (mode === "missed") {
    const count = Number(byId("missedQuizCount").value);
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

  if (state.session && state.session.timer) clearInterval(state.session.timer);

  state.session = {
    mode,
    ...conf,
    idx: 0,
    answers: {},
    flagged: {},
    feedback: {},
    startedAt: Date.now(),
    qStartAt: Date.now(),
    timeLeft: conf.minutes * 60,
    timer: null,
    submitted: false
  };

  byId("modeTitle").textContent = conf.title;
  byId("modeDesc").textContent = conf.desc;

  const timer = byId("timer");
  timer.classList.remove("hidden", "warn", "danger");
  timer.textContent = toMMSS(state.session.timeLeft);

  state.session.timer = setInterval(() => {
    state.session.timeLeft -= 1;
    timer.textContent = toMMSS(state.session.timeLeft);
    timer.classList.toggle("warn", state.session.timeLeft <= 600 && state.session.timeLeft > 180);
    timer.classList.toggle("danger", state.session.timeLeft <= 180);
    if (state.session.timeLeft <= 0) submitSession(true);
  }, 1000);

  setPage("engine");
  byId("reviewArea").classList.add("hidden");
  byId("resultArea").classList.add("hidden");
  byId("questionArea").classList.remove("hidden");
  renderNavigator();
  renderQuestion();
}

function navToQuestion(i) {
  state.session.idx = Math.max(0, Math.min(state.session.questions.length - 1, i));
  state.session.qStartAt = Date.now();
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

  byId("qCounter").textContent = `Q ${s.idx + 1} / ${s.questions.length}`;
  const answeredCount = Object.keys(s.answers).length;
  const pct = Math.round((answeredCount / s.questions.length) * 100);
  byId("progressFill").style.width = `${pct}%`;
  byId("progressPct").textContent = `${pct}%`;
  byId("navMeta").textContent = `Answered: ${answeredCount} | Flagged: ${Object.values(s.flagged).filter(Boolean).length}`;

  byId("qNav").querySelectorAll("[data-qnav]").forEach((b) => {
    b.addEventListener("click", () => navToQuestion(Number(b.dataset.qnav)));
  });
}

function markCurrent() {
  const s = state.session;
  s.flagged[s.idx] = !s.flagged[s.idx];
  renderNavigator();
}

function answerEquals(q, ans) {
  if (ans == null) return false;
  if (q.type === "single" || q.type === "scenario") return ans === q.correct[0];
  if (q.type === "multi") {
    if (!Array.isArray(ans)) return false;
    return [...ans].sort().join(",") === [...q.correct].sort().join(",");
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
      <p><strong>Correct answer:</strong> ${e.correct}</p>
      <p><strong>Why correct:</strong> ${e.why}</p>
      <p><strong>Why others are wrong:</strong></p>
      <ul>
        <li>${e.wrong[0]}</li>
        <li>${e.wrong[1]}</li>
        <li>${e.wrong[2]}</li>
      </ul>
      <p><strong>Cisco exam tip:</strong> ${e.tip}</p>
      <p><strong>Memory trick:</strong> ${e.memory}</p>
      <p><strong>Real world example:</strong> ${e.real}</p>
      <p><strong>Related commands:</strong> ${e.commands.join(" | ")}</p>
    </section>
  `;
}

function renderQuestion() {
  const s = state.session;
  const q = s.questions[s.idx];
  if (!q) return;

  let html = `
    <span class="badge">${q.domain}</span><span class="badge">${q.topic}</span>
    ${q.scenario ? `<div class="block"><strong>Scenario:</strong> ${q.scenario}</div>` : ""}
    <h3>${q.text}</h3>
    <div class="meta">
      <div><strong>Difficulty</strong><br />${q.difficulty}</div>
      <div><strong>Exam Weight</strong><br />${q.examWeight}</div>
      <div><strong>Topic Domain</strong><br />${q.domain}</div>
      <div><strong>Expected Frequency</strong><br />${q.frequency}</div>
    </div>
    ${q.topology ? `<div class="block">${q.topology.replace(/\n/g, "<br />")}</div>` : ""}
    ${q.cli ? `<div class="block cli">${q.cli.replace(/\n/g, "<br />")}</div>` : ""}
    ${q.packet ? `<div class="block packet">Packet: ${q.packet}</div>` : ""}
  `;

  if (q.type === "single" || q.type === "scenario") {
    const v = s.answers[s.idx];
    html += q.options.map((o, i) => `<label class="opt"><input type="radio" name="single" value="${i}" ${v === i ? "checked" : ""}/> ${String.fromCharCode(65 + i)}. ${o}</label>`).join("");
  } else if (q.type === "multi") {
    const selected = Array.isArray(s.answers[s.idx]) ? s.answers[s.idx] : [];
    html += q.options.map((o, i) => `<label class="opt"><input type="checkbox" value="${i}" ${selected.includes(i) ? "checked" : ""}/> ${String.fromCharCode(65 + i)}. ${o}</label>`).join("");
  } else if (q.type === "matching") {
    const cur = s.answers[s.idx] || {};
    q.pairs.forEach((pair, i) => {
      const opts = shuffle(q.pairs.map((x) => x[1]));
      html += `<div class="opt"><strong>${pair[0]}</strong><br /><select data-match="${i}"><option value="">Select</option>${opts.map((x) => `<option ${cur[i] === x ? "selected" : ""} value="${x}">${x}</option>`).join("")}</select></div>`;
    });
  } else {
    const order = s.answers[s.idx] || [...q.order];
    order.forEach((step, i) => {
      html += `<div class="opt"><strong>${i + 1}.</strong> ${step}<div class="inline"><button class="ghost" data-up="${i}">Up</button><button class="ghost" data-down="${i}">Down</button></div></div>`;
    });
  }

  const ok = s.feedback[s.idx];
  if (ok != null) html += explanationBlock(q, ok);

  byId("questionArea").innerHTML = html;
  wireQuestionInputs();
}

function wireQuestionInputs() {
  const s = state.session;
  const q = s.questions[s.idx];

  byId("questionArea").querySelectorAll("input[type='radio'][name='single']").forEach((el) => {
    el.addEventListener("change", () => {
      s.answers[s.idx] = Number(el.value);
      instantStudyFeedback();
      renderNavigator();
    });
  });

  byId("questionArea").querySelectorAll("input[type='checkbox']").forEach((el) => {
    el.addEventListener("change", () => {
      s.answers[s.idx] = [...byId("questionArea").querySelectorAll("input[type='checkbox']:checked")].map((x) => Number(x.value));
      instantStudyFeedback();
      renderNavigator();
    });
  });

  byId("questionArea").querySelectorAll("[data-match]").forEach((el) => {
    el.addEventListener("change", () => {
      const cur = s.answers[s.idx] || {};
      cur[Number(el.dataset.match)] = el.value;
      s.answers[s.idx] = cur;
      instantStudyFeedback();
      renderNavigator();
    });
  });

  byId("questionArea").querySelectorAll("[data-up]").forEach((el) => {
    el.addEventListener("click", () => {
      const i = Number(el.dataset.up);
      const list = s.answers[s.idx] || [...q.order];
      if (i <= 0) return;
      [list[i], list[i - 1]] = [list[i - 1], list[i]];
      s.answers[s.idx] = list;
      instantStudyFeedback();
      renderQuestion();
      renderNavigator();
    });
  });

  byId("questionArea").querySelectorAll("[data-down]").forEach((el) => {
    el.addEventListener("click", () => {
      const i = Number(el.dataset.down);
      const list = s.answers[s.idx] || [...q.order];
      if (i >= list.length - 1) return;
      [list[i], list[i + 1]] = [list[i + 1], list[i]];
      s.answers[s.idx] = list;
      instantStudyFeedback();
      renderQuestion();
      renderNavigator();
    });
  });
}

function instantStudyFeedback() {
  const s = state.session;
  if (s.mode !== "study") return;
  const q = s.questions[s.idx];
  const ans = s.answers[s.idx];
  const ok = answerEquals(q, ans);
  s.feedback[s.idx] = ok;
  applyStats(q, ok, 35);

  // Update missedIds list
  if (!state.analytics.missedIds) state.analytics.missedIds = [];
  if (ok) {
    state.analytics.missedIds = state.analytics.missedIds.filter(id => id !== q.id);
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
  if (f) f.addEventListener("click", () => submitSession());
}

function submitSession(force) {
  const s = state.session;
  if (!s || s.submitted) return;
  if (s.mode === "exam" && !force) {
    openReview();
    return;
  }

  s.submitted = true;
  clearInterval(s.timer);
  byId("timer").classList.add("hidden");

  let correct = 0;
  const domain = {};
  const wrong = [];

  if (!state.analytics.missedIds) state.analytics.missedIds = [];
  s.questions.forEach((q, i) => {
    const ok = answerEquals(q, s.answers[i]);
    if (ok) {
      correct += 1;
      state.analytics.missedIds = state.analytics.missedIds.filter(id => id !== q.id);
    } else {
      if (!state.analytics.missedIds.includes(q.id)) {
        state.analytics.missedIds.push(q.id);
      }
    }
    if (!domain[q.domain]) domain[q.domain] = { total: 0, correct: 0 };
    domain[q.domain].total += 1;
    if (ok) domain[q.domain].correct += 1;
    applyStats(q, ok, 55);
    if (!ok) wrong.push({ i, q });
  });

  const total = s.questions.length;
  const pct = Math.round((correct / total) * 100);
  state.analytics.studyMin += Math.round((Date.now() - s.startedAt) / 60000);
  state.analytics.attempts.push({
    mode: s.mode,
    total,
    correct,
    score: pct,
    at: new Date().toISOString()
  });
  state.analytics.attempts = state.analytics.attempts.slice(-40);

  saveAnalytics();
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
    return `
      <div class="domain-item">
        <div class="domain-header">
          <strong>${d}</strong>
          <span class="pct">${v.correct}/${v.total} (${pct}%)</span>
        </div>
        <div class="progress"><div style="width:${pct}%"></div></div>
      </div>
    `;
  }).join("")}</div>`;
  html += `<div class="grid stats"><div class="stat"><div class="k">Weak Areas</div><div class="v" style="font-size:16px">${weak.map((x) => `${x.k} (${x.p}%)`).join("<br />")}</div></div><div class="stat"><div class="k">Strong Areas</div><div class="v" style="font-size:16px">${strong.map((x) => `${x.k} (${x.p}%)`).join("<br />")}</div></div><div class="stat"><div class="k">Recommended Next Quiz</div><div class="v" style="font-size:15px">15 questions / 15 mins on ${weak.map((x) => x.k).join(" + ")}</div></div></div>`;

  if (s.mode !== "exam") {
    html += `<div class="card"><h3>Review (first 20 misses)</h3>${wrong.slice(0, 20).map((x) => `<div class="output"><strong>Q${x.i + 1}</strong> ${x.q.topic} | Correct: ${x.q.expl.correct}<br />Tip: ${x.q.expl.tip}</div>`).join("") || "No incorrect answers."}</div>`;
  } else {
    html += `<div class="output">Real Exam mode policy respected: no answers or score were shown until final submission.</div>`;
  }

  html += `<div class="inline"><button id="backHome" class="primary">Back Home</button><button id="goAnalytics" class="secondary">Open Analytics</button></div>`;

  byId("resultArea").innerHTML = html;
  byId("resultArea").classList.remove("hidden");
  byId("reviewArea").classList.add("hidden");
  byId("questionArea").classList.add("hidden");

  const rsa = byId("resultArea");
  if (rsa) rsa.scrollTop = 0;
  window.scrollTo(0, 0);

  byId("backHome").addEventListener("click", () => setPage("home"));
  byId("goAnalytics").addEventListener("click", () => setPage("analytics"));
}

function renderAnalytics() {
  const da = calcDomainAccuracy();
  const weak = Object.entries(da).sort((a, b) => a[1] - b[1])[0];
  const strong = Object.entries(da).sort((a, b) => b[1] - a[1])[0];
  const avg = state.analytics.totalQ ? Math.round(state.analytics.totalTime / state.analytics.totalQ) : 0;

  renderStatsCards("analyticsStats", [
    { k: "Overall Readiness Score", v: `${readinessScore()}%` },
    { k: "CCNA Pass Probability", v: `${passProbability()}%` },
    { k: "Study Hours", v: (state.analytics.studyMin / 60).toFixed(1) },
    { k: "Average Time Per Question", v: `${avg}s` },
    { k: "Weakest Domain", v: weak ? `${weak[0]} (${weak[1]}%)` : "N/A" },
    { k: "Strongest Domain", v: strong ? `${strong[0]} (${strong[1]}%)` : "N/A" }
  ]);

  byId("domainBreakdown").innerHTML = blueprint.map((d) => {
    const p = da[d.name] || 0;
    return `
      <div class="domain-item">
        <div class="domain-header">
          <strong>${d.name} <span class="weight">(${d.weight}%)</span></strong>
          <span class="pct">${p}%</span>
        </div>
        <div class="progress"><div style="width:${p}%"></div></div>
      </div>
    `;
  }).join("");

  const rec = state.analytics.attempts.slice(-10);
  byId("trend").innerHTML = rec.length
    ? rec.map((a, i) => `<div class="output">Attempt ${i + 1}: ${a.mode.toUpperCase()} | ${a.score}% (${a.correct}/${a.total}) | ${new Date(a.at).toLocaleString()}</div>`).join("")
    : "No attempts yet.";
}

// Lab functions removed

function makeSubnetQuestion(mode) {
  const prefixes = mode === "Easy" ? [24, 25, 26] : mode === "Medium" ? [22, 23, 27, 28] : [19, 20, 29, 30];
  const p = pick(prefixes);
  const t = pick(["hosts", "wild"]);
  if (t === "hosts") {
    const hosts = Math.pow(2, 32 - p) - 2;
    return { prompt: `How many usable hosts are in /${p}?`, answer: String(hosts), note: "Usable hosts = 2^(32-prefix)-2." };
  }
  const mask = [0, 0, 0, 0];
  let bits = p;
  for (let i = 0; i < 4; i++) {
    const use = Math.max(0, Math.min(8, bits));
    mask[i] = use === 0 ? 0 : 256 - Math.pow(2, 8 - use);
    bits -= use;
  }
  const wild = mask.map((m) => 255 - m).join(".");
  return { prompt: `What wildcard mask corresponds to /${p}?`, answer: wild, note: "Wildcard = 255.255.255.255 - subnet mask." };
}

function ensureSubnetQuestion(force) {
  const mode = byId("subnetMode").value;

  // Clear subnetting timer if not in Timed Challenge
  if (mode !== "Timed Challenge" && state.subnet.timer) {
    clearInterval(state.subnet.timer);
    state.subnet.timer = null;
  }

  if (force || !state.subnet.q) {
    state.subnet.q = makeSubnetQuestion(mode === "Timed Challenge" ? "Hard" : mode);
    if (mode === "Timed Challenge" && force) {
      state.subnet.endAt = Date.now() + 5 * 60 * 1000;
      state.subnet.score = 0;
      state.subnet.attempts = 0;

      // Start live countdown interval
      if (state.subnet.timer) clearInterval(state.subnet.timer);
      state.subnet.timer = setInterval(() => {
        if (byId("subnet").classList.contains("active") && byId("subnetMode").value === "Timed Challenge") {
          ensureSubnetQuestion(false);
        } else {
          clearInterval(state.subnet.timer);
          state.subnet.timer = null;
        }
      }, 1000);
    }
  }
  let timer = "";
  const subnetSubmit = byId("subnetSubmit");
  if (mode === "Timed Challenge" && state.subnet.endAt) {
    const left = Math.max(0, Math.floor((state.subnet.endAt - Date.now()) / 1000));
    timer = `<br /><strong>Time Left:</strong> ${toMMSS(left)}`;
    if (left === 0) {
      timer += `<br />Challenge ended. Score: ${state.subnet.score}/${state.subnet.attempts}`;
      if (state.subnet.timer) {
        clearInterval(state.subnet.timer);
        state.subnet.timer = null;
      }
      if (subnetSubmit) subnetSubmit.disabled = true;
    } else {
      if (subnetSubmit) subnetSubmit.disabled = false;
    }
  } else {
    if (subnetSubmit) subnetSubmit.disabled = false;
  }
  byId("subnetPrompt").innerHTML = `<strong>Question:</strong> ${state.subnet.q.prompt}${timer}`;
}

function submitSubnet() {
  const mode = byId("subnetMode").value;
  const ans = byId("subnetAnswer").value.trim();
  const ok = ans === state.subnet.q.answer;
  state.subnet.attempts += 1;
  if (ok) state.subnet.score += 1;
  byId("subnetOut").innerHTML = `Result: ${ok ? "Correct" : "Incorrect"}<br />Expected: ${state.subnet.q.answer}<br />${state.subnet.q.note}<br />Score: ${state.subnet.score}/${state.subnet.attempts}`;
  byId("subnetAnswer").value = "";
  state.subnet.q = makeSubnetQuestion(mode === "Timed Challenge" ? "Hard" : mode);
  ensureSubnetQuestion(false);
}

function wireEvents() {
  byId("startStudy").addEventListener("click", () => startSession("study"));
  byId("startQuiz").addEventListener("click", () => startSession("quiz"));
  byId("startSmartQuiz").addEventListener("click", () => startSession("smart"));
  byId("startExam").addEventListener("click", () => startSession("exam"));

  byId("openReview").addEventListener("click", openReview);
  byId("toggleMark").addEventListener("click", markCurrent);
  byId("exitSession").addEventListener("click", () => {
    if (state.session?.timer) clearInterval(state.session.timer);
    byId("timer").classList.add("hidden");
    setPage("home");
  });
  byId("prevQ").addEventListener("click", prevQuestion);
  byId("nextQ").addEventListener("click", nextQuestion);
  byId("saveNext").addEventListener("click", saveAndNext);
  byId("submitSession").addEventListener("click", () => submitSession(false));

  const btnMissed = byId("startMissedQuiz");
  if (btnMissed) {
    btnMissed.addEventListener("click", () => startSession("missed"));
  }

  // Sidebar drawer handlers
  const sidebar = document.querySelector(".left");
  const backdrop = byId("sidebarBackdrop");
  const closeSidebar = () => {
    sidebar.classList.remove("active");
    backdrop.classList.remove("active");
  };
  const openSidebar = () => {
    sidebar.classList.add("active");
    backdrop.classList.add("active");
  };
  byId("toggleSidebar").addEventListener("click", openSidebar);
  byId("closeSidebar").addEventListener("click", closeSidebar);
  backdrop.addEventListener("click", closeSidebar);

  // Lab listeners removed

  byId("subnetSubmit").addEventListener("click", submitSubnet);
  byId("subnetSkip").addEventListener("click", () => {
    state.subnet.q = makeSubnetQuestion(byId("subnetMode").value === "Timed Challenge" ? "Hard" : byId("subnetMode").value);
    ensureSubnetQuestion(false);
  });
  byId("subnetMode").addEventListener("change", () => ensureSubnetQuestion(true));

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
        saveAnalytics();
        renderHome();
        renderAnalytics();
        alert("Progress reset successfully.");
      }
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
      await loginWithGoogle();
    } catch (err) {
      console.error("Login failed:", err);
    }
  });

  btnSignOut.addEventListener("click", async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  });

  onAuthChange(async (user) => {
    state.user = user;
    if (user) {
      btnSignIn.classList.add("hidden");
      userProfile.classList.remove("hidden");
      userPhoto.src = user.photoURL || "";
      userName.textContent = user.displayName || user.email;

      console.log("User logged in. Loading user profile progress...");
      const cloud = await loadUserProgress(user.uid);
      const userKey = `${STORE}_${user.uid}`;
      const localCached = localStorage.getItem(userKey);

      if (cloud) {
        state.analytics = cloud;
      } else if (localCached) {
        state.analytics = JSON.parse(localCached);
      } else {
        // Zero progress for new user
        state.analytics = {
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
      }
      state.analytics.missedIds = state.analytics.missedIds || [];
      
      localStorage.setItem(userKey, JSON.stringify(state.analytics));
      saveUserProgress(user.uid, state.analytics);
      
      renderHome();
      renderAnalytics();
    } else {
      btnSignIn.classList.remove("hidden");
      userProfile.classList.add("hidden");
      userPhoto.src = "";
      userName.textContent = "";

      console.log("User logged out. Restoring guest progress...");
      const guestData = localStorage.getItem(STORE);
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
        missedIds: []
      };
      state.analytics.missedIds = state.analytics.missedIds || [];

      renderHome();
      renderAnalytics();
    }
  });
}

function setupTopologyInteractions() {
  document.querySelectorAll("[data-node]").forEach((nodeEl) => {
    nodeEl.addEventListener("click", () => {
      const node = nodeEl.dataset.node;
      const detailsTitle = byId("topoDetails");
      const detailsContent = byId("topoDetailsContent");
      if (!detailsTitle || !detailsContent) return;

      let title = "";
      let html = "";

      if (node === "pc") {
        title = "💻 Host PC - 192.168.1.10";
        html = `
          <strong>Status:</strong> Operational (Link Up)<br />
          <strong>Default Gateway:</strong> 192.168.1.1<br />
          <strong>MAC Address:</strong> 0050.7966.6800<br />
          <strong>Config Details:</strong> Received configuration from SW-1 via VLAN 10 (DHCP).<br />
          <strong>CCNA Verification command:</strong> <code>ipconfig /all</code>
        `;
      } else if (node === "switch") {
        title = "🎛️ Catalyst 2960 Switch - SW-1";
        html = `
          <strong>Status:</strong> Active<br />
          <strong>Spanning Tree:</strong> Root Bridge for VLAN 10<br />
          <strong>VLAN Configuration:</strong> Ports 1-10 VLAN 10, Port 24 Trunk to R-1<br />
          <strong>MAC Table:</strong> 4 Active MAC Entries detected.<br />
          <strong>CCNA Verification command:</strong> <code>show mac address-table</code>
        `;
      } else if (node === "router") {
        title = "🌐 ISR 4331 Core Router - R-1";
        html = `
          <strong>Status:</strong> Active (Primary Gateway)<br />
          <strong>Routing protocol:</strong> OSPF 1 (Area 0)<br />
          <strong>Interfaces:</strong> Gi0/0 (192.168.1.2/24), Gi0/1 (ROAS Subinterfaces VLAN 10/20)<br />
          <strong>OSPF Neighbors:</strong> Full adjacency with WAN Link.<br />
          <strong>CCNA Verification command:</strong> <code>show ip route</code>
        `;
      } else if (node === "firewall") {
        title = "🔒 ASA 5506-X Firewall - FW-1";
        html = `
          <strong>Status:</strong> Standby (Firewall Policies Active)<br />
          <strong>Security levels:</strong> Inside (100), Outside (0)<br />
          <strong>Active Translation:</strong> Dynamic Port Address Translation (PAT) active.<br />
          <strong>CCNA Verification command:</strong> <code>show access-list</code>
        `;
      } else if (node === "wan") {
        title = "☁️ External WAN Gateway / Internet";
        html = `
          <strong>Status:</strong> Connected<br />
          <strong>Gateway route:</strong> Static Route (0.0.0.0/0) pointing to WAN IP.<br />
          <strong>Public Services:</strong> DNS servers (8.8.8.8, 1.1.1.1) reachable.<br />
          <strong>CCNA Verification command:</strong> <code>ping 8.8.8.8</code>
        `;
      }

      detailsTitle.querySelector("h4").textContent = title;
      detailsContent.innerHTML = html;
    });
  });
}

function setupTerminalConsole() {
  const terminalInput = byId("terminalInput");
  const terminalBody = byId("terminalBody");
  if (!terminalInput || !terminalBody) return;

  terminalInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const val = terminalInput.value.trim();
      terminalInput.value = "";
      if (!val) return;

      // Add echo of the command
      const lineEcho = document.createElement("div");
      lineEcho.innerHTML = `<span style="color:#38bdf8; font-weight:bold;">CCNA-Router#</span> ${val}`;
      terminalBody.appendChild(lineEcho);

      const outputEl = document.createElement("div");
      const cleanVal = val.toLowerCase().replace(/\s+/g, " ");

      if (cleanVal === "help") {
        outputEl.innerHTML = `
          Available Commands:<br />
          - <strong>help</strong> : Displays this helper menu<br />
          - <strong>show ip route</strong> : Displays the IPv4 routing table<br />
          - <strong>show ip interface brief</strong> : Displays interface summary<br />
          - <strong>ping [address]</strong> : Sends ICMP Echo messages (e.g. ping 8.8.8.8)<br />
          - <strong>traceroute [address]</strong> : Trace routes hop-by-hop (e.g. traceroute 8.8.8.8)<br />
          - <strong>show running-config</strong> : Displays current active configurations<br />
          - <strong>clear</strong> : Clears the console logs
        `;
      } else if (cleanVal === "show ip route" || cleanVal === "show ip rotue") {
        outputEl.innerHTML = `
Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area<br /><br />
Gateway of last resort is 192.168.1.1 to network 0.0.0.0<br /><br />
S*&nbsp;&nbsp;&nbsp;&nbsp;0.0.0.0/0 [1/0] via 192.168.1.1, GigabitEthernet0/0<br />
C&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;192.168.1.0/24 is directly connected, GigabitEthernet0/1<br />
L&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;192.168.1.10/32 is directly connected, GigabitEthernet0/1<br />
O&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10.10.10.0/24 [110/2] via 192.168.1.1, 00:14:32, GigabitEthernet0/0
        `;
      } else if (cleanVal === "show ip interface brief" || cleanVal === "show ip int brief" || cleanVal === "sh ip int br") {
        outputEl.innerHTML = `
Interface&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;IP-Address&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;OK? Method Status&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Protocol<br />
GigabitEthernet0/0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;192.168.1.2&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;YES manual up&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;up<br />
GigabitEthernet0/1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;192.168.1.10&nbsp;&nbsp;&nbsp;&nbsp;YES manual up&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;up<br />
Vlan10&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;192.168.10.1&nbsp;&nbsp;&nbsp;&nbsp;YES manual up&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;up<br />
Vlan20&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;192.168.20.1&nbsp;&nbsp;&nbsp;&nbsp;YES manual up&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;up
        `;
      } else if (cleanVal.startsWith("ping")) {
        const dest = val.split(" ")[1] || "8.8.8.8";
        outputEl.innerHTML = `
Sending 5, 100-byte ICMP Echos to ${dest}, timeout is 2 seconds:<br />
!!!!!<br />
Success rate is 100 percent (5/5), round-trip min/avg/max = 8/12/16 ms
        `;
      } else if (cleanVal.startsWith("traceroute") || cleanVal.startsWith("trace")) {
        const dest = val.split(" ")[1] || "8.8.8.8";
        outputEl.innerHTML = `
Type escape sequence to abort.<br />
Tracing the route to ${dest}<br /><br />
&nbsp;&nbsp;1 192.168.1.1 2 msec 1 msec 1 msec<br />
&nbsp;&nbsp;2 10.10.10.1 4 msec 3 msec 3 msec<br />
&nbsp;&nbsp;3 ${dest} 12 msec 11 msec 12 msec
        `;
      } else if (cleanVal === "show running-config" || cleanVal === "show run" || cleanVal === "sh run") {
        outputEl.innerHTML = `
Building configuration...<br />
Current configuration : 1382 bytes<br />
!<br />
hostname CCNA-Router<br />
!<br />
interface GigabitEthernet0/0<br />
&nbsp;ip address 192.168.1.2 255.255.255.0<br />
&nbsp;duplex full<br />
&nbsp;speed 1000<br />
!<br />
interface GigabitEthernet0/1<br />
&nbsp;no ip address<br />
&nbsp;duplex auto<br />
&nbsp;speed auto<br />
!<br />
router ospf 1<br />
&nbsp;network 192.168.1.0 0.0.0.255 area 0<br />
!<br />
end
        `;
      } else if (cleanVal === "clear") {
        terminalBody.innerHTML = `<div>Terminal output cleared. Type 'help' to show commands.</div><br />`;
        return;
      } else {
        outputEl.innerHTML = `<span style="color:#f43f5e;">% Invalid input detected at '^' marker.</span>`;
      }

      terminalBody.appendChild(outputEl);
      terminalBody.appendChild(document.createElement("br"));
      terminalBody.scrollTop = terminalBody.scrollHeight;
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
      alert("Please fill in all required fields.");
      return;
    }

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

function init() {
  state.bank = generateBank(rand);
  navSetup();
  renderDomainChecks();
  renderHome();
  renderAnalytics();
  wireEvents();
  setupAuth();
  setupTopologyInteractions();
  setupTerminalConsole();
  setupSupportDesk();
  setPage("home");
}

init();
