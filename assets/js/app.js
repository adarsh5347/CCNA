import { blueprint, ranks, generateBank } from "./data.js";
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
    const raw = localStorage.getItem(STORE);
    if (!raw) return base;
    return { ...base, ...JSON.parse(raw) };
  } catch {
    return base;
  }
}

function saveAnalytics() {
  localStorage.setItem(STORE, JSON.stringify(state.analytics));
  if (state.user) {
    saveUserProgress(state.user.uid, state.analytics);
  }
}

function byId(id) {
  return document.getElementById(id);
}

function setPage(page) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  byId(page).classList.add("active");
  if (page === "analytics") renderAnalytics();
  if (page === "subnet") ensureSubnetQuestion(true);
}

function navSetup() {
  document.querySelectorAll("[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => setPage(btn.dataset.page));
  });
}

function readinessScore() {
  const a = state.analytics;
  const acc = a.totalQ ? (a.correct / a.totalQ) * 100 : 0;
  const avgSec = a.totalQ ? a.totalTime / a.totalQ : 90;
  const speed = Math.max(0, Math.min(100, 100 - ((avgSec - 45) * 0.9)));
  return Math.round(acc * 0.75 + speed * 0.25);
}

function passProbability() {
  return Math.max(5, Math.min(98, Math.round(readinessScore() * 0.92 + 5)));
}

function readinessLabel(score) {
  if (score < 50) return "Beginner";
  if (score < 70) return "Intermediate";
  if (score < 85) return "Exam Ready";
  return "Likely Pass";
}

function currentRank() {
  let r = ranks[0];
  ranks.forEach((x) => { if (state.analytics.xp >= x.xp) r = x; });
  return r;
}

