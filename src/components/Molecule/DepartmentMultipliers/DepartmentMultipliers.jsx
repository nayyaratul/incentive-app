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
 * Optional per-department: { actual/actualSales, target, nextTier, gapToNext, baseIncentive, finalPayout }
 * @param {Object[]} [tiers] — multiplier tiers; used to compute nextTier/gapToNext
 *   when departments don't already have them.
 * @param {string}   [myDepartment] — Round-1 testing comment E005: the SA was
 *   seeing every department's multiplier on their hero, including ones they
 *   don't sell in. Pass the SA's own department to highlight that row and
 *   render the explicit Base × Multiplier = Final calc beneath it. SM/DM
 *   pages omit this prop and see all rows unchanged.
 */
export default function DepartmentMultipliers({ departments, tiers, myDepartment }) {
  if (!departments || departments.length === 0) return null;

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <span className={styles.eyebrow}>
          {myDepartment ? 'Your department' : 'Department multipliers'}
        </span>
      </div>
      <div className={styles.list}>
        {departments.map((d) => {
          const mPct = Math.round(d.multiplier * 100);
          const isZero = d.multiplier === 0;
          const actual = d.actualSales ?? d.actual ?? 0;
          const target = d.target ?? 0;
          const hasTarget = target > 0 || actual > 0;
          const isMine = myDepartment && d.department === myDepartment;

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

          // E005: explicit Base × Multiplier = Final calc — only renders when
          // we have all three numbers and we're rendering the SA's own row,
          // so SM/DM views aren't cluttered.
          const baseIncentive = Number(d.baseIncentive) || 0;
          const finalPayout = Number(d.finalPayout) || 0;
          const showCalc = isMine && baseIncentive > 0 && finalPayout > 0;

          return (
            <div key={d.department} className={`${styles.row} ${isMine ? styles.rowMine : ''}`}>
              <div className={styles.info}>
                <div className={styles.name}>
                  {d.department}
                  {isMine && <span className={styles.youTag}>you</span>}
                </div>
                {hasTarget && (
                  <div className={styles.sub}>
                    {formatINR(actual)} of {formatINR(target)}
                  </div>
                )}
                {showCalc && (
                  <div className={styles.calc}>
                    {formatINR(baseIncentive)} <span>base</span>
                    {' × '}{mPct}%{' = '}
                    <strong>{formatINR(finalPayout)}</strong>
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
