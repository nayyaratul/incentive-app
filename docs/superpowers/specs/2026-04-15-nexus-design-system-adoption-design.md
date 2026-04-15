# Nexus Design System Adoption — Design Spec

**Date:** 2026-04-15
**Status:** Approved
**Approach:** Copy Nexus source into Incentive App (Approach A)

## Context

The Incentive App will be accessed via redirection from a parent app built on the Nexus design system. To ensure visual continuity, the Incentive App adopts Nexus's full UI language — tokens, components, and typography. The app ships as an independent POC first, merging into the parent app in a few weeks.

## Constraints

- Mobile-only (480px max-width)
- Light theme default, dark theme available via toggle
- Mock data only (no API changes)
- Own shell (header + bottom nav)
- No new features or business logic changes

---

## 1. Token & Theming Architecture

### What changes

Delete the current token files (`_tokens-primitive.scss`, `_tokens-semantic.scss`) and the Reliance theme (`reliance-retail.scss`). Port Nexus's 3-layer token system:

- **Primitives** — 7 color scales (Neutral Grey, Cool Grey, Warm Grey, Red, Green, Yellow, Blue) x 11 steps, plus spacing, radius, shadow, opacity, and typography primitives.
- **Semantic tokens** — Purpose-driven CSS custom properties (`--color-text-primary`, `--color-bg-primary`, `--color-border-default`, `--color-action-primary`, etc.).
- **Theme layer** — Light default, dark via `[data-theme="dark"]` on root. Both defined using Nexus's mirror principle (step N to 100-N).

### Brand color integration

- Port Nexus's `setBrandColour.js` (OKLch-based).
- On app init, call with Reliance crimson `#BD2925` to generate a full 11-step brand scale.
- Brand values injected as CSS custom properties (`--brand-0` through `--brand-100`).
- Semantic action/brand tokens reference these generated values.

### Typography

- **Inter** as the sole font family (body, headings, display).
- **JetBrains Mono** for code/monospace slots.
- Drop Fraunces, Instrument Sans, and Geist Mono.
- Port Nexus's 18+ semantic text styles (micro, caption, body, title-xs through display-lg).

### Spacing

- Nexus's 8px base rhythm (0-80px, 11-step scale).
- Current 4px base shifts to 8px increments.
- 480px max-width constraint preserved.

---

## 2. Component Architecture

### Nexus components to copy (subset)

**Atoms:**
Button, Badge, Tag, Tabs, Icon, Input, InputField, FormField, ProgressBar, Switch, Avatar, Skeleton, Spinner, Divider, Heading, Text, Toast, Tooltip, Toggle, ToggleGroup

**Molecules:**
Card (compound: Header, Body, Footer, Media, Title, Eyebrow, Subtitle), Modal, Drawer, EmptyState, Table, SearchInput

### Domain components rebuilt from Nexus primitives

| Current Component | Rebuilt Using |
|---|---|
| HeroCard | Card + ProgressBar + Text/Heading + Badge |
| BottomNav | ToggleGroup + Icon + Text, custom shell styling |
| HeaderBar | Heading + Text + Avatar + Button + Badge + Switch |
| StreakChip | Tag + Icon |
| RankBadge | Badge + Avatar |
| OpportunityCard | Card + Text + Badge |
| LeaderboardDrawer | Drawer + Table or list of Cards |
| PersonaSwitcher | Modal + Button + Badge |
| QuestCard | Card + ProgressBar + Badge |
| BadgesStrip | Horizontal scroll of Badge + Icon |
| LevelCard | Card + ProgressBar + Heading |
| OfflineBanner | Toast or inline Badge variant |
| TierCelebration | Modal + lottie animation (kept) |

### Unchanged

- Business logic in `services/GamificationEngine/`
- Mock data in `data/`
- Context providers (PersonaContext, TabContext)
- Container orchestration logic (RootRouter, persona branching)
- `lottie-react` for celebration animations

---

## 3. File Structure

