// ============================================================================
// CALCULATED PAYOUTS — dummy figures derived from the brief's worked examples.
// These are pre-computed for the POC so views don't need live calc engines.
// Real system will compute these nightly from transactions + configs.
// ============================================================================

// ---------- ELECTRONICS — RD3675 Andheri, April 2026 ----------
// Rohit (EMP-0041) sold across several departments; payout shown per department
// because each department has its own achievement multiplier (brief §6.4 Step 2)
export const electronicsPayoutsRD3675 = [
  {
    employeeId: 'EMP-0041', // Rohit Sharma (SA)
    byDepartment: [
      { department: 'Telecom',          baseIncentive: 2750, achievementPct: 75,  multiplier: 0.00, finalPayout: 0,    note: 'Below 85% — zero' },
      { department: 'Large Appliances', baseIncentive: 1200, achievementPct: 127, multiplier: 1.20, finalPayout: 1440 },
      { department: 'ENT',              baseIncentive: 800,  achievementPct: 109, multiplier: 1.00, finalPayout: 800 },
      { department: 'AIOT',             baseIncentive: 480,  achievementPct: 95,  multiplier: 0.80, finalPayout: 384 },
      { department: 'IT',               baseIncentive: 900,  achievementPct: 92,  multiplier: 0.80, finalPayout: 720 },
      { department: 'Small Appliances', baseIncentive: 520,  achievementPct: 93,  multiplier: 0.80, finalPayout: 416 },
    ],
    // Today / MTD rollups for the hero
    todayEarned: 180,
    monthToDateEarned: 3760,
    monthlyGoalTarget: 7000,
    streak: 7,
    milestones: [
      { id: 'MS-1000', threshold: 1000, label: '₹1,000 this month', crossed: true  },
      { id: 'MS-3000', threshold: 3000, label: '₹3,000 this month', crossed: true  },
      { id: 'MS-5000', threshold: 5000, label: '₹5,000 this month', crossed: false },
    ],
  },
  {
    employeeId: 'EMP-0042', // Priya Desai (SA)
    byDepartment: [
      { department: 'Telecom',          baseIncentive: 1950, achievementPct: 75,  multiplier: 0.00, finalPayout: 0    },
      { department: 'Large Appliances', baseIncentive: 2100, achievementPct: 127, multiplier: 1.20, finalPayout: 2520 },
      { department: 'AIOT',             baseIncentive: 360,  achievementPct: 95,  multiplier: 0.80, finalPayout: 288  },
    ],
    todayEarned: 240,
    monthToDateEarned: 2808,
    monthlyGoalTarget: 7000,
    streak: 5,
    milestones: [
      { id: 'MS-1000', threshold: 1000, label: '₹1,000 this month', crossed: true  },
      { id: 'MS-3000', threshold: 3000, label: '₹3,000 this month', crossed: false },
    ],
  },
  {
    employeeId: 'EMP-0043', // Vikram Patil (SA) — star performer
    byDepartment: [
      { department: 'ENT',              baseIncentive: 2200, achievementPct: 109, multiplier: 1.00, finalPayout: 2200 },
      { department: 'Large Appliances', baseIncentive: 1800, achievementPct: 127, multiplier: 1.20, finalPayout: 2160 },
      { department: 'Telecom',          baseIncentive: 2500, achievementPct: 75,  multiplier: 0.00, finalPayout: 0    },
      { department: 'IT',               baseIncentive: 1400, achievementPct: 92,  multiplier: 0.80, finalPayout: 1120 },
    ],
    todayEarned: 320,
    monthToDateEarned: 5480,
    monthlyGoalTarget: 7000,
    streak: 12,
    milestones: [
      { id: 'MS-1000', threshold: 1000, label: '₹1,000 this month', crossed: true  },
      { id: 'MS-3000', threshold: 3000, label: '₹3,000 this month', crossed: true  },
      { id: 'MS-5000', threshold: 5000, label: '₹5,000 this month', crossed: true  },
    ],
  },
  {
    employeeId: 'EMP-0044', // Anita Reddy (SA, on notice — ineligible)
    byDepartment: [],
    todayEarned: 0,
    monthToDateEarned: 1820, // accrued but will not be paid out due to payroll status
    monthlyGoalTarget: 7000,
    streak: 0,
    milestones: [],
    ineligibleReason: 'On notice period — not eligible for disbursement (brief §6.3 / §10)',
  },
  {
    employeeId: 'EMP-0045', // Kiran Pawar (SA) — new joiner
    byDepartment: [
      { department: 'AIOT',             baseIncentive: 180, achievementPct: 95,  multiplier: 0.80, finalPayout: 144 },
      { department: 'Small Appliances', baseIncentive: 260, achievementPct: 93,  multiplier: 0.80, finalPayout: 208 },
    ],
    todayEarned: 55,
    monthToDateEarned: 352,
    monthlyGoalTarget: 5000,
    streak: 3,
    milestones: [],
  },
  {
    employeeId: 'EMP-0046', // Sunil Kumar (SM) — receives BA-attributed sales credit
    byDepartment: [
      // Credits for sales made by BAs Manoj + Deepa
      { department: 'Telecom',          baseIncentive: 1850, achievementPct: 75,  multiplier: 0.00, finalPayout: 0, note: 'BA-attributed, zeroed by dept multiplier' },
      { department: 'Large Appliances', baseIncentive: 600,  achievementPct: 127, multiplier: 1.20, finalPayout: 720 },
    ],
    todayEarned: 120,
    monthToDateEarned: 720,
    monthlyGoalTarget: 4000,
    streak: 4,
    milestones: [],
    note: 'SM earns via BA attribution per brief §6.3',
  },
];

