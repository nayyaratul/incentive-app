---
date: 2026-04-15
topic: Bottom-entering overlays
status: approved
---

# Bottom-entering overlays

## Context

Every overlay in the Incentive App that currently reads as a "popup from the side" must instead enter from the bottom edge and sit as a bottom sheet. The app is mobile-first; bottom sheets are the native mobile expectation and align with the Nexus design system's tokens-first principle (one overlay shape across the app, fewer per-component variations).

## Goal

All four `Drawer`-based overlays enter from the bottom, adopt the bottom-sheet shape (full-width, rounded top corners, `max-height: 85vh`), and dismiss identically to today. No consumer component changes.

### In scope

- `src/nexus/molecules/Drawer/Drawer.module.scss`
- Visual verification in the four trigger paths

### Out of scope

- Centered modals (`Modal`, `TierCelebration`) — not "from the side"
- Toasts — desktop still slides from right; unchanged
- Tooltips — anchored and direction-relative by design; unchanged
- Animation-token additions in `_tokens-semantic.scss`
- Consumer components (`TransactionDetailSheet`, `LeaderboardDrawer`, `StoreDetailDrawer`, `EmployeeDetailDrawer`) — already pass `placement="bottom"`

## Root cause

All four consumers already declare `placement="bottom"`. `Drawer.module.scss` positions the surface correctly for bottom (`.placementBottom { align-items: flex-end; justify-content: stretch; }`) but its `@keyframes drawer-enter` is hardcoded to `translateX(var(--space-300))` on `.surface`, overriding placement during entry. Three of the four drawers therefore slide in from the right despite being configured as bottom sheets; `TransactionDetailSheet` looks visually wrong for the same reason even though it's already positioned at the bottom.

## Approach

Placement-aware base SCSS. Split the single `drawer-enter` keyframe into three axis-specific keyframes, move the `animation` declaration from `.surface` onto each `.placementX` selector so the correct keyframe is used per placement, and extend `.placementBottom > .surface` with the bottom-sheet shape rules. `placement="start"` and `placement="end"` remain functional for future use.

This fixes the bug at the shared primitive and leaves all four consumers untouched.

## SCSS changes

All changes live in `src/nexus/molecules/Drawer/Drawer.module.scss`.

### 1. Replace the single keyframe with three axis-specific keyframes

Remove:

```scss
@keyframes drawer-enter {
  from { opacity: 0; transform: translateX(var(--space-300)); }
  to   { opacity: 1; transform: translateX(0); }
}
```

Add:

```scss
@keyframes drawer-enter-end {
  from { opacity: 0; transform: translateX(var(--space-300)); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes drawer-enter-start {
  from { opacity: 0; transform: translateX(calc(-1 * var(--space-300))); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes drawer-enter-bottom {
  from { opacity: 0; transform: translateY(var(--space-300)); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### 2. Move `animation` off `.surface` onto each placement

Remove the `animation: drawer-enter 300ms ease;` line from `.surface`. Keep the `transition: transform 300ms ease, box-shadow 300ms ease;` line — it governs non-entry transforms.

Add (near the existing `.placementX` rules):

```scss
.placementStart  > .surface { animation: drawer-enter-start  300ms ease; }
.placementEnd    > .surface { animation: drawer-enter-end    300ms ease; }
.placementBottom > .surface { animation: drawer-enter-bottom 300ms ease; }
```

### 3. Bottom-sheet shape

Add a **new** rule targeting the surface child. This is distinct from the existing `.placementBottom` rule (which targets `.root` to control layout alignment) and from the animation rule in step 2 (which uses the same selector but only declares `animation`). Keep those as-is; the rules stack.

```scss
.placementBottom > .surface {
  width: 100%;
  max-width: 100%;
  max-height: 85vh;
  border-radius: var(--radius-200) var(--radius-200) 0 0;
  border-bottom-width: 0;
}
```

Rationale:
- `width: 100%; max-width: 100%` — full-width across all breakpoints. The current mobile media query (≤640px) already forces this; this rule lifts it to desktop too, intentionally overriding the `.surface` default of `min(100vw, calc(32 * var(--space-200)))`.
- `max-height: 85vh` — keeps the scrim visible above the sheet. Replaces the `.surface` default of `max-height: 100vh` for bottom placement only.
- `border-radius: var(--radius-200) var(--radius-200) 0 0` — rounded top corners only so the sheet reads as attached to the bottom edge.
- `border-bottom-width: 0` — the sheet touches the viewport bottom; a bottom border would be visually odd.

### 4. Fix `.stackedBehind` to be placement-aware

**Replace** the existing standalone `.stackedBehind` rule (which uses `translateX` and is wrong when the active placement is bottom) with two scoped versions — one for side placements, one for bottom:

```scss
.placementStart  .stackedBehind,
.placementEnd    .stackedBehind {
  box-shadow: var(--elevation-surface-raised-low);
  transform: scale(0.96) translateX(calc(-1 * var(--space-250)));
}

