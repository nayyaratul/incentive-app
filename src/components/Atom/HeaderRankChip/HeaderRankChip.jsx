import React from 'react';
import { Trophy } from 'lucide-react';
import styles from './HeaderRankChip.module.scss';

export default function HeaderRankChip({ rank, onOpen }) {
  if (typeof rank !== 'number') return null;
  return (
    <button
      type="button"
      className={styles.chip}
      onClick={onOpen}
      aria-label={`Rank ${rank} — tap to see leaderboard`}
    >
      <Trophy size={12} strokeWidth={2.6} aria-hidden="true" />
      <span className={styles.rankText}>#{rank}</span>
    </button>
  );
}
