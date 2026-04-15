# Data Audit: UI vs API (incentive-os-poc)

> Generated 2026-04-14. The API is the **single source of truth**. If the API doesn't provide a field, we don't show it. Derivatives computed from API data are acceptable.

---

## Section A — Cannot Handle: API does not provide, UI must be removed or hidden

These UI elements will render **empty, zero, or broken** because the API has no backing data for them. They are not derivable from any API response. Each needs a decision: **remove the UI** or **hide it until the API supports it**.

### A1. Entire features with no API backing

| # | Feature | Components affected | What happens without mock | Recommendation |
|---|---------|--------------------|-----------------------------|----------------|
| 1 | **Badges** | `BadgesStrip` (rendered in Electronics, Grocery, FNL views) | Empty — component returns `null` when no badges | **Remove** `<BadgesStrip>` from all three views |
| 2 | **Quests** | `QuestCard` (rendered in Electronics, Grocery, FNL views) | Empty — component returns `null` when no quests | **Remove** `<QuestCard>` from all three views |
| 3 | **Level tiers** | `LevelCard` (exists but already not rendered), `useGamification` hook | No visible impact — already hidden | No action needed |
| 4 | **Opportunity strip** (SKU suggestions) | `OpportunityStrip` in `ElectronicsView` | Shows hardcoded stale data forever | **Remove** `<OpportunityStrip>` and the `OPPS` constant |

### A2. Specific fields the API does not return

| # | Missing Field | Component | What happens | Recommendation |
|---|---------------|-----------|-------------|----------------|
| 5 | **Electronics per-dept `baseIncentive`** | `EmployeeDetailDrawer` dept breakdown | Shows ₹0 for every department's base column | Remove base incentive column from drawer dept table |
| 6 | **Electronics per-dept `finalPayout`** | `ElectronicsView` (hero), `EmployeeDetailDrawer` | **BUG**: `ElectronicsView` line 27 sums `finalPayout` across depts → always ₹0. Hero shows ₹0 earned this month. Goal progress shows 0%. | **Fix**: use `payout.monthToDateEarned` (from API `cs.finalIncentive`) instead of summing per-dept `finalPayout`. Remove per-dept ₹ columns from drawer. |
| 7 | **Electronics base slabs** (per-product incentive rates) | `RulesScreen → ElectronicsRules` "Step 1" section | Entire "Base incentive per product" section is empty | **Remove** the "Step 1" section from Electronics rules |
| 8 | **Electronics exclusions** (excluded brands, tx types) | `RulesScreen → ElectronicsRules` "Exclusions" section | Entire exclusions section is empty | **Remove** the "Exclusions" section from Electronics rules |
| 9 | **FNL `sms` / `dms` staffing counts** | `FnlView` hero footer, split matrix highlight | Shows "This store: 0 SM · 0 DM", `findSplit(0,0)` falls back to first matrix row | **Hide** the staffing pill. Remove `isCurrent` highlighting from split matrix rows. |
| 10 | **FNL `employees[]` (attendance + per-employee payout)** | `FnlView` 5-day eligibility card, employee payout list | `myEmp` is undefined → `myPayout` = 0, `myDays` = 0. Eligibility card always says "Not eligible, 0 days". | **Remove** the 5-day eligibility card and per-employee breakdown entirely |
| 11 | **FNL `myRank`** | Not currently rendered (transformer returns `null`) | No visible impact | No action needed |
| 12 | **Grocery `lastCampaignPayoutPerEmp`** | `GroceryView → MomentumPills` "last campaign" comparison | Shows ₹0 for last campaign, trend always shows "first period" | **Hide** the "vs last campaign" comparison in MomentumPills. Show only next payout date. |
| 13 | **Grocery `campaignLeaderboard`** | `GroceryView` campaign leaderboard section | Empty array → leaderboard section renders nothing (no rows) | **Remove** the entire campaign leaderboard `<section>` |
| 14 | **Grocery `myRank`** | Not currently rendered (transformer returns `null`) | No visible impact | No action needed |
| 15 | **Grocery campaign metadata from mock** (`incentiveType`, `geography`, `channel`, `eligibleArticles`, `fundingSource`, `payoutSlabs` for rules display) | `GroceryView` hero eyebrow/meta, `RulesScreen → GroceryRules` | Fields like geography, channel, incentiveType, eligible articles list will be empty/undefined | **Remove** metadata fields not present in API `campaignConfigs`. Keep only what the API returns (name, dates). Remove eligible articles section and payout slabs from RulesScreen if not in API. |
| 16 | **FNL `ineligiblePayrollStatuses`** | `RulesScreen → FnlRules` | List of ineligible statuses will be empty | **Remove** the ineligible statuses line from FNL rules display |
| 17 | **`lastMonthPayout` (Electronics)** | `ElectronicsView → MomentumPills` "vs last month" | Always ₹0 — hook passes `null` for `prevPeriod`, transformer defaults to 0 | **Hide** the "vs last month" comparison. Show only next payout date. |

