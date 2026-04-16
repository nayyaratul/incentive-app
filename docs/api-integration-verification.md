# API Integration Verification — Incentive App ↔ incentive-os-poc

**Date:** 2026-04-15
**Incentive App branch:** `feat/api-integration`
**Backend source:** `/Users/atulnayyar/Projects/incentive-os-poc`

This document compares every API call the Incentive App makes against the actual Next.js route handlers in `incentive-os-poc`, at the field level. Findings are ordered by severity.

---

## Verdict at a glance

| Area | Status | Severity |
|---|---|---|
| Auth (login, me) | Aligned | — |
| `/api/employees` — path-param variant | **Broken** | P0 |
| `/api/stores` — path-param variant | **Broken** | P0 |
| `/api/incentives` — vertical detail shape | **Fundamentally different contract** | P0 |
| `/api/incentives` — CENTRAL store-level call | **Both calls return city-level** | P0 |
| `/api/leaderboard` — auth mechanism | **Different auth; 401 guaranteed** | P0 |
| `/api/leaderboard` — response shape | **Field names + metric mismatch** | P0 |
| `/api/sales` — incentive amount per row | **Backend does not return `incentiveAmount`** | P1 |
| `/api/rules` — FNL config.minWorkingDays | Silent fallback (`?? 5`) | P2 |
| `/api/dashboard` — `alerts.belowThresholdList` | Not provided by backend | P2 |
| `/api/recalculate` | No consumer in app yet | Gap |
| `/api/rules/create/wizard` | No consumer in app yet | Gap |
| Period parameters | Wired through but not passed | Gap |

---

## P0 — Critical

### 1. `fetchEmployee(id)` / `fetchStore(code)` hit routes that don't exist

**App side** (`src/api/employees.js:8-11`, `src/api/stores.js:8-11`):

```js
export async function fetchEmployee(employeeId) {
  const { employee } = await api.get(`/employees/${employeeId}`);  // path param
  return employee;
}
export async function fetchStore(storeCode) {
  const { store } = await api.get(`/stores/${storeCode}`);          // path param
  return store;
}
```

**Backend side** — there is no `app/api/employees/[id]/route.ts` or `app/api/stores/[code]/route.ts`. Only the list handlers exist:
- `src/app/api/employees/route.ts:4-38` — only supports `?storeCode=` and `?employeeId=` query params; returns `{ employees: [...] }` (always an array, never unwrapped).
- `src/app/api/stores/route.ts:4-37` — only supports `?storeCode=` and `?vertical=`; returns `{ stores: [...] }`.

**Impact:** Any code path that calls `fetchEmployee` or `fetchStore` will 404. Need to either:
- Change app to `api.get('/employees', { params: { employeeId } })` then take `employees[0]`, same for stores, **or**
- Add `[id]/route.ts` handlers in the backend.

---

### 2. `useCentralData` makes two `fetchIncentives` calls that both resolve to city-level

**App side** (`src/hooks/useCentralData.js:17-26`):

```js
Promise.all([
  fetchDashboard(),
  fetchIncentives({}),                       // expected: city-level
  fetchIncentives({ vertical: undefined }),  // expected: store-level
  fetchRules(),
])
  .then(([dashboard, cityData, storeData, allPlans]) => {
    const cityRows = cityData?.level === 'city' ? cityData.rows : [];
    const storeRows = storeData?.level === 'store' ? storeData.rows : [];
    ...
```

**Backend side** (`src/server/services/incentives.ts:27-32`):

```ts
export async function getIncentiveDrilldown(params) {
  if (params.employeeId) return getEmployeeDetail(params);
  if (params.storeCode) return getStoreDetail(params);
  if (params.city) return getStoreSummary(params);   // ← store-level gated on `city`
  return getCitySummary(params);                     // ← default
}
```

**Impact:** Both calls send no `city`, `storeCode`, or `employeeId`, so both return `{ level: 'city', rows: [...] }`. `storeRows` is always `[]` → `transformCentralReporting` always produces empty `allStores`, `topStores`, `byVertical` aggregates → CENTRAL home shows empty tables. App needs to send `fetchIncentives({ city: '<each-city>' })` per city, or backend needs a "level=store" explicit mode.

---

### 3. `/api/incentives` per-vertical detail — contracts don't overlap

**App expects** — three vertical transformers (`electronics.js:80-140`, `grocery.js:80-140`, `fnl.js:40-130`) destructure a deeply nested response:

