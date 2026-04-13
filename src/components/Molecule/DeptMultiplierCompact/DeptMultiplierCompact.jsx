import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './DeptMultiplierCompact.module.scss';
import { electronicsMultiplierTiers } from '../../../data/configs';

/**
 * Compact display of the department multiplier — shows only the user's
 * primary department by default. Additional departments (and the full tier
 * reference) are revealed on tap. Low visual weight per product guidance.
 */
export default function DeptMultiplierCompact({ primaryDepartment, allDepartments }) {
  const [open, setOpen] = useState(false);

  const primary = allDepartments.find((d) => d.department === primaryDepartment) || allDepartments[0];
  const others = allDepartments.filter((d) => d.department !== primary.department);

  const isZero = primary.multiplier === 0;

  return (
    <section className={styles.card}>
      <button type="button" className={styles.head} onClick={() => setOpen(!open)} aria-expanded={open}>
        <div className={styles.headLeft}>
          <span className={styles.eyebrow}>Your department</span>
          <span className={styles.dept}>{primary.department}</span>
        </div>
        <div className={styles.headRight}>
          <span className={styles.achieve}>{primary.achievementPct}%</span>
          <span className={`${styles.multPill} ${isZero ? styles.multZero : ''}`}>
            {isZero ? 'No payout' : `${Math.round(primary.multiplier * 100)}%`}
          </span>
          <ChevronDown
            size={14}
            strokeWidth={2.2}
            className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
            aria-hidden="true"
          />
        </div>
      </button>

      {open && (
        <div className={styles.panel}>
          {others.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Other departments you've sold in</div>
              <div className={styles.deptList}>
                {others.map((d) => {
                  const z = d.multiplier === 0;
                  return (
                    <div key={d.department} className={`${styles.deptRow} ${z ? styles.deptRowZero : ''}`}>
                      <span className={styles.deptName}>{d.department}</span>
                      <span className={styles.deptAchieve}>{d.achievementPct}%</span>
                      <span className={`${styles.deptMult} ${z ? styles.multZero : ''}`}>
                        {z ? '0%' : `${Math.round(d.multiplier * 100)}%`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className={styles.section}>
            <div className={styles.sectionTitle}>How the multiplier works</div>
            <div className={styles.tierGrid}>
              {electronicsMultiplierTiers.map((t) => (
                <div key={t.label} className={styles.tierRow}>
                  <span className={styles.tierBand}>
                    {t.gateFromPct}–{t.gateToPct === Infinity ? '∞' : t.gateToPct}%
                  </span>
                  <span className={`${styles.tierMult} ${t.multiplier === 0 ? styles.multZero : ''}`}>
                    {t.multiplier === 0 ? 'No pay' : `${Math.round(t.multiplier * 100)}%`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
