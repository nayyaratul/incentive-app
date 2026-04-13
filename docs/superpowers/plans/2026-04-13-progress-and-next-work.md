# Reliance Incentive App — Progress & Next Work

**Status:** v0.5 (working POC across 9 personas, 3 verticals, mobile-only)
**Last updated:** 2026-04-13

This supersedes the original Phase 1 plan (`2026-04-13-incentive-app-phase-1-foundation.md`). Phases 2–5 were collapsed into rapid delivery sprints for a meeting demo and never got a formal plan doc. This file consolidates what's shipped vs what's open.

---

## 1. What's shipped

### Foundation (Phase 1) — ✅ done
- React 18.2 + Webpack 5 + SCSS Modules + Styled-Components scaffold
- Node 18 constraint, `--legacy-peer-deps`, env files per environment
- White-label design-token layer (primitive → semantic → `reliance-retail` theme)
- Gamification engine (4 pure functions with TDD, 23 passing tests): `computeStreak`, `computeGoalProgress`, `detectNewMilestones`, `buildLeaderboardView`

### Branding — ✅ done
- Official Reliance Retail SVG logo (colour + B/W variants) wired via `BrandLogo` atom
- Crimson `#BD2925` + navy `#2F427D` palette, pure black text, white surface
- Crimson signature strip at top of every header
- WCAG AA verified on every text/background pair
- **Unified hero treatment** — all SA/DM/BA heroes use the same brand-red tint gradient; all SM/Central heroes use navy (no more leftover saffron)

### Data layer — ✅ done
- 7 stores across Electronics, Grocery, F&L (incl. Trends Extension)
- 20+ employees covering every role (SM, DM, SA, BA) and every payroll state (ACTIVE, NOTICE_PERIOD, etc.)
- Article catalog with brief-accurate dummy SKUs (Vivo, Samsung, boAt, plus Cake Rush campaign articles)
- Incentive configs for all three verticals (Electronics 30-row slab table, Grocery campaign, F&L split matrix) — exact values from brief §6.4, §7.2, §8.6
- Calculated payouts per employee reflecting the brief's worked examples
- Central reporting roll-up (by-vertical, by-state, top stores, anomaly flags)
- Attendance / transactions / maker-checker log data files
- Streak extended to object shape `{ current, longest, lastActiveDay, kind, label, caption }` with Shape-1 semantics (presence + activity, pauses on off-days)
- Per-persona rank object with top-5 leaderboard peers

### Personas & routing — ✅ done
- `PersonaContext` + `PersonaProvider` with 9 personas
- `PersonaSwitcher` floating pill (top-right) + grouped modal
- `RootRouter` branches by role → `EmployeeHome` / `StoreManagerHome` / `BrandAssociateHome` / `CentralHome`

### Vertical views (SA/DM via `EmployeeHome`) — ✅ done
- `ElectronicsView`: earnings hero, streak, push-now opportunities, quests (brief-aligned), badges, compact dept-multiplier with disclosure, eligibility link
- `GroceryView`: campaign hero, streak, slabs, campaign leaderboard, article list, compliance link
- `FnlView`: week hero, streak, 5-day pip tracker, quests, split matrix, 4-week trajectory, compliance link

### Role-specific containers — ✅ done
- `StoreManagerHome` with tabs: Home (store achievement + roster) / Team / Rules / Transactions *(placeholder)*
- `BrandAssociateHome` with tabs: Home (ineligibility notice + contribution panel) / Rules
- `CentralHome` with tabs: Overview / Stores / Rules / Alerts (org totals, by-vertical, by-state, anomaly flags, rule catalog)

### Shared screens — ✅ done
- `RulesScreen` — tabbed by vertical (Electronics / Grocery / F&L); slab tables, multiplier ladder, exclusions, split matrix
- `HistoryScreen` — per-employee transaction log with period tabs (This month / All); summary strip + cards

### Navigation & shell — ✅ done
- Persona-specific bottom nav sets (SA/DM · BA · SM · CENTRAL each get their own items)
- `HeaderRankChip` in top-right of header for SA/DM → opens `LeaderboardDrawer` bottom-sheet
- `StreakNote` full-width bar below earnings hero
- `OfflineBanner` sticky top (listens to `navigator.onLine`)
- Mobile-only layout; centered narrow column on desktop viewports

### Gamification layer — ✅ done
- `StreakNote` (Shape 1 — presence + activity, always-positive)
- `BadgesStrip` (horizontal scroll, per-employee unlock state)
- `QuestCard` (brief-aligned only — rewards cite brief payouts, no invented ₹ bonuses)
- `LevelCard` component exists but intentionally not rendered (pending product discussion)
- `LeaderboardDrawer` (bottom-sheet, Top 5 + your row highlighted)

### Compliance / rules UX — ✅ done
- Shared `ComplianceLink` molecule → demoted disclosure used across every persona (consistent treatment, replaced the old big compliance cards)

