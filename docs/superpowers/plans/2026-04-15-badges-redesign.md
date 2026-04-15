# Badges Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat `BadgesStrip` with metallic medallion coins (bronze/silver/gold) on home and a full-height bottom-sheet trophy case drawer behind a "View all" chip.

**Architecture:** Bottom-up — add coin-fill design tokens first, backfill existing badge data with `rarity` + `category` fields, extract pure sort logic (TDD-tested), build the `Medallion` atom, then two drawers (`BadgeDetailDrawer`, `TrophyCaseDrawer`), finally refactor `BadgesStrip` to compose everything. `BadgesStrip` stays the single integration point so all three vertical views pick up the redesign untouched. No new routes; drawer surfaces stack off home.

**Tech Stack:** React 18, SCSS Modules, Nexus `Drawer` (`src/nexus/molecules/Drawer/Drawer.jsx`), Jest 29 for pure-logic tests (no React Testing Library — matches project convention). Design tokens in `src/nexus/styles/tokens.scss`.

**Spec:** `docs/superpowers/specs/2026-04-15-badges-redesign-design.md`

---

## File Structure

| Action | Path | Responsibility |
|---|---|---|
| Modify | `src/nexus/styles/tokens.scss` | Add 6 new coin-fill/rim tokens (light + dark theme) |
| Modify | `src/data/gamification.js` | Add `rarity` + `category` to all 11 badge objects |
| Create | `src/components/Widgets/BadgesStrip/badgeSort.js` | Pure helpers: `sortBadgesForStrip`, `isNewBadge` |
| Create | `src/components/Widgets/BadgesStrip/badgeSort.test.js` | Jest tests for both helpers |
| Create | `src/components/Atom/Medallion/Medallion.jsx` | Coin-style medallion atom (pure presentation) |
| Create | `src/components/Atom/Medallion/Medallion.module.scss` | Medallion sizes, rarity variants, locked, newly-unlocked pulse |
| Create | `src/components/Organism/BadgeDetailDrawer/BadgeDetailDrawer.jsx` | Single-badge detail sheet |
| Create | `src/components/Organism/BadgeDetailDrawer/BadgeDetailDrawer.module.scss` | Detail sheet styles |
| Create | `src/components/Organism/TrophyCaseDrawer/TrophyCaseDrawer.jsx` | Full-height drawer with stats / tabs / grid |
| Create | `src/components/Organism/TrophyCaseDrawer/TrophyCaseDrawer.module.scss` | Trophy case styles |
| Modify | `src/components/Widgets/BadgesStrip/BadgesStrip.jsx` | Render `Medallion`s, own drawer state, wire up view-all chip |
| Modify | `src/components/Widgets/BadgesStrip/BadgesStrip.module.scss` | New medallion row + view-all chip styles; remove old card styles |

---

## Task 1: Add medal coin-fill + rim tokens

**Files:**
- Modify: `src/nexus/styles/tokens.scss` (add after line 206 in light theme; after line 332 in dark theme)

- [ ] **Step 1: Add light-theme coin tokens**

Open `src/nexus/styles/tokens.scss`. Find the existing `/* Medal — leaderboard podium ... */` block in the `:root` section (around line 203). Immediately after the closing line (`--medal-bronze: #B86F4A;`), insert:

```scss
  /* Medal coin — gradient fill + rim for Medallion atom.
     Kept distinct from the single-color --medal-{gold,silver,bronze} accents
     used by the leaderboard podium; those remain untouched. */
  --medal-fill-gold:   radial-gradient(circle at 30% 25%, #FFE999 0%, #F7D973 40%, #B58400 100%);
  --medal-fill-silver: radial-gradient(circle at 30% 25%, #FBFBFD 0%, #E5E7EB 40%, #9CA3AF 100%);
  --medal-fill-bronze: radial-gradient(circle at 30% 25%, #F6D9B3 0%, #E7BE8A 40%, #B57832 100%);
  --medal-rim-gold:   #E6B820;
  --medal-rim-silver: #C9CFD9;
  --medal-rim-bronze: #C88A4A;
```

- [ ] **Step 2: Add dark-theme coin tokens**

Find the mirror `/* Medal — leaderboard podium ... */` block inside the `[data-theme='dark']` section (around line 329). Immediately after `--medal-bronze: #D78A63;`, insert:

```scss
  /* Medal coin — dark theme. Slightly deeper lows so the coin still reads
     as metallic against an elevated dark surface; highlight stops lifted
     marginally so the bevel still catches. */
  --medal-fill-gold:   radial-gradient(circle at 30% 25%, #FFEDA8 0%, #E8C354 45%, #8F6700 100%);
  --medal-fill-silver: radial-gradient(circle at 30% 25%, #F1F3F7 0%, #BFC5D0 45%, #6C7280 100%);
  --medal-fill-bronze: radial-gradient(circle at 30% 25%, #F0C69A 0%, #C58A57 45%, #7B4F24 100%);
  --medal-rim-gold:   #D4A437;
  --medal-rim-silver: #AEB4C0;
  --medal-rim-bronze: #A3623A;
```

