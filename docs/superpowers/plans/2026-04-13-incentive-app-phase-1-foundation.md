# Reliance Incentive App — Phase 1: Foundation & Gamification Engine

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** From an empty directory, stand up a buildable React 18 + Webpack 5 project, author the white-label design-token layer, and implement the four pure gamification functions via strict TDD. Ships `npm test` green with full unit coverage on the engine.

**Architecture:** Node 18 + Webpack 5 + React 18 + SCSS Modules + Styled-Components + Jest. No UI yet — this phase produces the buildable shell and the domain-logic core that Phase 2+ will layer the app on top of. Mirrors ess-pwa patterns (no Bootstrap, no utility framework).

**Tech Stack:** React 18.2, Webpack 5, Babel 7, Sass, Styled-Components 6, Jest 29, dayjs, ESLint, Prettier, Node 18.

**Spec reference:** `docs/superpowers/specs/2026-04-13-incentive-app-design.md` — sections 3.1 (module layout), 7 (gamification engine), 8 (theming), Appendix A (dependencies), Appendix B (bootstrap checklist).

---

## File Structure Produced by This Phase

```
Incentive App/
├── .eslintrc.js
├── .gitignore
├── .prettierrc
├── .env.dev
├── .env.qa
├── .env.uat
├── .env.prod
├── babel.config.js
├── jest.config.js
├── package.json
├── webpack.config.js
├── public/
│   └── index.html
└── src/
    ├── index.js                         (placeholder entry)
    ├── services/
    │   └── GamificationEngine/
    │       ├── index.js                 (re-exports)
    │       ├── computeStreak.js
    │       ├── computeStreak.test.js
    │       ├── computeGoalProgress.js
    │       ├── computeGoalProgress.test.js
    │       ├── detectNewMilestones.js
    │       ├── detectNewMilestones.test.js
    │       ├── buildLeaderboardView.js
    │       └── buildLeaderboardView.test.js
    ├── styles/
    │   ├── _tokens-primitive.scss
    │   ├── _tokens-semantic.scss
    │   ├── _mixins.scss
    │   └── globals.scss
    └── themes/
        └── reliance-retail.scss
```

Every other `src/` subdirectory (`containers/`, `components/`, `hooks/`, etc.) is created empty with a `.gitkeep` so the skeleton matches spec §3.1.

---

## Task 1: Initialize git + .gitignore

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Init git repo**

Run from the project root (`/Users/atulnayyar/Projects/Incentive App`):
```bash
git init
```
Expected: `Initialized empty Git repository in ...`

- [ ] **Step 2: Create `.gitignore`**

```
node_modules/
build/
dist/
coverage/

# PWA / Superpowers
.superpowers/

# Env
.env
.env.local
.env.*.local

# OS / IDE
.DS_Store
.idea/
.vscode/
*.log
npm-debug.log*
```

- [ ] **Step 3: Commit scaffolding seed**

```bash
git add .gitignore docs/
git commit -m "chore: init repo + ignore rules + carry brainstorm docs"
```
Expected: single commit, clean working tree.

---

## Task 2: Create `package.json`

