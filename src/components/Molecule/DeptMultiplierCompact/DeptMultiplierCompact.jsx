import React, { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import styles from './DeptMultiplierCompact.module.scss';
import { electronicsMultiplierTiers } from '../../../data/configs';
import TierCelebration from '../../Organism/TierCelebration/TierCelebration';

/**
 * Compact display of the department multiplier — shows only the user's
 * primary department by default. Additional departments (and the full tier
 * reference) are revealed on tap. Low visual weight per product guidance.
 */
export default function DeptMultiplierCompact({ primaryDepartment, allDepartments }) {
  const [open, setOpen] = useState(false);
  const [celebOpen, setCelebOpen] = useState(false);

  const primary = allDepartments.find((d) => d.department === primaryDepartment) || allDepartments[0];
  const others = allDepartments.filter((d) => d.department !== primary.department);

  const isZero = primary.multiplier === 0;

  // Pick the next tier above the primary's current multiplier — what a
  // crossing celebration would unlock. Used by the demo trigger.
  const sortedTiers = [...electronicsMultiplierTiers].sort((a, b) => a.gateFromPct - b.gateFromPct);
  const currentTierIdx = sortedTiers.findIndex(
    (t) => primary.achievementPct >= t.gateFromPct && primary.achievementPct < t.gateToPct
  );
  const nextTier = sortedTiers[currentTierIdx + 1] || sortedTiers[currentTierIdx];
  const celebTier = nextTier && {
    label: nextTier.multiplier === 0 ? 'No payout' : `${Math.round(nextTier.multiplier * 100)}%`,
    dept: primary.department,
    note: nextTier.multiplier > primary.multiplier
      ? `Your ${primary.department} sales now pay at ${Math.round(nextTier.multiplier * 100)}% — up from ${Math.round(primary.multiplier * 100)}%.`
      : `Your ${primary.department} multiplier is now ${Math.round(nextTier.multiplier * 100)}%.`,
  };
  const celebKind = nextTier && nextTier.multiplier > primary.multiplier ? 'up' : 'down';

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

      <TierCelebration
        open={celebOpen}
        kind={celebKind}
        tier={celebTier}
        onDismiss={() => setCelebOpen(false)}
      />

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

          {/* Demo trigger — POC only. In production, the celebration fires
              automatically when the dept's tier actually changes (server push). */}
          <div className={styles.section}>
            <button
              type="button"
              className={styles.demoBtn}
              onClick={() => setCelebOpen(true)}
            >
              <Sparkles size={12} strokeWidth={2.4} />
              Simulate tier change
            </button>
          </div>

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
