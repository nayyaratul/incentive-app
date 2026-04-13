// ============================================================================
// MASTERS — mirrors section 10 (Employee Master), 11 (Store Master), and the
// product catalog implied across the brief. Single source of truth for every
// persona view.
// ============================================================================

export const VERTICALS = Object.freeze({
  ELECTRONICS: 'ELECTRONICS',
  GROCERY: 'GROCERY',
  FNL: 'FNL',
});

export const ROLES = Object.freeze({
  SM: 'SM',   // Store Manager
  DM: 'DM',   // Deputy Store Manager
  SA: 'SA',   // Store Associate
  BA: 'BA',   // Brand Associate
});

export const PAYROLL_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  NOTICE_PERIOD: 'NOTICE_PERIOD',
  DISCIPLINARY_ACTION: 'DISCIPLINARY_ACTION',
  LONG_LEAVE_UNAUTHORISED: 'LONG_LEAVE_UNAUTHORISED',
  INACTIVE: 'INACTIVE',
});

export const STORE_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  TEMPORARILY_CLOSED: 'TEMPORARILY_CLOSED',
});

export const TX_TYPE = Object.freeze({
  NORMAL: 'NORMAL',
  SFS: 'SFS',
  PAS: 'PAS',
  JIOMART: 'JIOMART',
});

export const CHANNEL = Object.freeze({ OFFLINE: 'OFFLINE', ONLINE: 'ONLINE' });

export const ATTENDANCE = Object.freeze({
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  LEAVE_APPROVED: 'LEAVE_APPROVED',
  LEAVE_UNAPPROVED: 'LEAVE_UNAPPROVED',
  HOLIDAY: 'HOLIDAY',
  WEEK_OFF: 'WEEK_OFF',
});

// ---------- STORE MASTER ----------
export const stores = [
  {
    storeCode: 'RD3675',
    storeName: 'Reliance Digital, Andheri West',
    vertical: VERTICALS.ELECTRONICS,
    storeFormat: 'Reliance Digital',
    state: 'Maharashtra',
    city: 'Mumbai',
    storeStatus: STORE_STATUS.ACTIVE,
    operationalSince: '2019-04-12',
    operationalDaysInMonth: 28,
  },
  {
    storeCode: 'RD3682',
    storeName: 'Reliance Digital, Bijapur KA',
    vertical: VERTICALS.ELECTRONICS,
    storeFormat: 'Reliance Digital',
    state: 'Karnataka',
    city: 'Bijapur',
    storeStatus: STORE_STATUS.ACTIVE,
    operationalSince: '2021-01-20',
    operationalDaysInMonth: 30,
  },
  {
    storeCode: '2536',
    storeName: 'SIG-Pottammel',
    vertical: VERTICALS.GROCERY,
    storeFormat: 'Signature',
    state: 'Kerala',
    city: 'Pottammel',
    storeStatus: STORE_STATUS.ACTIVE,
    operationalSince: '2022-07-01',
    operationalDaysInMonth: 28,
  },
  {
    storeCode: 'TGL5',
    storeName: 'SMT-Edappal',
    vertical: VERTICALS.GROCERY,
    storeFormat: 'Smart',
    state: 'Kerala',
    city: 'Edappal',
    storeStatus: STORE_STATUS.ACTIVE,
    operationalSince: '2023-02-14',
    operationalDaysInMonth: 28,
  },
  {
    storeCode: 'T28V',
    storeName: 'SMT-Kalpetta',
    vertical: VERTICALS.GROCERY,
    storeFormat: 'Smart',
    state: 'Kerala',
    city: 'Kalpetta',
    storeStatus: STORE_STATUS.ACTIVE,
    operationalSince: '2023-09-01',
    operationalDaysInMonth: 28,
  },
  {
    storeCode: 'TRN0241',
    storeName: 'Trends, Koregaon Park',
    vertical: VERTICALS.FNL,
    storeFormat: 'Trends',
    state: 'Maharashtra',
    city: 'Pune',
    storeStatus: STORE_STATUS.ACTIVE,
    operationalSince: '2018-03-05',
    operationalDaysInMonth: 28,
  },
  {
    storeCode: 'TST0518',
    storeName: 'Trends Small Town, Nashik',
    vertical: VERTICALS.FNL,
    storeFormat: 'TST',
    state: 'Maharashtra',
    city: 'Nashik',
    storeStatus: STORE_STATUS.ACTIVE,
    operationalSince: '2020-11-10',
    operationalDaysInMonth: 28,
  },
];

