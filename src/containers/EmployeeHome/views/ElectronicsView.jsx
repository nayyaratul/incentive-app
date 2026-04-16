import React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/nexus/atoms';
import styles from './VerticalViews.module.scss';
import EarningsHero from '../../../components/Molecule/EarningsHero/EarningsHero';
import StreakNote from '../../../components/Molecule/StreakNote/StreakNote';
import MomentumPills from '../../../components/Molecule/MomentumPills/MomentumPills';
import DepartmentMultipliers from '../../../components/Molecule/DepartmentMultipliers/DepartmentMultipliers';
import BadgesStrip from '../../../components/Widgets/BadgesStrip/BadgesStrip';
import QuestCard from '../../../components/Widgets/QuestCard/QuestCard';
import LevelUpToast from '../../../components/Organism/LevelUpToast/LevelUpToast';
import WeeklyChallenge from '../../../components/Widgets/WeeklyChallenge/WeeklyChallenge';

export default function ElectronicsView({ payout, employee, store, role, multiplierTiers }) {
  const deptSum = payout.byDepartment.reduce((s, d) => s + d.finalPayout, 0);
  const finalTotal = payout.monthToDateEarned || deptSum;

  const goalBlock = {
    target: payout.monthlyGoalTarget,
    pct: payout.monthlyGoalTarget ? finalTotal / payout.monthlyGoalTarget : 0,
  };

  const departments = payout.byDepartment || [];

  const complianceItems = [
    { label: 'Role',                        value: `${role} · ${employee?.employeeId}` },
    { label: 'Payroll',                     value: employee?.payrollStatus },
    { label: 'Store operational days',      value: `${store?.operationalDaysInMonth} / 30` },
    { label: 'SFS / PAS / JioMart',         value: 'Excluded from incentive' },
    { label: 'Apple / OnePlus / MS Surface',value: 'Excluded entirely' },
  ];

  return (
    <>
      <LevelUpToast previousAmount={payout.lastMonthPayout} currentAmount={finalTotal} />

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
          potential={payout.baseIncentive}
          achievementPct={payout.achievementPct}
          multiplierPct={payout.currentMultiplierPct}
          apiTiers={payout.apiMultiplierTiers}
        />
      </section>

      <section className={`${styles.pad} rise rise-3`}>
        <DepartmentMultipliers departments={departments} tiers={multiplierTiers} />
      </section>

      <section className={`${styles.streakRow} rise rise-3`}>
        <StreakNote streak={payout.streak} />
      </section>

      <section className={`${styles.streakRow} rise rise-4`}>
        <MomentumPills
          thisPeriodAmount={finalTotal}
          lastPeriodAmount={payout.lastMonthPayout}
          lastPeriodLabel="last month"
          nextPayoutDate={payout.nextPayoutDate}
        />
      </section>

      <section className={`rise rise-4`}>
        <WeeklyChallenge vertical="ELECTRONICS" payout={payout} />
      </section>

      <section className={`rise rise-5`}>
        <QuestCard employeeId={employee.employeeId} vertical="ELECTRONICS" payout={payout} />
      </section>

      <section className={`rise rise-5`}>
        <BadgesStrip employeeId={employee.employeeId} vertical="ELECTRONICS" />
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

