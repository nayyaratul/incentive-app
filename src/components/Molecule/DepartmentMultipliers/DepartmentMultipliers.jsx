import { Zap } from 'lucide-react';
import { formatINR } from '../../../utils/format';
import styles from './DepartmentMultipliers.module.scss';

/**
 * Find the next multiplier tier above the current achievement %.
 * Accepts tiers in either API shape ({ achievementFrom, achievementTo, multiplierPct })
 * or transformed shape ({ gateFromPct, gateToPct, multiplier }).
 */
function findNextTier(pct, tiers) {
  if (!tiers || tiers.length === 0) return null;
  const sorted = [...tiers]
    .map((t) => ({
      pct: Number(t.achievementFrom ?? t.gateFromPct),
      mult: Number(t.multiplierPct ?? Math.round(t.multiplier * 100)),
    }))
    .sort((a, b) => a.pct - b.pct);

  for (const t of sorted) {
    if (pct < t.pct) return t;
  }
  return null;
}

/**
 * Department multipliers card — shared by SA and SM Electronics.
 *
 * @param {Object[]} departments — each item needs at minimum:
 *   { department, achievementPct, multiplier }
 * Optional per-department: { actual/actualSales, target, nextTier, gapToNext }
 * @param {Object[]} [tiers] — multiplier tiers; used to compute nextTier/gapToNext
 *   when departments don't already have them.
 */
export default function DepartmentMultipliers({ departments, tiers }) {
  if (!departments || departments.length === 0) return null;

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <span className={styles.eyebrow}>Department multipliers</span>
      </div>
      <div className={styles.list}>
        {departments.map((d) => {
          const mPct = Math.round(d.multiplier * 100);
          const isZero = d.multiplier === 0;
          const actual = d.actualSales ?? d.actual ?? 0;
          const target = d.target ?? 0;
          const hasTarget = target > 0 || actual > 0;

          // Use pre-computed nextTier/gapToNext, or derive from tiers
          let nextTier = d.nextTier ?? null;
          let gapToNext = d.gapToNext ?? null;
          if (!nextTier && tiers) {
            nextTier = findNextTier(d.achievementPct, tiers);
            if (nextTier && target > 0) {
              gapToNext = Math.max(0, Math.round(target * nextTier.pct / 100 - actual));
            }
          }

          const isClose = nextTier && gapToNext != null && gapToNext > 0
            && (nextTier.pct - d.achievementPct) <= 15;

          return (
            <div key={d.department} className={styles.row}>
              <div className={styles.info}>
                <div className={styles.name}>{d.department}</div>
                {hasTarget && (
                  <div className={styles.sub}>
                    {formatINR(actual)} of {formatINR(target)}
                  </div>
                )}
                {isClose && (
                  <div className={styles.nudge}>
                    <Zap size={11} strokeWidth={2.4} />
                    {formatINR(gapToNext)} to unlock {nextTier.mult}%
                  </div>
                )}
              </div>
              <div className={styles.ach}>{d.achievementPct}%</div>
              <div className={`${styles.mult} ${isZero ? styles.multZero : ''}`}>
                {isZero ? 'NO PAYOUT' : `${mPct}%`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
