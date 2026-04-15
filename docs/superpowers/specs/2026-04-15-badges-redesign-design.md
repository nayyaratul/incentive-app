# Badges redesign — Metallic Medallion Shelf + Trophy Case Drawer

**Status:** Draft · **Date:** 2026-04-15 · **Owner:** Atul Nayyar

## Background

`BadgesStrip` today renders each achievement as a flat white rectangle with an emoji in a blue tint circle, a semibold label, and an unlock date. Earned and locked states are differentiated only by 40% opacity + grayscale. The result reads as stickers rather than earned trophies, and there is no sense of rarity or progression even though the underlying data already varies wildly in difficulty (*first sale* vs. *department crosses 120%*).

## Goal

Replace the flat strip with a visually impactful, collectible-feeling badge system while:

1. Reusing existing data (we only add two small fields).
2. Reusing existing Nexus design tokens (`--medal-gold / silver / bronze` already exist from the leaderboard podium).
3. Reusing the existing Nexus `Drawer` component for the full view — no new route, no bottom-nav change.

## Non-goals

- Re-authoring the badge taxonomy. Same badges, same ids, same notes — just richer presentation.
- Badge families with progressive tiers (3-day → 7-day → 30-day streaks). That's a bigger data change; out of scope here, but nothing in this design precludes adding it later.
- Shareable badge cards / push notifications on unlock. Out of scope.
- Touching `LevelCard`, `StreakNote`, `QuestCard`, or `TierCelebration`. Those live alongside badges; they stay as they are.

## User-facing design

### 1. Home — Medallion shelf

Replaces the current `BadgesStrip` content region in all three vertical views (`ElectronicsView`, `GroceryView`, `FnlView`), rendered in the same section slot.

- Section header stays: medal icon + "Badges" + "X of Y earned" counter (brand accent on the earned count).
- Below the header, a horizontal strip of **up to 4 medallions** plus a fifth **"+N · View all"** circle at the tail.
- Each medallion is a 54px circular coin with a metallic radial-gradient fill, inset bevel, and a soft cast shadow. The emoji (from the existing `icon` field) sits centered at 22px.
- Below the medallion, a single-line label (the existing `label` field, ellipsis if it overflows a 62px column).
- Sorting rules for which four show on home: (a) newly-unlocked first (`unlockedAt` within last 24h), (b) then gold → silver → bronze, (c) then by most recent `unlockedAt`, (d) locked badges last. If there are more than 4 visible, the rest collapse behind the "+N · View all" chip.
- The "View all" circle is a dashed red-brand outline with a count ("+2") centered in it and the word "View all" as the label below. It appears **only when the total badge count exceeds 4** — if an employee has four or fewer badges total, every one is visible on the shelf and there's nothing to "view all" of. See §Edge cases for the tie-break behavior at exactly 4.

### 2. Trophy Case drawer

Tapping the "View all" chip opens a full-height bottom-sheet drawer:

- Reuses `src/nexus/molecules/Drawer/Drawer.jsx` with `placement="bottom"` and `height="full"`.
- Drawer header: title "Trophy Case", close ✕ button (Drawer handles both).
- Inside the drawer body:
  - **Golden stats bar** — a rounded card with a `--medal-gold` radial gradient. Big tabular number "3 / 5", caption "earned this month", and a thin progress fill under it.
  - **Filter tabs** — pill-shaped chips using the same pattern as `SharedScreens.chipsRow`: *All* · *Streaks* · *Sales* · *Milestones* · *Locked*. "All" is default-selected. Tabs are derived from the new `category` field on each badge; "Locked" is the inverse of `unlockedAt`.
  - **Medallion grid** — 3 columns on mobile, 8px row gap, 12px column gap. Each cell contains the same `Medallion` component used on the home shelf plus a two-line wrapping label underneath.

### 3. Medallion detail drawer

Tapping a medallion (on either home or trophy case) opens a **second** bottom-sheet drawer stacked on top:

- Hero section: 96px medallion rendered with the same metallic treatment, slightly bigger.
- Name (existing `label`), rarity chip (Bronze / Silver / Gold), category chip.
- The existing `note` field rendered as supporting copy ("Made your first qualifying sale this month").
- If earned: "Unlocked on 13 Apr 2026" using `formatDate` from `utils/format.js`.
- If locked: "How to earn" followed by the note, and a subtle hint line ("Keep going — you're on a 5-day streak" when derivable; plain note otherwise).

## Visual system

### Rarity tiers

Every badge gets a `rarity` field: `'bronze' | 'silver' | 'gold'`. No grey "default" fallback — if a badge has no rarity, it's a data-authoring bug; fail loud in dev.

| Tier | When | Visual |
|---|---|---|
| Bronze | Easy wins, entry-level milestones (first sale, first campaign sale) | radial gradient `#F6D9B3 → #E7BE8A → #B57832`, border `#C88A4A` |
| Silver | Mid-difficulty / recurring milestones (department at 120%, premium-band sale) | radial gradient `#FBFBFD → #E5E7EB → #9CA3AF`, border `#C9CFD9` |
| Gold | Streaks, elite achievements, "all X" completion badges | radial gradient `#FFE999 → #F7D973 → #B58400`, border `#E6B820` |

