import React from 'react';
import { TrendingUp } from 'lucide-react';
import { computeFocusRows } from './computeFocusRows';
import styles from './LeaderboardFocusList.module.scss';

function formatEarn(val, unitLabel) {
  if (unitLabel === 'achievement') return `${val}%`;
  if (unitLabel === 'pieces' || unitLabel === 'units') return `${val}`;
  return `\u20B9${val.toLocaleString('en-IN')}`;
}

export default function LeaderboardFocusList({ entries, selfRank, unitLabel = 'earned', isStoreScope = false }) {
  if (!Array.isArray(entries) || entries.length === 0) return null;

  const { rows, ellipsisTop, ellipsisBottom } = computeFocusRows(entries, selfRank);

  if (rows.length === 0 && !ellipsisTop && !ellipsisBottom) return null;

  return (
    <div className={styles.list} role="list">
      <div className={styles.listHead}>
        <span>Rank</span>
        <span>{isStoreScope ? 'Store' : 'Associate'}</span>
        <span className={styles.listUnit}>
          {unitLabel === 'achievement' ? 'ach %' : unitLabel === 'earned' ? 'earned' : unitLabel}
        </span>
      </div>

      {ellipsisTop && (
        <div className={styles.ellipsis} aria-hidden="true">&middot; &middot; &middot;</div>
      )}

      {rows.map((r) => {
        /* Simulated delta for demo — in prod this would come from backend */
        const delta = r.isSelf ? Math.floor(Math.random() * 3) : 0;
        return (
          <div
            key={r.rank}
            role="listitem"
            className={`${styles.row} ${r.isSelf ? styles.rowSelf : ''}`}
          >
            <span className={styles.rank}>
              #{r.rank}
              {r.isSelf && delta > 0 && (
                <span className={styles.rankUp}>
                  <TrendingUp size={9} strokeWidth={3} />
                  {delta}
                </span>
              )}
            </span>
            <div className={styles.who}>
              <span className={styles.name}>
                {r.isSelf
                  ? `${r.name} ${isStoreScope ? '(Your store)' : '(You)'}`
                  : r.name}
              </span>
              {r.note && <span className={styles.note}>{r.note}</span>}
            </div>
            <span className={styles.earn}>{formatEarn(r.earned, unitLabel)}</span>
          </div>
        );
      })}

      {ellipsisBottom && (
        <div className={styles.ellipsis} aria-hidden="true">&middot; &middot; &middot;</div>
      )}
    </div>
  );
}
