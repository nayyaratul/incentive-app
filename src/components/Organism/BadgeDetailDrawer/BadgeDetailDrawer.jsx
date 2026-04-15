import React from 'react';
import { Drawer } from '@/nexus/molecules';
import Medallion from '../../Atom/Medallion/Medallion';
import { formatDate } from '../../../utils/format';
import { isNewBadge } from '../../Widgets/BadgesStrip/badgeSort';
import styles from './BadgeDetailDrawer.module.scss';

const CATEGORY_LABEL = {
  streak: 'Streak',
  sales: 'Sales',
  milestone: 'Milestone',
};

const RARITY_CHIP = {
  gold:   styles.chipGold,
  silver: styles.chipSilver,
  bronze: styles.chipBronze,
};

export default function BadgeDetailDrawer({ badge, open, onClose }) {
  if (!badge) return null;

  const locked = !badge.unlockedAt;
  const isNew = isNewBadge(badge.unlockedAt);

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      placement="bottom"
      title={badge.label}
    >
      <div className={styles.body}>
        <div className={styles.hero}>
          <Medallion
            icon={badge.icon}
            rarity={badge.rarity}
            locked={locked}
            isNew={isNew}
            size="lg"
            ariaLabel={`${badge.label} — ${badge.rarity} ${badge.category} badge${locked ? ', locked' : ''}`}
          />
          <div className={styles.chips}>
            <span className={`${styles.chip} ${RARITY_CHIP[badge.rarity] || styles.chipNeutral}`}>
              {badge.rarity}
            </span>
            <span className={`${styles.chip} ${styles.chipNeutral}`}>
              {CATEGORY_LABEL[badge.category] || badge.category}
            </span>
          </div>
        </div>

        <p className={styles.note}>{badge.note}</p>

        <div className={styles.unlockLine}>
          {locked ? 'Locked — earn to unlock' : `Unlocked ${formatDate(badge.unlockedAt)}`}
        </div>
      </div>
    </Drawer>
  );
}
