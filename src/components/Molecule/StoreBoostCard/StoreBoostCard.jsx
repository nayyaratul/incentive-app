import React from 'react';
import { Users, Sparkles } from 'lucide-react';
import styles from './StoreBoostCard.module.scss';
import { formatINR } from '../../../utils/format';

function formatCr(rupees) {
  if (rupees >= 1e7) return `₹${(rupees / 1e7).toFixed(2)} Cr`;
  if (rupees >= 1e5) return `₹${(rupees / 1e5).toFixed(2)} L`;
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
    <article className={styles.card}>
      <header className={styles.head}>
        <div className={styles.eyebrowWrap}>
          <span className={styles.icon}><Users size={11} strokeWidth={2.4} /></span>
          <span className={styles.eyebrow}>Store boost · {period}</span>
        </div>
        <span className={styles.currentTier}>
          <span className={styles.multiplier}>{currentTier.multiplier.toFixed(1)}×</span>
          <span className={styles.tierLabel}>{currentTier.label}</span>
        </span>
      </header>

      <h3 className={styles.storeName}>{storeName}</h3>

      <div className={styles.headline}>
        <div className={styles.pctCol}>
          <span className={styles.pctValue}>{pctInt}<span className={styles.pctSign}>%</span></span>
          <span className={styles.pctCaption}>of store target hit</span>
        </div>
        <div className={styles.divider} aria-hidden="true" />
        <div className={styles.figCol}>
          <span className={styles.figValue}>{formatCr(achieved)}</span>
          <span className={styles.figCaption}>of {formatCr(target)}</span>
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
              <span className={styles.tickMult}>{t.multiplier}×</span>
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
            &nbsp;→ <strong className={styles.mult}>{nextTier.multiplier}×</strong> on your incentives
          </span>
        </footer>
      ) : (
        <footer className={styles.footer}>
          <Sparkles size={12} strokeWidth={2.2} className={styles.sparkle} />
          <span>Max tier locked in — full <strong className={styles.mult}>{currentTier.multiplier}×</strong> boost applies.</span>
        </footer>
      )}
    </article>
  );
}