These exact hex values already live in `src/nexus/styles/base.css` as `--medal-gold / silver / bronze` (currently only referenced by the leaderboard podium). The redesign reuses those tokens — no new ones.

### Shape & finish

- 54px circle on home; 96px in the detail drawer.
- Metallic radial gradient (light source top-left at 30% / 25%).
- Inset highlight (`inset 0 2px 0 rgba(255,255,255,0.5)`) and inner shadow (`inset 0 -3px 6px rgba(0,0,0,0.18)`) for the coin-bevel feel.
- 2px solid border in the tier's rim color.
- Outer cast shadow (`0 4px 10px rgba(0,0,0,0.15)`).
- The emoji sits on top at 22px (home) or 40px (detail) with no filter.

### Locked state

**Not** grayscale + 40% opacity. Locked medallions are a transparent-fill circle with a 2px dashed `--color-border-default` border, emoji rendered in tertiary text color, and no cast shadow. This reads as "silhouette / not yet claimed" rather than "broken / disabled."

### Newly-unlocked celebration

For any badge whose `unlockedAt` is within the last 24 hours:

- A small red pill that reads **NEW** sits on the medallion's upper-right corner.
- A soft pulsing halo (`box-shadow` keyframe, brand-red at 12–22% opacity, 2s ease-in-out loop).
- On the *first render after unlock*, a one-shot scale-up-and-fade animation (200ms). Tracked via a `seenBadgeIds` entry in `localStorage` keyed by `employeeId` — already the same persistence pattern used elsewhere in the app (confirm during implementation).
- All animations wrapped in `@media (prefers-reduced-motion: reduce) { animation: none }`.

### Tokens

All new styles reference existing tokens:

- Colors: `--medal-gold`, `--medal-silver`, `--medal-bronze`, `--color-border-default`, `--color-text-primary / secondary / tertiary`, `--brand-70` (for the "View all" dashed border + accent).
- Spacing: `--space-075, --space-100, --space-125, --space-150, --space-250`.
- Radius: `--radius-full` for circles, `--radius-200` for the stats bar.
- Elevation: `--elevation-surface-raised-low` for the drawer surface (already set by `Drawer`).
- No new tokens are added. If any new value is needed during implementation, it must be promoted to a token before merging — per the project's design-system rule.

## Data model

### Badge object

Current (`src/data/gamification.js`):

```js
{ id, icon, label, note, unlockedAt }
```

New:

```js
{ id, icon, label, note, unlockedAt, rarity, category }
```

- `rarity: 'bronze' | 'silver' | 'gold'` — required.
- `category: 'streak' | 'sales' | 'milestone'` — required; drives the trophy-case filter tabs.

### Backfill

All existing entries in `badgesByEmployee` (three sample employees, EMP-0041 / GRC-2203 / FNL-3103) get updated with the two new fields. Assignments are based on intent:

| Badge id | Rarity | Category |
|---|---|---|
| first-sale | bronze | milestone |
| streak-7 | gold | streak |
| multiplier-120 | silver | sales |
| tv-premium | silver | sales |
| all-depts | gold | milestone |
| first-campaign | bronze | milestone |
| store-100 | silver | milestone |
| all-brands | gold | sales |
| full-week | silver | streak |
| first-qualify | bronze | milestone |
| consistency | gold | streak |

### API integration

The badges data path is `src/data/gamification.js` → `BadgesStrip` today, so the mock layer is the source of truth. When a real API lands for badges, it must include `rarity` and `category` — they are required fields now, not optional. A transformer (following the pattern of `src/api/transformers/transactions.js`) should map whatever the backend returns to these two canonical strings.

## Component architecture

### New components

- `src/components/Atom/Medallion/Medallion.jsx` + `.module.scss`
  - Props: `{ icon, rarity, locked, isNew, size? = 'md' }` — `size` is `'sm' | 'md' | 'lg'` mapping to 44 / 54 / 96 px.
  - Renders only the coin (no label, no wrapper). Pure presentation.

- `src/components/Organism/TrophyCaseDrawer/TrophyCaseDrawer.jsx` + `.module.scss`
  - Props: `{ badges, open, onClose, onSelectBadge }`.
  - Renders the stats bar, filter tabs, and grid. Uses local `useState` for the active filter.

- `src/components/Organism/BadgeDetailDrawer/BadgeDetailDrawer.jsx` + `.module.scss`
  - Props: `{ badge, open, onClose }`.
  - Renders the large medallion + metadata. Small — basically a styled drawer body.

### Modified components

