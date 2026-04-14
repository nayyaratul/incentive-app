import React from 'react';
import { CalendarDays, TrendingUp, TrendingDown } from 'lucide-react';
import styles from './MomentumPills.module.scss';

/**
 * Two compact pills sitting side-by-side under the earnings hero:
 *  • Days-to-payout countdown (brief §6.3 — Electronics paid following month
 *    with salary; Grocery after campaign close; F&L after week close)
 *  • Vs-last momentum (this period payout vs the equivalent last period)
 *
 * Both inputs derive from data already required by the brief; no invented
 * thresholds or rewards.
 */
export default function MomentumPills({
  thisPeriodAmount,
  lastPeriodAmount,
  lastPeriodLabel = 'last month',
  nextPayoutDate,
  payoutAsOf = '2026-04-13',
}) {
  const days = daysBetween(payoutAsOf, nextPayoutDate);
  const showCountdown = typeof days === 'number' && days >= 0;

  const showMomentum = typeof thisPeriodAmount === 'number';
  let momentumKind = 'flat';
  let pctDelta = 0;
  if (showMomentum && lastPeriodAmount === 0) {
    momentumKind = 'first';
  } else if (showMomentum && typeof lastPeriodAmount === 'number') {
    pctDelta = ((thisPeriodAmount - lastPeriodAmount) / lastPeriodAmount) * 100;
    momentumKind = pctDelta > 1 ? 'up' : pctDelta < -1 ? 'down' : 'flat';
  }

  if (!showCountdown && !showMomentum) return null;

  return (
    <div className={styles.row}>
      {showCountdown && (
        <span className={styles.pill}>
          <CalendarDays size={12} strokeWidth={2.4} className={styles.iconMuted} />
          <span className={styles.label}>Payout in</span>
          <span className={styles.value}>{days === 0 ? 'today' : `${days}d`}</span>
        </span>
      )}

      {showMomentum && (
        <span className={`${styles.pill} ${styles[`mom-${momentumKind}`]}`}>
          {momentumKind === 'up'   && <TrendingUp size={12} strokeWidth={2.4} />}
          {momentumKind === 'down' && <TrendingDown size={12} strokeWidth={2.4} />}
          {momentumKind === 'flat' && <TrendingUp size={12} strokeWidth={2.4} className={styles.iconMuted} />}
          {momentumKind === 'first' ? (
            <span className={styles.value}>First period</span>
          ) : (
            <>
              <span className={styles.value}>
                {momentumKind === 'up' ? '+' : ''}
                {pctDelta.toFixed(0)}%
              </span>
              <span className={styles.label}>vs {lastPeriodLabel}</span>
            </>
          )}
        </span>
      )}
    </div>
  );
}

function daysBetween(from, to) {
  if (!from || !to) return null;
  const ms = new Date(to).getTime() - new Date(from).getTime();
  if (Number.isNaN(ms)) return null;
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}
