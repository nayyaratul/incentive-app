# API Integration Plan: Incentive App <> incentive-os-poc

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all static mock data in `src/data/` with live API calls to the `incentive-os-poc` backend, making the Incentive App a fully API-driven view-only portal.

**Architecture:** Create a thin API client layer (`src/api/`) with per-domain fetch functions that call the incentive-os-poc REST endpoints. React context providers (`src/providers/`) replace static data imports with async state (data + loading + error). Containers and views remain unchanged in structure; only their data source shifts from `import { ... } from '../data/...'` to `const { ... } = useXxxData()` hooks. Where the API lacks a field the UI needs, either (a) a new backend endpoint is added, or (b) the value is derived client-side from available API data.

**Tech Stack:** axios (already in deps), React Context + hooks for async data, incentive-os-poc REST API (Next.js route handlers + Prisma/PostgreSQL)

---

## Part A: Data Availability Audit

This section maps every piece of data the frontend currently consumes (from `src/data/`) against what the API can provide today.

Legend: available | partial (needs transformation) | derivable (compute client-side) | **MISSING** (needs new endpoint or field)

---

### A1. Master Data

| Frontend field | Source file | API endpoint | Status |
|---|---|---|---|
| `personas[]` (id, role, vertical, storeCode, badge, tagline, color) | `personas.js` | None | **MISSING** — personas are a frontend concept. Derive from employee master + role + vertical. |
| `employees[]` (employeeId, name, role, storeCode, payrollStatus, dateOfJoining, primaryDepartment) | `masters.js` | `GET /api/sales/filters` returns `{employeeId, employeeName, storeCode}` only. Employee detail is embedded in `/api/incentives` responses. | **MISSING** — need a dedicated employee master endpoint with full fields. |
| `stores[]` (storeCode, storeName, vertical, format, state, city, status, operationalSince) | `masters.js` | `GET /api/sales/filters` returns `{storeCode, storeName, vertical}` only. Store detail is embedded in `/api/incentives` responses. | **MISSING** — need a dedicated store master endpoint with full fields. |
| `articles[]` (articleCode, description, brand, dept, family, unitPrice) | `masters.js` | `GET /api/rules` returns campaign articles. Electronics slabs have productFamily + brand. | partial — articles aren't a first-class endpoint. Can derive from rules + sales. |
| Enums: `VERTICALS, ROLES, PAYROLL_STATUS, TX_TYPE, CHANNEL, ATTENDANCE` | `masters.js` | Prisma enums exist identically in schema. | available — hardcode in frontend (they match). |

---

### A2. Electronics SA Data

| Frontend field | API source | Status |
|---|---|---|
| `byDepartment[].{department, baseIncentive, achievementPct, multiplier, finalPayout}` | `GET /api/incentives?employeeId=X&vertical=ELECTRONICS` returns `departments[]` with `{department, target, actual, achievementPct}` but **not** per-dept baseIncentive/multiplier/finalPayout. Overall `currentStanding` has total base + final. | **MISSING** — per-department incentive breakdown. The ledger stores one row per employee, not per department. Need to either (a) enhance `calculationDetails` JSON in ledger to store per-dept breakdown, or (b) recompute client-side from sales + slabs + multiplier tiers. |
| `todayEarned` | `recentSales[]` has per-transaction `incentiveEarned`. | derivable — filter recentSales by today's date, sum incentiveEarned. |
| `monthToDateEarned` | `currentStanding.finalIncentive` | available (rename). |
| `monthlyGoalTarget` | `currentStanding.storeTarget` | available (rename). Not per-employee target; it's store-level. |
| `lastMonthPayout` | No historical ledger query. | **MISSING** — need endpoint or query param for previous period. |
| `nextPayoutDate` | Not in any response. | **MISSING** — business config, not in DB. Hardcode or add config endpoint. |
| `streak.{current, longest, lastActiveDay}` | Not in API. | **MISSING** — compute client-side from sales data, or add endpoint. |
| `myRank.{rank, deltaAbove, top[]}` | Store detail `employees[]` has `{employeeId, finalIncentive}`. Dashboard `topPerformers` is org-wide top 10. | derivable — sort store employees by finalIncentive, compute rank + delta. |
| `milestones[].{threshold, crossed}` | Not in API. | **MISSING** — purely gamification; define thresholds client-side, check against MTD earned. |
| `ineligibleReason` | Employee's `payrollStatus` in master. Store detail `employees[]` has role but not payrollStatus. | partial — need payrollStatus from employee master endpoint. |
| `electronicsMultiplierTiers[]` | `GET /api/rules?vertical=ELECTRONICS` → plan's `achievementMultipliers[]` | available — map `{achievementFrom, achievementTo, multiplierPct}` to `{gateFromPct, gateToPct, multiplier}`. |
| `electronicsBaseSlabs[]` | `GET /api/rules?vertical=ELECTRONICS` → plan's `productIncentiveSlabs[]` | available — map fields. |
| `electronicsTargetsRD3675[]` | `GET /api/targets?vertical=ELECTRONICS` + storeCode filter | available — map `{department, productFamilyName, targetValue}`. |
| `electronicsActualsRD3675[]` | `GET /api/incentives?storeCode=X&vertical=ELECTRONICS` → `departments[]` | available — map `{department, actual, achievementPct}`. |
| `transactionsByEmployee[empId][]` | `GET /api/sales?employeeId=X&vertical=ELECTRONICS` | available — field mapping needed (see A7). |

---

### A3. Grocery SA Data

| Frontend field | API source | Status |
|---|---|---|
| `campaignId, campaignName, start/end dates` | `GET /api/rules?vertical=GROCERY` → `campaignConfigs[0]` | available |
| `targetSalesValue` | `currentStanding.storeTarget` or campaign `storeTargets[].targetValue` | available |
| `actualSalesValue` | `currentStanding.storeActual` | available |
| `achievementPct` | `currentStanding.achievementPct` | available |
| `piecesSoldTotal` | `currentStanding.totalPiecesSold` | available |
| `appliedRate` | `currentStanding.currentRate` | available |
| `totalStoreIncentive` | `currentStanding.totalStorePayout` | available |
| `staffCount` | `currentStanding.employeeCount` | available |
| `individualPayout` | `currentStanding.yourPayout` | available |
| `lastCampaignPayoutPerEmp` | Not in API (no prior-period query). | **MISSING** |
| `nextPayoutDate` | Not in API. | **MISSING** |
| `streak` | Not in API. | **MISSING** — same as Electronics. |
| `myRank` (by pieces) | Not in API. Store detail `employees[]` doesn't have pieces-sold. | **MISSING** — need pieces-sold per employee, or new endpoint. |
| `projections[]` (what-if scenarios) | `payoutSlabs[]` from rules + current actual → can compute. | derivable — calculate from slabs + targets. |
| `campaignLeaderboard[]` (cross-store) | Not in API. Would need multi-store campaign query. | **MISSING** — need new endpoint aggregating all stores in a campaign. |
| `groceryCampaign.payoutSlabs[]` | `GET /api/rules?vertical=GROCERY` → `campaignConfigs[0].payoutSlabs[]` | available |
| `groceryCampaign.eligibleArticles[]` | `GET /api/rules?vertical=GROCERY` → `campaignConfigs[0].articles[]` | available |

---

### A4. F&L SA Data