// ---------- GROCERY — SMT-Kalpetta (T28V), Cake Rush campaign ----------
// Brief §7.3 worked example + §7.4 equal distribution
export const groceryPayoutT28V = {
  campaignId: 'CAMP-GRC-2026-04-CAKE',
  storeCode: 'T28V',
  targetSalesValue: 167000,
  actualSalesValue: 154000,         // 92% — below 100% → incentive is currently ₹0
  achievementPct: 92,
  piecesSoldTotal: 308,
  appliedRate: 0,                   // no payout below 100%
  totalStoreIncentive: 0,
  staffCount: 7,                    // SM + DM + 4 SA + 1 BA
  individualPayout: 0,
  projections: [
    { scenario: 'Hit 100%', atSalesValue: 167000, rate: 2, estTotalIncentive: 620,  estPerEmployee: 89 },
    { scenario: 'Hit 120%', atSalesValue: 200400, rate: 3, estTotalIncentive: 1116, estPerEmployee: 159 },
    { scenario: 'Hit 130%', atSalesValue: 217100, rate: 4, estTotalIncentive: 1612, estPerEmployee: 230 },
  ],
  // Leaderboard across the 3 Kerala stores in the campaign
  campaignLeaderboard: [
    { storeCode: 'TGL5', storeName: 'SMT-Edappal',   actualSalesValue: 248600, achievementPct: 110, perEmpAtCurrent: 176, rank: 1 },
    { storeCode: '2536', storeName: 'SIG-Pottammel', actualSalesValue: 72800,  achievementPct: 109, perEmpAtCurrent: 89,  rank: 2 },
    { storeCode: 'T28V', storeName: 'SMT-Kalpetta',  actualSalesValue: 154000, achievementPct: 92,  perEmpAtCurrent: 0,   rank: 3, isSelf: true },
  ],
};

// ---------- F&L — TRN0241 Koregaon Park Trends, current week ----------
// Brief §8.7 staffing: 1 SM, 1 DM → 60/24/16 split. This week actuals chosen to beat target.
export const fnlPayoutTRN0241 = {
  weekStart: '2026-04-12',
  weekEnd:   '2026-04-18',
  weeklySalesTarget: 1200000,
  actualWeeklyGrossSales: 1260000,
  storeQualifies: true,
  totalStoreIncentive: 12600, // 1% of actual
  staffing: { sms: 1, dms: 1, eligibleSaCount: 7 }, // 7 of the 8 SAs pass 5-day rule (one on approved leave)
  split: { saPoolPct: 0.60, smSharePct: 0.24, dmSharePctEach: 0.16 },
  saPool: 7560,
  smPayout: 3024,
  dmPayoutEach: 2016,
  saPayoutEach: 1080, // 7560 / 7
  // Per-employee breakdown for the SM view
  employees: [
    { employeeId: 'FNL-3101', role: 'SM', daysPresent: 7, eligible: true, payout: 3024 },
    { employeeId: 'FNL-3102', role: 'DM', daysPresent: 6, eligible: true, payout: 2016 },
    { employeeId: 'FNL-3103', role: 'SA', daysPresent: 7, eligible: true, payout: 1080 },
    { employeeId: 'FNL-3104', role: 'SA', daysPresent: 6, eligible: true, payout: 1080 },
    { employeeId: 'FNL-3105', role: 'SA', daysPresent: 5, eligible: true, payout: 1080 },
    { employeeId: 'FNL-3106', role: 'SA', daysPresent: 7, eligible: true, payout: 1080 },
    { employeeId: 'FNL-3107', role: 'SA', daysPresent: 6, eligible: true, payout: 1080 },
    { employeeId: 'FNL-3108', role: 'SA', daysPresent: 5, eligible: true, payout: 1080 },
    { employeeId: 'FNL-3109', role: 'SA', daysPresent: 7, eligible: true, payout: 1080 },
    // The 8th SA (a placeholder we track but not in masters) on 4 days — ineligible
    // (kept as pseudo record to illustrate the 5-day rule)
  ],
  // Previous 4 weeks for trajectory chart
  recentWeeks: [
    { weekStart: '2026-03-15', weekEnd: '2026-03-21', target: 1150000, actual: 1190000, storeQualified: true,  totalIncentive: 11900 },
    { weekStart: '2026-03-22', weekEnd: '2026-03-28', target: 1150000, actual: 1095000, storeQualified: false, totalIncentive: 0 },
    { weekStart: '2026-03-29', weekEnd: '2026-04-04', target: 1200000, actual: 1282000, storeQualified: true,  totalIncentive: 12820 },
    { weekStart: '2026-04-05', weekEnd: '2026-04-11', target: 1200000, actual: 1175000, storeQualified: false, totalIncentive: 0 },
  ],
};

