# Nexus Design System Adoption — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Incentive App's entire UI layer with the Nexus design system — tokens, components, and typography — while preserving all business logic, data layer, and persona routing.

**Architecture:** Copy Nexus source (atoms, molecules, tokens, styles, utils) into `src/nexus/`. Rewrite all domain components to compose from Nexus primitives. Wire a ThemeContext for light/dark switching. Generate Reliance brand scale from `#BD2925` via Nexus's OKLch utility at runtime.

**Tech Stack:** React 18, Webpack 5, SCSS Modules, Radix UI primitives, Nexus tokens (CSS custom properties), Inter + JetBrains Mono fonts, lucide-react icons.

**Spec:** `docs/superpowers/specs/2026-04-15-nexus-design-system-adoption-design.md`

---

## File Structure Overview

```
src/
  nexus/                        # Copied from /Users/atulnayyar/Projects/nexus-design-system/src/
    styles/
      base.css                  # Primitive CSS variables (renamed or kept as-is)
      tokens.scss               # Semantic tokens + light/dark themes
    utils/
      setBrandColour.js         # OKLch brand color generator
    atoms/                      # Subset: 19 atom components + Overlay
      Button/, Badge/, Tag/, Tabs/, Icon/, Input/, ProgressBar/, Switch/,
      Avatar/, Skeleton/, Spinner/, Divider/, Heading/, Text/,
      Toast/, Tooltip/, Toggle/, ToggleGroup/, Overlay/
      index.js                  # Re-exports for the subset
    molecules/                  # Subset: 6 molecule components
      Card/, Modal/, Drawer/, EmptyState/, Table/, SearchInput/
      index.js                  # Re-exports for the subset
  context/
    ThemeContext.jsx             # NEW — light/dark toggle with localStorage
  components/                   # Domain components — REWRITTEN internals
  containers/                   # Updated imports, unchanged logic
  styles/
    globals.scss                # REWRITTEN for Nexus base
    _mixins.scss                # UPDATED for Nexus spacing
```

---

### Task 1: Install Dependencies & Update Webpack Config

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `webpack.config.js:23-47`

- [ ] **Step 1: Install Radix UI packages**

```bash
cd "/Users/atulnayyar/Projects/Incentive App"
npm install @radix-ui/react-tabs@^1.1.13 @radix-ui/react-progress@^1.1.8 @radix-ui/react-switch@^1.2.6 @radix-ui/react-toast@^1.2.15 @radix-ui/react-tooltip@^1.2.8 @radix-ui/react-toggle@^1.1.10 @radix-ui/react-toggle-group@^1.1.11
```

Expected: packages added to `dependencies` in package.json.

- [ ] **Step 2: Verify classnames is already installed**

```bash
cd "/Users/atulnayyar/Projects/Incentive App"
node -e "require('classnames'); console.log('classnames OK')"
```

Expected: `classnames OK`. Already in package.json at 2.2.6.

- [ ] **Step 3: Add CSS loader rule to webpack.config.js**

The Nexus `base.css` is plain CSS. The current webpack config only handles `.scss` and `.module.scss`. Add a rule for plain `.css` files.

In `webpack.config.js`, add this rule BEFORE the `.module.scss` rule (after the babel-loader rule at line 30):

```javascript
{
  test: /\.css$/,
  use: [
    isProd ? MiniCssExtractPlugin.loader : 'style-loader',
    'css-loader'
  ]
},
```

The full `rules` array becomes:

```javascript
rules: [
  {
    test: /\.jsx?$/,
    exclude: /node_modules/,
    use: 'babel-loader'
  },
  {
    test: /\.css$/,
    use: [
      isProd ? MiniCssExtractPlugin.loader : 'style-loader',
      'css-loader'
    ]
  },
  {
    test: /\.module\.scss$/,
    use: [
      isProd ? MiniCssExtractPlugin.loader : 'style-loader',
      { loader: 'css-loader', options: { modules: { localIdentName: '[name]__[local]___[hash:base64:5]' } } },
      { loader: 'sass-loader', options: { api: 'modern' } }
    ]
  },
  {
    test: /\.scss$/,
    exclude: /\.module\.scss$/,
    use: [
      isProd ? MiniCssExtractPlugin.loader : 'style-loader',
      'css-loader',
      { loader: 'sass-loader', options: { api: 'modern' } }
    ]
  },
  {
    test: /\.(png|jpg|jpeg|gif|svg|woff2?|ttf|otf)$/,
    type: 'asset/resource',
    generator: { filename: 'assets/[name].[hash:8][ext]' }
  }
]
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json webpack.config.js
git commit -m "chore: install Radix UI deps, add CSS loader rule for Nexus"
```

---

### Task 2: Copy Nexus Foundation (Tokens, Styles, Utils)

**Files:**
- Create: `src/nexus/styles/base.css` (copy from Nexus)
- Create: `src/nexus/styles/tokens.scss` (copy from Nexus)
- Create: `src/nexus/utils/setBrandColour.js` (copy from Nexus)

- [ ] **Step 1: Create nexus directory structure**

```bash
cd "/Users/atulnayyar/Projects/Incentive App"
mkdir -p src/nexus/styles src/nexus/utils src/nexus/atoms src/nexus/molecules
```

- [ ] **Step 2: Copy foundation files**

```bash
cd "/Users/atulnayyar/Projects/Incentive App"
cp "/Users/atulnayyar/Projects/nexus-design-system/src/styles/base.css" src/nexus/styles/base.css
cp "/Users/atulnayyar/Projects/nexus-design-system/src/styles/tokens.scss" src/nexus/styles/tokens.scss
cp "/Users/atulnayyar/Projects/nexus-design-system/src/utils/setBrandColour.js" src/nexus/utils/setBrandColour.js
```

- [ ] **Step 3: Verify files are in place**

```bash
ls -la src/nexus/styles/ src/nexus/utils/
```

Expected: `base.css`, `tokens.scss`, `setBrandColour.js` all present.

- [ ] **Step 4: Commit**

```bash
git add src/nexus/
git commit -m "feat: copy Nexus foundation — tokens, styles, brand colour utility"
```

---

### Task 3: Copy Nexus Atom Components

**Files:**
- Create: `src/nexus/atoms/` — 19 component directories + Overlay + index.js

The following atom components are needed. Each component directory contains a `.jsx` and `.module.scss` file (and sometimes sub-files).

