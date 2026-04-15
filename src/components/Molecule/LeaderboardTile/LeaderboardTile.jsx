import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Text, Badge } from '@/nexus/atoms';
import styles from './LeaderboardTile.module.scss';

export default function LeaderboardTile({ rank, deltaAbove, scope }) {
  return (
    <button type="button" className={styles.tile}>
      <div className={styles.rankBlock}>
        <span className={styles.hash}>#</span>
        <span className={styles.rank}>{rank}</span>
      </div>

      <div className={styles.meta}>
        <Text as="span" variant="overline" className={styles.eyebrow}>
          Standing &middot; {scope}
        </Text>
        <span className={styles.line}>
          <span className={styles.qty}>&#8377;{deltaAbove}</span>
          <Text as="span" variant="caption" className={styles.qtyUnit}>
            to catch
          </Text>
          <Badge variant="default" size="sm" className={styles.rival}>
            #{rank - 1}
          </Badge>
        </span>
      </div>

      <span className={styles.cta} aria-hidden="true">
        <span>See board</span>
        <ArrowUpRight size={14} strokeWidth={2.4} />
      </span>
    </button>
  );
}
