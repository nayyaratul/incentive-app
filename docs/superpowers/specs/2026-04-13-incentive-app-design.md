# Reliance Retail Incentive App — Design Spec

**Date:** 2026-04-13
**Status:** Draft · awaiting user review
**Scope:** Sales-associate role, v1

---

## 1. Overview

A responsive, mobile-first React PWA that displays incentive structures, earnings, streaks, and leaderboards to Reliance Retail sales associates. The app is **read-only** in v1 — all configuration (rules, goals, milestones, scopes) is authored in a separate Reliance admin portal. The incentive app is reached via a redirect from another Reliance app, which passes a signed JWT carrying identity claims.

The brief is "modern, playful, gamified, easy for a blue-collar workforce." The design honours that through an earnings-first home, a streak-driven habit loop, milestone celebrations, and a store → city → region leaderboard — all built on a small set of well-bounded primitives.

---

## 2. Locked decisions

| Area | Decision |
|---|---|
| Audience v1 | Sales associates only, full 4-level incentive hierarchy (regional / city / store / role) |
| Home real-estate split | Earnings **75%** · Opportunity **20%** · Leaderboard **5%** (Rules & Profile in bottom nav only) |
| Home direction | **A — Quiet-confident** (linear hero + horizontal opportunity carousel) |
| Gamification core | Streaks + daily/weekly/monthly goals + milestone celebrations + leaderboard |
| Entry / auth | Signed JWT on redirect URL, verified by a pluggable `IdentityProvider`; session cookie post-verify |
| Data source | Direct axios calls to the Reliance admin-portal REST API; JWT injected via axios interceptor; 401 auto-refresh (no BFF) |
| Refresh cadence | Periodic pull — on app open + pull-to-refresh + 60s silent foreground poll |
| Language | English + Hindi toggle at launch; i18n layer sized for more later |
| Tech stack | Mirror ess-pwa: React 18.2 + React Router 5.1.2, Redux 4 + Thunk, Webpack 5, SCSS modules + Styled-Components, Axios + interceptors, i18next, Workbox PWA, Atomic Design, Node 18 |
| Styling | **SCSS modules + Styled-Components only** (no Bootstrap, no Tailwind, no utility framework) |
| Deployment | Standalone PWA; coded as if federatable into ess-pwa later (no hard shell dependencies) |
| White-label | Reliance Retail tokens surfaced via CSS custom properties + `theme.scss`; logo component; build-time manifest generation |
| Data for v1 | Dummy fixtures shipped in-repo; flipped to real API via `REACT_APP_USE_MOCK_DATA=false` |

---

## 3. Architecture

Single-page React 18 PWA. Client-only rendering, code-split by route, served as static assets behind a CDN. Installable on Android home screens; iOS Safari "Add to Home Screen" fallback.

### 3.1 Module layout

```
src/
├── index.js                       # Entry point
├── bootstrap.js                   # Redux, axios interceptors, i18n, auth, sentry
├── App.js                         # Root shell (IdentityProvider, ThemeProvider, Toaster)
├── Routes.js                      # Route table (React Router 5)
├── store.js                       # Combined Redux store
├── i18next.js                     # i18n setup (en, hi)
├── sentry.js                      # Error tracking
│
├── containers/                    # Page-level; each with its own Store/
│   ├── Home/
│   ├── Leaderboard/
│   ├── Rules/
│   ├── History/
│   └── Profile/
│
├── components/
│   ├── Atom/                      # Button, Chip, Avatar, Tag, Skeleton, StreakFlame
│   ├── Molecule/                  # EarningsCard, GoalBar, MilestoneToast, RankRow
│   ├── Organism/                  # BottomNav, HeaderBar, LeaderboardList
│   └── Widgets/                   # HomeEarningsHero, OpportunityStrip, LeaderboardTile
│
├── services/
│   ├── IdentityProvider/          # JWT verify + session; pluggable (mock vs real)
│   ├── ApiClient/                 # Axios instance + interceptors (auth, 401 retry)
│   ├── DummyDataProvider/         # API-shaped fixtures; same interface as ApiClient
│   └── GamificationEngine/        # Pure functions: streak, goals, milestones
│
├── hooks/                         # useIdentity, useEarnings, useLeaderboard, useStreak
├── context/                       # ThemeContext, IdentityContext
├── locales/
│   ├── en/translation.json
│   └── hi/translation.json
├── utils/                         # INR formatters, date helpers, a11y helpers
├── styles/
│   ├── theme.scss                 # Active brand import + CSS custom properties
│   ├── _tokens-primitive.scss     # Raw palette, scale
│   ├── _tokens-semantic.scss      # Component-facing semantic tokens
│   ├── _mixins.scss               # flex-center, stack, tap-target, truncate
│   └── globals.scss
├── themes/
│   └── reliance-retail.scss       # Brand → semantic token mapping
└── assets/
    └── brand/reliance-retail/     # Logo SVGs, manifest icons
```

