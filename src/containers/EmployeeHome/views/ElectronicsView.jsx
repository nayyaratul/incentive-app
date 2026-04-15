import React from 'react';
import { AlertTriangle } from 'lucide-react';
import styles from './VerticalViews.module.scss';
import EarningsHero from '../../../components/Molecule/EarningsHero/EarningsHero';
import OpportunityStrip from '../../../components/Organism/OpportunityStrip/OpportunityStrip';
import StreakNote from '../../../components/Molecule/StreakNote/StreakNote';
import MomentumPills from '../../../components/Molecule/MomentumPills/MomentumPills';
import DeptMultiplierCompact from '../../../components/Molecule/DeptMultiplierCompact/DeptMultiplierCompact';
import ComplianceLink from '../../../components/Molecule/ComplianceLink/ComplianceLink';
import BadgesStrip from '../../../components/Widgets/BadgesStrip/BadgesStrip';
import QuestCard from '../../../components/Widgets/QuestCard/QuestCard';
import { electronicsMultiplierTiers } from '../../../data/configs';

const OPPS = [
  { sku: 'Vivo Y28 · ₹15k–20k',    band: 'Telecom · Samsung/Oppo/Vivo tier', earn: 50 },
  { sku: 'Samsung QLED 55"',       band: 'ENT · TV 40–60k tier',              earn: 100 },
  { sku: 'Lenovo IdeaPad 5',       band: 'IT · Laptop 47–52k tier',           earn: 70 },
  { sku: 'boAt Airdopes',          band: 'AIOT · Personal AV',                earn: 40 },
];

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

  const complianceItems = [
    { label: 'Role',                        value: `${role} · ${employee?.employeeId}` },
    { label: 'Payroll',                     value: employee?.payrollStatus },
    { label: 'Store operational days',      value: `${store?.operationalDaysInMonth} / 30` },
    { label: 'SFS / PAS / JioMart',         value: 'Excluded from incentive' },
    { label: 'Apple / OnePlus / MS Surface',value: 'Excluded entirely' },
  ];

  return (
    <>
      {payout.ineligibleReason && (
        <div className={`${styles.notice} rise rise-1`}>
          <AlertTriangle size={14} strokeWidth={2.4} />
          <div>
            <div className={styles.noticeTitle}>Not eligible for this month's payout</div>
            <div className={styles.noticeBody}>{payout.ineligibleReason}</div>
          </div>
        </div>
      )}

      <section className={`${styles.heroPad} rise rise-2`}>
        <EarningsHero
          thisMonth={{ amount: finalTotal }}
          today={{ amount: payout.todayEarned }}
          goal={goalBlock}
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
        <OpportunityStrip opportunities={OPPS} />
      </section>

      <section className={`rise rise-4`}>
        <QuestCard employeeId={employee.employeeId} vertical="ELECTRONICS" />
      </section>

      <section className={`rise rise-5`}>
        <BadgesStrip employeeId={employee.employeeId} vertical="ELECTRONICS" />
      </section>

      <section className={`${styles.pad} rise rise-5`}>
        <DeptMultiplierCompact
          primaryDepartment={employee.primaryDepartment}
          allDepartments={allDepartments}
        />
      </section>

      <section className={`${styles.pad} rise rise-5`}>
        <ComplianceLink label="Eligibility & exclusions" items={complianceItems} />
      </section>
    </>
  );
}
