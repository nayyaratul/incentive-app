// ============================================================================
// INCENTIVE RULE CONFIGS — mirrors section 6.4 (Electronics), 7.2 (Grocery),
// 8.6 (F&L), and section 4 (maker-checker workflow).
// All configs have `workflowState` + `effectiveFrom/To` to reflect the brief.
// ============================================================================

export const WORKFLOW = Object.freeze({
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ACTIVE: 'ACTIVE',
});

// ---------- ELECTRONICS — Product-based sales incentive ----------
// Brief §6.4 Step 1: per-product base incentive by family × brand × price band
export const electronicsBaseSlabs = [
  // Photography — all brands
  { productFamily: 'Photography',                applicableBrands: ['*'],                              minPrice: 500,    maxPrice: 42000,    incentivePerUnit: 40 },
  { productFamily: 'Photography',                applicableBrands: ['*'],                              minPrice: 42001,  maxPrice: 52000,    incentivePerUnit: 75 },
  { productFamily: 'Photography',                applicableBrands: ['*'],                              minPrice: 52001,  maxPrice: Infinity, incentivePerUnit: 120 },

  // SDA & Consumer Appliances — all brands
  { productFamily: 'SDA & Consumer Appliances', applicableBrands: ['*'],                               minPrice: 500,    maxPrice: 3200,     incentivePerUnit: 40 },
  { productFamily: 'SDA & Consumer Appliances', applicableBrands: ['*'],                               minPrice: 3201,   maxPrice: 4200,     incentivePerUnit: 50 },
  { productFamily: 'SDA & Consumer Appliances', applicableBrands: ['*'],                               minPrice: 4201,   maxPrice: Infinity, incentivePerUnit: 100 },

  // Tablets — all brands
  { productFamily: 'Tablets',                    applicableBrands: ['*'],                              minPrice: 500,    maxPrice: 22000,    incentivePerUnit: 20 },
  { productFamily: 'Tablets',                    applicableBrands: ['*'],                              minPrice: 22001,  maxPrice: 30000,    incentivePerUnit: 35 },
  { productFamily: 'Tablets',                    applicableBrands: ['*'],                              minPrice: 30001,  maxPrice: Infinity, incentivePerUnit: 60 },

  // Wireless Phones — Samsung/Oppo/Vivo
  { productFamily: 'Wireless Phone',             applicableBrands: ['Samsung', 'Oppo', 'Vivo'],        minPrice: 500,    maxPrice: 18000,    incentivePerUnit: 25 },
  { productFamily: 'Wireless Phone',             applicableBrands: ['Samsung', 'Oppo', 'Vivo'],        minPrice: 18001,  maxPrice: 20000,    incentivePerUnit: 50 },
  { productFamily: 'Wireless Phone',             applicableBrands: ['Samsung', 'Oppo', 'Vivo'],        minPrice: 20001,  maxPrice: Infinity, incentivePerUnit: 75 },

  // Wireless Phones — Xiaomi, Realme, and others (excl. Samsung/Oppo/Vivo/Apple/OnePlus)
  { productFamily: 'Wireless Phone',             applicableBrands: ['Xiaomi', 'Realme', 'OTHERS'],     minPrice: 500,    maxPrice: 40000,    incentivePerUnit: 10 },
  { productFamily: 'Wireless Phone',             applicableBrands: ['Xiaomi', 'Realme', 'OTHERS'],     minPrice: 40001,  maxPrice: 47000,    incentivePerUnit: 15 },
  { productFamily: 'Wireless Phone',             applicableBrands: ['Xiaomi', 'Realme', 'OTHERS'],     minPrice: 47001,  maxPrice: Infinity, incentivePerUnit: 20 },

  // Laptops & Desktops — all excl. Apple & Microsoft Surface
  { productFamily: 'Laptop',                     applicableBrands: ['*-APPLE-SURFACE'],                minPrice: 500,    maxPrice: 47000,    incentivePerUnit: 50 },
  { productFamily: 'Laptop',                     applicableBrands: ['*-APPLE-SURFACE'],                minPrice: 47001,  maxPrice: 52000,    incentivePerUnit: 70 },
  { productFamily: 'Laptop',                     applicableBrands: ['*-APPLE-SURFACE'],                minPrice: 52001,  maxPrice: Infinity, incentivePerUnit: 90 },

  // Home Entertainment TVs — all excl. OnePlus/MI/Realme
  { productFamily: 'High End TV',                applicableBrands: ['*-ONEPLUS-MI-REALME'],            minPrice: 500,    maxPrice: 40000,    incentivePerUnit: 50 },
  { productFamily: 'High End TV',                applicableBrands: ['*-ONEPLUS-MI-REALME'],            minPrice: 40001,  maxPrice: 60000,    incentivePerUnit: 100 },
  { productFamily: 'High End TV',                applicableBrands: ['*-ONEPLUS-MI-REALME'],            minPrice: 60001,  maxPrice: Infinity, incentivePerUnit: 225 },

  // Home Entertainment TVs — OnePlus/MI/Realme only
  { productFamily: 'High End TV',                applicableBrands: ['OnePlus', 'MI', 'Realme'],        minPrice: 500,    maxPrice: 25000,    incentivePerUnit: 25 },
  { productFamily: 'High End TV',                applicableBrands: ['OnePlus', 'MI', 'Realme'],        minPrice: 25001,  maxPrice: 30000,    incentivePerUnit: 50 },
  { productFamily: 'High End TV',                applicableBrands: ['OnePlus', 'MI', 'Realme'],        minPrice: 30001,  maxPrice: Infinity, incentivePerUnit: 75 },

  // Large Appliances — all excl. IFB washing machines
  { productFamily: 'Large Appliances',           applicableBrands: ['*-IFB-WASHING'],                  minPrice: 500,    maxPrice: 25000,    incentivePerUnit: 50 },
  { productFamily: 'Large Appliances',           applicableBrands: ['*-IFB-WASHING'],                  minPrice: 25001,  maxPrice: 40000,    incentivePerUnit: 100 },
  { productFamily: 'Large Appliances',           applicableBrands: ['*-IFB-WASHING'],                  minPrice: 40001,  maxPrice: Infinity, incentivePerUnit: 150 },

  // Large Washing Machines — IFB only
  { productFamily: 'Laundry & Wash Care',        applicableBrands: ['IFB'],                            minPrice: 500,    maxPrice: 20000,    incentivePerUnit: 25 },
  { productFamily: 'Laundry & Wash Care',        applicableBrands: ['IFB'],                            minPrice: 20001,  maxPrice: 35000,    incentivePerUnit: 50 },
  { productFamily: 'Laundry & Wash Care',        applicableBrands: ['IFB'],                            minPrice: 35001,  maxPrice: Infinity, incentivePerUnit: 75 },
];

