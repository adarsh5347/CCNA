import { state, byId, safeHTML, persistSession } from "./core.js?v=78";

let registeredJumpHandler = null;
let registeredSubmitHandler = null;
let registeredRenderQuestionHandler = null;

export function registerReviewHandlers({ onJump, onSubmit, onRenderQuestion } = {}) {
  if (typeof onJump === "function") registeredJumpHandler = onJump;
  if (typeof onSubmit === "function") registeredSubmitHandler = onSubmit;
  if (typeof onRenderQuestion === "function") registeredRenderQuestionHandler = onRenderQuestion;
}

export function md(str) {
  const s = safeHTML(str);
  if (typeof s !== "string") return s;
  return s
    .replace(/`([^`\n]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
}

export function isQuestionAnswered(q, ans) {
  if (ans == null) return false;
  if (Array.isArray(ans)) return ans.length > 0;
  if (typeof ans === "object") {
    return Object.values(ans).some((v) => v != null && v !== "");
  }
  return true;
}

/**
 * Formats a user's answer or the correct answer of a question into readable HTML.
 */
export function formatQuestionAnswer(q, ans, isUserAnswer = false) {
  if (!q) return `<span class="muted">N/A</span>`;

  const isMulti = q.type === "multi" || (Array.isArray(q.correct) && q.correct.length > 1);

  if (isMulti) {
    const indices = isUserAnswer
      ? Array.isArray(ans)
        ? ans
        : []
      : Array.isArray(q.correct)
      ? q.correct
      : [];
    if (indices.length === 0) {
      return `<span class="review-unanswered">No Answer</span>`;
    }
    return indices
      .slice()
      .sort((a, b) => a - b)
      .map((v) => {
        const letter = String.fromCharCode(65 + Number(v));
        const optText = q.options && q.options[v] != null ? md(q.options[v]) : `Option ${letter}`;
        return `<span class="review-ans-chip"><strong>${letter}.</strong> ${optText}</span>`;
      })
      .join(" ");
  }

  if (q.type === "single" || q.type === "scenario") {
    const idx = isUserAnswer
      ? ans
      : Array.isArray(q.correct)
      ? q.correct[0]
      : q.correct;
    if (idx == null || !q.options || q.options[idx] == null) {
      return `<span class="review-unanswered">No Answer</span>`;
    }
    const letter = String.fromCharCode(65 + Number(idx));
    return `<span class="review-ans-chip"><strong>${letter}.</strong> ${md(q.options[idx])}</span>`;
  }

  if (q.type === "matching") {
    const pairs = Array.isArray(q.pairs) ? q.pairs : [];
    if (isUserAnswer) {
      if (!ans || typeof ans !== "object" || !Object.values(ans).some((v) => v)) {
        return `<span class="review-unanswered">No Answer</span>`;
      }
      return pairs
        .map((p, i) => {
          const picked = ans[i] ? safeHTML(String(ans[i])) : "<em>Unmatched</em>";
          return `<span class="review-ans-chip"><strong>${safeHTML(String(p[0]))}:</strong> ${picked}</span>`;
        })
        .join(" ");
    }
    return pairs
      .map((p) => `<span class="review-ans-chip"><strong>${safeHTML(String(p[0]))}:</strong> ${safeHTML(String(p[1]))}</span>`)
      .join(" ");
  }

  if (q.type === "dragdrop" || Array.isArray(q.order)) {
    const order = isUserAnswer ? ans : q.order;
    if (!Array.isArray(order) || order.length === 0) {
      return `<span class="review-unanswered">No Answer</span>`;
    }
    return order
      .map((step, i) => `<span class="review-ans-chip"><strong>${i + 1}.</strong> ${safeHTML(String(step))}</span>`)
      .join(' <span class="muted">→</span> ');
  }

  return safeHTML(String(ans ?? "No Answer"));
}

export function closeReview() {
  const ra = byId("reviewArea");
  if (ra) ra.classList.add("hidden");
  const qa = byId("questionArea");
  if (qa) qa.classList.remove("hidden");
  if (typeof registeredRenderQuestionHandler === "function") {
    registeredRenderQuestionHandler();
  }
}

function formatReviewChapter(ch) {
  if (!ch) return "";
  const m = /^v(\d+)c(\d+)$/i.exec(ch);
  return m ? `OCG Vol ${m[1]} Ch ${Number(m[2])}` : String(ch).toUpperCase();
}

