# Leaderboard Drawer & Pill Redesign

**Date:** 2026-04-15
**Author:** Atul Nayyar (with Claude)
**Status:** Draft — pending review

## Problem

The leaderboard entry point in `HeaderBar` is a neutral trophy pill that shows `#<rank>`. Tapping it opens `LeaderboardDrawer`, which renders every entry in `myRank.top` as a flat list. This does not celebrate the top performers, gives no spatial orientation ("who's right above/below me?"), and — for users deep in the list — buries the self row amongst strangers.

## Goal

Make the leaderboard instantly legible at a glance:

1. The pill itself conveys *how you're doing*, not just "there is a rank".
2. The drawer opens with a graphical **podium** for the top 3.
3. Below the podium, a **focus list** shows you and your immediate neighbours, with `…` affordances signalling there are more people above and/or below.
4. If the user is already in the top 3, a celebratory banner replaces the "chasers" context.

## Scope

- **Verticals covered:** Electronics ✅ (data exists), Grocery ✅ (add mock `myRank` keyed by individual sales in ₹), F&L / Trends ❌ (skip — user explicitly excluded).
- **Personas:** SA only (the pill is already gated by `tab === 'home'` in `EmployeeHome`).
- **Non-goals:** No change to routing, persona model, or the `buildLeaderboardView` service. No backend wiring — stays on mock data.

## Design

### 1. Rank-aware pill (`HeaderBar.leaderboardPill`)

Keep placement, size, and label. Vary treatment by rank tier:

| Tier       | Icon color          | Background                        | Ring / glow                        |
|------------|---------------------|-----------------------------------|------------------------------------|
| #1         | `--medal-gold`      | `--color-bg-tertiary`             | 1px `--medal-gold` ring            |
| #2         | `--medal-silver`    | `--color-bg-tertiary`             | 1px `--medal-silver` ring          |
| #3         | `--medal-bronze`    | `--color-bg-tertiary`             | 1px `--medal-bronze` ring          |
| #4–#10     | `--brand`           | `--color-bg-tertiary`             | existing `--color-border-default`  |
| #11+       | `--color-text-primary` (unchanged) | unchanged        | unchanged                          |

Medal tokens are added to `_tokens-semantic.scss` (primitive-backed) — they are new semantic tokens, not per-component hardcodes, per the project design-system rule.

Label continues to read `#<n>`. No size change → doesn't disrupt header layout on narrow screens.

### 2. Drawer redesign — `LeaderboardDrawer`

Slot order, top to bottom:

```
┌──────────────────────────────────────────┐
│ Header: 🏆  You're #3 · store          │ ← unchanged Drawer header
├──────────────────────────────────────────┤
│ [Banner, only if self is top-3]          │
│  🏆  Top 3 — keep it up!                 │
├──────────────────────────────────────────┤
│ PODIUM                                   │
│        ┌────┐                            │
│   ┌────┤ #1 ├────┐                       │
│   │ #2 │Gold│ #3 │   ← classic podium    │
│   │silv│ tall│bron│     (2 left, 1 ctr,  │
│   │name│name │name│      3 right)        │
│   │ ₹  │ ₹   │ ₹  │                      │
│   └────┴────┴────┘                       │
├──────────────────────────────────────────┤
│ FOCUS LIST                               │
│   · · ·        ← iff there's anyone      │
│                   between #3 and the     │
│                   neighbourhood          │
│   #N−1  Name                      ₹xxx   │
│   #N    You (self highlight)      ₹xxx   │
│   #N+1  Name                      ₹xxx   │
│   · · ·        ← iff there's anyone      │
│                   below                  │
└──────────────────────────────────────────┘
```

**Classic podium layout:** tiles in DOM order render as `[#2, #1, #3]`. Center tile tallest (~128px), left (~104px), right (~88px). Each tile: medal icon at top, avatar-initials or just the rank chip, name (one line, ellipsis), ₹earned in `--mono`. Self on the podium: extra `--brand` outline ring.

**Focus list rules:**

