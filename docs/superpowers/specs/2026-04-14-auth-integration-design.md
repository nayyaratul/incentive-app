# Auth Integration Design: Incentive App

## Goal

Add JWT-based authentication to the Incentive App by reusing the existing custom auth system in incentive-os-poc. Store associates log in with their employee ID and password, receive a JWT, and the token is attached to all subsequent API calls.

## Architecture

The Incentive App (mobile SPA at `/mobile/*`) authenticates against the Admin API (incentive-os-poc at `/uatadmin/*`). Both sit behind ALB/CloudFront at `domain.com/incentive/*`. The backend's `POST /api/auth/login` issues JWTs and `GET /api/auth/me` validates them. The frontend stores the token in encrypted localStorage via `react-secure-storage` and attaches it as a `Bearer` header on every API call.

## Authentication Flow

```
User opens app
  -> AuthProvider checks localStorage for JWT
    -> Token exists?
      -> Validate via GET /api/auth/me
        -> Valid: load app with employee identity
        -> 401: clear token, show login screen
    -> No token: show login screen

Login screen
  -> User enters employerId + password
  -> POST /api/auth/login
    -> Success: store JWT via react-secure-storage, load app
    -> 401: show "Invalid credentials" inline error

Any API call returns 401 mid-session
  -> Toast: "Session expired, please log in again"
  -> Clear token
  -> Redirect to login screen after ~2s
```

## Backend Endpoints (Already Exist)

### POST /api/auth/login

**Request:**
```json
{ "employerId": "string", "password": "string" }
```

**Success Response (200):**
```json
{
  "token": "eyJhbG...",
  "user": {
    "employeeId": "EMP-0041",
    "employeeName": "Rohit Sharma",
    "role": "SA",
    "storeCode": "RD3675",
    "storeName": "Reliance Digital, Andheri West"
  }
}
```

**Error Response (401):**
```json
{ "error": "Invalid credentials" }
```

### GET /api/auth/me

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):** Same `user` shape as login.

**Error Response (401):**
```json
{ "error": "Invalid or expired token" }
```

## New Files

| File | Purpose |
|---|---|
| `src/context/AuthContext.jsx` | AuthProvider component + useAuth hook. Manages token lifecycle, login/logout, user state, session expiry listener. |
| `src/containers/Login/Login.jsx` | Login screen component. |
| `src/containers/Login/Login.module.scss` | Login screen styles. |

## Modified Files

| File | Change |
|---|---|
| `src/api/client.js` | Add request interceptor to inject `Authorization: Bearer <token>` header. Add 401 detection in response interceptor that dispatches `auth:session-expired` event (skip for `/auth/login` requests). |
| `src/context/PersonaContext.jsx` | When `REACT_APP_ENABLE_PERSONA_SWITCHER` is not `'true'`, derive single persona from AuthContext user instead of fetching all employees. |
| `src/App.jsx` | Wrap in AuthProvider. Conditionally render Login or main app based on `isAuthenticated`. |
| `.env.dev` | Add `REACT_APP_ENABLE_PERSONA_SWITCHER=true`. |

## AuthContext API

```js
const {
  user,              // { employeeId, employeeName, role, storeCode, storeName } | null
  token,             // string | null
  loading,           // true while validating stored token on app mount
  error,             // login error message string | null
  login,             // (employerId: string, password: string) => Promise<void>
  logout,            // () => void
  isAuthenticated,   // boolean (user !== null)
} = useAuth();
```

### AuthProvider Behavior

**On mount:**
1. Read token from `react-secure-storage` (key: `incentive_auth_token`)
2. If token exists, call `GET /api/auth/me` with it
3. If valid, set `user` from response, set `isAuthenticated = true`
4. If 401 or error, clear stored token, set `user = null`
5. Set `loading = false`

**login(employerId, password):**
1. Call `POST /api/auth/login` with `{ employerId, password }`
2. On success, store token via `react-secure-storage`, set `user` from response
3. On 401, set `error` to the server's error message

