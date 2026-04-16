import React from 'react';
import { CalendarDays, TrendingUp, TrendingDown } from 'lucide-react';
import styles from './MomentumPills.module.scss';

/**
 * Payout countdown card — compact single-row widget combining:
 *  - Days-to-payout with the target date (DD-MM-YY)
 *  - Cycle progress bar (monthly for Electronics/Grocery, weekly for F&L)
 *  - Vs-last-period momentum delta
 */
export default function MomentumPills({
  thisPeriodAmount,
  lastPeriodAmount,
  lastPeriodLabel = 'last month',
  nextPayoutDate,
  payoutAsOf = new Date().toISOString().slice(0, 10),
}) {
  const days = daysBetween(payoutAsOf, nextPayoutDate);
  const showCountdown = typeof days === 'number' && days >= 0;

  const showMomentum =
    typeof thisPeriodAmount === 'number' &&
    typeof lastPeriodAmount === 'number' &&
    lastPeriodAmount > 0;
  let momentumKind = 'flat';
  let pctDelta = 0;
  if (showMomentum) {
    pctDelta = ((thisPeriodAmount - lastPeriodAmount) / lastPeriodAmount) * 100;
    momentumKind = pctDelta > 1 ? 'up' : pctDelta < -1 ? 'down' : 'flat';
  }

  if (!showCountdown && !showMomentum) return null;

  return (
    <div className={styles.row}>
      {showCountdown && (
        <div className={styles.card}>
          <div className={styles.body}>
            <div className={styles.countdown}>
              <CalendarDays size={12} strokeWidth={2.2} className={styles.iconMuted} />
              <span className={styles.label}>Payout in</span>
              <span className={styles.days}>{days === 0 ? 'today' : `${days}d`}</span>
            </div>
          </div>
        </div>
      )}

      {showMomentum && (
        <div className={`${styles.card} ${styles[`tone-${momentumKind}`]}`}>
          <div className={styles.body}>
            <div className={styles.momentum}>
              <div className={styles.deltaRow}>
                {momentumKind === 'up' && <TrendingUp size={14} strokeWidth={2.4} />}
                {momentumKind === 'down' && <TrendingDown size={14} strokeWidth={2.4} />}
                {momentumKind === 'flat' && (
                  <TrendingUp size={14} strokeWidth={2.4} className={styles.iconMuted} />
                )}
                <span className={styles.deltaPct}>
                  {momentumKind === 'up' ? '+' : ''}
                  {pctDelta.toFixed(0)}%
                </span>
              </div>
              <span className={styles.deltaLabel}>vs {lastPeriodLabel}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function daysBetween(from, to) {
  if (!from || !to) return null;
  const ms = new Date(to).getTime() - new Date(from).getTime();
  if (Number.isNaN(ms)) return null;
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}
