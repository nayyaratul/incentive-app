import React from 'react';
import { Medal } from 'lucide-react';
import { Text } from '@/nexus/atoms';
import styles from './BadgesStrip.module.scss';
import { badgesByEmployee } from '../../../data/gamification';

// Sample employee per vertical — used when the API-fetched employeeId
// isn't in the gamification mock data, so every user sees example badges.
const VERTICAL_SAMPLE_ID = {
  ELECTRONICS: 'EMP-0041',
  GROCERY: 'GRC-2203',
  FNL: 'FNL-3103',
};

export default function BadgesStrip({ employeeId, vertical }) {
  const direct = badgesByEmployee[employeeId];
  const fallbackId = VERTICAL_SAMPLE_ID[vertical];
  const badges = direct || (fallbackId ? badgesByEmployee[fallbackId] : null) || [];

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

      {badges.length === 0 && (
        <div className={styles.empty}>
          <Medal size={18} strokeWidth={1.8} className={styles.emptyIcon} />
          <Text as="span" variant="caption" size="sm" className={styles.emptyText}>
            Complete your first sale to start earning badges!
          </Text>
        </div>
      )}

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
                <Text as="div" variant="caption" size="sm" weight="semibold" truncate className={styles.label}>
                  {b.label}
                </Text>
                <Text as="div" variant="micro" className={styles.note}>
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