**Files:**
- Create: `package.json`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "incentive-app",
  "version": "0.1.0",
  "private": true,
  "engines": {
    "node": "18.x"
  },
  "scripts": {
    "start": "webpack serve --mode development --config webpack.config.js",
    "build": "webpack --mode production --config webpack.config.js",
    "build:dev": "env-cmd -f .env.dev webpack --mode production --config webpack.config.js",
    "build:qa": "env-cmd -f .env.qa webpack --mode production --config webpack.config.js",
    "build:uat": "env-cmd -f .env.uat webpack --mode production --config webpack.config.js",
    "build:prod": "env-cmd -f .env.prod webpack --mode production --config webpack.config.js",
    "lint": "eslint 'src/**/*.{js,jsx}'",
    "format": "prettier --write 'src/**/*.{js,jsx,scss,json}'",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router": "5.1.2",
    "react-router-dom": "5.1.2",
    "redux": "4.0.4",
    "react-redux": "^8.1.3",
    "redux-thunk": "2.3.0",
    "axios": "^1.6.2",
    "styled-components": "^6.1.8",
    "classnames": "2.2.6",
    "i18next": "17.2.0",
    "react-i18next": "10.13.1",
    "i18next-browser-languagedetector": "3.1.1",
    "dayjs": "^1.11.10",
    "lucide-react": "^0.400.0",
    "uuid": "8.3.2",
    "universal-cookie": "^6.1.1",
    "react-secure-storage": "^1.3.2",
    "lottie-react": "^2.4.0",
    "pulltorefreshjs": "^0.1.22",
    "@sentry/react": "^7.120.2",
    "@sentry/tracing": "^7.114.0",
    "workbox-core": "5.1.4",
    "workbox-expiration": "5.1.4",
    "workbox-precaching": "5.1.4",
    "workbox-routing": "5.1.4",
    "workbox-strategies": "5.1.4",
    "workbox-webpack-plugin": "6.4.2"
  },
  "devDependencies": {
    "@babel/core": "^7.23.0",
    "@babel/preset-env": "^7.23.0",
    "@babel/preset-react": "^7.22.0",
    "babel-jest": "^29.7.0",
    "babel-loader": "^9.1.0",
    "css-loader": "^6.8.0",
    "css-minimizer-webpack-plugin": "^5.0.0",
    "mini-css-extract-plugin": "^2.7.0",
    "sass": "^1.49.7",
    "sass-loader": "^13.3.0",
    "style-loader": "^3.3.0",
    "html-webpack-plugin": "^5.5.0",
    "dotenv-webpack": "^8.0.1",
    "env-cmd": "^10.1.0",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^4.15.0",
    "eslint": "^8.50.0",
    "eslint-plugin-react": "^7.33.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-jsx-a11y": "^6.7.0",
    "eslint-config-prettier": "^9.0.0",
    "prettier": "^3.0.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "identity-obj-proxy": "^3.0.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
npm install --legacy-peer-deps
```
Expected: `added N packages`, no peer-dependency errors (the `--legacy-peer-deps` flag matches ess-pwa). If `npm` reports `Node version mismatch`, run `nvm use 18` first.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: package.json + install deps (node 18, legacy peer deps)"
```

---

## Task 3: Environment files

**Files:**
- Create: `.env.dev`, `.env.qa`, `.env.uat`, `.env.prod`

- [ ] **Step 1: Create `.env.dev`**

```
REACT_APP_ENV=dev
REACT_APP_USE_MOCK_DATA=true
REACT_APP_API_BASE_URL=https://dev-admin-portal.reliance.retail
REACT_APP_PARENT_APP_URL=https://dev-parent.reliance.retail
REACT_APP_SENTRY_DSN=
REACT_APP_JWT_AUDIENCE=incentive-app
```

- [ ] **Step 2: Create `.env.qa`**

```
REACT_APP_ENV=qa
REACT_APP_USE_MOCK_DATA=true
REACT_APP_API_BASE_URL=https://qa-admin-portal.reliance.retail
REACT_APP_PARENT_APP_URL=https://qa-parent.reliance.retail
REACT_APP_SENTRY_DSN=
REACT_APP_JWT_AUDIENCE=incentive-app
```

- [ ] **Step 3: Create `.env.uat`**

```
REACT_APP_ENV=uat
REACT_APP_USE_MOCK_DATA=false
REACT_APP_API_BASE_URL=https://uat-admin-portal.reliance.retail
REACT_APP_PARENT_APP_URL=https://uat-parent.reliance.retail
REACT_APP_SENTRY_DSN=
REACT_APP_JWT_AUDIENCE=incentive-app
```

- [ ] **Step 4: Create `.env.prod`**

```
REACT_APP_ENV=prod
REACT_APP_USE_MOCK_DATA=false
REACT_APP_API_BASE_URL=https://admin-portal.reliance.retail
REACT_APP_PARENT_APP_URL=https://parent.reliance.retail
REACT_APP_SENTRY_DSN=
REACT_APP_JWT_AUDIENCE=incentive-app
```

- [ ] **Step 5: Commit**

```bash
git add .env.dev .env.qa .env.uat .env.prod
git commit -m "chore: per-environment dotenv files"
```

Note: `.env.dev` is committed intentionally — no secrets inside, only public endpoints. Real secrets (Sentry DSN when we have one) go in CI env vars.

---

## Task 4: Babel config

**Files:**
- Create: `babel.config.js`

- [ ] **Step 1: Write `babel.config.js`**

```js
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { browsers: ['>0.2%', 'not dead', 'not op_mini all'] } }],
    ['@babel/preset-react', { runtime: 'automatic' }]
  ]
};
```

- [ ] **Step 2: Commit**

```bash
git add babel.config.js
git commit -m "chore: babel config (preset-env + preset-react automatic)"
```

---

## Task 5: Webpack config

**Files:**
- Create: `webpack.config.js`

- [ ] **Step 1: Write `webpack.config.js`**

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: isProd ? 'assets/[name].[contenthash:8].js' : 'assets/[name].js',
      publicPath: '/',
      clean: true
    },
    resolve: {
      extensions: ['.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: 'babel-loader'
        },
        {
          test: /\.module\.scss$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            { loader: 'css-loader', options: { modules: { localIdentName: '[name]__[local]___[hash:base64:5]' } } },
            'sass-loader'
          ]
        },
        {
          test: /\.scss$/,
          exclude: /\.module\.scss$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'sass-loader'
          ]
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|woff2?|ttf|otf)$/,
          type: 'asset/resource',
          generator: { filename: 'assets/[name].[hash:8][ext]' }
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({ template: 'public/index.html' }),
      new MiniCssExtractPlugin({ filename: 'assets/[name].[contenthash:8].css' }),
      new Dotenv({ path: `.env.${process.env.APP_ENV || 'dev'}`, systemvars: true, safe: false })
    ],
    devServer: {
      port: 3000,
      historyApiFallback: true,
      hot: true,
      open: false
    },
    devtool: isProd ? 'source-map' : 'eval-cheap-module-source-map'
  };
};
```

- [ ] **Step 2: Commit**

```bash
git add webpack.config.js
git commit -m "chore: webpack 5 config (react, scss modules, scss global, dotenv)"
```

---

## Task 6: ESLint + Prettier config

**Files:**
- Create: `.eslintrc.js`, `.prettierrc`

- [ ] **Step 1: Write `.eslintrc.js`**

```js
module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  env: { browser: true, node: true, es2022: true, jest: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier'
  ],
  settings: { react: { version: 'detect' } },
  rules: {
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
  }
};
```

- [ ] **Step 2: Write `.prettierrc`**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2
}
```

- [ ] **Step 3: Commit**

```bash
git add .eslintrc.js .prettierrc
git commit -m "chore: eslint + prettier config"
```

---

## Task 7: Public HTML shell

**Files:**
- Create: `public/index.html`

- [ ] **Step 1: Write `public/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#0066B3" />
    <title>Reliance Incentives</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add public/index.html
git commit -m "chore: index.html shell with viewport + theme color"
```

---

## Task 8: Skeleton directories

**Files:**
- Create (empty, with `.gitkeep`): `src/containers/`, `src/components/Atom/`, `src/components/Molecule/`, `src/components/Organism/`, `src/components/Widgets/`, `src/hooks/`, `src/context/`, `src/locales/en/`, `src/locales/hi/`, `src/utils/`, `src/assets/brand/reliance-retail/`

