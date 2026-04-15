import React from 'react';
import { Users, Sparkles } from 'lucide-react';
import { Text } from '@/nexus/atoms';
import { Card } from '@/nexus/molecules';
import styles from './StoreBoostCard.module.scss';
import { formatINR } from '../../../utils/format';

function formatCr(rupees) {
  if (rupees >= 1e7) return `\u20B9${(rupees / 1e7).toFixed(2)} Cr`;
  if (rupees >= 1e5) return `\u20B9${(rupees / 1e5).toFixed(2)} L`;
  return formatINR(rupees);
}

export default function StoreBoostCard({ storeBoost }) {
  const { storeName, period, target, achieved, pct, tiers } = storeBoost;

  // Derive current + next tier from the ladder.
  const currentTier = [...tiers].reverse().find((t) => pct >= t.gate) || tiers[0];
  const currentIdx = tiers.indexOf(currentTier);
  const nextTier = tiers[currentIdx + 1] ?? null;

  const toNextPct = nextTier ? Math.max(0, nextTier.gate - pct) : 0;
  const toNextRupees = nextTier ? Math.max(0, nextTier.gate * target - achieved) : 0;
  const pctInt = Math.round(pct * 100);

  return (
    <Card as="article" variant="flat" className={styles.card}>
      <header className={styles.head}>
        <div className={styles.eyebrowWrap}>
          <span className={styles.icon}><Users size={11} strokeWidth={2.4} /></span>
          <Text as="span" variant="overline" className={styles.eyebrow}>
            Store boost &middot; {period}
          </Text>
        </div>
        <span className={styles.currentTier}>
          <span className={styles.multiplier}>{currentTier.multiplier.toFixed(1)}&times;</span>
          <Text as="span" variant="caption" className={styles.tierLabel}>
            {currentTier.label}
          </Text>
        </span>
      </header>

      <h3 className={styles.storeName}>{storeName}</h3>

      <div className={styles.headline}>
        <div className={styles.pctCol}>
          <span className={styles.pctValue}>{pctInt}<span className={styles.pctSign}>%</span></span>
          <Text as="span" variant="micro" className={styles.pctCaption}>of store target hit</Text>
        </div>
        <div className={styles.divider} aria-hidden="true" />
        <div className={styles.figCol}>
          <span className={styles.figValue}>{formatCr(achieved)}</span>
          <Text as="span" variant="caption" className={styles.figCaption}>
            of {formatCr(target)}
          </Text>
        </div>
      </div>

      {/* Tier ladder with tick marks at each gate */}
      <div className={styles.ladder} aria-hidden="true">
        <div className={styles.ladderTrack}>
          <div className={styles.ladderFill} style={{ width: `${Math.min(pctInt, 100)}%` }} />
          {tiers.map((t, i) => (
            <span
              key={t.gate}
              className={`${styles.tick} ${pct >= t.gate ? styles.tickHit : ''} ${i === currentIdx ? styles.tickCurrent : ''}`}
              style={{ left: `${t.gate * 100}%` }}
            >
              <span className={styles.tickMult}>{t.multiplier}&times;</span>
              <span className={styles.tickGate}>{Math.round(t.gate * 100)}%</span>
            </span>
          ))}
        </div>
      </div>

      {nextTier ? (
        <footer className={styles.footer}>
          <Sparkles size={12} strokeWidth={2.2} className={styles.sparkle} />
          <span>
            Clear <strong>{Math.round(nextTier.gate * 100)}%</strong>
            &nbsp;(<span className={styles.gap}>+{formatCr(toNextRupees)}</span> to go)
            &nbsp;&rarr; <strong className={styles.mult}>{nextTier.multiplier}&times;</strong> on your incentives
          </span>
        </footer>
      ) : (
        <footer className={styles.footer}>
          <Sparkles size={12} strokeWidth={2.2} className={styles.sparkle} />
          <span>Max tier locked in &mdash; full <strong className={styles.mult}>{currentTier.multiplier}&times;</strong> boost applies.</span>
        </footer>
      )}
    </Card>
  );
}