// ---------- EMPLOYEE MASTER ----------
export const employees = [
  // Reliance Digital Andheri (Electronics) team
  { employeeId: 'EMP-0041', employeeName: 'Rohit Sharma',  role: ROLES.SA, storeCode: 'RD3675', payrollStatus: PAYROLL_STATUS.ACTIVE,         dateOfJoining: '2023-06-15', dateOfExit: null },
  { employeeId: 'EMP-0042', employeeName: 'Priya Desai',   role: ROLES.SA, storeCode: 'RD3675', payrollStatus: PAYROLL_STATUS.ACTIVE,         dateOfJoining: '2022-11-02', dateOfExit: null },
  { employeeId: 'EMP-0043', employeeName: 'Vikram Patil',  role: ROLES.SA, storeCode: 'RD3675', payrollStatus: PAYROLL_STATUS.ACTIVE,         dateOfJoining: '2024-01-22', dateOfExit: null },
  { employeeId: 'EMP-0044', employeeName: 'Anita Reddy',   role: ROLES.SA, storeCode: 'RD3675', payrollStatus: PAYROLL_STATUS.NOTICE_PERIOD,  dateOfJoining: '2020-08-14', dateOfExit: '2026-05-10' },
  { employeeId: 'EMP-0045', employeeName: 'Kiran Pawar',   role: ROLES.SA, storeCode: 'RD3675', payrollStatus: PAYROLL_STATUS.ACTIVE,         dateOfJoining: '2024-07-11', dateOfExit: null },
  { employeeId: 'EMP-0046', employeeName: 'Sunil Kumar',   role: ROLES.SM, storeCode: 'RD3675', payrollStatus: PAYROLL_STATUS.ACTIVE,         dateOfJoining: '2017-02-20', dateOfExit: null },
  { employeeId: 'EMP-0047', employeeName: 'Manoj Iyer',    role: ROLES.BA, storeCode: 'RD3675', payrollStatus: PAYROLL_STATUS.ACTIVE,         dateOfJoining: '2024-03-04', dateOfExit: null, brandRep: 'Samsung' },
  { employeeId: 'EMP-0048', employeeName: 'Deepa Menon',   role: ROLES.BA, storeCode: 'RD3675', payrollStatus: PAYROLL_STATUS.ACTIVE,         dateOfJoining: '2024-02-15', dateOfExit: null, brandRep: 'Vivo' },

  // Smart Kalpetta (Grocery) team
  { employeeId: 'GRC-2201', employeeName: 'Nisha Thomas',  role: ROLES.SM, storeCode: 'T28V', payrollStatus: PAYROLL_STATUS.ACTIVE,           dateOfJoining: '2019-05-18', dateOfExit: null },
  { employeeId: 'GRC-2202', employeeName: 'Ravi Krishnan', role: ROLES.DM, storeCode: 'T28V', payrollStatus: PAYROLL_STATUS.ACTIVE,           dateOfJoining: '2021-08-03', dateOfExit: null },
  { employeeId: 'GRC-2203', employeeName: 'Meena Nair',    role: ROLES.SA, storeCode: 'T28V', payrollStatus: PAYROLL_STATUS.ACTIVE,           dateOfJoining: '2023-01-12', dateOfExit: null },
  { employeeId: 'GRC-2204', employeeName: 'Ajit Pillai',   role: ROLES.SA, storeCode: 'T28V', payrollStatus: PAYROLL_STATUS.ACTIVE,           dateOfJoining: '2023-04-20', dateOfExit: null },
  { employeeId: 'GRC-2205', employeeName: 'Soumya George',  role: ROLES.SA, storeCode: 'T28V', payrollStatus: PAYROLL_STATUS.ACTIVE,           dateOfJoining: '2024-02-07', dateOfExit: null },
  { employeeId: 'GRC-2206', employeeName: 'Thomas Jacob',  role: ROLES.SA, storeCode: 'T28V', payrollStatus: PAYROLL_STATUS.ACTIVE,           dateOfJoining: '2024-05-15', dateOfExit: null },
  { employeeId: 'GRC-2207', employeeName: 'Lakshmi Pillai',role: ROLES.BA, storeCode: 'T28V', payrollStatus: PAYROLL_STATUS.ACTIVE,           dateOfJoining: '2024-03-10', dateOfExit: null, brandRep: 'Andree' },

  // Trends Koregaon Park (F&L) team
  { employeeId: 'FNL-3101', employeeName: 'Arjun Menon',   role: ROLES.SM, storeCode: 'TRN0241', payrollStatus: PAYROLL_STATUS.ACTIVE,        dateOfJoining: '2018-03-14', dateOfExit: null },
  { employeeId: 'FNL-3102', employeeName: 'Neha Agarwal',  role: ROLES.DM, storeCode: 'TRN0241', payrollStatus: PAYROLL_STATUS.ACTIVE,        dateOfJoining: '2020-06-05', dateOfExit: null },
  { employeeId: 'FNL-3103', employeeName: 'Sara Khan',     role: ROLES.SA, storeCode: 'TRN0241', payrollStatus: PAYROLL_STATUS.ACTIVE,        dateOfJoining: '2022-09-01', dateOfExit: null },
  { employeeId: 'FNL-3104', employeeName: 'Ishaan Joshi',  role: ROLES.SA, storeCode: 'TRN0241', payrollStatus: PAYROLL_STATUS.ACTIVE,        dateOfJoining: '2023-02-28', dateOfExit: null },
  { employeeId: 'FNL-3105', employeeName: 'Tara Singh',    role: ROLES.SA, storeCode: 'TRN0241', payrollStatus: PAYROLL_STATUS.ACTIVE,        dateOfJoining: '2023-07-17', dateOfExit: null },
  { employeeId: 'FNL-3106', employeeName: 'Rahul Shetty',  role: ROLES.SA, storeCode: 'TRN0241', payrollStatus: PAYROLL_STATUS.ACTIVE,        dateOfJoining: '2024-01-11', dateOfExit: null },
  { employeeId: 'FNL-3107', employeeName: 'Pooja Kulkarni',role: ROLES.SA, storeCode: 'TRN0241', payrollStatus: PAYROLL_STATUS.ACTIVE,        dateOfJoining: '2024-03-22', dateOfExit: null },
  { employeeId: 'FNL-3108', employeeName: 'Kavya Sen',     role: ROLES.SA, storeCode: 'TRN0241', payrollStatus: PAYROLL_STATUS.ACTIVE,        dateOfJoining: '2024-05-04', dateOfExit: null },
  { employeeId: 'FNL-3109', employeeName: 'Dhruv Joshi',   role: ROLES.SA, storeCode: 'TRN0241', payrollStatus: PAYROLL_STATUS.ACTIVE,        dateOfJoining: '2024-08-09', dateOfExit: null },

  // Central Ops persona (no store mapping)
  { employeeId: 'OPS-0001', employeeName: 'Rashmi Iyer',   role: 'CENTRAL_MAKER',  storeCode: null, payrollStatus: PAYROLL_STATUS.ACTIVE,   dateOfJoining: '2016-11-01', dateOfExit: null },
  { employeeId: 'OPS-0002', employeeName: 'Vikas Chauhan', role: 'CENTRAL_CHECKER',storeCode: null, payrollStatus: PAYROLL_STATUS.ACTIVE,   dateOfJoining: '2015-05-01', dateOfExit: null },
];