- [ ] **Step 1: Create directories with `.gitkeep`**

```bash
mkdir -p src/containers src/components/Atom src/components/Molecule \
  src/components/Organism src/components/Widgets src/hooks src/context \
  src/locales/en src/locales/hi src/utils src/assets/brand/reliance-retail
touch src/containers/.gitkeep src/components/Atom/.gitkeep \
  src/components/Molecule/.gitkeep src/components/Organism/.gitkeep \
  src/components/Widgets/.gitkeep src/hooks/.gitkeep src/context/.gitkeep \
  src/locales/en/.gitkeep src/locales/hi/.gitkeep src/utils/.gitkeep \
  src/assets/brand/reliance-retail/.gitkeep
```

- [ ] **Step 2: Commit**

```bash
git add src/
git commit -m "chore: src/ skeleton directories (atomic design layout)"
```

---

## Task 9: Primitive tokens

**Files:**
- Create: `src/styles/_tokens-primitive.scss`

- [ ] **Step 1: Write `_tokens-primitive.scss`**

```scss
// Raw palette. NEVER referenced by components directly — always via semantic tokens.

// Brand: Reliance Retail blue ramp
$blue-50:  #E6F1FA;
$blue-100: #B3D5F0;
$blue-200: #80BAE6;
$blue-300: #4D9EDC;
$blue-400: #1A83D2;
$blue-500: #0074C7;
$blue-600: #0066B3;  // brand primary
$blue-700: #005699;
$blue-800: #004A82;
$blue-900: #00355E;

// Accent: saffron (celebrations, streak flame)
$saffron-300: #FFB566;
$saffron-400: #FF9933;
$saffron-500: #FF7A00;

// Neutrals (ink)
$ink-0:    #FFFFFF;
$ink-50:   #FAFAFA;
$ink-100:  #F2F2F2;
$ink-200:  #E5E5E5;
$ink-300:  #CCCCCC;
$ink-400:  #999999;
$ink-500:  #808080;
$ink-600:  #666666;
$ink-700:  #4D4D4D;
$ink-800:  #333333;
$ink-900:  #1A1A1A;

// Status ramps
$success-500: #0A8F00;
$success-100: #D4F1D0;
$warn-500:    #D97700;
$warn-100:    #FFEACC;
$error-500:   #CC1F1F;
$error-100:   #FBDADA;

// Scale (spacing & radius, purely numeric)
$space-1: 4px;
$space-2: 8px;
$space-3: 12px;
$space-4: 16px;
$space-5: 24px;
$space-6: 32px;
$space-7: 48px;
$space-8: 64px;

$radius-sm: 8px;
$radius-md: 12px;
$radius-lg: 16px;
$radius-xl: 20px;
$radius-pill: 999px;
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/_tokens-primitive.scss
git commit -m "style: primitive design tokens (reliance palette, neutrals, scales)"
```

---

## Task 10: Semantic tokens

**Files:**
- Create: `src/styles/_tokens-semantic.scss`

- [ ] **Step 1: Write `_tokens-semantic.scss`**

```scss
// Semantic tokens — component-facing via CSS custom properties.
// Mapped to primitives by the active theme file in src/themes/.

:root {
  // Brand & accent
  --brand:           var(--_brand);
  --brand-contrast:  var(--_brand-contrast);
  --accent:          var(--_accent);
  --accent-soft:     var(--_accent-soft);

  // Surfaces
  --surface:         var(--_surface);
  --surface-raised:  var(--_surface-raised);
  --surface-sunken:  var(--_surface-sunken);

  // Text
  --text-primary:    var(--_text-primary);
  --text-secondary:  var(--_text-secondary);
  --text-muted:      var(--_text-muted);
  --text-on-brand:   var(--_text-on-brand);

  // Borders & dividers
  --border:          var(--_border);
  --divider:         var(--_divider);

  // Status
  --success:         var(--_success);
  --warn:            var(--_warn);
  --error:           var(--_error);

  // Radius
  --radius-card:     16px;
  --radius-chip:     999px;
  --radius-button:   12px;

  // Shadow
  --shadow-card:     0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-raised:   0 8px 24px rgba(0, 0, 0, 0.10);

  // Motion
  --dur-fast:        120ms;
  --dur-med:         220ms;
  --dur-slow:        320ms;
  --ease-out:        cubic-bezier(0.2, 0.7, 0.2, 1);
  --ease-spring:     cubic-bezier(0.4, 1.6, 0.5, 1);

  // Z-index scale
  --z-nav:           10;
  --z-overlay:       40;
  --z-toast:         100;
  --z-milestone:     1000;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/_tokens-semantic.scss
git commit -m "style: semantic tokens (css custom properties, component-facing)"
```

---

## Task 11: Reliance Retail theme

**Files:**
- Create: `src/themes/reliance-retail.scss`

- [ ] **Step 1: Write `reliance-retail.scss`**

```scss
@use '../styles/tokens-primitive' as *;

// Maps the semantic CSS vars to primitives for the Reliance Retail brand.
// To re-skin to another brand: copy this file, tweak values, swap the import in bootstrap.

:root {
  --_brand:           #{$blue-600};
  --_brand-contrast:  #{$ink-0};
  --_accent:          #{$saffron-400};
  --_accent-soft:     #{$saffron-300};

  --_surface:         #{$ink-0};
  --_surface-raised:  #{$ink-50};
  --_surface-sunken:  #{$ink-100};

  --_text-primary:    #{$ink-900};
  --_text-secondary:  #{$ink-600};
  --_text-muted:      #{$ink-400};
  --_text-on-brand:   #{$ink-0};

  --_border:          #{$ink-200};
  --_divider:         #{$ink-100};

  --_success:         #{$success-500};
  --_warn:            #{$warn-500};
  --_error:           #{$error-500};
}
```