export function openReview() {
  const s = state.session;
  if (!s) return;

  const totalQ = s.questions.length;
  const unanswered = s.questions.filter((q, i) => !isQuestionAnswered(q, s.answers[i])).length;
  const answeredCount = totalQ - unanswered;
  const flaggedCount = Object.values(s.flagged || {}).filter(Boolean).length;
  const revealedCount = Object.values(s.revealed || {}).filter(Boolean).length;
  const isExam = s.mode === "exam";

  let html = `
    <div class="exam-review-screen">
      <div class="exam-review-top">
        <div>
          <span class="exam-sub-kicker">${isExam ? "FINAL CONFIRMATION // PRE-SUBMISSION" : "SESSION OVERVIEW // QUESTION ROSTER"}</span>
          <h3>${isExam ? "Review & Confirm Submission" : "Review Screen"}</h3>
          <p class="exam-review-sub">Inspect answered, pending, or flagged items below before submitting.</p>
        </div>
        <button type="button" class="secondary" id="backToQuizFromReview">⬅️ Back to Quiz</button>
      </div>

      <div class="exam-review-metrics">
        <div class="erm-cell"><span>Total</span><strong>${totalQ}</strong></div>
        <div class="erm-cell is-answered"><span>Answered</span><strong>${answeredCount}</strong></div>
        <div class="erm-cell is-unanswered"><span>Unanswered</span><strong>${unanswered}</strong></div>
        <div class="erm-cell is-flagged"><span>Flagged</span><strong>${flaggedCount}</strong></div>
        ${revealedCount ? `<div class="erm-cell is-revealed"><span>Revealed</span><strong>${revealedCount}</strong></div>` : ""}
      </div>

      ${
        isExam
          ? `<div id="examSubmitConfirmPanel" class="exam-submit-confirm-panel" role="region" aria-label="Final Exam Submission Confirmation">
              <div class="exam-confirm-copy">
                <strong>Ready to finalize your examination?</strong>
                <p>${
                  unanswered > 0
                    ? `You still have <strong>${unanswered}</strong> unanswered question${unanswered === 1 ? "" : "s"}${flaggedCount > 0 ? ` and <strong>${flaggedCount}</strong> flagged for review` : ""}. Submitting locks answers and generates your domain score report.`
                    : `All ${totalQ} questions answered${flaggedCount > 0 ? ` (${flaggedCount} flagged)` : ""}. Confirm below to submit for grading.`
                }</p>
              </div>
              <div class="exam-confirm-actions">
                <button type="button" class="primary" id="finalizeFromReview">Finalize &amp; Submit Exam →</button>
              </div>
            </div>`
          : ""
      }

      <div class="exam-pre-filters" role="group" aria-label="Filter pre-submit question roster">
        <button type="button" class="pre-filter-btn active" data-pre-filter="all" aria-pressed="true">All (${totalQ})</button>
        <button type="button" class="pre-filter-btn" data-pre-filter="unanswered" aria-pressed="false">Unanswered (${unanswered})</button>
        <button type="button" class="pre-filter-btn" data-pre-filter="flagged" aria-pressed="false">Flagged (${flaggedCount})</button>
      </div>

      <div class="review-table">
        ${s.questions
          .map((q, i) => {
            const isAns = isQuestionAnswered(q, s.answers[i]);
            const isFlag = Boolean(s.flagged && s.flagged[i]);
            const isRev = Boolean(s.revealed && s.revealed[i]);
            const statusClass = isRev ? "is-rev" : isAns ? "is-ans" : "is-pend";
            const statusLabel = isRev
              ? "Revealed"
              : isAns
              ? "Answered"
              : "Unanswered";
            return `
              <div class="review-row ${statusClass}" data-answered="${isAns ? "true" : "false"}" data-flagged="${isFlag ? "true" : "false"}">
                <div class="review-row-num">
                  <strong>Q${i + 1}</strong>
                  ${isFlag ? `<span class="review-flag-tag" title="Flagged for review">🚩 Flagged</span>` : ""}
                </div>
                <div class="review-row-topic">
                  <span class="review-row-domain">${safeHTML(q.domain)}</span>
                  <span class="review-row-subtopic">${safeHTML(q.topic)}</span>
                </div>
                <div class="review-row-status">
                  <span class="review-pill ${statusClass}">${statusLabel}</span>
                </div>
                <div class="review-row-cta">
                  <button type="button" class="ghost" data-jump="${i}" aria-label="Jump to question ${i + 1}">Open</button>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;

  const ra = byId("reviewArea");
  if (!ra) return;
  ra.innerHTML = html;
  ra.classList.remove("hidden");
  byId("questionArea")?.classList.add("hidden");
  byId("resultArea")?.classList.add("hidden");

  ra.scrollTop = 0;
  window.scrollTo(0, 0);

  const backBtn = byId("backToQuizFromReview");
  if (backBtn) {
    backBtn.addEventListener("click", closeReview);
  }

  ra.querySelectorAll(".pre-filter-btn[data-pre-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.preFilter || "all";
      ra.querySelectorAll(".pre-filter-btn").forEach((b) => {
        const active = b === btn;
        b.classList.toggle("active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      ra.querySelectorAll(".review-table .review-row").forEach((row) => {
        const ans = row.dataset.answered === "true";
        const flg = row.dataset.flagged === "true";
        const show = mode === "all" || (mode === "unanswered" && !ans) || (mode === "flagged" && flg);
        row.classList.toggle("hidden", !show);
      });
    });
  });

  ra.querySelectorAll("[data-jump]").forEach((b) => {
    b.addEventListener("click", () => {
      ra.classList.add("hidden");
      byId("questionArea")?.classList.remove("hidden");
      if (typeof registeredJumpHandler === "function") {
        registeredJumpHandler(Number(b.dataset.jump));
      }
    });
  });

  const f = byId("finalizeFromReview");
  if (f) {
    f.addEventListener("click", () => {
      if (typeof registeredSubmitHandler === "function") {
        registeredSubmitHandler(true);
      }
    });
  }

  const prevBtn = byId("prevQ");
  const markBtn = byId("toggleMark");
  const openReviewBtn = byId("openReview");
  const saveNextBtn = byId("saveNext");
  const submitSessionBtn = byId("submitSession");

  if (prevBtn) {
    prevBtn.style.display = "";
    prevBtn.disabled = false;
    const fullText = prevBtn.querySelector(".btn-full-text");
    const mobileText = prevBtn.querySelector(".btn-mobile-text");
    if (fullText) fullText.textContent = "⬅️ Back to Quiz";
    if (mobileText) mobileText.textContent = "⬅️ Back";
  }
  if (markBtn) markBtn.style.display = "none";
  if (openReviewBtn) openReviewBtn.style.display = "none";
  if (saveNextBtn) saveNextBtn.style.display = "none";
  if (submitSessionBtn) {
    submitSessionBtn.style.display = "";
    const fullLabel = s.mode === "exam" ? "Submit Exam" : "Submit Quiz";
    submitSessionBtn.innerHTML = `<span class="btn-full-text">${fullLabel}</span><span class="btn-mobile-text">Submit</span>`;
  }
}

