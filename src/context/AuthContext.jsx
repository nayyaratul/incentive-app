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
        zIndex: 100,
        background: 'var(--color-bg-elevated, #fff)',
        color: 'var(--color-text-primary, #000)',
        padding: '12px 20px',
        borderRadius: 'var(--radius-200, 16px)',
        boxShadow: 'var(--elevation-surface-raised-mid, 0 2px 4px rgba(0,0,0,0.1))',
        fontFamily: "var(--sans)",
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
