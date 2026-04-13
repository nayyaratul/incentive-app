import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import styles from './OfflineBanner.module.scss';

/**
 * Sticky top banner — shown when navigator.onLine is false.
 * Reassures the user that displayed data is cached and will refresh on reconnect.
 */
export default function OfflineBanner() {
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [lastSync] = useState(() => new Date());

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  if (online) return null;

  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <div className={styles.inner}>
        <span className={styles.iconWrap}>
          <WifiOff size={14} strokeWidth={2.4} />
        </span>
        <div className={styles.text}>
          <div className={styles.title}>You're offline</div>
          <div className={styles.sub}>
            Showing saved data · last sync {lastSync.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · will refresh when you're back online
          </div>
        </div>
      </div>
    </div>
  );
}
