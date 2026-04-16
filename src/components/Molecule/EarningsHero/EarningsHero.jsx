import React from 'react';
import { Zap, Target, Lock, TrendingUp } from 'lucide-react';
import HeroCard from '../HeroCard/HeroCard';
import { formatINR } from '../../../utils/format';
import styles from './EarningsHero.module.scss';

function formatNum(n) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
}

/* Next milestone thresholds — brief-aligned tier boundaries */
const TIER_GATES = [
  { pct: 85,  label: '50% payout',     color: '#10B981' },
  { pct: 90,  label: '80% payout',     color: '#F59E0B' },
  { pct: 100, label: 'Full payout',    color: '#3B82F6' },
  { pct: 110, label: '110% bonus',     color: '#8B5CF6' },
  { pct: 120, label: 'Legendary tier', color: '#EF4444' },
];

function nextMilestone(currentPct) {
  return TIER_GATES.find((g) => currentPct < g.pct) || null;
}

/**
 * Electronics SA hero — individual ₹ earned this month, with a monthly-goal
 * progress bar + motivational milestone countdown. Uses the shared HeroCard shell.
 *
 * Zero-state: When earned = ₹0 but potential > 0, the hero shows context about
 * WHY it's zero (department below threshold) and what the SA would earn if the
 * multiplier unlocked. This turns a confusing blank into a motivational nudge.
 */
export default function EarningsHero({
  thisMonth,
  today,
  goal,
  milestones,
  potential,
  achievementPct: deptAchPct,
  multiplierPct,
  apiTiers,
}) {
  const pct = Math.round(goal.pct * 100);
  const remaining = Math.max(0, goal.target - thisMonth.amount);
  const next = nextMilestone(pct);

  /* Count crossed milestones for the subtle counter */
  const crossedCount = milestones ? milestones.filter((m) => m.crossed).length : 0;

  /* Zero-state detection: earned is 0 but there's a potential amount */
  const isZeroState = thisMonth.amount === 0 && (potential > 0 || deptAchPct > 0);

  /* Find the first unlockable tier from API tiers */
  const firstUnlockTier = (apiTiers ?? []).find((t) => t.multiplierPct > 0);
  const unlockThreshold = firstUnlockTier?.from ?? 85;
  const gapToUnlock = Math.max(0, unlockThreshold - (deptAchPct || 0));

  return (
    <HeroCard ornament={isZeroState ? 'PAYOUT · LOCKED · KEEP PUSHING ·' : 'EARNINGS · MONTH · LIVE ·'}>
      <HeroCard.EyebrowRow>
        <HeroCard.Eyebrow withDot>{isZeroState ? 'Earned this month' : 'Earned this month'}</HeroCard.Eyebrow>
        {today.amount > 0 && (
          <HeroCard.TrendPill>+{formatINR(today.amount)} today</HeroCard.TrendPill>
        )}
      </HeroCard.EyebrowRow>

      <HeroCard.Amount prefix="₹">{formatNum(thisMonth.amount)}</HeroCard.Amount>

      {/* ── Zero-state explainer ── */}
      {isZeroState && (
        <div className={styles.zeroExplainer}>
          <div className={styles.zeroReason}>
            <Lock size={13} strokeWidth={2.4} />
            <span>
              Dept. at <strong>{deptAchPct}%</strong> — needs <strong>{unlockThreshold}%</strong> to unlock payout
            </span>
          </div>
          {potential > 0 && (
            <div className={styles.zeroPotential}>
              <TrendingUp size={12} strokeWidth={2.2} />
              <span>
                Potential earnings: <strong>₹{formatNum(potential)}</strong>
              </span>
            </div>
          )}
          {gapToUnlock > 0 && (
            <div className={styles.zeroNudge}>
              Push <strong>{gapToUnlock.toFixed(1)}%</strong> more dept. sales to start earning
            </div>
          )}
        </div>
      )}

      {/* ── Normal state captions ── */}
      {!isZeroState && (
        <HeroCard.Caption>
          <strong>{deptAchPct || 0}%</strong>
          <span>· dept achievement ·</span>
          {multiplierPct > 0
            ? <em>{multiplierPct}% multiplier active</em>
            : <em>{formatINR(remaining)} to go</em>}
        </HeroCard.Caption>
      )}

      {/* ── Potential row when earning but multiplier < 100% ── */}
      {!isZeroState && potential > 0 && multiplierPct > 0 && multiplierPct < 100 && (
        <div className={styles.potentialRow}>
          <span className={styles.potentialLabel}>Potential at 100%</span>
          <span className={styles.potentialValue}>₹{formatNum(potential)}</span>
        </div>
      )}

      <HeroCard.Progress
        pct={Math.round(((deptAchPct || 0) / 120) * 100)}
        scale={['0%', '85%', '100%', '120%']}
      />

      {/* Milestone countdown nudge */}
      {next && !isZeroState && (
        <div className={styles.milestone}>
          <div className={styles.milestoneIcon} style={{ '--ms-color': next.color }}>
            <Target size={13} strokeWidth={2.6} />
          </div>
          <div className={styles.milestoneText}>
            <span className={styles.milestoneAmount}>
              {formatINR(Math.round(goal.target * (next.pct / 100) - thisMonth.amount))}
            </span>
            <span className={styles.milestoneLabel}> away from </span>
            <span className={styles.milestoneName} style={{ color: next.color }}>
              {next.label}
            </span>
          </div>
          <div className={styles.milestonePct}>{next.pct}%</div>
        </div>
      )}

      {/* Zero-state unlock tier preview */}
      {isZeroState && firstUnlockTier && (
        <div className={styles.milestone}>
          <div className={styles.milestoneIcon} style={{ '--ms-color': '#10B981' }}>
            <Target size={13} strokeWidth={2.6} />
          </div>
          <div className={styles.milestoneText}>
            <span className={styles.milestoneLabel}>At {unlockThreshold}% → </span>
            <span className={styles.milestoneAmount}>
              ₹{formatNum(firstUnlockTier.incentiveAtTier ?? Math.round(potential * firstUnlockTier.multiplierPct / 100))}
            </span>
            <span className={styles.milestoneLabel}> earned</span>
          </div>
          <div className={styles.milestonePct}>{firstUnlockTier.multiplierPct}%</div>
        </div>
      )}

      {/* Milestone dots */}
      {milestones && milestones.length > 0 && !isZeroState && (
        <div className={styles.milestoneDots}>
          <Zap size={10} strokeWidth={2.6} className={styles.milestoneDotsIcon} />
          {milestones.map((m) => (
            <span
              key={m.id}
              className={`${styles.dot} ${m.crossed ? styles.dotCrossed : ''}`}
              title={m.label}
            />
          ))}
          <span className={styles.milestoneDotsLabel}>
            {crossedCount}/{milestones.length} milestones
          </span>
        </div>
      )}
    </HeroCard>
  );
}
