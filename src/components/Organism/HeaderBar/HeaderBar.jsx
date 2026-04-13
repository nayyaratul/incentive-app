import React from 'react';
import styles from './HeaderBar.module.scss';
import StreakChip from '../../Atom/StreakChip/StreakChip';

export default function HeaderBar({ employeeName, streak }) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.wordmark}>⬢ RELIANCE RETAIL</div>
        <p className={styles.greeting}>Namaste, {employeeName}</p>
      </div>
      <div className={styles.right}>
        <StreakChip count={streak} />
      </div>
    </header>
  );
}