```
src/
  nexus/                          # Copied Nexus design system
    tokens/                       # JSON token definitions
      colours.json
      typography.json
      spacing.json
      border-radius.json
      border-width.json
      shadow.json
      opacity.json
    styles/
      base.css                    # Primitive CSS variables
      tokens.scss                 # Semantic tokens + light/dark themes
    utils/
      setBrandColour.js           # OKLch brand color generator
    atoms/                        # Nexus atom components (subset)
      Button/
      Badge/
      Tag/
      Tabs/
      ProgressBar/
      Switch/
      Avatar/
      Skeleton/
      Spinner/
      Divider/
      Heading/
      Text/
      Icon/
      Input/
      Toast/
      Tooltip/
      Toggle/
      ToggleGroup/
      index.js
    molecules/                    # Nexus molecule components (subset)
      Card/
      Modal/
      Drawer/
      EmptyState/
      Table/
      SearchInput/
      index.js
  components/                     # Domain components (rebuilt with Nexus)
    Atom/
    Molecule/
    Organism/
    Widgets/
  styles/
    globals.scss                  # Rewritten for Nexus base styles
    _mixins.scss                  # Updated for Nexus spacing/breakpoints
  containers/                     # Unchanged structure
  context/                        # ThemeContext added here
  data/                           # Unchanged
  services/                       # Unchanged
```

Key decisions:
- `src/nexus/` is the isolated Nexus source copy — easy to diff against upstream and replace during the merge.
- Current `_tokens-primitive.scss`, `_tokens-semantic.scss`, and `reliance-retail.scss` get deleted.
- Domain components keep their directory structure but internals rewritten to import from `@/nexus/atoms` and `@/nexus/molecules`.
- Webpack alias `@` -> `src/` already exists.

---

## 4. App Shell & Theme Wiring

### Theme initialization

1. `index.js` imports `@/nexus/styles/base.css` and `@/nexus/styles/tokens.scss`.
2. On mount, `setBrandColour('#BD2925')` injects the 11-step brand scale on `:root`.
3. `<html data-theme="light">` set as default.
4. `ThemeContext` provider wraps the app, exposing `{ theme, toggleTheme }`. Stores preference in `localStorage`.

### Header

- Nexus `Heading` for the greeting (Inter at display size).
- Nexus `Avatar` for user identity.
- Nexus `Badge` for rank display.
- Nexus `Button` (ghost variant) for logout.
- Nexus `Switch` for theme toggle — small, unobtrusive.
- Drop the 3px crimson signature stripe.

### Bottom navigation

- Nexus `ToggleGroup` + `Icon` + `Text`.
- Floating pill aesthetic styled through Nexus tokens.
- Active state uses `--color-action-primary` (brand-derived).

### Drawers

- All drawers switch to Nexus `Drawer`.
- Nexus Drawer provides: overlay, slide-up animation, handle bar, close button, focus trap, escape key.
- Domain content composed from Nexus Card, Text, Badge, Table.

### Modals

- PersonaSwitcher uses Nexus `Modal`.
- TierCelebration uses Nexus `Modal` as container, keeps lottie inside.

### Loading states

- Nexus `Skeleton` and `Spinner` replace custom shimmer/loading.

---

## 5. Migration Strategy

### Implementation phases

1. **Foundation** — Copy Nexus tokens, styles, utils. Update index.html fonts. Wire brand color init.
2. **Nexus components** — Copy subset of atoms and molecules. Verify Webpack build.
3. **ThemeContext** — Add theme provider and toggle.
4. **Shell** — Rebuild HeaderBar and BottomNav.
5. **Domain components** — Rewrite each component group (atoms, molecules, organisms, widgets).
6. **Containers** — Update containers to use rebuilt components. Verify all 5 personas.
7. **Cleanup** — Remove old token files, theme, unused dependencies. Verify build.

### Dependencies to install

- `@radix-ui/*` packages — Nexus components use Radix UI primitives for accessibility (Dialog, Popover, Tabs, Toggle, Switch, etc.). Install only the packages needed by the copied subset.
- `classnames` — Nexus uses this for conditional CSS class binding.
- `lucide-react` — Already in the Incentive App, no change needed.

### Risk mitigation

Nexus components are built for Astro + Vite; Incentive App uses Webpack 5. The React components are plain JSX + SCSS modules (framework-agnostic). Risk is in SCSS module resolution and Vite-specific imports. Mitigation: test Webpack build after copying the first component (Phase 2) before proceeding.

### Out of scope

- Desktop/responsive layouts
- New features or business logic
- API integration
- Unit test rewrites
- Storybook setup
- Publishing Nexus as npm package
