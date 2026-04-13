import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Compute streak (consecutive days with ≥1 qualifying sale) ending at `today`.
 *
 * A qualifying day = ≥1 SaleEvent with `earned > 0` within that day in `tz`.
 * If today has no qualifying sale yet, streak is still "alive" (grace = today).
 * One missed day resets current to 0.
 *
 * @param {Array<{earned:number, soldAt:string}>} sales
 * @param {Date} today
 * @param {string} tz
 * @returns {{current:number, longest:number, lastQualifyingDay:string|null}}
 */
export function computeStreak(sales, today, tz = 'Asia/Kolkata') {
  if (!sales || sales.length === 0) {
    return { current: 0, longest: 0, lastQualifyingDay: null };
  }

  const qualifyingDays = new Set(
    sales
      .filter((s) => s && s.earned > 0)
      .map((s) => dayjs(s.soldAt).tz(tz).format('YYYY-MM-DD'))
  );

  if (qualifyingDays.size === 0) {
    return { current: 0, longest: 0, lastQualifyingDay: null };
  }

  const todayStr = dayjs(today).tz(tz).format('YYYY-MM-DD');
  const sortedDays = [...qualifyingDays].sort();
  const lastQualifyingDay = sortedDays[sortedDays.length - 1];

  // Longest run in the provided window
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = dayjs.tz(sortedDays[i - 1], tz);
    const curr = dayjs.tz(sortedDays[i], tz);
    if (curr.diff(prev, 'day') === 1) {
      run += 1;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }

  // Current streak: count consecutive days ending at today (or yesterday if today has no sale yet).
  let anchor = qualifyingDays.has(todayStr) ? todayStr : dayjs.tz(todayStr, tz).subtract(1, 'day').format('YYYY-MM-DD');
  let current = 0;
  while (qualifyingDays.has(anchor)) {
    current += 1;
    anchor = dayjs.tz(anchor, tz).subtract(1, 'day').format('YYYY-MM-DD');
  }

  return { current, longest, lastQualifyingDay };
}
