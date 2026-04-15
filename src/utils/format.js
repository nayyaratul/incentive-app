export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Parse a date-like value to a Date object.
 *
 * Accepts Date instances, full ISO-8601 strings (e.g. `2026-04-15T00:00:00.000Z`
 * from the API), and plain `YYYY-MM-DD` strings from the local mocks. The
 * `YYYY-MM-DD` branch builds a *local* Date so a string like `'2026-04-15'`
 * doesn't silently drift to the 14th in India timezone via UTC midnight.
 */
function parseDateLike(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

const DEFAULT_DATE_OPTS = { day: '2-digit', month: 'short', year: 'numeric' };

/**
 * Format a date-like value for UI display, e.g. `15 Apr 2026`.
 * Returns an empty string for nullish / unparseable input.
 */
export function formatDate(value, opts = DEFAULT_DATE_OPTS) {
  const d = parseDateLike(value);
  if (!d) return '';
  return d.toLocaleDateString('en-IN', opts);
}

/**
 * Format a start -> end campaign/period range.
 * Collapses duplicate month/year segments to keep the string tight — e.g.
 *   `15 – 25 Apr 2026`                (same month, same year)
 *   `28 Dec 2025 – 05 Jan 2026`       (cross-year: show everything)
 *   `15 Apr – 02 May 2026`            (same year, different months)
 */
export function formatDateRange(start, end) {
  const s = parseDateLike(start);
  const e = parseDateLike(end);
  if (!s && !e) return '';
  if (!s) return formatDate(end);
  if (!e) return formatDate(start);

  const sameYear = s.getFullYear() === e.getFullYear();
  const sameMonth = sameYear && s.getMonth() === e.getMonth();

  if (sameMonth) {
    const startDay = s.toLocaleDateString('en-IN', { day: '2-digit' });
    const endPart = e.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    return `${startDay} – ${endPart}`;
  }
  if (sameYear) {
    const startPart = s.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    const endPart = e.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    return `${startPart} – ${endPart}`;
  }
  return `${formatDate(start)} – ${formatDate(end)}`;
}