- [ ] **Step 3: Commit**

```bash
git add src/nexus/styles/tokens.scss
git commit -m "feat(tokens): add --medal-fill-* and --medal-rim-* coin tokens"
```

---

## Task 2: Backfill rarity + category on all badges

**Files:**
- Modify: `src/data/gamification.js` (replace the `badgesByEmployee` block starting at line 25)

- [ ] **Step 1: Replace the badgesByEmployee export**

Open `src/data/gamification.js`. Replace the entire `export const badgesByEmployee = { ... };` block (approximately lines 25–43) with:

```js
export const badgesByEmployee = {
  'EMP-0041': [
    { id: 'first-sale',     icon: '🎯', label: 'First sale',     note: 'Made your first qualifying sale this month',        unlockedAt: '2026-04-01T10:32:00', rarity: 'bronze', category: 'milestone' },
    { id: 'streak-7',       icon: '🔥', label: '7-day streak',   note: 'Qualifying sale every day for 7 days',              unlockedAt: '2026-04-13T12:01:00', rarity: 'gold',   category: 'streak' },
    { id: 'multiplier-120', icon: '🎉', label: 'Dept at 120%',   note: 'Large Appliances crossed 120% — paying 1.20× rate', unlockedAt: '2026-04-11T17:22:00', rarity: 'silver', category: 'sales' },
    { id: 'tv-premium',     icon: '📺', label: 'Premium TV',     note: 'Sold a TV in the ₹60k+ top-incentive band',          unlockedAt: null,                  rarity: 'silver', category: 'sales' },
    { id: 'all-depts',      icon: '🧭', label: 'All depts',      note: 'Made at least one qualifying sale in every dept',    unlockedAt: null,                  rarity: 'gold',   category: 'milestone' },
  ],
  'GRC-2203': [
    { id: 'first-campaign', icon: '🎂', label: 'Campaign opener', note: 'Sold your first eligible article in the campaign',   unlockedAt: '2026-04-15T11:20:00', rarity: 'bronze', category: 'milestone' },
    { id: 'store-100',      icon: '🎯', label: 'Store at 100%',   note: 'Store crosses target — unlocks ₹2/pc per brief',     unlockedAt: null,                  rarity: 'silver', category: 'milestone' },
    { id: 'all-brands',     icon: '✨', label: 'Every brand',     note: 'Sold at least one piece from every campaign brand',  unlockedAt: '2026-04-18T14:15:00', rarity: 'gold',   category: 'sales' },
  ],
  'FNL-3103': [
    { id: 'full-week',      icon: '📅', label: 'Full week present', note: '7 PRESENT days — exceeds the weekly minimum',     unlockedAt: '2026-04-18T19:00:00', rarity: 'silver', category: 'streak' },
    { id: 'first-qualify',  icon: '✅', label: 'Store qualified',   note: 'Store beat the weekly target — pool unlocked',    unlockedAt: '2026-04-11T20:00:00', rarity: 'bronze', category: 'milestone' },
    { id: 'consistency',    icon: '🏆', label: '3 weeks in a row',  note: 'Store qualified three consecutive weeks',         unlockedAt: null,                  rarity: 'gold',   category: 'streak' },
  ],
};
```

- [ ] **Step 2: Verify existing tests still pass**

