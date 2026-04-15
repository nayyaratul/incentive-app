# Streak & Momentum Tone-Down — Design

**Date:** 2026-04-15
**Author:** Atul Nayyar (w/ Claude)
**Status:** Draft for review

## Problem

Two small but visible rough edges on the SA home screen:

1. **StreakNote** (`src/components/Molecule/StreakNote/`) currently renders a full-width bar that is almost entirely crimson: a brand-tinted gradient background, crimson border, crimson divider, crimson text across count/label/caption/longest, plus a crimson-halo flame animation. It dominates the area below the earnings hero and reads as "alarm" rather than "positive streak." It also doesn't lean on the Nexus design system's neutral-surface-plus-accent conventions that the rest of the app is converging on.

2. **MomentumPills** (`src/components/Molecule/MomentumPills/`) shows a "First period" pill whenever `lastPeriodAmount === 0`. The pill carries no information — there is nothing to compare against — and still occupies real estate. For a new joiner it adds visual noise where a clean countdown-only row would be cleaner.

## Goals

- Reduce the red surface area in the streak display while keeping red as a deliberate focal accent.
- Align the streak display's token usage with Nexus semantic tokens (`--color-bg-*`, `--color-text-*`, `--color-border-*`) so it drifts with the system rather than against it.
- When there is no prior-period comparison available, render only the payout countdown — do not surface a placeholder pill.

## Non-Goals

- No layout/structural redesign of StreakNote. The full-width bar continuing from the earnings hero stays.
- No animation removal. The flame keeps pulsing — only its halo is softened.
- No changes to the countdown pill, the up/down/flat momentum logic, any data file, container, or prop contract.
- `StreakChip` atom (`src/components/Atom/StreakChip/`) is out of scope unless separately requested.

## Design

### Change 1 — `StreakNote.module.scss`: neutralize surface, preserve focal red

Red is retained on only two elements: the flame icon (animated focus) and the numeric count (informational focus). Everything else — background, border, label, divider, caption, "best:" stat — moves to Nexus neutral tokens.

| Element | Current | New |
|---|---|---|
| `.note` background | `linear-gradient(135deg, var(--brand-a100) 0%, var(--brand-a50) 100%)` | `var(--color-bg-secondary)` |
| `.note` border | `var(--brand-a150)` | `var(--color-border-default)` |
| `.note` color (base) | `var(--brand-70)` | `var(--color-text-primary)` |
| `.iconWrap` color | `var(--color-action-primary)` | unchanged (crimson — focus) |
| `.count` color | `var(--brand-70)` | unchanged (crimson — focus) |
| `.label` color | `var(--brand-70)` | `var(--color-text-primary)` |
| `.divider` color | `var(--brand-a200)` | `var(--color-text-tertiary)` |
| `.caption` color | `var(--brand-60)` | `var(--color-text-secondary)` |
| `.longest` color | `var(--brand-60)` | `var(--color-text-tertiary)` |
| `.longest` border-left | `var(--brand-a150)` | `var(--color-border-subtle)` |

All other rules (padding, radius, font sizes, weights, responsive `@media (max-width: 359px)` clause) stay as-is.

### Change 2 — `src/styles/globals.scss`: soften the flame halo

Current keyframes push the crimson drop-shadow to 65% opacity with a 14px blur. Against a neutral bar this reads too hot. Dial both down:

```scss
@keyframes flame-pulse {
  0%, 100% { transform: scale(1) rotate(-2deg); filter: drop-shadow(0 0 4px color-mix(in srgb, var(--brand-50) 25%, transparent)); }
  50%      { transform: scale(1.08) rotate(2deg); filter: drop-shadow(0 0 10px color-mix(in srgb, var(--brand-50) 40%, transparent)); }
}
```

Opacity: `45% → 25%` at rest, `65% → 40%` at peak. Blur radius: `6px → 4px` at rest, `14px → 10px` at peak. Motion timing and transforms unchanged.

This keyframe block is shared with `StreakChip`, so that component inherits the softened halo too. That is acceptable — `StreakChip` also benefits from a less-hot flame — but it is the one collateral effect of this change to be aware of.

### Change 3 — `MomentumPills.jsx`: drop the "first period" branch

The momentum pill should only render when a comparison actually exists. New joiners with no prior period see just the payout countdown.

**Gate `showMomentum` on a real comparison:**

```jsx
const showMomentum =
  typeof thisPeriodAmount === 'number' &&
  typeof lastPeriodAmount === 'number' &&
  lastPeriodAmount > 0;
```

**Remove the `'first'` branch** from `momentumKind` assignment:

```jsx
let momentumKind = 'flat';
let pctDelta = 0;
if (showMomentum) {
  pctDelta = ((thisPeriodAmount - lastPeriodAmount) / lastPeriodAmount) * 100;
  momentumKind = pctDelta > 1 ? 'up' : pctDelta < -1 ? 'down' : 'flat';
}
```

**Remove the `'first'` render branch** inside the momentum pill — the ternary at lines 52–62 collapses to just the up/down/flat body (percentage + "vs {lastPeriodLabel}").

**Early return check** at line 35 (`if (!showCountdown && !showMomentum) return null;`) is still correct — if neither pill has content, the row stays suppressed.

### Change 4 — `MomentumPills.module.scss`: delete `.mom-first`

The `.mom-first` rule block (background/border/text using `--brand-a100` / `--brand-a200` / `--brand-70`) is no longer referenced. Delete it.

## Data & Behavior

- No data file changes. `lastMonthPayout === 0` continues to flow through from `src/data/payouts.js`; the component just no longer renders a pill for it.
- No prop-contract changes. `lastPeriodAmount`, `thisPeriodAmount`, `lastPeriodLabel`, `nextPayoutDate`, `payoutAsOf` all keep their current shapes and defaults.
- Visual regression surface: the SA home for a new-joiner persona (e.g., EMP-0045 in the mock data) will show a single countdown pill where it previously showed countdown + "First period". All other personas render identically except for the streak bar's reduced red.

## Testing

Manual visual check via `npm start`:
- Default SA persona with an active streak: streak bar reads as neutral with a crimson flame and crimson count; label/caption/best are grey-on-warm-white.
- New-joiner persona (EMP-0045 or equivalent `lastMonthPayout: 0`): only the countdown pill renders; no "First period" pill.
- Persona with real prior-period data: up/down/flat pill renders as before with percentage and comparison label.

No unit tests are required — these are presentational changes to CSS modules and a render branch. The existing `src/services/GamificationEngine/` tests are unaffected.

## Out of Scope (deferred)

- Tokenizing the flame halo color into a dedicated semantic var (e.g., `--accent-flame-halo`) instead of coupling to `--brand-50`.
- `StreakChip` atom visual refresh.
- A dedicated "first period" empty-state treatment elsewhere in the SA home (brief copy, tooltip, etc.) — intentionally nothing is shown.