// Brief §6.4 Step 2: Department achievement multiplier tiers
export const electronicsMultiplierTiers = [
  { gateFromPct: 0,    gateToPct: 85,    multiplier: 0.00, label: 'Below 85% — No payout' },
  { gateFromPct: 85,   gateToPct: 90,    multiplier: 0.50, label: '85% – <90%' },
  { gateFromPct: 90,   gateToPct: 100,   multiplier: 0.80, label: '90% – <100%' },
  { gateFromPct: 100,  gateToPct: 110,   multiplier: 1.00, label: '100% – <110%' },
  { gateFromPct: 110,  gateToPct: 120,   multiplier: 1.10, label: '110% – <120%' },
  { gateFromPct: 120,  gateToPct: Infinity, multiplier: 1.20, label: '120% and above' },
];

// Floor intelligence — "push these now" SKU prompts surfaced to Electronics
// SAs on the home view. In production these would be ranked by today's stock
// position + per-unit incentive + brand-month priority; here we ship a
// representative set across product families and earn brackets.
export const electronicsOpportunities = [
  { sku: 'Vivo Y28 · ₹15k–20k',         band: 'Telecom · Samsung/Oppo/Vivo tier', earn: 50  },
  { sku: 'Samsung QLED 55"',            band: 'ENT · TV 40k–60k tier',            earn: 100 },
  { sku: 'Sony Bravia 65" OLED',        band: 'ENT · TV 60k+ tier',               earn: 225 },
  { sku: 'Lenovo IdeaPad 5 · ₹52k+',    band: 'IT · Laptop 52k+ tier',            earn: 90  },
  { sku: 'LG 8 kg Front Load Washer',   band: 'Large Appliances · 25k–40k tier',  earn: 100 },
  { sku: 'boAt Airdopes 141',           band: 'AIOT · Personal AV',               earn: 40  },
];