**Components to copy from `/Users/atulnayyar/Projects/nexus-design-system/src/atoms/`:**
1. `Button/` (Button.jsx, Button.module.scss)
2. `Badge/` (Badge.jsx, Badge.module.scss)
3. `Tag/` (Tag.jsx, Tag.module.scss)
4. `Tabs/` (Tabs.jsx, Tabs.module.scss)
5. `Icon/` (Icon.jsx, Icon.module.scss)
6. `Input/` (Input.jsx, Input.module.scss)
7. `ProgressBar/` (ProgressBar.jsx, ProgressBar.module.scss)
8. `Switch/` (Switch.jsx, Switch.module.scss)
9. `Avatar/` (Avatar.jsx, Avatar.module.scss)
10. `Skeleton/` (Skeleton.jsx, Skeleton.module.scss)
11. `Spinner/` (Spinner.jsx, Spinner.module.scss)
12. `Divider/` (Divider.jsx, Divider.module.scss)
13. `Heading/` (Heading.jsx, Heading.module.scss)
14. `Text/` (Text.jsx, Text.module.scss)
15. `Toast/` (Toast.jsx, Toast.module.scss)
16. `Tooltip/` (Tooltip.jsx, Tooltip.module.scss)
17. `Toggle/` (Toggle.jsx, Toggle.module.scss)
18. `ToggleGroup/` (ToggleGroup.jsx, ToggleGroup.module.scss)
19. `Overlay/` (Overlay.jsx, Overlay.module.scss) — required by Modal and Drawer

- [ ] **Step 1: Copy all atom component directories**

```bash
cd "/Users/atulnayyar/Projects/Incentive App"
NEXUS="/Users/atulnayyar/Projects/nexus-design-system/src/atoms"
for dir in Button Badge Tag Tabs Icon Input ProgressBar Switch Avatar Skeleton Spinner Divider Heading Text Toast Tooltip Toggle ToggleGroup Overlay; do
  cp -r "$NEXUS/$dir" src/nexus/atoms/
done
```

- [ ] **Step 2: Create the atoms index.js (subset only)**

Create `src/nexus/atoms/index.js`:

```javascript
export { Button } from './Button/Button';
export { Badge } from './Badge/Badge';
export { Tag } from './Tag/Tag';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs/Tabs';
export { Icon } from './Icon/Icon';
export { Input } from './Input/Input';
export { ProgressBar } from './ProgressBar/ProgressBar';
export { Switch } from './Switch/Switch';
export { Avatar } from './Avatar/Avatar';
export { Skeleton } from './Skeleton/Skeleton';
export { Spinner } from './Spinner/Spinner';
export { Divider } from './Divider/Divider';
export { Heading } from './Heading/Heading';
export { Text } from './Text/Text';
export { ToastProvider, Toast, ToastTitle, ToastDescription, ToastAction, ToastClose, ToastViewport } from './Toast/Toast';
export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from './Tooltip/Tooltip';
export { Toggle } from './Toggle/Toggle';
export { ToggleGroup, ToggleGroupItem } from './ToggleGroup/ToggleGroup';
export { Overlay } from './Overlay/Overlay';
```

- [ ] **Step 3: Verify atom component file count**

```bash
find src/nexus/atoms -name "*.jsx" | wc -l
```

Expected: 19 `.jsx` files (one per component).

- [ ] **Step 4: Commit**

```bash
git add src/nexus/atoms/
git commit -m "feat: copy Nexus atom components (19 components)"
```

---

### Task 4: Copy Nexus Molecule Components

**Files:**
- Create: `src/nexus/molecules/` — 6 component directories + index.js

**Components to copy from `/Users/atulnayyar/Projects/nexus-design-system/src/molecules/`:**
1. `Card/` (Card.jsx, Card.module.scss)
2. `Modal/` (Modal.jsx, Modal.module.scss)
3. `Drawer/` (Drawer.jsx, Drawer.module.scss)
4. `EmptyState/` (EmptyState.jsx, EmptyState.module.scss)
5. `Table/` (Table.jsx, Table.module.scss)
6. `SearchInput/` (SearchInput.jsx, SearchInput.module.scss)

- [ ] **Step 1: Copy all molecule component directories**

```bash
cd "/Users/atulnayyar/Projects/Incentive App"
NEXUS="/Users/atulnayyar/Projects/nexus-design-system/src/molecules"
for dir in Card Modal Drawer EmptyState Table SearchInput; do
  cp -r "$NEXUS/$dir" src/nexus/molecules/
done
```

- [ ] **Step 2: Create the molecules index.js (subset only)**

Create `src/nexus/molecules/index.js`:

```javascript
export { Card } from './Card/Card';
export { Modal } from './Modal/Modal';
export { Drawer } from './Drawer/Drawer';
export { EmptyState } from './EmptyState/EmptyState';
export { Table } from './Table/Table';
export { SearchInput } from './SearchInput/SearchInput';
```

- [ ] **Step 3: Fix molecule import paths**

Nexus molecules import atoms via `../../atoms/`. After copying into `src/nexus/molecules/`, the relative path `../../atoms/` would resolve outside of `src/nexus/`. Fix these imports to use `../atoms/`.

Check which molecules have atom imports:

```bash
grep -r "from '../../atoms" src/nexus/molecules/ --include="*.jsx" -l
```

For each file found, replace `../../atoms/` with `../atoms/` in the import paths. Affected files:
- `Card/Card.jsx` — imports Heading, Text
- `Modal/Modal.jsx` — imports Overlay, Heading, Text
- `Drawer/Drawer.jsx` — imports Overlay, Heading, Text
- `EmptyState/EmptyState.jsx` — imports Icon, Heading, Text, Button
- `SearchInput/SearchInput.jsx` — imports Input, Icon, Spinner

In each file, change all occurrences of `from '../../atoms/` to `from '../atoms/`.

- [ ] **Step 4: Commit**

```bash
git add src/nexus/molecules/
git commit -m "feat: copy Nexus molecule components (6 components), fix import paths"
```

---

### Task 5: Build Verification Checkpoint

**Files:** None (verification only)

- [ ] **Step 1: Run the dev build to check for compilation errors**

```bash
cd "/Users/atulnayyar/Projects/Incentive App"
npx webpack --mode development --stats errors-only 2>&1 | head -50
```

If there are errors, they'll likely be:
- Missing CSS imports — check if any Nexus component imports a CSS file that wasn't copied
- Missing Radix packages — install any missing `@radix-ui/*` packages
- Import path issues — fix relative paths in molecule components

Fix any errors before proceeding.

- [ ] **Step 2: Verify a Nexus component can be imported**

Create a temporary test file `src/_nexus-test.js`:

