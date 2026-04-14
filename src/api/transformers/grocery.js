import dayjs from 'dayjs';
import { computeStreak } from '@/services/GamificationEngine/computeStreak';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nextPayoutDate() {
  return dayjs().add(1, 'month').startOf('month').date(7).format('YYYY-MM-DD');
}

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

// ---------------------------------------------------------------------------
// Main transformer
// ---------------------------------------------------------------------------

/**
 * Maps the API employeeDetail (GROCERY) response to the payout shape
 * that GroceryView expects.
 */
export function transformGroceryPayout(detail, campaignConfig, salesRows) {
  const cs = detail?.currentStanding ?? {};
  const slabs = detail?.payoutSlabs ?? [];
  const employee = detail?.employee ?? {};

  const storeTarget = Number(cs.storeTarget) || 0;
  const storeActual = Number(cs.storeActual) || 0;
  const achievementPct = Number(cs.achievementPct) || 0;
  const staffCount = Number(cs.employeeCount) || 1;

  // -- projections: what-if for slabs at or above 100% achievement --
  const projections = slabs
    .filter((s) => Number(s.from) >= 100)
    .map((s) => {
      const scenarioPct = Number(s.from);
      const atSalesValue = storeTarget > 0
        ? Math.round((scenarioPct / 100) * storeTarget)
        : 0;
      const rate = Number(s.rate) || 0;
      const piecesSold = Number(cs.totalPiecesSold) || 0;
      // estimate at that slab
      const estTotalIncentive = rate * piecesSold;
      const estPerEmployee = staffCount > 0
        ? Math.round(estTotalIncentive / staffCount)
        : 0;

      return {
        scenario: `${scenarioPct}%`,
        atSalesValue,
        rate,
        estTotalIncentive,
        estPerEmployee,
      };
    });

  return {
    campaignId: cs.campaignName ?? campaignConfig?.campaignId ?? null,
    storeCode: employee.storeCode ?? null,
    targetSalesValue: storeTarget,
    actualSalesValue: storeActual,
    achievementPct,
    piecesSoldTotal: Number(cs.totalPiecesSold) || 0,
    appliedRate: Number(cs.currentRate) || 0,
    totalStoreIncentive: Number(cs.totalStorePayout) || 0,
    staffCount,
    individualPayout: Number(cs.yourPayout) || 0,
    lastCampaignPayoutPerEmp: 0, // not available yet
    nextPayoutDate: nextPayoutDate(),
    streak: buildStreakShape(salesRows),
    myRank: null, // not available yet
    projections,
    campaignLeaderboard: [], // not available yet
  };
}
