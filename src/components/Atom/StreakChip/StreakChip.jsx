import React from 'react';
import { Flame } from 'lucide-react';
import { Tag } from '@/nexus/atoms';
import styles from './StreakChip.module.scss';

export default function StreakChip({ count }) {
  return (
    <Tag
      variant="warning"
      size="sm"
      icon={<Flame size={14} strokeWidth={2.4} fill="currentColor" className={styles.flame} />}
      aria-label={`${count} day streak`}
    >
      {count} day streak
    </Tag>
  );
}
