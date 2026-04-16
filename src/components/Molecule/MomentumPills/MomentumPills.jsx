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
  payoutAsOf = '2026-04-13',
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

  const cycleDays = estimateCycleDays(nextPayoutDate);
  const elapsed = cycleDays > 0 ? Math.max(0, cycleDays - (days || 0)) : 0;
  const progressPct = cycleDays > 0 ? Math.min(100, Math.round((elapsed / cycleDays) * 100)) : 0;

  return (
    <div className={styles.card}>
      <div className={styles.body}>
        {showCountdown && (
          <div className={styles.countdown}>
            <CalendarDays size={12} strokeWidth={2.2} className={styles.iconMuted} />
            <span className={styles.label}>Payout in</span>
            <span className={styles.days}>{days === 0 ? 'today' : `${days}d`}</span>
          </div>
        )}

        {showMomentum && (
          <div className={`${styles.momentum} ${styles[`tone-${momentumKind}`]}`}>
            <div className={styles.deltaRow}>
              {momentumKind === 'up' && <TrendingUp size={12} strokeWidth={2.4} />}
              {momentumKind === 'down' && <TrendingDown size={12} strokeWidth={2.4} />}
              {momentumKind === 'flat' && (
                <TrendingUp size={12} strokeWidth={2.4} className={styles.iconMuted} />
              )}
              <span className={styles.deltaPct}>
                {momentumKind === 'up' ? '+' : ''}
                {pctDelta.toFixed(0)}%
              </span>
            </div>
            <span className={styles.deltaLabel}>vs {lastPeriodLabel}</span>
          </div>
        )}

        {showCountdown && (
          <span className={styles.date}>{formatDateWithDay(nextPayoutDate)}</span>
        )}
      </div>

      {showCountdown && cycleDays > 0 && (
        <div className={styles.track}>
          <div className={styles.trackFill} style={{ width: `${progressPct}%` }} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDateWithDay(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  const day = DAY_ABBR[d.getDay()];
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${day}, ${dd}-${mm}-${yy}`;
}

function daysBetween(from, to) {
  if (!from || !to) return null;
  const ms = new Date(to).getTime() - new Date(from).getTime();
  if (Number.isNaN(ms)) return null;
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

function estimateCycleDays(payoutDate) {
  if (!payoutDate) return 0;
  const d = new Date(payoutDate);
  if (Number.isNaN(d.getTime())) return 0;
  if (d.getDay() === 6) return 7;
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  if (d.getDate() === lastDay) return lastDay;
  return 30;
}
