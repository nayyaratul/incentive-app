import React from 'react';
import { Award } from 'lucide-react';
import { Card } from '@/nexus/molecules';
import { ProgressBar, Text } from '@/nexus/atoms';
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
    <Card as="article" variant="outlined" size="md">
      <Card.Header>
        <div className={styles.head}>
          <Card.Eyebrow className={styles.eyebrow}>
            <Award size={12} strokeWidth={2.4} className={styles.iconBrand} />
            Your level
          </Card.Eyebrow>
          <Text variant="micro" as="span" weight="semibold" color="var(--color-text-primary)" className={styles.clamp}>
            {clamped}%
          </Text>
        </div>
      </Card.Header>

      <Card.Body>
        <div className={styles.bodyGrid}>
          <div className={styles.medallion} style={{ background: current.gradient }} aria-hidden="true">
            <span>{current.label[0]}</span>
          </div>
          <div className={styles.meta}>
            <span className={styles.tierName}>{current.label}</span>
            <Text variant="caption" size="sm" color="var(--color-text-secondary)" className={styles.caption}>
              {next ? (
                <>Earn <strong className={styles.captionStrong}>{formatINR(toNext)}</strong> more → <span className={styles.nextTier}>{next.label}</span></>
              ) : (
                <>Top tier reached — you&apos;ve maxed this month.</>
              )}
            </Text>
          </div>
        </div>

        <ProgressBar
          value={clamped}
          max={100}
          size="md"
          variant="default"
          className={styles.track}
          style={{ '--progress-fill-bg': current.gradient }}
        />

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
      </Card.Body>
    </Card>
  );
}
