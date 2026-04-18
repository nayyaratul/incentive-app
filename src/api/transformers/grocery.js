import dayjs from 'dayjs';
import { computeStreak } from '@/services/GamificationEngine/computeStreak';
import { safeNum, safeArray, heroWarn } from '@/components/Molecule/HeroCard/safe';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nextPayoutDate() {
  // TODO(api): backend should return authoritative payout date
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
// Leaderboard synthesis (mock) — peers and ranks are fabricated from the
// current user's individual payout since the API doesn't yet return peers.
// TODO(api): remove this synthesiser when the grocery peers endpoint ships.
// ---------------------------------------------------------------------------

const GROCERY_PEER_NAMES = [
  'Meena Joshi',
  'Sneha Iyer',
  'Rahul Kulkarni',
  'Anjali Nair',
  'Vivek Menon',
];

function buildGroceryMyRank(individualPayout, selfName) {
  const myEarned = Math.max(0, Math.round(safeNum(individualPayout, 0)));
  const peerDeltas = [0.32, 0.12, -0.15, -0.28];
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
  const deltaAbove = selfIdx > 0 ? sorted[selfIdx - 1].earned - self.earned : 0;

  return {
    rank: self.rank,
    deltaAbove,
    scope: 'store',
    scopeNote: 'by money earned',
    unitLabel: 'earned',
    top: sorted,
  };
}

function defaultShape() {
  return {
    campaignId: null,
    storeCode: null,
    targetSalesValue: 0,
    actualSalesValue: 0,
    achievementPct: 0,
    piecesSoldTotal: 0,
    myPiecesSold: 0,
    appliedRate: 0,
    totalStoreIncentive: 0,
    staffCount: 1,
    individualPayout: 0,
    lastCampaignPayoutPerEmp: 0,
    nextPayoutDate: nextPayoutDate(),
    streak: { current: 0, longest: 0, lastActiveDay: null, kind: 'working-days-active', label: 'working days', caption: 'present + selling' },
    myRank: { rank: 0, deltaAbove: 0, scope: 'store', top: [] },
    projections: [],
    campaignLeaderboard: [],
  };
}

// ---------------------------------------------------------------------------
// Main transformer
// ---------------------------------------------------------------------------

export function transformGroceryPayout(detail, campaignConfig, salesRows) {
  if (!detail) {
    heroWarn('grocery:transform:null-detail', { hasDetail: false });
    return defaultShape();
  }

  const cs = detail.currentStanding ?? {};
  const slabs = safeArray(detail.payoutSlabs);
  const employee = detail.employee ?? {};

  const storeTarget = safeNum(cs.campaignTarget, safeNum(cs.storeTarget, 0));
  const storeActual = safeNum(cs.campaignActual, safeNum(cs.storeActual, 0));
  const achievementPct = safeNum(cs.achievementPct, 0);
  const staffCount = Math.max(1, safeNum(cs.employeeCount, 1));

  const piecesSold = safeNum(cs.totalPiecesSold, 0)
    || safeNum(cs.piecesSold, 0)
    || safeNum(cs.totalPieces, 0);

  // -- projections: what-if for slabs at or above 100% achievement --
  const projections = slabs
    .filter((s) => safeNum(s.from, 0) >= 100)
    .map((s) => {
      const scenarioPct = safeNum(s.from, 0);
      const atSalesValue = storeTarget > 0
        ? Math.round((scenarioPct / 100) * storeTarget)
        : 0;
      const rate = safeNum(s.rate, 0);
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
    piecesSoldTotal: piecesSold,
    myPiecesSold: safeNum(cs.myPiecesSold, safeNum(cs.piecesSold, 0)),
    appliedRate: safeNum(cs.currentRate, safeNum(cs.appliedRate, safeNum(cs.rate, 0))),
    totalStoreIncentive: safeNum(cs.totalStorePayout, 0),
    staffCount,
    individualPayout: safeNum(cs.yourPayout, 0),
    lastCampaignPayoutPerEmp: 0, // TODO(api): not available yet
    nextPayoutDate: nextPayoutDate(),
    streak: buildStreakShape(salesRows),
    myRank: buildGroceryMyRank(
      safeNum(cs.yourPayout, 0),
      employee.employeeName || employee.employeeId || 'You',
    ),
    projections,
    campaignLeaderboard: [], // TODO(api): not available yet
  };
}
