import React from 'react';
import { LogOut, Trophy, Sun, Moon } from 'lucide-react';
import cx from 'classnames';
import { Heading, Text, Button, Badge, Switch } from '@/nexus/atoms';
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
        <div className={styles.topRight}>
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
          {typeof rank === 'number' && (
            <button
              type="button"
              className={styles.rankChip}
              onClick={onOpenLeaderboard}
              aria-label={`Rank ${rank} — tap to see leaderboard`}
            >
              <Trophy size={12} strokeWidth={2.6} aria-hidden="true" />
              <span className={styles.rankText}>#{rank}</span>
            </button>
          )}
        </div>
      </div>

      {employeeName && (
        <div className={styles.greetingRow}>
          <div className={styles.greeting}>
            <Text variant="body" className={styles.namaste}>Namaste,</Text>
            <Heading level={2} className={styles.name}>{employeeName}</Heading>
          </div>
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
      )}
    </header>
  );
}