Run: `npm test -- --testPathPattern="GamificationEngine"`
Expected: All existing tests PASS (the new fields are additive and don't affect any computation).

- [ ] **Step 3: Commit**

```bash
git add src/data/gamification.js
git commit -m "feat(badges): backfill rarity and category on all badges"
```

---

## Task 3: Pure sort + isNew helpers (TDD)

**Files:**
- Create: `src/components/Widgets/BadgesStrip/badgeSort.js`
- Create: `src/components/Widgets/BadgesStrip/badgeSort.test.js`

- [ ] **Step 1: Write the failing test file**

Create `src/components/Widgets/BadgesStrip/badgeSort.test.js`:

```js
import { isNewBadge, sortBadgesForStrip } from './badgeSort';

describe('isNewBadge', () => {
  const now = new Date('2026-04-15T12:00:00');

  test('returns true when unlockedAt is within the last 24h', () => {
    expect(isNewBadge('2026-04-14T13:00:00', now)).toBe(true);
  });

  test('returns false when unlockedAt is older than 24h', () => {
    expect(isNewBadge('2026-04-14T11:00:00', now)).toBe(false);
  });

  test('returns false when unlockedAt is null (locked)', () => {
    expect(isNewBadge(null, now)).toBe(false);
  });

  test('returns false when unlockedAt is undefined', () => {
    expect(isNewBadge(undefined, now)).toBe(false);
  });

  test('returns false when unlockedAt is in the future (clock skew)', () => {
    expect(isNewBadge('2026-04-15T13:00:00', now)).toBe(false);
  });
});

describe('sortBadgesForStrip', () => {
  const now = new Date('2026-04-15T12:00:00');

  const mk = (id, rarity, unlockedAt) => ({ id, rarity, unlockedAt });

  test('newly-unlocked (within 24h) comes first regardless of rarity', () => {
    const input = [
      mk('a', 'gold',   '2026-04-10T10:00:00'), // older
      mk('b', 'bronze', '2026-04-14T14:00:00'), // new
    ];
    const out = sortBadgesForStrip(input, now);
    expect(out.map((b) => b.id)).toEqual(['b', 'a']);
  });

  test('among earned-not-new, orders by rarity gold > silver > bronze', () => {
    const input = [
      mk('b', 'bronze', '2026-04-01T10:00:00'),
      mk('s', 'silver', '2026-04-01T10:00:00'),
      mk('g', 'gold',   '2026-04-01T10:00:00'),
    ];
    const out = sortBadgesForStrip(input, now);
    expect(out.map((b) => b.id)).toEqual(['g', 's', 'b']);
  });

  test('within same rarity, more-recent unlockedAt comes first', () => {
    const input = [
      mk('old', 'silver', '2026-04-01T10:00:00'),
      mk('new', 'silver', '2026-04-10T10:00:00'),
    ];
    const out = sortBadgesForStrip(input, now);
    expect(out.map((b) => b.id)).toEqual(['new', 'old']);
  });

  test('locked badges come after all earned badges', () => {
    const input = [
      mk('locked', 'gold',   null),
      mk('earned', 'bronze', '2026-04-01T10:00:00'),
    ];
    const out = sortBadgesForStrip(input, now);
    expect(out.map((b) => b.id)).toEqual(['earned', 'locked']);
  });

  test('among locked badges, orders by rarity gold > silver > bronze', () => {
    const input = [
      mk('lb', 'bronze', null),
      mk('ls', 'silver', null),
      mk('lg', 'gold',   null),
    ];
    const out = sortBadgesForStrip(input, now);
    expect(out.map((b) => b.id)).toEqual(['lg', 'ls', 'lb']);
  });

  test('does not mutate the input array', () => {
    const input = [
      mk('b', 'bronze', '2026-04-01T10:00:00'),
      mk('g', 'gold',   '2026-04-01T10:00:00'),
    ];
    const before = input.map((b) => b.id).join(',');
    sortBadgesForStrip(input, now);
    expect(input.map((b) => b.id).join(',')).toBe(before);
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- --testPathPattern="badgeSort"`
Expected: FAIL — "Cannot find module './badgeSort'".

- [ ] **Step 3: Write the minimal implementation**

Create `src/components/Widgets/BadgesStrip/badgeSort.js`:

```js
// Pure helpers for BadgesStrip. Kept separate so the sort rules can be
// unit-tested without needing to render any React.

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

const RARITY_ORDER = { gold: 0, silver: 1, bronze: 2 };

/**
 * True iff the badge was unlocked within the last 24 hours. Returns false for
 * null / undefined / future timestamps.
 */
export function isNewBadge(unlockedAt, now = new Date()) {
  if (!unlockedAt) return false;
  const unlocked = new Date(unlockedAt).getTime();
  if (Number.isNaN(unlocked)) return false;
  const elapsed = now.getTime() - unlocked;
  return elapsed >= 0 && elapsed < TWENTY_FOUR_HOURS_MS;
}

/**
 * Returns a new array of badges ordered for the home shelf:
 *   1. newly-unlocked (within 24h) first
 *   2. then earned badges by rarity gold > silver > bronze
 *   3. within the same rarity, more-recent unlocks first
 *   4. locked badges last, also ordered gold > silver > bronze
 *
 * Does not mutate the input.
 */
export function sortBadgesForStrip(badges, now = new Date()) {
  return [...badges].sort((a, b) => {
    const aNew = isNewBadge(a.unlockedAt, now);
    const bNew = isNewBadge(b.unlockedAt, now);
    if (aNew !== bNew) return aNew ? -1 : 1;

    const aLocked = !a.unlockedAt;
    const bLocked = !b.unlockedAt;
    if (aLocked !== bLocked) return aLocked ? 1 : -1;

    const rarityDiff = (RARITY_ORDER[a.rarity] ?? 99) - (RARITY_ORDER[b.rarity] ?? 99);
    if (rarityDiff !== 0) return rarityDiff;

    // Most recent unlockedAt first (applies only to earned; locked have null and tie).
    if (a.unlockedAt && b.unlockedAt) {
      return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
    }
    return 0;
  });
}
```

- [ ] **Step 4: Run the tests and verify they pass**

Run: `npm test -- --testPathPattern="badgeSort"`
Expected: All 11 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Widgets/BadgesStrip/badgeSort.js src/components/Widgets/BadgesStrip/badgeSort.test.js
git commit -m "feat(badges): pure sort + isNew helpers with tests"
```

---

## Task 4: Medallion atom

**Files:**
- Create: `src/components/Atom/Medallion/Medallion.jsx`
- Create: `src/components/Atom/Medallion/Medallion.module.scss`

- [ ] **Step 1: Write the SCSS module**

Create `src/components/Atom/Medallion/Medallion.module.scss`:

```scss
/* Medallion — coin-style badge visual.
   Rarity variants reference --medal-fill-* + --medal-rim-* tokens added
   in src/nexus/styles/tokens.scss. Sizes: sm 44px, md 54px, lg 96px. */

.medallion {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  border: 2px solid transparent;
  background: transparent;
  cursor: pointer;
  padding: 0;
  box-shadow:
    0 4px 10px rgba(0, 0, 0, 0.15),
    inset 0 2px 0 rgba(255, 255, 255, 0.5),
    inset 0 -3px 6px rgba(0, 0, 0, 0.18);
  transition: transform 150ms ease-out;

  &:hover { transform: translateY(-1px); }
  &:active { transform: translateY(0); }
  &:focus-visible {
    outline: 2px solid var(--color-border-focus, var(--brand-70));
    outline-offset: 3px;
  }
}

/* --- Sizes --- */
.sm { width: 44px; height: 44px; font-size: 18px; }
.md { width: 54px; height: 54px; font-size: 22px; }
.lg {
  width: 96px; height: 96px; font-size: 40px;
  box-shadow:
    0 8px 18px rgba(0, 0, 0, 0.18),
    inset 0 3px 0 rgba(255, 255, 255, 0.55),
    inset 0 -5px 10px rgba(0, 0, 0, 0.2);
}

/* --- Rarity variants --- */
.gold   { background: var(--medal-fill-gold);   border-color: var(--medal-rim-gold); }
.silver { background: var(--medal-fill-silver); border-color: var(--medal-rim-silver); }
.bronze { background: var(--medal-fill-bronze); border-color: var(--medal-rim-bronze); }

/* --- Locked silhouette --- */
.locked {
  background: transparent;
  border: 2px dashed var(--color-border-default);
  color: var(--color-text-tertiary);
  box-shadow: none;

  &:hover { transform: none; }
}

/* --- Newly-unlocked pulse + flag --- */
.new::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: var(--radius-full);
  box-shadow: 0 0 0 3px rgba(189, 41, 37, 0.18);
  animation: medallion-pulse 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes medallion-pulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(189, 41, 37, 0.12); }
  50%      { box-shadow: 0 0 0 6px rgba(189, 41, 37, 0.22); }
}

