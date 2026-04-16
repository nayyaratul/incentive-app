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
// Leaderboard synthesis (mock) — peers and ranks are fabricated from the
// current user's weekly payout since the API doesn't yet return peer rankings.
// MOCK-TODO: Remove this synthesiser and consume real peer data from API.
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
  const myPayout =
    Number(cs.yourPayout) ||
    Number(cs.currentPayout) ||
    Number(cs.currentWeekPayout) ||
    Number(saPayoutEach) ||
    0;

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

// ---------------------------------------------------------------------------
// Main transformer
// ---------------------------------------------------------------------------

/**
 * Maps the API employeeDetail (FNL) response to the payout shape
 * that FnlView expects.
 */
export function transformFnlPayout(detail, _ruleSplits, _storeEmployees) {
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
    myPayout: Number(cs.yourPayout) || 0,
    myAttendanceDays: Number(cs.yourAttendanceDays) || 0,
    myAttendanceEligible: Boolean(cs.attendanceEligible),
    lastWeekSaPayout,
    nextPayoutDate: nextPayoutDate(),
    streak: buildStreakShape(weeks),
    myRank: buildFnlMyRank(detail, saPayoutEach),
    employees: [], // needs attendance endpoint
    recentWeeks,
  };
}
