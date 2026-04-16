import React from 'react';
import { LogOut, Trophy, Crown, TrendingUp, Sun, Moon } from 'lucide-react';
import { Heading, Text, Button } from '@/nexus/atoms';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import BrandLogo from '../../Atom/BrandLogo/BrandLogo';
import styles from './HeaderBar.module.scss';

const TIER_ICON = {
  gold:    Crown,
  silver:  Trophy,
  bronze:  Trophy,
  brand:   TrendingUp,
  default: Trophy,
};

export default function HeaderBar() {
  const { logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <BrandLogo variant="full" height={28} />
        <div className={styles.topActions}>
          <button
            type="button"
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light'
              ? <Moon size={16} strokeWidth={2} />
              : <Sun size={16} strokeWidth={2} />}
          </button>
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
        </div>
      </div>
    </header>
  );
}

export function HeaderGreeting({ employeeName, storeName, rank, deltaRank, onOpenLeaderboard }) {
  if (!employeeName) return null;

  const hasRank = typeof rank === 'number' && rank > 0;

  const rankTier =
    rank === 1 ? 'gold'
    : rank === 2 ? 'silver'
    : rank === 3 ? 'bronze'
    : rank <= 10 ? 'brand'
    : 'default';

  const TierIcon = TIER_ICON[rankTier] || Trophy;

  return (
    <div className={styles.bottomRow}>
      <div className={styles.greeting}>
        <div className={styles.nameRow}>
          <Text variant="body" className={styles.namaste}>Hi</Text>
          <Heading level={2} className={styles.name}>{employeeName}</Heading>
        </div>
        {storeName && <Text variant="caption" className={styles.storeName}>{storeName}</Text>}
      </div>

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
          {typeof deltaRank === 'number' && deltaRank > 0 && (
            <span className={styles.rankDelta} aria-label={`Up ${deltaRank} positions`}>
              <TrendingUp size={10} strokeWidth={2.8} />
              <span>{deltaRank}</span>
            </span>
          )}
        </button>
      )}
    </div>
  );
}
