import React from 'react';
import { Trophy } from 'lucide-react';
import { Drawer } from '@/nexus/molecules';
import LeaderboardPodium from '../../Molecule/LeaderboardPodium/LeaderboardPodium';
import LeaderboardFocusList from '../../Molecule/LeaderboardFocusList/LeaderboardFocusList';
import styles from './LeaderboardDrawer.module.scss';

/**
 * Mobile bottom-sheet leaderboard. Opens when the header rank pill is tapped.
 * Layout: optional top-3 banner → podium (#2 / #1 / #3) → focus list (self ± 1).
 */
export default function LeaderboardDrawer({ open, onClose, myRank }) {
  if (!myRank) return null;

  const unitLabel = myRank.unitLabel || 'earned';
  const scopeNote = myRank.scopeNote || `in ${myRank.scope}`;
  const inTop3 = myRank.rank >= 1 && myRank.rank <= 3;

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      placement="bottom"
      title={`You're #${myRank.rank}`}
      subtitle={`Leaderboard \u00b7 ${scopeNote}`}
      icon={<Trophy size={16} strokeWidth={2.4} />}
    >
      <div className={styles.body}>
        {inTop3 && (
          <div className={styles.banner} role="status">
            <span aria-hidden="true">&#127942;</span>
            <span>Top 3 &mdash; keep it up!</span>
          </div>
        )}

        <LeaderboardPodium entries={myRank.top} unitLabel={unitLabel} />

        <LeaderboardFocusList
          entries={myRank.top}
          selfRank={myRank.rank}
          unitLabel={unitLabel}
        />
      </div>
    </Drawer>
  );
}