| Frontend field | API source | Status |
|---|---|---|
| `weekStart, weekEnd` | `currentStanding` period, or `weeks[0].periodStart/End` | available |
| `weeklySalesTarget` | `currentStanding.weeklyTarget` | available |
| `actualWeeklyGrossSales` | `currentStanding.weeklyActual` | available |
| `storeQualifies` | `currentStanding.exceeded` | available (rename) |
| `totalStoreIncentive` | `currentStanding.storePool` | available (rename) |
| `staffing.{sms, dms, eligibleSaCount}` | `currentStanding.eligibleSAs` exists. SM/DM counts not directly returned. | partial — `eligibleSAs` available; SM/DM counts derivable from employee master if available. |
| `split.{saPoolPct, smSharePct, dmSharePctEach}` | `currentStanding.roleSplit` | available |
| `saPayoutEach` | `currentStanding.yourPayout` (for the logged-in SA). | available for self. For SM view of all employees: **MISSING**. |
| `smPayout, dmPayoutEach` | Not returned per-role. | derivable — `storePool * roleSplit.smSharePct` etc. |
| `employees[].{employeeId, role, daysPresent, eligible, payout}` | Store detail `employees[]` has `{employeeId, role, finalIncentive}`. No `daysPresent`. | **MISSING** — attendance data not in store detail response. |
| `lastWeekSaPayout` | `weeks[]` array has historical data. | derivable — `weeks[1].payout` (previous week). |
| `nextPayoutDate` | Not in API. | **MISSING** |
| `recentWeeks[]` | Employee detail `weeks[]` | available — map fields. |
| `streak` | Not in API. | **MISSING** |
| `myRank` (by units) | Not in API. | **MISSING** |
| `fnlWeeklyRules.splitMatrix[]` | `GET /api/rules?vertical=FNL` → plan's `fnlRoleSplits[]` | available |
| `fnlWeeklyRules.minWorkingDays` | Plan `config` JSON field (if populated). | partial — check `config` field, else hardcode (5). |

---

### A5. SM/DM Data

| Frontend field | API source | Status |
|---|---|---|
| Store summary: `totalTarget, totalActual, totalPayout, achievementPct` | `GET /api/incentives?storeCode=X` → storeDetail `summary` | available |
| `departments[]` with target/actual/achievement | storeDetail `departments[]` | available |
| `employees[]` with individual payouts | storeDetail `employees[]` → `{employeeId, employeeName, role, baseIncentive, multiplierPct, achievementPct, finalIncentive}` | available — needs payrollStatus enrichment from employee master. |
| F&L `employees[].daysPresent` | Not in storeDetail. | **MISSING** — need attendance aggregation. |
| Grocery projections for SM | `payoutSlabs` from rules + current standing. | derivable |
| Employee detail drawer: full employee record | Partially in storeDetail. Full record needs employee master endpoint. | partial |

---

### A6. BA Data

| Frontend field | API source | Status |
|---|---|---|
| `brand` | From employee master (brandRep field). | **MISSING** — employee master doesn't have `brandRep` in Prisma schema. |
| `unitsSold` | `GET /api/sales?employeeId=X` → count/sum transactions. | derivable |
| `grossValue` | `GET /api/sales?employeeId=X` → sum grossAmount. | derivable |
| `topSkus[]` (sku, family, units) | `GET /api/sales?employeeId=X` → group by articleCode. | derivable |

---

### A7. Central Data

| Frontend field | API source | Status |
|---|---|---|
| `totals.organisationPayoutMTD` | `GET /api/dashboard` → `stats.totalIncentiveMtd` | available |
| `totals.employeesEligible` | `stats.totalEmployees` | available (approximate — includes all, not just eligible). |
| `totals.storesWithPayout` | `stats.stores` | available (all stores, not filtered to "with payout"). |
| `totals.storesBelowGate` | `alerts.belowThresholdStores` | available |
| `byVertical[]` | `verticalBreakdown[]` | available — map `{salesMtd→payoutMTD}` etc. Field name mismatch: API has `incentiveEarned`, frontend wants `payoutMTD`. |
| `byState[]` | Not in dashboard. City-level drill-down exists via `/api/incentives`. | **MISSING** — need state-level aggregation. Can derive from city-level by grouping. |
| `topStores[]` | Not in dashboard (has `topPerformers` = employees). | **MISSING** — need top-stores-by-payout endpoint. Can derive from store-level incentives drill-down. |
| `allStores[]` (full directory with payout/achievement) | Not in API. | **MISSING** — combine `/api/sales/filters` stores + `/api/incentives` store-level data. Needs new endpoint or multi-call. |
| `flags[]` (anomaly alerts) | `alerts.belowThresholdList[]` gives low-achievement stores. No generic flags. | partial — can map `belowThresholdList` to flags. Full anomaly detection is **MISSING**. |
| Rule catalog: `electronicsRuleMeta, groceryCampaign.ruleMeta, fnlWeeklyRules.ruleMeta` | `GET /api/rules` returns all plans with status, version, creator, etc. | available — map plan fields to ruleMeta shape. |
| `makerCheckerLog[]` | `GET /api/approvals?tab=history` → audit logs. | available — map fields. |

---

### A8. Transactions / History

| Frontend field | API source | Status |
|---|---|---|
| `transactionsByEmployee[empId][]` — all 18+ fields | `GET /api/sales?employeeId=X` → `rows[]` | available — field mapping: API `grossAmount` → frontend `grossAmount`, API `incentiveAmount` → frontend `finalIncentive`, etc. Missing: `baseIncentive`, `multiplierApplied`, `productFamily`, `productFamilyCode` as separate fields. API has `calculatedIncentive` (formatted string) and `incentiveAmount` (number). |
| `transactionsByStore[storeCode]` (count) | `GET /api/sales?storeCode=X` → `rows.length` (capped at 500). | partial — count is capped. Acceptable for display. |

---

### A9. Gamification

| Frontend field | API source | Status |
|---|---|---|
| `streak.{current, longest, lastActiveDay}` | None. | **MISSING** — compute client-side from sales history. Reuse existing `computeStreak()` service with API sales data as input. |
| `milestones[].{threshold, crossed}` | None. | **MISSING** — define thresholds in frontend config, check against MTD earned from API. |
| `LEVEL_TIERS[]` + `tierFor(mtdPayout)` | None. | Keep client-side — pure config + function. |
| `badgesByEmployee[]` | None. | **MISSING** — keep as client-side rules engine. Evaluate badges from API data (streak length, multiplier tier reached, etc.). |
| `questsByEmployee[]` | None. | **MISSING** — keep as client-side rules engine. Derive quest progress from API data (dept achievement %, store gate %). |

---

## Part B: Gap Summary

### B1. New Backend Endpoints Needed

| # | Endpoint | Purpose | Priority |
|---|---|---|---|
| G1 | `GET /api/employees?storeCode=X` | Full employee master records (role, payrollStatus, dateOfJoining, dept). Used by every persona. | **P0 — Blocker** |
| G2 | `GET /api/stores?storeCode=X` or `GET /api/stores` | Full store master records (format, state, city, status, operationalSince). Used by every persona. | **P0 — Blocker** |
| G3 | `GET /api/attendance?storeCode=X&weekStart=Y` | Attendance summary per employee for F&L eligibility. SM/DM needs this for roster. | **P1 — F&L feature** |
| G4 | `GET /api/incentives/leaderboard?storeCode=X&vertical=Y` | Store-level employee ranking with pieces/earnings + rank deltas. | **P2 — Gamification** |
| G5 | `GET /api/incentives/campaign-leaderboard?campaignId=X` | Cross-store campaign ranking for Grocery. | **P2 — Grocery feature** |

### B2. Backend Enhancements Needed

