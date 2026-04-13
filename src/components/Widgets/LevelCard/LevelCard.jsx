import React from 'react';
import { Award } from 'lucide-react';
import styles from './LevelCard.module.scss';
import { LEVEL_TIERS, tierFor } from '../../../data/gamification';
import { formatINR } from '../../../utils/format';

export default function LevelCard({ mtdPayout }) {
  const current = tierFor(mtdPayout);
  const idx = LEVEL_TIERS.indexOf(current);
  const next = LEVEL_TIERS[idx + 1];

  const progressIntoTier = next
    ? ((mtdPayout - current.floor) / (current.ceiling - current.floor)) * 100
    : 100;
  const clamped = Math.max(0, Math.min(100, Math.round(progressIntoTier)));
  const toNext = next ? Math.max(0, next.floor - mtdPayout) : 0;

  return (
    <article className={styles.card}>
      <header className={styles.head}>
        <span className={styles.eyebrow}>
          <Award size={12} strokeWidth={2.4} />
          Your level
        </span>
        <span className={styles.clamp}>{clamped}%</span>
      </header>

      <div className={styles.body}>
        <div className={styles.medallion} style={{ background: current.gradient }} aria-hidden="true">
          <span>{current.label[0]}</span>
        </div>
        <div className={styles.meta}>
          <div className={styles.tierName}>{current.label}</div>
          <div className={styles.caption}>
            {next ? (
              <>Earn <strong>{formatINR(toNext)}</strong> more → <span className={styles.nextTier}>{next.label}</span></>
            ) : (
              <>Top tier reached — you've maxed this month.</>
            )}
          </div>
        </div>
      </div>

      <div className={styles.track} aria-hidden="true">
        <div className={styles.fill} style={{ width: `${clamped}%`, background: current.gradient }} />
      </div>

      <div className={styles.ladder} aria-hidden="true">
        {LEVEL_TIERS.map((t, i) => (
          <div
            key={t.id}
            className={`${styles.ladderRow} ${i === idx ? styles.ladderCurrent : ''} ${i < idx ? styles.ladderPast : ''}`}
          >
            <span className={styles.ladderName}>{t.label}</span>
            <span className={styles.ladderRange}>
              {formatINR(t.floor)}{t.ceiling !== Infinity ? ` – ${formatINR(t.ceiling)}` : '+'}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}