// ---------- CENTRAL REPORTING roll-up (brief §2 "Central Reporting") ----------
export const centralReporting = {
  asOf: '2026-04-13T12:00:00+05:30',
  totals: {
    organisationPayoutMTD: 8420000,
    employeesEligible: 18340,
    storesWithPayout: 412,
    storesBelowGate: 87,
  },
  byVertical: [
    { vertical: 'ELECTRONICS', stores: 164, employees: 7920, payoutMTD: 4185000, achievementAvgPct: 97 },
    { vertical: 'GROCERY',     stores: 188, employees: 6420, payoutMTD: 1870000, achievementAvgPct: 104 },
    { vertical: 'FNL',         stores: 147, employees: 4000, payoutMTD: 2365000, achievementAvgPct: 101 },
  ],
  byState: [
    { state: 'Maharashtra', stores: 68, payoutMTD: 1640000, topStore: 'Reliance Digital, Andheri West' },
    { state: 'Karnataka',   stores: 54, payoutMTD: 1120000, topStore: 'Reliance Digital, Bijapur KA' },
    { state: 'Kerala',      stores: 47, payoutMTD: 880000,  topStore: 'SMT-Edappal' },
    { state: 'Tamil Nadu',  stores: 61, payoutMTD: 1210000, topStore: 'Trends, Velachery' },
    { state: 'Delhi',       stores: 42, payoutMTD: 980000,  topStore: 'Reliance Digital, Saket' },
    { state: 'Gujarat',     stores: 38, payoutMTD: 720000,  topStore: 'SMT-Satellite' },
  ],
  // Top 5 earning stores
  topStores: [
    { storeCode: 'TRN0241', storeName: 'Trends, Koregaon Park',      vertical: 'FNL',         payoutMTD: 58400, achievementPct: 105 },
    { storeCode: 'RD3682',  storeName: 'Reliance Digital, Bijapur KA',vertical: 'ELECTRONICS', payoutMTD: 46200, achievementPct: 112 },
    { storeCode: 'T28V',    storeName: 'SMT-Kalpetta',               vertical: 'GROCERY',     payoutMTD: 0,     achievementPct: 92  },
    { storeCode: 'RD3675',  storeName: 'Reliance Digital, Andheri',  vertical: 'ELECTRONICS', payoutMTD: 38400, achievementPct: 97  },
    { storeCode: 'TGL5',    storeName: 'SMT-Edappal',                vertical: 'GROCERY',     payoutMTD: 34500, achievementPct: 110 },
  ],
  // Anomalies / flags for Ops to investigate
  flags: [
    { id: 'FLG-01', storeCode: 'RD3675', vertical: 'ELECTRONICS', severity: 'warn',   message: 'Telecom department at 75% (below 85% floor) — no payout this month for Telecom sales' },
    { id: 'FLG-02', storeCode: 'T28V',   vertical: 'GROCERY',     severity: 'warn',   message: 'Cake Rush at 92% — still 8pp below gate with 12 days left' },
    { id: 'FLG-03', storeCode: 'TGL5',   vertical: 'GROCERY',     severity: 'info',   message: 'Crossed 110% — tracking to ₹3/pc slab' },
    { id: 'FLG-04', storeCode: 'TRN0241',vertical: 'FNL',         severity: 'info',   message: 'Week 3 qualified; week 2 missed target by 2pp' },
    { id: 'FLG-05', storeCode: 'RD3682', vertical: 'ELECTRONICS', severity: 'alert',  message: 'Operational days = 14 — at risk of failing 15-day minimum (brief §6.3)' },
  ],
};
