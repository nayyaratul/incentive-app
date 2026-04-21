/**
 * Grocery hero mappers.
 */

import { safeNum, safePct, safeArray, pickBannerTone, heroWarn } from '../safe';

const GROCERY_MARKERS = [
  { pct: 100, label: '₹2/pc' },
  { pct: 120, label: '₹3/pc' },
  { pct: 130, label: '₹4/pc' },
];

/**
 * Map Grocery SA payout → hero props.
 * @param {object} payout - output of transformGroceryPayout
 * @param {object} [fallbackCampaign] - optional client-side fallback (used when
 *   the API response is missing campaign info, e.g. during mock runs)
 */
export function toSAHero(payout, fallbackCampaign = {}) {
  if (!payout) {
    heroWarn('grocery:sa:null-payout', { payout });
    return null;
  }

  const achievementPct = safePct(payout.achievementPct);
  const target = safeNum(payout.targetSalesValue, 0);
  const actual = safeNum(payout.actualSalesValue, 0);
  const piecesSoldTotal = safeNum(payout.piecesSoldTotal, 0);
  const appliedRate = safeNum(payout.appliedRate, 0);
  const totalStoreIncentive = safeNum(payout.totalStoreIncentive, 0);
  const staffCount = Math.max(1, safeNum(payout.staffCount, 1));
  const individualPayout = safeNum(payout.individualPayout, 0);

  // Prefer API-sourced campaign; fall back to whatever the caller supplied
  const campaign = payout.campaign ?? fallbackCampaign ?? {};
  const campaignStart = campaign.campaignStart || campaign.startDate;
  const campaignEnd = campaign.campaignEnd || campaign.endDate;

  return {
    context: {
      vertical: 'GROCERY',
      role: 'SA',
      periodKind: 'campaign',
      periodStart: campaignStart,
      periodEnd: campaignEnd,
    },
    campaign: {
      title: campaign.campaignName || 'Live campaign',
      start: campaignStart,
      end: campaignEnd,
      geography: campaign.geography,
      channel: campaign.channel,
    },
    primary: {
      amount: achievementPct,
      label: `of ${target > 0 ? '₹' + target.toLocaleString('en-IN') : 'campaign target'}`,
      prefix: '',
      suffix: '%',
      tone: achievementPct >= 100 ? 'success' : undefined,
    },
    progress: {
      achievementPct,
      achievementLabel: 'Campaign achievement',
      target,
      actual,
      markers: GROCERY_MARKERS,
      max: 130,
      banner: pickBannerTone(achievementPct, 100),
      unlockPct: 100,
    },
    rate: {
      unitsSold: piecesSoldTotal,
      myUnitsSold: safeNum(payout.myPiecesSold, 0),
      unitLabel: 'pcs',
      appliedRate,
      rateUnit: '/pc',
    },
    pool: {
      storePool: totalStoreIncentive,
      staffCount,
      splitCaption: totalStoreIncentive > 0
        ? `₹${totalStoreIncentive.toLocaleString('en-IN')} ÷ ${staffCount} staff`
        : undefined,
    },
    temporal: {
      payoutDate: payout.nextPayoutDate,
      daysLeftInPeriod: safeNum(payout.workingDays?.daysLeft, 0),
      workingDays: payout.workingDays,
    },
    comparison: safeNum(payout.lastCampaignPayoutPerEmp, 0) > 0
      ? {
          amount: safeNum(payout.lastCampaignPayoutPerEmp, 0),
          label: 'last campaign',
        }
      : undefined,
    // Carry through the individual payout — views render it in the footer
    _individualPayout: individualPayout,
  };
}

/**
 * Map Grocery SM/DM summary → hero props.
 */
export function toSMHero(summary, opts = {}) {
  if (!summary || summary.kind !== 'GROCERY') {
    heroWarn('grocery:sm:bad-summary', { kind: summary?.kind });
    return null;
  }

  const achievementPct = safePct(summary.achievementPct);
  const target = safeNum(summary.totalTarget, 0);
  const actual = safeNum(summary.totalActual, 0);
  const totalPayout = safeNum(summary.totalPayout, 0);
  const staffCount = Math.max(1, safeArray(summary.employees).length);
  const piecesSoldTotal = safeNum(summary.piecesSoldTotal, 0);
  const appliedRate = safeNum(summary.appliedRate, 0);
  const selfPayout = safeNum(opts.selfPayout, 0);

  return {
    context: {
      vertical: 'GROCERY',
      role: opts.role || 'SM',
      periodKind: 'campaign',
      periodStart: summary.campaign?.campaignStart,
      periodEnd: summary.campaign?.campaignEnd,
    },
    campaign: summary.campaign
      ? {
          title: summary.campaign.campaignName || 'Live campaign',
          start: summary.campaign.campaignStart,
          end: summary.campaign.campaignEnd,
          geography: summary.campaign.geography,
          channel: summary.campaign.channel,
        }
      : undefined,
    primary: {
      amount: achievementPct,
      label: `of ₹${target.toLocaleString('en-IN')} campaign target`,
      prefix: '',
      suffix: '%',
      tone: achievementPct >= 100 ? 'success' : undefined,
    },
    progress: {
      achievementPct,
      achievementLabel: 'Campaign achievement',
      target,
      actual,
      markers: GROCERY_MARKERS,
      max: 130,
      banner: pickBannerTone(achievementPct, 100),
      unlockPct: 100,
      gapToNext: target > actual
        ? { atPct: 100, nextMultiplierPct: 100, amount: Math.round(target - actual) }
        : undefined,
    },
    rate: {
      unitsSold: piecesSoldTotal,
      unitLabel: 'pcs',
      appliedRate,
      rateUnit: '/pc',
    },
    pool: {
      storePool: totalPayout,
      staffCount,
      splitCaption: totalPayout > 0
        ? `₹${totalPayout.toLocaleString('en-IN')} ÷ ${staffCount} staff`
        : undefined,
    },
    temporal: {
      daysLeftInPeriod: safeNum(summary.daysLeft, 0),
    },
    _selfPayout: selfPayout,
  };
}
