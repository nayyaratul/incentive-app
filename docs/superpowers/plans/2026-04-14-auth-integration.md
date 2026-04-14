# Auth Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add JWT-based login to the Incentive App, storing the token and attaching it to all API calls, with a login screen and session-expiry handling.

**Architecture:** AuthContext manages the token lifecycle (login, validate-on-mount, logout, session-expiry). The axios client injects the Bearer header on every request and dispatches a custom event on 401. App.jsx gates the entire app behind AuthContext's `isAuthenticated` flag. PersonaContext reads from AuthContext when the persona switcher is disabled.

**Tech Stack:** React Context, react-secure-storage (encrypted localStorage), axios interceptors, existing backend JWT endpoints (`/api/auth/login`, `/api/auth/me`).

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/api/auth.js` | Create | API module for login + me endpoints |
| `src/context/AuthContext.jsx` | Create | Auth state, login/logout, session-expiry listener, toast |
| `src/containers/Login/Login.jsx` | Create | Login screen UI |
| `src/containers/Login/Login.module.scss` | Create | Login screen styles |
| `src/api/client.js` | Modify | Add request interceptor (Bearer header) + 401 detection |
| `src/App.jsx` | Modify | Wrap in AuthProvider, gate on isAuthenticated |
| `src/context/PersonaContext.jsx` | Modify | Auth-driven single-persona mode |
| `.env.dev` | Modify | Add REACT_APP_ENABLE_PERSONA_SWITCHER |

---

### Task 1: Create auth API module

**Files:**
- Create: `src/api/auth.js`

- [ ] **Step 1: Create the auth API module**

```js
import api from './client';

export async function login(employerId, password) {
  return api.post('/auth/login', { employerId, password });
}

export async function fetchMe() {
  return api.get('/auth/me');
}
```

Note: `api.post` / `api.get` return the unwrapped JSON body (the axios interceptor does `res => res.data`). So `login()` returns `{ ok, token, user }` and `fetchMe()` returns `{ user }`.

- [ ] **Step 2: Commit**

```bash
git add src/api/auth.js
git commit -m "feat(api): add auth module for login and me endpoints"
```

---

### Task 2: Add token injection and 401 handling to axios client

**Files:**
- Modify: `src/api/client.js`

- [ ] **Step 1: Modify client.js**

Replace the entire file contents with:

```js
import axios from 'axios';
import secureLocalStorage from 'react-secure-storage';

const TOKEN_KEY = 'incentive_auth_token';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer token to every request
api.interceptors.request.use((config) => {
  const token = secureLocalStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Unwrap response data; detect 401 for session expiry
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const status = err.response?.status;
    const url = err.config?.url || '';
    if (status === 401 && !url.includes('/auth/login')) {
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
    }
    const message = err.response?.data?.error || err.message;
    return Promise.reject(new Error(message));
  }
);

export default api;
export { TOKEN_KEY };
```

Key changes from original:
- Added `react-secure-storage` import
- Added `TOKEN_KEY` constant (exported for use by AuthContext)
- Added request interceptor for Bearer header
- Added 401 detection in error interceptor (skips `/auth/login` to avoid loop)

- [ ] **Step 2: Verify `react-secure-storage` is importable**

Run: `node -e "require('react-secure-storage')"`

If it fails, run `npm install` first (it's in package.json already).

- [ ] **Step 3: Commit**

```bash
git add src/api/client.js
git commit -m "feat(api): add Bearer token injection and 401 session-expiry detection"
```

---

### Task 3: Create AuthContext

**Files:**
- Create: `src/context/AuthContext.jsx`

- [ ] **Step 1: Create the AuthContext file**

```jsx
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import secureLocalStorage from 'react-secure-storage';
import { login as apiLogin, fetchMe } from '../api/auth';
import { TOKEN_KEY } from '../api/client';

const AuthContext = createContext(null);

