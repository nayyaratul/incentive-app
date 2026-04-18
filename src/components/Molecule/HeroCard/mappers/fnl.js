/**
 * F&L hero mappers.
 *
 * F&L is weekly with a Month / W1..W4 period selector. Both SA and SM/DM use
 * the same period-scoped shape (`weekPayouts[i]` or `monthAggregate`).
 */

import { safeNum, safePct, safeArray, pickBannerTone, heroWarn } from '../safe';

const FNL_MARKERS = [{ pct: 100, label: 'Unlock' }];

/**
 * Resolve the "active" week or month view from the period selector state.
 * Returns a uniform shape the mapper can consume.
 */
export function resolveActivePeriod(payout, selectedKey) {
  const weekPayouts = safeArray(payout?.weekPayouts);
  const monthAggregate = payout?.monthAggregate ?? null;

  if (selectedKey === 'month' && monthAggregate) {
    return { ...monthAggregate, isMonthView: true };
  }

  if (typeof selectedKey === 'string' && selectedKey.startsWith('w')) {
    const idx = parseInt(selectedKey.slice(1), 10);
    if (Number.isFinite(idx) && weekPayouts[idx]) {
      return { ...weekPayouts[idx], isMonthView: false };
    }
  }

  // Fallback to the current / latest week from the raw payout shape
  if (weekPayouts.length > 0) {
    return { ...weekPayouts[weekPayouts.length - 1], isMonthView: false };
  }

  return { ...payout, isMonthView: false };
}

/**
 * Map F&L SA payout (period-resolved) → hero props.
 * @param {object} payout - raw payout (for fallback fields: streak, nextPayoutDate, staffing)
 * @param {object} active - result of resolveActivePeriod
 * @param {object} [opts]
 * @param {string} [opts.role]
 */
export function toSAHero(payout, active, opts = {}) {
  if (!payout || !active) {
    heroWarn('fnl:sa:null-payout', { hasPayout: !!payout, hasActive: !!active });
    return null;
  }

  const isMonth = Boolean(active.isMonthView);
  const target = safeNum(active.weeklySalesTarget, 0);
  const actual = safeNum(active.actualWeeklyGrossSales, 0);
  const myPayout = safeNum(active.myPayout, 0);
  const myDays = safeNum(active.myAttendanceDays, 0);
  const eligible = Boolean(active.myAttendanceEligible) || myDays >= 5;
  const storeQualifies = Boolean(active.storeQualifies);
  const achievementPct = safePct(target > 0 ? (actual / target) * 100 : 0);

  const primaryAmount = isMonth
    ? myPayout
    : (storeQualifies && eligible ? myPayout : 0);

  return {
    context: {
      vertical: 'FNL',
      role: opts.role || 'SA',
      periodKind: 'week',
      periodStart: active.weekStart,
      periodEnd: active.weekEnd,
      periodLabel: isMonth ? 'Month to date' : `Week of ${active.weekStart}`,
    },
    isMonthView: isMonth,
    weekSummary: isMonth
      ? {
          weeksQualified: safeNum(active.weeksQualified, 0),
          weeksTotal: safeNum(active.weeksTotal, 0),
        }
      : undefined,
    primary: {
      amount: primaryAmount,
      label: isMonth ? 'Your payout this month' : 'Your payout this week',
      prefix: '₹',
    },
    progress: {
      achievementPct,
      achievementLabel: isMonth ? 'Best-week achievement' : 'Weekly achievement',
      target,
      actual,
      markers: FNL_MARKERS,
      max: 150,
      banner: pickBannerTone(achievementPct, 100),
      unlockPct: 100,
      gapToNext: !storeQualifies && target > actual
        ? { atPct: 100, nextMultiplierPct: 100, amount: Math.round(target - actual) }
        : undefined,
    },
    pool: {
      storePool: safeNum(active.totalStoreIncentive, 0),
      staffCount: safeNum(active.staffing?.eligibleSaCount ?? payout.staffing?.eligibleSaCount, 0),
      smsCount: safeNum(active.staffing?.sms ?? payout.staffing?.sms, 0),
      dmsCount: safeNum(active.staffing?.dms ?? payout.staffing?.dms, 0),
      roleSplit: active.split || payout.split
        ? {
            saPct: safeNum((active.split || payout.split).saPoolPct, 0),
            smPct: safeNum((active.split || payout.split).smSharePct, 0),
            dmPct: safeNum((active.split || payout.split).dmSharePctEach, 0),
          }
        : undefined,
    },
    eligibility: {
      daysPresent: myDays,
      daysRequired: 5,
      eligible,
    },
    temporal: {
      payoutDate: payout.nextPayoutDate,
    },
    comparison: !isMonth && safeNum(active.lastWeekSaPayout ?? payout.lastWeekSaPayout, 0) > 0
      ? {
          amount: safeNum(active.lastWeekSaPayout ?? payout.lastWeekSaPayout, 0),
          label: 'last week',
        }
      : isMonth && safeNum(payout.lastWeekSaPayout, 0) > 0
      ? {
          amount: safeNum(payout.lastWeekSaPayout, 0),
          label: 'last month',
        }
      : undefined,
  };
}

