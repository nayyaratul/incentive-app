// ============================================================================
// DUMMY TRANSACTIONS — mirrors brief §9 (16-field common transaction format).
// Used by the HistoryScreen (read-only per-employee view) and by the SM's
// transactions tab (store-wide).
//
// SKU/price/article placeholders below are dummy and brief-compliant (the brief
// only enumerates Grocery campaign articles + Electronics product families and
// brand groups, not SKUs). When the Reliance SKU master arrives, swap article
// codes / brands / unit prices in this file; the slab + multiplier logic in
// `configs.js` and the rendering layers don't need to change.
// ============================================================================

import { TX_TYPE, CHANNEL } from './masters';

// Per-employee recent transactions (last 30 days). Values chosen so they
// aggregate up to match the monthToDateEarned figures in payouts.js.
export const transactionsByEmployee = {
  // Rohit Sharma (SA · Electronics)
  'EMP-0041': [
    { transactionId: 'TX-900421', transactionDate: '2026-04-13', storeCode: 'RD3675', vertical: 'ELECTRONICS', storeFormat: 'Reliance Digital', employeeId: 'EMP-0041', department: 'Telecom',          articleCode: 'VIVO-Y28-64GB',  productFamilyCode: 'FK01', brand: 'Vivo',    productFamily: 'Wireless Phone', quantity: 1, grossAmount: 17499, taxAmount: 3150, totalAmount: 20649, transactionType: TX_TYPE.NORMAL, channel: CHANNEL.OFFLINE, baseIncentive: 25, multiplierApplied: 0.0, finalIncentive: 0, note: 'Dept at 75% — zeroed' },
    { transactionId: 'TX-900418', transactionDate: '2026-04-13', storeCode: 'RD3675', vertical: 'ELECTRONICS', storeFormat: 'Reliance Digital', employeeId: 'EMP-0041', department: 'AIOT',             articleCode: 'BOAT-ADPODS',    productFamilyCode: 'FG01', brand: 'boAt',    productFamily: 'Personal AV',    quantity: 2, grossAmount: 2998,  taxAmount: 540,  totalAmount: 3538,  transactionType: TX_TYPE.NORMAL, channel: CHANNEL.OFFLINE, baseIncentive: 80, multiplierApplied: 0.8, finalIncentive: 64 },
    { transactionId: 'TX-900402', transactionDate: '2026-04-12', storeCode: 'RD3675', vertical: 'ELECTRONICS', storeFormat: 'Reliance Digital', employeeId: 'EMP-0041', department: 'ENT',              articleCode: 'SAM-QLED-55',    productFamilyCode: 'FH01', brand: 'Samsung', productFamily: 'High End TV',    quantity: 1, grossAmount: 62999, taxAmount: 11340, totalAmount: 74339, transactionType: TX_TYPE.NORMAL, channel: CHANNEL.OFFLINE, baseIncentive: 225, multiplierApplied: 1.0, finalIncentive: 225 },
    { transactionId: 'TX-900387', transactionDate: '2026-04-11', storeCode: 'RD3675', vertical: 'ELECTRONICS', storeFormat: 'Reliance Digital', employeeId: 'EMP-0041', department: 'Large Appliances', articleCode: 'SAM-WM-8KG',     productFamilyCode: 'FJ03', brand: 'Samsung', productFamily: 'Laundry & Wash Care', quantity: 1, grossAmount: 32999, taxAmount: 5940, totalAmount: 38939, transactionType: TX_TYPE.NORMAL, channel: CHANNEL.OFFLINE, baseIncentive: 100, multiplierApplied: 1.2, finalIncentive: 120 },
    { transactionId: 'TX-900365', transactionDate: '2026-04-10', storeCode: 'RD3675', vertical: 'ELECTRONICS', storeFormat: 'Reliance Digital', employeeId: 'EMP-0041', department: 'Telecom',          articleCode: 'OPPO-A78-8GB',   productFamilyCode: 'FK01', brand: 'Oppo',    productFamily: 'Wireless Phone', quantity: 1, grossAmount: 19199, taxAmount: 3456, totalAmount: 22655, transactionType: TX_TYPE.SFS,    channel: CHANNEL.OFFLINE, baseIncentive: 0, multiplierApplied: 0, finalIncentive: 0, note: 'SFS — excluded from incentive' },
    { transactionId: 'TX-900341', transactionDate: '2026-04-10', storeCode: 'RD3675', vertical: 'ELECTRONICS', storeFormat: 'Reliance Digital', employeeId: 'EMP-0041', department: 'IT',               articleCode: 'LEN-IDEA-5',     productFamilyCode: 'FF01', brand: 'Lenovo',  productFamily: 'Laptop',         quantity: 1, grossAmount: 48999, taxAmount: 8820, totalAmount: 57819, transactionType: TX_TYPE.NORMAL, channel: CHANNEL.OFFLINE, baseIncentive: 70, multiplierApplied: 0.8, finalIncentive: 56 },
    { transactionId: 'TX-900320', transactionDate: '2026-04-09', storeCode: 'RD3675', vertical: 'ELECTRONICS', storeFormat: 'Reliance Digital', employeeId: 'EMP-0041', department: 'Telecom',          articleCode: 'APPLE-IP15',     productFamilyCode: 'FK01', brand: 'Apple',   productFamily: 'Wireless Phone', quantity: 1, grossAmount: 67999, taxAmount: 12240, totalAmount: 80239, transactionType: TX_TYPE.NORMAL, channel: CHANNEL.OFFLINE, baseIncentive: 0, multiplierApplied: 0, finalIncentive: 0, note: 'Apple — excluded entirely' },
    { transactionId: 'TX-900298', transactionDate: '2026-04-08', storeCode: 'RD3675', vertical: 'ELECTRONICS', storeFormat: 'Reliance Digital', employeeId: 'EMP-0041', department: 'ENT',              articleCode: 'MI-TV-43',       productFamilyCode: 'FH01', brand: 'MI',      productFamily: 'High End TV',    quantity: 1, grossAmount: 26999, taxAmount: 4860, totalAmount: 31859, transactionType: TX_TYPE.NORMAL, channel: CHANNEL.OFFLINE, baseIncentive: 50, multiplierApplied: 1.0, finalIncentive: 50 },
    { transactionId: 'TX-900270', transactionDate: '2026-04-07', storeCode: 'RD3675', vertical: 'ELECTRONICS', storeFormat: 'Reliance Digital', employeeId: 'EMP-0041', department: 'Small Appliances', articleCode: 'PHIL-AIRFRY',    productFamilyCode: 'FI05', brand: 'Philips', productFamily: 'Kitchen Care',   quantity: 1, grossAmount: 6999,  taxAmount: 1260, totalAmount: 8259,  transactionType: TX_TYPE.NORMAL, channel: CHANNEL.OFFLINE, baseIncentive: 100, multiplierApplied: 0.8, finalIncentive: 80 },
    { transactionId: 'TX-900245', transactionDate: '2026-04-06', storeCode: 'RD3675', vertical: 'ELECTRONICS', storeFormat: 'Reliance Digital', employeeId: 'EMP-0041', department: 'AIOT',             articleCode: 'NOISE-CLRFIT',   productFamilyCode: 'FG02', brand: 'Noise',   productFamily: 'AI & Wearables', quantity: 1, grossAmount: 3499,  taxAmount: 630,  totalAmount: 4129,  transactionType: TX_TYPE.NORMAL, channel: CHANNEL.OFFLINE, baseIncentive: 50, multiplierApplied: 0.8, finalIncentive: 40 },
    { transactionId: 'TX-900221', transactionDate: '2026-04-05', storeCode: 'RD3675', vertical: 'ELECTRONICS', storeFormat: 'Reliance Digital', employeeId: 'EMP-0041', department: 'ENT',              articleCode: 'SAM-QLED-55',    productFamilyCode: 'FH01', brand: 'Samsung', productFamily: 'High End TV',    quantity: 1, grossAmount: 62999, taxAmount: 11340, totalAmount: 74339, transactionType: TX_TYPE.NORMAL, channel: CHANNEL.OFFLINE, baseIncentive: 225, multiplierApplied: 1.0, finalIncentive: 225 },
  ],

  // Meena Nair (SA · Grocery · Cake Rush campaign)
  'GRC-2203': [
    { transactionId: 'TX-GR-4821', transactionDate: '2026-04-13', storeCode: 'T28V', vertical: 'GROCERY', storeFormat: 'Smart', employeeId: 'GRC-2203', articleCode: '494271428', brand: 'Andree',   productFamily: null, quantity: 3, grossAmount: 1455, taxAmount: 73,  totalAmount: 1528, transactionType: TX_TYPE.NORMAL, channel: CHANNEL.OFFLINE, note: 'Campaign' },
    { transactionId: 'TX-GR-4818', transactionDate: '2026-04-13', storeCode: 'T28V', vertical: 'GROCERY', storeFormat: 'Smart', employeeId: 'GRC-2203', articleCode: '492577824', brand: 'Bakemill', productFamily: null, quantity: 6, grossAmount: 1110, taxAmount: 56,  totalAmount: 1166, transactionType: TX_TYPE.NORMAL, channel: CHANNEL.OFFLINE, note: 'Campaign' },
    { transactionId: 'TX-GR-4812', transactionDate: '2026-04-12', storeCode: 'T28V', vertical: 'GROCERY', storeFormat: 'Smart', employeeId: 'GRC-2203', articleCode: '494359510', brand: 'Unibic',   productFamily: null, quantity: 4, grossAmount: 840,  taxAmount: 42,  totalAmount: 882,  transactionType: TX_TYPE.NORMAL, channel: CHANNEL.OFFLINE, note: 'Campaign' },
    { transactionId: 'TX-GR-4805', transactionDate: '2026-04-11', storeCode: 'T28V', vertical: 'GROCERY', storeFormat: 'Smart', employeeId: 'GRC-2203', articleCode: '493626014', brand: 'Andree',   productFamily: null, quantity: 2, grossAmount: 1040, taxAmount: 52,  totalAmount: 1092, transactionType: TX_TYPE.NORMAL, channel: CHANNEL.OFFLINE, note: 'Campaign' },
    { transactionId: 'TX-GR-4799', transactionDate: '2026-04-10', storeCode: 'T28V', vertical: 'GROCERY', storeFormat: 'Smart', employeeId: 'GRC-2203', articleCode: '494300095', brand: 'Kairali',  productFamily: null, quantity: 5, grossAmount: 725,  taxAmount: 36,  totalAmount: 761,  transactionType: TX_TYPE.NORMAL, channel: CHANNEL.OFFLINE, note: 'Campaign' },
    { transactionId: 'TX-GR-4790', transactionDate: '2026-04-09', storeCode: 'T28V', vertical: 'GROCERY', storeFormat: 'Smart', employeeId: 'GRC-2203', articleCode: '492577825', brand: 'Bakemill', productFamily: null, quantity: 4, grossAmount: 780,  taxAmount: 39,  totalAmount: 819,  transactionType: TX_TYPE.NORMAL, channel: CHANNEL.OFFLINE, note: 'Campaign' },
  ],

  // Sara Khan (SA · Trends F&L)
  'FNL-3103': [
    { transactionId: 'TX-FL-1902', transactionDate: '2026-04-13', storeCode: 'TRN0241', vertical: 'FNL', storeFormat: 'Trends', employeeId: 'FNL-3103', articleCode: 'TRN-KURTA-M', brand: 'Performax', productFamily: null, quantity: 1, grossAmount: 799,  taxAmount: 96,  totalAmount: 895,  transactionType: TX_TYPE.NORMAL, channel: CHANNEL.OFFLINE },
    { transactionId: 'TX-FL-1898', transactionDate: '2026-04-13', storeCode: 'TRN0241', vertical: 'FNL', storeFormat: 'Trends', employeeId: 'FNL-3103', articleCode: 'TRN-JEANS-L', brand: 'Network',   productFamily: null, quantity: 1, grossAmount: 1499, taxAmount: 180, totalAmount: 1679, transactionType: TX_TYPE.NORMAL, channel: CHANNEL.OFFLINE },
    { transactionId: 'TX-FL-1884', transactionDate: '2026-04-12', storeCode: 'TRN0241', vertical: 'FNL', storeFormat: 'Trends', employeeId: 'FNL-3103', articleCode: 'TRN-TSHIRT',  brand: 'Fusion',    productFamily: null, quantity: 2, grossAmount: 998,  taxAmount: 120, totalAmount: 1118, transactionType: TX_TYPE.NORMAL, channel: CHANNEL.OFFLINE },
    { transactionId: 'TX-FL-1876', transactionDate: '2026-04-12', storeCode: 'TRN0241', vertical: 'FNL', storeFormat: 'Trends', employeeId: 'FNL-3103', articleCode: 'TRN-KURTA-M', brand: 'Performax', productFamily: null, quantity: 1, grossAmount: 799,  taxAmount: 96,  totalAmount: 895,  transactionType: TX_TYPE.NORMAL, channel: CHANNEL.OFFLINE },
  ],
  'FNL-3110': [
    { transactionId: 'TX-FL-1931', transactionDate: '2026-04-13', storeCode: 'TRN0241', vertical: 'FNL', storeFormat: 'Trends', employeeId: 'FNL-3110', articleCode: 'TRN-TSHIRT',  brand: 'Fusion',    productFamily: null, quantity: 3, grossAmount: 1497, taxAmount: 180, totalAmount: 1677, transactionType: TX_TYPE.NORMAL, channel: CHANNEL.OFFLINE },
    { transactionId: 'TX-FL-1922', transactionDate: '2026-04-12', storeCode: 'TRN0241', vertical: 'FNL', storeFormat: 'Trends', employeeId: 'FNL-3110', articleCode: 'TRN-JEANS-L', brand: 'Network',   productFamily: null, quantity: 1, grossAmount: 1499, taxAmount: 180, totalAmount: 1679, transactionType: TX_TYPE.NORMAL, channel: CHANNEL.OFFLINE },
    { transactionId: 'TX-FL-1915', transactionDate: '2026-04-11', storeCode: 'TRN0241', vertical: 'FNL', storeFormat: 'Trends', employeeId: 'FNL-3110', articleCode: 'TRN-KURTA-M', brand: 'Performax', productFamily: null, quantity: 2, grossAmount: 1598, taxAmount: 192, totalAmount: 1790, transactionType: TX_TYPE.NORMAL, channel: CHANNEL.OFFLINE },
  ],
};

