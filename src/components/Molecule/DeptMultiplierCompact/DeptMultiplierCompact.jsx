import React, { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { Text, Badge } from '@/nexus/atoms';
import styles from './DeptMultiplierCompact.module.scss';
import { electronicsMultiplierTiers } from '../../../data/configs';
import TierCelebration from '../../Organism/TierCelebration/TierCelebration';

/**
 * Compact display of the department multiplier -- shows only the user's
 * primary department by default. Additional departments (and the full tier
 * reference) are revealed on tap. Low visual weight per product guidance.
 */
export default function DeptMultiplierCompact({ primaryDepartment, allDepartments }) {
  const [open, setOpen] = useState(false);
  const [celebTier, setCelebTier] = useState(null);

  const primary = allDepartments.find((d) => d.department === primaryDepartment) || allDepartments[0];
  const others = allDepartments.filter((d) => d.department !== primary.department);

  const isZero = primary.multiplier === 0;

  // Demo helper: fire the celebration for any of the brief's six tiers.
  // (Tier rows in the reference panel below are tappable.)
  const simulate = (targetMultiplier) => {
    setCelebTier(framingFor(targetMultiplier, primary.multiplier, primary.department));
  };

  return (
    <section className={styles.card}>
      <button type="button" className={styles.head} onClick={() => setOpen(!open)} aria-expanded={open}>
        <div className={styles.headLeft}>
          <Text as="span" variant="overline" className={styles.eyebrow}>Your department</Text>
          <Text as="span" variant="body" className={styles.dept}>{primary.department}</Text>
        </div>
        <div className={styles.headRight}>
          <Text as="span" variant="caption" className={styles.achieve}>{primary.achievementPct}%</Text>
          <Badge
            variant={isZero ? 'error' : 'default'}
            size="sm"
            className={`${styles.multPill} ${isZero ? styles.multZero : ''}`}
          >
            {isZero ? 'No payout' : `${Math.round(primary.multiplier * 100)}%`}
          </Badge>
          <ChevronDown
            size={14}
            strokeWidth={2.2}
            className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
            aria-hidden="true"
          />
        </div>
      </button>

      <TierCelebration
        open={!!celebTier}
        tier={celebTier}
        onDismiss={() => setCelebTier(null)}
      />

      {open && (
        <div className={styles.panel}>
          {others.length > 0 && (
            <div className={styles.section}>
              <Text as="div" variant="overline" className={styles.sectionTitle}>Other departments you've sold in</Text>
              <div className={styles.deptList}>
                {others.map((d) => {
                  const z = d.multiplier === 0;
                  return (
                    <div key={d.department} className={`${styles.deptRow} ${z ? styles.deptRowZero : ''}`}>
                      <Text as="span" variant="body" className={styles.deptName}>{d.department}</Text>
                      <Text as="span" variant="caption" className={styles.deptAchieve}>{d.achievementPct}%</Text>
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
            <div className={styles.sectionTitleRow}>
              <Text as="span" variant="overline" className={styles.sectionTitle}>How the multiplier works</Text>
              <span className={styles.demoHint}>
                <Sparkles size={11} strokeWidth={2.4} />
                Tap any tier to preview
              </span>
            </div>
            <div className={styles.tierGrid}>
              {electronicsMultiplierTiers.map((t) => {
                const isCurrent = primary.multiplier === t.multiplier;
                return (
                  <button
                    key={t.label}
                    type="button"
                    className={`${styles.tierRow} ${styles.tierRowBtn} ${isCurrent ? styles.tierRowCurrent : ''}`}
                    onClick={() => simulate(t.multiplier)}
                    aria-label={`Preview celebration for ${t.multiplier === 0 ? 'no payout' : Math.round(t.multiplier * 100) + '%'} tier`}
                  >
                    <span className={styles.tierBand}>
                      {t.gateFromPct}&ndash;{t.gateToPct === Infinity ? '\u221E' : t.gateToPct}%
                    </span>
                    <span className={`${styles.tierMult} ${t.multiplier === 0 ? styles.multZero : ''}`}>
                      {t.multiplier === 0 ? 'No pay' : `${Math.round(t.multiplier * 100)}%`}
                    </span>
                  </button>
                );
              })}
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
    return { kind: 'down', intensity: 0,
      eyebrow: 'Payout paused', title: `${dept} below threshold`, multiplier: '0%', dept,
      note: 'Department dropped below 85% of target. No payout this period until it recovers.' };
  }
  if (targetMult === 0.50) {
    return { kind: 'up', intensity: 1,
      eyebrow: 'Payout unlocked', title: 'First tier crossed', multiplier: '50%', dept,
      note: `Your ${dept} sales now pay at 50%. ${fromNote}` };
  }
  if (targetMult === 0.80) {
    return { kind: 'up', intensity: 2,
      eyebrow: 'Tier up', title: '80% payout band', multiplier: '80%', dept,
      note: `Your ${dept} sales now pay at 80%. ${fromNote}` };
  }
  if (targetMult === 1.00) {
    return { kind: 'top', intensity: 3,
      eyebrow: 'Target hit', title: 'Full payout', multiplier: '100%', dept,
      note: `${dept} reached its monthly target. Sales pay at the full rate.` };
  }
  if (targetMult === 1.10) {
    return { kind: 'top', intensity: 4,
      eyebrow: 'Bonus tier', title: 'Above target', multiplier: '110%', dept,
      note: `${dept} is over target. Your incentive scales by 1.10\u00D7.` };
  }
  if (targetMult === 1.20) {
    return { kind: 'top', intensity: 5,
      eyebrow: 'Top tier', title: 'Legendary \u00B7 above 120%', multiplier: '120%', dept,
      note: `${dept} is at the top tier. Your incentive scales by 1.20\u00D7 \u2014 the highest band.` };
  }
  return { kind: 'up', intensity: 1,
    eyebrow: 'Tier change', title: 'New band', multiplier: `${targetPct}%`, dept, note: '' };
}
