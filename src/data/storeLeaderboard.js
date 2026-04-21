/**
 * Store leaderboard helpers.
 *
 * Primary path: map a backend `StoreLeaderboardResult` into the UI shape
 * consumed by `LeaderboardDrawer` / `LeaderboardPodium` / `LeaderboardFocusList`.
 *
 * Fallback path (`buildStoreLeaderboard`): builds the same shape from local
 * mocks. Used only when the API is unreachable or mock mode is forced.
 */

const SCOPE_NOTE_BY_VERTICAL = {
  ELECTRONICS: 'Reliance Digital stores',
  GROCERY: 'Grocery stores',
  FNL: 'Trends stores',
};

/**
 * Convert a backend `/api/leaderboard` response into the shape the drawer /
 * podium / focus list consume.
 */
export function mapStoreLeaderboardResponse(response, { vertical } = {}) {
  if (!response || !Array.isArray(response.leaderboard)) return null;
  const board = response.leaderboard;
  const viewerStoreCode = response.viewer?.storeCode ?? response.myRank?.storeCode ?? null;

  const top = board.map((row) => ({
    rank: row.rank,
    name: row.storeName,
    earned: Number(row.achievementPct) || 0,
    isSelf: Boolean(row.isViewerStore) || row.storeCode === viewerStoreCode,
    storeCode: row.storeCode,
    city: row.city,
  }));

  const selfIdx = top.findIndex((r) => r.isSelf);
  const deltaAbove = selfIdx > 0 ? top[selfIdx - 1].earned - top[selfIdx].earned : 0;
  const resolvedVertical = vertical || response.vertical;

  return {
    rank: response.myRank?.rank ?? (selfIdx >= 0 ? top[selfIdx].rank : 0),
    deltaAbove,
    scope: 'stores',
    scopeNote: SCOPE_NOTE_BY_VERTICAL[resolvedVertical] || 'store rankings',
    unitLabel: 'achievement',
    top,
    city: response.city,
    periodLabel: response.period?.label,
  };
}

// ---------------------------------------------------------------------------
// Local mock fallback — used only when the API is unreachable.
// ---------------------------------------------------------------------------

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

export function buildStoreLeaderboard(vertical, storeCode) {
  const stores = storeLeaderboards[vertical];
  if (!stores || stores.length === 0) return null;

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
  const deltaAbove = selfIdx > 0 ? sorted[selfIdx - 1].earned - sorted[selfIdx].earned : 0;

  return {
    rank: selfRank,
    deltaAbove,
    scope: 'stores',
    scopeNote: SCOPE_NOTE_BY_VERTICAL[vertical] || 'store rankings',
    unitLabel: 'achievement',
    top: sorted,
  };
}
