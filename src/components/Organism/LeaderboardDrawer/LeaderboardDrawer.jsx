import React from 'react';
import { Trophy } from 'lucide-react';
import { Drawer } from '@/nexus/molecules';
import styles from './LeaderboardDrawer.module.scss';

/**
 * Mobile bottom-sheet leaderboard. Opens when the header rank chip is tapped.
 * Now uses the Nexus Drawer for overlay, animation, focus management, and close handling.
 */
export default function LeaderboardDrawer({ open, onClose, myRank }) {
  if (!myRank) return null;

  const unitLabel = myRank.unitLabel || 'earned';
  const scopeNote = myRank.scopeNote || `in ${myRank.scope}`;

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      placement="bottom"
      title={`You're #${myRank.rank}`}
      subtitle={`Leaderboard \u00b7 ${scopeNote}`}
      icon={<Trophy size={16} strokeWidth={2.4} />}
    >
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
    </Drawer>
  );
}

function formatEarn(val, unitLabel) {
  if (unitLabel === 'pieces' || unitLabel === 'units') return `${val}`;
  return `\u20B9${val.toLocaleString('en-IN')}`;
}