@media (prefers-reduced-motion: reduce) {
  .new::after { animation: none; }
  .medallion { transition: none; }
}

.newFlag {
  position: absolute;
  top: -4px;
  right: -6px;
  background: var(--brand-70);
  color: #fff;
  font-family: var(--sans);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 2px 5px;
  border-radius: 3px;
  text-transform: uppercase;
  pointer-events: none;
}
```

- [ ] **Step 2: Write the JSX component**

Create `src/components/Atom/Medallion/Medallion.jsx`:

```jsx
import React from 'react';
import styles from './Medallion.module.scss';

/**
 * Medallion — circular coin-style badge visual.
 *
 * Props:
 *   icon     string | ReactNode  — emoji or icon centered in the coin
 *   rarity   'bronze' | 'silver' | 'gold'  — drives fill + rim tokens
 *   locked   boolean  — if true, renders dashed-silhouette state
 *   isNew    boolean  — if true, adds red NEW flag + pulsing halo
 *   size     'sm' | 'md' | 'lg'  — 44 / 54 / 96 px (default 'md')
 *   ariaLabel string  — accessible label (required when onClick is provided)
 *   onClick  function  — if provided, rendered as a <button>; otherwise <div>
 */
export default function Medallion({
  icon,
  rarity,
  locked = false,
  isNew = false,
  size = 'md',
  ariaLabel,
  onClick,
}) {
  const rarityClass = locked ? styles.locked : styles[rarity] || styles.bronze;
  const className = [
    styles.medallion,
    styles[size],
    rarityClass,
    isNew && !locked ? styles.new : '',
  ].filter(Boolean).join(' ');

  const content = (
    <>
      <span aria-hidden="true">{icon}</span>
      {isNew && !locked && <span className={styles.newFlag}>New</span>}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={className}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={className} role="img" aria-label={ariaLabel}>
      {content}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Atom/Medallion/
git commit -m "feat(medallion): coin-style badge atom with rarity + new-state"
```

---

## Task 5: BadgeDetailDrawer

**Files:**
- Create: `src/components/Organism/BadgeDetailDrawer/BadgeDetailDrawer.jsx`
- Create: `src/components/Organism/BadgeDetailDrawer/BadgeDetailDrawer.module.scss`

- [ ] **Step 1: Write the SCSS module**

Create `src/components/Organism/BadgeDetailDrawer/BadgeDetailDrawer.module.scss`:

```scss
.body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-150);
  padding: var(--space-100) 0 var(--space-200);
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-125);
  padding: var(--space-150) 0;
}

.name {
  margin: 0;
  font-family: var(--sans);
  font-size: var(--font-size-500);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-tighter);
  color: var(--color-text-primary);
  text-align: center;
}

