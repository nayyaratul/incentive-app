import dayjs from 'dayjs';
import { computeStreak } from '@/services/GamificationEngine/computeStreak';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nextPayoutDate() {
  return dayjs().add(1, 'month').startOf('month').date(7).format('YYYY-MM-DD');
}

function buildStreakShape(weeks) {
  // FNL is weekly — synthesise one "sale event" per week that had payout > 0
  const mapped = (weeks ?? []).map((w) => ({
    earned: Number(w.payout) || 0,
    soldAt: w.periodStart,
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

// ---------------------------------------------------------------------------
// Main transformer
// ---------------------------------------------------------------------------

/**
 * Maps the API employeeDetail (FNL) response to the payout shape
 * that FnlView expects.
 */
export function transformFnlPayout(detail, ruleSplits, storeEmployees) {
  const cs = detail?.currentStanding ?? {};
  const weeks = detail?.weeks ?? [];
  const roleSplit = cs.roleSplit ?? {};

  const weeklyTarget = Number(cs.weeklyTarget) || 0;
  const weeklyActual = Number(cs.weeklyActual) || 0;
  const storePool = Number(cs.storePool) || 0;
  const exceeded = Boolean(cs.exceeded);

  const saPoolPct = Number(roleSplit.saPoolPct) || 0;
  const smSharePct = Number(roleSplit.smSharePct) || 0;
  const dmSharePctEach = Number(roleSplit.dmSharePerDmPct) || 0;
  const eligibleSaCount = Number(cs.eligibleSAs) || 0;

  // Compute pool sub-amounts
  const saPool = storePool * (saPoolPct / 100);
  const smPayout = storePool * (smSharePct / 100);
  const dmPayoutEach = storePool * (dmSharePctEach / 100);
  const saPayoutEach = eligibleSaCount > 0 ? saPool / eligibleSaCount : 0;

  // Current week dates
  const currentWeek = weeks.length > 0 ? weeks[weeks.length - 1] : null;
  const weekStart = currentWeek?.periodStart ?? cs.periodStart ?? null;
  const weekEnd = currentWeek?.periodEnd ?? cs.periodEnd ?? null;

  // Previous week SA payout (second-to-last entry)
  const prevWeek = weeks.length >= 2 ? weeks[weeks.length - 2] : null;
  const lastWeekSaPayout = Number(prevWeek?.payout) || 0;

  // Recent weeks for the trajectory section
  const recentWeeks = weeks.map((w) => ({
    weekStart: w.periodStart,
    weekEnd: w.periodEnd,
    target: Number(w.targetValue) || 0,
    actual: Number(w.actualSales) || 0,
    storeQualified: (Number(w.actualSales) || 0) >= (Number(w.targetValue) || 0),
    totalIncentive: Number(w.payout) || 0,
  }));

  return {
    weekStart,
    weekEnd,
    weeklySalesTarget: weeklyTarget,
    actualWeeklyGrossSales: weeklyActual,
    storeQualifies: exceeded,
    totalStoreIncentive: storePool,
    staffing: {
      sms: 0,  // needs attendance endpoint
      dms: 0,  // needs attendance endpoint
      eligibleSaCount,
    },
    split: {
      saPoolPct,
      smSharePct,
      dmSharePctEach,
    },
    saPool,
    smPayout,
    dmPayoutEach,
    saPayoutEach,
    lastWeekSaPayout,
    nextPayoutDate: nextPayoutDate(),
    streak: buildStreakShape(weeks),
    myRank: null, // not available yet
    employees: [], // needs attendance endpoint
    recentWeeks,
  };
}