// ---------- ARTICLE / PRODUCT CATALOG (enough to drive worked examples) ----------
export const articles = [
  // Electronics (sample across families/bands used by the brief)
  { articleCode: 'VIVO-Y28-64GB', description: 'Vivo Y28 64GB', vertical: VERTICALS.ELECTRONICS, department: 'Telecom',      productFamilyCode: 'FK01', productFamily: 'Wireless Phone', brand: 'Vivo',      unitPricePreTax: 17499 },
  { articleCode: 'SAM-M14-6GB',   description: 'Samsung Galaxy M14 6GB', vertical: VERTICALS.ELECTRONICS, department: 'Telecom', productFamilyCode: 'FK01', productFamily: 'Wireless Phone', brand: 'Samsung', unitPricePreTax: 14299 },
  { articleCode: 'OPPO-A78-8GB',  description: 'Oppo A78 8GB', vertical: VERTICALS.ELECTRONICS, department: 'Telecom',       productFamilyCode: 'FK01', productFamily: 'Wireless Phone', brand: 'Oppo',    unitPricePreTax: 19199 },
  { articleCode: 'MI-REDMI-12',   description: 'Redmi 12 128GB', vertical: VERTICALS.ELECTRONICS, department: 'Telecom',     productFamilyCode: 'FK01', productFamily: 'Wireless Phone', brand: 'Xiaomi',  unitPricePreTax: 12999 },
  { articleCode: 'APPLE-IP15',    description: 'iPhone 15 128GB', vertical: VERTICALS.ELECTRONICS, department: 'Telecom',    productFamilyCode: 'FK01', productFamily: 'Wireless Phone', brand: 'Apple',   unitPricePreTax: 67999, excludedFromIncentive: true },
  { articleCode: 'ONEPLUS-N30',   description: 'OnePlus Nord CE3 Lite', vertical: VERTICALS.ELECTRONICS, department: 'Telecom', productFamilyCode: 'FK01', productFamily: 'Wireless Phone', brand: 'OnePlus', unitPricePreTax: 18999, excludedFromIncentive: true },

  { articleCode: 'LEN-IDEA-5',    description: 'Lenovo IdeaPad 5', vertical: VERTICALS.ELECTRONICS, department: 'IT',       productFamilyCode: 'FF01', productFamily: 'Laptop', brand: 'Lenovo',    unitPricePreTax: 48999 },
  { articleCode: 'HP-PAV-14',     description: 'HP Pavilion 14',   vertical: VERTICALS.ELECTRONICS, department: 'IT',       productFamilyCode: 'FF01', productFamily: 'Laptop', brand: 'HP',        unitPricePreTax: 54999 },
  { articleCode: 'DELL-INSP-15',  description: 'Dell Inspiron 15', vertical: VERTICALS.ELECTRONICS, department: 'IT',       productFamilyCode: 'FF01', productFamily: 'Laptop', brand: 'Dell',      unitPricePreTax: 45999 },
  { articleCode: 'APPLE-MBA-M3',  description: 'MacBook Air M3',   vertical: VERTICALS.ELECTRONICS, department: 'IT',       productFamilyCode: 'FF01', productFamily: 'Laptop', brand: 'Apple',     unitPricePreTax: 99999, excludedFromIncentive: true },
  { articleCode: 'MS-SURF-PRO',   description: 'Surface Pro 9',     vertical: VERTICALS.ELECTRONICS, department: 'IT',       productFamilyCode: 'FF01', productFamily: 'Laptop', brand: 'Microsoft', unitPricePreTax: 89999, excludedFromIncentive: true },

  { articleCode: 'SAM-QLED-55',   description: 'Samsung QLED 55"',  vertical: VERTICALS.ELECTRONICS, department: 'ENT',      productFamilyCode: 'FH01', productFamily: 'High End TV',   brand: 'Samsung',  unitPricePreTax: 62999 },
  { articleCode: 'MI-TV-43',      description: 'MI TV 43"',          vertical: VERTICALS.ELECTRONICS, department: 'ENT',      productFamilyCode: 'FH01', productFamily: 'High End TV',   brand: 'MI',       unitPricePreTax: 26999 },

  { articleCode: 'BOAT-ADPODS',   description: 'boAt Airdopes',      vertical: VERTICALS.ELECTRONICS, department: 'AIOT',     productFamilyCode: 'FG01', productFamily: 'Personal AV',   brand: 'boAt',     unitPricePreTax: 1499 },
  { articleCode: 'NOISE-CLRFIT',  description: 'Noise ColorFit Pro', vertical: VERTICALS.ELECTRONICS, department: 'AIOT',     productFamilyCode: 'FG02', productFamily: 'AI & Wearables', brand: 'Noise',   unitPricePreTax: 3499 },

  // Grocery — Cake Rush campaign articles (exact set from brief §7.2)
  { articleCode: '494271428', description: 'Andree Premium Butterscotch Cake 1 kg', vertical: VERTICALS.GROCERY, brand: 'Andree',   unitPricePreTax: 485 },
  { articleCode: '493626014', description: 'Andree Premium Rich Dates Cake 1 kg',   vertical: VERTICALS.GROCERY, brand: 'Andree',   unitPricePreTax: 520 },
  { articleCode: '493626016', description: 'Andree Premium Rich Plum Cake 1 kg',    vertical: VERTICALS.GROCERY, brand: 'Andree',   unitPricePreTax: 540 },
  { articleCode: '492577824', description: 'Bakemill Chocolate Cake 320 g',         vertical: VERTICALS.GROCERY, brand: 'Bakemill', unitPricePreTax: 185 },
  { articleCode: '492577823', description: 'Bakemill Coffee Cake 320 g',            vertical: VERTICALS.GROCERY, brand: 'Bakemill', unitPricePreTax: 185 },
  { articleCode: '490432185', description: 'Bakemill Dates and Carrot Cake 400 g',  vertical: VERTICALS.GROCERY, brand: 'Bakemill', unitPricePreTax: 220 },
  { articleCode: '492577825', description: 'Bakemill Jackfruit Cake 320 g',         vertical: VERTICALS.GROCERY, brand: 'Bakemill', unitPricePreTax: 195 },
  { articleCode: '494300095', description: 'Kairali Pudding Cake 250 g CBD',        vertical: VERTICALS.GROCERY, brand: 'Kairali',  unitPricePreTax: 145 },
  { articleCode: '494359510', description: 'Unibic Plum Cake 300 g (Egg)',          vertical: VERTICALS.GROCERY, brand: 'Unibic',   unitPricePreTax: 210 },
  { articleCode: '494359508', description: 'Unibic Veg Plum Cake 300 g',            vertical: VERTICALS.GROCERY, brand: 'Unibic',   unitPricePreTax: 210 },

  // F&L — no specific SKUs in brief, sample for completeness
  { articleCode: 'TRN-KURTA-M', description: 'Trends Men\'s Cotton Kurta',   vertical: VERTICALS.FNL, brand: 'Performax',   unitPricePreTax: 799 },
  { articleCode: 'TRN-JEANS-L', description: 'Trends Women\'s Denim',         vertical: VERTICALS.FNL, brand: 'Network',     unitPricePreTax: 1499 },
  { articleCode: 'TRN-TSHIRT',  description: 'Trends Unisex T-shirt',         vertical: VERTICALS.FNL, brand: 'Fusion',      unitPricePreTax: 499 },
];