// Store-wide totals (for SM transactions tab — aggregate count)
export const transactionsByStore = {
  'RD3675': 240,   // 240 transactions this month
  'T28V':   86,
  'TRN0241': 412,
};

// ---------- Additional per-employee transactions for other RD3675 staff ----------
// So the Store Manager's transactions view has enough rows to feel real.
transactionsByEmployee['EMP-0042'] = [
  { transactionId: 'TX-900412', transactionDate: '2026-04-13', storeCode: 'RD3675', vertical: 'ELECTRONICS', storeFormat: 'Reliance Digital', employeeId: 'EMP-0042', department: 'ENT',              articleCode: 'SAM-QLED-55',    productFamilyCode: 'FH01', brand: 'Samsung', productFamily: 'High End TV',   quantity: 1, grossAmount: 62999, taxAmount: 11340, totalAmount: 74339, transactionType: 'NORMAL', channel: 'OFFLINE', baseIncentive: 225, multiplierApplied: 1.0, finalIncentive: 225 },
  { transactionId: 'TX-900405', transactionDate: '2026-04-12', storeCode: 'RD3675', vertical: 'ELECTRONICS', storeFormat: 'Reliance Digital', employeeId: 'EMP-0042', department: 'Large Appliances', articleCode: 'LG-AC-15T',      productFamilyCode: 'FJ01', brand: 'LG',      productFamily: 'Air Care',       quantity: 1, grossAmount: 38999, taxAmount: 7020,  totalAmount: 46019, transactionType: 'NORMAL', channel: 'OFFLINE', baseIncentive: 100, multiplierApplied: 1.2, finalIncentive: 120 },
  { transactionId: 'TX-900389', transactionDate: '2026-04-11', storeCode: 'RD3675', vertical: 'ELECTRONICS', storeFormat: 'Reliance Digital', employeeId: 'EMP-0042', department: 'Telecom',          articleCode: 'SAM-M14-6GB',    productFamilyCode: 'FK01', brand: 'Samsung', productFamily: 'Wireless Phone', quantity: 2, grossAmount: 28598, taxAmount: 5148,  totalAmount: 33746, transactionType: 'NORMAL', channel: 'OFFLINE', baseIncentive: 50,  multiplierApplied: 0.0, finalIncentive: 0, note: 'Dept at 75% — zeroed' },
  { transactionId: 'TX-900361', transactionDate: '2026-04-10', storeCode: 'RD3675', vertical: 'ELECTRONICS', storeFormat: 'Reliance Digital', employeeId: 'EMP-0042', department: 'AIOT',             articleCode: 'BOAT-ADPODS',    productFamilyCode: 'FG01', brand: 'boAt',    productFamily: 'Personal AV',    quantity: 3, grossAmount: 4497,  taxAmount: 810,   totalAmount: 5307,  transactionType: 'NORMAL', channel: 'OFFLINE', baseIncentive: 120, multiplierApplied: 0.8, finalIncentive: 96 },
];

