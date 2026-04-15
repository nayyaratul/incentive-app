import React from 'react';
import { Medal } from 'lucide-react';
import styles from './LeaderboardPodium.module.scss';

function formatEarn(val, unitLabel) {
  if (unitLabel === 'pieces' || unitLabel === 'units') return `${val}`;
  return `₹${val.toLocaleString('en-IN')}`;
}

function initials(name) {
  return (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

// Classic podium layout: second place on the left, winner centre, third right.
const PODIUM_ORDER = [2, 1, 3];

export default function LeaderboardPodium({ entries, unitLabel = 'earned' }) {
  if (!Array.isArray(entries) || entries.length === 0) return null;

  const byRank = new Map(entries.map((e) => [e.rank, e]));
  const podium = PODIUM_ORDER.map((rank) => byRank.get(rank)).filter(Boolean);

  if (podium.length === 0) return null;

  return (
    <div className={styles.podium} role="group" aria-label="Top 3 on the leaderboard">
      {podium.map((entry) => {
        const tier = entry.rank === 1 ? 'gold' : entry.rank === 2 ? 'silver' : 'bronze';
        const order = PODIUM_ORDER.indexOf(entry.rank); // 0, 1, 2 → stagger
        return (
          <div
            key={entry.rank}
            className={`${styles.tile} ${styles[`tier_${tier}`]} ${entry.isSelf ? styles.self : ''}`}
            style={{ '--stagger-delay': `${order * 60}ms` }}
          >
            <div className={styles.medalWrap}>
              <Medal size={20} strokeWidth={2.4} aria-hidden="true" />
              <span className={styles.rankBadge}>#{entry.rank}</span>
            </div>
            <div className={styles.avatar} aria-hidden="true">{initials(entry.name)}</div>
            <div className={styles.name} title={entry.name}>
              {entry.isSelf ? `${entry.name} (You)` : entry.name}
            </div>
            <div className={styles.earn}>{formatEarn(entry.earned, unitLabel)}</div>
            <div className={styles.plinth} aria-hidden="true" />
          </div>
        );
      })}
    </div>
  );
}