**logout():**
1. Clear token from `react-secure-storage`
2. Set `user = null`, `token = null`

**Session expiry listener:**
1. Listen for custom event `auth:session-expired` on `window`
2. When fired, show a toast "Session expired, please log in again"
3. After ~2 seconds, call `logout()`

## Token Injection (client.js)

Add a request interceptor to the existing axios instance:

```js
api.interceptors.request.use((config) => {
  const token = secureStorage.getItem('incentive_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

Modify the existing response error interceptor to detect 401:

```js
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
```

## Token Storage

Use `react-secure-storage` (already in package.json, never used until now).

- **Key:** `incentive_auth_token`
- **Value:** The raw JWT string
- The library encrypts values in localStorage using a fingerprint derived from the browser, making the token unreadable if extracted from a different device.

## PersonaContext Integration

`src/context/PersonaContext.jsx` already has a `REACT_APP_USE_MOCK_DATA` flag. Add a second mode controlled by `REACT_APP_ENABLE_PERSONA_SWITCHER`:

```
REACT_APP_USE_MOCK_DATA=true     -> static data, no API, no auth needed
REACT_APP_ENABLE_PERSONA_SWITCHER=true -> API + auth, but show persona switcher
neither                          -> API + auth, single persona from AuthContext
```

When persona switcher is OFF:
- Import `useAuth` from AuthContext
- Build a single persona from `auth.user` (employeeId, role, storeCode, etc.)
- Set it as the only persona and active persona
- Hide PersonaPill and PersonaModal

When persona switcher is ON:
- Fetch all employees/stores as now (requires auth token, which is available)
- Show the switcher UI
- Auth still required for the initial login

## Login Screen

Mobile-first, vertically centered layout on the brand background:

- **Reliance Retail logo** (from `src/assets/brand/reliance-retail/`)
- **"Employee ID" input** — text input, autocomplete off
- **"Password" input** — password input
- **"Sign in" button** — full-width, brand crimson `#BD2925`, white text, `--radius-button` (12px)
- **Error message** — below the button, `--error` color (#B61E1E), shown when `auth.error` is set
- **Loading state** — button shows "Signing in..." and is disabled while the login request is in flight

- **"Forgot password?" link** — below the sign-in button, muted text, tapping it shows an inline message: "Please contact your store manager or HR to reset your password." No actual reset flow — just informational.

No "sign up" link — this is a managed enterprise app where credentials are provisioned by admins.

## Environment Variables

### .env.dev (local development)
```
REACT_APP_USE_MOCK_DATA=true
REACT_APP_ENABLE_PERSONA_SWITCHER=true
REACT_APP_API_BASE_URL=http://localhost:3000/api
```

### .env.qa / .env.uat / .env.prod (deployed)
```
REACT_APP_USE_MOCK_DATA=false
REACT_APP_ENABLE_PERSONA_SWITCHER=false
REACT_APP_API_BASE_URL=<environment-specific API URL>
```

When `REACT_APP_USE_MOCK_DATA=true`, no login is required and no auth header is sent. The app uses static data as before. This means local development with mock data works without running the backend.

## Session Expiry Toast

A minimal toast component rendered by AuthProvider. Not a full toast system — just a fixed-position banner:
- Position: top center, `z-index: var(--z-toast)` (100)
- Background: `var(--surface-card)` with `var(--shadow-raised)`
- Text: "Session expired, please log in again"
- Auto-dismisses after ~2 seconds (then logout fires)

## Security Notes

- Passwords are stored in plaintext in the backend `UserCredential` table. This is a known POC limitation — not addressed in this design.
- The JWT has a 7-day expiry set by the backend. No refresh token mechanism exists.
- `react-secure-storage` encrypts the token in localStorage. It is not a replacement for httpOnly cookies but provides reasonable protection for a POC behind an enterprise ALB.
- The 401 handler skips `/auth/login` to avoid a loop where a failed login triggers session-expired logic.
