import React from 'react';
import styles from './HeaderBar.module.scss';
import StreakChip from '../../Atom/StreakChip/StreakChip';

export default function HeaderBar({ employeeName, streak }) {
  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <div className={styles.wordmark}>
          <span className={styles.mark}>◆</span>
          <span className={styles.brand}>RELIANCE</span>
          <span className={styles.sub}>Retail · Incentives</span>
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
