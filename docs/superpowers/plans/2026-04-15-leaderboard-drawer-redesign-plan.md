# Leaderboard Drawer & Pill Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the header rank pill into a tier-aware affordance (gold/silver/bronze/brand/neutral), and redesign the `LeaderboardDrawer` into a celebratory top-3 podium plus a self-centred focus list with `…` markers for the rest of the field. Add mock money-based `myRank` for Grocery so the drawer works in that vertical too.

**Architecture:** Three presentational units — (1) a rank-tier pill (variant styling applied via a `data-rank-tier` attribute on the existing `HeaderBar.leaderboardPill`), (2) a new `LeaderboardPodium` molecule for top-3, (3) a new `LeaderboardFocusList` molecule backed by a pure `computeFocusRows` helper (TDD). `LeaderboardDrawer` composes banner → podium → focus list and drops its old flat-list code. Three new semantic tokens (`--medal-gold/silver/bronze`) are added to `src/nexus/styles/tokens.scss` (both light and dark blocks). Grocery gets `myRank` synthesised inside its transformer using money-based peer earnings.

**Tech Stack:** React 18 (functional + hooks), CSS Modules (`.module.scss`), Nexus atoms/molecules, Jest for unit tests. No new dependencies.

**Spec:** [`docs/superpowers/specs/2026-04-15-leaderboard-drawer-redesign-design.md`](../specs/2026-04-15-leaderboard-drawer-redesign-design.md)

---

## File Structure

**New files**
- `src/components/Molecule/LeaderboardPodium/LeaderboardPodium.jsx`
- `src/components/Molecule/LeaderboardPodium/LeaderboardPodium.module.scss`
- `src/components/Molecule/LeaderboardFocusList/LeaderboardFocusList.jsx`
- `src/components/Molecule/LeaderboardFocusList/LeaderboardFocusList.module.scss`
- `src/components/Molecule/LeaderboardFocusList/computeFocusRows.js`
- `src/components/Molecule/LeaderboardFocusList/computeFocusRows.test.js`

**Modified files**
- `src/nexus/styles/tokens.scss` (add medal tokens to light + dark blocks)
- `src/components/Organism/HeaderBar/HeaderBar.jsx` (rank tier derivation)
- `src/components/Organism/HeaderBar/HeaderBar.module.scss` (tier styles)
- `src/components/Organism/LeaderboardDrawer/LeaderboardDrawer.jsx` (compose new molecules)
- `src/components/Organism/LeaderboardDrawer/LeaderboardDrawer.module.scss` (banner + section layout; drop flat list)
- `src/api/transformers/grocery.js` (synthesise `myRank` from money peers)

---

## Task 1 — Add medal semantic tokens

**Files:**
- Modify: `src/nexus/styles/tokens.scss` (light `:root` near line 200, dark `:root.dark` near line 271 — existing pattern mirrors each token between the two)

- [ ] **Step 1: Add medal tokens to the light theme block**

Find the block around line 200 that contains `--color-rating-filled:`. Insert these three lines immediately after it:

```scss
  /* Medal — leaderboard podium (gold / silver / bronze) */
  --medal-gold:   #D4A437;
  --medal-silver: #B8BCC4;
  --medal-bronze: #B86F4A;
```

- [ ] **Step 2: Add medal tokens to the dark theme block**

Find the `:root[data-theme='dark']` (or `.dark`) block that also declares `--color-rating-filled`. Insert the dark-mode equivalents (slightly lifted so they register on a dark background):

```scss
  /* Medal — leaderboard podium (gold / silver / bronze) */
  --medal-gold:   #E5B84A;
  --medal-silver: #CFD3DB;
  --medal-bronze: #D78A63;
```

- [ ] **Step 3: Visual sanity check**

Run: `npm start`
Open DevTools → inspect `:root`, confirm `--medal-gold`, `--medal-silver`, `--medal-bronze` resolve in both light and dark mode (toggle via the `Switch` in the header).
Expected: all three show their hex values.

- [ ] **Step 4: Commit**

```bash
git add src/nexus/styles/tokens.scss
git commit -m "feat(tokens): add medal gold/silver/bronze semantic tokens"
```

---

## Task 2 — `computeFocusRows` pure helper (TDD)

**Files:**
- Create: `src/components/Molecule/LeaderboardFocusList/computeFocusRows.js`
- Test: `src/components/Molecule/LeaderboardFocusList/computeFocusRows.test.js`