| User's rank | Row(s) rendered                              | Top `…`? | Bottom `…`?                        |
|-------------|----------------------------------------------|----------|------------------------------------|
| 1, 2, or 3  | `#4`, `#5` (next two chasers)                | no       | yes, iff list has > 5 entries      |
| 4           | `#3`, `#4 (self)`, `#5`                      | no (podium covers #3) | yes, iff > 5        |
| 5 … N−1     | `#rank−1`, `#rank (self)`, `#rank+1`         | yes      | yes, iff `rank+1 < last`           |
| N (last)    | `#rank−1`, `#rank (self)`                    | yes      | no                                 |

`…` is a small centered row using `--color-text-tertiary`, not interactive in v1 (no "expand full list" action — we can add later if wanted).

**Banner copy (top-3 case):** exact string `🏆  Top 3 — keep it up!` — brand-tinted pill-style row inserted between Drawer header and podium.

### 3. Animation

- **Drawer slide-up:** unchanged — Nexus `Drawer` already handles it.
- **Podium stagger:** on open, each podium tile fades + translates up (8px → 0) in order `#2 → #1 → #3`, 60ms stagger, 260ms duration, `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- **Self row pulse:** when self is in the focus list, the self row does one subtle brand-tint pulse (400ms, opacity 0.7 → 1) on mount so the eye lands on it.
- All animations respect `prefers-reduced-motion: reduce` — disable to a simple fade.

### 4. Grocery mock data

`src/data/payouts.js` — add `myRank` to the grocery payout entries (all SA-level grocery employees who should see a leaderboard). Implementation will mirror the shape used by the Electronics entries:

```js
myRank: {
  rank: 2,
  deltaAbove: 1240,
  scope: 'store',
  unitLabel: 'earned',
  top: [
    { rank: 1, name: 'Meena Joshi',    earned: 9820, isSelf: false },
    { rank: 2, name: 'Sneha Iyer',     earned: 8580, isSelf: true  },
    { rank: 3, name: 'Rahul Kulkarni', earned: 7410, isSelf: false },
    { rank: 4, name: 'Anjali Nair',    earned: 6120, isSelf: false },
    { rank: 5, name: 'Vivek Menon',    earned: 5230, isSelf: false },
  ],
}
```

The grocery API transformer at `src/api/transformers/grocery.js:85` continues to pass `myRank: null` (real data not available), but the mock-data path in `src/data/payouts.js` now supplies it so Grocery SAs see the drawer. This matches the existing "API vs mock fallback" pattern used elsewhere.

## Architecture

**New files**
- `src/components/Molecule/LeaderboardPodium/LeaderboardPodium.jsx` — pure presentational, takes `{ entries: [top1, top2, top3], selfRank }`.
- `src/components/Molecule/LeaderboardPodium/LeaderboardPodium.module.scss`.
- `src/components/Molecule/LeaderboardFocusList/LeaderboardFocusList.jsx` — takes `{ entries, selfRank, unitLabel }`, computes which rows + `…` affordances to render per the table above.
- `src/components/Molecule/LeaderboardFocusList/LeaderboardFocusList.module.scss`.

**Changed files**
- `src/components/Organism/LeaderboardDrawer/LeaderboardDrawer.jsx` — composes banner + podium + focus list. The existing flat-list code is removed.
- `src/components/Organism/LeaderboardDrawer/LeaderboardDrawer.module.scss` — banner + section spacing; existing `.list` / `.row` rules removed (migrated into FocusList).
- `src/components/Organism/HeaderBar/HeaderBar.jsx` — pill gets `data-rank-tier` attribute (`'gold' | 'silver' | 'bronze' | 'brand' | 'default'`).
- `src/components/Organism/HeaderBar/HeaderBar.module.scss` — tier-specific rules driven by `data-rank-tier`.
- `src/styles/_tokens-semantic.scss` — add `--medal-gold`, `--medal-silver`, `--medal-bronze` semantic tokens.
- `src/data/payouts.js` — add `myRank` to the grocery sample entry.

### Data flow

```
EmployeeHome
  └─ reads `myRank` from payout (unchanged)
     ├─ passes `rank` to HeaderBar → pill tier derived inline from rank
     └─ passes `myRank` to LeaderboardDrawer
          ├─ derives top3 = myRank.top.filter(e => e.rank <= 3)
          ├─ derives focusEntries = myRank.top.filter(e => e.rank > 3)
          │   then slices around self per the table above
          └─ passes both to Podium + FocusList
```

No new state. No context changes. Composition is local to the drawer.

## Error & edge handling

- **Fewer than 3 entries in `top`:** podium renders only the positions it has (2 tiles, or just #1). No crash.
- **`myRank` is null:** `LeaderboardDrawer` already early-returns `null`. Pill is also hidden (existing behaviour in `HeaderBar`).
- **Self not in `top` array at all:** buildLeaderboardView already handles this by appending self with a separator; we treat the separator as "top `…` present, then render self row". Focus list uses the `rank` field, not array position, to compute neighbours.
- **Tied ranks:** spec assumes unique ranks in mock data. Real API sorting is out of scope for this change.

## Testing

- **Unit tests:** `LeaderboardFocusList` has a test covering the 4 rank cases in the table (top-3, rank=4, middle, last). Pure function `computeFocusRows(entries, selfRank)` extracted for testability. This is the only new logic; podium and pill are presentational.
- **Visual check:** run `npm start`, cycle through Electronics (rank 3 → top-3 state) and Grocery (rank 2 → top-3 state) in the persona switcher. Temporarily edit the mock rank to 5 and 20 to verify the outside-top-3 path.
- **Reduced motion:** toggle OS setting and confirm podium tiles appear instantly with no translate.

## Open questions

None — remaining decisions from the original conversation are resolved (classic podium, exact top-3 copy, scope excludes F&L).

## Future work (out of scope)

- Interactive `…` rows that expand to show the full list.
- Leaderboard for F&L (Trends) once product defines the metric.
- Real API wiring for the grocery transformer (`src/api/transformers/grocery.js:85`).
