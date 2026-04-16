# incentive-os-poc → Incentive App: Impact Analysis

**Source:** `incentive-os-poc` (Prisma/Next.js backend)
**Target:** `Incentive App` (React 18 SPA, mock-data)
**Branch:** `feat/api-integration`
**Date:** 2026-04-15

## Incoming changes (from incentive-os-poc)

| Commit | Change |
|---|---|
| `50924fa` | Seed data rebuilt — realistic targets from vendor brief, controlled achievement profiles. `prisma/seed.ts` grew from ~200 → ~800 lines. |
| `894bf49` | Leaderboard feature — `GET /api/leaderboard`, `GET /api/leaderboard/me`, `/leaderboard` page, sales-based rankings. |
| `4811d20` | Recalculate API (`POST /api/recalculate`), plan-creation wizard (`POST /api/rules/create/wizard` + `plan-wizard.tsx`), period-selector UI. |

---

## 1. Leaderboard feature → what it hits in this app

### UI surfaces that will consume the new endpoints

| File | Role |
|---|---|
| `src/components/Molecule/LeaderboardPodium/LeaderboardPodium.jsx` | Top-3 podium (gold/silver/bronze) |
| `src/components/Molecule/LeaderboardFocusList/LeaderboardFocusList.jsx` | Self ±1 focus window |
| `src/components/Molecule/LeaderboardFocusList/computeFocusRows.js` | Focus-window computation (unit-tested) |
| `src/components/Organism/LeaderboardDrawer/LeaderboardDrawer.jsx` | Bottom-sheet, triggered by rank pill in `HeaderBar` |
| `src/containers/EmployeeHome/EmployeeHome.jsx` (L18, L45–49) | Drawer open/close wiring |
| `src/containers/StoreManagerHome/StoreManagerHome.jsx` | Store-wide leaderboard for SM |

### Current shape (mock, `src/data/payouts.js`)

```js
myRank: {
  rank: 3,
  deltaAbove: 40,
  scope: 'store',
  top: [ { rank, name, earned, isSelf }, … ]  // top 5
}
```

### Contract alignment work

- Map poc `/api/leaderboard` → `top[]` array (rank, name, earned, isSelf).
- Map poc `/api/leaderboard/me` → `{ rank, deltaAbove, scope }`.
- Decide unit basis: current mock uses currency; poc uses **sales-based rankings** — confirm whether `earned` means incentive ₹ or sales volume, and whether `unitLabel` changes per persona.
- Per-persona wiring:
  - SA Electronics / Grocery / F&L → store-scope leaderboard (exists)
  - SM → store-wide across SAs (exists)
  - BA → currently none; decide if BA sees SM's leaderboard read-only
  - CENTRAL → no leaderboard today; poc's `/leaderboard` page may or may not apply
- Add endpoint stub to `src/api/` (currently missing — `src/api/leaderboard.js` does **not** exist).
- Add a transformer under `src/api/transformers/` to flatten poc response → `myRank` shape.

### Engine-side

- `src/services/GamificationEngine/buildLeaderboardView.js` is the only place where leaderboard logic is computed today. With a server-authoritative leaderboard, this becomes a **fallback / offline-mode** path. Keep it behind `REACT_APP_USE_MOCK_DATA`.

---

## 2. Recalculate API → what it hits

### Where "recomputed earnings" is already displayed

| File | Purpose |
|---|---|
| `src/services/GamificationEngine/computeGoalProgress.js` | Core daily/weekly/monthly progress calc |
| `src/hooks/useElectronicsData.js`, `useGroceryData.js`, `useFnlData.js` | Fetch + memoize earnings per vertical |
| `src/components/Molecule/EarningsHero/EarningsHero.jsx` | MTD / today earned hero |
| `src/components/Molecule/HeroCard/HeroCard.jsx` | Progress state display |
| `src/components/Molecule/TargetTrendBreakdown/TargetTrendBreakdown.jsx` | Dept breakdown (Electronics SA) |
| `src/containers/EmployeeHome/views/ElectronicsView.jsx` (259 lines) | Full Electronics SA home with dept accordion & achievement % |
| `src/containers/EmployeeHome/views/GroceryView.jsx`, `FnlView.jsx` | Vertical views |
| `src/api/transformers/electronics.js`, `grocery.js`, `fnl.js`, `transactions.js` | Backend-payload → UI-shape transformers |

### What's new

- **No `Recalculate` button exists** anywhere in the app today. Data refresh currently happens only on hook mount (`useAsync` + `Promise.all`).
- `POST /api/recalculate` needs a **trigger surface** — likely one of:
  - CENTRAL home (maker-checker style action after rule publish)
  - SM home (manual refresh of store roster earnings)
  - SA home (hero card pull-to-refresh)
