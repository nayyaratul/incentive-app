import React from 'react';
import { LogOut, Trophy, Sun, Moon } from 'lucide-react';
import { Heading, Text, Button, Switch } from '@/nexus/atoms';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import BrandLogo from '../../Atom/BrandLogo/BrandLogo';
import styles from './HeaderBar.module.scss';

export default function HeaderBar({ employeeName, rank, onOpenLeaderboard }) {
  const { logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
                onClick={onOpenLeaderboard}
                aria-label={
                  typeof rank === 'number'
                    ? `Rank ${rank} — tap to see leaderboard`
                    : 'Open leaderboard'
                }
              >
                <Trophy size={14} strokeWidth={2.4} aria-hidden="true" />
                <span className={styles.leaderboardLabel}>
                  {typeof rank === 'number' ? `#${rank}` : 'Leaderboard'}
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
