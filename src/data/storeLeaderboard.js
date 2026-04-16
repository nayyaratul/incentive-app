/**
 * Mock store-level leaderboard data — ranked by achievement %.
 * Grouped by vertical. The user's current store is marked with `isSelf: true`.
 */

export const storeLeaderboards = {
  ELECTRONICS: [
    { storeCode: 'RD4201', storeName: 'Reliance Digital, Bandra',       city: 'Mumbai',    achievementPct: 118, totalSales: 8420000 },
    { storeCode: 'RD3675', storeName: 'Reliance Digital, Andheri West', city: 'Mumbai',    achievementPct: 105, totalSales: 6350000 },
    { storeCode: 'RD3682', storeName: 'Reliance Digital, Bijapur KA',   city: 'Bijapur',   achievementPct: 102, totalSales: 3180000 },
    { storeCode: 'RD2291', storeName: 'Reliance Digital, Thane West',   city: 'Thane',     achievementPct: 97,  totalSales: 5910000 },
    { storeCode: 'RD5583', storeName: 'Reliance Digital, Vashi',        city: 'Navi Mumbai', achievementPct: 94, totalSales: 4750000 },
    { storeCode: 'RD1109', storeName: 'Reliance Digital, Borivali',     city: 'Mumbai',    achievementPct: 91,  totalSales: 4200000 },
    { storeCode: 'RD6724', storeName: 'Reliance Digital, Koramangala',  city: 'Bengaluru', achievementPct: 88,  totalSales: 5100000 },
    { storeCode: 'RD3390', storeName: 'Reliance Digital, Kothrud',      city: 'Pune',      achievementPct: 84,  totalSales: 3950000 },
  ],

  GROCERY: [
    { storeCode: 'TGL5',  storeName: 'SMT-Edappal',        city: 'Edappal',   achievementPct: 110, totalSales: 248600 },
    { storeCode: '2536',  storeName: 'SIG-Pottammel',      city: 'Pottammel', achievementPct: 109, totalSales: 72800 },
    { storeCode: 'T28V',  storeName: 'SMT-Kalpetta',       city: 'Kalpetta',  achievementPct: 92,  totalSales: 154000 },
    { storeCode: 'SIG82', storeName: 'SIG-Perinthalmanna', city: 'Perinthalmanna', achievementPct: 89, totalSales: 98200 },
    { storeCode: 'SMT19', storeName: 'SMT-Manjeri',        city: 'Manjeri',   achievementPct: 85,  totalSales: 121000 },
    { storeCode: 'FRB02', storeName: 'Freshpik-Calicut',   city: 'Calicut',   achievementPct: 78,  totalSales: 195000 },
  ],

  FNL: [
    { storeCode: 'TRN0312', storeName: 'Trends, Camp Pune',        city: 'Pune',      achievementPct: 112, totalSales: 1450000 },
    { storeCode: 'TRN0241', storeName: 'Trends, Koregaon Park',    city: 'Pune',      achievementPct: 105, totalSales: 1260000 },
    { storeCode: 'TST0518', storeName: 'Trends ST, Nashik',        city: 'Nashik',    achievementPct: 101, totalSales: 980000 },
    { storeCode: 'TEX0109', storeName: 'Trends Ext, Thrissur',     city: 'Thrissur',  achievementPct: 96,  totalSales: 870000 },
    { storeCode: 'TRN0455', storeName: 'Trends, HSR Layout',       city: 'Bengaluru', achievementPct: 93,  totalSales: 1120000 },
    { storeCode: 'TRN0602', storeName: 'Trends, Indiranagar',      city: 'Bengaluru', achievementPct: 88,  totalSales: 1050000 },
    { storeCode: 'TST0733', storeName: 'Trends ST, Kolhapur',      city: 'Kolhapur',  achievementPct: 82,  totalSales: 720000 },
  ],
};

/**
 * Build the leaderboard shape that LeaderboardDrawer expects,
 * for the given vertical and current store.
 */
export function buildStoreLeaderboard(vertical, storeCode) {
  const stores = storeLeaderboards[vertical];
  if (!stores || stores.length === 0) return null;

  // Sort by achievement % descending, assign ranks
  const sorted = [...stores]
    .sort((a, b) => b.achievementPct - a.achievementPct)
    .map((s, i) => ({
      rank: i + 1,
      name: s.storeName,
      earned: s.achievementPct,
      isSelf: s.storeCode === storeCode,
      storeCode: s.storeCode,
      city: s.city,
    }));

  const selfIdx = sorted.findIndex((s) => s.isSelf);
  const selfRank = selfIdx >= 0 ? selfIdx + 1 : 0;
  const deltaAbove =
    selfIdx > 0
      ? sorted[selfIdx - 1].earned - sorted[selfIdx].earned
      : 0;

  return {
    rank: selfRank,
    deltaAbove,
    scope: 'stores',
    scopeNote: vertical === 'ELECTRONICS'
      ? 'Reliance Digital stores'
      : vertical === 'GROCERY'
        ? 'Grocery stores'
        : 'Trends stores',
    unitLabel: 'achievement',
    top: sorted,
  };
}
