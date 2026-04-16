import React from 'react';
import { Trophy } from 'lucide-react';
import { Drawer } from '@/nexus/molecules';
import LeaderboardPodium from '../../Molecule/LeaderboardPodium/LeaderboardPodium';
import LeaderboardFocusList from '../../Molecule/LeaderboardFocusList/LeaderboardFocusList';
import styles from './LeaderboardDrawer.module.scss';

/**
 * Mobile bottom-sheet store-level leaderboard.
 * Opens when the header rank pill is tapped.
 * Shows stores ranked by achievement %.
 */
export default function LeaderboardDrawer({ open, onClose, myRank }) {
  if (!myRank) return null;

  const unitLabel = myRank.unitLabel || 'achievement';
  const scopeNote = myRank.scopeNote || myRank.scope;
  const isStoreScope = myRank.scope === 'stores';

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      placement="bottom"
      title={isStoreScope ? `Your store is #${myRank.rank}` : `#${myRank.rank}`}
      subtitle={`Leaderboard \u00b7 ${scopeNote}`}
      icon={<Trophy size={16} strokeWidth={2.4} />}
    >
      <div className={styles.body}>
        <LeaderboardPodium entries={myRank.top} unitLabel={unitLabel} isStoreScope={isStoreScope} />

        <LeaderboardFocusList
          entries={myRank.top}
          selfRank={myRank.rank}
          unitLabel={unitLabel}
          isStoreScope={isStoreScope}
        />
      </div>
    </Drawer>
  );
}