const useMock = process.env.REACT_APP_USE_MOCK_DATA === 'true';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(!useMock);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  // --- validate stored token on mount ---
  useEffect(() => {
    if (useMock) return;

    const stored = secureLocalStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }

    setToken(stored);
    fetchMe()
      .then((res) => setUser(res.user))
      .catch(() => {
        secureLocalStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // --- session expiry listener ---
  useEffect(() => {
    if (useMock) return;

    function handleExpiry() {
      setToast('Session expired, please log in again');
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => {
        setToast(null);
        secureLocalStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      }, 2000);
    }

    window.addEventListener('auth:session-expired', handleExpiry);
    return () => {
      window.removeEventListener('auth:session-expired', handleExpiry);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const login = useCallback(async (employerId, password) => {
    setError(null);
    try {
      const res = await apiLogin(employerId, password);
      secureLocalStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    secureLocalStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated: user !== null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {toast && <SessionToast message={toast} />}
    </AuthContext.Provider>
  );
}

function SessionToast({ message }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 'var(--z-toast, 100)',
        background: 'var(--surface-card, #fff)',
        color: 'var(--text-primary, #000)',
        padding: '12px 20px',
        borderRadius: 'var(--radius-card, 16px)',
        boxShadow: 'var(--shadow-raised, 0 2px 4px rgba(0,0,0,0.1))',
        fontFamily: "'Instrument Sans', sans-serif",
        fontSize: '13px',
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
    >
      {message}
    </div>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
```

Note: In mock mode (`REACT_APP_USE_MOCK_DATA=true`), AuthProvider skips token validation and stays in `loading: false` with `user: null` and `isAuthenticated: false`. App.jsx will handle the mock bypass.

- [ ] **Step 2: Commit**

```bash
git add src/context/AuthContext.jsx
git commit -m "feat(auth): add AuthContext with login, logout, and session-expiry handling"
```

---

### Task 4: Create Login screen

**Files:**
- Create: `src/containers/Login/Login.jsx`
- Create: `src/containers/Login/Login.module.scss`

- [ ] **Step 1: Create Login.module.scss**

```scss
.screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  padding: 24px;
  background: var(--surface-sunken, #f2f2f2);
}

.card {
  width: 100%;
  max-width: 360px;
  background: var(--surface-card, #fff);
  border-radius: var(--radius-card, 16px);
  box-shadow: var(--shadow-card);
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.logo {
  display: block;
  height: 40px;
  width: auto;
  margin: 0 auto 4px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, #4d4d4d);
  letter-spacing: 0.02em;
}

.input {
  padding: 10px 12px;
  border: 1px solid var(--surface-sunken, #e0e0e0);
  border-radius: var(--radius-button, 12px);
  font-size: 15px;
  font-family: 'Instrument Sans', sans-serif;
  color: var(--text-primary, #000);
  outline: none;
  transition: border-color var(--dur-fast, 120ms) ease;

  &:focus {
    border-color: var(--brand, #bd2925);
  }
}

.submit {
  padding: 12px;
  border: none;
  border-radius: var(--radius-button, 12px);
  background: var(--brand, #bd2925);
  color: var(--brand-contrast, #fff);
  font-size: 15px;
  font-weight: 600;
  font-family: 'Instrument Sans', sans-serif;
  cursor: pointer;
  transition: background var(--dur-fast, 120ms) ease;

  &:active {
    background: var(--brand-deep, #8e1e1c);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.error {
  font-size: 13px;
  color: var(--error, #b61e1e);
  text-align: center;
}

.forgot {
  font-size: 12px;
  color: var(--text-muted, #595959);
  text-align: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: 'Instrument Sans', sans-serif;

  &:hover {
    text-decoration: underline;
  }
}

.forgotMsg {
  font-size: 12px;
  color: var(--text-secondary, #4d4d4d);
  text-align: center;
  line-height: 1.5;
}
```

- [ ] **Step 2: Create Login.jsx**

```jsx
import React, { useState } from 'react';
import styles from './Login.module.scss';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/brand/reliance-retail/Reliance_Retail.svg';

export default function Login() {
  const { login, error, loading } = useAuth();
  const [employerId, setEmployerId] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employerId.trim() || !password) return;
    setSubmitting(true);
    try {
      await login(employerId.trim(), password);
    } catch {
      // error is set in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.screen}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <img src={logo} alt="Reliance Retail" className={styles.logo} />

        <div className={styles.field}>
          <label className={styles.label} htmlFor="login-eid">Employee ID</label>
          <input
            id="login-eid"
            className={styles.input}
            type="text"
            autoComplete="off"
            value={employerId}
            onChange={(e) => setEmployerId(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="login-pw">Password</label>
          <input
            id="login-pw"
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
          />
        </div>

        <button type="submit" className={styles.submit} disabled={submitting || loading}>
          {submitting ? 'Signing in\u2026' : 'Sign in'}
        </button>

        {error && <p className={styles.error}>{error}</p>}

        {!showForgot ? (
          <button type="button" className={styles.forgot} onClick={() => setShowForgot(true)}>
            Forgot password?
          </button>
        ) : (
          <p className={styles.forgotMsg}>
            Please contact your store manager or HR to reset your password.
          </p>
        )}
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/containers/Login/
git commit -m "feat(auth): add Login screen with brand styling and forgot-password message"
```

---

### Task 5: Wire App.jsx to AuthProvider and Login gate

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Replace App.jsx contents**

Current App.jsx:
```jsx
import React from 'react';
import { PersonaProvider } from './context/PersonaContext';
import { PersonaPill, PersonaModal } from './components/Widgets/PersonaSwitcher/PersonaSwitcher';
import OfflineBanner from './components/Organism/OfflineBanner/OfflineBanner';
import RootRouter from './containers/RootRouter';

export default function App() {
  return (
    <PersonaProvider>
      <OfflineBanner />
      <RootRouter />
      <PersonaPill />
      <PersonaModal />
    </PersonaProvider>
  );
}
```

New App.jsx:

```jsx
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PersonaProvider } from './context/PersonaContext';
import { PersonaPill, PersonaModal } from './components/Widgets/PersonaSwitcher/PersonaSwitcher';
import OfflineBanner from './components/Organism/OfflineBanner/OfflineBanner';
import RootRouter from './containers/RootRouter';
import Login from './containers/Login/Login';

const useMock = process.env.REACT_APP_USE_MOCK_DATA === 'true';

function AuthGate() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', fontFamily: "'Instrument Sans', sans-serif", color: 'var(--text-muted, #595959)' }}>Loading…</div>;
  }

  if (!isAuthenticated && !useMock) {
    return <Login />;
  }

  return (
    <PersonaProvider>
      <OfflineBanner />
      <RootRouter />
      <PersonaPill />
      <PersonaModal />
    </PersonaProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
```

Key changes:
- AuthProvider wraps everything
- AuthGate component decides: show loading spinner, Login screen, or main app
- In mock mode (`useMock`), skip the auth check and go straight to the app
- PersonaProvider only renders when authenticated (or in mock mode)

- [ ] **Step 2: Commit**

```bash
git add src/App.jsx
git commit -m "feat(auth): gate app behind AuthProvider, show Login when unauthenticated"
```

---

### Task 6: Update PersonaContext for auth-driven mode

**Files:**
- Modify: `src/context/PersonaContext.jsx`

- [ ] **Step 1: Add auth-driven persona mode**

The file currently has two modes: mock and API. Add a third: auth-only (no persona switcher).

Add this import near the top (after existing imports):

```js
import { useAuth } from './AuthContext';
```

Add this flag below the existing `useMock` flag:

```js
const enableSwitcher = process.env.REACT_APP_ENABLE_PERSONA_SWITCHER === 'true';
```

In the `PersonaProvider` component body, after the existing state declarations and before the `useEffect`, add the auth-driven path:

```js
const auth = useMock ? { user: null } : useAuth();
```

Modify the `useEffect` that fetches employees/stores. Currently it skips when `useMock` is true. Update the condition to also skip when the persona switcher is disabled (auth-only mode):

Replace:
```js
  useEffect(() => {
    if (useMock) return;
```

With:
```js
  useEffect(() => {
    if (useMock || !enableSwitcher) return;
```

After the `useEffect`, add the auth-only persona derivation. This runs when `!useMock && !enableSwitcher` and `auth.user` is available:

```js
  // Auth-only mode: single persona from authenticated user
  useEffect(() => {
    if (useMock || enableSwitcher || !auth.user) return;

    const u = auth.user;
    const persona = {
      id: `p-${u.employeeId}`,
      employeeId: u.employeeId,
      employeeName: u.employeeName,
      role: u.role,
      vertical: u.vertical || null,
      storeCode: u.storeCode || null,
      badge: u.vertical ? `${u.role} \u00b7 ${u.vertical}` : u.role,
      tagline: u.storeName ? `${u.role} \u00b7 ${u.storeName}` : u.role,
      color: u.role === 'SA' ? 'crimson' : u.role === 'BA' ? 'saffron' : 'navy',
    };

    setPersonas([persona]);
    setEmployeeList([{
      employeeId: u.employeeId,
      employeeName: u.employeeName,
      role: u.role,
      storeCode: u.storeCode,
      storeName: u.storeName,
      vertical: u.vertical,
      payrollStatus: u.payrollStatus || 'ACTIVE',
    }]);
    setStoreList(u.storeCode ? [{
      storeCode: u.storeCode,
      storeName: u.storeName || '',
      vertical: u.vertical || '',
    }] : []);
    setActiveId(persona.id);
    setLoading(false);
  }, [auth.user]);
```

- [ ] **Step 2: Commit**

```bash
git add src/context/PersonaContext.jsx
git commit -m "feat(context): add auth-driven single-persona mode when switcher disabled"
```

---

### Task 7: Update .env.dev

**Files:**
- Modify: `.env.dev`

- [ ] **Step 1: Add the persona switcher flag**

Add this line to `.env.dev`:

```
REACT_APP_ENABLE_PERSONA_SWITCHER=true
```

The full file should be:
```
REACT_APP_ENV=dev
REACT_APP_USE_MOCK_DATA=true
REACT_APP_ENABLE_PERSONA_SWITCHER=true
REACT_APP_API_BASE_URL=http://localhost:3000/api
REACT_APP_PARENT_APP_URL=https://dev-parent.reliance.retail
REACT_APP_SENTRY_DSN=
REACT_APP_JWT_AUDIENCE=incentive-app
```

- [ ] **Step 2: Commit**

```bash
git add .env.dev
git commit -m "chore(env): add REACT_APP_ENABLE_PERSONA_SWITCHER flag"
```

---

### Task 8: Build verification and lint

**Files:** None (verification only)

- [ ] **Step 1: Run webpack build**

```bash
npx webpack --mode development --config webpack.config.js
```

Expected: `compiled successfully`

- [ ] **Step 2: Run ESLint on new/modified files**

```bash
npx eslint src/api/auth.js src/api/client.js src/context/AuthContext.jsx src/containers/Login/Login.jsx src/App.jsx src/context/PersonaContext.jsx
```

Fix any warnings from our new code (ignore pre-existing aria-role/unescaped-entities errors).

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: All 23 existing tests pass (no regressions).

- [ ] **Step 4: Commit any lint fixes**

```bash
git add -u
git commit -m "fix(lint): resolve warnings in auth integration code"
```

---

## Execution Order

```
Task 1: auth API module         (no deps)
Task 2: client.js interceptors  (no deps, but Task 1 uses client)
Task 3: AuthContext              (depends on Task 1 + 2)
Task 4: Login screen            (depends on Task 3)
Task 5: App.jsx wiring          (depends on Task 3 + 4)
Task 6: PersonaContext update    (depends on Task 3)
Task 7: .env.dev                (no deps)
Task 8: Build verification      (depends on all above)
```

Tasks 1, 2, and 7 have no dependencies and could run first. Tasks 3-6 are sequential. Task 8 is final verification.