**Contract.** Takes `(entries, selfRank)` and returns `{ rows, ellipsisTop, ellipsisBottom }` where `rows` is an array of the entry objects (shape `{ rank, name, earned, isSelf, note? }`) that should render in the focus list — **excluding** entries whose rank is ≤ 3 (the podium handles those).

Rules, in declarative form:

| selfRank                  | rows                                                         | ellipsisTop                       | ellipsisBottom                     |
|---------------------------|--------------------------------------------------------------|-----------------------------------|------------------------------------|
| 1, 2, or 3                | entries with rank 4 and 5 (the next two chasers, if present) | false                             | true iff any entry has rank > 5    |
| 4                         | entries with rank 3, 4, 5 — **but rank 3 is on podium**, so rows are ranks 4 and 5 (self + next) | false | true iff any entry has rank > 5 |
| ≥ 5 and < maxRank         | entries with rank `selfRank-1`, `selfRank`, `selfRank+1`     | true                              | true iff `selfRank + 1 < maxRank`  |
| === maxRank (last)        | entries with rank `selfRank-1`, `selfRank`                   | true                              | false                              |

Where `maxRank = max(entries.map(e => e.rank))`.

Notes:
- Input `entries` is assumed already sorted by rank ascending, but the function sorts defensively.
- If an expected neighbour rank isn't present (sparse data / self pinned), it's silently omitted — no crash.
- The podium never renders in the focus list, so ranks 1-3 are never in `rows`.

- [ ] **Step 1: Write the failing tests**

Create `src/components/Molecule/LeaderboardFocusList/computeFocusRows.test.js` with:

```js
import { computeFocusRows } from './computeFocusRows';

const mk = (rank, isSelf = false) => ({
  rank,
  name: `P${rank}`,
  earned: 1000 - rank * 100,
  isSelf,
});

const fiveEntries = [mk(1), mk(2), mk(3), mk(4), mk(5)];
const tenEntries = Array.from({ length: 10 }, (_, i) => mk(i + 1));

describe('computeFocusRows', () => {
  test('self in top 3 with exactly 5 entries: shows #4 and #5, no top/bottom ellipsis', () => {
    const entries = [mk(1), mk(2, true), mk(3), mk(4), mk(5)];
    const out = computeFocusRows(entries, 2);
    expect(out.rows.map((r) => r.rank)).toEqual([4, 5]);
    expect(out.ellipsisTop).toBe(false);
    expect(out.ellipsisBottom).toBe(false);
  });

  test('self in top 3 with 10 entries: shows #4 and #5, bottom ellipsis for #6+', () => {
    const entries = tenEntries.map((e) => (e.rank === 1 ? { ...e, isSelf: true } : e));
    const out = computeFocusRows(entries, 1);
    expect(out.rows.map((r) => r.rank)).toEqual([4, 5]);
    expect(out.ellipsisTop).toBe(false);
    expect(out.ellipsisBottom).toBe(true);
  });

  test('self === 4: shows #4 (self) and #5, no top ellipsis (podium covers #3), no bottom ellipsis if 5 total', () => {
    const entries = fiveEntries.map((e) => (e.rank === 4 ? { ...e, isSelf: true } : e));
    const out = computeFocusRows(entries, 4);
    expect(out.rows.map((r) => r.rank)).toEqual([4, 5]);
    expect(out.ellipsisTop).toBe(false);
    expect(out.ellipsisBottom).toBe(false);
  });

  test('self === 4 with 10 entries: shows #4 (self) and #5, bottom ellipsis for #6+', () => {
    const entries = tenEntries.map((e) => (e.rank === 4 ? { ...e, isSelf: true } : e));
    const out = computeFocusRows(entries, 4);
    expect(out.rows.map((r) => r.rank)).toEqual([4, 5]);
    expect(out.ellipsisBottom).toBe(true);
  });

  test('self in the middle (rank 6 of 10): shows #5 #6 #7, both ellipses', () => {
    const entries = tenEntries.map((e) => (e.rank === 6 ? { ...e, isSelf: true } : e));
    const out = computeFocusRows(entries, 6);
    expect(out.rows.map((r) => r.rank)).toEqual([5, 6, 7]);
    expect(out.ellipsisTop).toBe(true);
    expect(out.ellipsisBottom).toBe(true);
  });

  test('self is last (rank 10 of 10): shows #9 and #10, top ellipsis only', () => {
    const entries = tenEntries.map((e) => (e.rank === 10 ? { ...e, isSelf: true } : e));
    const out = computeFocusRows(entries, 10);
    expect(out.rows.map((r) => r.rank)).toEqual([9, 10]);
    expect(out.ellipsisTop).toBe(true);
    expect(out.ellipsisBottom).toBe(false);
  });

  test('handles unsorted input', () => {
    const entries = [mk(5), mk(2), mk(1), mk(4), mk(3, true)];
    const out = computeFocusRows(entries, 3);
    expect(out.rows.map((r) => r.rank)).toEqual([4, 5]);
    expect(out.ellipsisTop).toBe(false);
    expect(out.ellipsisBottom).toBe(false);
  });

  test('missing neighbour rank is skipped, not filled', () => {
    // Self at rank 8, but only ranks [1..5, 8] present (sparse "pinned self" view)
    const entries = [mk(1), mk(2), mk(3), mk(4), mk(5), mk(8, true)];
    const out = computeFocusRows(entries, 8);
    // selfRank-1 = 7 (absent), selfRank = 8 (self), selfRank+1 = 9 (absent)
    expect(out.rows.map((r) => r.rank)).toEqual([8]);
    expect(out.ellipsisTop).toBe(true);
    expect(out.ellipsisBottom).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- computeFocusRows`
