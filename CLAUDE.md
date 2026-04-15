# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Incentive App is a mobile-first React SPA for managing sales incentives at Reliance Retail. It tracks earnings, payouts, streaks, leaderboards, and milestones across multiple user personas and retail verticals. Currently runs entirely on mock data (no live API).

## Commands

```bash
npm start                # Dev server on :3000 with HMR
npm run build:dev        # Production build using .env.dev
npm run build:prod       # Production build using .env.prod
npm run lint             # ESLint (src/**/*.{js,jsx})
npm run format           # Prettier (src/**/*.{js,jsx,scss,json})
npm test                 # Jest single run
npm run test:watch       # Jest watch mode
npm run test:coverage    # Jest with coverage report
```

## Architecture

**Stack:** React 18 + Webpack 5 + SCSS Modules. No Next.js. No TypeScript. Webpack alias `@` → `src/`.

**Routing:** Role-based, not URL-based. `App.jsx` wraps everything in `PersonaProvider`. `RootRouter` reads `active.role` from PersonaContext and renders the matching home container:
- `SA` → `EmployeeHome` (internally splits by `active.vertical`: Electronics, Grocery, F&L)
- `SM`/`DM` → `StoreManagerHome`
- `BA` → `BrandAssociateHome`
- `CENTRAL` → `CentralHome`

Tabs within each home container use local `useState`, not React Router.

**Component hierarchy:** Atomic Design — `components/Atom/`, `components/Molecule/`, `components/Organism/`, `components/Widgets/`. Containers live in `containers/`. All components are functional with hooks.

**State:** React Context only (`PersonaContext`, `TabContext`). Redux is in `package.json` but not used.

**Data:** 100% mock data in `src/data/`. Key files: `personas.js` (role definitions), `masters.js` (employees, stores, verticals), `payouts.js`, `configs.js` (targets, actuals, tiers), `gamification.js`, `transactions.js`. The `REACT_APP_USE_MOCK_DATA` env var exists for future API toggle.

**Services:** `src/services/GamificationEngine/` contains pure functions (`computeStreak`, `computeGoalProgress`, `buildLeaderboardView`, `detectNewMilestones`) — these are the only unit-tested files.

## Styling

- **CSS Modules** (`.module.scss`) for all component styles. No CSS-in-JS, no Tailwind.
- **Two-layer design tokens:** primitive SCSS variables in `styles/_tokens-primitive.scss`, semantic CSS custom properties in `styles/_tokens-semantic.scss`. Components reference semantic tokens (`--brand`, `--text-primary`, `--surface-card`, `--radius-card`, etc.).
- **Brand theme:** `themes/reliance-retail.scss` — crimson `#BD2925`, navy `#2F427D`, WCAG AA verified.
- **Typography:** Instrument Sans (body), Fraunces (hero display amounts), Geist Mono (numeric data). Loaded via Google Fonts in `public/index.html`.
- **Global classes:** `.rise-1` through `.rise-7` for staggered entrance animations, `.display` for Fraunces, `.mono` for monospace.

## Code Style

- Prettier: 100 char width, single quotes, ES5 trailing commas, semicolons, 2-space indent.
- ESLint: `prop-types` off, `react-in-jsx-scope` off (automatic JSX runtime). Unused vars are warnings (underscore-prefixed args ignored).

## Personas & Business Logic

Five roles with distinct data flows:
- **SA (Sales Associate):** Vertical-specific earnings — Electronics (multiplier-tiered by dept), Grocery (store achievement %, equal split), F&L (weekly, attendance-gated 5/7 days).
- **SM/DM (Store/Dept Manager):** Roster view, store metrics, per-employee payout breakdown.
- **BA (Brand Associate):** Read-only; incentive attributed to SM, shows ineligible notice.
- **CENTRAL:** Org-wide drill-down, maker-checker workflow.

Data is keyed by `storeCode`, `employeeId`, `vertical`, and `role`.

## Deployment

Deployed to Vercel. SPA rewrite configured in `vercel.json` (all routes → `index.html`). Node version is set in the Vercel dashboard, not in `package.json`. Four environment tiers: dev, qa, uat, prod (each has a `.env.*` file).
