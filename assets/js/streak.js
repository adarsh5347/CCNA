import { state, saveAnalytics } from "./core.js?v=78";

/**
 * Returns local calendar date formatted as YYYY-MM-DD (never UTC slicing).
 * @param {Date} [d=new Date()]
 * @returns {string}
 */
export function getLocalDateStr(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Normalizes a stored date string (YYYY-MM-DD or legacy DateString/ISO) to local YYYY-MM-DD.
 * @param {string|null|undefined} raw
 * @returns {string|null}
 */
export function normalizeDateStr(raw) {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) return null;
  return getLocalDateStr(parsed);
}

/**
 * Computes exact calendar day difference (toDate - fromDate) in whole days.
 * @param {string} fromDateStr
 * @param {string} toDateStr
 * @returns {number}
 */
export function getCalendarDayDiff(fromDateStr, toDateStr) {
  const fromNorm = normalizeDateStr(fromDateStr);
  const toNorm = normalizeDateStr(toDateStr);
  if (!fromNorm || !toNorm) return NaN;
  const [fy, fm, fd] = fromNorm.split("-").map(Number);
  const [ty, tm, td] = toNorm.split("-").map(Number);
  const utcFrom = Date.UTC(fy, fm - 1, fd);
  const utcTo = Date.UTC(ty, tm - 1, td);
  return Math.round((utcTo - utcFrom) / 86400000);
}

/**
 * Returns the streak to display on load/render without mutating state.analytics.
 * If lastAttemptDate is older than yesterday (diff > 1), returns 0.
 * @param {object} [analytics=state.analytics]
 * @returns {number}
 */
export function getDisplayStreak(analytics = state.analytics) {
  if (!analytics || typeof analytics !== "object") return 0;
  const rawStreak = Math.max(0, Math.floor(Number(analytics.streak) || 0));
  if (rawStreak === 0) return 0;
  const lastNorm = normalizeDateStr(analytics.lastAttemptDate);
  if (!lastNorm) return 0;
  const todayStr = getLocalDateStr();
  const diff = getCalendarDayDiff(lastNorm, todayStr);
  if (isNaN(diff) || diff > 1) return 0;
  return rawStreak;
}

/**
 * Computes streak badge metadata and HTML string:
 * <span class="streak-badge streak-{low|mid|high}">🔥 N Day(s)</span>
 * Tiers: low (<3), mid (3-6), high (>=7). Singular "Day" for 1.
 * @param {number} [streakCount]
 */
export function getStreakBadgeInfo(streakCount = getDisplayStreak()) {
  const n = Math.max(0, Math.floor(Number(streakCount) || 0));
  const tier = n >= 7 ? "high" : n >= 3 ? "mid" : "low";
  const unit = n === 1 ? "Day" : "Days";
  const label = `🔥 ${n} ${unit}`;
  const html = `<span class="streak-badge streak-${tier}">${label}</span>`;
  return { count: n, tier, unit, label, html };
}

/**
 * Updates state.analytics.streak and state.analytics.lastAttemptDate on a quiz attempt.
 * - Uses local calendar YYYY-MM-DD
 * - Increments only on consecutive calendar days (diff === 1)
 * - Resets to 1 after a gap (diff > 1) or when starting fresh
 * - No change on the same calendar day (diff === 0, unless streak was 0)
 * - Persists immediately via saveAnalytics(true)
 */
export function updateStreakOnAttempt() {
  const a = state.analytics;
  if (!a) return 0;
  const todayStr = getLocalDateStr();
  const prevNorm = normalizeDateStr(a.lastAttemptDate);
  const prevStreak = Math.max(0, Math.floor(Number(a.streak) || 0));

  if (!prevNorm) {
    a.streak = 1;
    a.lastAttemptDate = todayStr;
  } else if (prevNorm === todayStr) {
    a.streak = prevStreak > 0 ? prevStreak : 1;
    a.lastAttemptDate = todayStr;
  } else {
    const diff = getCalendarDayDiff(prevNorm, todayStr);
    if (diff === 1) {
      a.streak = (prevStreak > 0 ? prevStreak : 0) + 1;
      a.lastAttemptDate = todayStr;
    } else if (diff > 1 || isNaN(diff)) {
      a.streak = 1;
      a.lastAttemptDate = todayStr;
    } else {
      a.streak = Math.max(1, prevStreak);
      a.lastAttemptDate = todayStr;
    }
  }

  saveAnalytics(true);
  return a.streak;
}
