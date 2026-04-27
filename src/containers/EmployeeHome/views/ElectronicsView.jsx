import React, { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/nexus/atoms';
import styles from './VerticalViews.module.scss';
import VerticalHero from '../../../components/Molecule/HeroCard/VerticalHero';
import { toSAHero as toElectronicsSAHero } from '../../../components/Molecule/HeroCard/mappers/electronics';
import StreakNote from '../../../components/Molecule/StreakNote/StreakNote';
import MomentumPills from '../../../components/Molecule/MomentumPills/MomentumPills';
import DepartmentMultipliers from '../../../components/Molecule/DepartmentMultipliers/DepartmentMultipliers';
import EligibilityNotice from '../../../components/Molecule/EligibilityNotice/EligibilityNotice';
import BadgesStrip from '../../../components/Widgets/BadgesStrip/BadgesStrip';
import QuestCard from '../../../components/Widgets/QuestCard/QuestCard';
import LevelUpToast from '../../../components/Organism/LevelUpToast/LevelUpToast';
import WeeklyChallenge from '../../../components/Widgets/WeeklyChallenge/WeeklyChallenge';
import { safeArray, safeNum } from '../../../components/Molecule/HeroCard/safe';
import WidgetBoundary from '../../../components/Atom/WidgetBoundary/WidgetBoundary';

export default function ElectronicsView({ payout, employee, store, role, multiplierTiers }) {
  const byDepartment = safeArray(payout?.byDepartment);
  const deptSum = byDepartment.reduce((s, d) => s + safeNum(d.finalPayout, 0), 0);
  const finalTotal = safeNum(payout?.monthToDateEarned, 0) || deptSum;

  const heroProps = useMemo(() => toElectronicsSAHero(payout), [payout]);

  // Hide earnings-context widgets (multipliers, weekly challenge, quests) when
  // the employee is INELIGIBLE — i.e. NOTICE_PERIOD, DISCIPLINARY_ACTION, or
  // EXITED_MID_PERIOD. Round-1 testing comment E008 (DA): "No multipliers or
  // milestones shown for DISCIPLINARY_ACTION" — today these widgets render
  // with stale/zero data which is louder than the actual reason. The
  // EligibilityNotice above the hero carries the explanation. Badges remain
  // visible (achievements earned earlier still count).
  const isIneligible = payout?.eligibility?.status === 'INELIGIBLE';

  const complianceItems = [
    { label: 'Role',                        value: `${role} · ${employee?.employeeId}` },
    { label: 'Payroll',                     value: employee?.payrollStatus },
    { label: 'Store operational days',      value: `${store?.operationalDaysInMonth ?? '—'} / 30` },
    { label: 'SFS / PAS / JioMart',         value: 'Excluded from incentive' },
    { label: 'Apple / OnePlus / MS Surface',value: 'Excluded entirely' },
  ];

  return (
    <>
      <LevelUpToast previousAmount={payout.lastMonthPayout} currentAmount={finalTotal} />

      {/* Structured eligibility — uses payout.eligibility.reasons[] from
          the backend. Falls back to the legacy single-string ineligibleReason
          for older API responses (renders as a one-item list). */}
      {payout.eligibility && payout.eligibility.reasons?.length > 0 ? (
        <section className="rise rise-1">
          <EligibilityNotice
            eligibility={payout.eligibility}
            title={
              payout.eligibility.status === 'INELIGIBLE'
                ? "Not eligible for this month's payout"
                : 'Heads up'
            }
          />
        </section>
      ) : payout.ineligibleReason ? (
        <div className={`${styles.notice} rise rise-1`}>
          <AlertTriangle size={14} strokeWidth={2.4} />
          <div>
            <div className={styles.noticeTitle}>Not eligible for this month&rsquo;s payout</div>
            <div className={styles.noticeBody}>{payout.ineligibleReason}</div>
          </div>
        </div>
      ) : null}

      <section className={`${styles.heroPad} rise rise-2`}>
        <WidgetBoundary name="electronics-hero">
          <VerticalHero vertical="ELECTRONICS" heroProps={heroProps} />
        </WidgetBoundary>
      </section>

      {!isIneligible && (
        <section className={`${styles.pad} rise rise-3`}>
          <WidgetBoundary name="dept-multipliers">
            <DepartmentMultipliers departments={byDepartment} tiers={multiplierTiers} />
          </WidgetBoundary>
        </section>
      )}

      <section className={`${styles.streakRow} rise rise-3`}>
        <WidgetBoundary name="streak"><StreakNote streak={payout.streak} /></WidgetBoundary>
      </section>

      <section className={`${styles.streakRow} rise rise-4`}>
        <WidgetBoundary name="momentum">
          <MomentumPills
            thisPeriodAmount={finalTotal}
            lastPeriodAmount={payout.lastMonthPayout}
            lastPeriodLabel="last month"
            nextPayoutDate={payout.nextPayoutDate}
          />
        </WidgetBoundary>
      </section>

      {!isIneligible && (
        <section className={`rise rise-4`}>
          <WidgetBoundary name="weekly-challenge">
            <WeeklyChallenge vertical="ELECTRONICS" payout={payout} />
          </WidgetBoundary>
        </section>
      )}

      {!isIneligible && (
        <section className={`rise rise-5`}>
          <WidgetBoundary name="quests">
            <QuestCard employeeId={employee.employeeId} vertical="ELECTRONICS" payout={payout} />
          </WidgetBoundary>
        </section>
      )}

      <section className={`rise rise-5`}>
        <WidgetBoundary name="badges">
          <BadgesStrip employeeId={employee.employeeId} vertical="ELECTRONICS" />
        </WidgetBoundary>
      </section>

      {/* Eligibility & exclusions accordion — closed by default. */}
      <section className={`${styles.pad} ${styles.compactAccordion} rise rise-6`}>
        <Accordion variant="default" type="multiple">
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