transactionsByEmployee['EMP-0043'] = [
  { transactionId: 'TX-900419', transactionDate: '2026-04-13', storeCode: 'RD3675', vertical: 'ELECTRONICS', storeFormat: 'Reliance Digital', employeeId: 'EMP-0043', department: 'Large Appliances', articleCode: 'SAM-REF-Q',      productFamilyCode: 'FJ02', brand: 'Samsung', productFamily: 'Food Preservation', quantity: 1, grossAmount: 44999, taxAmount: 8100,  totalAmount: 53099, transactionType: 'NORMAL', channel: 'OFFLINE', baseIncentive: 150, multiplierApplied: 1.2, finalIncentive: 180 },
  { transactionId: 'TX-900407', transactionDate: '2026-04-12', storeCode: 'RD3675', vertical: 'ELECTRONICS', storeFormat: 'Reliance Digital', employeeId: 'EMP-0043', department: 'ENT',              articleCode: 'SAM-QLED-55',    productFamilyCode: 'FH01', brand: 'Samsung', productFamily: 'High End TV',    quantity: 1, grossAmount: 62999, taxAmount: 11340, totalAmount: 74339, transactionType: 'NORMAL', channel: 'OFFLINE', baseIncentive: 225, multiplierApplied: 1.0, finalIncentive: 225 },
  { transactionId: 'TX-900373', transactionDate: '2026-04-11', storeCode: 'RD3675', vertical: 'ELECTRONICS', storeFormat: 'Reliance Digital', employeeId: 'EMP-0043', department: 'IT',               articleCode: 'HP-PAV-14',      productFamilyCode: 'FF01', brand: 'HP',      productFamily: 'Laptop',          quantity: 1, grossAmount: 54999, taxAmount: 9900,  totalAmount: 64899, transactionType: 'NORMAL', channel: 'OFFLINE', baseIncentive: 90,  multiplierApplied: 0.8, finalIncentive: 72 },
  { transactionId: 'TX-900359', transactionDate: '2026-04-10', storeCode: 'RD3675', vertical: 'ELECTRONICS', storeFormat: 'Reliance Digital', employeeId: 'EMP-0043', department: 'Telecom',          articleCode: 'VIVO-Y28-64GB',  productFamilyCode: 'FK01', brand: 'Vivo',    productFamily: 'Wireless Phone', quantity: 1, grossAmount: 17499, taxAmount: 3150,  totalAmount: 20649, transactionType: 'NORMAL', channel: 'OFFLINE', baseIncentive: 25,  multiplierApplied: 0.0, finalIncentive: 0, note: 'Dept at 75% — zeroed' },
];

