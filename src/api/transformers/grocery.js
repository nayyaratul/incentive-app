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
// Leaderboard synthesis (mock) — peers and ranks are fabricated from the
// current user's individual payout since the API doesn't yet return peers.
// MOCK-TODO: Remove this synthesiser and consume real peer data from the
//            API when the grocery peers endpoint ships.
// ---------------------------------------------------------------------------

const GROCERY_PEER_NAMES = [
  'Meena Joshi',
  'Sneha Iyer',
  'Rahul Kulkarni',
  'Anjali Nair',
  'Vivek Menon',
];

function buildGroceryMyRank(individualPayout, selfName) {
  const myEarned = Math.max(0, Math.round(Number(individualPayout) || 0));

  // Synthesise 4 peer earnings around the user's payout (two above, two below),
  // then sort desc and assign ranks. If individualPayout is 0, put the user last.
  const peerDeltas = [0.32, 0.12, -0.15, -0.28]; // fractional adjustments
  const fallbackBase = myEarned > 0 ? myEarned : 800;
  const peers = GROCERY_PEER_NAMES.slice(0, 4).map((name, i) => ({
    name,
    earned: Math.max(0, Math.round(fallbackBase * (1 + peerDeltas[i]))),
    isSelf: false,
  }));

  const selfEntry = { name: selfName || 'You', earned: myEarned, isSelf: true };

  const sorted = [...peers, selfEntry]
    .sort((a, b) => b.earned - a.earned)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  const self = sorted.find((e) => e.isSelf);
  const selfIdx = sorted.findIndex((e) => e.isSelf);
  const deltaAbove =
    selfIdx > 0 ? sorted[selfIdx - 1].earned - self.earned : 0;

  return {
    rank: self.rank,
    deltaAbove,
    scope: 'store',
    scopeNote: 'by money earned',
    unitLabel: 'earned',
    top: sorted,
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

  const storeTarget = Number(cs.campaignTarget) || Number(cs.storeTarget) || 0;
  const storeActual = Number(cs.campaignActual) || Number(cs.storeActual) || 0;
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
      const piecesSold = Number(cs.totalPiecesSold) || Number(cs.piecesSold) || Number(cs.totalPieces) || 0;
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
    piecesSoldTotal: Number(cs.totalPiecesSold) || Number(cs.piecesSold) || Number(cs.totalPieces) || 0,
    myPiecesSold: Number(cs.myPiecesSold) || Number(cs.piecesSold) || 0,
    appliedRate: Number(cs.currentRate) || Number(cs.appliedRate) || Number(cs.rate) || 0,
    totalStoreIncentive: Number(cs.totalStorePayout) || 0,
    staffCount,
    individualPayout: Number(cs.yourPayout) || 0,
    lastCampaignPayoutPerEmp: 0, // not available yet
    nextPayoutDate: nextPayoutDate(),
    streak: buildStreakShape(salesRows),
    myRank: buildGroceryMyRank(
      Number(cs.yourPayout) || 0,
      employee.employeeName || employee.employeeId || 'You',
    ),
    projections,
    campaignLeaderboard: [], // not available yet
  };
}
