import React, { useMemo, useState } from 'react';
import { Drawer } from '@/nexus/molecules';
import Medallion from '../../Atom/Medallion/Medallion';
import { isNewBadge } from '../../Widgets/BadgesStrip/badgeSort';
import styles from './TrophyCaseDrawer.module.scss';

const TABS = [
  { id: 'all',       label: 'All' },
  { id: 'streak',    label: 'Streaks' },
  { id: 'sales',     label: 'Sales' },
  { id: 'milestone', label: 'Milestones' },
  { id: 'locked',    label: 'Locked' },
];

export default function TrophyCaseDrawer({ badges, open, onClose, onSelectBadge }) {
  const [activeTab, setActiveTab] = useState('all');

  const unlocked = useMemo(() => badges.filter((b) => b.unlockedAt).length, [badges]);
  const pct = badges.length > 0 ? Math.round((unlocked / badges.length) * 100) : 0;

  const visible = useMemo(() => {
    if (activeTab === 'all')    return badges;
    if (activeTab === 'locked') return badges.filter((b) => !b.unlockedAt);
    return badges.filter((b) => b.category === activeTab);
  }, [badges, activeTab]);

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      placement="bottom"
      height="full"
      title="Trophy Case"
    >
      <div className={styles.body}>
        <div className={styles.stats}>
          <div className={styles.statsNum}>
            {unlocked}<span>/{badges.length}</span>
          </div>
          <div className={styles.statsCap}>earned this month</div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className={styles.tabs} aria-label="Filter badges by category">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={activeTab === t.id}
              className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className={styles.empty}>
            {activeTab === 'locked'
              ? "Nothing locked — you've got them all."
              : 'No badges in this category yet.'}
          </div>
        ) : (
          <div className={styles.grid}>
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
                    onClick={() => onSelectBadge(b)}
                  />
                  <div
                    className={`${styles.cellLabel} ${locked ? styles.cellLabelLocked : ''}`}
                  >
                    {b.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Drawer>
  );
}