```javascript
import { Button } from './nexus/atoms';
import { Card } from './nexus/molecules';
console.log('Nexus imports OK', Button, Card);
```

Run:
```bash
cd "/Users/atulnayyar/Projects/Incentive App"
npx webpack --mode development --stats errors-only 2>&1 | head -20
```

Then delete the test file:
```bash
rm src/_nexus-test.js
```

- [ ] **Step 3: Commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: resolve Nexus component build issues"
```

---

### Task 6: Create ThemeContext

**Files:**
- Create: `src/context/ThemeContext.jsx`

- [ ] **Step 1: Create ThemeContext.jsx**

```javascript
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'nexus-theme';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // localStorage not available
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/context/ThemeContext.jsx
git commit -m "feat: add ThemeContext with light/dark toggle and localStorage persistence"
```

---

### Task 7: Update Fonts, Entry Point & globals.scss

**Files:**
- Modify: `public/index.html`
- Modify: `src/index.js`
- Rewrite: `src/styles/globals.scss`

- [ ] **Step 1: Update Google Fonts in index.html**

Replace the current font link in `public/index.html`. Change:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..900,0..100;1,9..144,300..900,0..100&family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Geist+Mono:wght@400..700&display=swap"
  rel="stylesheet"
/>
```

To:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

Also update the `data-theme` attribute on the html tag:

```html
<html lang="en" data-theme="light">
```

- [ ] **Step 2: Update index.js to import Nexus base styles and init brand colour**

Replace the contents of `src/index.js`:

```javascript
import React from 'react';
import { createRoot } from 'react-dom/client';
import './nexus/styles/base.css';
import './nexus/styles/tokens.scss';
import './styles/globals.scss';
import { setBrandColour } from './nexus/utils/setBrandColour';
import App from './App';

// Generate Reliance brand scale from crimson seed
setBrandColour('#BD2925');

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

if (module.hot) {
  module.hot.accept();
}
```

Note: Nexus base.css and tokens.scss are imported BEFORE globals.scss so that globals can use the Nexus custom properties.

- [ ] **Step 3: Rewrite globals.scss**

Replace the entire contents of `src/styles/globals.scss`:

```scss
/* ─── Nexus-driven global styles ─────────────────────── */

/* Reset is handled by nexus/styles/base.css — only app-specific overrides here */

html,
body,
#root {
  height: 100%;
  margin: 0;
}

body {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: var(--sans);
  font-size: var(--font-size-400);
  line-height: var(--line-height-400);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-size-adjust: 100%;
}

/* Monospace utility — tabular numerals for amounts */
.mono {
  font-family: var(--mono);
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
  letter-spacing: var(--letter-spacing-tight);
}

/* Focus ring — Nexus brand-derived */
:focus-visible {
  outline: var(--border-width-200) solid var(--color-border-focus);
  outline-offset: var(--border-width-200);
  border-radius: var(--radius-100);
}

/* Staggered page-load cascade — keep animation, update timing */
@keyframes incentive-rise {
  0% { opacity: 0; transform: translateY(12px); }
  100% { opacity: 1; transform: translateY(0); }
}

.rise {
  animation: incentive-rise 520ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
}
.rise-1 { animation-delay: 60ms; }
.rise-2 { animation-delay: 140ms; }
.rise-3 { animation-delay: 230ms; }
.rise-4 { animation-delay: 320ms; }
.rise-5 { animation-delay: 410ms; }
.rise-6 { animation-delay: 500ms; }
.rise-7 { animation-delay: 590ms; }

@keyframes flame-pulse {
  0%, 100% { transform: scale(1) rotate(-2deg); filter: drop-shadow(0 0 6px color-mix(in srgb, var(--brand-50) 45%, transparent)); }
  50%      { transform: scale(1.08) rotate(2deg); filter: drop-shadow(0 0 14px color-mix(in srgb, var(--brand-50) 65%, transparent)); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}

button {
  font: inherit;
  cursor: pointer;
  background: none;
  border: 0;
  padding: 0;
  color: inherit;
}

::selection {
  background: var(--brand-a150);
  color: var(--color-text-primary);
}
```

- [ ] **Step 4: Delete old token and theme files**

```bash
cd "/Users/atulnayyar/Projects/Incentive App"
rm -f src/styles/_tokens-primitive.scss
rm -f src/styles/_tokens-semantic.scss
rm -f src/themes/reliance-retail.scss
```

- [ ] **Step 5: Verify dev server starts**

```bash
cd "/Users/atulnayyar/Projects/Incentive App"
npx webpack --mode development --stats errors-only 2>&1 | head -30
```

If there are SCSS errors from components still importing old tokens (e.g., `@use './tokens-semantic'`), that's expected — those components will be rewritten in later tasks. The key check is that the Nexus styles and new globals compile.

If globals.scss has `@use` errors because old imports were removed, ensure no `@use` statements remain.

- [ ] **Step 6: Commit**

```bash
git add public/index.html src/index.js src/styles/globals.scss
git add -u src/styles/_tokens-primitive.scss src/styles/_tokens-semantic.scss src/themes/reliance-retail.scss
git commit -m "feat: wire Nexus tokens, Inter font, brand colour init; drop old token system"
```

---

### Task 8: Update App.jsx with ThemeProvider

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Add ThemeProvider to App.jsx**

Replace `src/App.jsx`:

```javascript
import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PersonaProvider } from './context/PersonaContext';
import { PersonaPill, PersonaModal } from './components/Widgets/PersonaSwitcher/PersonaSwitcher';
import OfflineBanner from './components/Organism/OfflineBanner/OfflineBanner';
import RootRouter from './containers/RootRouter';
import Login from './containers/Login/Login';

const useMock = process.env.REACT_APP_USE_MOCK_DATA === 'true';
const enableSwitcher = process.env.REACT_APP_ENABLE_PERSONA_SWITCHER === 'true';

function AuthGate() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        fontFamily: 'var(--sans)',
        color: 'var(--color-text-secondary)',
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated && !useMock) {
    return <Login />;
  }

  return (
    <PersonaProvider>
      <OfflineBanner />
      <RootRouter />
      {enableSwitcher && <PersonaPill />}
      {enableSwitcher && <PersonaModal />}
    </PersonaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </ThemeProvider>
  );
}
```

Key changes:
- Import and wrap with `ThemeProvider` (outermost — theme must be available everywhere)
- Update loading state inline styles to use Nexus font vars (`var(--sans)`, `var(--color-text-secondary)`)

- [ ] **Step 2: Commit**

```bash
git add src/App.jsx
git commit -m "feat: wrap app in ThemeProvider, update loading state to Nexus tokens"
```