transactionsByEmployee['EMP-0045'] = [
  { transactionId: 'TX-900415', transactionDate: '2026-04-13', storeCode: 'RD3675', vertical: 'ELECTRONICS', storeFormat: 'Reliance Digital', employeeId: 'EMP-0045', department: 'AIOT',             articleCode: 'NOISE-CLRFIT',   productFamilyCode: 'FG02', brand: 'Noise',   productFamily: 'AI & Wearables', quantity: 2, grossAmount: 6998,  taxAmount: 1260,  totalAmount: 8258,  transactionType: 'NORMAL', channel: 'OFFLINE', baseIncentive: 100, multiplierApplied: 0.8, finalIncentive: 80 },
  { transactionId: 'TX-900392', transactionDate: '2026-04-12', storeCode: 'RD3675', vertical: 'ELECTRONICS', storeFormat: 'Reliance Digital', employeeId: 'EMP-0045', department: 'Small Appliances', articleCode: 'PHIL-MIXER',     productFamilyCode: 'FI05', brand: 'Philips', productFamily: 'Kitchen Care',    quantity: 1, grossAmount: 4999,  taxAmount: 900,   totalAmount: 5899,  transactionType: 'NORMAL', channel: 'OFFLINE', baseIncentive: 100, multiplierApplied: 0.8, finalIncentive: 80 },
];

