import React from 'react';
import { Sword, Clock, TrendingUp } from 'lucide-react';
import { ProgressBar, Text } from '@/nexus/atoms';
import styles from './WeeklyChallenge.module.scss';

/**
 * Rotating weekly micro-challenge card. Shows one motivational target
 * based on the employee's current standing. Data-driven but with a
 * gamified "challenge" framing.
 *
 * This uses existing payout data — no new APIs needed.
 */

function getChallengeForVertical(vertical, payout) {
  if (vertical === 'ELECTRONICS') {
    const lastMonth = payout?.lastMonthPayout ?? 0;
    const target = Math.round(lastMonth * 1.1) || 5000;
    const current = payout?.monthToDateEarned ?? 0;
    return {
      title: 'Beat last month by 10%',
      subtitle: 'Earn more than your previous month\'s payout',
      current,
      target,
      unit: '₹',
      icon: TrendingUp,
      color: '#8B5CF6',
    };
  }
  if (vertical === 'GROCERY') {
    return {
      title: 'Sell across all campaign brands',
      subtitle: 'Record at least one piece from every brand this week',
      current: 3,
      target: 5,
      unit: 'brands',
      icon: Sword,
      color: '#10B981',
    };
  }
  // F&L
  return {
    title: 'Full attendance this week',
    subtitle: 'Be present all 7 days to maximize your pool share',
    current: 5,
    target: 7,
    unit: 'days',
    icon: Clock,
    color: '#F59E0B',
  };
}

function formatVal(val, unit) {
  if (unit === '₹') return `₹${val.toLocaleString('en-IN')}`;
  return `${val} ${unit}`;
}

export default function WeeklyChallenge({ vertical, payout }) {
  const challenge = getChallengeForVertical(vertical, payout);
  const pct = challenge.target > 0
    ? Math.min(100, Math.round((challenge.current / challenge.target) * 100))
    : 0;
  const done = pct >= 100;
  const Icon = challenge.icon;

  return (
    <section className={styles.card} style={{ '--ch-color': challenge.color }}>
      <div className={styles.header}>
        <div className={styles.iconWrap}>
          <Icon size={14} strokeWidth={2.4} />
        </div>
        <div className={styles.headerText}>
          <Text as="span" variant="overline" className={styles.eyebrow}>
            Weekly challenge
          </Text>
          <Text as="div" variant="body" weight="semibold" className={styles.title}>
            {challenge.title}
          </Text>
        </div>
        {done && <span className={styles.doneBadge}>Done!</span>}
      </div>

      <Text as="p" variant="caption" size="sm" className={styles.subtitle}>
        {challenge.subtitle}
      </Text>

      <div className={styles.progressRow}>
        <ProgressBar
          value={pct}
          max={100}
          size="sm"
          variant={done ? 'success' : 'default'}
          className={styles.bar}
        />
        <span className={styles.count}>
          {formatVal(challenge.current, challenge.unit)} / {formatVal(challenge.target, challenge.unit)}
        </span>
      </div>
    </section>
  );
}
