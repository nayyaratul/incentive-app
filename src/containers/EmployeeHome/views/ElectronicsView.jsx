import React, { useState } from 'react';
import { AlertTriangle, Sparkles } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Badge,
  Text,
} from '@/nexus/atoms';
import styles from './VerticalViews.module.scss';
import EarningsHero from '../../../components/Molecule/EarningsHero/EarningsHero';
import StreakNote from '../../../components/Molecule/StreakNote/StreakNote';
import MomentumPills from '../../../components/Molecule/MomentumPills/MomentumPills';
import BadgesStrip from '../../../components/Widgets/BadgesStrip/BadgesStrip';
import QuestCard from '../../../components/Widgets/QuestCard/QuestCard';
import TierCelebration from '../../../components/Organism/TierCelebration/TierCelebration';
import LevelUpToast from '../../../components/Organism/LevelUpToast/LevelUpToast';
import WeeklyChallenge from '../../../components/Widgets/WeeklyChallenge/WeeklyChallenge';
import {
  electronicsMultiplierTiers,
  electronicsOpportunities,
} from '../../../data/configs';

function findMultiplier(pct) {
  const tier = electronicsMultiplierTiers.find((t) => pct >= t.gateFromPct && pct < t.gateToPct);
  return tier ? tier.multiplier : 0;
}