### UI polish passes — ✅ done
- Typography (base 16 px, metadata ≥ 11 px, tabular nums on every amount)
- Brief-document `§` references removed from all user-facing copy
- Contrast pass (AA on every pair across dark + light surfaces)
- Hero-card consistency across personas

---

## 2. What's open / pending

### A. Transaction screens — ✅ done in this pass
- `TransactionDetailSheet` shared bottom-sheet renders the full 16-field §9 record + calc trace + copyable transaction ID
- `HistoryScreen` enhanced: search bar, transaction-type filter chips, "Incentive only" toggle, day-grouped list with "Today/Yesterday" headings, summary strip recalculates per filter, empty state with "Clear filters" shortcut, tap-to-detail
- `StoreTransactions` screen replaces SM placeholder: store-wide aggregated stream, employee-filter chips, role badges per row, 4-column summary (tx · gross · incentive · excluded), tap-to-detail
- Dummy data extended: 4 more Electronics employees with transactions so the SM view has volume; `getStoreTransactions(storeCode, employees)` helper added
- Central transactions browser intentionally skipped (admin-portal territory; not mobile-suitable)

### B. Administrative screens (deferred — admin-portal scope per user)
- Maker/Checker workflow actions (approve/reject configs) — app is read-only
- Config authoring (incentive rules, target uploads)
- Attendance upload

### C. Live integration (deferred — post-POC)
- JWT verification on redirect (pluggable `IdentityProvider` already scaffolded)
- Real admin-portal REST API wiring (currently reads `src/data/*.js`)
- PWA offline caching via Workbox (package installed, service worker not registered)
- Sentry DSN
- Analytics / event pipeline

### D. Product discussions open
- **Levels** — component built, not rendered; we agreed to discuss what the progression should mean
- **Languages** — English only for now; i18n layer exists (via `i18next` dependency) but not wired
- **Push notifications** — out of POC scope

### E. Polish candidates (lightweight, low priority)
- SM "Team" tab right now reuses the home roster card — could grow into its own roster screen with per-employee drill (sales by employee, eligibility detail)
- BA contribution panel could show the BA's own qty/value totals (currently shows SM's credited base)
- Central "Stores" tab is a top-5 list — a searchable directory would be more useful for ops

---

## 3. Next work: Transaction screens

Scope for this pass (keeping it mobile-only, POC-friendly, no invented mechanics):

### 3.1 Per-employee History (enhance existing `HistoryScreen`)

Current:
- List of transactions for the logged-in employee
- Period tabs: This month / All
- Per-tx card shows: date · id · brand · SKU · dept · family · qty · gross · incentive

Enhancements:
- **Search** by SKU, brand, or transaction ID
- **Filter chips** by transaction type (NORMAL / SFS / PAS / JIOMART)
- **Grouping by day** (e.g. "Today", "Yesterday", "Mon 11 Apr")
- **Earning-only toggle** — hide non-incentive transactions (excluded brands, SFS, etc.)
- **Stickier summary strip** — stays visible on scroll, shows filter-scoped totals

### 3.2 Store-wide Transactions (new, for `StoreManagerHome > Transactions`)

- Header: store name, tx count, date range picker (default: this month)
- **Filter row**: by employee, by department (Electronics) / by article (Grocery) / by day (F&L), by transaction type
- **Summary bar**: transactions · gross · final incentive · excluded count
- **List**: same tx cards as History but with employee ID badge per row
- **Empty states** for zero filter matches
- Single-tap on a tx opens a **full 16-field detail sheet** (brief §9 shape)

### 3.3 Transaction detail sheet (shared across personas)

- Bottom-sheet overlay
- Renders all 16 fields from brief §9 in a structured key-value layout
- Shows calculation trace: base incentive applied · multiplier applied · final payout
- Copyable transaction ID

### 3.4 Central Transactions (deferred inside this pass)

Central's tx drill-down is lower priority — a central user is unlikely to look at individual tx on a mobile app. Will keep a stub and flag "full transactions browser" as a Phase 2+ admin-portal concern.

---

## 4. Delivery order for the transaction work

1. `TransactionDetailSheet` (shared, used by both History and Store Tx)
2. Enhanced `HistoryScreen` (search + filters + grouping)
3. `StoreTransactions` screen replacing the SM placeholder
4. Wire StoreManagerHome `tx` tab to the new screen
5. Commit per milestone

Dummy data already supports this — `src/data/transactions.js` holds per-employee records; we'll extend with store-wide roll-ups for SM view.

---

## 5. Out of scope for this pass (explicit)

- Changes to rules / multiplier / streak / badges / quests / leaderboard
- Central transactions browser (deferred)
- Admin portal / maker-checker integration
- PWA offline caching implementation
- Real API integration
- Languages beyond English

Anything that surfaces as a tangent during implementation gets added to §2 "Open" rather than absorbed silently.