### A3. Components that are 100% mock with no API path

These entire components/screens read **exclusively** from `src/data/` static files. When mock is removed, they break completely.

| # | Component | Mock imports | What breaks | Recommendation |
|---|-----------|-------------|-------------|----------------|
| 18 | **`StoreTransactions`** | `data/masters.js` → `employees`, `data/transactions.js` → `getStoreTransactions` | Zero transactions, empty employee list. SM "Transactions" tab is blank. | **Rewire** to use `fetchSales({ storeCode })` + `fetchEmployees(storeCode)` via API. This is fixable — endpoints exist. |
| 19 | **`EmployeeDetailDrawer`** dept breakdown + transactions | `data/payouts.js` → `electronicsPayoutsRD3675`, `data/transactions.js` → `transactionsByEmployee` | No dept breakdown, no recent transactions. Drawer shows only profile + quick stats from `summaryRow`. | **Rewire** dept breakdown: fetch via `fetchEmployeeIncentive`. Transactions: fetch via `fetchSales({ employeeId })`. Endpoints exist. |
| 20 | **`StoreDetailDrawer`** flags | `data/payouts.js` → `centralReporting.flags` | No flags shown for any store | **Rewire**: pass `flags` as prop from `CentralHome` which already has them from API. Trivial fix. |
| 21 | **`RulesScreen`** (all three verticals) | `data/configs.js` → `electronicsBaseSlabs`, `electronicsMultiplierTiers`, `electronicsExclusions`, `groceryCampaign`, `fnlWeeklyRules` | Entire screen is empty | **Partially rewire**: fetch `fetchRules(vertical)` for multiplier tiers + FNL splits + campaign configs. **Remove** sections the API can't populate (base slabs, exclusions, eligible articles). |

---

## Section B — Can Handle: API data exists, needs frontend rewiring

These are cases where the data **is available from the API** (or derivable from it) but the component still imports from mock. Pure frontend fixes.

| # | Component | Current (mock) | Fix to (API) | Effort |
|---|-----------|---------------|-------------|--------|
| 1 | **`ElectronicsView`** hero amount | Sums `byDepartment[].finalPayout` (all zeros) | Use `payout.monthToDateEarned` directly (comes from `cs.finalIncentive`) | Small — change 2 lines |
| 2 | **`ElectronicsView`** multiplier tiers | `import { electronicsMultiplierTiers } from data/configs` | Accept `multiplierTiers` as prop from `EmployeeHome` (already fetched by `useElectronicsData`) | Small |
| 3 | **`DeptMultiplierCompact`** tier reference grid | `import { electronicsMultiplierTiers } from data/configs` | Accept `multiplierTiers` as prop | Small |
| 4 | **`GroceryView`** campaign name/dates | `import { groceryCampaign } from data/configs` | Use `campaign` from `useGroceryData` hook (already fetched from API rules) | Small |
| 5 | **`FnlView`** split matrix + minWorkingDays | `import { fnlWeeklyRules } from data/configs` | Use `weeklyRules` from `useFnlData` hook (already fetched from API rules) | Small |
| 6 | **`StoreDetailDrawer`** flags | `import { centralReporting } from data/payouts` | Accept `flags` as prop from `CentralHome` (already in `reporting.flags`) | Trivial |
| 7 | **`StoreTransactions`** | `import { employees } from data/masters` + `import { getStoreTransactions } from data/transactions` | Use `fetchSales({ storeCode })` + `fetchEmployees(storeCode)` | Medium — add `useAsync` calls |
| 8 | **`EmployeeDetailDrawer`** transactions | `import { transactionsByEmployee } from data/transactions` | Fetch `fetchSales({ employeeId })` on drawer open | Medium — add async fetch |
| 9 | **`EmployeeDetailDrawer`** dept payout | `import { electronicsPayoutsRD3675 } from data/payouts` | Fetch `fetchEmployeeIncentive(employeeId, vertical)` on drawer open | Medium — add async fetch |
| 10 | **`RulesScreen`** multiplier tiers (Electronics) | `import { electronicsMultiplierTiers } from data/configs` | Fetch `fetchRules('ELECTRONICS')` → use `activePlan.achievementMultipliers` | Medium |
| 11 | **`RulesScreen`** split matrix (FNL) | `import { fnlWeeklyRules } from data/configs` | Fetch `fetchRules('FNL')` → use `activePlan.fnlRoleSplits` + `config.minWorkingDays` | Medium |
| 12 | **`RulesScreen`** campaign config (Grocery) | `import { groceryCampaign } from data/configs` | Fetch `fetchRules('GROCERY')` → use `activePlan.campaignConfigs[0]` | Medium |

