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