| # | Enhancement | Purpose | Priority |
|---|---|---|---|
| E1 | Employee detail: add per-department incentive breakdown (Electronics) | Frontend shows byDepartment[].{baseIncentive, multiplier, finalPayout}. Currently only has overall total. Either store in `calculationDetails` JSON or add a `/api/incentives?employeeId=X&department=Y` level. | **P1 — Core feature** |
| E2 | Employee master: add `primaryDepartment` field to EmployeeMaster schema | Electronics SAs are assigned to departments. | **P1** |
| E3 | Employee master: add `brandRep` field to EmployeeMaster schema | BA persona needs to know which brand they represent. | **P1** |
| E4 | Store detail (F&L): include attendance days per employee | SM roster needs `daysPresent` per employee for F&L. | **P1** |
| E5 | Add `periodStart` param to employee detail for historical queries | To get `lastMonthPayout` / `lastWeekPayout`. | **P1** |
| E6 | Dashboard: add store-level top performers (not just employees) | Central view needs `topStores[]`. | **P2** |
| E7 | Sales response: return `productFamilyCode`, `productFamily` as fields | History screen needs these for Electronics transactions. | **P1** |

### B3. Client-Side Derivations (no backend changes)

| # | Data point | How to derive | Priority |
|---|---|---|---|
| D1 | `todayEarned` | Filter `recentSales[]` by today's date, sum `incentiveEarned`. | P0 |
| D2 | `projections[]` (Grocery what-if) | Take `payoutSlabs` + `storeTarget` + `employeeCount`, compute payout at each slab threshold. | P1 |
| D3 | `streak` | Feed API sales data into existing `computeStreak()` service. | P1 |
| D4 | `myRank` (Electronics) | Sort store employees by `finalIncentive` desc, find self, compute delta to rank above. | P1 |
| D5 | `milestones` | Define thresholds in config, compare against `currentStanding.finalIncentive`. | P2 |
| D6 | `badges` | Evaluate rules against API data (streak > 7 = badge, multiplier = 1.2 = badge, etc.). | P2 |
| D7 | `quests` | Evaluate rules against dept achievement %, store gates, etc. | P2 |
| D8 | `BA contributions` | `GET /api/sales?employeeId=X`, group by articleCode, sum quantity/grossAmount. | P1 |
| D9 | `smPayout / dmPayoutEach` (F&L) | `storePool * roleSplit.smSharePct` / `roleSplit.dmSharePerDmPct`. | P0 |
| D10 | `lastWeekSaPayout` (F&L) | `weeks[1].payout` from employee detail. | P0 |
| D11 | `Central byState[]` | Call `/api/incentives` at city level, group response rows by `state`. | P1 |
| D12 | `Central allStores[]` | Call `/api/incentives` at store level (no city filter), returns all stores with payout/achievement. | P1 |
| D13 | `Central flags[]` | Map `alerts.belowThresholdList` to flags format. For richer alerts, compute client-side from vertical breakdown. | P2 |
| D14 | `nextPayoutDate` | Hardcode business rule: Electronics/Grocery = 7th of next month; F&L = following Monday. Or add to plan config. | P0 |
| D15 | `Persona list` | Build from employee master: each employee with their role + vertical + store → persona entry. | P0 |

---

## Part C: Implementation Plan

### Phase 1: Foundation (API Client + Providers)

---

### Task 1: Create API client module

**Files:**
- Create: `src/api/client.js`
- Modify: `webpack.config.js` (already has env support)

- [ ] **Step 1: Create the axios client singleton**

```js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.error || err.message;
    return Promise.reject(new Error(message));
  }
);

export default api;
```

- [ ] **Step 2: Verify .env.dev has the right base URL**

Check `.env.dev` for `REACT_APP_API_BASE_URL`. If not set, add:
```
REACT_APP_API_BASE_URL=http://localhost:3000/api
```
Note: incentive-os-poc runs on port 3000 (Next.js default). The Incentive App dev server also uses 3000 — one of them needs a different port. Update Incentive App's webpack config to use 3001:
```js
devServer: {
  port: 3001,
  // ...
}
```

- [ ] **Step 3: Commit**

```bash
git add src/api/client.js
git commit -m "feat(api): add axios client singleton with interceptor"
```

---

### Task 2: Create per-domain API modules

**Files:**
- Create: `src/api/employees.js`
- Create: `src/api/stores.js`
- Create: `src/api/incentives.js`
- Create: `src/api/sales.js`
- Create: `src/api/rules.js`
- Create: `src/api/dashboard.js`

- [ ] **Step 1: Create employee API module**

```js
import api from './client';

export async function fetchEmployees(storeCode) {
  // Until G1 endpoint exists, use sales/filters as fallback
  const { employees } = await api.get('/employees', { params: { storeCode } });
  return employees;
}

export async function fetchEmployee(employeeId) {
  const { employee } = await api.get(`/employees/${employeeId}`);
  return employee;
}
```

- [ ] **Step 2: Create store API module**

```js
import api from './client';

export async function fetchStores(params = {}) {
  const { stores } = await api.get('/stores', { params });
  return stores;
}

export async function fetchStore(storeCode) {
  const { store } = await api.get(`/stores/${storeCode}`);
  return store;
}
```

- [ ] **Step 3: Create incentives API module**

```js
import api from './client';

export async function fetchIncentives(params = {}) {
  return api.get('/incentives', { params });
}

// Convenience wrappers for each drill-down level
export async function fetchEmployeeIncentive(employeeId, vertical, periodStart, periodEnd) {
  return api.get('/incentives', {
    params: { employeeId, vertical, periodStart, periodEnd },
  });
}

export async function fetchStoreIncentive(storeCode, vertical, periodStart, periodEnd) {
  return api.get('/incentives', {
    params: { storeCode, vertical, periodStart, periodEnd },
  });
}

export async function fetchCityIncentives(vertical) {
  return api.get('/incentives', { params: { vertical } });
}
```

- [ ] **Step 4: Create sales API module**

```js
import api from './client';

export async function fetchSales(params = {}) {
  const { rows } = await api.get('/sales', { params });
  return rows;
}

export async function fetchSalesFilters() {
  return api.get('/sales/filters');
}
```

- [ ] **Step 5: Create rules API module**

```js
import api from './client';

export async function fetchRules(vertical) {
  const { plans } = await api.get('/rules', { params: { vertical } });
  return plans;
}
```

- [ ] **Step 6: Create dashboard API module**

```js
import api from './client';

export async function fetchDashboard(vertical) {
  return api.get('/dashboard', { params: { vertical } });
}
```

- [ ] **Step 7: Commit**

```bash
git add src/api/
git commit -m "feat(api): add per-domain API modules for all endpoints"
```

---

### Task 3: Create useAsync data-fetching hook

**Files:**
- Create: `src/hooks/useAsync.js`

- [ ] **Step 1: Write the hook**

```js
import { useState, useEffect, useCallback } from 'react';

export default function useAsync(asyncFn, deps = [], { immediate = true } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(immediate);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn(...args);
      setData(result);
      return result;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (immediate) execute();
  }, [execute, immediate]);

  return { data, error, loading, execute };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useAsync.js
git commit -m "feat(hooks): add useAsync data-fetching hook"
```

---

### Task 4: Create data transformation layer

This is the critical layer that maps API response shapes to the shapes the UI currently expects. Each transformer is a pure function: API response in, frontend-compatible object out.

**Files:**
- Create: `src/api/transformers/electronics.js`
- Create: `src/api/transformers/grocery.js`
- Create: `src/api/transformers/fnl.js`
- Create: `src/api/transformers/central.js`
- Create: `src/api/transformers/transactions.js`

- [ ] **Step 1: Create Electronics transformer**

