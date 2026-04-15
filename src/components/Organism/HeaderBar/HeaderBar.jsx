import React from 'react';
import { LogOut, Trophy, Crown, Medal, TrendingUp } from 'lucide-react';
import { Heading, Text, Button } from '@/nexus/atoms';
import { useAuth } from '@/context/AuthContext';
import BrandLogo from '../../Atom/BrandLogo/BrandLogo';
import styles from './HeaderBar.module.scss';

const TIER_ICON = {
  gold:    Crown,
  silver:  Medal,
  bronze:  Medal,
  brand:   TrendingUp,
  default: Trophy,
};

export default function HeaderBar({ employeeName, rank, onOpenLeaderboard }) {
  const { logout, isAuthenticated } = useAuth();

  // Only render the pill when we have a real, positive rank.
  // F&L has no individual leaderboard (transformer returns myRank: null),
  // and a rank of 0 means the API didn't find the user in the peer set.
  const hasRank = typeof rank === 'number' && rank > 0;

  const rankTier =
    rank === 1 ? 'gold'
    : rank === 2 ? 'silver'
    : rank === 3 ? 'bronze'
    : rank <= 10 ? 'brand'
    : 'default';

  const TierIcon = TIER_ICON[rankTier];

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <BrandLogo variant="full" height={28} />
        {employeeName && (
          <div className={styles.greeting}>
            <Text variant="body" className={styles.namaste}>Hi</Text>
            <Heading level={2} className={styles.name}>{employeeName}</Heading>
          </div>
        )}
      </div>
      <div className={styles.actions}>
        {isAuthenticated && (
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            iconLeft={<LogOut size={14} strokeWidth={2.2} />}
            onClick={logout}
            aria-label="Log out"
          />
        )}
        {hasRank && onOpenLeaderboard && (
          <button
            type="button"
            className={styles.leaderboardPill}
            data-rank-tier={rankTier}
            onClick={onOpenLeaderboard}
            aria-label={`Rank ${rank} — tap to see leaderboard`}
          >
            <span className={styles.pillShine} aria-hidden="true" />
            <span className={styles.pillIcon} aria-hidden="true">
              <TierIcon size={15} strokeWidth={2.2} />
            </span>
            <span className={styles.leaderboardLabel}>
              <span className={styles.hash} aria-hidden="true">#</span>
              <span className={styles.num}>{rank}</span>
            </span>
          </button>
        )}
      </div>
    </header>
  );
}
