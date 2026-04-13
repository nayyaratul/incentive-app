// ============================================================================
// CALCULATED PAYOUTS — dummy figures derived from the brief's worked examples.
// These are pre-computed for the POC so views don't need live calc engines.
// Real system will compute these nightly from transactions + configs.
// ============================================================================

// Streak metric: Shape 1 — "Professional discipline".
// Consecutive WORKING days where the employee was PRESENT and logged ≥1
// qualifying sale. Off-days (week-off, approved leave, holidays) pause the
// streak rather than break it. Always-positive; no 'broken' state shown.
// Dummy data per-employee below.

// Leaderboard shape: per-store rankings for SA roles. For Grocery/F&L where
// payouts are pooled, this represents rank by volume contribution, not ₹
// earned — useful for recognition even when payouts are equal.

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
    // Streak — Shape 1, working-days present + active
    streak: {
      current: 7,
      longest: 14,
      lastActiveDay: '2026-04-13',
      kind: 'working-days-active',
      label: 'working days',
      caption: 'present + selling',
    },
    // Rank within store (among SA peers)
    myRank: {
      rank: 3,
      deltaAbove: 40,
      scope: 'store',
      top: [
        { rank: 1, name: 'Vikram Patil',  earned: 5480, isSelf: false },
        { rank: 2, name: 'Priya Desai',   earned: 3800, isSelf: false },
        { rank: 3, name: 'Rohit Sharma',  earned: 3760, isSelf: true  },
        { rank: 4, name: 'Kiran Pawar',   earned: 2210, isSelf: false },
        { rank: 5, name: 'Anita Reddy',   earned: 0,    isSelf: false, note: 'On notice' },
      ],
    },
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
    streak: { current: 5, longest: 9, lastActiveDay: '2026-04-13', kind: 'working-days-active', label: 'working days', caption: 'present + selling' },
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
    streak: { current: 12, longest: 18, lastActiveDay: '2026-04-13', kind: 'working-days-active', label: 'working days', caption: 'present + selling' },
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
    streak: { current: 0, longest: 8, lastActiveDay: null, kind: 'working-days-active', label: 'working days', caption: 'present + selling' },
    milestones: [],
    ineligibleReason: 'On notice period — not eligible for this month\'s disbursement.',
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
    streak: { current: 3, longest: 3, lastActiveDay: '2026-04-13', kind: 'working-days-active', label: 'working days', caption: 'present + selling' },
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
    streak: { current: 4, longest: 11, lastActiveDay: '2026-04-13', kind: 'working-days-active', label: 'working days', caption: 'present + selling' },
    milestones: [],
    note: 'SM earns via BA attribution',
  },
];