.chips {
  display: inline-flex;
  gap: var(--space-075);
  flex-wrap: wrap;
  justify-content: center;
}

.chip {
  display: inline-flex;
  align-items: center;
  font-family: var(--sans);
  font-size: var(--font-size-100);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 3px 9px;
  border-radius: var(--radius-full);
  border: 1px solid transparent;
}

.chipGold   { background: var(--color-bg-sunken); color: var(--medal-gold);   border-color: var(--medal-rim-gold); }
.chipSilver { background: var(--color-bg-sunken); color: var(--medal-silver); border-color: var(--medal-rim-silver); }
.chipBronze { background: var(--color-bg-sunken); color: var(--medal-bronze); border-color: var(--medal-rim-bronze); }
.chipNeutral {
  background: var(--color-bg-sunken);
  color: var(--color-text-secondary);
  border-color: var(--color-border-subtle);
}

.note {
  margin: 0;
  max-width: 38ch;
  text-align: center;
  font-family: var(--sans);
  font-size: var(--font-size-300);
  line-height: 1.5;
  color: var(--color-text-secondary);
}

.unlockLine {
  font-family: var(--mono);
  font-size: var(--font-size-100);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

.howTo {
  margin-top: var(--space-100);
  padding: var(--space-125) var(--space-150);
  background: var(--color-bg-sunken);
  border: 1px dashed var(--color-border-default);
  border-radius: var(--radius-200);
  font-family: var(--sans);
  font-size: var(--font-size-200);
  color: var(--color-text-secondary);
  text-align: center;
  max-width: 32ch;
}
```

- [ ] **Step 2: Write the JSX component**

Create `src/components/Organism/BadgeDetailDrawer/BadgeDetailDrawer.jsx`:

```jsx
import React from 'react';
import { Drawer } from '@/nexus/molecules';
import Medallion from '../../Atom/Medallion/Medallion';
import { formatDate } from '../../../utils/format';
import { isNewBadge } from '../../Widgets/BadgesStrip/badgeSort';
import styles from './BadgeDetailDrawer.module.scss';

const CATEGORY_LABEL = {
  streak: 'Streak',
  sales: 'Sales',
  milestone: 'Milestone',
};

const RARITY_CHIP = {
  gold:   styles.chipGold,
  silver: styles.chipSilver,
  bronze: styles.chipBronze,
};

export default function BadgeDetailDrawer({ badge, open, onClose }) {
  if (!badge) return null;

  const locked = !badge.unlockedAt;
  const isNew = isNewBadge(badge.unlockedAt);

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      placement="bottom"
      title={badge.label}
    >
      <div className={styles.body}>
        <div className={styles.hero}>
          <Medallion
            icon={badge.icon}
            rarity={badge.rarity}
            locked={locked}
            isNew={isNew}
            size="lg"
            ariaLabel={`${badge.label} — ${badge.rarity} ${badge.category} badge${locked ? ', locked' : ''}`}
          />
          <div className={styles.chips}>
            <span className={`${styles.chip} ${RARITY_CHIP[badge.rarity] || styles.chipNeutral}`}>
              {badge.rarity}
            </span>
            <span className={`${styles.chip} ${styles.chipNeutral}`}>
              {CATEGORY_LABEL[badge.category] || badge.category}
            </span>
          </div>
        </div>

        <p className={styles.note}>{badge.note}</p>

        {locked ? (
          <div className={styles.howTo}>
            <strong>How to earn:</strong> {badge.note}
          </div>
        ) : (
          <div className={styles.unlockLine}>
            Unlocked {formatDate(badge.unlockedAt)}
          </div>
        )}
      </div>
    </Drawer>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Organism/BadgeDetailDrawer/
git commit -m "feat(badges): BadgeDetailDrawer — single badge detail sheet"
```

---

## Task 6: TrophyCaseDrawer

**Files:**
- Create: `src/components/Organism/TrophyCaseDrawer/TrophyCaseDrawer.jsx`
- Create: `src/components/Organism/TrophyCaseDrawer/TrophyCaseDrawer.module.scss`

- [ ] **Step 1: Write the SCSS module**

Create `src/components/Organism/TrophyCaseDrawer/TrophyCaseDrawer.module.scss`:

```scss
.body {
  display: flex;
  flex-direction: column;
  gap: var(--space-150);
  padding: 0;
}

/* Golden stats bar */
.stats {
  padding: var(--space-150) var(--space-200);
  border-radius: var(--radius-200);
  background: var(--medal-fill-gold);
  color: #1A1816;
  border: 1px solid var(--medal-rim-gold);
}

.statsNum {
  font-family: var(--sans);
  font-variation-settings: 'opsz' 72, 'SOFT' 30, 'wght' 700;
  font-size: var(--font-size-700);
  line-height: 1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.statsNum span {
  font-size: var(--font-size-400);
  opacity: 0.6;
  margin-left: 2px;
}

.statsCap {
  font-family: var(--mono);
  font-size: var(--font-size-100);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-top: var(--space-050);
  opacity: 0.7;
}

.progressTrack {
  margin-top: var(--space-100);
  height: 4px;
  background: rgba(26, 24, 22, 0.18);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progressFill {
  height: 100%;
  background: #1A1816;
  border-radius: var(--radius-full);
  transition: width 300ms ease-out;
}

/* Tabs */
.tabs {
  display: flex;
  gap: var(--space-075);
  overflow-x: auto;
  padding: var(--space-025) 0;
  scrollbar-width: none;

  &::-webkit-scrollbar { display: none; }
}

.tab {
  flex: 0 0 auto;
  padding: var(--space-075) var(--space-125);
  border-radius: var(--radius-full);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  color: var(--color-text-secondary);
  font-family: var(--sans);
  font-size: var(--font-size-200);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  white-space: nowrap;
  transition: all 120ms ease-out;

  &:hover { color: var(--color-text-primary); border-color: var(--color-text-primary); }
}

.tabActive {
  background: var(--color-text-primary);
  color: var(--color-text-on-action, #fff);
  border-color: var(--color-text-primary);
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-150) var(--space-125);
  padding: var(--space-100) 0 var(--space-200);
}

.cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-075);
}

.cellLabel {
  font-family: var(--sans);
  font-size: var(--font-size-100);
  line-height: 1.25;
  color: var(--color-text-secondary);
  text-align: center;
  max-width: 10ch;
}

.cellLabelLocked { color: var(--color-text-tertiary); }

.empty {
  padding: var(--space-400) var(--space-200);
  text-align: center;
  color: var(--color-text-tertiary);
  font-family: var(--sans);
  font-size: var(--font-size-300);
}
```

- [ ] **Step 2: Write the JSX component**

Create `src/components/Organism/TrophyCaseDrawer/TrophyCaseDrawer.jsx`:

```jsx
import React, { useMemo, useState } from 'react';
import { Drawer } from '@/nexus/molecules';
import Medallion from '../../Atom/Medallion/Medallion';
import { isNewBadge } from '../../Widgets/BadgesStrip/badgeSort';
import styles from './TrophyCaseDrawer.module.scss';

const TABS = [
  { id: 'all',       label: 'All' },
  { id: 'streak',    label: 'Streaks' },
  { id: 'sales',     label: 'Sales' },
  { id: 'milestone', label: 'Milestones' },
  { id: 'locked',    label: 'Locked' },
];

export default function TrophyCaseDrawer({ badges, open, onClose, onSelectBadge }) {
  const [activeTab, setActiveTab] = useState('all');

  const unlocked = useMemo(() => badges.filter((b) => b.unlockedAt).length, [badges]);
  const pct = badges.length > 0 ? Math.round((unlocked / badges.length) * 100) : 0;

  const visible = useMemo(() => {
    if (activeTab === 'all')    return badges;
    if (activeTab === 'locked') return badges.filter((b) => !b.unlockedAt);
    return badges.filter((b) => b.category === activeTab);
  }, [badges, activeTab]);

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      placement="bottom"
      height="full"
      title="Trophy Case"
    >
      <div className={styles.body}>
        <div className={styles.stats}>
          <div className={styles.statsNum}>
            {unlocked}<span>/{badges.length}</span>
          </div>
          <div className={styles.statsCap}>earned this month</div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className={styles.tabs} role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={activeTab === t.id}
              className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className={styles.empty}>
            {activeTab === 'locked'
              ? "Nothing locked — you've got them all."
              : 'No badges in this category yet.'}
          </div>
        ) : (
          <div className={styles.grid}>
            {visible.map((b) => {
              const locked = !b.unlockedAt;
              return (
                <div key={b.id} className={styles.cell}>
                  <Medallion
                    icon={b.icon}
                    rarity={b.rarity}
                    locked={locked}
                    isNew={isNewBadge(b.unlockedAt)}
                    size="md"
                    ariaLabel={`${b.label} — ${b.rarity} ${b.category} badge${locked ? ', locked' : ''}`}
                    onClick={() => onSelectBadge(b)}
                  />
                  <div
                    className={`${styles.cellLabel} ${locked ? styles.cellLabelLocked : ''}`}
                  >
                    {b.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Drawer>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Organism/TrophyCaseDrawer/
git commit -m "feat(badges): TrophyCaseDrawer — stats bar, filter tabs, grid"
```

---

## Task 7: Refactor BadgesStrip

**Files:**
- Modify: `src/components/Widgets/BadgesStrip/BadgesStrip.jsx` (full rewrite of render tree)
- Modify: `src/components/Widgets/BadgesStrip/BadgesStrip.module.scss` (full rewrite — new layout)

- [ ] **Step 1: Rewrite the SCSS module**

Replace the **entire** contents of `src/components/Widgets/BadgesStrip/BadgesStrip.module.scss` with:

```scss
.section {
  padding: 0 var(--space-250);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-125);
  padding: 0 var(--space-025);
}

.headerLeft {
  display: inline-flex;
  align-items: center;
  gap: var(--space-075);
}

.iconAccent { color: var(--brand-70); }

.title {
  font-family: var(--sans);
  font-variation-settings: 'opsz' 72, 'SOFT' 40, 'wght' 600;
  font-size: var(--font-size-400);
  color: var(--color-text-primary);
  letter-spacing: var(--letter-spacing-tighter);
}

.counter {
  font-family: var(--mono);
  font-size: var(--font-size-200);
  color: var(--color-text-secondary);
  letter-spacing: var(--letter-spacing-tight);

  strong {
    color: var(--brand-70);
    font-weight: var(--font-weight-semibold);
  }
}

/* Row of medallions + view-all chip */
.row {
  display: flex;
  gap: var(--space-150);
  overflow-x: auto;
  padding: var(--space-050) 0 var(--space-150);
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar { display: none; }
}

.cell {
  flex: 0 0 auto;
  width: 62px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-075);
}

.cellLabel {
  font-family: var(--sans);
  font-size: var(--font-size-100);
  line-height: 1.2;
  color: var(--color-text-secondary);
  text-align: center;
  max-width: 62px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cellLabelLocked { color: var(--color-text-tertiary); }

/* "View all" dashed circle chip */
.viewAll {
  width: 54px;
  height: 54px;
  border-radius: var(--radius-full);
  border: 1.5px dashed var(--brand-70);
  background: color-mix(in srgb, var(--brand-70) 5%, transparent);
  color: var(--brand-70);
  font-family: var(--sans);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-300);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: all 120ms ease-out;

  &:hover {
    background: color-mix(in srgb, var(--brand-70) 10%, transparent);
    transform: translateY(-1px);
  }
  &:focus-visible {
    outline: 2px solid var(--brand-70);
    outline-offset: 3px;
  }
}
```

- [ ] **Step 2: Rewrite the JSX component**

Replace the **entire** contents of `src/components/Widgets/BadgesStrip/BadgesStrip.jsx` with:

```jsx
import React, { useMemo, useState } from 'react';
import { Trophy } from 'lucide-react';
import { Text } from '@/nexus/atoms';
import styles from './BadgesStrip.module.scss';
import { badgesByEmployee } from '../../../data/gamification';
import Medallion from '../../Atom/Medallion/Medallion';
import TrophyCaseDrawer from '../../Organism/TrophyCaseDrawer/TrophyCaseDrawer';
import BadgeDetailDrawer from '../../Organism/BadgeDetailDrawer/BadgeDetailDrawer';
import { sortBadgesForStrip, isNewBadge } from './badgeSort';

const VERTICAL_SAMPLE_ID = {
  ELECTRONICS: 'EMP-0041',
  GROCERY:     'GRC-2203',
  FNL:         'FNL-3103',
};

const SHELF_MAX = 4;

export default function BadgesStrip({ employeeId, vertical }) {
  const direct = badgesByEmployee[employeeId];
  const fallbackId = VERTICAL_SAMPLE_ID[vertical];
  const badges = direct || (fallbackId ? badgesByEmployee[fallbackId] : null) || [];

  const [trophyOpen, setTrophyOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);

  const sorted = useMemo(() => sortBadgesForStrip(badges), [badges]);
  const visible = sorted.slice(0, SHELF_MAX);
  const overflow = Math.max(0, sorted.length - SHELF_MAX);

  if (badges.length === 0) return null;

  const unlocked = badges.filter((b) => b.unlockedAt).length;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Trophy size={14} strokeWidth={2.4} className={styles.iconAccent} />
          <span className={styles.title}>Badges</span>
        </div>
        <Text variant="caption" size="sm" as="span" className={styles.counter}>
          <strong>{unlocked}</strong> of {badges.length} earned
        </Text>
      </div>

      <div className={styles.row}>
        {visible.map((b) => {
          const locked = !b.unlockedAt;
          return (
            <div key={b.id} className={styles.cell}>
              <Medallion
                icon={b.icon}
                rarity={b.rarity}
                locked={locked}
                isNew={isNewBadge(b.unlockedAt)}
                size="md"
                ariaLabel={`${b.label} — ${b.rarity} ${b.category} badge${locked ? ', locked' : ''}`}
                onClick={() => setSelectedBadge(b)}
              />
              <div className={`${styles.cellLabel} ${locked ? styles.cellLabelLocked : ''}`}>
                {b.label}
              </div>
            </div>
          );
        })}

        {overflow > 0 && (
          <div className={styles.cell}>
            <button
              type="button"
              className={styles.viewAll}
              aria-label={`View all ${badges.length} badges`}
              onClick={() => setTrophyOpen(true)}
            >
              +{overflow}
            </button>
            <div className={styles.cellLabel}>View all</div>
          </div>
        )}
      </div>

      <TrophyCaseDrawer
        badges={sorted}
        open={trophyOpen}
        onClose={() => setTrophyOpen(false)}
        onSelectBadge={(b) => setSelectedBadge(b)}
      />

      <BadgeDetailDrawer
        badge={selectedBadge}
        open={!!selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Widgets/BadgesStrip/BadgesStrip.jsx src/components/Widgets/BadgesStrip/BadgesStrip.module.scss
git commit -m "feat(badges): BadgesStrip renders Medallion shelf + trophy case"
```

---

## Task 8: Lint, test suite, manual verification

**Files:**
- None (verification step; fix whatever lint finds in the relevant files from earlier tasks)

- [ ] **Step 1: Lint every file touched by this plan**

Run:

```bash
npx eslint \
  src/data/gamification.js \
  src/components/Widgets/BadgesStrip/badgeSort.js \
  src/components/Widgets/BadgesStrip/badgeSort.test.js \
  src/components/Widgets/BadgesStrip/BadgesStrip.jsx \
  src/components/Atom/Medallion/Medallion.jsx \
  src/components/Organism/BadgeDetailDrawer/BadgeDetailDrawer.jsx \
  src/components/Organism/TrophyCaseDrawer/TrophyCaseDrawer.jsx
```

Expected: zero errors. Warnings on unused props (e.g. a `vertical` prop used only in a fallback) are acceptable if they match the pattern already present in sibling vertical views. Fix any new errors in place.

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: all tests pass, including the 11 new cases in `badgeSort.test.js` and every previously-passing test in `src/services/GamificationEngine/` and `src/components/Molecule/LeaderboardFocusList/`.

- [ ] **Step 3: Build for development and smoke-test in browser**

Run: `npm start`

In the browser (localhost:3000), for **each** of the three personas via the persona switcher:

- Electronics SA (`EMP-0041`): confirm the shelf shows 4 medallions + a "+1 View all" chip (5 badges total, cap is 4). Verify the 7-day streak medallion (id `streak-7`, gold, recently unlocked today per mock) has the NEW flag + pulse.
- Grocery SA (`GRC-2203`): only 3 badges — confirm the shelf shows all 3 with no View-all chip.
- F&L SA (`FNL-3103`): 3 badges total, same no-overflow behavior.

For each persona: tap one medallion → verify `BadgeDetailDrawer` opens with the correct name, rarity chip, category chip, note, and "Unlocked …" line (or "How to earn" for locked).

On `EMP-0041`: tap "View all" → verify `TrophyCaseDrawer` opens with stats bar reading "3 / 5" and a 60% progress fill. Click each filter tab in turn (All, Streaks, Sales, Milestones, Locked) and confirm the grid filters correctly. Tap a medallion inside the trophy case → verify the detail drawer stacks above it and closing returns to the trophy case.

- [ ] **Step 4: Reduced-motion sanity check**

In browser devtools (Chrome: *Rendering* → *Emulate CSS media feature prefers-reduced-motion: reduce*): reload the home page for `EMP-0041`. Confirm the NEW flag still shows but the pulsing halo animation is stopped.

- [ ] **Step 5: Commit any lint / verification fixes**

If Step 1 surfaced any lint errors or Steps 3–4 revealed any bugs, fix them now and commit:

```bash
git add <files>
git commit -m "fix(badges): <specific fix>"
```

If everything passed clean, skip this step.

---

## Self-Review

**Spec coverage:**

- §1 Home — Medallion shelf → Task 7 (refactored `BadgesStrip`).
- §2 Trophy case drawer → Task 6.
- §3 Medallion detail drawer → Task 5.
- Visual system (rarity tiers, shape, locked, newly-unlocked, tokens) → Task 1 (tokens) + Task 4 (Medallion component).
- Data model → Task 2.
- Component architecture → Tasks 4–7.
- Motion / a11y → built into Task 4 (reduced-motion, aria-label) and Task 6 (role=tablist).
- Edge cases (≤4 badges, zero earned, all earned, long labels, stacked drawers) → covered by Task 7 `overflow` logic + Task 6 `empty` branch + Task 4 ellipsis in `cellLabel`.
- Testing (unit for sort / isNew; manual per-vertical QA) → Task 3 + Task 8.

Every spec section has at least one task implementing it.

**Type / name consistency:**

- `Medallion` props `{ icon, rarity, locked, isNew, size, ariaLabel, onClick }` are used identically in Tasks 4, 5, 6, 7.
- `sortBadgesForStrip(badges, now?)` / `isNewBadge(unlockedAt, now?)` signatures are used identically in Tasks 3, 5, 6, 7.
- `TrophyCaseDrawer` props `{ badges, open, onClose, onSelectBadge }` match between Task 6 definition and Task 7 call site.
- `BadgeDetailDrawer` props `{ badge, open, onClose }` match between Task 5 definition and Task 7 call site.
- Token names `--medal-fill-{gold,silver,bronze}` + `--medal-rim-{gold,silver,bronze}` are defined in Task 1 and referenced in Tasks 4 and 6.

**Placeholders:** none — every step has exact file paths, full code blocks, and precise commands.

**Scope:** single coherent feature; appropriate for one plan.
