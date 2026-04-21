import dayjs from 'dayjs';
import { computeStreak } from '@/services/GamificationEngine/computeStreak';
import { safeNum, safeArray, heroWarn } from '@/components/Molecule/HeroCard/safe';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Backend is authoritative via `payoutDate`; this is a soft fallback. */
function fallbackPayoutDate() {
  return dayjs().add(1, 'week').day(5).format('YYYY-MM-DD');
}

function buildStreakShape(weeks) {
  const mapped = safeArray(weeks).map((w) => ({
    earned: safeNum(w?.payout, 0),
    soldAt: w?.periodStart,
  }));
  const result = computeStreak(mapped, new Date());
  return {
    current: result.current,
    longest: result.longest,
    lastActiveDay: result.lastQualifyingDay,
    kind: 'working-days-active',
    label: 'working days',
    caption: 'present + selling',
  };
}

function defaultShape() {
  return {
    weekStart: null,
    weekEnd: null,
    weeklySalesTarget: 0,
    actualWeeklyGrossSales: 0,
    storeQualifies: false,
    totalStoreIncentive: 0,
    staffing: { sms: 0, dms: 0, eligibleSaCount: 0, minWorkingDays: 5 },
    split: { saPoolPct: 0, smSharePct: 0, dmSharePctEach: 0 },
    saPool: 0,
    smPayout: 0,
    dmPayoutEach: 0,
    saPayoutEach: 0,
    myPayout: 0,
    myAttendanceDays: 0,
    myAttendanceEligible: false,
    lastWeekSaPayout: 0,
    nextPayoutDate: fallbackPayoutDate(),
    workingDays: { current: 0, total: 0, daysLeft: 0 },
    streak: { current: 0, longest: 0, lastActiveDay: null, kind: 'working-days-active', label: 'working days', caption: 'present + selling' },
    employees: [],
    recentWeeks: [],
    weekPayouts: [],
    monthAggregate: null,
  };
}

// ---------------------------------------------------------------------------
// Main transformer
// ---------------------------------------------------------------------------