- **No `src/api/recalculate.js` stub** exists; add it plus a `useRecalculate()` hook (probably mutation-style).
- After success, it should invalidate / re-fetch the three data hooks above. Pattern to match: the existing `auth:session-expired` event bus in `src/api/client.js` — a lightweight `data:recalculated` event is probably cleaner than lifting state.

### Maker-checker tie-in (CENTRAL)

- `src/data/configs.js` defines `WORKFLOW` = `DRAFT | SUBMITTED | APPROVED | REJECTED | ACTIVE`.
- `src/containers/CentralHome/CentralHome.jsx` (L12–24) maps `plan.status` → `WORKFLOW_COLORS`.
- If recalculate is triggered by plan activation, wire it after the `APPROVED → ACTIVE` transition.

---

## 3. Plan creation wizard → what it hits

### What exists today

| File | State |
|---|---|
| `src/containers/CentralHome/CentralHome.jsx` (L35–41) | Catalog of rules: `ruleId`, `name`, `version`, `workflowState`, `vertical` — **read-only** |
| `src/containers/screens/RulesScreen.jsx` | 13-line placeholder |
| `src/api/rules.js` | `fetchRules(vertical)` only — no create/update |
| `src/data/configs.js` | All rule metadata hard-coded: `electronicsBaseSlabs`, `electronicsMultiplierTiers`, `electronicsOpportunities`, `electronicsExclusions` |

### Net-new work

- **There is no plan-authoring UI today.** `plan-wizard.tsx` from poc is a completely new surface — needs a React port (the poc is Next.js/TSX).
- New container: `src/containers/CentralHome/PlanWizard/` with steps mirroring poc's wizard (expected: scope → slabs → multipliers → exclusions → review → submit).
- New endpoint stubs in `src/api/rules.js`:
  - `POST /api/rules/create/wizard` (stepwise draft save?)
  - likely `PATCH` / `PUBLISH` endpoints that poc exposes alongside
- Entry point: add "Create plan" action to CENTRAL home (currently just lists rules).
- Workflow state transitions: the new wizard must drive `WORKFLOW` through `DRAFT → SUBMITTED → APPROVED → ACTIVE` consistently with existing status rendering.

### Data-shape conflict to resolve

- Current `configs.js` structure (tiers as arrays of `{gateFromPct, gateToPct, multiplier, label}`) is **UI-optimized**.
- poc's wizard likely posts normalized rows (slab + tier + exclusion separately).
- `src/api/transformers/central.js` (127 lines) already handles central payloads — extend it to round-trip a rule into wizard-compatible draft form.

---

## 4. Period selector UI → what it hits

### Time-scoped state today

| File | Handling |
|---|---|
| `src/services/GamificationEngine/computeGoalProgress.js` (L10–31) | `elapsedFraction()` hard-codes daily/weekly/monthly |
| `src/utils/format.js` (61 lines) | `formatDate`, `formatDateRange` — utilities exist, no selector consumes them |
| `src/data/payouts.js` | All values frozen to April 2026; `nextPayoutDate` = 7th of next month |
| `src/data/transactions.js` | Transactions dated 2026-04-05 → 2026-04-13 |
| `src/containers/screens/HistoryScreen.jsx` (46 lines) | Transaction history; no selector |

### What's missing

- **No period-selector component exists.** Needs to be built as a new molecule: `src/components/Molecule/PeriodSelector/`.
- Every data hook (`useElectronicsData`, `useGroceryData`, `useFnlData`, `useCentralData`) needs to accept `{ periodStart, periodEnd }` and forward to the API.
- The mock shape in `payouts.js` currently has a **single frozen period**; to keep `REACT_APP_USE_MOCK_DATA=true` viable for QA, mock data must key by period or fall back to the hard-coded set when the selected period matches April 2026.
- Decide selector granularity up front: day / week / month / custom range. poc likely ships with all four.
- Persist selection across tabs — a thin `PeriodContext` next to `PersonaContext` and `TabContext` is the cleanest fit.

---

## 5. Seed data rebuild (~200 → ~800 lines) → what it hits

### Mock data inventory (`src/data/`, ~82 KB total)

| File | Size | What it holds |
|---|---|---|
| `payouts.js` | 21 KB | Earnings per employee, dept breakdown, streaks, rankings |
| `configs.js` | 17 KB | Rule definitions: slabs, multiplier tiers, opportunities, exclusions |
| `transactions.js` | 18 KB | Per-employee 30-day transaction detail |
| `masters.js` | 15 KB | Verticals, roles, store formats, TX types, channels |
| `gamification.js` | 7.8 KB | Badges + milestone thresholds |
| `personas.js` | 3.4 KB | Mock user profiles (SA, SM, BA, CENTRAL) |
| `mockAuthUsers.js` | 535 B | Demo login creds |

