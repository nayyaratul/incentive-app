import React from 'react';
import styles from './EarningsHero.module.scss';
import { formatINR } from '../../../utils/format';

export default function EarningsHero({ thisMonth, today, goal }) {
  const pct = Math.round(goal.pct * 100);

  return (
    <div className={styles.hero}>
      <p className={styles.label}>Earned this month</p>
      <p className={styles.amount}>{formatINR(thisMonth.amount)}</p>
      <p className={styles.subtext}>
        +{formatINR(today.amount)} today · Goal {formatINR(goal.target)}
      </p>
      <div className={styles.progressTrack}>
        <div className={styles.progressBar} style={{ width: `${pct}%` }} />
      </div>
      <p className={styles.progressLabel}>{pct}% of goal</p>
    </div>
  );
}