Expected: all tests fail with `Cannot find module './computeFocusRows'`.

- [ ] **Step 3: Write the minimal implementation**

Create `src/components/Molecule/LeaderboardFocusList/computeFocusRows.js`:

```js
/**
 * Compute which rows to render in the leaderboard focus list,
 * and whether to show "..." affordances above/below.
 *
 * @param {Array<{rank:number, name:string, earned:number, isSelf?:boolean, note?:string}>} entries
 * @param {number} selfRank
 * @returns {{rows: Array, ellipsisTop: boolean, ellipsisBottom: boolean}}
 */
export function computeFocusRows(entries, selfRank) {
  const sorted = [...entries].sort((a, b) => a.rank - b.rank);
  const byRank = new Map(sorted.map((e) => [e.rank, e]));
  const maxRank = sorted.length ? sorted[sorted.length - 1].rank : 0;

  const pick = (ranks) =>
    ranks.map((r) => byRank.get(r)).filter(Boolean);

  // Case A: self is on the podium (ranks 1–3) — show next chasers #4 and #5.
  if (selfRank <= 3) {
    return {
      rows: pick([4, 5]),
      ellipsisTop: false,
      ellipsisBottom: maxRank > 5,
    };
  }

  // Case B: self is exactly rank 4 — rank 3 is already on the podium, so
  // show only #4 (self) and #5. No top ellipsis.
  if (selfRank === 4) {
    return {
      rows: pick([4, 5]),
      ellipsisTop: false,
      ellipsisBottom: maxRank > 5,
    };
  }

  // Case C: self is somewhere ≥ 5. Show self ± 1 neighbour.
  // Top ellipsis always true (podium covers 1–3, focus starts at ≥4,
  // and rank-1 is at least 4, so at least one rank between podium and
  // focus is hidden).
  const ranks = [selfRank - 1, selfRank, selfRank + 1];
  return {
    rows: pick(ranks),
    ellipsisTop: true,
    ellipsisBottom: selfRank + 1 < maxRank,
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- computeFocusRows`
Expected: all 8 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/Molecule/LeaderboardFocusList/computeFocusRows.js src/components/Molecule/LeaderboardFocusList/computeFocusRows.test.js
git commit -m "feat(leaderboard): add computeFocusRows helper with tests"
```

---

## Task 3 — `LeaderboardFocusList` presentational component

**Files:**
- Create: `src/components/Molecule/LeaderboardFocusList/LeaderboardFocusList.jsx`
- Create: `src/components/Molecule/LeaderboardFocusList/LeaderboardFocusList.module.scss`

**Props:** `{ entries, selfRank, unitLabel }` — where `entries` is `myRank.top`, `selfRank` is `myRank.rank`, `unitLabel` is one of `'earned'` (₹), `'pieces'`, or `'units'`.

- [ ] **Step 1: Write the JSX**

Create `src/components/Molecule/LeaderboardFocusList/LeaderboardFocusList.jsx`:

```jsx
import React from 'react';
import { computeFocusRows } from './computeFocusRows';
import styles from './LeaderboardFocusList.module.scss';

function formatEarn(val, unitLabel) {
  if (unitLabel === 'pieces' || unitLabel === 'units') return `${val}`;
  return `\u20B9${val.toLocaleString('en-IN')}`;
}

