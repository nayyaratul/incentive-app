import React from 'react';
import { computeFocusRows } from './computeFocusRows';
import styles from './LeaderboardFocusList.module.scss';

function formatEarn(val, unitLabel) {
  if (unitLabel === 'pieces' || unitLabel === 'units') return `${val}`;
  return `\u20B9${val.toLocaleString('en-IN')}`;
}

export default function LeaderboardFocusList({ entries, selfRank, unitLabel = 'earned' }) {
  if (!Array.isArray(entries) || entries.length === 0) return null;

  const { rows, ellipsisTop, ellipsisBottom } = computeFocusRows(entries, selfRank);

  if (rows.length === 0 && !ellipsisTop && !ellipsisBottom) return null;

  return (
    <div className={styles.list} role="list">
      <div className={styles.listHead}>
        <span>Rank</span>
        <span>Associate</span>
        <span className={styles.listUnit}>
          {unitLabel === 'earned' ? 'earned' : unitLabel}
        </span>
      </div>

      {ellipsisTop && (
        <div className={styles.ellipsis} aria-hidden="true">&middot; &middot; &middot;</div>
      )}

      {rows.map((r) => (
        <div
          key={r.rank}
          role="listitem"
          className={`${styles.row} ${r.isSelf ? styles.rowSelf : ''}`}
        >
          <span className={styles.rank}>#{r.rank}</span>
          <div className={styles.who}>
            <span className={styles.name}>
              {r.isSelf ? `${r.name} (You)` : r.name}
            </span>
            {r.note && <span className={styles.note}>{r.note}</span>}
          </div>
          <span className={styles.earn}>{formatEarn(r.earned, unitLabel)}</span>
        </div>
      ))}

      {ellipsisBottom && (
        <div className={styles.ellipsis} aria-hidden="true">&middot; &middot; &middot;</div>
      )}
    </div>
  );
}