### 3.2 Runtime flow (happy path)

1. Parent app → `https://incentives.reliance.retail/?token=<jwt>`
2. `IdentityProvider` verifies JWT signature + expiry, extracts `{employeeId, storeId, storeName, city, region, role, locale}`, drops the token from the URL (`history.replaceState`), sets a first-party session cookie, hydrates `IdentityContext`.
3. Axios interceptor attaches the bearer on every request; a 401 triggers one silent refresh, then bounces back to parent on failure.
4. Redux slices hydrate in parallel from `/me`, `/rules`, `/sales/mine`, `/earnings/mine`, `/streak/mine`, `/goals/mine`, `/milestones/mine`, `/leaderboard?scope=store&period=month`.
5. Home renders the earnings hero, opportunity strip, leaderboard mini-tile. Bottom nav is always present.
6. `DataSyncRoot` triggers silent refresh every 60s while `document.visibilityState === "visible"`; pull-to-refresh forces immediately.
7. `GamificationHost` recomputes streak + detects new milestones after every data refresh; celebrations fire via `<MilestoneOverlay>` at the shell.

### 3.3 Pluggable boundaries

| Boundary | Why it exists |
|---|---|
| `IdentityProvider` | Swap mock verifier for real JWKS-based verifier without touching UI |
| `ApiClient` / `DummyDataProvider` | Single env-flag swap between real API and fixtures |
| `ThemeContext` + theme file | Brand re-skin is a one-file change |
| `GamificationEngine` | Pure, deterministic, unit-testable |

### 3.4 Provider tree

```
<App>
  <IdentityProvider>
    <ThemeProvider>
      <ReduxProvider>
        <DataSyncRoot>
          <GamificationHost>
            <Router>
              <BottomNav />
              <Routes />
            </Router>
            <MilestoneOverlay />
            <Toaster />
          </GamificationHost>
        </DataSyncRoot>
      </ReduxProvider>
    </ThemeProvider>
  </IdentityProvider>
</App>
```

---

## 4. Screens & navigation

### 4.1 Routes

| Route | Component | Purpose |
|---|---|---|
| `/` | `Home` | Earnings hero · opportunity strip · leaderboard mini-tile |
| `/ranks` | `Leaderboard` | Toggle between store / city / region scopes; period = today/week/month |
| `/rules` | `Rules` | Incentive rules catalog, grouped by category (electronics / grocery / boosters) |
| `/history` | `History` | Sales history feed + earnings log by day |
| `/me` | `Profile` | Identity, language toggle, logout-back-to-parent |

### 4.2 Bottom navigation

Five items max (`bottom-nav-limit`): Home · Ranks · Rules · History · Me. Icons use SVG from **Lucide** (`lucide-react`), each with a visible label. Active state highlighted via `--brand` colour + weight 700.

### 4.3 Home composition (direction A)