// Sunil the SM has BA-attributed sales under his ID (brief §6.3)
transactionsByEmployee['EMP-0046'] = [
  { transactionId: 'TX-900411', transactionDate: '2026-04-13', storeCode: 'RD3675', vertical: 'ELECTRONICS', storeFormat: 'Reliance Digital', employeeId: 'EMP-0046', department: 'Telecom',          articleCode: 'VIVO-Y28-64GB',  productFamilyCode: 'FK01', brand: 'Vivo',    productFamily: 'Wireless Phone', quantity: 2, grossAmount: 34998, taxAmount: 6300,  totalAmount: 41298, transactionType: 'NORMAL', channel: 'OFFLINE', baseIncentive: 50, multiplierApplied: 0.0, finalIncentive: 0, note: 'BA-attributed · Dept at 75%' },
  { transactionId: 'TX-900400', transactionDate: '2026-04-12', storeCode: 'RD3675', vertical: 'ELECTRONICS', storeFormat: 'Reliance Digital', employeeId: 'EMP-0046', department: 'Large Appliances', articleCode: 'SAM-REF-Q',      productFamilyCode: 'FJ02', brand: 'Samsung', productFamily: 'Food Preservation', quantity: 1, grossAmount: 44999, taxAmount: 8100,  totalAmount: 53099, transactionType: 'NORMAL', channel: 'OFFLINE', baseIncentive: 150, multiplierApplied: 1.2, finalIncentive: 180, note: 'BA-attributed (Manoj)' },
];

/**
 * Store-wide transaction stream for SM view. Flattens all per-employee lists
 * for a given store and sorts newest first.
 */
export function getStoreTransactions(storeCode, employeesList) {
  const out = [];
  for (const emp of employeesList) {
    const rows = transactionsByEmployee[emp.employeeId];
    if (!rows) continue;
    for (const tx of rows) {
      if (tx.storeCode === storeCode) out.push(tx);
    }
  }
  out.sort((a, b) => b.transactionDate.localeCompare(a.transactionDate) || b.transactionId.localeCompare(a.transactionId));
  return out;
}
