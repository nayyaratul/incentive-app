import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';
import styles from './VerticalViews.module.scss';
import EarningsHero from '../../../components/Molecule/EarningsHero/EarningsHero';
import OpportunityStrip from '../../../components/Organism/OpportunityStrip/OpportunityStrip';
import StreakNote from '../../../components/Molecule/StreakNote/StreakNote';
import DeptMultiplierCompact from '../../../components/Molecule/DeptMultiplierCompact/DeptMultiplierCompact';
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

      {/* Earnings hero — the dominant element */}
      <section className={`${styles.heroPad} rise rise-2`}>
        <EarningsHero
          thisMonth={{ amount: finalTotal }}
          today={{ amount: payout.todayEarned }}
          goal={goalBlock}
        />
      </section>

      {/* Streak note — always-positive, quiet placement */}
      {payout.streak && payout.streak.current > 0 && (
        <section className={`${styles.streakRow} rise rise-2`}>
          <StreakNote streak={payout.streak} />
        </section>
      )}

      {/* Push now */}
      <section className={`rise rise-3`}>
        <OpportunityStrip opportunities={OPPS} />
      </section>

      {/* Brief-aligned quests */}
      <section className={`${styles.pad} rise rise-4`}>
        <QuestCard employeeId={employee.employeeId} />
      </section>

      {/* Badges */}
      <section className={`rise rise-5`}>
        <BadgesStrip employeeId={employee.employeeId} />
      </section>

      {/* Department multiplier — compact, tap to expand */}
      <section className={`${styles.pad} rise rise-5`}>
        <DeptMultiplierCompact
          primaryDepartment={employee.primaryDepartment}
          allDepartments={allDepartments}
        />
      </section>

      {/* Eligibility — demoted to quiet inline link */}
      <section className={`${styles.pad} rise rise-5`}>
        <EligibilityFootnote employee={employee} store={store} role={role} />
      </section>
    </>
  );
}

function EligibilityFootnote({ employee, store, role }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.eligWrap}>
      <button type="button" className={styles.eligLink} onClick={() => setOpen(!open)} aria-expanded={open}>
        <ShieldCheck size={12} strokeWidth={2.2} />
        <span>Eligibility & exclusions</span>
        <ChevronRight
          size={13}
          strokeWidth={2.2}
          style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 140ms ease-out' }}
        />
      </button>
      {open && (
        <div className={styles.eligPanel}>
          <div><span>Role</span><strong>{role} · {employee?.employeeId}</strong></div>
          <div><span>Payroll</span><strong>{employee?.payrollStatus}</strong></div>
          <div><span>Store operational days</span><strong>{store?.operationalDaysInMonth} / 30</strong></div>
          <div><span>SFS / PAS / JioMart</span><strong>Excluded from incentive</strong></div>
          <div><span>Apple / OnePlus / MS Surface</span><strong>Excluded entirely</strong></div>
        </div>
      )}
    </div>
  );
}