Note: the `@use ... as *` syntax imports the `_tokens-primitive.scss` partial. Sass treats filenames starting with `_` as partials; the `@use` rule drops the underscore when resolving.

- [ ] **Step 2: Commit**

```bash
git add src/themes/reliance-retail.scss
git commit -m "style: reliance retail theme (maps semantic → primitive tokens)"
```

---

## Task 12: SCSS mixins

**Files:**
- Create: `src/styles/_mixins.scss`

- [ ] **Step 1: Write `_mixins.scss`**

```scss
// Reusable SCSS mixins. Keep small — prefer component-local styles over mixin explosion.

@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin stack($gap: 8px) {
  display: flex;
  flex-direction: column;
  gap: $gap;
}

@mixin row($gap: 8px) {
  display: flex;
  flex-direction: row;
  gap: $gap;
  align-items: center;
}

// Enforces WCAG 2.5.5 minimum touch target (44×44).
// Required on anything that sets cursor: pointer.
@mixin tap-target {
  min-width: 44px;
  min-height: 44px;
}

@mixin truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// Tabular numerals — use on any element that displays an amount that may update.
@mixin tabular-nums {
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
}

@mixin respect-reduced-motion {
  @media (prefers-reduced-motion: reduce) {
    @content;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/_mixins.scss
git commit -m "style: reusable scss mixins (flex, stack, tap-target, truncate, nums, rmotion)"
```

---

## Task 13: Globals

**Files:**
- Create: `src/styles/globals.scss`

- [ ] **Step 1: Write `globals.scss`**

```scss
@use './tokens-semantic';
@use '../themes/reliance-retail';

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body,
#root {
  height: 100%;
  margin: 0;
}

body {
  background: var(--surface);
  color: var(--text-primary);
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  text-size-adjust: 100%;
}

/* Non-removable focus ring */
:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 2px;
}

/* Disable motion above --dur-fast when user requests */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
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
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/globals.scss
git commit -m "style: globals (reset, focus-visible, reduced-motion, body defaults)"
```

---

## Task 14: Placeholder entry point

**Files:**
- Create: `src/index.js`

- [ ] **Step 1: Write `src/index.js`**

```js
import './styles/globals.scss';

const root = document.getElementById('root');
root.innerHTML = '<p style="padding:24px;font-family:Inter,system-ui">Incentive App — Phase 1 scaffold ✓</p>';

if (module.hot) {
  module.hot.accept();
}
```

This is a placeholder. Phase 2 replaces it with a real React root + providers.

- [ ] **Step 2: Verify the build works**

```bash
npm run build
```
Expected: `webpack X.Y.Z compiled successfully`, `build/` directory created, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/index.js
git commit -m "chore: placeholder entry (globals + sanity paragraph)"
```

---

## Task 15: Jest configuration

**Files:**
- Create: `jest.config.js`

- [ ] **Step 1: Write `jest.config.js`**

```js
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  moduleNameMapper: {
    '\\.(scss|sass|css)$': 'identity-obj-proxy'
  },
  testMatch: ['**/?(*.)+(test|spec).[jt]s?(x)'],
  collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/index.js']
};
```

- [ ] **Step 2: Run jest with no tests to verify config**

```bash
npm test -- --passWithNoTests
```
Expected: `Ran all test suites.` with zero failures.

- [ ] **Step 3: Commit**

```bash
git add jest.config.js
git commit -m "chore: jest config (jsdom, babel-jest, scss stub)"
```

---

## Task 16: `computeStreak` — empty sales case

**Files:**
- Create: `src/services/GamificationEngine/computeStreak.js`
- Create: `src/services/GamificationEngine/computeStreak.test.js`

- [ ] **Step 1: Write the failing test**

```js
// src/services/GamificationEngine/computeStreak.test.js
import { computeStreak } from './computeStreak';

