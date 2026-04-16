import React from 'react';
import { Home, Users, BarChart3, Flag, Store, Receipt, Trophy } from 'lucide-react';
import cx from 'classnames';
import styles from './BottomNav.module.scss';

const NAV_SETS = {
  EMPLOYEE: [
    { id: 'home',    label: 'Home',    Icon: Home },
    { id: 'history', label: 'History', Icon: BarChart3 },
  ],
  BA: [
    { id: 'home',    label: 'Home',    Icon: Home },
  ],
  SM: [
    { id: 'home',  label: 'Home',  Icon: Home },
    { id: 'team',  label: 'Team',  Icon: Users },
    { id: 'board', label: 'Leaderboard', Icon: Trophy },
    { id: 'tx',    label: 'Transactions', Icon: Receipt },
  ],
  CENTRAL: [
    { id: 'home',   label: 'Overview', Icon: Home },
    { id: 'stores', label: 'Stores',   Icon: Store },
    { id: 'alerts', label: 'Alerts',   Icon: Flag },
  ],
};

export function navSetFor(role) {
  if (role === 'SM' || role === 'DM') return NAV_SETS.SM;
  if (role === 'BA') return NAV_SETS.BA;
  if (role === 'CENTRAL') return NAV_SETS.CENTRAL;
  return NAV_SETS.EMPLOYEE;
}

export default function BottomNav({ active = 'home', role = 'SA', onNavigate }) {
  const items = navSetFor(role);

  return (
    <nav className={styles.nav} aria-label="Primary">
      <div className={styles.items}>
        {items.map(({ id, label, Icon }) => {
          const isActive = id === active;
          return (
            <button
              key={id}
              type="button"
              className={cx(styles.item, isActive && styles.active)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
              onClick={() => onNavigate && onNavigate(id)}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} aria-hidden="true" />
              <span className={styles.label}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
