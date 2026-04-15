import React from 'react';
import { Crown, Trophy } from 'lucide-react';
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

// Requested visual order: #2 left, #1 center, #3 right.
const PODIUM_ORDER = [2, 1, 3];

export default function LeaderboardPodium({ entries, unitLabel = 'earned' }) {
  if (!Array.isArray(entries) || entries.length === 0) return null;

  const byRank = new Map(entries.map((e) => [e.rank, e]));
  const podium = PODIUM_ORDER.map((rank) => byRank.get(rank)).filter(Boolean);

  if (podium.length === 0) return null;

  return (
    <div className={styles.stageWrap} role="group" aria-label="Top 3 on the leaderboard">
      <div className={styles.stageGlow} aria-hidden="true" />
      <div className={styles.stage} aria-hidden="true" />
      <div className={styles.podium}>
        {podium.map((entry) => {
          const tier = entry.rank === 1 ? 'gold' : entry.rank === 2 ? 'silver' : 'bronze';
          const order = PODIUM_ORDER.indexOf(entry.rank); // 0, 1, 2 → stagger
          return (
            <div
              key={entry.rank}
              className={`${styles.tile} ${styles[`tier_${tier}`]} ${entry.isSelf ? styles.self : ''}`}
              data-rank={entry.rank}
              style={{ '--stagger-delay': `${order * 70}ms` }}
            >
              <div className={styles.avatarWrap}>
                {entry.rank === 1 && (
                  <div className={styles.crown} aria-hidden="true">
                    <Crown size={14} strokeWidth={2.5} />
                  </div>
                )}
                <div className={styles.avatar} aria-hidden="true">
                  {initials(entry.name)}
                </div>
              </div>

              <div className={styles.metaBlock}>
                <span className={styles.rankGhost} aria-hidden="true">
                  {entry.rank}
                </span>
                <div className={styles.name} title={entry.name}>
                  {entry.isSelf ? `${entry.name} (You)` : entry.name}
                </div>
                <div className={styles.earn}>{formatEarn(entry.earned, unitLabel)}</div>
              </div>

              <div className={styles.plinth} aria-hidden="true">
                <div className={styles.medalWrap}>
                  <Trophy size={17} strokeWidth={2.4} aria-hidden="true" />
                  <span className={styles.rankBadge}>Rank {entry.rank}</span>
                </div>
              </div>
              {entry.rank === 1 && <div className={styles.championShine} aria-hidden="true" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
