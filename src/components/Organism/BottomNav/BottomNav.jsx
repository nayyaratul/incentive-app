import React from 'react';
import { Home, Trophy, ClipboardList, BarChart3, User } from 'lucide-react';
import styles from './BottomNav.module.scss';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'ranks', label: 'Ranks', Icon: Trophy },
  { id: 'rules', label: 'Rules', Icon: ClipboardList },
  { id: 'history', label: 'History', Icon: BarChart3 },
  { id: 'me', label: 'Me', Icon: User },
];

export default function BottomNav({ active = 'home', employeeInitial = 'R' }) {
  return (
    <nav className={styles.nav} aria-label="Primary">
      {/* Only visible on sidebar variant (desktop) */}
      <div className={styles.brandMark} aria-hidden="true">◆</div>

      <div className={styles.items}>
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = id === active;
          return (
            <button
              key={id}
              type="button"
              className={`${styles.item} ${isActive ? styles.active : ''}`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} aria-hidden="true" />
              <span className={styles.label}>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Only visible on sidebar variant (desktop) */}
      <div className={styles.footer} aria-hidden="true">{employeeInitial}</div>
    </nav>
  );
}
