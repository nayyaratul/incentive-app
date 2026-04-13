import React from 'react';
import styles from './HeaderBar.module.scss';
import BrandLogo from '../../Atom/BrandLogo/BrandLogo';
import HeaderRankChip from '../../Atom/HeaderRankChip/HeaderRankChip';

export default function HeaderBar({ employeeName, rank, onOpenLeaderboard }) {
  return (
    <header className={styles.header}>
      <div className={styles.brandStrip} aria-hidden="true" />

      <div className={styles.top}>
        <BrandLogo variant="full" height={28} />
        {typeof rank === 'number' && (
          <HeaderRankChip rank={rank} onOpen={onOpenLeaderboard} />
        )}
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
