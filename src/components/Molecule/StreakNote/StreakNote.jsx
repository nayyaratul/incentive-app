import React from 'react';
import { Flame } from 'lucide-react';
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
      <span className={styles.count}>{streak.current}</span>
      <span className={styles.label}>{streak.label}</span>
      <span className={styles.divider} aria-hidden="true">·</span>
      <span className={styles.caption}>{streak.caption}</span>
      {streak.longest > streak.current && (
        <span className={styles.longest}>best: {streak.longest}</span>
      )}
    </div>
  );
}
