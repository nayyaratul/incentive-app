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

  // Compute the celebration target for the demo trigger:
  // pick the next tier above the user's current multiplier band.
  const sortedTiers = [...electronicsMultiplierTiers].sort((a, b) => a.gateFromPct - b.gateFromPct);
  const currentTierIdx = sortedTiers.findIndex(
    (t) => primary.achievementPct >= t.gateFromPct && primary.achievementPct < t.gateToPct
  );
  const nextTier = sortedTiers[currentTierIdx + 1] || sortedTiers[currentTierIdx];

  // Brief-aligned framing per tier value. The brief defines six bands:
  //   <85%   → 0%   (no payout)
  //   85-90% → 50%
  //   90-100%→ 80%
  //   100-110%→ 100%   (target hit — biggest moment)
  //   110-120%→ 110%
  //   120%+  → 120%   (top tier)
  const celebTier = nextTier && framingFor(nextTier.multiplier, primary.multiplier, primary.department);

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

/**
 * Build the celebration framing for a given target multiplier value.
 * All copy is grounded in the brief's six bands; tier values shown are exact.
 */
function framingFor(targetMult, currentMult, dept) {
  const targetPct  = Math.round(targetMult  * 100);
  const currentPct = Math.round(currentMult * 100);
  const fromNote = currentMult === 0
    ? `Up from no payout (was below 85%).`
    : `Up from ${currentPct}%.`;

  if (targetMult === 0) {
    return {
      kind: 'down',
      eyebrow: 'Payout paused',
      title: `${dept} below threshold`,
      multiplier: '0%',
      dept,
      note: 'Department dropped below 85% of target. No payout this period until it recovers.',
    };
  }
  if (targetMult === 0.50) {
    return {
      kind: 'up',
      eyebrow: 'Payout unlocked',
      title: 'First tier crossed',
      multiplier: '50%',
      dept,
      note: `Your ${dept} sales now pay at 50%. ${fromNote}`,
    };
  }
  if (targetMult === 0.80) {
    return {
      kind: 'up',
      eyebrow: 'Tier up',
      title: '80% payout band',
      multiplier: '80%',
      dept,
      note: `Your ${dept} sales now pay at 80%. ${fromNote}`,
    };
  }
  if (targetMult === 1.00) {
    return {
      kind: 'top',
      eyebrow: 'Target hit',
      title: 'Full payout',
      multiplier: '100%',
      dept,
      note: `${dept} reached its monthly target. Sales pay at the full rate.`,
    };
  }
  if (targetMult === 1.10) {
    return {
      kind: 'top',
      eyebrow: 'Bonus tier',
      title: 'Above target',
      multiplier: '110%',
      dept,
      note: `${dept} is over target. Your incentive scales by 1.10×.`,
    };
  }
  if (targetMult === 1.20) {
    return {
      kind: 'top',
      eyebrow: 'Top tier',
      title: 'Above 120%',
      multiplier: '120%',
      dept,
      note: `${dept} is at the top tier. Your incentive scales by 1.20× — the highest band.`,
    };
  }
  // Fallback (shouldn't occur with brief's defined values)
  return {
    kind: 'up',
    eyebrow: 'Tier change',
    title: 'New band',
    multiplier: `${targetPct}%`,
    dept,
    note: '',
  };
}