### Consumers

- `useElectronicsData` L9, L24 → `electronicsPayoutsRD3675`
- `useGroceryData`, `useFnlData` → same pattern
- `PersonaContext.jsx` (184 lines) → `mockAuthUsers`
- `BrandAssociateHome.jsx` → BA persona mock fallback
- `App.jsx` L10 → `REACT_APP_USE_MOCK_DATA` gate on auth bypass

### Implication

- poc's 800-line seed represents **~10–15 employees per vertical per store, or multi-store rollup** (vs. today's ~3 per vertical).
- Existing transformers (`src/api/transformers/*.js`) already handle per-vertical payloads — they should absorb larger volumes without changes, **but check**:
  - Leaderboard podium is fixed to 3; focus list assumes self is findable — large rosters must guarantee self-presence.
  - `computeFocusRows.js` was unit-tested on small inputs; re-verify at scale.
- Mock-fallback drift risk: once poc seed ships, our `payouts.js` will become structurally stale. Either (a) regenerate mock from poc seed on each pull, or (b) treat mock as golden-small-dataset and accept divergence.

---

## 6. API-client readiness

### What exists (`src/api/`)

```
client.js          → axios with REACT_APP_API_BASE_URL, Bearer auth, 401 handler
auth.js            → loginWithSSO()
dashboard.js       → fetchDashboard()
employees.js       → fetchEmployee(s)()
incentives.js      → fetchIncentives(), fetchEmployeeIncentive(), fetchStoreIncentive(), fetchCityIncentives()
rules.js           → fetchRules(vertical)           — read only
sales.js           → fetchSales(), fetchSalesFilters()
stores.js          → fetchStores(), fetchStoreDetail()
transformers/      → central, electronics, grocery, fnl, transactions
```

### Missing stubs for poc endpoints

- `src/api/leaderboard.js` → `fetchLeaderboard()`, `fetchMyRank()`
- `src/api/recalculate.js` → `triggerRecalculate()`
- `src/api/rules.js` → extend with `createRuleDraft()`, `updateRuleDraft()`, `submitRule()` (wizard steps)

### Env config

- `.env.dev` → `REACT_APP_API_BASE_URL=http://localhost:3000/api`, `REACT_APP_USE_MOCK_DATA=false`
- `.env.qa`, `.env.uat`, `.env.prod` → per-env backends
- **Check with backend team:** whether poc's `/api/leaderboard` mounts at the same base path as existing endpoints or behind a different prefix.

---

## 7. Branch state (`feat/api-integration`)

- Diff vs `main`: **256 files, +26,310 / −5,431**
- Already landed on this branch: Nexus design system, AuthContext + Login, API client & transformers, five data hooks, leaderboard UI redesign (podium/focus/drawer), badges redesign (Medallion, TrophyCaseDrawer, BadgeDetailDrawer).
- **Not yet on branch:** `/api/leaderboard`, `/api/recalculate`, plan wizard, period selector. These are the integration targets.

---

## 8. Impact summary — what to plan next

| poc feature | New files to add | Existing files to touch | Risk |
|---|---|---|---|
| Leaderboard API | `src/api/leaderboard.js`, `src/api/transformers/leaderboard.js` | `useElectronicsData`, `useGroceryData`, `useFnlData`, `EmployeeHome`, `StoreManagerHome` | Low — UI already built |
| Recalculate API | `src/api/recalculate.js`, `useRecalculate` hook, a trigger button component | hero cards per vertical, `CentralHome` | Medium — need UX call on trigger location |
| Plan wizard | `src/containers/CentralHome/PlanWizard/*`, wizard-stub endpoints in `rules.js` | `CentralHome`, `transformers/central.js`, `configs.js` (schema alignment) | High — greenfield UI, schema round-trip not trivial |
| Period selector | `src/components/Molecule/PeriodSelector/`, `PeriodContext` | every data hook, `computeGoalProgress`, mock `payouts.js` keying | Medium — touches every persona view |
| Seed rebuild | — | `src/data/payouts.js`, `transactions.js`; re-verify `computeFocusRows` at scale | Low if contract stable |

### Open questions for the backend team

1. Does `/api/leaderboard` `earned` field mean incentive ₹ or sales volume?
2. Does poc's wizard save partial drafts, or only POST on submit?
3. What triggers `/api/recalculate` authoritatively — plan activation, manual admin action, or scheduled job? Who's allowed to call it from the UI?
4. Does the period selector drive a **query param** on existing endpoints, or require new period-scoped endpoints?
5. Will poc's 800-line seed be the source of truth for our mock, or do we maintain our own small-dataset mock?