.placementBottom .stackedBehind {
  box-shadow: var(--elevation-surface-raised-low);
  transform: scale(0.96) translateY(calc(-1 * var(--space-250)));
}
```

(Defensive — today nothing stacks. Prevents latent bug when stacking is introduced.)

### 5. Mobile media query — no change

The existing `@media (max-width: 640px)` rule that forces `.surface` to `width: 100%; max-width: 100%` remains. It still applies to side-placement drawers on mobile and is redundant-but-harmless for bottom (which already forces full width at all widths via rule 3).

### 6. Timing and easing

Keep `300ms ease` unchanged. If a motion token (`--motion-overlay-enter`) is introduced later, this is the single place to swap it in.

## Consumer components — no changes

Confirmed via grep of `src/components/Organism/*/\*.jsx`:

| Consumer | Current `placement` |
|---|---|
| `TransactionDetailSheet.jsx:41` | `"bottom"` |
| `EmployeeDetailDrawer.jsx:46` | `"bottom"` |
| `StoreDetailDrawer.jsx:30` | `"bottom"` |
| `LeaderboardDrawer.jsx:23` | `"bottom"` |

All four inherit the fix automatically once the base SCSS is updated.

## Verification

Visual-only (no unit tests — the project tests only pure functions in `services/GamificationEngine/`). Run `npm start` and verify each trigger:

1. **`TransactionDetailSheet`** — click a transaction row in HistoryScreen and StoreTransactions
2. **`LeaderboardDrawer`** — open from EmployeeHome
3. **`StoreDetailDrawer`** — open from CentralHome
4. **`EmployeeDetailDrawer`** — open from StoreManagerHome

For each:
- Sheet enters from the bottom edge (no horizontal motion)
- Full viewport width
- Rounded top corners, square bottom corners
- Content scrolls inside when it exceeds `85vh` (specifically check `LeaderboardDrawer`, which is content-heavy)
- Backdrop click, Escape key, and close button all dismiss (no JS changed, but confirm)

Test at mobile (≤640px) and desktop (≥1024px) widths.

Confirm `npm run lint` and `npm run build:dev` both pass.

## Risks

- **Desktop full-width bottom sheet** — on 1440px+ the sheet spans the full viewport, a noticeable change from today's ~512px right-edge drawer. This is an intentional consequence of the full-bottom-sheet shape (Approach A). If desktop appearance needs a cap later, add `max-width: calc(40 * var(--space-200))` with `align-self: center` on `.placementBottom > .surface` as a follow-up.
- **Stacking order** — `.stackedBehind` fix is defensive. No current code stacks drawers; if stacking lands later it will render correctly.
- **Hardcoded `300ms ease`** — no motion token exists yet, so the value is literal. Flag for replacement if `--motion-*` tokens are introduced.
