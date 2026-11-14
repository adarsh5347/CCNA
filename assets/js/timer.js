import { state, byId, persistSession } from "./core.js?v=78";

const RING_RADIUS = 15;
const RING_CIRCUMFERENCE = Number((2 * Math.PI * RING_RADIUS).toFixed(2)); // 94.25

let registeredTimeoutHandler = null;
let registeredPauseRenderHandler = null;
let lastAnnounceAt = 0;
let lastAnnouncedMinute = null;

export function registerTimerHandlers({ onTimeout, onPauseRender } = {}) {
  if (typeof onTimeout === "function") registeredTimeoutHandler = onTimeout;
  if (typeof onPauseRender === "function") registeredPauseRenderHandler = onPauseRender;
}

export function toMMSS(sec) {
  const safe = Math.max(0, Math.floor(Number(sec) || 0));
  const m = String(Math.floor(safe / 60)).padStart(2, "0");
  const s = String(safe % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function ensureTimerDOM(timerEl) {
  if (!timerEl) return null;
  let ringFill = timerEl.querySelector("#timerRingFill");
  let valueEl = timerEl.querySelector("#timerValue");
  let pauseTag = timerEl.querySelector("#timerPauseTag");
  if (!ringFill || !valueEl) {
    timerEl.classList.add("timer-circular");
    timerEl.setAttribute("role", "timer");
    timerEl.setAttribute("aria-label", "Session timer");
    timerEl.innerHTML = `
      <svg class="timer-ring" viewBox="0 0 36 36" width="34" height="34" aria-hidden="true">
        <circle class="timer-ring-bg" cx="18" cy="18" r="${RING_RADIUS}" fill="none" stroke-width="3"></circle>
        <circle id="timerRingFill" class="timer-ring-fill" cx="18" cy="18" r="${RING_RADIUS}" fill="none" stroke-width="3" stroke-dasharray="${RING_CIRCUMFERENCE}" stroke-dashoffset="0"></circle>
      </svg>
      <span id="timerValue" class="timer-value">00:00</span>
      <span id="timerPauseTag" class="timer-pause-tag hidden">PAUSED</span>
    `;
    ringFill = timerEl.querySelector("#timerRingFill");
    valueEl = timerEl.querySelector("#timerValue");
    pauseTag = timerEl.querySelector("#timerPauseTag");
  }
  return { ringFill, valueEl, pauseTag };
}

export function updateTimerDisplay({ forceAnnounce = false } = {}) {
  const s = state.session;
  if (!s) return;
  const timerEl = byId("timer");
  if (!timerEl) return;

  const parts = ensureTimerDOM(timerEl);
  if (!parts) return;

  const totalSec = Math.max(
    1,
    Number(s.totalDurationSec) || (Number(s.minutes) || 20) * 60
  );
  const timeLeft = Math.max(0, Number(s.timeLeft) || 0);
  const fraction = Math.max(0, Math.min(1, timeLeft / totalSec));
  const dashOffset = Number((RING_CIRCUMFERENCE * (1 - fraction)).toFixed(2));

  if (parts.ringFill) {
    parts.ringFill.setAttribute("stroke-dasharray", String(RING_CIRCUMFERENCE));
    parts.ringFill.setAttribute("stroke-dashoffset", String(dashOffset));
  }

  const formatted = toMMSS(timeLeft);
  if (parts.valueEl) {
    parts.valueEl.textContent = formatted;
  }

  const isPaused = Boolean(s.timerPaused);
  if (parts.pauseTag) {
    parts.pauseTag.classList.toggle("hidden", !isPaused);
  }

  // Color state: <10% danger (red), <25% warn (amber)
  const isDanger = fraction < 0.1;
  const isWarn = !isDanger && fraction < 0.25;
  timerEl.classList.toggle("danger", isDanger);
  timerEl.classList.toggle("warn", isWarn);
  timerEl.classList.toggle("paused", isPaused);
  timerEl.setAttribute(
    "aria-label",
    isPaused ? `Timer paused at ${formatted}` : `Time remaining ${formatted}`
  );

  // Throttled polite screen-reader announcement (at most once per minute, or on pause/resume)
  const liveEl = byId("timerLiveRegion");
  if (liveEl) {
    const now = Date.now();
    const curMinute = Math.ceil(timeLeft / 60);
    const shouldAnnounceMinute =
      !isPaused &&
      curMinute !== lastAnnouncedMinute &&
      (timeLeft % 60 === 0 || now - lastAnnounceAt >= 60000);

    if (forceAnnounce || shouldAnnounceMinute) {
      lastAnnounceAt = now;
      lastAnnouncedMinute = curMinute;
      liveEl.textContent = isPaused
        ? `Quiz timer paused at ${formatted}.`
        : `${curMinute} ${curMinute === 1 ? "minute" : "minutes"} remaining.`;
    }
  }
}

export function stopSessionTimer() {
  if (state.session && state.session.timer) {
    clearInterval(state.session.timer);
    state.session.timer = null;
  }
}

export function startSessionTimer(onTimeout) {
  if (typeof onTimeout === "function") {
    registeredTimeoutHandler = onTimeout;
  }
  const s = state.session;
  if (!s) return;

  stopSessionTimer();

  if (!s.totalDurationSec) {
    s.totalDurationSec = Math.max(1, (Number(s.minutes) || 20) * 60);
  }
  s.timerPaused = Boolean(s.timerPaused);
  if (s.timerPaused && !s.pausedAt) {
    s.pausedAt = Date.now();
  }
  s.deadlineAt = Date.now() + Math.max(0, Number(s.timeLeft) || 0) * 1000;

  updateTimerDisplay({ forceAnnounce: true });

  s.timer = setInterval(() => {
    const cur = state.session;
    if (!cur || cur.submitted) {
      stopSessionTimer();
      return;
    }

    // While paused, skip decrement and elapsed-time accumulation
    if (cur.timerPaused) {
      const now = Date.now();
      if (cur.pausedAt) {
        const delta = Math.max(0, now - cur.pausedAt);
        if (typeof cur.startedAt === "number") {
          cur.startedAt += delta;
        }
      }
      cur.pausedAt = now;
      cur.deadlineAt = now + Math.max(0, Number(cur.timeLeft) || 0) * 1000;
      return;
    }

    cur.timeLeft = Math.max(0, (Number(cur.timeLeft) || 0) - 1);
    cur.deadlineAt = Date.now() + cur.timeLeft * 1000;
    updateTimerDisplay();

    if (cur.timeLeft % 5 === 0) {
      persistSession();
    }

    if (cur.timeLeft <= 0) {
      stopSessionTimer();
      if (typeof registeredTimeoutHandler === "function") {
        registeredTimeoutHandler(true);
      }
    }
  }, 1000);
}

export function toggleTimerPause(onPauseRender) {
  if (typeof onPauseRender === "function") {
    registeredPauseRenderHandler = onPauseRender;
  }
  const s = state.session;
  if (!s || s.submitted) return false;

  const now = Date.now();
  s.timerPaused = !Boolean(s.timerPaused);

  if (s.timerPaused) {
    s.pausedAt = now;
    s.deadlineAt = now + Math.max(0, Number(s.timeLeft) || 0) * 1000;
  } else {
    if (s.pausedAt) {
      const pausedDelta = Math.max(0, now - s.pausedAt);
      if (typeof s.startedAt === "number") {
        s.startedAt += pausedDelta;
      }
      s.pausedAt = null;
    }
    s.deadlineAt = now + Math.max(0, Number(s.timeLeft) || 0) * 1000;
  }

  updateTimerDisplay({ forceAnnounce: true });
  persistSession();

  if (typeof registeredPauseRenderHandler === "function") {
    registeredPauseRenderHandler();
  }

  return s.timerPaused;
}
