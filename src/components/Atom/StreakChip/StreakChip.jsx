import React from 'react';
import styles from './StreakChip.module.scss';

export default function StreakChip({ count }) {
  return (
    <span className={styles.chip}>
      🔥 {count} day streak
    </span>
  );
}
