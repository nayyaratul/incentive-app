import dayjs from 'dayjs';
import { computeStreak } from '@/services/GamificationEngine/computeStreak';
import { safeNum, safeArray, heroWarn } from '@/components/Molecule/HeroCard/safe';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nextPayoutDate() {
  // TODO(api): backend should return authoritative payout date (weekly for F&L)
  return dayjs().add(1, 'month').startOf('month').date(7).format('YYYY-MM-DD');
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

// ---------------------------------------------------------------------------
// Leaderboard synthesis (mock). TODO(api): replace with peers endpoint.
// ---------------------------------------------------------------------------

const FNL_PEER_NAMES = [
  'Rahul Shetty',
  'Ishaan Joshi',
  'Dhruv Joshi',
  'Pooja Kulkarni',
  'Kavya Sen',
];

function buildFnlMyRank(detail, saPayoutEach) {
  const cs = detail?.currentStanding ?? {};
  const employee = detail?.employee ?? {};
  const myName = employee.employeeName || employee.employeeId || 'You';
  const myPayout = safeNum(cs.yourPayout, 0)
    || safeNum(cs.currentPayout, 0)
    || safeNum(cs.currentWeekPayout, 0)
    || safeNum(saPayoutEach, 0);

  const peerDeltas = [0.35, 0.18, -0.08, -0.2];
  const fallbackBase = myPayout > 0 ? myPayout : 1100;
  const peers = FNL_PEER_NAMES.slice(0, 4).map((name, i) => ({
    name,
    earned: Math.max(0, Math.round(fallbackBase * (1 + peerDeltas[i]))),
    isSelf: false,
  }));

  const selfEntry = { name: myName, earned: Math.max(0, Math.round(myPayout)), isSelf: true };
  const sorted = [...peers, selfEntry]
    .sort((a, b) => b.earned - a.earned)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  const self = sorted.find((e) => e.isSelf);
  const selfIdx = sorted.findIndex((e) => e.isSelf);
  const deltaAbove = selfIdx > 0 ? sorted[selfIdx - 1].earned - self.earned : 0;

  return {
    rank: self.rank,
    deltaAbove,
    scope: 'store',
    scopeNote: 'by weekly payout',
    unitLabel: 'earned',
    top: sorted,
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
    staffing: { sms: 0, dms: 0, eligibleSaCount: 0 },
    split: { saPoolPct: 0, smSharePct: 0, dmSharePctEach: 0 },
    saPool: 0,
    smPayout: 0,
    dmPayoutEach: 0,
    saPayoutEach: 0,
    myPayout: 0,
    myAttendanceDays: 0,
    myAttendanceEligible: false,
    lastWeekSaPayout: 0,
    nextPayoutDate: nextPayoutDate(),
    streak: { current: 0, longest: 0, lastActiveDay: null, kind: 'working-days-active', label: 'working days', caption: 'present + selling' },
    myRank: { rank: 0, deltaAbove: 0, scope: 'store', top: [] },
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

  // Per-week payout shapes for the period selector. Reads `weeklyOnly[i-1]`
  // for prevW instead of the old `weeks[i-1]` (which was the pre-sort array).
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
      staffing: { sms: 0, dms: 0, eligibleSaCount },
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
    staffing: { sms: 0, dms: 0, eligibleSaCount },
    split: { saPoolPct, smSharePct, dmSharePctEach },
  };

  return {
    weekStart,
    weekEnd,
    weeklySalesTarget: weeklyTarget,
    actualWeeklyGrossSales: weeklyActual,
    storeQualifies: exceeded,
    totalStoreIncentive: storePool,
    staffing: {
      sms: 0,  // TODO(api): needs attendance endpoint
      dms: 0,  // TODO(api): needs attendance endpoint
      eligibleSaCount,
    },
    split: { saPoolPct, smSharePct, dmSharePctEach },
    saPool,
    smPayout,
    dmPayoutEach,
    saPayoutEach,
    myPayout: safeNum(cs.yourPayout, 0),
    myAttendanceDays: safeNum(cs.yourAttendanceDays, 0),
    myAttendanceEligible: Boolean(cs.attendanceEligible),
    lastWeekSaPayout,
    nextPayoutDate: nextPayoutDate(),
    streak: buildStreakShape(rawWeeks),
    myRank: buildFnlMyRank(detail, saPayoutEach),
    employees: [], // TODO(api): needs attendance endpoint
    recentWeeks,
    weekPayouts,
    monthAggregate,
  };
}
