import React from 'react';
import { Flame } from 'lucide-react';
import styles from './StreakChip.module.scss';

export default function StreakChip({ count }) {
  return (
    <span className={styles.chip} aria-label={`${count} day streak`}>
      <span className={styles.flame} aria-hidden="true">
        <Flame size={12} strokeWidth={2.4} fill="currentColor" />
      </span>
      <span className={styles.count}>{count}</span>
      <span className={styles.unit}>day streak</span>
    </span>
  );
}