1. **Header** — Reliance Retail logo, employee name greeting, streak chip (`🔥 7 day streak` / `Start your streak today`).
2. **Earnings hero (75%)** — "Earned this month" label · large ₹ amount · `+₹X today` subtext · linear monthly goal progress bar with % label.
3. **Opportunity strip (20%)** — Horizontal-scroll carousel of 3–5 top SKU × price-band combos with highest current payout; each card shows SKU, band, `₹ / sale`. "See all" link → Rules.
4. **Leaderboard mini-tile (5%)** — Rank badge · "You're #3 in store · +₹40 to #2" · chevron to `/ranks`.
5. **Celebrations** — Full-screen confetti + toast fired by `<MilestoneOverlay>` when a milestone is newly crossed.

### 4.4 Global UI rules

- Min body text 14px, input 16px (iOS Safari auto-zoom rule).
- Tap targets ≥ 44×44pt; enforced via `@include tap-target` mixin.
- Focus rings global and non-removable.
- Motion respects `prefers-reduced-motion`.

---

## 5. Data model & API contract

### 5.1 Domain entities

```js
Employee {
  id: "EMP-0041",
  name: "Rohit Sharma",
  role: "sales_associate",
  storeId: "STR-MUM-0117",
  storeName: "Reliance Digital, Andheri West",
  city: "MUM",
  region: "WEST",
  locale: "en" | "hi"
}

IncentiveRule {
  id: "RULE-EL-001",
  scope: { level: "store"|"city"|"region"|"role", value: "STR-MUM-0117" },
  category: "ELECTRONICS",
  sku: "VIVO-Y28" | null,
  priceBand: { min: 15000, max: 20000, currency: "INR" },
  payout: { amount: 90, currency: "INR" },
  validFrom: "2026-04-01T00:00:00Z",
  validTo:   "2026-04-30T23:59:59Z",
  boost: null | { multiplier: 1.5, reason: "Weekend push" }
}

SaleEvent {
  id: "SALE-7713",
  employeeId: "EMP-0041",
  ruleId: "RULE-EL-001",
  sku: "VIVO-Y28",
  salePrice: 17499,
  earned: 90,
  soldAt: "2026-04-13T11:42:00+05:30"
}

Earnings {
  today:     { amount: 180, count: 2 },
  thisWeek:  { amount: 920, count: 11 },
  thisMonth: { amount: 4280, count: 47 },
  lifetime:  { amount: 48120, count: 612 }
}

Streak {
  current: 7,
  longest: 14,
  lastQualifyingDay: "2026-04-13"
}

Goal {
  period: "daily" | "weekly" | "monthly",
  target: 7000,
  currency: "INR"
}

Milestone {
  id: "MS-5000",
  threshold: 5000,
  period: "monthly",
  label: "₹5,000 this month",
  celebration: "confetti" | "toast" | "both",
  crossed: false
}

LeaderboardEntry {
  employeeId: "EMP-0041",
  displayName: "Rohit S.",
  avatarUrl: null,
  rank: 3,
  earnings: 4280,
  isSelf: true
}

Leaderboard {
  scope: "store" | "city" | "region",
  scopeId: "STR-MUM-0117",
  period: "today" | "week" | "month",
  entries: LeaderboardEntry[],
  myEntry: LeaderboardEntry
}
```

### 5.2 API endpoints (v1)

All responses wrapped `{ data, meta }` for forward-compat. Axios interceptor injects `Authorization: Bearer <jwt>`.

| Method | Endpoint | Returns |
|---|---|---|
| GET | `/api/v1/me` | `Employee` |
| GET | `/api/v1/rules?scope=mine&active=true` | `IncentiveRule[]` |
| GET | `/api/v1/sales/mine?from=&to=` | `SaleEvent[]` |
| GET | `/api/v1/earnings/mine` | `Earnings` |
| GET | `/api/v1/streak/mine` | `Streak` |
| GET | `/api/v1/goals/mine` | `Goal[]` |
| GET | `/api/v1/milestones/mine` | `Milestone[]` |
| GET | `/api/v1/leaderboard?scope=store&period=month` | `Leaderboard` |

Scope-merging (store rules apply on top of city rules, etc.) is owned by the backend.

---

## 6. Dummy data strategy

