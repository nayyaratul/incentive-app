// ============================================================================
// DUMMY TRANSACTIONS — mirrors brief §9 (16-field common transaction format).
// Used by the HistoryScreen (read-only per-employee view) and by the SM's
// transactions tab (store-wide).
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
    { transactionId: 'TX-900365', transactionDate: '2026-04-10', storeCode: 'RD3675', vertical: 'ELECTRONICS', storeFormat: 'Reliance Digital', employeeId: 'EMP-0041', department: 'Telecom',          articleCode: 'OPPO-A78-8GB',   productFamilyCode: 'FK01', brand: 'Oppo',    productFamily: 'Wireless Phone', quantity: 1, grossAmount: 19199, taxAmount: 3456, totalAmount: 22655, transactionType: TX_TYPE.SFS,    channel: CHANNEL.OFFLINE, baseIncentive: 0, multiplierApplied: 0, finalIncentive: 0, note: 'SFS — excluded per §6.3' },
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
};

// Store-wide totals (for SM transactions tab)
export const transactionsByStore = {
  'RD3675': 240,   // 240 transactions this month
  'T28V':   86,
  'TRN0241': 412,
};