---

### Task 9: Rebuild HeaderBar

**Files:**
- Rewrite: `src/components/Organism/HeaderBar/HeaderBar.jsx`
- Rewrite: `src/components/Organism/HeaderBar/HeaderBar.module.scss`

- [ ] **Step 1: Rewrite HeaderBar.jsx using Nexus components**

```javascript
import React from 'react';
import { LogOut, Trophy, Sun, Moon } from 'lucide-react';
import cx from 'classnames';
import { Heading, Text, Button, Badge, Switch } from '@/nexus/atoms';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import BrandLogo from '../../Atom/BrandLogo/BrandLogo';
import styles from './HeaderBar.module.scss';

export default function HeaderBar({ employeeName, rank, onOpenLeaderboard }) {
  const { logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <BrandLogo variant="full" height={28} />
        <div className={styles.topRight}>
          <div className={styles.themeToggle}>
            <Sun size={14} />
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
              size="sm"
              aria-label="Toggle dark mode"
            />
            <Moon size={14} />
          </div>
          {typeof rank === 'number' && (
            <button
              type="button"
              className={styles.rankChip}
              onClick={onOpenLeaderboard}
              aria-label={`Rank ${rank} — tap to see leaderboard`}
            >
              <Trophy size={12} strokeWidth={2.6} aria-hidden="true" />
              <span className={styles.rankText}>#{rank}</span>
            </button>
          )}
        </div>
      </div>

      {employeeName && (
        <div className={styles.greetingRow}>
          <div className={styles.greeting}>
            <Text variant="body" className={styles.namaste}>Namaste,</Text>
            <Heading level={2} className={styles.name}>{employeeName}</Heading>
          </div>
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              iconLeft={<LogOut size={14} strokeWidth={2.2} />}
              onClick={logout}
              aria-label="Log out"
            />
          )}
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 2: Rewrite HeaderBar.module.scss**

```scss
.header {
  padding: var(--space-250) var(--space-250) var(--space-075);
  display: flex;
  flex-direction: column;
  gap: var(--space-200);
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-150);
}

.topRight {
  display: flex;
  align-items: center;
  gap: var(--space-100);
}

.themeToggle {
  display: flex;
  align-items: center;
  gap: var(--space-050);
  color: var(--color-text-tertiary);
}

.rankChip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-050);
  padding: var(--space-050) var(--space-100);
  background: var(--color-bg-tertiary);
  border: var(--border-width-100) solid var(--color-border-default);
  border-radius: var(--radius-full);
  color: var(--color-text-primary);
  font-family: var(--sans);
  font-size: var(--font-size-200);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: background 120ms ease;

  &:hover {
    background: var(--color-interactive-hover);
  }
}

.rankText {
  font-variant-numeric: tabular-nums;
}

.greetingRow {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-150);
}

.greeting {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: var(--space-100);
}

.namaste {
  font-size: var(--font-size-900);
  font-weight: var(--font-weight-regular);
  font-style: italic;
  color: var(--color-text-secondary);
  line-height: 1;
}

