import React, { useEffect } from 'react';
import { X, Trophy } from 'lucide-react';
import styles from './LeaderboardDrawer.module.scss';

/**
 * Mobile bottom-sheet leaderboard. Opens when the header rank chip is tapped.
 * Closes on ESC, backdrop click, or the X button.
 */
export default function LeaderboardDrawer({ open, onClose, myRank }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !myRank) return null;

  const unitLabel = myRank.unitLabel || 'earned';
  const scopeNote = myRank.scopeNote || `in ${myRank.scope}`;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-label="Store leaderboard">
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle} aria-hidden="true" />

        <header className={styles.head}>
          <div className={styles.headLeft}>
            <div className={styles.iconWrap} aria-hidden="true"><Trophy size={16} strokeWidth={2.4} /></div>
            <div>
              <div className={styles.eyebrow}>Leaderboard · {scopeNote}</div>
              <h2 className={styles.title}>You're #{myRank.rank}</h2>
            </div>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <X size={18} strokeWidth={2.2} />
          </button>
        </header>

        <div className={styles.list}>
          <div className={styles.listHead}>
            <span>Rank</span>
            <span>Associate</span>
            <span className={styles.listUnit}>{unitLabel}</span>
          </div>
          {myRank.top.map((r) => (
            <div
              key={r.rank}
              className={`${styles.row} ${r.isSelf ? styles.rowSelf : ''}`}
            >
              <span className={styles.rank}>#{r.rank}</span>
              <div className={styles.who}>
                <span className={styles.name}>{r.name}</span>
                {r.note && <span className={styles.note}>{r.note}</span>}
              </div>
              <span className={styles.earn}>
                {formatEarn(r.earned, myRank.unitLabel)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatEarn(val, unitLabel) {
  if (unitLabel === 'pieces' || unitLabel === 'units') return `${val}`;
  return `₹${val.toLocaleString('en-IN')}`;
}
