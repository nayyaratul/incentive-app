import React from 'react';
import styles from './HeaderBar.module.scss';
import StreakChip from '../../Atom/StreakChip/StreakChip';

export default function HeaderBar({ employeeName, streak }) {
  return (
    <header className={styles.header}>
      {/* Reliance crimson signature strip — brand anchor, echoes footer bar on relianceretail.com */}
      <div className={styles.brandStrip} aria-hidden="true" />

      <div className={styles.top}>
        <div className={styles.wordmark} aria-label="Reliance Retail Incentives">
          <span className={styles.reliance}>Reliance</span>
          <span className={styles.pipe} aria-hidden="true" />
          <span className={styles.product}>
            <span className={styles.productLead}>Retail</span>
            <span className={styles.productDot} aria-hidden="true">·</span>
            <span className={styles.productTail}>Incentives</span>
          </span>
        </div>
        <StreakChip count={streak} />
      </div>

      <div className={styles.greeting}>
        <span className={styles.namaste}>Namaste,</span>
        <span className={styles.name}>{employeeName}</span>
        <span className={styles.period}>.</span>
      </div>
    </header>
  );
}
