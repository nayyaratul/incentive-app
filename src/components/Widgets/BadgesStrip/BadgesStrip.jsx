import React, { useMemo, useState } from 'react';
import { Trophy } from 'lucide-react';
import { Text } from '@/nexus/atoms';
import styles from './BadgesStrip.module.scss';
import { badgesByEmployee } from '../../../data/gamification';
import Medallion from '../../Atom/Medallion/Medallion';
import TrophyCaseDrawer from '../../Organism/TrophyCaseDrawer/TrophyCaseDrawer';
import BadgeDetailDrawer from '../../Organism/BadgeDetailDrawer/BadgeDetailDrawer';
import { sortBadgesForStrip, isNewBadge } from './badgeSort';

const VERTICAL_SAMPLE_ID = {
  ELECTRONICS: 'EMP-0041',
  GROCERY:     'GRC-2203',
  FNL:         'FNL-3103',
};

const SHELF_MAX = 4;

export default function BadgesStrip({ employeeId, vertical }) {
  const direct = badgesByEmployee[employeeId];
  const fallbackId = VERTICAL_SAMPLE_ID[vertical];
  const badges = direct || (fallbackId ? badgesByEmployee[fallbackId] : null) || [];

  const [trophyOpen, setTrophyOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);

  const sorted = useMemo(() => sortBadgesForStrip(badges), [badges]);
  const visible = sorted.slice(0, SHELF_MAX);
  const overflow = Math.max(0, sorted.length - SHELF_MAX);

  if (badges.length === 0) return null;

  const unlocked = badges.filter((b) => b.unlockedAt).length;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Trophy size={14} strokeWidth={2.4} className={styles.iconAccent} />
          <span className={styles.title}>Badges</span>
        </div>
        <Text variant="caption" size="sm" as="span" className={styles.counter}>
          <strong>{unlocked}</strong> of {badges.length} earned
        </Text>
      </div>

      <div className={styles.row}>
        {visible.map((b) => {
          const locked = !b.unlockedAt;
          return (
            <div key={b.id} className={styles.cell}>
              <Medallion
                icon={b.icon}
                rarity={b.rarity}
                locked={locked}
                isNew={isNewBadge(b.unlockedAt)}
                size="md"
                ariaLabel={`${b.label} — ${b.rarity} ${b.category} badge${locked ? ', locked' : ''}`}
                onClick={() => setSelectedBadge(b)}
              />
              <div className={`${styles.cellLabel} ${locked ? styles.cellLabelLocked : ''}`}>
                {b.label}
              </div>
            </div>
          );
        })}

        {overflow > 0 && (
          <div className={styles.cell}>
            <button
              type="button"
              className={styles.viewAll}
              aria-label={`View all ${badges.length} badges`}
              onClick={() => setTrophyOpen(true)}
            >
              +{overflow}
            </button>
            <div className={styles.cellLabel}>View all</div>
          </div>
        )}
      </div>

      <TrophyCaseDrawer
        badges={sorted}
        open={trophyOpen}
        onClose={() => setTrophyOpen(false)}
        onSelectBadge={(b) => setSelectedBadge(b)}
      />

      <BadgeDetailDrawer
        badge={selectedBadge}
        open={!!selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />
    </section>
  );
}