export default function LeaderboardFocusList({ entries, selfRank, unitLabel = 'earned' }) {
  if (!Array.isArray(entries) || entries.length === 0) return null;

  const { rows, ellipsisTop, ellipsisBottom } = computeFocusRows(entries, selfRank);

  if (rows.length === 0 && !ellipsisTop && !ellipsisBottom) return null;

  return (
    <div className={styles.list} role="list">
      <div className={styles.listHead}>
        <span>Rank</span>
        <span>Associate</span>
        <span className={styles.listUnit}>
          {unitLabel === 'earned' ? 'earned' : unitLabel}
        </span>
      </div>

      {ellipsisTop && (
        <div className={styles.ellipsis} aria-hidden="true">&middot; &middot; &middot;</div>
      )}

      {rows.map((r) => (
        <div
          key={r.rank}
          role="listitem"
          className={`${styles.row} ${r.isSelf ? styles.rowSelf : ''}`}
        >
          <span className={styles.rank}>#{r.rank}</span>
          <div className={styles.who}>
            <span className={styles.name}>
              {r.isSelf ? `${r.name} (You)` : r.name}
            </span>
            {r.note && <span className={styles.note}>{r.note}</span>}
          </div>
          <span className={styles.earn}>{formatEarn(r.earned, unitLabel)}</span>
        </div>
      ))}

      {ellipsisBottom && (
        <div className={styles.ellipsis} aria-hidden="true">&middot; &middot; &middot;</div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write the styles**

Create `src/components/Molecule/LeaderboardFocusList/LeaderboardFocusList.module.scss`:

```scss
.list {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
}

.listHead {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  padding: 8px 0 10px;
  font-family: var(--mono);
  font-size: 10.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  border-bottom: 1px solid var(--color-border-subtle);
  font-weight: 600;
}

.listUnit { text-align: right; }

.row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  padding: 12px 0;
  align-items: center;
  border-bottom: 1px solid var(--color-border-subtle);

  &:last-child { border-bottom: none; }
}

.rowSelf {
  background: var(--brand-a100);
  margin: 0 -12px;
  padding: 12px;
  border-radius: 10px;
  border-bottom-color: transparent;
  box-shadow: 0 0 0 1px var(--brand-50) inset;
  animation: focus-self-pulse 480ms cubic-bezier(0.2, 0.8, 0.2, 1) both;

  .rank, .name { color: var(--brand-70); }
  .earn { color: var(--brand-70); }
}

@keyframes focus-self-pulse {
  0%   { opacity: 0.55; transform: translateY(4px); }
  60%  { opacity: 1;    transform: translateY(0); }
  100% { opacity: 1;    transform: translateY(0); }
}

.rank {
  font-family: var(--sans);
  font-variation-settings: 'opsz' 72, 'SOFT' 30, 'wght' 680;
  font-size: 17px;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
  min-width: 28px;
}

.who {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.name {
  font-family: var(--sans);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note {
  font-family: var(--mono);
  font-size: 10.5px;
  color: var(--color-text-warning);
  letter-spacing: 0.04em;
}

.earn {
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 700;
  color: var(--brand-70);
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.ellipsis {
  text-align: center;
  padding: 8px 0;
  color: var(--color-text-tertiary);
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.3em;
  user-select: none;
}
```

- [ ] **Step 3: Smoke-check the render**

No test target yet — the wiring comes in Task 5. Just verify there are no syntax errors:

Run: `npm run lint -- src/components/Molecule/LeaderboardFocusList`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Molecule/LeaderboardFocusList/LeaderboardFocusList.jsx src/components/Molecule/LeaderboardFocusList/LeaderboardFocusList.module.scss
git commit -m "feat(leaderboard): add LeaderboardFocusList molecule"
```

---

## Task 4 — `LeaderboardPodium` presentational component

**Files:**
- Create: `src/components/Molecule/LeaderboardPodium/LeaderboardPodium.jsx`
- Create: `src/components/Molecule/LeaderboardPodium/LeaderboardPodium.module.scss`

**Props:** `{ entries, unitLabel }` — `entries` is `myRank.top` (the component filters to ranks 1–3 and renders classic podium: `#2 / #1 / #3`).

- [ ] **Step 1: Write the JSX**

Create `src/components/Molecule/LeaderboardPodium/LeaderboardPodium.jsx`:

```jsx
import React from 'react';
import { Medal } from 'lucide-react';
import styles from './LeaderboardPodium.module.scss';

function formatEarn(val, unitLabel) {
  if (unitLabel === 'pieces' || unitLabel === 'units') return `${val}`;
  return `\u20B9${val.toLocaleString('en-IN')}`;
}

function initials(name) {
  return (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

// Classic podium layout: second place on the left, winner centre, third right.
const PODIUM_ORDER = [2, 1, 3];

export default function LeaderboardPodium({ entries, unitLabel = 'earned' }) {
  if (!Array.isArray(entries) || entries.length === 0) return null;

  const byRank = new Map(entries.map((e) => [e.rank, e]));
  const podium = PODIUM_ORDER.map((rank) => byRank.get(rank)).filter(Boolean);

  if (podium.length === 0) return null;

  return (
    <div className={styles.podium} role="group" aria-label="Top 3 on the leaderboard">
      {podium.map((entry) => {
        const tier = entry.rank === 1 ? 'gold' : entry.rank === 2 ? 'silver' : 'bronze';
        const order = PODIUM_ORDER.indexOf(entry.rank); // 0, 1, 2 → stagger
        return (
          <div
            key={entry.rank}
            className={`${styles.tile} ${styles[`tier_${tier}`]} ${entry.isSelf ? styles.self : ''}`}
            style={{ '--stagger-delay': `${order * 60}ms` }}
          >
            <div className={styles.medalWrap}>
              <Medal size={20} strokeWidth={2.4} aria-hidden="true" />
              <span className={styles.rankBadge}>#{entry.rank}</span>
            </div>
            <div className={styles.avatar} aria-hidden="true">{initials(entry.name)}</div>
            <div className={styles.name} title={entry.name}>
              {entry.isSelf ? `${entry.name} (You)` : entry.name}
            </div>
            <div className={styles.earn}>{formatEarn(entry.earned, unitLabel)}</div>
            <div className={styles.plinth} aria-hidden="true" />
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Write the styles**

Create `src/components/Molecule/LeaderboardPodium/LeaderboardPodium.module.scss`:

```scss
.podium {
  display: grid;
  grid-template-columns: 1fr 1.15fr 1fr;
  gap: var(--space-100);
  align-items: end;
  padding: var(--space-200) 0 var(--space-150);
}

.tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-075);
  padding: var(--space-150) var(--space-100) var(--space-125);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-200);
  text-align: center;
  min-width: 0;
  position: relative;
  isolation: isolate;

  opacity: 0;
  transform: translateY(8px);
  animation: podium-rise 260ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: var(--stagger-delay, 0ms);
}

@keyframes podium-rise {
  to { opacity: 1; transform: translateY(0); }
}

/* Tier accents — medal icon + top border */
.tier_gold   .medalWrap { color: var(--medal-gold); }
.tier_silver .medalWrap { color: var(--medal-silver); }
.tier_bronze .medalWrap { color: var(--medal-bronze); }

.tier_gold   { border-top: 3px solid var(--medal-gold); }
.tier_silver { border-top: 3px solid var(--medal-silver); }
.tier_bronze { border-top: 3px solid var(--medal-bronze); }

/* Heights — classic podium: center tallest */
.tier_silver { min-height: 104px; }
.tier_gold   { min-height: 128px; }
.tier_bronze { min-height: 88px; }

.self {
  box-shadow: 0 0 0 2px var(--brand-50) inset;
}

.medalWrap {
  display: inline-flex;
  align-items: center;
  gap: var(--space-050);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.rankBadge {
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: currentColor;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  display: grid;
  place-items: center;
  font-family: var(--sans);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  margin-top: var(--space-025);
}

.name {
  font-family: var(--sans);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.2;
  max-width: 100%;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.earn {
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 700;
  color: var(--brand-70);
  letter-spacing: -0.01em;
  margin-top: auto;
}

.plinth {
  /* reserved for future decorative fill — currently a no-op */
  display: none;
}
```

- [ ] **Step 3: Lint**

Run: `npm run lint -- src/components/Molecule/LeaderboardPodium`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Molecule/LeaderboardPodium/LeaderboardPodium.jsx src/components/Molecule/LeaderboardPodium/LeaderboardPodium.module.scss
git commit -m "feat(leaderboard): add LeaderboardPodium molecule"
```

---

## Task 5 — Rewire `LeaderboardDrawer` to compose banner + podium + focus list

**Files:**
- Modify: `src/components/Organism/LeaderboardDrawer/LeaderboardDrawer.jsx`
- Modify: `src/components/Organism/LeaderboardDrawer/LeaderboardDrawer.module.scss`

- [ ] **Step 1: Replace the drawer body**

Replace `src/components/Organism/LeaderboardDrawer/LeaderboardDrawer.jsx` contents with:

```jsx
import React from 'react';
import { Trophy } from 'lucide-react';
import { Drawer } from '@/nexus/molecules';
import LeaderboardPodium from '../../Molecule/LeaderboardPodium/LeaderboardPodium';
import LeaderboardFocusList from '../../Molecule/LeaderboardFocusList/LeaderboardFocusList';
import styles from './LeaderboardDrawer.module.scss';

/**
 * Mobile bottom-sheet leaderboard. Opens when the header rank pill is tapped.
 * Layout: optional top-3 banner → podium (#2 / #1 / #3) → focus list (self ± 1).
 */
export default function LeaderboardDrawer({ open, onClose, myRank }) {
  if (!myRank) return null;

  const unitLabel = myRank.unitLabel || 'earned';
  const scopeNote = myRank.scopeNote || `in ${myRank.scope}`;
  const inTop3 = myRank.rank >= 1 && myRank.rank <= 3;

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      placement="bottom"
      title={`You're #${myRank.rank}`}
      subtitle={`Leaderboard \u00b7 ${scopeNote}`}
      icon={<Trophy size={16} strokeWidth={2.4} />}
    >
      <div className={styles.body}>
        {inTop3 && (
          <div className={styles.banner} role="status">
            <span aria-hidden="true">&#127942;</span>
            <span>Top 3 &mdash; keep it up!</span>
          </div>
        )}

        <LeaderboardPodium entries={myRank.top} unitLabel={unitLabel} />

        <LeaderboardFocusList
          entries={myRank.top}
          selfRank={myRank.rank}
          unitLabel={unitLabel}
        />
      </div>
    </Drawer>
  );
}
```

- [ ] **Step 2: Replace the drawer styles**

Replace `src/components/Organism/LeaderboardDrawer/LeaderboardDrawer.module.scss` contents with:

```scss
.body {
  display: flex;
  flex-direction: column;
  gap: var(--space-150);
}

.banner {
  display: inline-flex;
  align-items: center;
  gap: var(--space-075);
  align-self: flex-start;
  padding: var(--space-075) var(--space-125);
  background: var(--brand-a100);
  color: var(--brand-70);
  border-radius: var(--radius-full);
  font-family: var(--sans);
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.01em;
  box-shadow: 0 0 0 1px var(--brand-50) inset;
}
```

- [ ] **Step 3: Lint**

Run: `npm run lint -- src/components/Organism/LeaderboardDrawer`
Expected: no errors.

- [ ] **Step 4: Visual smoke**

Run: `npm start` — open the app, switch to an Electronics SA persona (Rohit — `EMP-0041`, rank 3 → top-3 banner visible), tap the rank pill.
Expected:
  - Drawer slides up (existing Nexus animation).
  - Banner says `🏆 Top 3 — keep it up!`.
  - Podium shows Priya (#2) left, Vikram (#1) centre (taller), Rohit (#3) right with brand-ring self highlight.
  - Focus list shows `#4 Kiran` and `#5 Anita (On notice)` — no top `…`, no bottom `…` (only 5 entries total).

- [ ] **Step 5: Visually test rank >3 path**

Temporarily edit `src/data/payouts.js` for `EMP-0041`: set `myRank.rank = 3` → change a self entry's `isSelf` so the user becomes rank 4 (move `isSelf: true` from Rohit to Kiran). Reload.

Wait — easier path: keep data as-is, test by selecting a persona whose rank is outside top 3. Open the persona switcher, pick Kiran (`EMP-0045` or whichever the mock places at rank ≥4).

If no persona lands outside top 3, edit the mock temporarily: set `myRank.rank = 4` and `isSelf` moved one row. Confirm:
  - Banner is absent.
  - Podium shows ranks 1, 2, 3 (none are self).
  - Focus list shows `#4 (You)` and `#5`, no top `…`, no bottom `…`.

Revert the temporary mock edit before committing.

- [ ] **Step 6: Commit**

```bash
git add src/components/Organism/LeaderboardDrawer/LeaderboardDrawer.jsx src/components/Organism/LeaderboardDrawer/LeaderboardDrawer.module.scss
git commit -m "feat(leaderboard): compose drawer from podium + focus list + top-3 banner"
```

---

## Task 6 — Rank-tier treatment for the header pill

**Files:**
- Modify: `src/components/Organism/HeaderBar/HeaderBar.jsx`
- Modify: `src/components/Organism/HeaderBar/HeaderBar.module.scss`

**Tiers:**
- `gold` → rank === 1
- `silver` → rank === 2
- `bronze` → rank === 3
- `brand` → rank between 4 and 10 inclusive
- `default` → rank > 10 or unknown

- [ ] **Step 1: Add the tier derivation in `HeaderBar.jsx`**

Modify `src/components/Organism/HeaderBar/HeaderBar.jsx` — inside the component, just before the `return`:

```jsx
  const rankTier =
    typeof rank !== 'number'
      ? 'default'
      : rank === 1 ? 'gold'
      : rank === 2 ? 'silver'
      : rank === 3 ? 'bronze'
      : rank <= 10 ? 'brand'
      : 'default';
```

Then change the `<button>` opening tag of the leaderboard pill from:

```jsx
              <button
                type="button"
                className={styles.leaderboardPill}
                onClick={onOpenLeaderboard}
```

to:

```jsx
              <button
                type="button"
                className={styles.leaderboardPill}
                data-rank-tier={rankTier}
                onClick={onOpenLeaderboard}
```

- [ ] **Step 2: Add the tier styles in `HeaderBar.module.scss`**

Append to `src/components/Organism/HeaderBar/HeaderBar.module.scss` (after the existing `.leaderboardPill` + `.leaderboardLabel` rules):

```scss
.leaderboardPill[data-rank-tier='gold'] {
  border-color: var(--medal-gold);
  color: var(--medal-gold);
  box-shadow: 0 0 0 1px var(--medal-gold) inset;
}
.leaderboardPill[data-rank-tier='silver'] {
  border-color: var(--medal-silver);
  color: var(--medal-silver);
  box-shadow: 0 0 0 1px var(--medal-silver) inset;
}
.leaderboardPill[data-rank-tier='bronze'] {
  border-color: var(--medal-bronze);
  color: var(--medal-bronze);
  box-shadow: 0 0 0 1px var(--medal-bronze) inset;
}
.leaderboardPill[data-rank-tier='brand'] {
  border-color: var(--brand-50);
  color: var(--brand-70);
}
```

The `default` tier relies on the base `.leaderboardPill` styles — no extra rule needed.

- [ ] **Step 3: Lint**

Run: `npm run lint -- src/components/Organism/HeaderBar`
Expected: no errors.

- [ ] **Step 4: Visual smoke**

Run (or keep running): `npm start`. Cycle personas in the persona switcher across ranks 1, 2, 3, 4, 11 if available. Confirm each tier renders as expected in both light and dark mode.

- [ ] **Step 5: Commit**

```bash
git add src/components/Organism/HeaderBar/HeaderBar.jsx src/components/Organism/HeaderBar/HeaderBar.module.scss
git commit -m "feat(leaderboard): rank-tier gold/silver/bronze styling on header pill"
```

---

## Task 7 — Synthesize Grocery `myRank` by money earnings

**Files:**
- Modify: `src/api/transformers/grocery.js`

**Intent.** Right now `transformGroceryPayout` sets `myRank: null` because the API doesn't return peer data. For mock purposes, we fabricate a deterministic 5-person leaderboard where the current employee's rank + `earned` come from their `individualPayout` (which *is* in the API response). Other entries are synthesised around that value. Unit is **₹ (money)** per the user's instruction.

- [ ] **Step 1: Add the `buildGroceryMyRank` helper**

In `src/api/transformers/grocery.js`, insert the following helper directly above the `transformGroceryPayout` export (after the existing `buildStreakShape`):

```js
// ---------------------------------------------------------------------------
// Leaderboard synthesis (mock) — peers and ranks are fabricated from the
// current user's individual payout since the API doesn't yet return peers.
// ---------------------------------------------------------------------------

const GROCERY_PEER_NAMES = [
  'Meena Joshi',
  'Sneha Iyer',
  'Rahul Kulkarni',
  'Anjali Nair',
  'Vivek Menon',
];

function buildGroceryMyRank(individualPayout, selfName) {
  const myEarned = Math.max(0, Math.round(Number(individualPayout) || 0));

  // Synthesise 4 peer earnings around the user's payout (two above, two below),
  // then sort desc and assign ranks. If individualPayout is 0, put the user last.
  const peerDeltas = [0.32, 0.12, -0.15, -0.28]; // fractional adjustments
  const fallbackBase = myEarned > 0 ? myEarned : 800;
  const peers = GROCERY_PEER_NAMES.slice(0, 4).map((name, i) => ({
    name,
    earned: Math.max(0, Math.round(fallbackBase * (1 + peerDeltas[i]))),
    isSelf: false,
  }));

  const selfEntry = { name: selfName || 'You', earned: myEarned, isSelf: true };

  const sorted = [...peers, selfEntry]
    .sort((a, b) => b.earned - a.earned)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  const self = sorted.find((e) => e.isSelf);
  const selfIdx = sorted.findIndex((e) => e.isSelf);
  const deltaAbove =
    selfIdx > 0 ? sorted[selfIdx - 1].earned - self.earned : 0;

  return {
    rank: self.rank,
    deltaAbove,
    scope: 'store',
    scopeNote: 'by money earned',
    unitLabel: 'earned',
    top: sorted,
  };
}
```

- [ ] **Step 2: Wire the helper into the return value**

In the same file, find the `return { ... myRank: null, ... }` inside `transformGroceryPayout` and replace the `myRank: null` line with:

```js
    myRank: buildGroceryMyRank(
      Number(cs.yourPayout) || 0,
      employee.employeeName || employee.employeeId || 'You',
    ),
```

Remove the trailing `// not available yet` comment on that line.

- [ ] **Step 3: Smoke-test the Grocery path**

Run: `npm start` — switch to a Grocery SA persona (vertical GROCERY, e.g. `GRC-2203`). Tap the rank pill.
Expected:
  - Pill shows `#<n>` with tier colour matching rank.
  - Drawer opens, banner shows iff user is in top 3.
  - Podium shows three fabricated peer names with ₹ amounts.
  - Focus list renders rows around self with `₹` formatting (not pieces).
  - `scopeNote` reads `by money earned` in the drawer subtitle.

- [ ] **Step 4: Commit**

```bash
git add src/api/transformers/grocery.js
git commit -m "feat(grocery): synthesise money-based myRank for leaderboard drawer"
```

---

## Task 8 — Final visual QA sweep & commit (if anything was tweaked)

**No file changes expected unless QA surfaces issues.**

- [ ] **Step 1: Electronics SA, rank in top 3** — confirm banner + gold/silver/bronze tile ordering + self ring on podium + focus rows #4 #5 + no `…`.
- [ ] **Step 2: Electronics SA, rank 4** — temporarily set `EMP-0045` (Kiran) `myRank.rank = 4` and `isSelf` in the mock if needed. Confirm no banner, no top `…`, focus rows = #4 (You) + #5, no bottom `…` (only 5 entries). Revert the mock edit.
- [ ] **Step 3: Electronics SA, rank in middle** — temporarily extend the mock `top` to 10 entries with self at rank 6. Confirm top `…`, rows #5 #6 (You) #7, bottom `…`. Revert.
- [ ] **Step 4: Grocery SA** — open drawer. Confirm `₹` formatting, peer names from the synthesiser, subtitle reads `by money earned`. Verify both top-3 and outside-top-3 scenarios by switching to grocery personas whose `yourPayout` differs (or by editing `cs.yourPayout` in the grocery mock to push rank up/down).
- [ ] **Step 5: Dark mode** — toggle the theme switch. Confirm medal colours, banner contrast, self row contrast all still read cleanly.
- [ ] **Step 6: Reduced motion** — toggle macOS "Reduce motion" (or `System Settings → Accessibility → Display`). Reopen the drawer. Confirm podium tiles appear instantly with no translate, self row has no pulse.
- [ ] **Step 7: Run the whole test suite to catch regressions**

```bash
npm test
```

Expected: all tests pass (including the new `computeFocusRows` suite).

- [ ] **Step 8: Lint + format**

```bash
npm run lint
npm run format
```

Expected: clean.

- [ ] **Step 9: Final sanity commit (only if format/lint changed anything)**

```bash
git status
# if any files changed:
git add -A && git commit -m "chore: lint/format after leaderboard redesign"
```

---

## Spec-coverage check

- ✅ Rank-aware pill (Task 6) — covers spec §1
- ✅ Top-3 banner with exact copy `🏆 Top 3 — keep it up!` (Task 5 Step 1) — covers spec §2
- ✅ Classic podium `#2 / #1 / #3` with tier accents (Task 4) — covers spec §2
- ✅ Focus list with `…` affordances, self ± 1 neighbour (Tasks 2, 3) — covers spec §2
- ✅ Self row pulse + podium stagger + reduced-motion honoured (Tasks 3, 4 styles + existing globals rule) — covers spec §3
- ✅ Grocery `myRank` in money terms (Task 7) — covers spec §4
- ✅ F&L / Trends skipped (no task touches the F&L transformer) — covers spec scope
- ✅ Medal semantic tokens added (Task 1) — covers spec architecture
- ✅ `computeFocusRows` unit-tested (Task 2) — covers spec testing