```js
import { computeStreak } from '@/services/GamificationEngine/computeStreak';

/**
 * Maps the API employeeDetail (ELECTRONICS) response to the payout shape
 * that ElectronicsView expects.
 *
 * @param {object} detail - API response from /api/incentives?employeeId=X&vertical=ELECTRONICS
 * @param {object[]} storeEmployees - from /api/incentives?storeCode=X (storeDetail.employees[])
 * @param {object[]} salesRows - from /api/sales?employeeId=X (for streak + today)
 * @param {object|null} prevPeriod - API response for previous month (for lastMonthPayout)
 * @returns {object} payout object matching electronicsPayoutsRD3675[] shape
 */
export function transformElectronicsPayout(detail, storeEmployees, salesRows, prevPeriod) {
  const { currentStanding, departments, multiplierTiers, recentSales, employee } = detail;

  if (!currentStanding) return null;

  // --- byDepartment (E1 enhancement provides per-dept; until then, use dept actuals + overall multiplier) ---
  const overallMultiplier = currentStanding.currentMultiplierPct / 100;
  const byDepartment = departments.map((d) => ({
    department: d.department,
    baseIncentive: 0, // Placeholder until E1 is built; not individually available yet
    achievementPct: d.achievementPct,
    multiplier: overallMultiplier,
    finalPayout: 0, // Placeholder
    note: d.achievementPct < 85 ? 'Below 85% — zero' : null,
  }));

  // --- todayEarned (D1) ---
  const today = new Date().toISOString().slice(0, 10);
  const todayEarned = recentSales
    .filter((s) => s.date === today)
    .reduce((sum, s) => sum + (s.incentiveEarned || 0), 0);

  // --- streak (D3) ---
  const streakInput = salesRows.map((s) => ({
    earned: s.incentiveAmount || 0,
    soldAt: s.transactionDate,
  }));
  const streakResult = computeStreak(streakInput, new Date(), 'Asia/Kolkata');
  const streak = {
    current: streakResult.current,
    longest: streakResult.longest,
    lastActiveDay: streakResult.lastQualifyingDay,
    kind: 'working-days-active',
    label: 'working days',
    caption: 'present + selling',
  };

  // --- myRank (D4) ---
  const sorted = [...storeEmployees].sort((a, b) => b.finalIncentive - a.finalIncentive);
  const myIdx = sorted.findIndex((e) => e.employeeId === employee.employeeId);
  const myRank = {
    rank: myIdx + 1,
    deltaAbove: myIdx > 0 ? sorted[myIdx - 1].finalIncentive - sorted[myIdx].finalIncentive : 0,
    scope: 'store',
    top: sorted.slice(0, 5).map((e, i) => ({
      rank: i + 1,
      name: e.employeeName,
      earned: e.finalIncentive,
      isSelf: e.employeeId === employee.employeeId,
    })),
  };

  // --- milestones (D5) ---
  const mtd = currentStanding.finalIncentive;
  const thresholds = [1000, 3000, 5000, 10000];
  const milestones = thresholds.map((t) => ({
    id: `MS-${t}`,
    threshold: t,
    label: `\u20B9${t.toLocaleString('en-IN')} this month`,
    crossed: mtd >= t,
  }));

  // --- nextPayoutDate (D14) ---
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 7);
  const nextPayoutDate = nextMonth.toISOString().slice(0, 10);

  return {
    employeeId: employee.employeeId,
    byDepartment,
    todayEarned,
    monthToDateEarned: currentStanding.finalIncentive,
    monthlyGoalTarget: currentStanding.storeTarget,
    lastMonthPayout: prevPeriod?.currentStanding?.finalIncentive ?? 0,
    nextPayoutDate,
    streak,
    myRank,
    milestones,
    ineligibleReason: null, // Derive from payrollStatus when employee master is available
  };
}

/**
 * Maps API multiplier tiers to frontend shape.
 */
export function transformMultiplierTiers(apiTiers) {
  return apiTiers.map((t) => ({
    gateFromPct: Number(t.achievementFrom ?? t.from),
    gateToPct: Number(t.achievementTo ?? t.to),
    multiplier: Number(t.multiplierPct ?? t.multiplierPct) / 100,
    label: '',
  }));
}
```

- [ ] **Step 2: Create Grocery transformer**

```js
/**
 * Maps the API employeeDetail (GROCERY) response to the payout shape
 * that GroceryView expects.
 */
export function transformGroceryPayout(detail, campaignConfig, salesRows) {
  const { currentStanding, payoutSlabs, employee } = detail;

  if (!currentStanding) return null;

  // --- projections (D2) ---
  const projections = payoutSlabs
    .filter((s) => Number(s.from) >= 100)
    .map((slab) => {
      const scenarioPct = Number(slab.from);
      const atSalesValue = (currentStanding.storeTarget * scenarioPct) / 100;
      const estPieces = Math.round(
        currentStanding.totalPiecesSold * (scenarioPct / currentStanding.achievementPct)
      );
      const rate = Number(slab.rate);
      const estTotalIncentive = estPieces * rate;
      return {
        scenario: `Hit ${scenarioPct}%`,
        atSalesValue,
        rate,
        estTotalIncentive,
        estPerEmployee: Math.round(estTotalIncentive / currentStanding.employeeCount),
      };
    });

  return {
    campaignId: campaignConfig?.id || null,
    storeCode: employee.storeCode,
    targetSalesValue: currentStanding.storeTarget,
    actualSalesValue: currentStanding.storeActual,
    achievementPct: currentStanding.achievementPct,
    piecesSoldTotal: currentStanding.totalPiecesSold,
    appliedRate: currentStanding.currentRate,
    totalStoreIncentive: currentStanding.totalStorePayout,
    staffCount: currentStanding.employeeCount,
    individualPayout: currentStanding.yourPayout,
    lastCampaignPayoutPerEmp: 0, // Requires E5 (historical query)
    nextPayoutDate: computeNextPayoutDate(),
    streak: computeStreakFromSales(salesRows),
    myRank: null, // Requires G4 (leaderboard endpoint)
    projections,
    campaignLeaderboard: [], // Requires G5
  };
}

function computeNextPayoutDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 7).toISOString().slice(0, 10);
}

function computeStreakFromSales(salesRows) {
  // Reuses computeStreak from GamificationEngine
  // (import and call — same pattern as Electronics transformer)
  return { current: 0, longest: 0, lastActiveDay: null, kind: 'working-days-active', label: 'working days', caption: 'present + selling' };
}
```

- [ ] **Step 3: Create F&L transformer**

```js
/**
 * Maps the API employeeDetail (FNL) response to the payout shape
 * that FnlView expects.
 */
export function transformFnlPayout(detail, ruleSplits, storeEmployees) {
  const { currentStanding, weeks, employee } = detail;

  if (!currentStanding) return null;

  const { roleSplit } = currentStanding;
  const storePool = currentStanding.storePool;

  return {
    weekStart: detail.period.start,
    weekEnd: detail.period.end,
    weeklySalesTarget: currentStanding.weeklyTarget,
    actualWeeklyGrossSales: currentStanding.weeklyActual,
    storeQualifies: currentStanding.exceeded,
    totalStoreIncentive: storePool,
    staffing: {
      sms: 0,  // Derive from employee master (count role === 'SM' in store)
      dms: 0,  // Derive from employee master (count role === 'DM' in store)
      eligibleSaCount: currentStanding.eligibleSAs,
    },
    split: {
      saPoolPct: Number(roleSplit.saPoolPct),
      smSharePct: Number(roleSplit.smSharePct),
      dmSharePctEach: Number(roleSplit.dmSharePerDmPct),
    },
    saPool: storePool * Number(roleSplit.saPoolPct),
    smPayout: storePool * Number(roleSplit.smSharePct),
    dmPayoutEach: storePool * Number(roleSplit.dmSharePerDmPct),
    saPayoutEach: currentStanding.yourPayout,
    lastWeekSaPayout: weeks?.[1]?.payout ?? 0,
    nextPayoutDate: computeNextMonday(detail.period.end),
    streak: { current: 0, longest: 0, lastActiveDay: null, kind: 'working-days-active', label: 'working days', caption: 'present + selling' },
    myRank: null, // Requires G4
    employees: [], // Requires G3 (attendance endpoint) for full roster
    recentWeeks: (weeks || []).map((w) => ({
      weekStart: w.periodStart,
      weekEnd: w.periodEnd,
      target: w.targetValue,
      actual: w.actualSales,
      storeQualified: w.actualSales > w.targetValue,
      totalIncentive: w.payout,
    })),
  };
}

function computeNextMonday(weekEnd) {
  const d = new Date(weekEnd);
  d.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7 || 7));
  return d.toISOString().slice(0, 10);
}
```

