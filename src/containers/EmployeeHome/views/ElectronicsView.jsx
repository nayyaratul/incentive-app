import React from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import styles from './VerticalViews.module.scss';
import EarningsHero from '../../../components/Molecule/EarningsHero/EarningsHero';
import OpportunityStrip from '../../../components/Organism/OpportunityStrip/OpportunityStrip';
import LeaderboardTile from '../../../components/Molecule/LeaderboardTile/LeaderboardTile';
import LevelCard from '../../../components/Widgets/LevelCard/LevelCard';
import BadgesStrip from '../../../components/Widgets/BadgesStrip/BadgesStrip';
import QuestCard from '../../../components/Widgets/QuestCard/QuestCard';
import { formatINR } from '../../../utils/format';
import { electronicsMultiplierTiers } from '../../../data/configs';

const OPPS = [
  { sku: 'Vivo Y28 · ₹15k–20k',    band: 'Telecom · Samsung/Oppo/Vivo tier', earn: 50 },
  { sku: 'Samsung QLED 55"',       band: 'ENT · TV 40–60k tier',              earn: 100 },
  { sku: 'Lenovo IdeaPad 5',       band: 'IT · Laptop 47–52k tier',           earn: 70 },
  { sku: 'boAt Airdopes',          band: 'AIOT · Personal AV',                earn: 40 },
];

function multiplierPill(pct) {
  const tier = electronicsMultiplierTiers.find((t) => pct >= t.gateFromPct && pct < t.gateToPct);
  return tier ? { multiplier: tier.multiplier, label: tier.label } : { multiplier: 0, label: 'Below 85%' };
}

export default function ElectronicsView({ payout, employee, store, role }) {
  const finalTotal = payout.byDepartment.reduce((s, d) => s + d.finalPayout, 0);
  const baseTotal = payout.byDepartment.reduce((s, d) => s + d.baseIncentive, 0);
  const pct = payout.monthlyGoalTarget ? finalTotal / payout.monthlyGoalTarget : 0;

  // Build the hero 'goal' block
  const goalBlock = {
    target: payout.monthlyGoalTarget,
    pct,
  };

  return (
    <>
      {payout.ineligibleReason && (
        <div className={`${styles.notice} rise rise-2`}>
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

      {/* Department multiplier breakdown — heart of the Electronics model */}
      <section className={`${styles.pad} rise rise-3`}>
        <div className={styles.cardDark}>
          <div className={styles.cardHead}>
            <span className={styles.eyebrow}>Step 2 · Department multiplier</span>
            <span className={styles.smallPill}>
              Base {formatINR(baseTotal)} → Final {formatINR(finalTotal)}
            </span>
          </div>
          <p className={styles.explain}>
            Your base incentive from each product family is scaled by how the whole department is tracking this month. Below 85% of target earns no payout for that department, per §6.4.
          </p>

          <div className={styles.deptTable}>
            <div className={styles.deptHead}>
              <span>Dept</span>
              <span>Achieve</span>
              <span>×</span>
              <span>Base</span>
              <span>Final</span>
            </div>
            {payout.byDepartment.length === 0 ? (
              <div className={styles.emptyRow}>No departments with sales this period.</div>
            ) : (
              payout.byDepartment.map((d) => {
                const { multiplier, label } = multiplierPill(d.achievementPct);
                const zero = multiplier === 0;
                return (
                  <div key={d.department} className={`${styles.deptRow} ${zero ? styles.zeroRow : ''}`}>
                    <span className={styles.deptName}>{d.department}</span>
                    <span className={styles.deptAchieve}>{d.achievementPct}%</span>
                    <span className={styles.deptMult}>
                      {multiplier === 0 ? '—' : `${multiplier.toFixed(2)}×`}
                    </span>
                    <span className={styles.deptBase}>₹{d.baseIncentive}</span>
                    <span className={styles.deptFinal}>
                      {d.finalPayout === 0 ? '₹0' : `₹${d.finalPayout}`}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <details className={styles.tierDisclosure}>
            <summary className={styles.tierSummary}>How the multiplier works</summary>
            <ul className={styles.tierList}>
              {electronicsMultiplierTiers.map((t) => (
                <li key={t.label}>
                  <span className={styles.tierBand}>
                    {t.gateFromPct}% – {t.gateToPct === Infinity ? '∞' : `${t.gateToPct}%`}
                  </span>
                  <span className={styles.tierMult}>
                    {t.multiplier === 0 ? 'No payout' : `${Math.round(t.multiplier * 100)}%`}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </section>

      {/* Quests — daily/weekly tasks the admin portal pushes */}
      <section className={`${styles.pad} rise rise-4`}>
        <QuestCard employeeId={employee.employeeId} />
      </section>

      <section className={`rise rise-4`}>
        <OpportunityStrip opportunities={OPPS} />
      </section>

      {/* Level / tier card */}
      <section className={`${styles.pad} rise rise-5`}>
        <LevelCard mtdPayout={finalTotal} />
      </section>

      {/* Badges */}
      <section className={`rise rise-5`}>
        <BadgesStrip employeeId={employee.employeeId} />
      </section>

      <section className={`${styles.pad} rise rise-6`}>
        <LeaderboardTile rank={3} deltaAbove={40} scope="store" />
      </section>

      {/* Compliance footer — store eligibility + rule clauses in a collapsed note */}
      <section className={`${styles.pad} rise rise-5`}>
        <div className={styles.complianceCard}>
          <div className={styles.complianceHead}>
            <TrendingUp size={11} strokeWidth={2.4} />
            <span>Store eligibility</span>
          </div>
          <ul>
            <li>
              <span>Operational days (month)</span>
              <strong>{store?.operationalDaysInMonth ?? '—'} / 30</strong>
            </li>
            <li>
              <span>SFS / PAS / JioMart sales</span>
              <strong>Excluded</strong>
            </li>
            <li>
              <span>Payroll status</span>
              <strong>{employee?.payrollStatus}</strong>
            </li>
            <li>
              <span>Role</span>
              <strong>{role} · {employee?.employeeId}</strong>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