- Fixtures in `src/services/DummyDataProvider/fixtures/`, mirroring endpoints: `me.json`, `rules.json`, `sales.json`, `earnings.json`, `streak.json`, `goals.json`, `milestones.json`, `leaderboard-store.json`, `leaderboard-city.json`, `leaderboard-region.json`.
- `DummyDataProvider` implements the same method signatures and return shapes as the real `ApiClient`, wrapped in `Promise.resolve()` with a 200–400 ms artificial delay so skeletons/loading states are realistic.
- **Dev-only time simulator** tick advances a mock clock so streaks increment and milestones fire without editing JSON. Exposed via a debug drawer (dev builds only).
- Flip is one env var: `REACT_APP_USE_MOCK_DATA=true|false`. `bootstrap.js` wires the active provider.
- **Seed data:** Rohit Sharma (EMP-0041, STR-MUM-0117, MUM, WEST), ~8 rules across electronics/grocery, ~50 sales spanning 30 days, leaderboards with 15 entries in-store + 3 cities + 2 regions.

---

## 7. Gamification engine

Pure functions at `src/services/GamificationEngine/`. No I/O, no React, unit-testable.

### 7.1 `computeStreak(sales, today, tz = "Asia/Kolkata")`

- Qualifying day = ≥1 `SaleEvent` with `earned > 0` in employee timezone.
- `current` = consecutive qualifying days ending at `today`. If today has no sale yet, streak is *alive* (render `🔥 7 · extend today`).
- `longest` = max run in the provided window.
- One missed day resets to 0. No freeze tokens in v1.
- Memoised on sales-array reference.

### 7.2 `computeGoalProgress(earnings, goals)`

Returns per-period `{ period, earned, target, pct, remaining, state }` where `state ∈ {"behind", "on-track", "ahead", "hit", "exceeded"}` derived from `pct` vs elapsed fraction of the period. Home surfaces monthly; daily/weekly visible via tap-through.

### 7.3 `detectNewMilestones(milestones, earnings, alreadyCelebrated)`

