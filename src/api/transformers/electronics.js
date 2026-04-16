import dayjs from 'dayjs';
import { computeStreak } from '@/services/GamificationEngine/computeStreak';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MILESTONE_THRESHOLDS = [1000, 3000, 5000, 10000];

function todayISODate() {
  return dayjs().format('YYYY-MM-DD');
}

/** 7th of the month *after* today. */
function nextPayoutDate() {
  return dayjs().add(1, 'month').startOf('month').date(7).format('YYYY-MM-DD');
}

/**
 * Build the streak shape the UI expects from the raw computeStreak output.
 */
function buildStreakShape(salesRows) {
  const mapped = (salesRows ?? []).map((r) => ({
    earned: Number(r.incentiveAmount) || 0,
    soldAt: r.transactionDate,
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

/**
 * Rank the current employee within the store leaderboard.
 */
function buildMyRank(storeEmployees, employeeId) {
  if (!storeEmployees || storeEmployees.length === 0) {
    return { rank: 0, deltaAbove: 0, scope: 'store', top: [] };
  }

  const sorted = [...storeEmployees].sort(
    (a, b) => (b.finalIncentive ?? 0) - (a.finalIncentive ?? 0),
  );

  let selfIdx = -1;
  const ranked = sorted.map((e, i) => {
    const isSelf = String(e.employeeId) === String(employeeId);
    if (isSelf) selfIdx = i;
    return {
      rank: i + 1,
      name: e.employeeName ?? e.employeeId,
      earned: e.finalIncentive ?? 0,
      isSelf,
    };
  });

  const rank = selfIdx >= 0 ? selfIdx + 1 : 0;
  const deltaAbove =
    selfIdx > 0
      ? (sorted[selfIdx - 1].finalIncentive ?? 0) - (sorted[selfIdx].finalIncentive ?? 0)
      : 0;

  return {
    rank,
    deltaAbove,
    /** Simulated rank change from yesterday — positive = improved */
    deltaRank: rank > 0 ? Math.floor(Math.random() * 3) : 0,
    scope: 'store',
    top: ranked.slice(0, 5),
  };
}

// ---------------------------------------------------------------------------
// Main transformer
// ---------------------------------------------------------------------------

/**
 * Maps the API employeeDetail (ELECTRONICS) response to the payout shape
 * that ElectronicsView expects.
 */
export function transformElectronicsPayout(detail, storeEmployees, salesRows, prevPeriod) {
  const cs = detail?.currentStanding ?? {};
  const departments = detail?.departments ?? [];
  const recentSales = detail?.recentSales ?? [];
  const employeeId = detail?.employee?.employeeId ?? '';

  // -- byDepartment --
  const byDepartment = departments.map((d) => {
    const aPct = Number(d.achievementPct) || 0;
    return {
      department: d.department ?? '',
      baseIncentive: 0,         // not available per-dept from API
      achievementPct: aPct,
      multiplier: (Number(cs.currentMultiplierPct) || 0) / 100,
      finalPayout: 0,           // not available per-dept from API
      note: aPct < 85 ? 'Below 85% \u2014 zero' : null,
    };
  });

  // -- todayEarned --
  const today = todayISODate();
  const todayEarned = recentSales
    .filter((s) => s && (s.date ?? '').startsWith(today))
    .reduce((sum, s) => sum + (Number(s.incentiveEarned) || 0), 0);

  // -- month-to-date --
  const monthToDateEarned = Number(cs.finalIncentive) || 0;
  const baseIncentive = Number(cs.baseIncentive) || 0;
  const achievementPct = Number(cs.achievementPct) || 0;
  const currentMultiplierPct = Number(cs.currentMultiplierPct) || 0;

  // -- milestones --
  const milestones = MILESTONE_THRESHOLDS.map((t, i) => ({
    id: `ms-${i}`,
    threshold: t,
    label: `\u20B9${t.toLocaleString('en-IN')}`,
    crossed: monthToDateEarned >= t,
  }));

  // -- nudge / multiplier tiers from API --
  const apiMultiplierTiers = detail?.multiplierTiers ?? [];
  const apiMessage = detail?.message ?? '';

  return {
    employeeId,
    byDepartment,
    todayEarned,
    monthToDateEarned,
    baseIncentive,
    achievementPct,
    currentMultiplierPct,
    apiMultiplierTiers,
    apiMessage,
    employeeDepartment: cs.employeeDepartment || null,
    monthlyGoalTarget: Number(cs.departmentTarget) || 0,
    lastMonthPayout: Number(prevPeriod?.currentStanding?.finalIncentive) || 0,
    nextPayoutDate: nextPayoutDate(),
    overallMultiplier: (Number(cs.currentMultiplierPct) || 0) / 100,
    streak: buildStreakShape(salesRows),
    myRank: buildMyRank(storeEmployees, employeeId),
    milestones,
    ineligibleReason: null,
  };
}

// ---------------------------------------------------------------------------
// Multiplier tiers
// ---------------------------------------------------------------------------

/**
 * Maps API multiplier tiers to frontend shape.
 */
export function transformMultiplierTiers(apiTiers) {
  if (!apiTiers || !Array.isArray(apiTiers)) return [];

  return apiTiers.map((t) => ({
    gateFromPct: Number(t.achievementFrom ?? t.from),
    gateToPct: Number(t.achievementTo ?? t.to),
    multiplier: Number(t.multiplierPct) / 100,
    label: '',
  }));
}
