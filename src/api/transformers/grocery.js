import dayjs from 'dayjs';
import { computeStreak } from '@/services/GamificationEngine/computeStreak';
import { safeNum, safeArray, heroWarn } from '@/components/Molecule/HeroCard/safe';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function defaultShape() {
  return {
    campaignId: null,
    campaign: null,
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
    nextPayoutDate: fallbackPayoutDate(),
    workingDays: { current: 0, total: 0, daysLeft: 0 },
    streak: {
      current: 0,
      longest: 0,
      lastActiveDay: null,
      kind: 'working-days-active',
      label: 'working days',
      caption: 'present + selling',
    },
    projections: [],
    // Phase 6.1 — Grocery HR Sales pilot defaults. The hero card and
    // manager view drive off these when present; null = "no monthly data
    // yet" and the UI hides the HR Sales section entirely.
    mode: null,
    formatTier: null,
    roleBucket: null,
    slabAmount: 0,
    salesAchievementPct: null,
    salesBucket: null,
    salesStatus: null,
    mysteryShopperRating: null,
    popComplianceRating: null,
    attendance: null,
    awlDays: null,
    actualWorkingDays: null,
    salesBudgetRsLacs: null,
    salesActualRsLacs: null,
    // Phase 6.1 — Category PIP defaults.
    pipPlan: null,
    pipPerArticle: [],
    pipStorePool: 0,
    pipEarnerCount: 0,
    pipFundingSource: null,
  };
}

// ---------------------------------------------------------------------------
// Main transformer
// ---------------------------------------------------------------------------

export function transformGroceryPayout(detail, _fallbackCampaign, salesRows) {
  if (!detail) {
    heroWarn('grocery:transform:null-detail', { hasDetail: false });
    return defaultShape();
  }

  const cs = detail.currentStanding ?? {};
  const slabs = safeArray(detail.payoutSlabs);
  const employee = detail.employee ?? {};
  const apiCampaign = detail.campaign ?? null;

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

  const wd = detail.workingDays ?? {};

  return {
    campaignId: apiCampaign?.campaignId ?? cs.campaignName ?? null,
    campaign: apiCampaign
      ? {
          campaignId: apiCampaign.campaignId,
          campaignName: apiCampaign.campaignName,
          campaignStart: apiCampaign.startDate,
          campaignEnd: apiCampaign.endDate,
          channel: apiCampaign.channel,
        }
      : null,
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
    lastCampaignPayoutPerEmp: safeNum(cs.lastCampaignPayoutPerEmp, 0),
    nextPayoutDate: detail.payoutDate || fallbackPayoutDate(),
    workingDays: {
      current: safeNum(wd.current, 0),
      total: safeNum(wd.total, 0),
      daysLeft: safeNum(wd.daysLeft, 0),
    },
    streak: buildStreakShape(salesRows),
    projections,
    // Phase 6.1 — Grocery HR Sales pilot. Forwarded from
    // `calculationDetails` on the latest matching ledger row (the backend
    // surfaces these via `currentStanding.hrSales` when `plan.config.mode
    // === 'HR_SALES'`). Null when the employee has no HR Sales row this
    // period (e.g., they're on a Category PIP campaign instead, or the
    // monthly metric hasn't been ingested yet).
    mode: cs.hrSales?.mode ?? cs.mode ?? null,
    formatTier: cs.hrSales?.formatTier ?? null,
    roleBucket: cs.hrSales?.roleBucket ?? null,
    slabAmount: safeNum(cs.hrSales?.slabAmount, 0),
    salesAchievementPct: cs.hrSales?.salesAchievementPct ?? null,
    salesBucket: cs.hrSales?.salesBucket ?? null,
    salesStatus: cs.hrSales?.salesStatus ?? null,
    mysteryShopperRating: cs.hrSales?.mysteryShopperRating ?? null,
    popComplianceRating: cs.hrSales?.popComplianceRating ?? null,
    attendance: cs.hrSales?.attendance ?? null,
    awlDays: cs.hrSales?.awlDays ?? null,
    actualWorkingDays: cs.hrSales?.workingDays ?? null,
    salesBudgetRsLacs: cs.hrSales?.salesBudgetRsLacs ?? null,
    salesActualRsLacs: cs.hrSales?.salesActualRsLacs ?? null,
    // Phase 6.1 — Category PIP forwarding. Per-article breakdown lets the
    // mobile drilldown render a "you sold X / target Y, qualifying yes/no"
    // table per SKU, so an employee on a vendor-funded Ice Cream campaign
    // sees the granular picture instead of a single store-pool number.
    pipPlan: cs.pip
      ? {
          campaignName: cs.pip.campaignName ?? null,
          fundingSource: cs.pip.fundingSource ?? null,
          attribution: cs.pip.attribution ?? null,
          startDate: cs.pip.startDate ?? null,
          endDate: cs.pip.endDate ?? null,
        }
      : null,
    pipPerArticle: safeArray(cs.pip?.perArticle),
    pipStorePool: safeNum(cs.pip?.storePool, 0),
    pipEarnerCount: safeNum(cs.pip?.earnerCount, 0),
    pipFundingSource: cs.pip?.fundingSource ?? null,
  };
}