```js
// all three transformers call:
// fetchEmployeeIncentive(employeeId, vertical) → detail
// and read:
detail.employee.employeeId / employeeName / storeCode
detail.currentStanding.finalIncentive
detail.currentStanding.storeTarget
detail.currentStanding.currentMultiplierPct
detail.currentStanding.campaignName       // grocery
detail.currentStanding.storeActual        // grocery
detail.currentStanding.totalPiecesSold    // grocery
detail.currentStanding.currentRate        // grocery
detail.currentStanding.totalStorePayout   // grocery
detail.currentStanding.yourPayout         // grocery
detail.currentStanding.employeeCount      // grocery
detail.currentStanding.weeklyTarget       // fnl
detail.currentStanding.weeklyActual       // fnl
detail.currentStanding.storePool          // fnl
detail.currentStanding.exceeded           // fnl
detail.currentStanding.roleSplit.{saPoolPct,smSharePct,dmSharePerDmPct}  // fnl
detail.currentStanding.eligibleSAs        // fnl
detail.currentStanding.periodStart/periodEnd  // fnl
detail.departments[i].{department, achievementPct}   // electronics
detail.recentSales[i].{date, incentiveEarned}        // electronics
detail.payoutSlabs[i].{from, rate}                   // grocery
detail.weeks[i].{periodStart, periodEnd, targetValue, actualSales, payout}  // fnl
```

**Backend actually returns** (`src/server/services/incentives.ts` → `getEmployeeDetail`):

```json
{
  "level": "employee",
  "rows": [
    {
      "employeeId", "employeeName", "storeCode", "storeName", "role",
      "baseIncentive", "multiplierApplied", "finalIncentive", "achievementPct"
    }
  ]
}
```

**Impact:** **None of the fields the transformers read exist in the backend response.** The transformers were clearly written against a contract that was never implemented on the backend — there is no `currentStanding` object, no `departments` array, no `recentSales`, no `payoutSlabs`, no `weeks`. With real API data every transformer would fail (or return all-zeros / all-nulls via `?. || 0` fallbacks).

This is the **largest single gap** in the integration. Two resolution paths:
- **Option A (backend change):** Add per-vertical detail endpoints that return the nested shape the app expects — e.g. `/api/incentives/employee/:id?vertical=ELECTRONICS`.
- **Option B (app change):** Rewrite transformers to compose the nested shape from multiple flat backend responses — `/api/incentives?employeeId=…` (ledger rows), `/api/sales?employeeId=…` (transactions), `/api/rules?vertical=…` (slabs, multipliers), `/api/attendance` (F&L weekly presence).

Option B is likely the correct choice — the backend already has canonical data and Option A would duplicate calculation logic. But Option B is a non-trivial rewrite of ~200 lines of transformer code.

---

### 4. `/api/leaderboard` auth mismatch — 401 guaranteed today

**App side** (`src/api/client.js:13-19`):

