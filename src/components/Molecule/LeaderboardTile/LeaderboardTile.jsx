import React from 'react';
import { ChevronRight } from 'lucide-react';
import styles from './LeaderboardTile.module.scss';
import RankBadge from '../../Atom/RankBadge/RankBadge';

export default function LeaderboardTile({ rank, deltaAbove, scope }) {
  return (
    <div className={styles.tile}>
      <RankBadge rank={rank} />
      <div className={styles.text}>
        <p className={styles.primary}>You&apos;re #{rank} in {scope}</p>
        <p className={styles.secondary}>+₹{deltaAbove} to #{rank - 1}</p>
      </div>
      <ChevronRight size={20} color="var(--text-muted)" />
    </div>
  );
}
