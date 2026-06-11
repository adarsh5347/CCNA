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
  const el = byId(targetId);
  if (el) {
    el.innerHTML = cards.map((c) => `<div class="stat"><div class="k">${c.k}</div><div class="v">${c.v}</div></div>`).join("");
  }
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
  const nodes = ["pc", "switch", "router", "firewall", "wan"];
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
          const origStroke = n === "router" || n === "wan" ? "#10b981" : (n === "firewall" ? "#ff5e3a" : "#00f2fe");
          el.setAttribute("stroke", origStroke);
        }
      } else {
        el.setAttribute("stroke-width", "2");
        el.setAttribute("fill", "#060913");
        const origStroke = n === "router" || n === "wan" ? "#10b981" : (n === "firewall" ? "#ff5e3a" : "#00f2fe");
        el.setAttribute("stroke", origStroke);
      }
    }
  });
}

function setupNodeConfigInspector() {
  const nodes = document.querySelectorAll(".topo-node");
  const configContent = byId("nodeConfigContent");
  if (!nodes || !configContent) return;

  const configs = {
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
  - Inside: Security Level 100 (Trust) - IP: 192.168.1.254/24
  - Outside: Security Level 0 (Untrust) - IP: 192.168.1.3/30
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
    `
  };

  nodes.forEach(node => {
    node.addEventListener("click", () => {
      playNetSound("click");
      const nodeName = node.getAttribute("data-node");
      if (configs[nodeName]) {
        configContent.innerHTML = configs[nodeName];
        
        document.querySelectorAll(".topo-node circle, .topo-node rect").forEach(el => {
          el.style.stroke = "";
          el.style.strokeWidth = "";
        });
        const innerEl = byId(`node-${nodeName}`);
        if (innerEl) {
          innerEl.style.stroke = "#00f2fe";
          innerEl.style.strokeWidth = "4px";
          setTimeout(() => {
            innerEl.style.stroke = "";
            innerEl.style.strokeWidth = "";
          }, 1500);
        }
      }
    });
  });
}

function setupTraversalSimulator() {
  const btnStart = byId("btnStartSim");
  const btnReset = byId("btnResetSim");
  const logContent = byId("simLogContent");
  const pkt = byId("simPacket");

  if (!btnStart || !btnReset || !logContent || !pkt) return;

  const sleep = (ms) => new Promise(res => setTimeout(res, ms));

  setupNodeConfigInspector();

  document.querySelectorAll(".osi-layer").forEach(layerEl => {
    layerEl.addEventListener("click", () => {
      playNetSound("click");
      document.querySelectorAll(".osi-layer").forEach(el => el.classList.remove("active"));
      layerEl.classList.add("active");
      const layerNum = layerEl.getAttribute("data-layer");
      showOsiLayerDetail(layerNum);
    });
  });

  btnStart.addEventListener("click", async () => {
    btnStart.disabled = true;
    const type = byId("simPacketType").value;

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
          headers: "L2: Standard Unicast Forwarding",
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
    }

    pkt.style.opacity = "1";
    logContent.innerHTML = "";
    let blocked = false;

    for (let i = 0; i < path.length; i++) {
      const step = path[i];
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

      pkt.setAttribute("cx", step.x);
      pkt.setAttribute("cy", step.y);
      if (step.isBlocked) {
        pkt.setAttribute("fill", "#ff5e3a");
        pkt.style.filter = "drop-shadow(0 0 8px #ff5e3a)";
        playNetSound("block");
      } else {
        pkt.setAttribute("fill", step.color || "#00f2fe");
        pkt.style.filter = `drop-shadow(0 0 8px ${step.color || "#00f2fe"})`;
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
    }

    await sleep(1000);
    highlightNode(null);
    btnStart.disabled = false;
  });

  btnReset.addEventListener("click", () => {
    btnStart.disabled = false;
    pkt.style.opacity = "0";
    pkt.setAttribute("cx", "80");
    pkt.setAttribute("cy", "140");
    logContent.innerHTML = "<div>System Ready. Select a packet simulation and click 'Run Simulation'.</div>";
    currentOsiData = null;
    updateOsiLabels(null);
    const descBox = byId("osiLayerDescBox");
    if (descBox) {
      descBox.innerHTML = `<span style="color: var(--text-muted); font-style: italic;">Run a simulation and click any OSI layer tab above to inspect the active hop encapsulation details.</span>`;
    }
    document.querySelectorAll(".osi-layer").forEach(el => el.classList.remove("active"));
    highlightNode(null);
  });
}

function setupCanvasConstellation() {
  const canvas = byId("netCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  
  let particles = [];
  const count = 45;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener("resize", resize);
  resize();

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.radius = Math.random() * 2 + 1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 242, 254, 0.4)";
      ctx.fill();
    }
  }

  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    requestAnimationFrame(animate);
  };
  animate();
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
  setupCanvasConstellation();
  setupTraversalSimulator();
  setupSupportDesk();
  setPage("home");
}

init();