describe('computeStreak', () => {
  test('returns 0/0 when sales array is empty', () => {
    const result = computeStreak([], new Date('2026-04-13T12:00:00+05:30'));
    expect(result).toEqual({
      current: 0,
      longest: 0,
      lastQualifyingDay: null,
    });
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm test -- computeStreak
```
Expected: `Cannot find module './computeStreak'`. Test fails.

- [ ] **Step 3: Minimal implementation to pass**

```js
// src/services/GamificationEngine/computeStreak.js
export function computeStreak(sales, today, tz = 'Asia/Kolkata') {
  if (!sales || sales.length === 0) {
    return { current: 0, longest: 0, lastQualifyingDay: null };
  }
  return { current: 0, longest: 0, lastQualifyingDay: null };
}
```

- [ ] **Step 4: Run test — expect pass**

```bash
npm test -- computeStreak
```
Expected: `1 passed`.

---

## Task 17: `computeStreak` — one qualifying sale today

**Files:**
- Modify: `src/services/GamificationEngine/computeStreak.test.js`
- Modify: `src/services/GamificationEngine/computeStreak.js`

- [ ] **Step 1: Append failing test**

```js
  test('current=1 when one qualifying sale today', () => {
    const sales = [
      { id: 's1', earned: 90, soldAt: '2026-04-13T11:42:00+05:30' },
    ];
    const result = computeStreak(sales, new Date('2026-04-13T20:00:00+05:30'));
    expect(result.current).toBe(1);
    expect(result.longest).toBe(1);
    expect(result.lastQualifyingDay).toBe('2026-04-13');
  });
```

- [ ] **Step 2: Run — expect failure**

```bash
npm test -- computeStreak
```
Expected: `current` is 0, test fails.

- [ ] **Step 3: Implement day-bucketing**

Replace `computeStreak.js` with:

```js
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Compute streak (consecutive days with ≥1 qualifying sale) ending at `today`.
 *
 * A qualifying day = ≥1 SaleEvent with `earned > 0` within that day in `tz`.
 * If today has no qualifying sale yet, streak is still "alive" (grace = today).
 * One missed day resets current to 0.
 *
 * @param {Array<{earned:number, soldAt:string}>} sales
 * @param {Date} today
 * @param {string} tz
 * @returns {{current:number, longest:number, lastQualifyingDay:string|null}}
 */
export function computeStreak(sales, today, tz = 'Asia/Kolkata') {
  if (!sales || sales.length === 0) {
    return { current: 0, longest: 0, lastQualifyingDay: null };
  }

  const qualifyingDays = new Set(
    sales
      .filter((s) => s && s.earned > 0)
      .map((s) => dayjs(s.soldAt).tz(tz).format('YYYY-MM-DD'))
  );

  if (qualifyingDays.size === 0) {
    return { current: 0, longest: 0, lastQualifyingDay: null };
  }

  const todayStr = dayjs(today).tz(tz).format('YYYY-MM-DD');
  const sortedDays = [...qualifyingDays].sort();
  const lastQualifyingDay = sortedDays[sortedDays.length - 1];

  // Longest run in the provided window
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = dayjs.tz(sortedDays[i - 1], tz);
    const curr = dayjs.tz(sortedDays[i], tz);
    if (curr.diff(prev, 'day') === 1) {
      run += 1;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }

  // Current streak: count consecutive days ending at today (or yesterday if today has no sale yet).
  let anchor = qualifyingDays.has(todayStr) ? todayStr : dayjs.tz(todayStr, tz).subtract(1, 'day').format('YYYY-MM-DD');
  let current = 0;
  while (qualifyingDays.has(anchor)) {
    current += 1;
    anchor = dayjs.tz(anchor, tz).subtract(1, 'day').format('YYYY-MM-DD');
  }

  return { current, longest, lastQualifyingDay };
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm test -- computeStreak
```
Expected: `2 passed`.

---

## Task 18: `computeStreak` — 7-day run + broken-day reset

**Files:**
- Modify: `src/services/GamificationEngine/computeStreak.test.js`

- [ ] **Step 1: Append two tests**

```js
  test('current=7 for seven consecutive qualifying days', () => {
    const sales = [];
    for (let i = 0; i < 7; i++) {
      sales.push({ id: `s${i}`, earned: 50, soldAt: `2026-04-${String(7 + i).padStart(2, '0')}T10:00:00+05:30` });
    }
    const result = computeStreak(sales, new Date('2026-04-13T20:00:00+05:30'));
    expect(result.current).toBe(7);
    expect(result.longest).toBe(7);
  });

  test('broken day resets current to 0 (and counts from most recent run)', () => {
    const sales = [
      { id: 'a', earned: 50, soldAt: '2026-04-01T10:00:00+05:30' },
      { id: 'b', earned: 50, soldAt: '2026-04-02T10:00:00+05:30' },
      { id: 'c', earned: 50, soldAt: '2026-04-03T10:00:00+05:30' },
      // gap: 04-04, 04-05
      { id: 'd', earned: 50, soldAt: '2026-04-10T10:00:00+05:30' },
    ];
    const today = new Date('2026-04-13T20:00:00+05:30');
    const result = computeStreak(sales, today);
    expect(result.current).toBe(0);
    expect(result.longest).toBe(3);
    expect(result.lastQualifyingDay).toBe('2026-04-10');
  });

  test('current=1 when today has no sale but yesterday did', () => {
    const sales = [
      { id: 'a', earned: 50, soldAt: '2026-04-12T10:00:00+05:30' },
    ];
    const today = new Date('2026-04-13T09:00:00+05:30');
    const result = computeStreak(sales, today);
    expect(result.current).toBe(1);
    expect(result.lastQualifyingDay).toBe('2026-04-12');
  });

  test('ignores sales with earned <= 0', () => {
    const sales = [
      { id: 'a', earned: 0, soldAt: '2026-04-13T10:00:00+05:30' },
      { id: 'b', earned: 50, soldAt: '2026-04-13T11:00:00+05:30' },
    ];
    const today = new Date('2026-04-13T12:00:00+05:30');
    const result = computeStreak(sales, today);
    expect(result.current).toBe(1);
  });
```

- [ ] **Step 2: Run — expect all pass (no implementation changes needed)**

```bash
npm test -- computeStreak
```
Expected: `5 passed`. If any fail, fix implementation in `computeStreak.js` — the four branches are all already handled but the walk-back logic must handle the "today has no sale" case correctly (anchor moves to yesterday).

- [ ] **Step 3: Commit**

```bash
git add src/services/GamificationEngine/computeStreak.js src/services/GamificationEngine/computeStreak.test.js
git commit -m "feat(gamification): computeStreak with TDD (empty, today, run, break, ignore-zero)"
```

---

## Task 19: `computeGoalProgress`

**Files:**
- Create: `src/services/GamificationEngine/computeGoalProgress.js`
- Create: `src/services/GamificationEngine/computeGoalProgress.test.js`

- [ ] **Step 1: Write failing tests**

```js
// src/services/GamificationEngine/computeGoalProgress.test.js
import { computeGoalProgress } from './computeGoalProgress';

describe('computeGoalProgress', () => {
  const earnings = {
    today: { amount: 180, count: 2 },
    thisWeek: { amount: 920, count: 11 },
    thisMonth: { amount: 4280, count: 47 },
    lifetime: { amount: 48120, count: 612 },
  };

  const goals = [
    { period: 'daily', target: 300, currency: 'INR' },
    { period: 'weekly', target: 2000, currency: 'INR' },
    { period: 'monthly', target: 7000, currency: 'INR' },
  ];

  const midMonth = new Date('2026-04-15T12:00:00+05:30'); // 50% through Apr

  test('returns one GoalProgress per goal', () => {
    const result = computeGoalProgress(earnings, goals, midMonth);
    expect(result).toHaveLength(3);
    expect(result.map((g) => g.period)).toEqual(['daily', 'weekly', 'monthly']);
  });

  test('monthly at 4280/7000 on day 15/30 → "on-track" (pct≈0.61 vs elapsed≈0.50)', () => {
    const result = computeGoalProgress(earnings, goals, midMonth);
    const monthly = result.find((g) => g.period === 'monthly');
    expect(monthly.earned).toBe(4280);
    expect(monthly.target).toBe(7000);
    expect(monthly.pct).toBeCloseTo(0.611, 2);
    expect(monthly.remaining).toBe(2720);
    expect(monthly.state).toBe('on-track');
  });

  test('daily 180/300 on mid-day → "behind" when pct < elapsed', () => {
    const earlyEvening = new Date('2026-04-15T19:00:00+05:30'); // ~80% of day
    const result = computeGoalProgress(earnings, goals, earlyEvening);
    const daily = result.find((g) => g.period === 'daily');
    expect(daily.state).toBe('behind');
  });

  test('earned >= target → "hit"', () => {
    const e = { ...earnings, thisMonth: { amount: 7000, count: 50 } };
    const result = computeGoalProgress(e, goals, midMonth);
    expect(result.find((g) => g.period === 'monthly').state).toBe('hit');
  });

  test('earned > target → "exceeded"', () => {
    const e = { ...earnings, thisMonth: { amount: 8500, count: 60 } };
    const result = computeGoalProgress(e, goals, midMonth);
    expect(result.find((g) => g.period === 'monthly').state).toBe('exceeded');
  });
});
```

- [ ] **Step 2: Run — expect failure**

```bash
npm test -- computeGoalProgress
```
Expected: module not found.

- [ ] **Step 3: Implement**

```js
// src/services/GamificationEngine/computeGoalProgress.js
import dayjs from 'dayjs';

const EARNED_KEY = {
  daily: 'today',
  weekly: 'thisWeek',
  monthly: 'thisMonth',
};

function elapsedFraction(period, now) {
  const d = dayjs(now);
  switch (period) {
    case 'daily': {
      const start = d.startOf('day');
      const end = d.endOf('day');
      return (d.valueOf() - start.valueOf()) / (end.valueOf() - start.valueOf());
    }
    case 'weekly': {
      const start = d.startOf('week');
      const end = d.endOf('week');
      return (d.valueOf() - start.valueOf()) / (end.valueOf() - start.valueOf());
    }
    case 'monthly': {
      const start = d.startOf('month');
      const end = d.endOf('month');
      return (d.valueOf() - start.valueOf()) / (end.valueOf() - start.valueOf());
    }
    default:
      return 0;
  }
}

function deriveState(pct, elapsed) {
  if (pct > 1) return 'exceeded';
  if (pct === 1) return 'hit';
  if (pct >= elapsed + 0.1) return 'ahead';
  if (pct >= elapsed - 0.05) return 'on-track';
  return 'behind';
}

/**
 * Per-goal progress view.
 * @returns {Array<{period, earned, target, pct, remaining, state}>}
 */
export function computeGoalProgress(earnings, goals, now = new Date()) {
  return goals.map((g) => {
    const earned = earnings[EARNED_KEY[g.period]]?.amount ?? 0;
    const target = g.target;
    const pct = target > 0 ? earned / target : 0;
    const elapsed = elapsedFraction(g.period, now);
    const remaining = Math.max(0, target - earned);
    return {
      period: g.period,
      earned,
      target,
      pct,
      remaining,
      state: deriveState(pct, elapsed),
    };
  });
}
```

- [ ] **Step 4: Run — expect all pass**

```bash
npm test -- computeGoalProgress
```
Expected: `5 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/services/GamificationEngine/computeGoalProgress.js src/services/GamificationEngine/computeGoalProgress.test.js
git commit -m "feat(gamification): computeGoalProgress (behind/on-track/ahead/hit/exceeded)"
```

---

## Task 20: `detectNewMilestones`

**Files:**
- Create: `src/services/GamificationEngine/detectNewMilestones.js`
- Create: `src/services/GamificationEngine/detectNewMilestones.test.js`

- [ ] **Step 1: Write failing tests**

```js
// src/services/GamificationEngine/detectNewMilestones.test.js
import { detectNewMilestones, bucketKey } from './detectNewMilestones';

describe('detectNewMilestones', () => {
  const earnings = {
    today: { amount: 180, count: 2 },
    thisWeek: { amount: 920, count: 11 },
    thisMonth: { amount: 5100, count: 50 },
    lifetime: { amount: 48120, count: 612 },
  };
  const now = new Date('2026-04-13T12:00:00+05:30');

  const ms1k = { id: 'MS-1000', threshold: 1000, period: 'monthly', label: '₹1k', celebration: 'both' };
  const ms5k = { id: 'MS-5000', threshold: 5000, period: 'monthly', label: '₹5k', celebration: 'both' };
  const ms10k = { id: 'MS-10000', threshold: 10000, period: 'monthly', label: '₹10k', celebration: 'both' };

  test('returns only newly crossed milestones', () => {
    const celebrated = new Set();
    const result = detectNewMilestones([ms1k, ms5k, ms10k], earnings, celebrated, now);
    expect(result.map((m) => m.id)).toEqual(['MS-1000', 'MS-5000']);
  });

  test('is idempotent — once marked celebrated, not returned again', () => {
    const celebrated = new Set([
      bucketKey(ms1k, now),
      bucketKey(ms5k, now),
    ]);
    const result = detectNewMilestones([ms1k, ms5k, ms10k], earnings, celebrated, now);
    expect(result).toHaveLength(0);
  });

  test('does not return milestones not yet crossed', () => {
    const low = { today: { amount: 0, count: 0 }, thisWeek: { amount: 0, count: 0 }, thisMonth: { amount: 500, count: 5 }, lifetime: { amount: 0, count: 0 } };
    const result = detectNewMilestones([ms1k, ms5k], low, new Set(), now);
    expect(result).toHaveLength(0);
  });

  test('period rollover: new month = empty celebrated set fires again', () => {
    const prevMonth = new Date('2026-03-31T12:00:00+05:30');
    const celebratedPrev = new Set([bucketKey(ms1k, prevMonth)]);
    const result = detectNewMilestones([ms1k], earnings, celebratedPrev, now);
    expect(result.map((m) => m.id)).toEqual(['MS-1000']);
  });
});

describe('bucketKey', () => {
  test('monthly bucket includes YYYY-MM', () => {
    const m = { id: 'MS-X', period: 'monthly' };
    expect(bucketKey(m, new Date('2026-04-13T00:00:00+05:30'))).toBe('MS-X:2026-04');
  });
  test('weekly bucket includes YYYY-Www', () => {
    const m = { id: 'MS-Y', period: 'weekly' };
    expect(bucketKey(m, new Date('2026-04-13T00:00:00+05:30'))).toMatch(/^MS-Y:2026-W\d{2}$/);
  });
  test('daily bucket includes YYYY-MM-DD', () => {
    const m = { id: 'MS-Z', period: 'daily' };
    expect(bucketKey(m, new Date('2026-04-13T00:00:00+05:30'))).toBe('MS-Z:2026-04-13');
  });
});
```

- [ ] **Step 2: Run — expect failure**

```bash
npm test -- detectNewMilestones
```
Expected: module not found.

- [ ] **Step 3: Implement**

```js
// src/services/GamificationEngine/detectNewMilestones.js
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(weekOfYear);

const EARNED_KEY = {
  daily: 'today',
  weekly: 'thisWeek',
  monthly: 'thisMonth',
};

export function bucketKey(milestone, now = new Date()) {
  const d = dayjs(now);
  switch (milestone.period) {
    case 'monthly':
      return `${milestone.id}:${d.format('YYYY-MM')}`;
    case 'weekly':
      return `${milestone.id}:${d.format('YYYY')}-W${String(d.week()).padStart(2, '0')}`;
    case 'daily':
      return `${milestone.id}:${d.format('YYYY-MM-DD')}`;
    default:
      return `${milestone.id}:unknown`;
  }
}

/**
 * Returns milestones newly crossed *and* not yet celebrated for this period bucket.
 * The caller is responsible for merging returned bucket keys into `alreadyCelebrated`
 * (persisted to localStorage under `incentive.celebrated.v1`) after firing animations.
 *
 * @param {Array} milestones
 * @param {object} earnings
 * @param {Set<string>} alreadyCelebrated
 * @param {Date} now
 * @returns {Array}
 */
export function detectNewMilestones(milestones, earnings, alreadyCelebrated, now = new Date()) {
  if (!milestones || milestones.length === 0) return [];
  return milestones.filter((m) => {
    const earned = earnings[EARNED_KEY[m.period]]?.amount ?? 0;
    const crossed = earned >= m.threshold;
    if (!crossed) return false;
    return !alreadyCelebrated.has(bucketKey(m, now));
  });
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm test -- detectNewMilestones
```
Expected: `7 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/services/GamificationEngine/detectNewMilestones.js src/services/GamificationEngine/detectNewMilestones.test.js
git commit -m "feat(gamification): detectNewMilestones + bucketKey (idempotent, period-rollover)"
```

---

## Task 21: `buildLeaderboardView`

**Files:**
- Create: `src/services/GamificationEngine/buildLeaderboardView.js`
- Create: `src/services/GamificationEngine/buildLeaderboardView.test.js`

- [ ] **Step 1: Write failing tests**

```js
// src/services/GamificationEngine/buildLeaderboardView.test.js
import { buildLeaderboardView } from './buildLeaderboardView';

describe('buildLeaderboardView', () => {
  const me = { id: 'EMP-0041', storeId: 'STR-MUM-0117' };

  const buildEntries = (count) =>
    Array.from({ length: count }, (_, i) => ({
      employeeId: `EMP-${String(i + 1).padStart(4, '0')}`,
      displayName: `Person ${i + 1}`,
      avatarUrl: null,
      rank: i + 1,
      earnings: 10000 - i * 100,
      isSelf: false,
    }));

  test('top N (≤20) returned as-is with delta annotations', () => {
    const entries = buildEntries(10);
    entries[2] = { ...entries[2], employeeId: 'EMP-0041', isSelf: true };
    const lb = { scope: 'store', scopeId: 'STR-MUM-0117', period: 'month', entries, myEntry: entries[2] };
    const view = buildLeaderboardView(lb, me);
    expect(view.entries).toHaveLength(10);
    expect(view.myRank).toBe(3);
    expect(view.deltaToNextAbove).toBe(100); // #3 earns 9800, #2 earns 9900
    expect(view.deltaToNextBelow).toBe(100);
  });

  test('self outside top 20 → top20 + separator + self pinned', () => {
    const entries = buildEntries(30);
    entries[24] = { ...entries[24], employeeId: 'EMP-0041', isSelf: true };
    const lb = { scope: 'store', scopeId: 'STR-MUM-0117', period: 'month', entries, myEntry: entries[24] };
    const view = buildLeaderboardView(lb, me);
    expect(view.entries).toHaveLength(22); // 20 + separator + self
    expect(view.entries[20]).toEqual({ kind: 'separator' });
    expect(view.entries[21].isSelf).toBe(true);
    expect(view.myRank).toBe(25);
  });

  test('self at rank 1 → no deltaToNextAbove', () => {
    const entries = buildEntries(5);
    entries[0] = { ...entries[0], employeeId: 'EMP-0041', isSelf: true };
    const lb = { scope: 'store', scopeId: 'STR-MUM-0117', period: 'month', entries, myEntry: entries[0] };
    const view = buildLeaderboardView(lb, me);
    expect(view.myRank).toBe(1);
    expect(view.deltaToNextAbove).toBe(null);
    expect(view.deltaToNextBelow).toBe(100);
  });

  test('self at last rank → no deltaToNextBelow', () => {
    const entries = buildEntries(5);
    entries[4] = { ...entries[4], employeeId: 'EMP-0041', isSelf: true };
    const lb = { scope: 'store', scopeId: 'STR-MUM-0117', period: 'month', entries, myEntry: entries[4] };
    const view = buildLeaderboardView(lb, me);
    expect(view.deltaToNextAbove).toBe(100);
    expect(view.deltaToNextBelow).toBe(null);
  });

  test('handles single-person leaderboard gracefully', () => {
    const entries = [{ employeeId: 'EMP-0041', displayName: 'Rohit S.', rank: 1, earnings: 500, isSelf: true, avatarUrl: null }];
    const lb = { scope: 'store', scopeId: 'STR-MUM-0117', period: 'month', entries, myEntry: entries[0] };
    const view = buildLeaderboardView(lb, me);
    expect(view.entries).toHaveLength(1);
    expect(view.deltaToNextAbove).toBe(null);
    expect(view.deltaToNextBelow).toBe(null);
  });
});
```

- [ ] **Step 2: Run — expect failure**

```bash
npm test -- buildLeaderboardView
```
Expected: module not found.

- [ ] **Step 3: Implement**

```js
// src/services/GamificationEngine/buildLeaderboardView.js

const TOP = 20;

/**
 * Trims to top 20 + self pinned if outside. Annotates deltas.
 * @param {{scope, scopeId, period, entries, myEntry}} lb
 * @param {{id: string}} me
 */
export function buildLeaderboardView(lb, me) {
  const sorted = [...lb.entries].sort((a, b) => a.rank - b.rank);
  const myIndex = sorted.findIndex((e) => e.employeeId === me.id);
  const myEntry = myIndex >= 0 ? sorted[myIndex] : lb.myEntry;
  const myRank = myEntry ? myEntry.rank : null;

  let entries;
  if (myIndex >= 0 && myIndex < TOP) {
    entries = sorted.slice(0, TOP);
  } else if (myIndex >= TOP) {
    entries = [...sorted.slice(0, TOP), { kind: 'separator' }, sorted[myIndex]];
  } else {
    entries = sorted.slice(0, TOP);
  }

  // Deltas relative to self, computed over the full sorted list (not the trimmed view).
  let deltaToNextAbove = null;
  let deltaToNextBelow = null;
  if (myIndex > 0) {
    deltaToNextAbove = sorted[myIndex - 1].earnings - myEntry.earnings;
  }
  if (myIndex >= 0 && myIndex < sorted.length - 1) {
    deltaToNextBelow = myEntry.earnings - sorted[myIndex + 1].earnings;
  }

  return {
    scope: lb.scope,
    scopeId: lb.scopeId,
    period: lb.period,
    myRank,
    deltaToNextAbove,
    deltaToNextBelow,
    entries,
  };
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm test -- buildLeaderboardView
```
Expected: `5 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/services/GamificationEngine/buildLeaderboardView.js src/services/GamificationEngine/buildLeaderboardView.test.js
git commit -m "feat(gamification): buildLeaderboardView (trim top-20, pin self, deltas)"
```

---

## Task 22: Barrel export + full engine test pass

**Files:**
- Create: `src/services/GamificationEngine/index.js`

- [ ] **Step 1: Write barrel**

```js
// src/services/GamificationEngine/index.js
export { computeStreak } from './computeStreak';
export { computeGoalProgress } from './computeGoalProgress';
export { detectNewMilestones, bucketKey } from './detectNewMilestones';
export { buildLeaderboardView } from './buildLeaderboardView';
```

- [ ] **Step 2: Run full test suite**

```bash
npm test
```
Expected: 4 test files, 17+ tests, all passing.

- [ ] **Step 3: Commit**

```bash
git add src/services/GamificationEngine/index.js
git commit -m "feat(gamification): barrel export for the engine module"
```

---

## Task 23: Phase 1 verification + tag

**Files:** none.

- [ ] **Step 1: Verify a clean build**

```bash
npm run build
```
Expected: webpack compiles successfully, `build/index.html` exists, `build/assets/*.js` and `build/assets/*.css` emitted.

- [ ] **Step 2: Verify lint clean on what we wrote**

```bash
npm run lint
```
Expected: no errors. Warnings allowed.

- [ ] **Step 3: Verify test suite green**

```bash
npm test
```
Expected: all suites pass.

- [ ] **Step 4: Tag phase-1 completion**

```bash
git tag -a phase-1-foundation -m "Phase 1: scaffold + tokens + gamification engine"
```

---

## Phase 1 Done — What's Next

After this phase completes cleanly:

- Project is buildable with `npm run build`.
- `npm test` is green with 17+ unit tests covering all four gamification primitives.
- Design token layer (primitive + semantic + Reliance Retail theme) is in place but not yet consumed by any components.
- `src/` skeleton matches spec §3.1; empty atomic-design folders ready for Phase 3.

**Phase 2** adds: `IdentityProvider` (mock), `DummyDataProvider` with fixtures, `ApiClient` (stubbed), Redux store with slices, i18next (en + hi translation skeleton), `bootstrap.js`, `App.js` provider tree, `Routes.js` with a single `/` route rendering a placeholder "Hello Rohit" page driven by real dummy data. Proves the full data chain end-to-end before Phase 3 starts building the Home UI.

---

*End of Phase 1 plan.*
