import React from 'react';
import HeroCard from '../HeroCard/HeroCard';
import { formatINR } from '../../../utils/format';

function formatNum(n) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
}

/**
 * Electronics SA hero — individual ₹ earned this month, with a monthly-goal
 * progress bar. Uses the shared HeroCard shell.
 */
export default function EarningsHero({ thisMonth, today, goal }) {
  const pct = Math.round(goal.pct * 100);
  const remaining = Math.max(0, goal.target - thisMonth.amount);

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
    </HeroCard>
  );
}
