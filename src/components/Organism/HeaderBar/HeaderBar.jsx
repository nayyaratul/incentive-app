import React from 'react';
import { LogOut, Trophy, Crown, Medal, TrendingUp, Sun, Moon } from 'lucide-react';
import { Heading, Text, Button, Switch } from '@/nexus/atoms';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
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
  const { theme, toggleTheme } = useTheme();

  const rankTier =
    typeof rank !== 'number'
      ? 'default'
      : rank === 1 ? 'gold'
      : rank === 2 ? 'silver'
      : rank === 3 ? 'bronze'
      : rank <= 10 ? 'brand'
      : 'default';

  const TierIcon = TIER_ICON[rankTier];

  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <BrandLogo variant="full" height={28} />
        <div className={styles.themeToggle}>
          <Sun size={14} />
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={toggleTheme}
            size="sm"
            aria-label="Toggle dark mode"
          />
          <Moon size={14} />
        </div>
      </div>

      {employeeName && (
        <div className={styles.greetingRow}>
          <div className={styles.greeting}>
            <Text variant="body" className={styles.namaste}>Namaste,</Text>
            <Heading level={2} className={styles.name}>{employeeName}</Heading>
          </div>
          <div className={styles.actions}>
            {onOpenLeaderboard && (
              <button
                type="button"
                className={styles.leaderboardPill}
                data-rank-tier={rankTier}
                onClick={onOpenLeaderboard}
                aria-label={
                  typeof rank === 'number'
                    ? `Rank ${rank} — tap to see leaderboard`
                    : 'Open leaderboard'
                }
              >
                <span className={styles.pillShine} aria-hidden="true" />
                <span className={styles.pillIcon} aria-hidden="true">
                  <TierIcon size={15} strokeWidth={2.2} />
                </span>
                <span className={styles.leaderboardLabel}>
                  {typeof rank === 'number' ? (
                    <>
                      <span className={styles.hash} aria-hidden="true">#</span>
                      <span className={styles.num}>{rank}</span>
                    </>
                  ) : (
                    'Leaderboard'
                  )}
                </span>
              </button>
            )}
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
      )}
    </header>
  );
}
