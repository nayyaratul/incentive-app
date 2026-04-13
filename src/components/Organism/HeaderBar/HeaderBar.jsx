import React from 'react';
import styles from './HeaderBar.module.scss';
import StreakChip from '../../Atom/StreakChip/StreakChip';
import BrandLogo from '../../Atom/BrandLogo/BrandLogo';

export default function HeaderBar({ employeeName, streak, showStreak = true }) {
  return (
    <header className={styles.header}>
      {/* Thin crimson signature stripe — echoes Reliance's footer red bar */}
      <div className={styles.brandStrip} aria-hidden="true" />

      <div className={styles.top}>
        <BrandLogo variant="full" height={28} />
        {showStreak && streak > 0 && <StreakChip count={streak} />}
      </div>

      {employeeName && (
        <div className={styles.greeting}>
          <span className={styles.namaste}>Namaste,</span>
          <span className={styles.name}>{employeeName}</span>
          <span className={styles.period}>.</span>
        </div>
      )}
    </header>
  );
}