// ---------- BRAND ASSOCIATE contributions (RD3675) ----------
// BAs don't earn personally — these stats are read-only for visibility.
// All sales are recorded under the SM's employee ID for calculation.
export const baContributionsRD3675 = {
  'EMP-0047': { // Manoj Iyer · Samsung
    brand: 'Samsung',
    unitsSold: 18,
    grossValue: 342500,
    topSkus: [
      { sku: 'Samsung M14',         family: 'Wireless Phone', units: 8 },
      { sku: 'Samsung Soundbar',    family: 'Audio',           units: 4 },
      { sku: 'Samsung QLED 55"',    family: 'High End TV',     units: 2 },
      { sku: 'Samsung Refrigerator',family: 'Food Preservation', units: 2 },
      { sku: 'Samsung Washing M.',  family: 'Laundry & Wash Care', units: 2 },
    ],
  },
  'EMP-0048': { // Deepa Menon · Vivo
    brand: 'Vivo',
    unitsSold: 12,
    grossValue: 210800,
    topSkus: [
      { sku: 'Vivo Y28',  family: 'Wireless Phone', units: 7 },
      { sku: 'Vivo V30',  family: 'Wireless Phone', units: 3 },
      { sku: 'Vivo X100', family: 'Wireless Phone', units: 2 },
    ],
  },
};

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
  streak: { current: 6, longest: 11, lastActiveDay: '2026-04-13', kind: 'working-days-active', label: 'working days', caption: 'present + selling' },
  myRank: {
    rank: 2,
    deltaAbove: 14,
    scope: 'store',
    scopeNote: 'by pieces sold',
    top: [
      { rank: 1, name: 'Ravi Krishnan', earned: 45, isSelf: false },
      { rank: 2, name: 'Meena Nair',    earned: 38, isSelf: true  },
      { rank: 3, name: 'Soumya George', earned: 31, isSelf: false },
      { rank: 4, name: 'Ajit Pillai',   earned: 27, isSelf: false },
      { rank: 5, name: 'Thomas Jacob',  earned: 19, isSelf: false },
    ],
    unitLabel: 'pieces',
  },
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
  streak: { current: 9, longest: 15, lastActiveDay: '2026-04-13', kind: 'working-days-active', label: 'working days', caption: 'present + selling' },
  myRank: {
    rank: 4,
    deltaAbove: 6,
    scope: 'store',
    scopeNote: 'by units this week',
    top: [
      { rank: 1, name: 'Rahul Shetty',   earned: 48, isSelf: false },
      { rank: 2, name: 'Ishaan Joshi',   earned: 42, isSelf: false },
      { rank: 3, name: 'Dhruv Joshi',    earned: 39, isSelf: false },
      { rank: 4, name: 'Sara Khan',      earned: 33, isSelf: true  },
      { rank: 5, name: 'Pooja Kulkarni', earned: 29, isSelf: false },
    ],
    unitLabel: 'units',
  },
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
  // Top 5 earning stores (Overview tab convenience view)
  topStores: [
    { storeCode: 'TRN0241', storeName: 'Trends, Koregaon Park',      vertical: 'FNL',         payoutMTD: 58400, achievementPct: 105 },
    { storeCode: 'RD3682',  storeName: 'Reliance Digital, Bijapur KA',vertical: 'ELECTRONICS', payoutMTD: 46200, achievementPct: 112 },
    { storeCode: 'T28V',    storeName: 'SMT-Kalpetta',               vertical: 'GROCERY',     payoutMTD: 0,     achievementPct: 92  },
    { storeCode: 'RD3675',  storeName: 'Reliance Digital, Andheri',  vertical: 'ELECTRONICS', payoutMTD: 38400, achievementPct: 97  },
    { storeCode: 'TGL5',    storeName: 'SMT-Edappal',                vertical: 'GROCERY',     payoutMTD: 34500, achievementPct: 110 },
  ],
  // Full store directory for the Stores tab (search + drill-down)
  allStores: [
    { storeCode: 'TRN0241', storeName: 'Trends, Koregaon Park',         vertical: 'FNL',         format: 'Trends',          state: 'Maharashtra', city: 'Pune',       payoutMTD: 58400, achievementPct: 105, status: 'ACTIVE', staffCount: 11 },
    { storeCode: 'RD3682',  storeName: 'Reliance Digital, Bijapur KA',  vertical: 'ELECTRONICS', format: 'Reliance Digital',state: 'Karnataka',   city: 'Bijapur',    payoutMTD: 46200, achievementPct: 112, status: 'ACTIVE', staffCount: 9 },
    { storeCode: 'T28V',    storeName: 'SMT-Kalpetta',                  vertical: 'GROCERY',     format: 'Smart',           state: 'Kerala',      city: 'Kalpetta',   payoutMTD: 0,     achievementPct: 92,  status: 'ACTIVE', staffCount: 7 },
    { storeCode: 'RD3675',  storeName: 'Reliance Digital, Andheri W.',  vertical: 'ELECTRONICS', format: 'Reliance Digital',state: 'Maharashtra', city: 'Mumbai',     payoutMTD: 38400, achievementPct: 97,  status: 'ACTIVE', staffCount: 8 },
    { storeCode: 'TGL5',    storeName: 'SMT-Edappal',                   vertical: 'GROCERY',     format: 'Smart',           state: 'Kerala',      city: 'Edappal',    payoutMTD: 34500, achievementPct: 110, status: 'ACTIVE', staffCount: 8 },
    { storeCode: '2536',    storeName: 'SIG-Pottammel',                 vertical: 'GROCERY',     format: 'Signature',       state: 'Kerala',      city: 'Pottammel',  payoutMTD: 12200, achievementPct: 109, status: 'ACTIVE', staffCount: 6 },
    { storeCode: 'TST0518', storeName: 'Trends Small Town, Nashik',     vertical: 'FNL',         format: 'TST',             state: 'Maharashtra', city: 'Nashik',     payoutMTD: 22800, achievementPct: 88,  status: 'ACTIVE', staffCount: 6 },
    { storeCode: 'TEX0109', storeName: 'Trends Extension, Thrissur',    vertical: 'FNL',         format: 'Trends Extension',state: 'Kerala',      city: 'Thrissur',   payoutMTD: 18900, achievementPct: 102, status: 'ACTIVE', staffCount: 5 },
    { storeCode: 'RD4012',  storeName: 'Reliance Digital, Saket',       vertical: 'ELECTRONICS', format: 'Reliance Digital',state: 'Delhi',       city: 'New Delhi',  payoutMTD: 41200, achievementPct: 103, status: 'ACTIVE', staffCount: 10 },
    { storeCode: 'RD4188',  storeName: 'Reliance Digital, Velachery',   vertical: 'ELECTRONICS', format: 'Reliance Digital',state: 'Tamil Nadu',  city: 'Chennai',    payoutMTD: 35600, achievementPct: 99,  status: 'ACTIVE', staffCount: 8 },
    { storeCode: 'TRN0512', storeName: 'Trends, Velachery',             vertical: 'FNL',         format: 'Trends',          state: 'Tamil Nadu',  city: 'Chennai',    payoutMTD: 49800, achievementPct: 108, status: 'ACTIVE', staffCount: 12 },
    { storeCode: 'TRN0833', storeName: 'Trends, Banjara Hills',         vertical: 'FNL',         format: 'Trends',          state: 'Telangana',   city: 'Hyderabad',  payoutMTD: 28400, achievementPct: 96,  status: 'ACTIVE', staffCount: 9 },
    { storeCode: 'SMT-S04', storeName: 'SMT-Satellite',                 vertical: 'GROCERY',     format: 'Smart',           state: 'Gujarat',     city: 'Ahmedabad',  payoutMTD: 17200, achievementPct: 101, status: 'ACTIVE', staffCount: 7 },
    { storeCode: 'SMT-G18', storeName: 'SMT-Gota',                      vertical: 'GROCERY',     format: 'Smart',           state: 'Gujarat',     city: 'Ahmedabad',  payoutMTD: 0,     achievementPct: 78,  status: 'ACTIVE', staffCount: 6 },
    { storeCode: 'RD3915',  storeName: 'Reliance Digital, Kothrud',     vertical: 'ELECTRONICS', format: 'Reliance Digital',state: 'Maharashtra', city: 'Pune',       payoutMTD: 23800, achievementPct: 91,  status: 'ACTIVE', staffCount: 7 },
    { storeCode: 'RD3621',  storeName: 'Reliance Digital, Jaipur',      vertical: 'ELECTRONICS', format: 'Reliance Digital',state: 'Rajasthan',   city: 'Jaipur',     payoutMTD: 0,     achievementPct: 81,  status: 'TEMPORARILY_CLOSED', staffCount: 8 },
    { storeCode: 'TST0277', storeName: 'Trends Small Town, Hubli',      vertical: 'FNL',         format: 'TST',             state: 'Karnataka',   city: 'Hubli',      payoutMTD: 14600, achievementPct: 94,  status: 'ACTIVE', staffCount: 5 },
    { storeCode: 'SMT-K22', storeName: 'SMT-Karelibaug',                vertical: 'GROCERY',     format: 'Smart',           state: 'Gujarat',     city: 'Vadodara',   payoutMTD: 9800,  achievementPct: 105, status: 'ACTIVE', staffCount: 6 },
  ],
  // Anomalies / flags for Ops to investigate
  flags: [
    { id: 'FLG-01', storeCode: 'RD3675', vertical: 'ELECTRONICS', severity: 'warn',   message: 'Telecom department at 75% (below 85% floor) — no payout this month for Telecom sales' },
    { id: 'FLG-02', storeCode: 'T28V',   vertical: 'GROCERY',     severity: 'warn',   message: 'Cake Rush at 92% — still 8pp below gate with 12 days left' },
    { id: 'FLG-03', storeCode: 'TGL5',   vertical: 'GROCERY',     severity: 'info',   message: 'Crossed 110% — tracking to ₹3/pc slab' },
    { id: 'FLG-04', storeCode: 'TRN0241',vertical: 'FNL',         severity: 'info',   message: 'Week 3 qualified; week 2 missed target by 2pp' },
    { id: 'FLG-05', storeCode: 'RD3682', vertical: 'ELECTRONICS', severity: 'alert',  message: 'Operational days = 14 — at risk of failing the 15-day monthly minimum' },
  ],
};
