/**
 * Hero-card safety helpers.
 *
 * Purpose: kill every path to `NaN`, `Infinity`, `undefined%`, or `₹NaN` in
 * the rendered hero card. All numeric reads coming from the API pass through
 * these helpers so a malformed or partial response still renders cleanly.
 *
 * Also exposes structured console warnings for malformed inputs so pilot
 * triage has a trail to follow. Warnings are rate-limited per key to avoid
 * flooding the console.
 */

/** Coerce any value to a finite number; fall back to `fallback` (default 0). */
export function safeNum(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Percent 0..∞, clamped to [0, clamp]. Default clamp = 999 so 120%+ still renders. */
export function safePct(value, { clamp = 999, fallback = 0 } = {}) {
  const n = safeNum(value, fallback);
  if (n < 0) return 0;
  if (n > clamp) return clamp;
  return Math.round(n);
}

/** Safe division that returns `fallback` when denom is 0 or non-finite. */
export function safeDiv(num, denom, fallback = 0) {
  const d = safeNum(denom, 0);
  if (d === 0) return fallback;
  const result = safeNum(num, 0) / d;
  return Number.isFinite(result) ? result : fallback;
}

/** Division followed by Math.round — common pattern for ₹ amounts. */
export function safeDivRound(num, denom, fallback = 0) {
  return Math.round(safeDiv(num, denom, fallback));
}

/** Ensure a value is an array; return `[]` if not. */
export function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

/** Pick the first defined, finite field from an object across candidate keys. */
export function pickNum(obj, keys, fallback = 0) {
  if (!obj) return fallback;
  for (const k of keys) {
    const n = Number(obj[k]);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

/**
 * Derive the banner tone from a store-level achievement %.
 * Used by Electronics SM/DM, Grocery, F&L.
 */
export function pickBannerTone(achievementPct, unlockPct = 100) {
  const p = safeNum(achievementPct, 0);
  if (p >= 120) return 'exceeded';
  if (p >= unlockPct) return 'qualified';
  if (p >= unlockPct * 0.85) return 'progress';
  return 'locked';
}

// ---------------------------------------------------------------------------
// Structured warnings (rate-limited)
// ---------------------------------------------------------------------------

const seenKeys = new Set();

/**
 * Log a structured warning when a mapper / transformer receives malformed data.
 * Each key fires at most once per session to avoid spam.
 *
 * @param {string} key - Stable identifier (e.g. 'fnl:missing-roleSplit')
 * @param {object} payload - Extra context for debugging
 */
export function heroWarn(key, payload) {
  if (seenKeys.has(key)) return;
  seenKeys.add(key);
  if (typeof console !== 'undefined' && console.warn) {
    // eslint-disable-next-line no-console
    console.warn(`[hero] ${key}`, payload);
  }
}