export const electronicsExclusions = {
  brands: ['Apple', 'OnePlus', 'Microsoft'],
  brandFamilyRestrictions: [{ brand: 'Microsoft', family: 'Laptop' }], // Microsoft Surface laptops
  transactionTypes: ['SFS', 'PAS', 'JIOMART'],
};

export const electronicsRuleMeta = {
  ruleId: 'RULE-EL-001',
  name: 'Electronics Product-Based Sales Incentive',
  workflowState: WORKFLOW.ACTIVE,
  version: 12,
  effectiveFrom: '2025-01-01',
  effectiveTo: null,
  maker: 'OPS-0001',
  checker: 'OPS-0002',
  lastApprovedAt: '2025-12-28T11:20:00+05:30',
  pendingDraft: {
    version: 13,
    workflowState: WORKFLOW.SUBMITTED,
    maker: 'OPS-0001',
    submittedAt: '2026-04-08T09:10:00+05:30',
    changeSummary: 'Add Realme handsets to the high-payout tier; new 130% multiplier at 1.30×',
    effectiveFrom: '2026-05-01',
  },
};

// ---------- ELECTRONICS — Store-Department-Family targets ----------
// Brief §6.4 department target = sum of family targets
// Store RD3675 (Andheri) — sample month April 2026
export const electronicsTargetsRD3675 = [
  { department: 'IT',                    familyCode: 'FF01', family: 'Laptop',                  monthlyTarget: 888104 },
  { department: 'IT',                    familyCode: 'FF02', family: 'Desktop',                 monthlyTarget: 0 },
  { department: 'IT',                    familyCode: 'FF03', family: 'Tablet',                  monthlyTarget: 118305 },
  { department: 'IT',                    familyCode: 'FF04', family: 'IT Peripheral',            monthlyTarget: 18052 },
  { department: 'IT',                    familyCode: 'FF05', family: 'Lifestyle IT',             monthlyTarget: 647 },
  { department: 'IT',                    familyCode: 'FF06', family: 'Networking',               monthlyTarget: 245 },
  { department: 'IT',                    familyCode: 'FF07', family: 'Storage',                  monthlyTarget: 15894 },
  { department: 'IT',                    familyCode: 'FF08', family: 'Printers and Consumables', monthlyTarget: 6328 },
  { department: 'IT',                    familyCode: 'FF09', family: 'Software',                 monthlyTarget: 931 },
  { department: 'IT',                    familyCode: 'FF10', family: 'Gift Cards',               monthlyTarget: 0 },
  { department: 'ENT',                   familyCode: 'FH01', family: 'High End TV',              monthlyTarget: 1303560 },
  { department: 'ENT',                   familyCode: 'FH02', family: 'HETV Peripherals',         monthlyTarget: 434 },
  { department: 'ENT',                   familyCode: 'FH03', family: 'Gaming Device',            monthlyTarget: 906 },
  { department: 'ENT',                   familyCode: 'FH05', family: 'Audio',                    monthlyTarget: 228211 },
  { department: 'ENT',                   familyCode: 'FH09', family: 'Smart Home Devices',       monthlyTarget: 543 },
  { department: 'Small Appliances',      familyCode: 'FI01', family: 'Garment Care',             monthlyTarget: 13966 },
  { department: 'Small Appliances',      familyCode: 'FI02', family: 'Home Care',                monthlyTarget: 380967 },
  { department: 'Small Appliances',      familyCode: 'FI04', family: 'Integrated Kitchen',       monthlyTarget: 5254 },
  { department: 'Small Appliances',      familyCode: 'FI05', family: 'Kitchen Care',             monthlyTarget: 44455 },
  { department: 'Small Appliances',      familyCode: 'FI06', family: 'MWO',                      monthlyTarget: 5548 },
  { department: 'Small Appliances',      familyCode: 'FI07', family: 'Personal Care',            monthlyTarget: 17481 },
  { department: 'Large Appliances',      familyCode: 'FJ01', family: 'Air Care',                 monthlyTarget: 1431617 },
  { department: 'Large Appliances',      familyCode: 'FJ02', family: 'Food Preservation',        monthlyTarget: 923140 },
  { department: 'Large Appliances',      familyCode: 'FJ03', family: 'Laundry & Wash Care',      monthlyTarget: 664132 },
  { department: 'Telecom',               familyCode: 'FK01', family: 'Wireless Phone',           monthlyTarget: 3532421 },
  { department: 'AIOT',                  familyCode: 'FG01', family: 'Personal AV',              monthlyTarget: 66728 },
  { department: 'AIOT',                  familyCode: 'FG02', family: 'AI & Wearables',           monthlyTarget: 15846 },
  { department: 'AIOT',                  familyCode: 'FG03', family: 'Charging Solutions',       monthlyTarget: 84751 },
  { department: 'AIOT',                  familyCode: 'FG04', family: 'Tech Solutions',           monthlyTarget: 16591 },
];