.name {
  font-size: var(--font-size-900);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  line-height: 1;
  letter-spacing: var(--letter-spacing-tighter);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Organism/HeaderBar/
git commit -m "feat: rebuild HeaderBar with Nexus components and theme toggle"
```

---

### Task 10: Rebuild BottomNav

**Files:**
- Rewrite: `src/components/Organism/BottomNav/BottomNav.jsx`
- Rewrite: `src/components/Organism/BottomNav/BottomNav.module.scss`

- [ ] **Step 1: Rewrite BottomNav.jsx**

Preserve all business logic (NAV_SETS, navSetFor, role-based routing). Replace custom buttons with Nexus-token-styled elements.

```javascript
import React from 'react';
import { Home, Users, BarChart3, Flag, Store, Receipt } from 'lucide-react';
import cx from 'classnames';
import styles from './BottomNav.module.scss';

const NAV_SETS = {
  EMPLOYEE: [
    { id: 'home',    label: 'Home',    Icon: Home },
    { id: 'history', label: 'History', Icon: BarChart3 },
  ],
  BA: [
    { id: 'home',    label: 'Home',    Icon: Home },
  ],
  SM: [
    { id: 'home',  label: 'Home',  Icon: Home },
    { id: 'team',  label: 'Team',  Icon: Users },
    { id: 'tx',    label: 'Transactions', Icon: Receipt },
  ],
  CENTRAL: [
    { id: 'home',   label: 'Overview', Icon: Home },
    { id: 'stores', label: 'Stores',   Icon: Store },
    { id: 'alerts', label: 'Alerts',   Icon: Flag },
  ],
};

export function navSetFor(role) {
  if (role === 'SM') return NAV_SETS.SM;
  if (role === 'BA') return NAV_SETS.BA;
  if (role === 'CENTRAL') return NAV_SETS.CENTRAL;
  return NAV_SETS.EMPLOYEE;
}

export default function BottomNav({ active = 'home', role = 'SA', onNavigate }) {
  const items = navSetFor(role);

  return (
    <nav className={styles.nav} aria-label="Primary">
      <div className={styles.items}>
        {items.map(({ id, label, Icon }) => {
          const isActive = id === active;
          return (
            <button
              key={id}
              type="button"
              className={cx(styles.item, isActive && styles.active)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
              onClick={() => onNavigate && onNavigate(id)}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} aria-hidden="true" />
              <span className={styles.label}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Rewrite BottomNav.module.scss**

```scss
.nav {
  position: fixed;
  bottom: var(--space-150);
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - var(--space-300));
  max-width: 440px;
  display: flex;
  align-items: center;
  gap: var(--space-050);
  background: var(--grey-90);
  border: var(--border-width-050) solid color-mix(in srgb, var(--color-white) 8%, transparent);
  border-radius: var(--radius-full);
  padding: var(--space-050);
  z-index: 10;
  box-shadow: var(--shadow-300);
  margin-bottom: env(safe-area-inset-bottom, 0px);

  [data-theme="dark"] & {
    background: var(--grey-10);
    border-color: color-mix(in srgb, var(--color-black) 8%, transparent);
  }
}

.items {
  display: flex;
  flex: 1 1 auto;
  gap: var(--space-025);

  > * {
    flex: 1 1 0;
    min-width: 0;
  }
}

.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-025);
  padding: var(--space-100) var(--space-050);
  color: color-mix(in srgb, var(--color-white) 72%, transparent);
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: var(--radius-full);
  transition:
    color 120ms ease-out,
    background 220ms ease-out,
    transform 120ms ease-out;
  min-height: var(--size-48);

  &:hover {
    color: color-mix(in srgb, var(--color-white) 95%, transparent);
    background: color-mix(in srgb, var(--color-white) 5%, transparent);
  }

  &:active {
    transform: scale(0.96);
  }

  [data-theme="dark"] & {
    color: color-mix(in srgb, var(--color-black) 72%, transparent);

    &:hover {
      color: color-mix(in srgb, var(--color-black) 95%, transparent);
      background: color-mix(in srgb, var(--color-black) 5%, transparent);
    }
  }
}

.active {
  color: var(--color-white);
  background: var(--color-action-primary);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--color-white) 20%, transparent),
    0 6px 14px color-mix(in srgb, var(--brand-50) 45%, transparent);

  &:hover {
    color: var(--color-white);
    background: var(--color-action-primary);
  }

  .label {
    color: var(--color-white);
    font-weight: var(--font-weight-semibold);
  }

  [data-theme="dark"] & {
    color: var(--color-text-on-action);
  }
}

.label {
  font-family: var(--sans);
  font-size: var(--font-size-100);
  font-weight: var(--font-weight-medium);
  letter-spacing: var(--letter-spacing-wide);
  line-height: 1;
  transition: color 120ms ease-out;
}

@media (max-width: 359px) {
  .item {
    padding: var(--space-100) var(--space-025);
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Organism/BottomNav/
git commit -m "feat: rebuild BottomNav with Nexus tokens and theme-aware styling"
```

---

### Task 11: Rebuild Domain Atoms

**Files:**
- Rewrite: `src/components/Atom/BrandLogo/BrandLogo.jsx` (minimal — keep as-is, it's just an SVG img)
- Rewrite: `src/components/Atom/RankBadge/RankBadge.jsx` + `.module.scss`
- Rewrite: `src/components/Atom/HeaderRankChip/HeaderRankChip.jsx` + `.module.scss`
- Rewrite: `src/components/Atom/StreakChip/StreakChip.jsx` + `.module.scss`

- [ ] **Step 1: Update BrandLogo — minimal changes**

BrandLogo is just an SVG image wrapper. Only update the SCSS to use Nexus tokens:

In `BrandLogo.module.scss`, ensure any hardcoded values use Nexus tokens. The component itself stays the same since it just renders an `<img>` tag.

- [ ] **Step 2: Rewrite RankBadge with Nexus Badge**

`src/components/Atom/RankBadge/RankBadge.jsx`:

```javascript
import React from 'react';
import { Badge } from '@/nexus/atoms';

export default function RankBadge({ rank }) {
  return (
    <Badge variant="default" size="lg">
      #{rank}
    </Badge>
  );
}
```

Delete `RankBadge.module.scss` — styling is now handled by Nexus Badge.

- [ ] **Step 3: Rewrite HeaderRankChip**

This was absorbed into HeaderBar in Task 9. The component may still be imported by other files, so keep it as a thin wrapper:

`src/components/Atom/HeaderRankChip/HeaderRankChip.jsx`:

```javascript
import React from 'react';
import { Trophy } from 'lucide-react';
import { Badge } from '@/nexus/atoms';
import styles from './HeaderRankChip.module.scss';

export default function HeaderRankChip({ rank, onOpen }) {
  if (typeof rank !== 'number') return null;
  return (
    <button
      type="button"
      className={styles.chip}
      onClick={onOpen}
      aria-label={`Rank ${rank} — tap to see leaderboard`}
    >
      <Trophy size={12} strokeWidth={2.6} aria-hidden="true" />
      <span className={styles.rankText}>#{rank}</span>
    </button>
  );
}
```

`src/components/Atom/HeaderRankChip/HeaderRankChip.module.scss`:

```scss
.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-050);
  padding: var(--space-050) var(--space-100);
  background: var(--color-bg-tertiary);
  border: var(--border-width-100) solid var(--color-border-default);
  border-radius: var(--radius-full);
  color: var(--color-text-primary);
  font-family: var(--sans);
  font-size: var(--font-size-200);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: background 120ms ease;

  &:hover {
    background: var(--color-interactive-hover);
  }
}

.rankText {
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 4: Rewrite StreakChip with Nexus Tag**

`src/components/Atom/StreakChip/StreakChip.jsx`:

```javascript
import React from 'react';
import { Flame } from 'lucide-react';
import { Tag } from '@/nexus/atoms';
import styles from './StreakChip.module.scss';

export default function StreakChip({ count }) {
  return (
    <Tag
      variant="warning"
      size="sm"
      icon={<Flame size={14} strokeWidth={2.4} fill="currentColor" className={styles.flame} />}
      aria-label={`${count} day streak`}
    >
      {count} day streak
    </Tag>
  );
}
```

`src/components/Atom/StreakChip/StreakChip.module.scss`:

```scss
.flame {
  animation: flame-pulse 2.4s ease-in-out infinite;
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/Atom/
git commit -m "feat: rebuild domain atoms (RankBadge, HeaderRankChip, StreakChip) with Nexus"
```

---

### Task 12: Rebuild HeroCard

**Files:**
- Rewrite: `src/components/Molecule/HeroCard/HeroCard.jsx`
- Rewrite: `src/components/Molecule/HeroCard/HeroCard.module.scss`

HeroCard is a compound component used across all verticals. Read the current implementation first to understand all sub-components.

- [ ] **Step 1: Read the current HeroCard implementation**

```bash
cat src/components/Molecule/HeroCard/HeroCard.jsx
```

Identify all compound sub-components (e.g., HeroCard.Amount, HeroCard.Caption, HeroCard.Progress, HeroCard.Eyebrow, HeroCard.Figure, HeroCard.Pill, etc.).

- [ ] **Step 2: Rewrite HeroCard using Nexus Card + ProgressBar + Text + Badge**

Compose from Nexus primitives while preserving the compound component API. The card should use Nexus Card as the outer shell, Nexus Heading/Text for typography, Nexus ProgressBar for progress tracks, and Nexus Badge/Tag for pills.

Rewrite `src/components/Molecule/HeroCard/HeroCard.jsx`:
- Import `Card` from `@/nexus/molecules`
- Import `Heading`, `Text`, `ProgressBar`, `Badge` from `@/nexus/atoms`
- Recreate each sub-component (Amount, Caption, Progress, Eyebrow, Figure, Pill) using Nexus primitives
- Attach sub-components as static properties on the main HeroCard component
- Preserve the same public API (props) so containers don't break

- [ ] **Step 3: Rewrite HeroCard.module.scss**

Replace all hardcoded colors and spacing with Nexus tokens:
- Use `var(--color-bg-elevated)` for card background
- Use `var(--brand-a50)` or `var(--brand-a100)` for brand tint backgrounds
- Use `var(--space-*)` for all spacing
- Use `var(--radius-*)` for border radii
- Use `var(--font-size-*)` and `var(--font-weight-*)` for typography
- Use `var(--color-text-*)` for text colors
- Use `var(--shadow-*)` for elevation

- [ ] **Step 4: Verify HeroCard renders in Electronics view**

Start dev server and navigate to SA/Electronics persona to verify the hero card renders correctly.

```bash
cd "/Users/atulnayyar/Projects/Incentive App" && npm start
```

- [ ] **Step 5: Commit**

```bash
git add src/components/Molecule/HeroCard/
git commit -m "feat: rebuild HeroCard compound component with Nexus primitives"
```

---

### Task 13: Rebuild Remaining Domain Molecules

**Files:**
- Rewrite: `src/components/Molecule/EarningsHero/` (if it extends HeroCard, update to use Nexus tokens)
- Rewrite: `src/components/Molecule/OpportunityCard/`
- Rewrite: `src/components/Molecule/LeaderboardTile/`
- Rewrite: `src/components/Molecule/StoreBoostCard/`
- Rewrite: `src/components/Molecule/MomentumPills/`
- Rewrite: `src/components/Molecule/StreakNote/`
- Rewrite: `src/components/Molecule/DeptMultiplierCompact/`
- Rewrite: `src/components/Molecule/RankSummary/`
- Rewrite: `src/components/Molecule/ComplianceLink/`

For each molecule component:

- [ ] **Step 1: Read each current molecule implementation**

Read the `.jsx` and `.module.scss` for each molecule to understand its structure, props, and rendering logic.

- [ ] **Step 2: Rewrite each molecule using Nexus primitives**

Apply this pattern to each component:

| Component | Nexus Composition |
|---|---|
| **EarningsHero** | Extends HeroCard (already Nexus-based from Task 12) — update to use Nexus tokens in its own SCSS |
| **OpportunityCard** | `Card` + `Text` + `Badge` — small horizontal card with amount display |
| **LeaderboardTile** | `Avatar` + `Text` + `Badge` — row layout for leaderboard entries |
| **StoreBoostCard** | `Card` + `ProgressBar` + `Text` + `Badge` — store achievement display |
| **MomentumPills** | `Badge` (success/error variants) + `Text` — period-over-period comparison |
| **StreakNote** | `Text` + `Tag` — inline notification about streak status |
| **DeptMultiplierCompact** | `Badge` + `Text` — department multiplier display |
| **RankSummary** | `Card` + `Heading` + `Text` + `Badge` — rank information summary |
| **ComplianceLink** | `Button` (ghost variant) + `Text` — compliance information link |

For each component:
- Replace all `var(--brand)`, `var(--surface-card)`, `var(--text-primary)` etc. with Nexus equivalents: `var(--color-action-primary)`, `var(--color-bg-elevated)`, `var(--color-text-primary)`
- Replace all hardcoded spacing (px values) with `var(--space-*)` tokens
- Replace font-family references with `var(--sans)` or `var(--mono)`
- Replace border-radius with `var(--radius-*)`
- Import Nexus components instead of using plain HTML elements where appropriate

- [ ] **Step 3: Commit after each group of 2-3 components**

```bash
git add src/components/Molecule/OpportunityCard/ src/components/Molecule/LeaderboardTile/ src/components/Molecule/MomentumPills/
git commit -m "feat: rebuild OpportunityCard, LeaderboardTile, MomentumPills with Nexus"
```

```bash
git add src/components/Molecule/StoreBoostCard/ src/components/Molecule/StreakNote/ src/components/Molecule/DeptMultiplierCompact/
git commit -m "feat: rebuild StoreBoostCard, StreakNote, DeptMultiplierCompact with Nexus"
```

```bash
git add src/components/Molecule/EarningsHero/ src/components/Molecule/RankSummary/ src/components/Molecule/ComplianceLink/
git commit -m "feat: rebuild EarningsHero, RankSummary, ComplianceLink with Nexus"
```

---

### Task 14: Rebuild Organisms (Drawers & Strips)

**Files:**
- Rewrite: `src/components/Organism/OpportunityStrip/`
- Rewrite: `src/components/Organism/LeaderboardDrawer/`
- Rewrite: `src/components/Organism/EmployeeDetailDrawer/`
- Rewrite: `src/components/Organism/StoreDetailDrawer/`
- Rewrite: `src/components/Organism/TransactionDetailSheet/`

- [ ] **Step 1: Read each current organism implementation**

Read the `.jsx` and `.module.scss` for each organism.

- [ ] **Step 2: Rewrite OpportunityStrip**

OpportunityStrip is a horizontal scroll container for OpportunityCards. Update its SCSS to use Nexus tokens. The component structure stays similar — it's a layout wrapper around the already-rebuilt OpportunityCard molecules.

- [ ] **Step 3: Rebuild all drawer organisms using Nexus Drawer**

For each drawer (LeaderboardDrawer, EmployeeDetailDrawer, StoreDetailDrawer, TransactionDetailSheet):

Replace the custom bottom-sheet implementation with Nexus `Drawer`:

```javascript
import { Drawer } from '@/nexus/molecules';
```

Pattern for each drawer:

```javascript
export default function LeaderboardDrawer({ open, onClose, /* domain props */ }) {
  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      placement="bottom"
      size="md"
      title="Leaderboard"
      subtitle="Store ranking"
    >
      {/* Domain content using Nexus Card, Text, Badge, Avatar, Table */}
    </Drawer>
  );
}
```

Key changes for each drawer:
- Remove custom overlay, slide-in animation, handle bar, close button — all provided by Nexus Drawer
- Remove custom focus trap and escape-key handling — Nexus Drawer handles this
- Keep all domain logic (data fetching, filtering, sorting)
- Replace inner content HTML with Nexus components (Card, Text, Badge, Avatar, Table)
- Update SCSS to use Nexus tokens

- [ ] **Step 4: Commit after drawers**

```bash
git add src/components/Organism/OpportunityStrip/ src/components/Organism/LeaderboardDrawer/ src/components/Organism/EmployeeDetailDrawer/ src/components/Organism/StoreDetailDrawer/ src/components/Organism/TransactionDetailSheet/
git commit -m "feat: rebuild organisms with Nexus Drawer and tokens"
```

---

### Task 15: Rebuild Widgets

**Files:**
- Rewrite: `src/components/Widgets/PersonaSwitcher/PersonaSwitcher.jsx` + `.module.scss`
- Rewrite: `src/components/Widgets/QuestCard/QuestCard.jsx` + `.module.scss`
- Rewrite: `src/components/Widgets/BadgesStrip/BadgesStrip.jsx` + `.module.scss`
- Rewrite: `src/components/Widgets/LevelCard/LevelCard.jsx` + `.module.scss`

- [ ] **Step 1: Rebuild PersonaSwitcher with Nexus Modal**

Read current `PersonaSwitcher.jsx`. It exports two components: `PersonaPill` and `PersonaModal`.

Replace PersonaModal's custom modal implementation with Nexus `Modal`:

```javascript
import { Modal } from '@/nexus/molecules';
import { Button, Badge, Avatar, Text } from '@/nexus/atoms';
```

PersonaPill stays as a small floating button — update its SCSS to use Nexus tokens.

PersonaModal becomes:

```javascript
export function PersonaModal() {
  const { personas, active, switchTo, isSwitcherOpen, closeSwitcher } = usePersona();

  return (
    <Modal
      open={isSwitcherOpen}
      onOpenChange={(isOpen) => !isOpen && closeSwitcher()}
      title="Switch Persona"
      size="sm"
    >
      {/* Persona list using Nexus Button, Badge, Avatar, Text */}
      {/* Preserve grouping by role and current selection logic */}
    </Modal>
  );
}
```

- [ ] **Step 2: Rebuild QuestCard**

```javascript
import { Card } from '@/nexus/molecules';
import { ProgressBar, Badge, Text, Heading } from '@/nexus/atoms';
```

Use `Card` as the container, `ProgressBar` for quest progress, `Badge` for status (complete/in-progress), `Text`/`Heading` for labels.

- [ ] **Step 3: Rebuild BadgesStrip**

Horizontal scroll of Nexus `Badge` components with icons. Update SCSS to use Nexus tokens for scroll container.

- [ ] **Step 4: Rebuild LevelCard**

```javascript
import { Card } from '@/nexus/molecules';
import { ProgressBar, Heading, Text } from '@/nexus/atoms';
```

Use `Card` as the outer shell, `ProgressBar` for level progress, `Heading` for level name.

- [ ] **Step 5: Commit**

```bash
git add src/components/Widgets/
git commit -m "feat: rebuild Widgets (PersonaSwitcher, QuestCard, BadgesStrip, LevelCard) with Nexus"
```

---

### Task 16: Rebuild Remaining Organisms

**Files:**
- Rewrite: `src/components/Organism/OfflineBanner/OfflineBanner.jsx` + `.module.scss`
- Rewrite: `src/components/Organism/TierCelebration/TierCelebration.jsx` + `.module.scss`

- [ ] **Step 1: Rebuild OfflineBanner**

Replace with a Nexus-styled inline banner:

```javascript
import React from 'react';
import { WifiOff } from 'lucide-react';
import { Text, Badge } from '@/nexus/atoms';
import styles from './OfflineBanner.module.scss';
// Keep existing useOnlineStatus hook or navigator.onLine logic
```

Update SCSS to use `var(--color-bg-warning)`, `var(--color-text-warning)` tokens.

- [ ] **Step 2: Rebuild TierCelebration**

Use Nexus `Modal` as the celebration container. Keep `lottie-react` animation inside:

```javascript
import { Modal } from '@/nexus/molecules';
import { Heading, Text, Button } from '@/nexus/atoms';
import Lottie from 'lottie-react';
```

The modal provides the overlay and centering. The lottie animation and celebration content go inside.

- [ ] **Step 3: Commit**

```bash
git add src/components/Organism/OfflineBanner/ src/components/Organism/TierCelebration/
git commit -m "feat: rebuild OfflineBanner and TierCelebration with Nexus"
```

---

### Task 17: Update Containers

**Files:**
- Modify: `src/containers/EmployeeHome/EmployeeHome.jsx`
- Modify: `src/containers/EmployeeHome/EmployeeHome.module.scss`
- Modify: `src/containers/EmployeeHome/views/ElectronicsView.jsx` (and its `.module.scss`)
- Modify: `src/containers/EmployeeHome/views/GroceryView.jsx` (and its `.module.scss`)
- Modify: `src/containers/EmployeeHome/views/FnlView.jsx` (and its `.module.scss`)
- Modify: `src/containers/StoreManagerHome/StoreManagerHome.jsx` + `.module.scss`
- Modify: `src/containers/BrandAssociateHome/BrandAssociateHome.jsx` + `.module.scss`
- Modify: `src/containers/CentralHome/CentralHome.jsx` + `.module.scss`
- Modify: `src/containers/screens/HistoryScreen.jsx` + `.module.scss` (if exists)
- Modify: `src/containers/Login/Login.jsx` + `.module.scss`

- [ ] **Step 1: Update container SCSS files**

For each container's `.module.scss`:
- Replace `var(--surface)` with `var(--color-bg-primary)`
- Replace `var(--text-primary)` with `var(--color-text-primary)`
- Replace `var(--text-secondary)` with `var(--color-text-secondary)`
- Replace `var(--brand)` with `var(--color-action-primary)` or `var(--brand-50)`
- Replace `var(--brand-soft)` with `var(--brand-a100)`
- Replace `var(--brand-deep)` with `var(--brand-70)`
- Replace `var(--surface-card)` with `var(--color-bg-elevated)`
- Replace `var(--surface-sunken)` with `var(--color-bg-sunken)`
- Replace `var(--text-muted)` with `var(--color-text-tertiary)`
- Replace `var(--border)` with `var(--color-border-default)`
- Replace `var(--divider)` with `var(--color-border-subtle)`
- Replace `var(--radius-card)` with `var(--radius-200)`
- Replace `var(--radius-button)` with `var(--radius-150)`
- Replace `var(--shadow-card)` with `var(--elevation-surface-raised-low)`
- Replace `var(--dur-fast)` with `120ms`
- Replace `var(--dur-med)` with `220ms`
- Replace `var(--ease-out)` with `ease-out`
- Replace `font-family: 'Instrument Sans'` with `font-family: var(--sans)`
- Replace `font-family: 'Fraunces'` with `font-family: var(--sans)` (display now uses Inter at larger sizes)
- Replace `font-family: 'Geist Mono'` with `font-family: var(--mono)`
- Replace hardcoded spacing values with closest `var(--space-*)` token

- [ ] **Step 2: Update container JSX imports**

The component imports in containers should already work since we kept the same file paths and component names. Verify each container renders by checking imports aren't broken.

- [ ] **Step 3: Update tab switching in containers to use Nexus Tabs (optional)**

The current containers use `useState` for tab switching. If appropriate, replace with Nexus `Tabs` component:

```javascript
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/nexus/atoms';
```

This is optional — the current useState approach still works. Use Nexus Tabs where it improves the visual consistency.

- [ ] **Step 4: Update Login container**

Replace any custom form styling with Nexus `Input` and `Button` components. Update SCSS tokens.

- [ ] **Step 5: Commit containers in groups**

```bash
git add src/containers/EmployeeHome/
git commit -m "feat: update EmployeeHome and views to Nexus tokens"
```

```bash
git add src/containers/StoreManagerHome/ src/containers/BrandAssociateHome/ src/containers/CentralHome/
git commit -m "feat: update StoreManagerHome, BrandAssociateHome, CentralHome to Nexus tokens"
```

```bash
git add src/containers/Login/ src/containers/screens/
git commit -m "feat: update Login and screens to Nexus tokens"
```

---

### Task 18: Full Persona Verification & Cleanup

**Files:**
- Delete: `src/styles/_tokens-primitive.scss` (if not already deleted in Task 7)
- Delete: `src/styles/_tokens-semantic.scss` (if not already deleted in Task 7)
- Delete: `src/themes/reliance-retail.scss` (if not already deleted in Task 7)
- Modify: `src/styles/_mixins.scss` — update to use Nexus tokens

- [ ] **Step 1: Update _mixins.scss**

```scss
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin stack($gap: var(--space-200)) {
  display: flex;
  flex-direction: column;
  gap: $gap;
}

@mixin row($gap: var(--space-150)) {
  display: flex;
  align-items: center;
  gap: $gap;
}

@mixin tap-target {
  min-width: var(--size-44);
  min-height: var(--size-44);
}

@mixin truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@mixin tabular-nums {
  font-family: var(--mono);
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
}

@mixin respect-reduced-motion {
  @media (prefers-reduced-motion: reduce) {
    @content;
  }
}
```

- [ ] **Step 2: Search for any remaining old token references**

```bash
cd "/Users/atulnayyar/Projects/Incentive App"
grep -r "var(--brand)" src/components/ src/containers/ --include="*.scss" --include="*.jsx" -l
grep -r "var(--surface" src/components/ src/containers/ --include="*.scss" -l
grep -r "var(--text-primary)" src/components/ src/containers/ --include="*.scss" -l
grep -r "'Fraunces'" src/ --include="*.scss" --include="*.jsx" -l
grep -r "'Instrument Sans'" src/ --include="*.scss" --include="*.jsx" -l
grep -r "'Geist Mono'" src/ --include="*.scss" --include="*.jsx" -l
```

Fix any remaining old token references found.

- [ ] **Step 3: Verify each persona renders**

Start the dev server and verify each persona:

```bash
cd "/Users/atulnayyar/Projects/Incentive App" && npm start
```

Check in browser at `localhost:3001`:
1. **SA (Electronics)** — Hero card, opportunity strip, streak, leaderboard
2. **SA (Grocery)** — Store achievement, equal split display
3. **SA (F&L)** — Weekly view, attendance gate
4. **SM/DM** — Roster view, store metrics, per-employee breakdown
5. **BA** — Read-only view, ineligible notice
6. **CENTRAL** — Org-wide drill-down
7. **Theme toggle** — Switch between light and dark, verify all components respond
8. **Persona switcher** — Open modal, switch between personas
9. **Drawers** — Open leaderboard, employee detail, transaction detail

- [ ] **Step 4: Run lint and fix any issues**

```bash
cd "/Users/atulnayyar/Projects/Incentive App"
npm run lint 2>&1 | head -50
```

Fix any lint errors.

- [ ] **Step 5: Run build to verify production build works**

```bash
cd "/Users/atulnayyar/Projects/Incentive App"
npm run build:dev 2>&1 | tail -20
```

Expected: Build succeeds with no errors.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: update mixins, clean up remaining old token references, verify build"
```

---

## Token Mapping Reference

This table maps the old Incentive App tokens to Nexus equivalents. Use this when rewriting SCSS files.

| Old Token | Nexus Equivalent |
|---|---|
| `var(--brand)` | `var(--color-action-primary)` or `var(--brand-50)` |
| `var(--brand-deep)` | `var(--brand-70)` |
| `var(--brand-soft)` | `var(--brand-a100)` |
| `var(--secondary)` | `var(--blue-50)` |
| `var(--accent)` | `var(--yellow-50)` |
| `var(--surface)` | `var(--color-bg-primary)` |
| `var(--surface-card)` or `var(--surface-raised)` | `var(--color-bg-elevated)` |
| `var(--surface-sunken)` | `var(--color-bg-sunken)` |
| `var(--text-primary)` | `var(--color-text-primary)` |
| `var(--text-secondary)` | `var(--color-text-secondary)` |
| `var(--text-muted)` | `var(--color-text-tertiary)` |
| `var(--text-on-brand)` | `var(--color-text-on-action)` |
| `var(--border)` | `var(--color-border-default)` |
| `var(--divider)` | `var(--color-border-subtle)` |
| `var(--success)` | `var(--color-text-success)` |
| `var(--success-bg)` | `var(--color-bg-success)` |
| `var(--error)` | `var(--color-text-error)` |
| `var(--error-bg)` | `var(--color-bg-error)` |
| `var(--warn)` | `var(--color-text-warning)` |
| `var(--warn-bg)` | `var(--color-bg-warning)` |
| `var(--radius-card)` | `var(--radius-200)` (12px) |
| `var(--radius-button)` | `var(--radius-150)` (8px) |
| `var(--radius-pill)` | `var(--radius-full)` |
| `var(--shadow-card)` | `var(--elevation-surface-raised-low)` |
| `var(--shadow-raised)` | `var(--elevation-surface-raised-mid)` |
| `var(--shadow-hero)` | `var(--elevation-surface-raised-high)` |
| `var(--dur-fast)` | `120ms` (or keep as custom property if needed) |
| `var(--dur-med)` | `220ms` |
| `var(--dur-slow)` | `320ms` |
| `var(--z-nav)` | `10` |
| `var(--z-overlay)` | `40` (or use Nexus overlay z-index) |
| `font-family: 'Instrument Sans'` | `font-family: var(--sans)` |
| `font-family: 'Fraunces'` | `font-family: var(--sans)` (at display sizes) |
| `font-family: 'Geist Mono'` | `font-family: var(--mono)` |