function nextRank() {
  return ranks.find((r) => r.xp > state.analytics.xp) || null;
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
    { k: "Average Time Per Question", v: `${avg}s` },
    { k: "Rank", v: currentRank().title }
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

  const nr = nextRank();
  renderStatsCards("gameStats", [
    { k: "XP", v: state.analytics.xp },
    { k: "Current Rank", v: currentRank().title },
    { k: "Next Rank", v: nr ? `${nr.title} @ ${nr.xp}` : "Top Rank" }
  ]);

  const names = ["OSPF Master", "VLAN Expert", "ACL Ninja", "IPv6 Specialist", "Automation Explorer"];
  byId("achievements").innerHTML = names.map((n) => `<span style="border-color:${state.analytics.ach[n] ? "#90be6d" : "#496a8b"};color:${state.analytics.ach[n] ? "#daf6c7" : "#9bb1c6"}">${n} ${state.analytics.ach[n] ? "Unlocked" : "Locked"}</span>`).join("");
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

  while (out.length < count && used.size < scored.length) {
    const total = scored.reduce((s, x) => s + (used.has(x.q.id) ? 0 : x.w), 0);
    let r = rand() * total;
    for (const item of scored) {
      if (used.has(item.q.id)) continue;
      r -= item.w;
      if (r <= 0) {
        used.add(item.q.id);
        out.push(item.q);
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
  const pct = Math.round(((s.idx + 1) / s.questions.length) * 100);
  byId("progressFill").style.width = `${pct}%`;
  byId("progressPct").textContent = `${pct}%`;
  byId("navMeta").textContent = `Answered: ${Object.keys(s.answers).length} | Flagged: ${Object.values(s.flagged).filter(Boolean).length}`;

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

function xpGain(q, ok) {
  if (!ok) return 1;
  if (q.difficulty === "Hard") return 16;
  if (q.difficulty === "Medium") return 10;
  return 6;
}

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

function refreshAchievements() {
  const a = state.analytics;
  const d = calcDomainAccuracy();
  if ((d["IP Connectivity"] || 0) >= 80) a.ach["OSPF Master"] = true;
  if ((d["Network Access"] || 0) >= 80) a.ach["VLAN Expert"] = true;
  if ((d["Security Fundamentals"] || 0) >= 80) a.ach["ACL Ninja"] = true;
  if ((a.topic.IPv6 && a.topic.IPv6.correct >= 12)) a.ach["IPv6 Specialist"] = true;
  if ((a.topic["REST APIs"] && a.topic["REST APIs"].correct >= 10)) a.ach["Automation Explorer"] = true;
}

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
  state.analytics.xp += xpGain(q, ok);
  refreshAchievements();
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

  s.questions.forEach((q, i) => {
    const ok = answerEquals(q, s.answers[i]);
    if (ok) correct += 1;
    if (!domain[q.domain]) domain[q.domain] = { total: 0, correct: 0 };
    domain[q.domain].total += 1;
    if (ok) domain[q.domain].correct += 1;
    applyStats(q, ok, 55);
    state.analytics.xp += xpGain(q, ok);
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

  refreshAchievements();
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

  html += `<div class="card"><h3>Domain Performance</h3>${Object.entries(domain).map(([d, v]) => `<div class="output"><strong>${d}</strong>: ${v.correct}/${v.total} (${Math.round((v.correct / v.total) * 100)}%)</div>`).join("")}</div>`;
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
    return `<div class="output"><strong>${d.name}</strong> (${d.weight}%)<div class="progress"><div style="width:${p}%"></div></div>${p}%</div>`;
  }).join("");

  const rec = state.analytics.attempts.slice(-10);
  byId("trend").innerHTML = rec.length
    ? rec.map((a, i) => `<div class="output">Attempt ${i + 1}: ${a.mode.toUpperCase()} | ${a.score}% (${a.correct}/${a.total}) | ${new Date(a.at).toLocaleString()}</div>`).join("")
    : "No attempts yet.";
}

function labDefs() {
  return {
    vlan: {
      input: "vlanInput",
      out: "vlanOut",
      req: ["vlan 10", "vlan 20", "switchport mode access", "switchport access vlan 10", "switchport mode trunk"],
      hint: "vlan 10, vlan 20, interface range, switchport mode access, switchport access vlan 10, interface g0/1, switchport mode trunk"
    },
    ospf: {
      input: "ospfInput",
      out: "ospfOut",
      req: ["router ospf 1", "network", "area 0", "passive-interface"],
      hint: "router ospf 1, network x.x.x.x wildcard area 0, passive-interface default, no passive-interface g0/0"
    },
    acl: {
      input: "aclInput",
      out: "aclOut",
      req: ["ip access-list extended", "permit tcp", "eq 443", "deny ip any any", "ip access-group"],
      hint: "ip access-list extended WEB-FILTER, permit tcp any 10.10.10.0 0.0.0.255 eq 443, deny ip any any log, interface g0/0, ip access-group WEB-FILTER in"
    }
  };
}

function gradeLab(name) {
  const d = labDefs()[name];
  const txt = byId(d.input).value.toLowerCase();
  const missing = d.req.filter((k) => !txt.includes(k));
  const score = Math.round(((d.req.length - missing.length) / d.req.length) * 100);
  byId(d.out).innerHTML = `<strong>Lab Score:</strong> ${score}%<br />${missing.length ? `<strong>Missing:</strong><br />- ${missing.join("<br />- ")}` : "All required elements found."}`;
}

function showLabHint(name) {
  const d = labDefs()[name];
  byId(d.out).innerHTML = `<strong>Hint:</strong> ${d.hint}`;
}

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
  if (force || !state.subnet.q) {
    state.subnet.q = makeSubnetQuestion(mode === "Timed Challenge" ? "Hard" : mode);
    if (mode === "Timed Challenge" && force) {
      state.subnet.endAt = Date.now() + 5 * 60 * 1000;
      state.subnet.score = 0;
      state.subnet.attempts = 0;
    }
  }
  let timer = "";
  if (mode === "Timed Challenge" && state.subnet.endAt) {
    const left = Math.max(0, Math.floor((state.subnet.endAt - Date.now()) / 1000));
    timer = `<br /><strong>Time Left:</strong> ${toMMSS(left)}`;
    if (left === 0) timer += `<br />Challenge ended. Score: ${state.subnet.score}/${state.subnet.attempts}`;
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

  document.querySelectorAll("[data-lab]").forEach((b) => b.addEventListener("click", () => gradeLab(b.dataset.lab)));
  document.querySelectorAll("[data-hint]").forEach((b) => b.addEventListener("click", () => showLabHint(b.dataset.hint)));

  byId("subnetSubmit").addEventListener("click", submitSubnet);
  byId("subnetSkip").addEventListener("click", () => {
    state.subnet.q = makeSubnetQuestion(byId("subnetMode").value === "Timed Challenge" ? "Hard" : byId("subnetMode").value);
    ensureSubnetQuestion(false);
  });
  byId("subnetMode").addEventListener("change", () => ensureSubnetQuestion(true));
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

      console.log("User logged in. Syncing database progress...");
      const cloud = await loadUserProgress(user.uid);
      state.analytics = mergeProgress(state.analytics, cloud);
      
      localStorage.setItem(STORE, JSON.stringify(state.analytics));
      saveUserProgress(user.uid, state.analytics);
      
      renderHome();
      renderAnalytics();
    } else {
      btnSignIn.classList.remove("hidden");
      userProfile.classList.add("hidden");
      userPhoto.src = "";
      userName.textContent = "";
    }
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
  setPage("home");
}

init();
