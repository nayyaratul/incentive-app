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

export default function BottomNav({ active = 'home' }) {
  return (
    <nav className={styles.nav}>
      {NAV_ITEMS.map(({ id, label, Icon }) => {
        const isActive = id === active;
        return (
          <button
            key={id}
            className={`${styles.item} ${isActive ? styles.active : ''}`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
            <span className={styles.label}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
