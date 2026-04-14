import React from 'react';
import { LogOut } from 'lucide-react';
import styles from './HeaderBar.module.scss';
import BrandLogo from '../../Atom/BrandLogo/BrandLogo';
import HeaderRankChip from '../../Atom/HeaderRankChip/HeaderRankChip';
import { useAuth } from '../../../context/AuthContext';

export default function HeaderBar({ employeeName, rank, onOpenLeaderboard }) {
  const { logout, isAuthenticated } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.brandStrip} aria-hidden="true" />

      <div className={styles.top}>
        <BrandLogo variant="full" height={28} />
        <div className={styles.topRight}>
          {typeof rank === 'number' && (
            <HeaderRankChip rank={rank} onOpen={onOpenLeaderboard} />
          )}
          {isAuthenticated && (
            <button type="button" className={styles.logout} onClick={logout} aria-label="Log out">
              <LogOut size={16} strokeWidth={2.2} />
            </button>
          )}
        </div>
      </div>

      {employeeName && (
        <div className={styles.greeting}>
          <span className={styles.namaste}>Namaste,</span>
          <span className={styles.name}>{employeeName}</span>
          <span className={styles.period}>.</span>
        </div>
      )}
    </header>
  );
}