```js
api.interceptors.request.use((config) => {
  const token = secureLocalStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

Sends only `Authorization: Bearer <JWT>`.

**Backend side** (`src/app/api/leaderboard/route.ts:17-32`):

```ts
function viewerFromRequest(request) {
  const employeeId = request.headers.get("x-user-employee-id");
  const storeCode  = request.headers.get("x-user-store-code");
  const role       = request.headers.get("x-user-role");
  if (!employeeId || !storeCode || !role) return null;
  return { employeeId, storeCode, role };
}
...
if (!viewer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

Leaderboard does NOT use the shared `authenticateRequest` helper (`src/lib/auth.ts:39-77`) that the rest of the API uses. It requires three custom headers. Same pattern in `/api/leaderboard/me`.

**Impact:** Any call to `/api/leaderboard*` from the app gets 401. The app's 401 handler triggers `auth:session-expired` (`client.js:27-29`), meaning the first leaderboard request silently signs the user out.

**Fix options:**
- Backend: switch leaderboard to `authenticateRequest(request)` like every other route.
- App: in `client.js` request interceptor, decode the JWT and inject `x-user-employee-id`, `x-user-store-code`, `x-user-role` headers alongside the Bearer token.

Backend-side is the cleaner fix — inconsistency is a bug, not a feature.

---

### 5. Leaderboard response shape — field names and metric are wrong

**Backend returns** (`/api/leaderboard/route.ts`, service at `src/server/services/leaderboard.ts`):

```json
{
  "metric": "TOTAL_SALES_GROSS",
  "leaderboard": [
    { "rank", "employeeId", "employeeName", "role", "storeCode", "storeName",
      "city", "totalSales", "transactionCount", "isViewer" }
  ],
  "period": { ... },
  "viewer": { ... }
}
```

`/api/leaderboard/me` returns `{ myRank, totalSales, transactionCount, employeesInStore, employeesAheadOfMe, ... }` — **no `top` array**.

**App expects** (`src/components/Molecule/LeaderboardPodium/LeaderboardPodium.jsx:26-64`, `LeaderboardFocusList.jsx:31-46`, `LeaderboardDrawer.jsx:23-34`):

```js
myRank = {
  rank, deltaAbove, scope,
  top: [{ rank, name, earned, isSelf, note? }],   // top 5
  unitLabel?, scopeNote?
}
```

**Field-name mismatches:**

| Backend field | App field |
|---|---|
| `employeeName` | `name` |
| `totalSales` | `earned` |
| `isViewer` | `isSelf` |
| `leaderboard[]` | `top[]` (and app wants top 5, backend returns all) |
| `employeesAheadOfMe` | (no direct equivalent; `deltaAbove` in the app is a *currency delta*, not a headcount) |
| (none) | `deltaAbove` — must be computed |
| (none) | `unitLabel`, `scopeNote` — app-side labels |

**Semantic mismatch — bigger issue:**

- Backend ranks by **gross sales ₹** (`metric: "TOTAL_SALES_GROSS"`) — sum of `grossAmount` from `SalesTransaction`.
- Current mock leaderboards (in `src/data/payouts.js`) and the three client-side `buildMyRank` functions (`electronics.js:41-73`, `grocery.js:43-75`, `fnl.js:43-79`) rank by **incentive earned ₹** (`finalIncentive`).
- Podium/focus-list render `earned` with a `₹` prefix via `formatEarn()` (`LeaderboardPodium.jsx:6-7`).

When we swap in real data, users will see much larger numbers (sales volume, not incentive) with the same `₹` formatting — visually misleading unless we either:
- relabel the leaderboard as "Sales leaderboard — gross revenue", **or**
- switch backend to rank by ledger `finalIncentive` (requires new service logic).

**Required work:**
- Add `src/api/leaderboard.js` with `fetchLeaderboard({ scope, month, monthsBack })` and `fetchMyRank({ month, monthsBack })`.
- Add `src/api/transformers/leaderboard.js` that:
  - Maps `employeeName → name`, `totalSales → earned`, `isViewer → isSelf`.
  - Slices `leaderboard` to top-5 for `top`.
  - Computes `deltaAbove` as `top[rank-2].earned - viewerRow.earned` (₹ gap to the person above), OR redefines `deltaAbove` as headcount from `/me`'s `employeesAheadOfMe`. Pick one and update components.
  - Sets `unitLabel` based on the metric (`'sales'` for now).
- Remove or guard the three client-side `buildMyRank` synthesizers once real data flows — they currently ship a rank the backend won't agree with.

---

## P1 — High

### 6. `/api/sales` doesn't return `incentiveAmount` but the app reads it everywhere

**App side** — `src/api/transformers/transactions.js:37` reads `apiRow.incentiveAmount`; `src/api/transformers/electronics.js:105-107` sums `recentSales[i].incentiveEarned`; `src/api/transformers/electronics.js:22-36` (`buildStreakShape`) maps sales rows by `incentiveAmount`; `src/hooks/useGamification.js:12-15` reads `incentiveAmount || finalIncentive`.

**Backend side** — `/api/sales/route.ts` returns only `SalesTransaction` columns: `transactionId, transactionDate, storeCode, vertical, storeFormat, employeeId, department, articleCode, productFamilyCode, brand, quantity, grossAmount, taxAmount, totalAmount, transactionType, channel`. **There is no `incentiveAmount` or `status` on sales rows** — incentive lives in a separate table (`IncentiveLedger`) keyed by plan + period, not per transaction.

**Impact:**
- "Today earned" on the Electronics SA hero card = 0.
- Streak computation always sees zero-earning days → streak breaks.
- Transaction history page shows `finalIncentive: 0` for every row.

**Fix options:**
- Backend: join `SalesTransaction` with per-transaction ledger entries (if the calc engine writes them) and expose `incentiveAmount` in `/api/sales`.
- App: stop deriving per-day earnings from sales rows; fetch `/api/incentives` (ledger) for current-period earnings, and drop streak-from-sales logic (or back it with an attendance endpoint).

---

## P2 — Medium

### 7. FNL plan config field-name drift — `minWorkingDays` vs `attendanceMinDays`

**App** (`src/hooks/useFnlData.js:50`): `activePlan?.config?.minWorkingDays ?? 5`.

**Backend** — `src/app/api/rules/create/wizard/route.ts` stores:
```ts
config: { poolPct, attendanceMinDays, weekDefinition: "SUNDAY_TO_SATURDAY" }
```

**Impact:** Silent — the app always falls back to `5`. If the vendor configures 6 or 7 days, the app ignores it. Rename one side to match; backend's `attendanceMinDays` matches the Prisma field name (`FnlRoleSplit.attendanceMinDays` per seed) so the app should adopt that.

### 8. `dashboard.alerts.belowThresholdList` doesn't exist on backend

**App** (`src/api/transformers/central.js:109-115`): reads `dashboardData.alerts?.belowThresholdList` to build `flags` for CENTRAL home.

**Backend** (`/api/dashboard/route.ts` + `src/server/services/dashboard.ts`): returns `{ storeCount, employeeCount, activeSchemes, totalIncentivePaid, totalSales, topPerformers, pendingApprovals, storeMetrics, dailyTrend }`. No `alerts`.

**Impact:** `flags` in CENTRAL reporting is always `[]`. Either compute client-side from `storeMetrics[].achievementPct`, or add `alerts.belowThresholdList` on the backend.

---

## Gaps — no consumer yet

### 9. `/api/recalculate` — no client

Backend: `POST /api/recalculate { month }` → `{ message, ledgerRows }`. Also `POST /api/sales/recalculate { storeCode, month }` → `{ ok }`.

App: no `src/api/recalculate.js`, no UI trigger.

**Decisions needed before building:**
- Who is allowed to call this? (Authless today on backend — needs role gate.)
- Where in the UI does it live? CENTRAL home after plan activation? SM roster refresh? SA pull-to-refresh?
- Which variant does the UI use — org-wide (`/api/recalculate`) or store+month (`/api/sales/recalculate`)?

### 10. `/api/rules/create/wizard` — no client

Backend: `POST /api/rules/create/wizard` with vertical-branched body → `{ planId, planName }`. Backend component `src/components/rules/plan-wizard.tsx` is a Next.js/TSX component.

App: no wizard UI, no create/update endpoints in `src/api/rules.js`.

**Decisions needed:**
- Port `plan-wizard.tsx` (TSX / Next.js) to a React SPA container under `src/containers/CentralHome/PlanWizard/` with SCSS modules.
- Add `createPlanViaWizard(payload)` to `src/api/rules.js`.
- Wire into CENTRAL home "Create plan" action (doesn't exist yet; `CentralHome.jsx` is read-only catalog).

### 11. Period selector — contract supports it, hooks don't pass it

Backend `/api/incentives` and `/api/leaderboard` both accept `periodStart`/`periodEnd` or `month`/`monthsBack`.

App `fetchEmployeeIncentive(employeeId, vertical, periodStart, periodEnd)` already takes those params — but `useElectronicsData`, `useGroceryData`, `useFnlData` call it as `fetchEmployeeIncentive(employeeId, 'ELECTRONICS')` with no period → backend defaults to current calendar month.

**Work:** add `PeriodContext` + `PeriodSelector` molecule, thread selection through all five data hooks and new `fetchLeaderboard`.

---

## Suggested fix order

1. **Backend: unify auth on leaderboard** — replace `viewerFromRequest` with `authenticateRequest`. One-line change, unblocks all leaderboard work.
2. **App: fix `fetchEmployee` and `fetchStore`** — one-line changes each to use query params and unwrap `[0]`.
3. **App: fix `useCentralData` dual `fetchIncentives`** — loop over cities, or backend adds `level=store` mode.
4. **Decide on vertical detail contract (P0 #3)** — biggest architectural call. Recommend rewriting transformers to compose flat backend responses (Option B). This drives the next ~2 weeks of work on this branch.
5. **Add leaderboard client + transformer + wire podium/focus-list**. Drop client-side `buildMyRank` synthesizers.
6. **Add `incentiveAmount` on `/api/sales` rows** (P1 #6) — or rework streak/today-earned to read from `/api/incentives`.
7. **Normalise `minWorkingDays` / `attendanceMinDays`** — rename on app side.
8. **Fill gaps:** recalculate client, plan wizard port, period selector.

## Open questions for the backend team

1. `/api/leaderboard` — confirm the metric. Is sales-₹ ranking the product decision, or should it be ledger `finalIncentive`?
2. `/api/incentives` employee-detail — will you extend this to return the nested per-vertical detail the app's transformers want, or is the app expected to compose from flat endpoints?
3. `/api/leaderboard` auth — is the `x-user-*` header pattern intentional, or a bug to be replaced with `authenticateRequest`?
4. `/api/recalculate` — who's authorised to call this? Should the app gate by role before showing a button?
5. `/api/sales` — can `incentiveAmount` (from ledger) be joined in and returned per row, or should the app fetch ledger + sales separately and merge?
6. `/api/dashboard.alerts` — will you add it, or should the app compute alerts from `storeMetrics[].achievementPct`?
