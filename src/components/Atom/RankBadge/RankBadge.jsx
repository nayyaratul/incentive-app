import React from 'react';
import styles from './RankBadge.module.scss';

export default function RankBadge({ rank }) {
  return (
    <div className={styles.badge}>
      #{rank}
    </div>
  );
}