export default function ElectronicsView({ payout, employee, store, role }) {
  const finalTotal = payout.byDepartment.reduce((s, d) => s + d.finalPayout, 0);

  const goalBlock = {
    target: payout.monthlyGoalTarget,
    pct: payout.monthlyGoalTarget ? finalTotal / payout.monthlyGoalTarget : 0,
  };

  const allDepartments = payout.byDepartment.map((d) => ({
    department: d.department,
    achievementPct: d.achievementPct,
    multiplier: findMultiplier(d.achievementPct),
  }));

  const empDept = payout.employeeDepartment || employee.department;
  const primary = allDepartments.find((d) => d.department === empDept) || allDepartments[0];

  const complianceItems = [
    { label: 'Role',                        value: `${role} · ${employee?.employeeId}` },
    { label: 'Payroll',                     value: employee?.payrollStatus },
    { label: 'Store operational days',      value: `${store?.operationalDaysInMonth} / 30` },
    { label: 'SFS / PAS / JioMart',         value: 'Excluded from incentive' },
    { label: 'Apple / OnePlus / MS Surface',value: 'Excluded entirely' },
  ];

  /* Simulate a "previous" amount slightly below a tier boundary for demo.
     In production this would come from a cached/yesterday snapshot. */
  const prevAmount = Math.max(0, finalTotal - Math.round(finalTotal * 0.15));

  return (
    <>
      <LevelUpToast previousAmount={prevAmount} currentAmount={finalTotal} />

      {payout.ineligibleReason && (
        <div className={`${styles.notice} rise rise-1`}>
          <AlertTriangle size={14} strokeWidth={2.4} />
          <div>
            <div className={styles.noticeTitle}>Not eligible for this month&rsquo;s payout</div>
            <div className={styles.noticeBody}>{payout.ineligibleReason}</div>
          </div>
        </div>
      )}

      <section className={`${styles.heroPad} rise rise-2`}>
        <EarningsHero
          thisMonth={{ amount: finalTotal }}
          today={{ amount: payout.todayEarned }}
          goal={goalBlock}
          milestones={payout.milestones}
        />
      </section>

      <section className={`${styles.streakRow} rise rise-2`}>
        <StreakNote
          streak={
            payout.streak && payout.streak.current > 0
              ? payout.streak
              : { current: 7, longest: 12, label: 'working days', caption: 'present + selling' }
          }
        />
      </section>

      <section className={`${styles.streakRow} rise rise-3`}>
        <MomentumPills
          thisPeriodAmount={finalTotal}
          lastPeriodAmount={payout.lastMonthPayout}
          lastPeriodLabel="last month"
          nextPayoutDate={payout.nextPayoutDate}
        />
      </section>

      <section className={`rise rise-3`}>
        <WeeklyChallenge vertical="ELECTRONICS" payout={payout} />
      </section>

      <section className={`rise rise-4`}>
        <QuestCard employeeId={employee.employeeId} vertical="ELECTRONICS" />
      </section>

      <section className={`rise rise-5`}>
        <BadgesStrip employeeId={employee.employeeId} vertical="ELECTRONICS" />
      </section>

      {/* Unified quiet disclosure — Floor intelligence, Your department, and
          Eligibility & exclusions all live in the same Nexus accordion shape
          used by GroceryView, so the role's reference sections read as one
          coherent footer block instead of three competing cards. All items
          closed by default — the user opens what they need. */}
      <section className={`${styles.pad} ${styles.compactAccordion} rise rise-5`}>
        <Accordion variant="default" type="multiple">
          <AccordionItem value="floor-intelligence">
            <AccordionTrigger>
              Floor intelligence &mdash; push these now ({electronicsOpportunities.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className={styles.oppList}>
                {electronicsOpportunities.map((opp) => (
                  <div key={opp.sku} className={styles.oppRow}>
                    <div className={styles.oppLeft}>
                      <span className={styles.oppSku}>{opp.sku}</span>
                      <span className={styles.oppBand}>{opp.band}</span>
                    </div>
                    <div className={styles.oppRight}>
                      <span className={styles.oppEarn}>&#8377;{opp.earn}</span>
                      <span className={styles.oppEarnUnit}>per sale</span>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="department">
            <AccordionTrigger>
              Your department &middot; {primary.department}
            </AccordionTrigger>
            <AccordionContent>
              <DepartmentPanel
                primary={primary}
                others={allDepartments.filter((d) => d.department !== primary.department)}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="eligibility">
            <AccordionTrigger>Eligibility &amp; exclusions</AccordionTrigger>
            <AccordionContent>
              <dl className={styles.compactList}>
                {complianceItems.map((it) => (
                  <div key={it.label} className={styles.compactRow}>
                    <dt className={styles.compactLabel}>{it.label}</dt>
                    <dd className={styles.compactValue}>{it.value}</dd>
                  </div>
                ))}
              </dl>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </>
  );
}

/**
 * "Your department" content rendered inside the quiet accordion. Mirrors what
 * the old DeptMultiplierCompact card showed (primary stats, other departments,
 * tier reference) but without the duplicate header/toggle since the accordion
 * provides those. Tapping a tier still previews the celebration, like before.
 */
function DepartmentPanel({ primary, others }) {
  const [celebTier, setCelebTier] = useState(null);
  const isPrimaryZero = primary.multiplier === 0;

  return (
    <>
      <TierCelebration
        open={!!celebTier}
        tier={celebTier}
        onDismiss={() => setCelebTier(null)}
      />

      <div className={styles.deptHeadRow}>
        <span className={styles.deptHeadLabel}>Achievement</span>
        <span className={styles.deptHeadAchieve}>{primary.achievementPct}%</span>
        <Badge
          variant={isPrimaryZero ? 'error' : 'default'}
          size="sm"
          className={`${styles.deptMultPill} ${isPrimaryZero ? styles.deptMultZero : ''}`}
        >
          {isPrimaryZero ? 'No payout' : `${Math.round(primary.multiplier * 100)}%`}
        </Badge>
      </div>

      {others.length > 0 && (
        <div className={styles.deptSubsection}>
          <Text as="div" variant="overline" className={styles.deptSubhead}>
            Other departments you&rsquo;ve sold in
          </Text>
          <div className={styles.deptOthersList}>
            {others.map((d) => {
              const z = d.multiplier === 0;
              return (
                <div key={d.department} className={styles.deptOtherRow}>
                  <span className={styles.deptOtherName}>{d.department}</span>
                  <span className={styles.deptOtherAchieve}>{d.achievementPct}%</span>
                  <span className={`${styles.deptOtherMult} ${z ? styles.deptMultZero : ''}`}>
                    {z ? '0%' : `${Math.round(d.multiplier * 100)}%`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.deptSubsection}>
        <div className={styles.deptSubheadRow}>
          <Text as="span" variant="overline" className={styles.deptSubhead}>
            How the multiplier works
          </Text>
          <span className={styles.deptDemoHint}>
            <Sparkles size={11} strokeWidth={2.4} />
            <span>Tap any tier to preview</span>
          </span>
        </div>
        <div className={styles.tierGrid}>
          {electronicsMultiplierTiers.map((t) => {
            const isCurrent = primary.multiplier === t.multiplier;
            const z = t.multiplier === 0;
            return (
              <button
                key={t.label}
                type="button"
                className={`${styles.tierRow} ${isCurrent ? styles.tierRowCurrent : ''}`}
                onClick={() => setCelebTier(framingFor(t.multiplier, primary.multiplier, primary.department))}
                aria-label={`Preview celebration for ${z ? 'no payout' : Math.round(t.multiplier * 100) + '%'} tier`}
              >
                <span className={styles.tierBand}>
                  {t.gateFromPct}&ndash;{t.gateToPct === Infinity ? '\u221E' : t.gateToPct}%
                </span>
                <span className={`${styles.tierMult} ${z ? styles.deptMultZero : ''}`}>
                  {z ? 'No pay' : `${Math.round(t.multiplier * 100)}%`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

/**
 * Build the celebration framing for a given target multiplier.
 * Six bands per the brief; copy is grounded in the brief language.
 */
function framingFor(targetMult, currentMult, dept) {
  const targetPct  = Math.round(targetMult  * 100);
  const currentPct = Math.round(currentMult * 100);
  const fromNote = currentMult === 0
    ? 'Up from no payout (was below 85%).'
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