/**
 * Builds the post-finish Answer Review HTML listing every question with:
 * - User's answer
 * - Correct answer
 * - ✅ / ❌ (and Revealed / Flagged badges)
 * - Explanation (if present)
 * - "Jump to question" link
 * - Filter buttons: All / Incorrect / Flagged
 */
export function buildFinishReviewHTML(session, { answerEqualsFn } = {}) {
  if (!session || !Array.isArray(session.questions)) return "";

  let incorrectCount = 0;
  let flaggedCount = 0;

  const itemsHTML = session.questions
    .map((q, idx) => {
      const userAns = session.answers[idx];
      const isRevealed = Boolean(session.revealed && session.revealed[idx]);
      const isFlagged = Boolean(session.flagged && session.flagged[idx]);
      const rawOk = typeof answerEqualsFn === "function" ? Boolean(answerEqualsFn(q, userAns)) : false;
      const isScoredCorrect = !isRevealed && rawOk;

      if (!isScoredCorrect) incorrectCount++;
      if (isFlagged) flaggedCount++;

      const statusClass = isRevealed
        ? "review-item-revealed"
        : isScoredCorrect
        ? "review-item-correct"
        : "review-item-incorrect";

      const statusBadge = isRevealed
        ? `<span class="review-status-pill revealed" title="Revealed during quiz — excluded from score">Revealed (Excluded from Score)</span>`
        : isScoredCorrect
        ? `<span class="review-status-pill correct">Correct</span>`
        : `<span class="review-status-pill incorrect">Incorrect</span>`;

      const flagBadge = isFlagged
        ? `<span class="review-status-pill flagged">🚩 Flagged</span>`
        : "";

      const chText = formatReviewChapter(q.chapter);
      const userAnsHTML = formatQuestionAnswer(q, userAns, true);
      const correctAnsHTML = formatQuestionAnswer(q, null, false);

      const explText = q.expl ? (q.expl.why || q.expl.text || "") : "";
      const tipText = q.expl && q.expl.tip ? q.expl.tip : "";
      const cmds = q.expl && Array.isArray(q.expl.commands) && q.expl.commands.length > 0 ? q.expl.commands : [];

      return `
        <article class="review-card-item ${statusClass}" data-review-idx="${idx}" data-correct="${isScoredCorrect ? "true" : "false"}" data-flagged="${isFlagged ? "true" : "false"}" data-revealed="${isRevealed ? "true" : "false"}">
          <div class="review-card-head">
            <div class="review-card-meta">
              <span class="badge">Q${idx + 1}</span>
              <span class="badge">${safeHTML(q.domain || "General")}</span>
              ${q.topic ? `<span class="badge badge-neutral">${safeHTML(q.topic)}</span>` : ""}
              ${q.difficulty ? `<span class="badge badge-neutral">${safeHTML(q.difficulty)}</span>` : ""}
              ${chText ? `<span class="badge badge-neutral">${safeHTML(chText)}</span>` : ""}
              ${statusBadge}
              ${flagBadge}
            </div>
            <button type="button" class="secondary btn-jump-question" data-jump-idx="${idx}" aria-label="Jump to question ${idx + 1}">
              Inspect Question ↗
            </button>
          </div>
          <div class="review-card-prompt">${md(q.text)}</div>
          <div class="review-card-answers">
            <div class="review-answer-row ${isScoredCorrect ? "ans-ok" : "ans-bad"}">
              <span class="review-answer-label">Your Answer</span>
              <div class="review-answer-val">${userAnsHTML}</div>
            </div>
            <div class="review-answer-row ans-correct">
              <span class="review-answer-label">Correct Answer</span>
              <div class="review-answer-val">${correctAnsHTML}</div>
            </div>
          </div>
          ${
            explText || tipText || cmds.length > 0
              ? `<div class="review-card-exp">
                  ${explText ? `<div class="review-exp-body"><strong>Explanation:</strong> ${md(explText)}</div>` : ""}
                  ${tipText ? `<div class="review-card-tip"><strong>Exam Tip:</strong> ${md(tipText)}</div>` : ""}
                  ${cmds.length > 0 ? `<div class="review-card-cmds"><strong>IOS Commands:</strong> ${cmds.map((c) => `<code>${safeHTML(c)}</code>`).join(" ")}</div>` : ""}
                </div>`
              : ""
          }
        </article>
      `;
    })
    .join("");

  const totalCount = session.questions.length;

  return `
    <div class="card finish-review-section" role="region" aria-label="Detailed Answer Review">
      <div class="finish-review-header">
        <div>
          <span class="exam-sub-kicker">DETAILED BREAKDOWN // ${totalCount} ITEMS</span>
          <h3>Answer Review</h3>
          <p class="finish-review-sub">Filter by correctness or flagged status, or open any question card directly.</p>
        </div>
        <div class="review-filters" role="group" aria-label="Filter reviewed questions">
          <button type="button" class="review-filter-btn active" data-review-filter="all" aria-pressed="true">
            All (${totalCount})
          </button>
          <button type="button" class="review-filter-btn" data-review-filter="incorrect" aria-pressed="false">
            Incorrect (${incorrectCount})
          </button>
          <button type="button" class="review-filter-btn" data-review-filter="flagged" aria-pressed="false">
            Flagged (${flaggedCount})
          </button>
        </div>
      </div>
      <div id="reviewFilterEmpty" class="review-filter-empty hidden" role="status" aria-live="polite"></div>
      <div id="finishReviewList" class="finish-review-list">
        ${itemsHTML}
      </div>
    </div>
  `;
}