---

## Section C — Derivatives that are fine (no action needed)

These are computed client-side from API data. They will work correctly once Section B rewiring is done.

| Data | Source | Computed by |
|------|--------|-------------|
| **Streak** (current, longest, lastActiveDay) | Sales rows from `GET /sales` | `computeStreak()` in transformers |
| **Milestones** (₹1k/3k/5k/10k thresholds) | `monthToDateEarned` from `cs.finalIncentive` | Electronics transformer |
| **Leaderboard rank** (Electronics) | `storeEmployees[].finalIncentive` from `GET /incentives` | `buildMyRank()` in electronics transformer |
| **Next payout date** | None — pure date math | `dayjs().add(1,'month').date(7)` |
| **FNL pool sub-amounts** (saPool, smPayout, dmPayoutEach, saPayoutEach) | `storePool` + `roleSplit` from API | FNL transformer arithmetic |
| **FNL recent weeks trajectory** | `weeks[]` from API | FNL transformer mapping |
| **Grocery projections** (what-if scenarios) | `payoutSlabs` + `storeTarget` + `totalPiecesSold` from API | Grocery transformer |
| **Central totals** (orgPayoutMTD, employeesEligible, etc.) | Store-level rows from `GET /incentives` | Central transformer aggregation |
| **Central byVertical / byState / topStores** | Store-level + city-level rows from API | Central transformer grouping |
| **Achievement percentages** (all verticals) | `storeActual` / `storeTarget` from API | Various transformers |
| **BA contribution stats** (unitsSold, grossValue, topSkus) | Sales rows from `GET /sales` | `BrandAssociateHome` `useMemo` |

---

## Action Plan Summary

### Step 1 — Remove UI that will show empty/broken data (Section A)

Remove from **ElectronicsView**: `<BadgesStrip>`, `<QuestCard>`, `<OpportunityStrip>`
Remove from **GroceryView**: `<BadgesStrip>`, `<QuestCard>`, campaign leaderboard section, "vs last campaign" from MomentumPills, campaign metadata fields not in API
Remove from **FnlView**: `<BadgesStrip>`, `<QuestCard>`, 5-day eligibility card, staffing pill, `isCurrent` split matrix highlight
Remove from **RulesScreen**: Electronics "Step 1" (base slabs), Electronics "Exclusions", Grocery eligible articles, FNL ineligible statuses — keep only what API rules provide
Fix **ElectronicsView** hero: use `monthToDateEarned` instead of summing per-dept `finalPayout`
Hide "vs last month/campaign" from **MomentumPills** when previous period data is 0

### Step 2 — Rewire mock imports to API (Section B)

1. Multiplier tiers → prop-drill from hooks (items B1–B3)
2. Campaign/rules metadata → use hook data (items B4–B5)
3. StoreDetailDrawer flags → prop from parent (item B6)
4. StoreTransactions → API calls (item B7)
5. EmployeeDetailDrawer → API calls (items B8–B9)
6. RulesScreen → `fetchRules` per vertical (items B10–B12)
