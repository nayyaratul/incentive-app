import React from 'react';
import { Home, Users, ClipboardList, BarChart3, Flag, Store, Receipt } from 'lucide-react';
import styles from './BottomNav.module.scss';

// Persona-specific nav sets. Kept ≤ 4 items for clarity on mobile.
const NAV_SETS = {
  EMPLOYEE: [
    { id: 'home',    label: 'Home',    Icon: Home },
    { id: 'rules',   label: 'Rules',   Icon: ClipboardList },
    { id: 'history', label: 'History', Icon: BarChart3 },
  ],
  BA: [
    { id: 'home',    label: 'Home',    Icon: Home },
    { id: 'rules',   label: 'Rules',   Icon: ClipboardList },
  ],
  SM: [
    { id: 'home',  label: 'Home',  Icon: Home },
    { id: 'team',  label: 'Team',  Icon: Users },
    { id: 'rules', label: 'Rules', Icon: ClipboardList },
    { id: 'tx',    label: 'Transactions', Icon: Receipt },
  ],
  CENTRAL: [
    { id: 'home',   label: 'Overview', Icon: Home },
    { id: 'stores', label: 'Stores',   Icon: Store },
    { id: 'rules',  label: 'Rules',    Icon: ClipboardList },
    { id: 'alerts', label: 'Alerts',   Icon: Flag },
  ],
};

export function navSetFor(role) {
  if (role === 'SM') return NAV_SETS.SM;
  if (role === 'BA') return NAV_SETS.BA;
  if (role === 'CENTRAL') return NAV_SETS.CENTRAL;
  return NAV_SETS.EMPLOYEE; // SA / DM default
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
              className={`${styles.item} ${isActive ? styles.active : ''}`}
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