export function transformFnlPayout(detail, _ruleSplits, _storeEmployees) {
  if (!detail) {
    heroWarn('fnl:transform:null-detail', { hasDetail: false });
    return defaultShape();
  }

  const cs = detail.currentStanding ?? {};
  const rawWeeks = safeArray(detail.weeks);
  const roleSplit = cs.roleSplit ?? {};

  if (!cs.roleSplit) {
    heroWarn('fnl:transform:missing-roleSplit', {
      hasCs: Boolean(detail.currentStanding),
      cskeys: Object.keys(cs),
    });
  }

  // ---- Sort + filter weeks ONCE, up front. Backend may return desc order
  // and may mix monthly aggregates in. Every downstream read uses weeklyOnly.
  const sortedWeeks = [...rawWeeks].sort(
    (a, b) => (a?.periodStart || '').localeCompare(b?.periodStart || ''),
  );
  const weeklyOnly = sortedWeeks.filter((w) => {
    if (!w?.periodStart || !w?.periodEnd) return true;
    const span = (new Date(w.periodEnd) - new Date(w.periodStart)) / (1000 * 60 * 60 * 24);
    return span <= 10; // weekly entries are 6-7 days
  });

  const weeklyTarget = safeNum(cs.weeklyTarget, 0);
  const weeklyActual = safeNum(cs.weeklyActual, 0);
  const storePool = safeNum(cs.storePool, 0);
  const exceeded = Boolean(cs.exceeded);

  const saPoolPct = safeNum(roleSplit.saPoolPct, 0);
  const smSharePct = safeNum(roleSplit.smSharePct, 0);
  const dmSharePctEach = safeNum(roleSplit.dmSharePerDmPct, 0);
  const eligibleSaCount = safeNum(cs.eligibleSAs, 0);

  const apiStaffing = detail.staffing ?? {};
  const staffing = {
    sms: safeNum(apiStaffing.sms, 0),
    dms: safeNum(apiStaffing.dms, 0),
    eligibleSaCount: safeNum(apiStaffing.eligibleSAs, eligibleSaCount),
    minWorkingDays: safeNum(apiStaffing.minWorkingDays, 5),
  };

  const saPool = storePool * (saPoolPct / 100);
  const smPayout = storePool * (smSharePct / 100);
  const dmPayoutEach = storePool * (dmSharePctEach / 100);
  const saPayoutEach = eligibleSaCount > 0 ? saPool / eligibleSaCount : 0;

  // Current week = last entry after sorting ascending
  const currentWeek = weeklyOnly.length > 0 ? weeklyOnly[weeklyOnly.length - 1] : null;
  const weekStart = currentWeek?.periodStart ?? cs.periodStart ?? null;
  const weekEnd = currentWeek?.periodEnd ?? cs.periodEnd ?? null;

  // Previous week payout (second-to-last after sort)
  const prevWeek = weeklyOnly.length >= 2 ? weeklyOnly[weeklyOnly.length - 2] : null;
  const lastWeekSaPayout = safeNum(prevWeek?.payout, 0);

  // Recent weeks for trajectory section
  const recentWeeks = weeklyOnly.map((w) => ({
    weekStart: w.periodStart,
    weekEnd: w.periodEnd,
    target: safeNum(w.targetValue, 0),
    actual: safeNum(w.actualSales, 0),
    storeQualified: safeNum(w.actualSales, 0) >= safeNum(w.targetValue, 0),
    totalIncentive: safeNum(w.payout, 0),
  }));

  // Per-week payout shapes for the period selector.
  const weekPayouts = weeklyOnly.map((w, i) => {
    const wTarget = safeNum(w.targetValue, 0);
    const wActual = safeNum(w.actualSales, 0);
    const wExceeded = wActual >= wTarget;
    const wPayout = safeNum(w.payout, 0);
    const prevW = i > 0 ? weeklyOnly[i - 1] : null;
    return {
      weekStart: w.periodStart,
      weekEnd: w.periodEnd,
      weeklySalesTarget: wTarget,
      actualWeeklyGrossSales: wActual,
      storeQualifies: wExceeded,
      totalStoreIncentive: wExceeded ? Math.round(wActual * 0.01) : 0,
      myPayout: wPayout,
      lastWeekSaPayout: safeNum(prevW?.payout, 0),
      myAttendanceDays: safeNum(cs.yourAttendanceDays, 0),
      myAttendanceEligible: Boolean(cs.attendanceEligible),
      staffing,
      split: { saPoolPct, smSharePct, dmSharePctEach },
    };
  });

  // Month aggregate
  const monthAggregate = {
    isMonthView: true,
    weekStart: weeklyOnly.length > 0 ? weeklyOnly[0].periodStart : weekStart,
    weekEnd: weeklyOnly.length > 0 ? weeklyOnly[weeklyOnly.length - 1].periodEnd : weekEnd,
    weeklySalesTarget: weekPayouts.reduce((s, w) => s + w.weeklySalesTarget, 0),
    actualWeeklyGrossSales: weekPayouts.reduce((s, w) => s + w.actualWeeklyGrossSales, 0),
    storeQualifies: weekPayouts.some((w) => w.storeQualifies),
    weeksQualified: weekPayouts.filter((w) => w.storeQualifies).length,
    weeksTotal: weekPayouts.length,
    totalStoreIncentive: weekPayouts.reduce((s, w) => s + w.totalStoreIncentive, 0),
    myPayout: weekPayouts.reduce((s, w) => s + w.myPayout, 0),
    myAttendanceDays: safeNum(cs.yourAttendanceDays, 0),
    myAttendanceEligible: Boolean(cs.attendanceEligible),
    staffing,
    split: { saPoolPct, smSharePct, dmSharePctEach },
  };

  const wd = detail.workingDays ?? {};

  return {
    weekStart,
    weekEnd,
    weeklySalesTarget: weeklyTarget,
    actualWeeklyGrossSales: weeklyActual,
    storeQualifies: exceeded,
    totalStoreIncentive: storePool,
    staffing,
    split: { saPoolPct, smSharePct, dmSharePctEach },
    saPool,
    smPayout,
    dmPayoutEach,
    saPayoutEach,
    myPayout: safeNum(cs.yourPayout, 0),
    myAttendanceDays: safeNum(cs.yourAttendanceDays, 0),
    myAttendanceEligible: Boolean(cs.attendanceEligible),
    lastWeekSaPayout,
    nextPayoutDate: detail.payoutDate || fallbackPayoutDate(),
    workingDays: {
      current: safeNum(wd.current, 0),
      total: safeNum(wd.total, 0),
      daysLeft: safeNum(wd.daysLeft, 0),
    },
    streak: buildStreakShape(rawWeeks),
    employees: safeArray(detail.roster),
    recentWeeks,
    weekPayouts,
    monthAggregate,
  };
}
