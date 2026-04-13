import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import styles from './LeaderboardTile.module.scss';

export default function LeaderboardTile({ rank, deltaAbove, scope }) {
  return (
    <button type="button" className={styles.tile}>
      <div className={styles.rankBlock}>
        <span className={styles.hash}>#</span>
        <span className={styles.rank}>{rank}</span>
      </div>

      <div className={styles.meta}>
        <span className={styles.eyebrow}>Standing · {scope}</span>
        <span className={styles.line}>
          <span className={styles.qty}>₹{deltaAbove}</span>
          <span className={styles.qtyUnit}>to catch</span>
          <span className={styles.rival}>#{rank - 1}</span>
        </span>
      </div>

      <span className={styles.cta} aria-hidden="true">
        <span>See board</span>
        <ArrowUpRight size={14} strokeWidth={2.4} />
      </span>
    </button>
  );
}