/**
 * Wires filter buttons (All / Incorrect / Flagged) and "Jump to question" links inside #resultArea.
 */
export function wireFinishReviewInteractions(container, { onJumpToQuestion } = {}) {
  if (!container) return;

  const filterBtns = container.querySelectorAll(".review-filter-btn[data-review-filter]");
  const items = container.querySelectorAll(".review-card-item[data-review-idx]");
  const emptyEl = container.querySelector("#reviewFilterEmpty");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.reviewFilter || "all";
      filterBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("active", active);
        b.setAttribute("aria-pressed", active ? "true" : "false");
      });

      let visibleCount = 0;
      items.forEach((item) => {
        const isCorrect = item.dataset.correct === "true";
        const isFlagged = item.dataset.flagged === "true";
        let show = true;
        if (filter === "incorrect") {
          show = !isCorrect;
        } else if (filter === "flagged") {
          show = isFlagged;
        }
        item.classList.toggle("hidden", !show);
        if (show) visibleCount++;
      });

      if (emptyEl) {
        if (visibleCount === 0) {
          emptyEl.textContent =
            filter === "flagged"
              ? "No flagged questions in this quiz session."
              : filter === "incorrect"
              ? "Zero incorrect questions — 100% accuracy!"
              : "No questions to display.";
          emptyEl.classList.remove("hidden");
        } else {
          emptyEl.classList.add("hidden");
        }
      }
    });
  });

  container.querySelectorAll(".btn-jump-question[data-jump-idx]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.jumpIdx);
      if (!isNaN(idx) && typeof onJumpToQuestion === "function") {
        onJumpToQuestion(idx);
      }
    });
  });
}
