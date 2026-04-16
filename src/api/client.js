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
    if (status === 401 && !url.includes('/auth/login') && !url.includes('/leaderboard')) {
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
    }
    const message = err.response?.data?.error || err.message;
    return Promise.reject(new Error(message));
  }
);

export default api;
export { TOKEN_KEY };
