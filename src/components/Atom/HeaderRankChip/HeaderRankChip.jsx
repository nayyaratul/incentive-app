import React from 'react';
import { Trophy } from 'lucide-react';
import styles from './HeaderRankChip.module.scss';

/**
 * Compact rank pill that lives in the top-right of the HeaderBar.
 * Tap opens the leaderboard bottom-sheet.
 */
export default function HeaderRankChip({ rank, onOpen }) {
  if (typeof rank !== 'number') return null;
  return (
    <button type="button" className={styles.chip} onClick={onOpen} aria-label={`Rank ${rank} — tap to see leaderboard`}>
      <span className={styles.iconWrap} aria-hidden="true">
        <Trophy size={12} strokeWidth={2.6} />
      </span>
      <span className={styles.hash}>#</span>
      <span className={styles.rank}>{rank}</span>
    </button>
  );
}