- [ ] **Step 4: Create Central transformer**

```js
/**
 * Maps the dashboard API response + incentives drill-down to the
 * centralReporting shape that CentralHome expects.
 */
export function transformCentralReporting(dashboardData, cityRows, storeRows, rulesData) {
  const { stats, alerts, verticalBreakdown, topPerformers } = dashboardData;

  // --- byState (D11) ---
  const stateMap = {};
  (cityRows || []).forEach((row) => {
    if (!stateMap[row.state]) {
      stateMap[row.state] = { state: row.state, stores: 0, payoutMTD: 0, topStore: '' };
    }
    stateMap[row.state].stores += row.storeCount;
    stateMap[row.state].payoutMTD += row.totalIncentive;
  });
  const byState = Object.values(stateMap);

  // --- allStores (D12) ---
  const allStores = (storeRows || []).map((s) => ({
    storeCode: s.storeCode,
    storeName: s.storeName,
    vertical: s.vertical,
    format: s.storeFormat,
    state: '', // Not in store-level response; enrich from store master if available
    city: '',
    payoutMTD: s.totalIncentive,
    achievementPct: s.achievementPct,
    status: 'ACTIVE',
    staffCount: s.employeeCount,
  }));

  // --- topStores ---
  const topStores = [...allStores]
    .sort((a, b) => b.payoutMTD - a.payoutMTD)
    .slice(0, 5);

  // --- flags (D13) ---
  const flags = (alerts.belowThresholdList || []).map((s, i) => ({
    id: `FLAG-${i}`,
    storeCode: s.storeCode,
    vertical: '',
    severity: s.achievementPct < 70 ? 'alert' : 'warn',
    message: `${s.storeName} at ${s.achievementPct}% achievement`,
  }));

  return {
    asOf: new Date().toISOString(),
    totals: {
      organisationPayoutMTD: stats.totalIncentiveMtd,
      employeesEligible: stats.totalEmployees,
      storesWithPayout: stats.stores,
      storesBelowGate: alerts.belowThresholdStores,
    },
    byVertical: verticalBreakdown.map((v) => ({
      vertical: v.vertical,
      stores: v.stores,
      employees: v.employees,
      payoutMTD: v.incentiveEarned,
      achievementAvgPct: v.avgAchievementPct,
    })),
    byState,
    topStores,
    allStores,
    flags,
  };
}
```

- [ ] **Step 5: Create transactions transformer**

```js
/**
 * Maps the sales API response rows to the transaction shape
 * that HistoryScreen and StoreTransactions expect.
 */
export function transformTransaction(apiRow) {
  return {
    transactionId: apiRow.transactionId,
    transactionDate: apiRow.transactionDate,
    storeCode: apiRow.storeCode,
    vertical: apiRow.vertical,
    storeFormat: '', // Not in sales response; enrich from store master
    employeeId: apiRow.employeeId,
    department: apiRow.department === '—' ? null : apiRow.department,
    articleCode: apiRow.articleCode,
    productFamilyCode: null, // Requires E7
    brand: apiRow.brand === '—' ? null : apiRow.brand,
    productFamily: null, // Requires E7
    quantity: apiRow.quantity,
    grossAmount: apiRow.grossAmount,
    taxAmount: apiRow.taxAmount,
    totalAmount: apiRow.totalAmount,
    transactionType: apiRow.transactionType,
    channel: apiRow.channel,
    baseIncentive: null, // Not individually available
    multiplierApplied: null, // Not individually available
    finalIncentive: apiRow.incentiveAmount,
    note: apiRow.status === 'Excluded' ? 'Excluded' : null,
  };
}

export function transformTransactions(apiRows) {
  return apiRows.map(transformTransaction);
}
```

- [ ] **Step 6: Commit**

```bash
git add src/api/transformers/
git commit -m "feat(api): add response transformers for all verticals and central"
```

---

### Phase 2: Data Providers (Replace Static Imports)

---

### Task 5: Create PersonaContext v2 (API-driven)

Replace the static persona list with one derived from employee master data.

**Files:**
- Modify: `src/context/PersonaContext.jsx`

- [ ] **Step 1: Update PersonaContext to fetch employees and stores from API**

The new context will:
1. Fetch employees and stores from the API on mount
2. Build personas dynamically from employee records
3. Maintain backward-compatible context shape (personas, active, employee, store)
4. Expose loading/error state

```js
import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { fetchEmployees } from '../api/employees';
import { fetchStores } from '../api/stores';

const PersonaCtx = createContext(null);

function buildPersonas(employees, stores) {
  return employees.map((emp) => {
    const store = stores.find((s) => s.storeCode === emp.storeCode);
    const verticalLabel = emp.vertical || store?.vertical || '';
    return {
      id: `p-${emp.employeeId}`,
      employeeId: emp.employeeId,
      employeeName: emp.employeeName,
      role: emp.role,
      vertical: store?.vertical || null,
      storeCode: emp.storeCode,
      badge: `${emp.role} \u00B7 ${verticalLabel}`,
      tagline: `${emp.role} \u00B7 ${store?.storeName || ''}`,
      color: emp.role === 'SA' ? 'crimson' : emp.role === 'SM' || emp.role === 'DM' ? 'navy' : 'saffron',
    };
  });
}

export function PersonaProvider({ children }) {
  const [employees, setEmployees] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [isSwitcherOpen, setSwitcherOpen] = useState(false);

  useEffect(() => {
    Promise.all([fetchEmployees(), fetchStores()])
      .then(([emps, strs]) => {
        setEmployees(emps);
        setStores(strs);
        if (emps.length > 0) setActiveId(`p-${emps[0].employeeId}`);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const personas = useMemo(() => buildPersonas(employees, stores), [employees, stores]);
  const active = useMemo(() => personas.find((p) => p.id === activeId) || personas[0] || null, [personas, activeId]);
  const employee = useMemo(() => employees.find((e) => e.employeeId === active?.employeeId) || null, [employees, active]);
  const store = useMemo(() => stores.find((s) => s.storeCode === active?.storeCode) || null, [stores, active]);

  const switchTo = useCallback((id) => setActiveId(id), []);
  const openSwitcher = useCallback(() => setSwitcherOpen(true), []);
  const closeSwitcher = useCallback(() => setSwitcherOpen(false), []);

  const value = useMemo(
    () => ({ personas, active, employee, store, loading, error, isSwitcherOpen, openSwitcher, closeSwitcher, switchTo }),
    [personas, active, employee, store, loading, error, isSwitcherOpen, openSwitcher, closeSwitcher, switchTo]
  );

  return <PersonaCtx.Provider value={value}>{children}</PersonaCtx.Provider>;
}

export function usePersona() {
  const ctx = useContext(PersonaCtx);
  if (!ctx) throw new Error('usePersona must be inside PersonaProvider');
  return ctx;
}
```

- [ ] **Step 2: Add loading gate in App.jsx**

Containers should not render until persona data loads. Add a loading check:

```jsx
// In App.jsx, the PersonaProvider now handles loading internally.
// Containers should check `loading` from usePersona() and show a spinner.
```

- [ ] **Step 3: Commit**

```bash
git add src/context/PersonaContext.jsx
git commit -m "feat(context): make PersonaContext API-driven with dynamic persona generation"
```

---

### Task 6: Create vertical data hooks

These hooks replace the static `import { electronicsPayoutsRD3675 } from '../data/payouts'` pattern with API-driven async data.