// Dummy "actual" department sales for April 2026 — chosen to exercise each multiplier band
export const electronicsActualsRD3675 = [
  { department: 'IT',                 actualSales: 928000,  achievementPct: 92 },    // 80% multiplier band
  { department: 'ENT',                actualSales: 1690000, achievementPct: 109 },   // 100% band
  { department: 'Small Appliances',   actualSales: 430000,  achievementPct: 93 },    // 80% band
  { department: 'Large Appliances',   actualSales: 3850000, achievementPct: 127 },   // 120% band
  { department: 'Telecom',            actualSales: 2650000, achievementPct: 75 },    // Below 85% — NO PAYOUT
  { department: 'AIOT',               actualSales: 175000,  achievementPct: 95 },    // 80% band
];

// ---------- GROCERY — Campaign (Cake Rush, brief §7.2) ----------
export const groceryCampaign = {
  campaignId: 'CAMP-GRC-2026-04-CAKE',
  campaignName: 'Cake Rush — Onam Curtain-raiser',
  incentiveType: 'Multi-Article',
  campaignStart: '2026-04-15',
  campaignEnd:   '2026-04-25',
  channel: 'OFFLINE',
  fundingSource: 'Vendor via RR (Retail Reimbursement)',
  geography: 'Kerala',
  eligibleArticles: [
    '494271428', '493626014', '493626016',
    '492577824', '492577823', '490432185', '492577825',
    '494300095', '494359510', '494359508',
  ],
  stores: [
    { storeCode: '2536', targetSalesValue: 67000 },
    { storeCode: 'TGL5', targetSalesValue: 226000 },
    { storeCode: 'T28V', targetSalesValue: 167000 },
  ],
  payoutSlabs: [
    { achievementFromPct: 100, achievementToPct: 120,     ratePerPiece: 2 },
    { achievementFromPct: 120, achievementToPct: 130,     ratePerPiece: 3 },
    { achievementFromPct: 130, achievementToPct: Infinity, ratePerPiece: 4 },
    // No incentive below 100%
  ],
  distributionRule: 'EQUAL_ACROSS_ALL_STAFF', // SM + DM + SA + BA
  workflowState: WORKFLOW.ACTIVE,
  ruleMeta: {
    ruleId: 'RULE-GRC-2026-04-01',
    version: 3,
    maker: 'OPS-0001',
    checker: 'OPS-0002',
    lastApprovedAt: '2026-04-10T16:45:00+05:30',
  },
};

