import React from 'react';
import { Flame } from 'lucide-react';
import { Text, Tag } from '@/nexus/atoms';
import styles from './StreakNote.module.scss';

/**
 * Always-positive streak display placed below the earnings hero.
 * Shows count + context. Renders nothing if streak is 0 (no negative state).
 *
 * Expected shape:
 *   streak = {
 *     current: number,
 *     longest: number,
 *     label: 'working days',
 *     caption: 'present + selling',
 *   }
 */
export default function StreakNote({ streak }) {
  if (!streak || streak.current === 0) return null;

  return (
    <div className={styles.note} role="note">
      <span className={styles.iconWrap} aria-hidden="true">
        <Flame size={14} strokeWidth={2.4} fill="currentColor" />
      </span>
      <Text as="span" variant="body" className={styles.count}>{streak.current}</Text>
      <Text as="span" variant="body" className={styles.label}>{streak.label}</Text>
      <span className={styles.divider} aria-hidden="true">&middot;</span>
      <Text as="span" variant="caption" className={styles.caption}>{streak.caption}</Text>
      {streak.longest > streak.current && (
        <Text as="span" variant="micro" className={styles.longest}>best: {streak.longest}</Text>
      )}
    </div>
  );
}