/**
 * Map F&L SM/DM summary → hero props.
 * Receives the `summary.kind === 'FNL'` object plus an "active" period object.
 */
export function toSMHero(summary, active, opts = {}) {
  if (!summary || summary.kind !== 'FNL') {
    heroWarn('fnl:sm:bad-summary', { kind: summary?.kind });
    return null;
  }

  const isMonth = Boolean(active?.isMonthView);
  const target = active ? safeNum(active.weeklySalesTarget, 0) : safeNum(summary.totalTarget, 0);
  const actual = active ? safeNum(active.actualWeeklyGrossSales, 0) : safeNum(summary.totalActual, 0);
  const achievementPct = safePct(target > 0 ? (actual / target) * 100 : safeNum(summary.achievementPct, 0));
  const storePool = active ? safeNum(active.totalStoreIncentive, 0) : safeNum(summary.totalPayout, 0);
  const storeQualifies = active ? Boolean(active.storeQualifies) : Boolean(summary.storeQualifies);
  const staffCount = Math.max(1, safeArray(summary.employees).length);

  return {
    context: {
      vertical: 'FNL',
      role: opts.role || 'SM',
      periodKind: 'week',
      periodStart: active?.weekStart || summary.week?.start,
      periodEnd: active?.weekEnd || summary.week?.end,
      periodLabel: isMonth ? 'Month to date' : `Week of ${active?.weekStart || summary.week?.start || ''}`,
    },
    isMonthView: isMonth,
    weekSummary: isMonth && active
      ? {
          weeksQualified: safeNum(active.weeksQualified, 0),
          weeksTotal: safeNum(active.weeksTotal, 0),
        }
      : undefined,
    primary: {
      amount: achievementPct,
      label: isMonth ? 'of total monthly target' : 'of weekly store target',
      prefix: '',
      suffix: '%',
      tone: achievementPct >= 100 ? 'success' : undefined,
    },
    progress: {
      achievementPct,
      achievementLabel: isMonth ? 'Monthly achievement' : 'Weekly achievement',
      target,
      actual,
      markers: FNL_MARKERS,
      max: 150,
      banner: pickBannerTone(achievementPct, 100),
      unlockPct: 100,
      gapToNext: !storeQualifies && target > actual
        ? { atPct: 100, nextMultiplierPct: 100, amount: Math.round(target - actual) }
        : undefined,
    },
    pool: {
      storePool,
      staffCount,
      splitCaption: storePool > 0 ? `₹${storePool.toLocaleString('en-IN')} across ${staffCount} staff` : undefined,
    },
    temporal: {
      daysLeftInPeriod: safeNum(summary.daysLeft, 0),
    },
    _selfPayout: safeNum(opts.selfPayout, 0),
    _footerAmountLabel: isMonth ? 'Total month payout' : 'Total week payout',
    _footerAmount: active ? safeNum(active.myPayout, 0) : storePool,
  };
}