// ---------- F&L — Trends Weekly Sales Incentive (brief §8.6) ----------
export const fnlWeeklyRules = {
  weekDefinition: 'SUNDAY_TO_SATURDAY',
  storePoolPct: 0.01, // 1% of actual weekly gross
  minWorkingDays: 5,
  eligibleRoles: ['SA', 'DM', 'SM'],
  splitMatrix: [
    { sms: 1, dms: 0, saPoolPct: 0.70, smSharePct: 0.30, dmSharePctEach: 0,    remark: 'Single Manager on Duty' },
    { sms: 1, dms: 1, saPoolPct: 0.60, smSharePct: 0.24, dmSharePctEach: 0.16, remark: '' },
    { sms: 1, dms: 2, saPoolPct: 0.60, smSharePct: 0.16, dmSharePctEach: 0.12, remark: '' },
    { sms: 1, dms: 3, saPoolPct: 0.60, smSharePct: 0.12, dmSharePctEach: 0.092, remark: '' },
    { sms: 1, dms: 4, saPoolPct: 0.60, smSharePct: 0.10, dmSharePctEach: 0.076, remark: '' },
  ],
  ineligiblePayrollStatuses: ['NOTICE_PERIOD', 'DISCIPLINARY_ACTION', 'LONG_LEAVE_UNAUTHORISED', 'INACTIVE'],
  workflowState: WORKFLOW.ACTIVE,
  ruleMeta: {
    ruleId: 'RULE-FNL-W-001',
    version: 8,
    maker: 'OPS-0001',
    checker: 'OPS-0002',
    lastApprovedAt: '2025-11-14T14:00:00+05:30',
    effectiveFrom: '2025-12-01',
  },
};

// Sample weekly target upload for TRN0241
export const fnlWeeklyTargets = [
  { storeCode: 'TRN0241', weekStart: '2026-04-05', weekEnd: '2026-04-11', weeklySalesTarget: 1200000, workflowState: WORKFLOW.ACTIVE },
  { storeCode: 'TRN0241', weekStart: '2026-04-12', weekEnd: '2026-04-18', weeklySalesTarget: 1200000, workflowState: WORKFLOW.ACTIVE },
  { storeCode: 'TST0518', weekStart: '2026-04-12', weekEnd: '2026-04-18', weeklySalesTarget: 540000,  workflowState: WORKFLOW.ACTIVE },
];

// ---------- MAKER-CHECKER AUDIT LOG (for the Central persona) ----------
export const makerCheckerLog = [
  { id: 'MCL-0007', ruleId: 'RULE-EL-001', version: 12, event: 'APPROVED',  actor: 'OPS-0002', at: '2025-12-28T11:20:00+05:30', note: 'Annual slabs refresh' },
  { id: 'MCL-0008', ruleId: 'RULE-EL-001', version: 13, event: 'SUBMITTED', actor: 'OPS-0001', at: '2026-04-08T09:10:00+05:30', note: 'Add Realme high-tier, new 130% band' },
  { id: 'MCL-0009', ruleId: 'RULE-GRC-2026-04-01', version: 3, event: 'APPROVED', actor: 'OPS-0002', at: '2026-04-10T16:45:00+05:30', note: 'Cake Rush April 2026' },
  { id: 'MCL-0010', ruleId: 'TARGET-RD3675-202604', version: 1, event: 'APPROVED', actor: 'OPS-0002', at: '2026-03-30T10:00:00+05:30', note: 'Monthly target upload RD3675 April 2026' },
  { id: 'MCL-0011', ruleId: 'RULE-FNL-W-001', version: 8, event: 'APPROVED', actor: 'OPS-0002', at: '2025-11-14T14:00:00+05:30', note: 'Split matrix recalibration' },
  { id: 'MCL-0012', ruleId: 'TARGET-TRN0241-W15', version: 1, event: 'REJECTED', actor: 'OPS-0002', at: '2026-04-04T18:22:00+05:30', note: 'Target seems too low vs last week actual; revise' },
];
