/**
 * Electronics hero mappers.
 *
 * `toSAHero(payout)` — turns ElectronicsView's payout object into hero props.
 * `toSMHero(summary)` — turns StoreManagerHome's summary object into hero props.
 *
 * Both output shapes conform to `../schema.js` → `HeroProps`.
 */

import { safeNum, safePct, safeArray, pickBannerTone, heroWarn } from '../safe';

const DEFAULT_MARKERS = [
  { pct: 85, label: '50%' },
  { pct: 100, label: '100%' },
  { pct: 120, label: '120%' },
];

function buildMarkersFromTiers(apiTiers) {
  const tiers = safeArray(apiTiers);
  if (tiers.length === 0) return DEFAULT_MARKERS;
  return tiers
    .map((t) => ({
      pct: safeNum(t.from ?? t.achievementFrom, NaN),
      label: `${safeNum(t.multiplierPct, 0)}%`,
    }))
    .filter((m) => Number.isFinite(m.pct))
    .sort((a, b) => a.pct - b.pct);
}

function firstUnlockTier(apiTiers) {
  return safeArray(apiTiers).find((t) => safeNum(t.multiplierPct, 0) > 0) || null;
}

/**
 * Map Electronics SA payout → hero props.
 * @param {object} payout - output of transformElectronicsPayout
 * @param {object} [opts]
 * @param {string} [opts.periodLabel]
 */
export function toSAHero(payout, opts = {}) {
  if (!payout) {
    heroWarn('electronics:sa:null-payout', { payout });
    return null;
  }

  const byDepartment = safeArray(payout.byDepartment);
  const deptSum = byDepartment.reduce((s, d) => s + safeNum(d.finalPayout, 0), 0);
  const earned = safeNum(payout.monthToDateEarned, 0) || deptSum;
  const achievementPct = safePct(payout.achievementPct);
  const currentMultiplierPct = safePct(payout.currentMultiplierPct);
  const potential = safeNum(payout.baseIncentive, 0);

  const markers = buildMarkersFromTiers(payout.apiMultiplierTiers);
  const unlockTier = firstUnlockTier(payout.apiMultiplierTiers);
  const unlockPct = safeNum(unlockTier?.from ?? unlockTier?.achievementFrom, 85);

  // Gap to next tier (client-derived). Suppressed when the backend says the
  // achievement nudge wouldn't help — e.g. NOTICE_PERIOD or DEPT_NO_SLABS.
  // (The mobile used to show "reach 85%" even for AIOT employees who have no
  // slabs in the plan — this is the bug fix.)
  const showNudge = payout.eligibility
    ? Boolean(payout.eligibility.showAchievementNudge)
    : true;
  const apiTiers = safeArray(payout.apiMultiplierTiers);
  const sorted = [...apiTiers].sort(
    (a, b) => safeNum(a.from ?? a.achievementFrom) - safeNum(b.from ?? b.achievementFrom),
  );
  const nextTier = sorted.find((t) => achievementPct < safeNum(t.from ?? t.achievementFrom));
  const nextTierPct = nextTier ? safeNum(nextTier.from ?? nextTier.achievementFrom) : null;
  const gapToNext = showNudge && nextTierPct != null
    ? {
        atPct: nextTierPct,
        nextMultiplierPct: safeNum(nextTier.multiplierPct),
        amount: Math.max(0, nextTierPct - achievementPct),
      }
    : undefined;

  const isZeroState = earned === 0 && (potential > 0 || achievementPct > 0);
  const banner = isZeroState ? 'locked' : pickBannerTone(achievementPct, unlockPct);

  return {
    context: {
      vertical: 'ELECTRONICS',
      role: 'SA',
      periodKind: 'month',
      periodLabel: opts.periodLabel || 'This month',
      contextLine: payout.employeeDepartment ? `Your department: ${payout.employeeDepartment}` : undefined,
    },
    primary: {
      amount: earned,
      label: 'Earned this month',
      prefix: '₹',
      todayAmount: safeNum(payout.todayEarned, 0),
      potential: potential > 0 && currentMultiplierPct < 100 ? potential : undefined,
    },
    progress: {
      achievementPct,
      achievementLabel: 'Department achievement',
      markers,
      max: 120,
      banner,
      currentMultiplierPct,
      gapToNext,
      unlockPct,
    },
    eligibility: payout.ineligibleReason
      ? { ineligibleReason: payout.ineligibleReason }
      : undefined,
    temporal: {
      payoutDate: payout.nextPayoutDate,
      daysLeftInPeriod: safeNum(payout.workingDays?.daysLeft, 0),
      workingDays: payout.workingDays,
      runRate: payout.runRate,
    },
    comparison: safeNum(payout.lastMonthPayout, 0) > 0
      ? {
          amount: safeNum(payout.lastMonthPayout, 0),
          label: 'last month',
        }
      : undefined,
    milestones: safeArray(payout.milestones).map((m) => ({
      id: m.id,
      threshold: safeNum(m.threshold, 0),
      crossed: Boolean(m.crossed),
      label: m.label || `₹${safeNum(m.threshold, 0)}`,
    })),
    // Extras for zero-state unlock preview
    _unlockPreview: isZeroState && unlockTier
      ? {
          atPct: unlockPct,
          multiplierPct: safeNum(unlockTier.multiplierPct, 0),
          estEarning: Math.round(potential * safeNum(unlockTier.multiplierPct, 0) / 100),
        }
      : undefined,
  };
}

/**
 * Map Electronics SM/DM summary → hero props.
 * @param {object} summary - output of StoreManagerHome's `summary` useMemo (kind='ELECTRONICS')
 * @param {object} [opts]
 * @param {string} [opts.role] - 'SM' | 'DM'
 * @param {string} [opts.periodLabel]
 */
export function toSMHero(summary, opts = {}) {
  if (!summary || summary.kind !== 'ELECTRONICS') {
    heroWarn('electronics:sm:bad-summary', { kind: summary?.kind });
    return null;
  }

  const achievementPct = safePct(summary.achievementPct);
  const totalTarget = safeNum(summary.totalTarget, 0);
  const totalActual = safeNum(summary.totalActual, 0);
  const totalPayout = safeNum(summary.totalPayout, 0);
  const unlockPct = safeNum(summary.unlockPct, 85);
  const staffCount = safeArray(summary.employees).length;

  return {
    context: {
      vertical: 'ELECTRONICS',
      role: opts.role || 'SM',
      periodKind: 'month',
      periodLabel: opts.periodLabel || 'Month to date',
    },
    primary: {
      amount: achievementPct,
      label: 'Store achievement',
      prefix: '',
      suffix: '%',
      tone: achievementPct >= 100 ? 'success' : undefined,
    },
    progress: {
      achievementPct,
      achievementLabel: 'Store achievement',
      target: totalTarget,
      actual: totalActual,
      markers: DEFAULT_MARKERS,
      max: 120,
      banner: pickBannerTone(achievementPct, unlockPct),
      unlockPct,
      gapToNext: totalTarget > totalActual
        ? {
            atPct: 100,
            nextMultiplierPct: 100,
            amount: Math.round(totalTarget - totalActual),
          }
        : undefined,
    },
    pool: {
      storePool: totalPayout,
      staffCount,
    },
    temporal: {
      daysLeftInPeriod: safeNum(summary.daysLeft, 0),
      runRate: totalTarget > 0
        ? {
            perDay: safeNum(summary.dailyPace, 0),
            projected: safeNum(summary.projectedTotal, 0),
            projectedPct: safePct(safeNum(summary.projectedTotal, 0) / totalTarget * 100),
          }
        : undefined,
    },
  };
}