- `src/components/Widgets/BadgesStrip/BadgesStrip.jsx`
  - Switches from the current inline card markup to rendering `Medallion` components.
  - Adds the "View all" chip and the selection sorting rules described above.
  - Owns the "which badge is selected" state for the detail drawer.
  - Opens the trophy case drawer when "View all" is tapped.
  - Opens the detail drawer when a medallion is tapped (regardless of whether the tap came from the strip or inside the trophy case — the strip is the single owner of modal state so the drawer stacks work predictably).

### Reused components

- Nexus `Drawer` (`src/nexus/molecules/Drawer/Drawer.jsx`) — for both the trophy case and the detail view.
- Nexus typography atoms (`Text`, `Heading`) — already used by `BadgesStrip`.
- `formatDate` from `utils/format.js` — for the "Unlocked on …" line.

### Data flow

```
vertical view → <BadgesStrip employeeId vertical />
  └─ reads badgesByEmployee[employeeId] (or vertical sample)
  └─ renders header + strip of <Medallion/> + <ViewAllChip/>
  └─ owns state: { trophyOpen, selectedBadgeId }
  └─ <TrophyCaseDrawer open={trophyOpen} badges={…} onSelectBadge={…}/>
  └─ <BadgeDetailDrawer open={!!selectedBadgeId} badge={…}/>
```

`BadgesStrip` remains the single integration point, so all three vertical views (Electronics / Grocery / F&L) pick up the redesign without being edited.

## Motion & accessibility

- Pulse halo and newly-unlocked pop both disabled under `prefers-reduced-motion: reduce`.
- Medallion is rendered as a `<button type="button">` for tap affordance — same pattern as `txCardBtn` in `SharedScreens.module.scss`.
- `aria-label` on each button: *"7-day streak — gold streak badge, unlocked 13 April"* (earned) or *"Premium TV — silver sales badge, locked"* (not earned).
- "View all" chip is also a `<button>` with `aria-label="View all badges"`.
- Focus returns to the invoking button when a drawer closes (the Nexus `Drawer` already handles this via `getFocusableElements`).
- Trophy-case filter tabs get `role="tablist"` + `role="tab"` + `aria-selected`, matching the pattern in `HistoryScreen.jsx`.

## Edge cases

| Scenario | Behavior |
|---|---|
| Zero badges authored for an employee | `BadgesStrip` returns `null` (current behavior — kept). |
| Zero earned, N locked | Strip shows first 4 locked silhouettes + "View all" chip. Stats bar in trophy case shows "0 / N". |
| All earned (N of N) | Same shelf layout; stats bar shows full progress fill. No "Locked" tab (it just shows an empty state inside the tab: "Nothing locked — you've got them all."). |
| Fewer than 4 total badges | Strip renders what exists; *no* "View all" chip when badge count ≤ 4. |
| Label overflow (long badge name) | Single-line ellipsis on the home strip (62px column). Two-line wrap in the trophy case grid. Full label always shown in the detail drawer. |
| Drawer opens while another drawer is open | `BadgesStrip` owns both flags — tapping a medallion inside the trophy case sets `selectedBadgeId` and stacks the detail drawer above the trophy case drawer. The Nexus `Drawer` z-index (1001) stacks by render order, which works for our case (detail mounted after trophy). Verify during implementation. |
| Newly-unlocked detection without a "seen" persistence store | Fall back to: show the NEW flag + pulse for any badge whose `unlockedAt` is within the last 24h, unconditionally. The one-shot pop animation is best-effort — if the localStorage write fails, it simply plays on every refresh inside the 24h window, which is acceptable. |
| Emoji rendering varies by OS | Accepted as-is for now — same as today. A future revision can swap emoji for Lucide icons or a custom sprite, but that's out of scope. |

## Testing

**Unit:**

- `Medallion` snapshot tests for all three rarities × {locked, earned, earned-new}.
- Sorting logic in `BadgesStrip`: given a mixed input, assert the top-4 selection order.
- Category → filter-tab derivation in `TrophyCaseDrawer`.

**Manual QA checklist (run per vertical):**

- Electronics view → open home → confirm medallions render, count matches.
- Grocery view → same.
- F&L view → same.
- Tap "View all" → trophy case drawer opens with correct stats and grid.
- Tap each filter tab → grid filters correctly; "Locked" shows only locked badges.
- Tap a medallion in the strip → detail drawer opens with correct content.
- Tap a medallion inside the trophy case → detail drawer stacks on top; dismissing it returns to the trophy case.
- Close trophy case → focus returns to "View all" chip.
- 375px viewport → no horizontal overflow, labels ellipsis correctly.
- OS dark mode → medallion gradients still have clear rarity distinction, borders visible against the dark surface.
- `prefers-reduced-motion: reduce` → pulse and pop animations are disabled.

## Out of scope (future)

- Badge families with progressive tiers (3-day/7-day/30-day streaks as one connected set).
- Shareable badge cards (exportable PNG or deep link).
- Push / in-app notifications when a badge unlocks.
- Storybook entries for `Medallion` and `TrophyCaseDrawer` (worth adding once Nexus Storybook is set up more broadly).