- Returns milestones newly crossed since last call that haven't been celebrated in the current period bucket.
- Bucket key = `${milestone.id}:${periodBucket(milestone.period, now)}`, stored in `localStorage` under `incentive.celebrated.v1`. Period rollover clears automatically because the key changes.
- Server-returned `crossed: true` on first load marks celebrated without animation (don't celebrate history).
- Deterministic from inputs → offline-safe; fires correctly when data finally syncs.

### 7.4 `buildLeaderboardView(lb, me)`

- Trims to top 20 + `myEntry` pinned if outside top 20 (with `…` separator).
- Computes `delta` relative to self for each row: `"+₹40 to #2"`, `"#4 is ₹25 behind you"`. Powers the home mini-tile.
- Privacy: default `"Rohit S."`; full names gated by per-region admin flag.

### 7.5 Orchestration

`GamificationHost` subscribes to `sales` + `earnings` Redux slices, runs the four functions on change, writes results to a `gamification` slice, mounts `<MilestoneOverlay>` for celebrations. Milestone overlay respects `prefers-reduced-motion` (toast + `navigator.vibrate(200)` fallback).

### 7.6 Tests shipped with v1

Jest unit tests around the four pure functions. Fixtures cover: no sales, one sale today, 7-day run, broken day, ahead/behind/exceeded goal states, milestone first-cross, idempotent re-run, period rollover.

---

## 8. White-label theming

### 8.1 Token layers

1. **Primitives** (`_tokens-primitive.scss`) — raw palette, never referenced by components.
2. **Semantic** (`_tokens-semantic.scss`) — CSS custom properties that components consume: `--brand`, `--brand-contrast`, `--accent`, `--surface`, `--surface-raised`, `--text-primary`, `--text-secondary`, `--success`, `--warn`, `--error`, plus radius/shadow/spacing/motion scales.
3. **Theme** (`themes/reliance-retail.scss`) — maps CSS variables to primitives for the Reliance Retail brand. Re-skin = replace this file.

### 8.2 Typography

- Primary: Inter (14/16/20/24/32/40).
- Devanagari fallback: Noto Sans Devanagari — loaded conditionally when `locale === "hi"`.
- `font-variant-numeric: tabular-nums` on all amount displays so values don't jitter on update.
- Min body 14px; min input 16px.

### 8.3 Brand assets

- `assets/brand/reliance-retail/logo.svg` (full colour), `logo-mono.svg`, favicon set, apple-touch-icon, PWA manifest icons.
- `BrandLogo` atom with `variant="full"|"mono"|"icon-only"`. Alt text via i18n key `brand.logoAlt`.
- `manifest.webmanifest` generated by `scripts/build-manifest.js` from the active theme file so the installed PWA wears the brand name + theme colour.

### 8.4 Motion tokens

```
--dur-fast:   120ms
--dur-med:    220ms
--dur-slow:   320ms
--ease-out:   cubic-bezier(0.2, 0.7, 0.2, 1)
--ease-spring: cubic-bezier(0.4, 1.6, 0.5, 1)
```

`prefers-reduced-motion` disables anything above `--dur-fast`.

### 8.5 A11y guardrails

- Semantic token pairs hit WCAG AA on the Reliance palette; a Jest test uses `wcag-contrast` to lint new pairs.
- Global `:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }` — non-removable.
- `@include tap-target` required on any `cursor: pointer` element (lint rule).

### 8.6 Dark mode

Not shipped in v1. Tokens authored so a dark theme is an additive `@media (prefers-color-scheme: dark)` block — half a day to add later.

---

## 9. Error handling, edge cases, offline

### 9.1 Error boundaries

- **Shell boundary** at `<App>` — catastrophic failure renders a branded "Something went wrong · reopen from the main app" with Sentry event ID.
- **Per-route boundary** — screen-level failure shows "This screen couldn't load · [Try again]"; bottom nav still works.
- **GamificationHost boundary** — engine failure logs and renders without celebrations; never blocks earnings view.

### 9.2 API failure taxonomy

| Case | Handling |
|---|---|
| 401 | One silent refresh, then redirect to parent app |
| 403 | Role-scoped empty state, no retry |
| 404 on `/me` | "Employee not provisioned" empty state |
| 5xx / network | Last cached data + top banner "Showing data from *N min ago · [Retry]"; backoff 2s → 5s → 15s; user action resets |
| Timeout (>10s) | Same as 5xx |
| Malformed payload (Zod-style validator at boundary) | Log to Sentry, render last-known-good, banner "Syncing…" |

All strings via i18n keys.

### 9.3 Empty states

- **Home — no sales this month:** "Your first sale unlocks ₹ here" + Lottie + link to Rules.
- **Home — streak 0:** "Start your streak today" in the streak chip.
- **Leaderboard — lone user in scope:** "You're alone on top — first on the board."
- **Rules — no active rules:** "No active incentives for [store] this month — check back Monday."
- **History — no sales:** "Your sales log will appear here after your first qualifying sale."

### 9.4 Offline / flaky network

- Workbox precaches app shell (HTML/JS/CSS/logo/fonts).
- Runtime cache: `stale-while-revalidate`, 24-hour TTL. First paint from cache, background refresh updates Redux.
- Offline banner mounted at shell — `navigator.onLine` + `/me` heartbeat, shows "Offline — showing saved data · last sync HH:mm."
- No pending-actions queue in v1 (read-only app); design leaves room for v2.
- `now` for streak math read from server `Date` response header to prevent streak-gaming via device clock change.

### 9.5 Edge cases

- **Role mismatch in JWT** → "This app isn't ready for your role yet."
- **Expired JWT on first call** → 401 path.
- **Rules with SKU × band overlap** → client-side "highest payout wins" as safety net + Sentry log.
- **Past-dated milestones already crossed** → marked celebrated without animation.
- **Dual tabs** → shared localStorage celebrated-set prevents double-fire.
- **Stale redirect token** → 401 path, URL always cleaned on first paint.
- **Indian formatting** (₹12,34,567) via `Intl.NumberFormat('en-IN')` / `'hi-IN'`, `maximumFractionDigits: 0`.

---

## 10. Observability & performance

- **Sentry** (mirrors ess-pwa). `employeeId` hashed before send. No PII in breadcrumbs.
- **Analytics events** via `events.js` constants: `home_viewed`, `leaderboard_scope_changed`, `milestone_celebrated`, `streak_broken`, `rules_viewed`. Transport TBD (Branch / GTM / no-op).
- **Dev debug drawer** (stripped in prod): JWT claims, cache timestamps, next poll in, force-trigger milestone, advance mock clock.

### Performance budgets

- Initial JS ≤ **180KB gzip**
- LCP ≤ **2.0s** on mid-tier Android / 4G
- Route transitions ≤ **200ms** with skeleton
- Idle: no polling while `visibilityState === "hidden"`

---

## 11. Out of scope for v1

- Cashier and delivery roles (config-driven in v2).
- Badges, levels, contests, quests.
- Push notifications.
- Write actions (acknowledgements, reactions, disputes).
- Dark mode.
- Server-authoritative streak/milestone (client-side in v1 is good enough for display).
- Dispute flow for incorrect earnings (handled via admin portal).
- Multi-employee device sharing.
- Real-time / WebSocket updates.
- BFF / response-shaping service.
- Storybook (can be added later alongside component growth).

---

## 12. Open items / to confirm with integration team

- JWKS endpoint or shared secret for JWT verification.
- Exact parent-app redirect domain + post-auth bounce-back URL.
- Admin-portal API base URL per environment (dev / QA / UAT / prod).
- Whether Reliance infra mandates a specific analytics transport.
- Confirmation that the admin portal can expose mobile-shaped endpoints (`/leaderboard` trimmed, `/rules?scope=mine`). If not, we layer a thin response-shaping adapter inside `ApiClient` — not a full BFF.
- Language launch-set (English + Hindi agreed; confirm no regional languages required at launch).
- Whether installed-PWA naming ("Reliance Incentives") needs formal brand approval.

---

## Appendix A — Dependencies (target)

Based on ess-pwa package.json, trimmed to what v1 needs:

- `react@^18.2.0`, `react-dom@^18.2.0`
- `react-router@5.1.2`, `react-router-dom@5.1.2`
- `redux@4.0.4`, `react-redux@^8.1.3`, `redux-thunk@2.3.0`
- `axios@^1.6.2`
- `styled-components@^6.1.8`
- `sass@1.49.7`, `classnames@2.2.6`
- `i18next@17.2.0`, `react-i18next@10.13.1`, `i18next-browser-languagedetector@3.1.1`
- `workbox-*@5.1.4` suite
- `@sentry/react`, `@sentry/tracing`
- `dayjs@^1.11.10` (matches ess-pwa)
- `lucide-react` (icon library)
- `lottie-react@^2.4.0` (celebrations)
- `pulltorefreshjs@^0.1.22`
- `react-secure-storage@^1.3.2`
- `universal-cookie@^6.1.1`
- `uuid@8.3.2`
- Build: Webpack 5 (mirrored from ess-pwa config), Node 18

**Explicitly excluded:** `bootstrap`, `react-bootstrap`, any UI framework / utility CSS.

---

## Appendix B — Directory bootstrap checklist (for implementation plan)

1. `npm init` with Node 18 engines constraint.
2. Webpack 5 config mirrored from ess-pwa `config/webpack.config.js`, trimmed.
3. ESLint + Prettier mirrored from ess-pwa.
4. `src/` skeleton matching §3.1.
5. `.env.dev`, `.env.qa`, `.env.uat`, `.env.prod` with `REACT_APP_*` variables.
6. `.gitignore` including `.superpowers/`, `node_modules/`, `build/`, `.env.local`.
7. Workbox service worker registration in `index.js`.
8. Sentry init in `sentry.js` behind env flag.
9. First fixture + smoke test for `DummyDataProvider` + `GamificationEngine`.
10. One route (`/`) rendering a static "Hello Rohit" page to prove the chain end-to-end before building real containers.

---

*End of spec.*
