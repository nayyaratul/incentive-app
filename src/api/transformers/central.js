import dayjs from 'dayjs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Group an array of objects by a key, returning a Map<keyValue, item[]>.
 */
function groupBy(arr, key) {
  const map = new Map();
  for (const item of arr) {
    const k = item[key] ?? 'Unknown';
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(item);
  }
  return map;
}

function sum(arr, key) {
  return arr.reduce((s, r) => s + (Number(r[key]) || 0), 0);
}

function avg(arr, key) {
  if (arr.length === 0) return 0;
  return sum(arr, key) / arr.length;
}

// ---------------------------------------------------------------------------
// Main transformer
// ---------------------------------------------------------------------------

/**
 * Maps the API dashboard + city/store rows + rules into the shape the
 * central reporting UI expects.
 */
export function transformCentralReporting(dashboardData, cityRows, storeRows, rulesData) {
  const stores = storeRows ?? [];
  const cities = cityRows ?? [];
  const dash = dashboardData ?? {};

  const asOf = dayjs().toISOString();

  // -- totals --
  const organisationPayoutMTD = sum(stores, 'totalIncentive');
  const employeesEligible = sum(stores, 'employeeCount');
  const storesWithPayout = stores.filter((s) => (Number(s.totalIncentive) || 0) > 0).length;
  const storesBelowGate = stores.filter((s) => (Number(s.achievementPct) || 0) < 85).length;

  // -- byVertical --
  const verticalGroups = groupBy(stores, 'vertical');
  const byVertical = [...verticalGroups.entries()].map(([vertical, rows]) => ({
    vertical,
    stores: rows.length,
    employees: sum(rows, 'employeeCount'),
    payoutMTD: sum(rows, 'totalIncentive'),
    achievementAvgPct: Math.round(avg(rows, 'achievementPct') * 100) / 100,
  }));

  // -- byState (from city rows grouped by state) --
  const stateGroups = groupBy(cities, 'state');
  const byState = [...stateGroups.entries()].map(([state, rows]) => {
    const stateStores = stores.filter(
      (s) => rows.some((c) => c.city === s.city) || s.state === state,
    );
    const topStore = stateStores.length > 0
      ? stateStores.reduce((best, s) =>
          (Number(s.totalIncentive) || 0) > (Number(best.totalIncentive) || 0) ? s : best,
        stateStores[0])
      : null;

    return {
      state,
      stores: sum(rows, 'storeCount'),
      payoutMTD: sum(rows, 'totalIncentive'),
      topStore: topStore
        ? { storeCode: topStore.storeCode, storeName: topStore.storeName, payout: topStore.totalIncentive }
        : null,
    };
  });

  // -- topStores --
  const topStores = [...stores]
    .sort((a, b) => (Number(b.totalIncentive) || 0) - (Number(a.totalIncentive) || 0))
    .slice(0, 5)
    .map((s) => ({
      storeCode: s.storeCode,
      storeName: s.storeName,
      vertical: s.vertical,
      payoutMTD: Number(s.totalIncentive) || 0,
      achievementPct: Number(s.achievementPct) || 0,
    }));

  // -- allStores --
  const allStores = stores.map((s) => ({
    storeCode: s.storeCode ?? '',
    storeName: s.storeName ?? '',
    vertical: s.vertical ?? '',
    format: s.storeFormat ?? '',
    state: s.state ?? '',
    city: s.city ?? '',
    payoutMTD: Number(s.totalIncentive) || 0,
    achievementPct: Number(s.achievementPct) || 0,
    status: (Number(s.achievementPct) || 0) >= 85 ? 'active' : 'below-gate',
    staffCount: Number(s.employeeCount) || 0,
  }));

  // -- flags: derive from alerts or from data anomalies --
  const alertFlags = (dash.alerts ?? []).map((a, i) => ({
    id: a.id ?? `flag-${i}`,
    storeCode: a.storeCode ?? null,
    vertical: a.vertical ?? null,
    severity: a.severity ?? 'info',
    message: a.message ?? '',
  }));

  return {
    asOf,
    totals: { organisationPayoutMTD, employeesEligible, storesWithPayout, storesBelowGate },
    byVertical,
    byState,
    topStores,
    allStores,
    flags: alertFlags,
  };
}
