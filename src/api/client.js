import axios from 'axios';
import secureLocalStorage from 'react-secure-storage';

const TOKEN_KEY = 'incentive_auth_token';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ---------------------------------------------------------------------------
// Retry configuration
//
// At pilot scale (~2L users, flaky in-store wifi, cellular backoff) a single
// transient 5xx or network blip must not leave a widget blank for the whole
// session. We retry 3 times with exponential backoff on:
//   - network errors (no response)
//   - 5xx server errors
//   - 408 / 429 (rate-limited)
//
// Auth endpoints are excluded — a wrong password shouldn't be retried, and
// re-posting /auth/login 3× creates a log of failed attempts that security
// monitoring will flag.
// ---------------------------------------------------------------------------

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 400;

function shouldRetry(error) {
  const url = error.config?.url || '';
  if (url.includes('/auth/login') || url.includes('/auth/logout')) return false;
  if (error.config?.method && error.config.method.toUpperCase() !== 'GET') return false;

  // Network / timeout
  if (!error.response) return true;
  const status = error.response.status;
  if (status >= 500 && status < 600) return true;
  if (status === 408 || status === 429) return true;
  return false;
}

function backoffDelay(attempt) {
  // Exponential + jitter so many devices retrying don't stampede
  const exp = BASE_DELAY_MS * Math.pow(2, attempt);
  const jitter = Math.random() * BASE_DELAY_MS;
  return Math.min(exp + jitter, 4000);
}

// ---------------------------------------------------------------------------
// Request interceptor — attach Bearer token + seed a retry counter
// ---------------------------------------------------------------------------

api.interceptors.request.use((config) => {
  const token = secureLocalStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (typeof config.__retryCount !== 'number') {
    config.__retryCount = 0;
  }
  return config;
});

// ---------------------------------------------------------------------------
// Response interceptor — unwrap, handle 401, retry transient failures
// ---------------------------------------------------------------------------

api.interceptors.response.use(
  (res) => res.data,
  async (err) => {
    const status = err.response?.status;
    const url = err.config?.url || '';

    // 401 → session expired (skip for login and leaderboard which do
    // progressive disclosure via 401)
    if (status === 401 && !url.includes('/auth/login') && !url.includes('/leaderboard')) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
      }
      const message = err.response?.data?.error || err.message;
      return Promise.reject(new Error(message));
    }

    // Retry path
    if (err.config && shouldRetry(err) && err.config.__retryCount < MAX_RETRIES) {
      err.config.__retryCount += 1;
      const delay = backoffDelay(err.config.__retryCount);
      // eslint-disable-next-line no-console
      console.warn(`[api] retry ${err.config.__retryCount}/${MAX_RETRIES} for ${url} in ${Math.round(delay)}ms`);
      await new Promise((r) => setTimeout(r, delay));
      return api(err.config);
    }

    const message = err.response?.data?.error || err.message;
    return Promise.reject(new Error(message));
  }
);

export default api;
export { TOKEN_KEY };