**Files:**
- Create: `src/hooks/useElectronicsData.js`
- Create: `src/hooks/useGroceryData.js`
- Create: `src/hooks/useFnlData.js`
- Create: `src/hooks/useCentralData.js`

- [ ] **Step 1: Create useElectronicsData hook**

```js
import { useState, useEffect } from 'react';
import { fetchEmployeeIncentive, fetchStoreIncentive } from '../api/incentives';
import { fetchSales } from '../api/sales';
import { fetchRules } from '../api/rules';
import { transformElectronicsPayout, transformMultiplierTiers } from '../api/transformers/electronics';

export default function useElectronicsData(employeeId, storeCode) {
  const [payout, setPayout] = useState(null);
  const [multiplierTiers, setMultiplierTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!employeeId || !storeCode) return;
    setLoading(true);

    Promise.all([
      fetchEmployeeIncentive(employeeId, 'ELECTRONICS'),
      fetchStoreIncentive(storeCode, 'ELECTRONICS'),
      fetchSales({ employeeId, vertical: 'ELECTRONICS' }),
      fetchRules('ELECTRONICS'),
    ])
      .then(([empDetail, storeDetail, salesRows, plans]) => {
        const storeEmployees = storeDetail.employees || [];
        const transformed = transformElectronicsPayout(empDetail, storeEmployees, salesRows, null);
        setPayout(transformed);

        const activePlan = plans.find((p) => p.status === 'ACTIVE');
        if (activePlan) {
          setMultiplierTiers(transformMultiplierTiers(activePlan.achievementMultipliers));
        }
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [employeeId, storeCode]);

  return { payout, multiplierTiers, loading, error };
}
```

- [ ] **Step 2: Create useGroceryData hook**

```js
import { useState, useEffect } from 'react';
import { fetchEmployeeIncentive } from '../api/incentives';
import { fetchSales } from '../api/sales';
import { fetchRules } from '../api/rules';
import { transformGroceryPayout } from '../api/transformers/grocery';

export default function useGroceryData(employeeId) {
  const [payout, setPayout] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);

    Promise.all([
      fetchEmployeeIncentive(employeeId, 'GROCERY'),
      fetchSales({ employeeId, vertical: 'GROCERY' }),
      fetchRules('GROCERY'),
    ])
      .then(([empDetail, salesRows, plans]) => {
        const activePlan = plans.find((p) => p.status === 'ACTIVE');
        const campaignConfig = activePlan?.campaignConfigs?.[0] || null;
        setCampaign(campaignConfig);
        setPayout(transformGroceryPayout(empDetail, campaignConfig, salesRows));
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [employeeId]);

  return { payout, campaign, loading, error };
}
```

- [ ] **Step 3: Create useFnlData hook**

```js
import { useState, useEffect } from 'react';
import { fetchEmployeeIncentive } from '../api/incentives';
import { fetchRules } from '../api/rules';
import { transformFnlPayout } from '../api/transformers/fnl';

export default function useFnlData(employeeId) {
  const [payout, setPayout] = useState(null);
  const [weeklyRules, setWeeklyRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);

    Promise.all([
      fetchEmployeeIncentive(employeeId, 'FNL'),
      fetchRules('FNL'),
    ])
      .then(([empDetail, plans]) => {
        const activePlan = plans.find((p) => p.status === 'ACTIVE');
        const splits = activePlan?.fnlRoleSplits || [];
        setWeeklyRules({
          splitMatrix: splits.map((s) => ({
            sms: s.numSms,
            dms: s.numDms,
            saPoolPct: Number(s.saPoolPct),
            smSharePct: Number(s.smSharePct),
            dmSharePctEach: Number(s.dmSharePerDmPct),
          })),
          minWorkingDays: activePlan?.config?.minWorkingDays ?? 5,
        });
        setPayout(transformFnlPayout(empDetail, splits, []));
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [employeeId]);

  return { payout, weeklyRules, loading, error };
}
```

- [ ] **Step 4: Create useCentralData hook**

```js
import { useState, useEffect } from 'react';
import { fetchDashboard } from '../api/dashboard';
import { fetchIncentives } from '../api/incentives';
import { fetchRules } from '../api/rules';
import { transformCentralReporting } from '../api/transformers/central';

export default function useCentralData() {
  const [reporting, setReporting] = useState(null);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetchDashboard(),
      fetchIncentives({}),               // city-level (no filters)
      fetchIncentives({ city: '__all' }), // store-level (will need adjustment)
      fetchRules(),
    ])
      .then(([dashboard, cityData, storeData, allPlans]) => {
        const cityRows = cityData.level === 'city' ? cityData.rows : [];
        const storeRows = storeData.level === 'store' ? storeData.rows : [];
        setReporting(transformCentralReporting(dashboard, cityRows, storeRows, allPlans));
        setRules(allPlans);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { reporting, rules, loading, error };
}
```

- [ ] **Step 5: Commit**

```bash
git add src/hooks/
git commit -m "feat(hooks): add per-vertical data hooks replacing static imports"
```

---

### Phase 3: New Backend Endpoints (in incentive-os-poc)

---

### Task 7: Add employee master endpoint (G1)

**Files (in incentive-os-poc):**
- Create: `src/app/api/employees/route.ts`

