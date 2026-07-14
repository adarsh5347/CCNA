import { state, byId, playNetSound, gainXP, saveAnalytics, safeHTML, pick, rand, shuffle, showToast } from "./core.js";
import { blueprint } from "./data.js";
import { ccnaVideos } from "./videos.js";

// We need these utility page/navigation functions from app.js / global scope
function setPage(pageId) {
  if (window.setPage) window.setPage(pageId);
}

function persistSession() {
  try {
    sessionStorage.setItem("ccna_session_state", JSON.stringify(state.session));
  } catch (e) {
    console.error("Session persistence failed:", e);
  }
}

export function toMMSS(sec) {
  const m = Math.floor(Math.max(0, sec) / 60).toString().padStart(2, "0");
  const s = Math.floor(Math.max(0, sec) % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function readinessScore() {
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

export function passProbability() {
  const a = state.analytics;
  if (!a || !a.totalQ) return 0;
  return Math.max(5, Math.min(98, Math.round(readinessScore() * 0.92 + 5)));
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
    el.innerHTML = cards.map((c) => `<div class="stat"><div class="k">${c.k}</div><div class="v">${c.v}</div></div>`).join("");
  }
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
  if (heroStreak) heroStreak.textContent = `${state.analytics.streak || 0} Days`;
  if (heroLabs) heroLabs.textContent = `${state.analytics.labsCompleted || 0} / 10`;
  
  if (window.updateHeaderProfile) window.updateHeaderProfile();

  const easy = state.bank.filter(q => q.difficulty === "Easy").length;
  const medium = state.bank.filter(q => q.difficulty === "Medium").length;
  const hard = state.bank.filter(q => q.difficulty === "Hard").length;
  const coveragePct = Math.round((state.bank.length / blueprint.reduce((s, d) => s + d.count, 0)) * 100);
  renderStatsCards("bankStats", [
    { k: "Total Questions", v: state.bank.length },
    { k: "Blueprint Coverage", v: `${coveragePct}%` },
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

export function renderDomainChecks() {
  const wrap = byId("domainChecks");
  if (wrap) {
    wrap.innerHTML = blueprint.map((d, i) => `<label><input class="qdomain" type="checkbox" value="${d.name}" ${i === 0 ? "checked" : ""} /> ${d.name} (${d.weight}%)</label>`).join("");
  }
}

export function weakTopicBoost(q) {
  const t = state.analytics.topic[q.topic] || { total: 0, correct: 0 };
  const acc = t.total ? t.correct / t.total : 0.55;
  return Math.max(0.2, 1.3 - acc);
}

export function weightedSelection(count, domains) {
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

export function examSelection() {
  const list = [];
  blueprint.forEach((d) => {
    const n = Math.round((d.weight / 100) * 120);
    list.push(...shuffle(state.bank.filter((q) => q.domain === d.name)).slice(0, Math.max(1, n)));
  });
  return shuffle(list).slice(0, 120);
}

export function startSession(mode) {
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

  if (state.session && state.session.timer) clearInterval(state.session.timer);

  state.session = {
    mode,
    ...conf,
    idx: 0,
    answers: new Array(conf.questions.length).fill(null),
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

export function navToQuestion(i) {
  state.session.idx = Math.max(0, Math.min(state.session.questions.length - 1, i));
  state.session.qStartAt = Date.now();
  persistSession();
  renderNavigator();
  renderQuestion();

  const qa = byId("questionArea");
  if (qa) qa.scrollTop = 0;
  window.scrollTo(0, 0);

  const sidebar = document.querySelector(".left");
  const backdrop = byId("sidebarBackdrop");
  if (sidebar && sidebar.classList.contains("active")) {
    sidebar.classList.remove("active");
  }
  if (backdrop && backdrop.classList.contains("active")) {
    backdrop.classList.remove("active");
  }
}

export function renderNavigator() {
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
  const answeredCount = s.answers.filter((a) => a != null).length;
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

export function markCurrent() {
  const s = state.session;
  s.flagged[s.idx] = !s.flagged[s.idx];
  persistSession();
  renderNavigator();
}

export function answerEquals(q, ans) {
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

export function applyStats(q, ok, sec) {
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

export function explanationBlock(q, ok) {
  if (!state.session.showFeedback) return "";
  const e = q.expl;
  if (!e) return "";
  
  let videoBtnHtml = "";
  if (q.topic) {
    const topicLower = q.topic.toLowerCase();
    const matchedVideo = ccnaVideos.find(v => {
      const vTopic = v.topic.toLowerCase();
      return topicLower === vTopic || topicLower.includes(vTopic) || vTopic.includes(topicLower);
    });
    if (matchedVideo) {
      videoBtnHtml = `
        <button class="secondary btn-video-watch" style="margin-top: 12px; padding: 4px 10px; font-size: 11.5px; height: auto;" data-youtube-id="${matchedVideo.youtubeId}" data-video-title="${matchedVideo.title}" data-video-id="${matchedVideo.id}">📺 Watch Related Lesson</button>
      `;
    }
  }
  
  if (e.text && !e.why) {
    return `
      <section class="block ${ok ? "correct" : "wrong"}">
        <h4>Detailed Explanation</h4>
        <p>${safeHTML(e.text)}</p>
        ${e.tip ? `<p><strong>Cisco exam tip:</strong> ${safeHTML(e.tip)}</p>` : ""}
        ${videoBtnHtml}
      </section>
    `;
  }

  return `
    <section class="block ${ok ? "correct" : "wrong"}">
      <h4>Detailed Explanation</h4>
      <p><strong>Correct answer:</strong> ${safeHTML(e.correct || "")}</p>
      <p><strong>Why correct:</strong> ${safeHTML(e.why || "")}</p>
      <p><strong>Why others are wrong:</strong></p>
      <ul>
        ${(e.wrong || []).map(w => `<li>${safeHTML(w)}</li>`).join("")}
      </ul>
      ${e.tip ? `<p><strong>Cisco exam tip:</strong> ${safeHTML(e.tip)}</p>` : ""}
      ${e.memory ? `<p><strong>Memory trick:</strong> ${safeHTML(e.memory)}</p>` : ""}
      ${e.real ? `<p><strong>Real world example:</strong> ${safeHTML(e.real)}</p>` : ""}
      ${e.commands && e.commands.length > 0 ? `<p><strong>Related commands:</strong> ${e.commands.map(x => safeHTML(x)).join(" | ")}</p>` : ""}
      ${videoBtnHtml}
    </section>
  `;
}

export function renderQuestion() {
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
      html += `<div class="opt"><strong>${i + 1}.</strong> <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 16px; flex-wrap: wrap;"><span style="flex: 1; min-width: 150px;">${safeHTML(step)}</span><div class="inline" style="margin-top: 0; display: flex; gap: 8px;"><button class="secondary" data-up="${i}" style="padding: 6px 12px; font-size: 11px; height: auto;">Up</button><button class="secondary" data-down="${i}" style="padding: 6px 12px; font-size: 11px; height: auto;">Down</button></div></div></div>`;
    });
  }

  const ok = s.feedback[s.idx];
  if (ok != null) html += explanationBlock(q, ok);

  byId("questionArea").innerHTML = html;
  
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

export function wireQuestionInputs() {
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

export function instantStudyFeedback(e) {
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

  saveAnalytics();
  renderQuestion();
  renderHome();
}

export function nextQuestion() {
  navToQuestion(state.session.idx + 1);
}

export function prevQuestion() {
  navToQuestion(state.session.idx - 1);
}

export function saveAndNext() {
  applyQuestionTime();
  nextQuestion();
}

export function applyQuestionTime() {
  const s = state.session;
  const spent = Math.max(3, Math.floor((Date.now() - s.qStartAt) / 1000));
  state.analytics.totalTime += spent;
  s.qStartAt = Date.now();
}

export function openReview() {
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

export function submitSession(force) {
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
    html += `<div class="card"><h3>Review (first 20 misses)</h3>${wrong.slice(0, 20).map((x) => {
      const correctVal = x.q.expl.correct || x.q.correct.map(idx => String.fromCharCode(65 + idx)).join(", ");
      const whyVal = x.q.expl.why || x.q.expl.text || "";
      const tipVal = x.q.expl.tip || "";
      return `<div class="output"><strong>Q${x.i + 1}</strong> ${x.q.topic} | Correct: ${correctVal}<br /><span style="display:block; margin-top:6px; color:#a1b2c8"><strong>Explanation:</strong> ${safeHTML(whyVal)}</span>${tipVal ? `<span style="display:block; margin-top:4px; color:#a1b2c8"><strong>Tip:</strong> ${safeHTML(tipVal)}</span>` : ""}</div>`;
    }).join("") || "No incorrect answers."}</div>`;
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
                <strong>Explanation:</strong> ${safeHTML(q.expl.why || q.expl.text || "")}
              </div>
              ${q.expl.tip ? `
              <div style="margin-top: 4px; font-size: 0.95em; color: #a1b2c8;">
                <strong>Tip:</strong> ${safeHTML(q.expl.tip)}
              </div>` : ""}
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

export function updateStreakOnAttempt() {
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

  renderAchievements();
}

export function renderAchievements() {
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

// Particle constellation canvas backdrop
export function setupCanvasConstellation() {
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
      this.vy = (Math.random() - 0.5) * 6 - Math.random() * 2;
      this.radius = Math.random() * 3 + 1.5;
      this.alpha = 1;
      this.decay = Math.random() * 0.015 + 0.01;
      this.color = color || "#00f2fe";
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.05;
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

    if (Math.random() < 0.25 && activeExplosionParticles.length < 100) {
      const p = new ExplosionParticle(e.clientX, e.clientY, Math.random() < 0.5 ? "#00f2fe" : "#10b981");
      p.vx = (Math.random() - 0.5) * 1.5;
      p.vy = (Math.random() - 0.5) * 1.5;
      p.radius = Math.random() * 1.5 + 1;
      p.decay = 0.025;
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

    // Fix: loop backward to prevent index shifting on splice
    for (let i = activeExplosionParticles.length - 1; i >= 0; i--) {
      const p = activeExplosionParticles[i];
      p.update();
      p.draw();
      if (p.alpha <= 0) {
        activeExplosionParticles.splice(i, 1);
      }
    }

    animFrameId = requestAnimationFrame(animate);
  };
  animFrameId = requestAnimationFrame(animate);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(animFrameId);
    } else {
      cancelAnimationFrame(animFrameId);
      animFrameId = requestAnimationFrame(animate);
    }
  });
}
