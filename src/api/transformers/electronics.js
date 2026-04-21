import dayjs from 'dayjs';
import { computeStreak } from '@/services/GamificationEngine/computeStreak';
import { safeNum, safeArray, heroWarn } from '@/components/Molecule/HeroCard/safe';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MILESTONE_THRESHOLDS = [1000, 3000, 5000, 10000];

function todayISODate() {
  return dayjs().format('YYYY-MM-DD');
}

/** Client-side fallback — backend is authoritative via `payoutDate`. */
function fallbackPayoutDate() {
  return dayjs().add(1, 'month').startOf('month').date(7).format('YYYY-MM-DD');
}

function buildStreakShape(salesRows) {
  const mapped = safeArray(salesRows).map((r) => ({
    earned: safeNum(r?.incentiveAmount, 0),
    soldAt: r?.transactionDate,
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
// Default shape — returned when input is missing / malformed. Hero card
// renders safely from this (all numbers are finite, all arrays exist).
// ---------------------------------------------------------------------------

function defaultShape() {
  return {
    employeeId: '',
    byDepartment: [],
    todayEarned: 0,
    monthToDateEarned: 0,
    baseIncentive: 0,
    maxPotentialIncentive: 0,
    achievementPct: 0,
    currentMultiplierPct: 0,
    apiMultiplierTiers: [],
    apiMessage: '',
    employeeDepartment: null,
    monthlyGoalTarget: 0,
    lastMonthPayout: 0,
    nextPayoutDate: fallbackPayoutDate(),
    workingDays: { current: 0, total: 0, daysLeft: 0 },
    runRate: { perDay: 0, projected: 0, projectedPct: 0 },
    overallMultiplier: 0,
    streak: { current: 0, longest: 0, lastActiveDay: null, kind: 'working-days-active', label: 'working days', caption: 'present + selling' },
    milestones: MILESTONE_THRESHOLDS.map((t, i) => ({
      id: `ms-${i}`,
      threshold: t,
      label: `\u20B9${t.toLocaleString('en-IN')}`,
      crossed: false,
    })),
    ineligibleReason: null,
  };
}

// ---------------------------------------------------------------------------
// Main transformer
// ---------------------------------------------------------------------------

/**
 * Maps the API employeeDetail (ELECTRONICS) response to the payout shape
 * that ElectronicsView expects.
 *
 * Null-safe: returns a fully-formed default shape when `detail` is missing,
 * so the UI can render without crashing. Warnings are logged once per key.
 */
export function transformElectronicsPayout(detail, _storeEmployees, salesRows, prevPeriod) {
  if (!detail) {
    heroWarn('electronics:transform:null-detail', { hasDetail: false });
    return defaultShape();
  }

  const cs = detail.currentStanding ?? {};
  const departments = safeArray(detail.departments);
  const recentSales = safeArray(detail.recentSales);
  const employeeId = detail.employee?.employeeId ?? '';

  if (!cs || Object.keys(cs).length === 0) {
    heroWarn('electronics:transform:empty-currentStanding', { employeeId });
  }

  // -- byDepartment --
  const byDepartment = departments.map((d) => {
    const aPct = safeNum(d.achievementPct, 0);
    const dMultPct = safeNum(d.multiplierPct ?? d.currentMultiplierPct ?? cs.currentMultiplierPct, 0);
    return {
      department: d.department ?? '',
      target: safeNum(d.target, 0),
      actual: safeNum(d.actual, 0),
      baseIncentive: safeNum(d.baseIncentive, 0),
      achievementPct: aPct,
      multiplier: dMultPct / 100,
      finalPayout: safeNum(d.finalIncentive ?? d.finalPayout, 0),
      note: aPct < 85 ? 'Below 85% \u2014 zero' : null,
    };
  });

  // -- todayEarned --
  const today = todayISODate();
  const todayEarned = recentSales
    .filter((s) => s && (s.date ?? '').startsWith(today))
    .reduce((sum, s) => sum + safeNum(s.incentiveEarned, 0), 0);

  // -- month-to-date --
  const monthToDateEarned = safeNum(cs.finalIncentive, 0);
  const baseIncentive = safeNum(cs.baseIncentive, 0);
  const maxPotentialIncentive = safeNum(cs.maxPotentialIncentive, baseIncentive);
  const achievementPct = safeNum(cs.achievementPct, 0);
  const currentMultiplierPct = safeNum(cs.currentMultiplierPct, 0);

  // -- milestones --
  const milestones = MILESTONE_THRESHOLDS.map((t, i) => ({
    id: `ms-${i}`,
    threshold: t,
    label: `\u20B9${t.toLocaleString('en-IN')}`,
    crossed: monthToDateEarned >= t,
  }));

  const apiMultiplierTiers = safeArray(detail.multiplierTiers);
  const apiMessage = detail.message ?? '';

  const wd = detail.workingDays ?? {};
  const rr = detail.runRate ?? {};

  return {
    employeeId,
    byDepartment,
    todayEarned,
    monthToDateEarned,
    baseIncentive,
    maxPotentialIncentive,
    achievementPct,
    currentMultiplierPct,
    apiMultiplierTiers,
    apiMessage,
    employeeDepartment: cs.employeeDepartment || null,
    monthlyGoalTarget: safeNum(cs.departmentTarget, baseIncentive),
    lastMonthPayout: safeNum(prevPeriod?.currentStanding?.finalIncentive, 0),
    nextPayoutDate: detail.payoutDate || fallbackPayoutDate(),
    workingDays: {
      current: safeNum(wd.current, 0),
      total: safeNum(wd.total, 0),
      daysLeft: safeNum(wd.daysLeft, 0),
    },
    runRate: {
      perDay: safeNum(rr.perDay, 0),
      projected: safeNum(rr.projected, 0),
      projectedPct: safeNum(rr.projectedPct, 0),
    },
    overallMultiplier: currentMultiplierPct / 100,
    streak: buildStreakShape(salesRows),
    milestones,
    ineligibleReason: detail.employee?.ineligibleReason ?? cs.ineligibleReason ?? null,
  };
}

// ---------------------------------------------------------------------------
// Multiplier tiers
// ---------------------------------------------------------------------------

export function transformMultiplierTiers(apiTiers) {
  return safeArray(apiTiers).map((t) => ({
    gateFromPct: safeNum(t.achievementFrom ?? t.from, 0),
    gateToPct: safeNum(t.achievementTo ?? t.to, 0),
    multiplier: safeNum(t.multiplierPct, 0) / 100,
    label: '',
  }));
}