- [ ] **Step 1: Create the route handler**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeCode = searchParams.get('storeCode');
    const employeeId = searchParams.get('employeeId');

    const where: Record<string, unknown> = {};
    if (storeCode) where.storeCode = storeCode;
    if (employeeId) where.employeeId = employeeId;

    const employees = await prisma.employeeMaster.findMany({
      where,
      include: { store: { select: { storeName: true, vertical: true } } },
      orderBy: { employeeName: 'asc' },
      take: 500,
    });

    return NextResponse.json({
      employees: employees.map((e) => ({
        employeeId: e.employeeId,
        employeeName: e.employeeName,
        role: e.role,
        storeCode: e.storeCode,
        storeName: e.store?.storeName ?? null,
        vertical: e.store?.vertical ?? null,
        payrollStatus: e.payrollStatus,
        dateOfJoining: e.dateOfJoining?.toISOString().slice(0, 10) ?? null,
        dateOfExit: e.dateOfExit?.toISOString().slice(0, 10) ?? null,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit (in incentive-os-poc repo)**

```bash
git add src/app/api/employees/route.ts
git commit -m "feat(api): add employee master endpoint with store/vertical join"
```

---

### Task 8: Add store master endpoint (G2)

**Files (in incentive-os-poc):**
- Create: `src/app/api/stores/route.ts`

- [ ] **Step 1: Create the route handler**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeCode = searchParams.get('storeCode');
    const vertical = searchParams.get('vertical');

    const where: Record<string, unknown> = {};
    if (storeCode) where.storeCode = storeCode;
    if (vertical) where.vertical = vertical;

    const stores = await prisma.storeMaster.findMany({
      where,
      include: { _count: { select: { employees: true } } },
      orderBy: { storeCode: 'asc' },
    });

    return NextResponse.json({
      stores: stores.map((s) => ({
        storeCode: s.storeCode,
        storeName: s.storeName,
        vertical: s.vertical,
        storeFormat: s.storeFormat,
        state: s.state,
        city: s.city,
        storeStatus: s.storeStatus,
        operationalSince: s.operationalSince?.toISOString().slice(0, 10) ?? null,
        staffCount: s._count.employees,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit (in incentive-os-poc repo)**

```bash
git add src/app/api/stores/route.ts
git commit -m "feat(api): add store master endpoint with employee count"
```

---

### Task 9: Add attendance summary endpoint (G3)

**Files (in incentive-os-poc):**
- Create: `src/app/api/attendance/route.ts`

- [ ] **Step 1: Create the route handler**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeCode = searchParams.get('storeCode');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    if (!storeCode || !dateFrom || !dateTo) {
      return NextResponse.json({ error: 'storeCode, dateFrom, dateTo required' }, { status: 400 });
    }

    const rows = await prisma.attendance.findMany({
      where: {
        storeCode,
        date: { gte: new Date(dateFrom), lte: new Date(dateTo) },
      },
      include: { employee: { select: { employeeName: true, role: true } } },
    });

    // Group by employee, count PRESENT days
    const byEmployee: Record<string, { employeeId: string; employeeName: string; role: string; daysPresent: number; totalDays: number }> = {};
    for (const r of rows) {
      if (!byEmployee[r.employeeId]) {
        byEmployee[r.employeeId] = {
          employeeId: r.employeeId,
          employeeName: r.employee.employeeName,
          role: r.employee.role,
          daysPresent: 0,
          totalDays: 0,
        };
      }
      byEmployee[r.employeeId].totalDays++;
      if (r.status === 'PRESENT') {
        byEmployee[r.employeeId].daysPresent++;
      }
    }

    return NextResponse.json({ attendance: Object.values(byEmployee) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit (in incentive-os-poc repo)**

```bash
git add src/app/api/attendance/route.ts
git commit -m "feat(api): add attendance summary endpoint grouped by employee"
```

---

### Phase 4: Wire Containers to API Hooks

---

### Task 10: Wire EmployeeHome to API data

**Files:**
- Modify: `src/containers/EmployeeHome/EmployeeHome.jsx`

- [ ] **Step 1: Replace static imports with hooks**

Remove:
```js
import { electronicsPayoutsRD3675, groceryPayoutT28V, fnlPayoutTRN0241 } from '../../data/payouts';
```

Add:
```js
import useElectronicsData from '../../hooks/useElectronicsData';
import useGroceryData from '../../hooks/useGroceryData';
import useFnlData from '../../hooks/useFnlData';
```

- [ ] **Step 2: Use hooks conditionally based on vertical**

```js
const { active, employee, store, loading: personaLoading } = usePersona();

// Only call the relevant hook (others get null employeeId, so they skip)
const isElec = active?.vertical === VERTICALS.ELECTRONICS;
const isGroc = active?.vertical === VERTICALS.GROCERY;
const isFnl = active?.vertical === VERTICALS.FNL;

const elec = useElectronicsData(isElec ? employee?.employeeId : null, isElec ? store?.storeCode : null);
const groc = useGroceryData(isGroc ? employee?.employeeId : null);
const fnl = useFnlData(isFnl ? employee?.employeeId : null);

const loading = personaLoading || elec.loading || groc.loading || fnl.loading;
const myPayout = isElec ? elec.payout : isGroc ? groc.payout : isFnl ? fnl.payout : null;
```

- [ ] **Step 3: Add loading/error UI**

```jsx
if (loading) return <div className="loading-spinner">Loading...</div>;
if (!myPayout) return <div className="empty-state">No incentive data available.</div>;
```

- [ ] **Step 4: Pass data to views (unchanged prop shape)**

The views (ElectronicsView, GroceryView, FnlView) receive the same `payout` prop shape they always have, thanks to the transformers. No view changes needed.

- [ ] **Step 5: Commit**

```bash
git add src/containers/EmployeeHome/EmployeeHome.jsx
git commit -m "feat(employee): wire EmployeeHome to API via data hooks"
```

---

### Task 11: Wire StoreManagerHome to API data

**Files:**
- Modify: `src/containers/StoreManagerHome/StoreManagerHome.jsx`

- [ ] **Step 1: Replace static imports with API calls**

Remove all imports from `../../data/payouts` and `../../data/configs`.

Add:
```js
import useAsync from '../../hooks/useAsync';
import { fetchStoreIncentive } from '../../api/incentives';
import { fetchEmployees } from '../../api/employees';
import { fetchRules } from '../../api/rules';
```

- [ ] **Step 2: Fetch store detail + employees from API**

```js
const { active, employee, store } = usePersona();

const storeDetail = useAsync(
  () => fetchStoreIncentive(store?.storeCode, active?.vertical),
  [store?.storeCode, active?.vertical]
);

const storeTeam = useAsync(
  () => fetchEmployees(store?.storeCode),
  [store?.storeCode]
);

const rules = useAsync(
  () => fetchRules(active?.vertical),
  [active?.vertical]
);
```

- [ ] **Step 3: Rebuild summary useMemo from API data**

The existing `useMemo` in StoreManagerHome already computes `summary` from data objects. Update it to use `storeDetail.data` instead of static imports. The storeDetail response already has `summary`, `departments[]`, and `employees[]` in the right shape for Electronics.

- [ ] **Step 4: Commit**

```bash
git add src/containers/StoreManagerHome/StoreManagerHome.jsx
git commit -m "feat(store-manager): wire StoreManagerHome to API data"
```

---

### Task 12: Wire CentralHome to API data

**Files:**
- Modify: `src/containers/CentralHome/CentralHome.jsx`

- [ ] **Step 1: Replace static imports with useCentralData hook**

Remove:
```js
import { centralReporting } from '../../data/payouts';
import { electronicsRuleMeta, groceryCampaign, fnlWeeklyRules } from '../../data/configs';
```

Add:
```js
import useCentralData from '../../hooks/useCentralData';
```

- [ ] **Step 2: Use the hook**

```js
const { reporting, rules, loading, error } = useCentralData();
```

Replace all `centralReporting.xxx` references with `reporting?.xxx`.

- [ ] **Step 3: Map rules to rule catalog display**

```js
const ruleCatalog = (rules || []).map((plan) => ({
  ruleId: `PLAN-${plan.id}`,
  name: plan.planName,
  version: plan.version,
  workflowState: plan.status,
  vertical: plan.vertical,
}));
```

- [ ] **Step 4: Commit**

```bash
git add src/containers/CentralHome/CentralHome.jsx
git commit -m "feat(central): wire CentralHome to dashboard + incentives API"
```

---

### Task 13: Wire BrandAssociateHome to API data

**Files:**
- Modify: `src/containers/BrandAssociateHome/BrandAssociateHome.jsx`

- [ ] **Step 1: Replace static imports with API-driven aggregation**

Remove:
```js
import { baContributionsRD3675 } from '../../data/payouts';
import { electronicsActualsRD3675 } from '../../data/configs';
```

Add:
```js
import useAsync from '../../hooks/useAsync';
import { fetchSales } from '../../api/sales';
```

- [ ] **Step 2: Fetch and aggregate BA's sales**

```js
const salesResult = useAsync(
  () => fetchSales({ employeeId: employee?.employeeId, vertical: 'ELECTRONICS' }),
  [employee?.employeeId]
);

const myContribution = useMemo(() => {
  if (!salesResult.data) return null;
  const rows = salesResult.data;
  const unitsSold = rows.reduce((sum, r) => sum + r.quantity, 0);
  const grossValue = rows.reduce((sum, r) => sum + r.grossAmount, 0);
  // Group by articleCode for topSkus
  const skuMap = {};
  rows.forEach((r) => {
    if (!skuMap[r.articleCode]) skuMap[r.articleCode] = { sku: r.articleCode, family: '', units: 0 };
    skuMap[r.articleCode].units += r.quantity;
  });
  const topSkus = Object.values(skuMap).sort((a, b) => b.units - a.units).slice(0, 5);
  return { brand: employee?.brandRep || 'N/A', unitsSold, grossValue, topSkus };
}, [salesResult.data, employee]);
```

- [ ] **Step 3: Commit**

```bash
git add src/containers/BrandAssociateHome/BrandAssociateHome.jsx
git commit -m "feat(ba): wire BrandAssociateHome to sales API with client-side aggregation"
```

---

### Task 14: Wire HistoryScreen to API data

**Files:**
- Modify: `src/containers/screens/HistoryScreen.jsx` (or wherever it lives)

- [ ] **Step 1: Replace static import with API call**

Remove:
```js
import { transactionsByEmployee } from '../../data/transactions';
```

Add:
```js
import useAsync from '../../hooks/useAsync';
import { fetchSales } from '../../api/sales';
import { transformTransactions } from '../../api/transformers/transactions';
```

- [ ] **Step 2: Fetch and transform**

```js
const salesResult = useAsync(
  () => fetchSales({ employeeId, vertical }).then(transformTransactions),
  [employeeId, vertical]
);
const transactions = salesResult.data || [];
```

- [ ] **Step 3: Commit**

```bash
git add src/containers/screens/HistoryScreen.jsx
git commit -m "feat(history): wire HistoryScreen to sales API"
```

---

### Phase 5: Gamification (Client-Side Compute from API Data)

---

### Task 15: Wire gamification to API-derived data

The gamification services (computeStreak, detectNewMilestones, etc.) already exist. They just need API data as input instead of mock data.

**Files:**
- Create: `src/hooks/useGamification.js`

- [ ] **Step 1: Create the hook**

```js
import { useMemo } from 'react';
import { computeStreak } from '../services/GamificationEngine/computeStreak';
import { computeGoalProgress } from '../services/GamificationEngine/computeGoalProgress';
import { detectNewMilestones } from '../services/GamificationEngine/detectNewMilestones';
import { LEVEL_TIERS, tierFor, badgesByEmployee, questsByEmployee } from '../data/gamification';

/**
 * Computes gamification state from live API data.
 * badges and quests remain config-driven for now (no backend storage).
 */
export default function useGamification(employeeId, salesRows, mtdEarned) {
  const streak = useMemo(() => {
    if (!salesRows?.length) return { current: 0, longest: 0, lastQualifyingDay: null };
    const input = salesRows.map((s) => ({
      earned: s.incentiveAmount ?? s.finalIncentive ?? 0,
      soldAt: s.transactionDate,
    }));
    return computeStreak(input, new Date(), 'Asia/Kolkata');
  }, [salesRows]);

  const tier = useMemo(() => tierFor(mtdEarned || 0), [mtdEarned]);

  const badges = badgesByEmployee[employeeId] || [];
  const quests = questsByEmployee[employeeId] || [];

  return { streak, tier, badges, quests };
}
```

Note: `badgesByEmployee` and `questsByEmployee` stay as static config for now. Making them dynamic requires defining badge/quest rules as evaluable conditions against API data — that's a future enhancement.

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useGamification.js
git commit -m "feat(gamification): add hook computing streak/tier from API sales data"
```

---

### Phase 6: CORS + Environment Configuration

---

### Task 16: Configure CORS on incentive-os-poc

**Files (in incentive-os-poc):**
- Create or Modify: `src/middleware.ts` or `next.config.js`

- [ ] **Step 1: Add CORS headers via Next.js middleware**

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const origin = req.headers.get('origin') || '';

  // Allow Incentive App dev server
  const allowed = ['http://localhost:3001', process.env.ALLOWED_ORIGIN].filter(Boolean);
  if (allowed.includes(origin)) {
    res.headers.set('Access-Control-Allow-Origin', origin);
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: res.headers });
  }

  return res;
}

export const config = {
  matcher: '/api/:path*',
};
```

- [ ] **Step 2: Commit (in incentive-os-poc repo)**

```bash
git add src/middleware.ts
git commit -m "feat(cors): allow Incentive App origin on all API routes"
```

---

### Task 17: Update Incentive App environment files

**Files:**
- Modify: `.env.dev`
- Modify: `webpack.config.js`

- [ ] **Step 1: Set API base URL in .env.dev**

```
REACT_APP_API_BASE_URL=http://localhost:3000/api
```

- [ ] **Step 2: Change Incentive App dev server port to 3001**

In `webpack.config.js`, change `port: 3000` to `port: 3001` to avoid conflict with incentive-os-poc's Next.js server.

- [ ] **Step 3: Commit**

```bash
git add .env.dev webpack.config.js
git commit -m "chore(env): set API base URL and move dev server to port 3001"
```

---

## Phase 7: Cleanup

---

### Task 18: Remove static data imports

Once all containers are wired to API hooks and verified working:

**Files:**
- Modify: all containers and views to remove any remaining `../../data/` imports
- Keep: `src/data/gamification.js` (badge/quest configs — no API equivalent yet)
- Keep: `src/data/masters.js` (enums only — `VERTICALS, ROLES, PAYROLL_STATUS` etc.)
- Delete or archive: `src/data/payouts.js`, `src/data/configs.js`, `src/data/transactions.js`, `src/data/personas.js`, `src/data/dummy.js`

- [ ] **Step 1: Audit all imports from src/data/**

```bash
grep -r "from.*data/" src/containers/ src/components/ src/context/ --include="*.jsx" --include="*.js"
```

- [ ] **Step 2: Replace remaining static references**

For each file still importing from `src/data/`, switch to the corresponding API hook or transformer.

- [ ] **Step 3: Delete unused data files**

```bash
rm src/data/payouts.js src/data/configs.js src/data/transactions.js src/data/personas.js src/data/dummy.js
```

Keep `masters.js` (for enums) and `gamification.js` (for badge/quest config).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove static mock data files, all data now API-driven"
```

---

## Execution Order & Dependencies

```
Phase 1: Foundation (Tasks 1-4)     ← No backend changes needed
    |
Phase 3: Backend (Tasks 7-9)        ← Can run in parallel with Phase 1
    |
Phase 2: Providers (Tasks 5-6)      ← Depends on Phase 1 + Phase 3 (G1, G2)
    |
Phase 6: CORS + Env (Tasks 16-17)   ← Must be done before testing
    |
Phase 4: Wire Containers (Tasks 10-14)  ← Depends on Phases 2 + 6
    |
Phase 5: Gamification (Task 15)     ← Depends on Phase 4
    |
Phase 7: Cleanup (Task 18)          ← Last, after everything verified
```

**Critical path:** Tasks 1 → 7 → 8 → 5 → 16 → 17 → 10 → 11 → 12

---

## Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| CORS issues between localhost:3001 and localhost:3000 | Blocks all API calls | Task 16 addresses this; also consider webpack devServer proxy as fallback |
| Prisma Decimal serialization (returns objects not numbers) | NaN in UI calculations | Transformers must call `Number()` on all Decimal fields |
| 500-row cap on API responses | Missing data for large stores | Acceptable for POC; add pagination later |
| API rate (multiple parallel fetches per page load) | Slow initial render | Consider batching or a BFF endpoint that returns all data for a persona in one call |
| Hardcoded April 2026 date in backend | Data only exists for April 2026 | Use same date range in frontend queries; make configurable later |
| Employee master missing primaryDepartment and brandRep | Electronics dept display and BA brand broken | Tasks E2, E3 in gap list; add fields to Prisma schema |

---

## Mock Data Fallback Strategy

During development, support both modes via `REACT_APP_USE_MOCK_DATA` env var:

```js
// In each data hook, e.g. useElectronicsData.js
import { electronicsPayoutsRD3675 } from '../data/payouts';

const useMock = process.env.REACT_APP_USE_MOCK_DATA === 'true';

export default function useElectronicsData(employeeId, storeCode) {
  // ...existing hook code...

  // Mock mode: return static data immediately
  if (useMock) {
    const mockPayout = electronicsPayoutsRD3675.find((p) => p.employeeId === employeeId);
    return { payout: mockPayout, multiplierTiers: electronicsMultiplierTiers, loading: false, error: null };
  }

  // ...API mode...
}
```

This allows incremental migration: switch one vertical at a time from mock to API.
