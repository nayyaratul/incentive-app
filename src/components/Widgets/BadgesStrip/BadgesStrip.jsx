import React from 'react';
import { Medal } from 'lucide-react';
import { Text } from '@/nexus/atoms';
import styles from './BadgesStrip.module.scss';
import { badgesByEmployee } from '../../../data/gamification';

export default function BadgesStrip({ employeeId }) {
  const badges = badgesByEmployee[employeeId] || [];
  if (badges.length === 0) return null;

  const unlocked = badges.filter((b) => b.unlockedAt).length;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Medal size={14} strokeWidth={2.4} className={styles.iconAccent} />
          <span className={styles.title}>Badges</span>
        </div>
        <Text variant="caption" size="sm" as="span" className={styles.counter}>
          <strong>{unlocked}</strong> of {badges.length}
        </Text>
      </div>

      <div className={styles.scroll}>
        {badges.map((b) => {
          const isLocked = !b.unlockedAt;
          return (
            <div
              key={b.id}
              className={`${styles.badge} ${isLocked ? styles.locked : ''}`}
              title={b.note}
            >
              <div className={styles.icon} aria-hidden="true">{b.icon}</div>
              <div className={styles.body}>
                <Text variant="caption" size="sm" weight="semibold" truncate className={styles.label}>
                  {b.label}
                </Text>
                <Text variant="micro" as="span" color="var(--color-text-tertiary)" className={styles.note}>
                  {isLocked ? 'Not yet' : new Date(b.unlockedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </Text>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
