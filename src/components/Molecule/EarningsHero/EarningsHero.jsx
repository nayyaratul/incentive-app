import React from 'react';
import { Zap, Target } from 'lucide-react';
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
 */
export default function EarningsHero({ thisMonth, today, goal, milestones }) {
  const pct = Math.round(goal.pct * 100);
  const remaining = Math.max(0, goal.target - thisMonth.amount);
  const next = nextMilestone(pct);

  /* Count crossed milestones for the subtle counter */
  const crossedCount = milestones ? milestones.filter((m) => m.crossed).length : 0;

  return (
    <HeroCard ornament="EARNINGS · MONTH · LIVE ·">
      <HeroCard.EyebrowRow>
        <HeroCard.Eyebrow withDot>Earned this month</HeroCard.Eyebrow>
        <HeroCard.TrendPill>+{formatINR(today.amount)} today</HeroCard.TrendPill>
      </HeroCard.EyebrowRow>

      <HeroCard.Amount prefix="₹">{formatNum(thisMonth.amount)}</HeroCard.Amount>

      <HeroCard.Caption>
        <strong>{pct}%</strong>
        <span>· of monthly goal ·</span>
        <em>{formatINR(remaining)} to go</em>
      </HeroCard.Caption>

      <HeroCard.Progress
        pct={pct}
        scale={[
          '0',
          formatINR(goal.target / 4),
          formatINR(goal.target / 2),
          formatINR((goal.target * 3) / 4),
          formatINR(goal.target),
        ]}
      />

      {/* Milestone countdown nudge */}
      {next && (
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

      {/* Milestone dots */}
      {milestones && milestones.length > 0 && (
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
