import React, { useMemo } from 'react';
import { Users, TrendingUp, AlertTriangle } from 'lucide-react';
import styles from './StoreManagerHome.module.scss';
import { usePersona } from '../../context/PersonaContext';
import { VERTICALS, employees } from '../../data/masters';
import {
  electronicsPayoutsRD3675,
  groceryPayoutT28V,
  fnlPayoutTRN0241,
} from '../../data/payouts';
import {
  electronicsTargetsRD3675,
  electronicsActualsRD3675,
  electronicsMultiplierTiers,
  groceryCampaign,
  fnlWeeklyRules,
} from '../../data/configs';
import HeaderBar from '../../components/Organism/HeaderBar/HeaderBar';
import BottomNav from '../../components/Organism/BottomNav/BottomNav';
import { formatINR } from '../../utils/format';

function sumTarget(code, targets) {
  // Department target = sum of family targets
  const byDept = {};
  targets.forEach((t) => {
    byDept[t.department] = (byDept[t.department] || 0) + t.monthlyTarget;
  });
  return byDept;
}

function findMultiplier(pct) {
  const tier = electronicsMultiplierTiers.find((t) => pct >= t.gateFromPct && pct < t.gateToPct);
  return tier ? tier.multiplier : 0;
}

export default function StoreManagerHome() {
  const { active, employee, store } = usePersona();
  const firstName = employee.employeeName.split(' ')[0];

  const storeTeam = employees.filter((e) => e.storeCode === store.storeCode);

  // Build store-level summary per vertical
  const summary = useMemo(() => {
    if (active.vertical === VERTICALS.ELECTRONICS) {
      const targets = sumTarget(store.storeCode, electronicsTargetsRD3675);
      const totalTarget = Object.values(targets).reduce((s, v) => s + v, 0);
      const totalActual = electronicsActualsRD3675.reduce((s, d) => s + d.actualSales, 0);
      const totalPayout = electronicsPayoutsRD3675.reduce(
        (s, emp) => s + emp.byDepartment.reduce((x, d) => x + d.finalPayout, 0),
        0
      );
      return {
        kind: 'ELECTRONICS',
        totalTarget,
        totalActual,
        totalPayout,
        achievementPct: Math.round((totalActual / totalTarget) * 100),
        departments: electronicsActualsRD3675.map((d) => ({
          ...d,
          target: targets[d.department] || 0,
          multiplier: findMultiplier(d.achievementPct),
        })),
        employees: electronicsPayoutsRD3675.map((emp) => {
          const e = storeTeam.find((x) => x.employeeId === emp.employeeId);
          const total = emp.byDepartment.reduce((s, d) => s + d.finalPayout, 0);
          return {
            employeeId: emp.employeeId,
            employeeName: e?.employeeName || emp.employeeId,
            role: e?.role || '—',
            payrollStatus: e?.payrollStatus || 'ACTIVE',
            total,
            ineligible: !!emp.ineligibleReason,
          };
        }),
      };
    }
    if (active.vertical === VERTICALS.GROCERY) {
      const p = groceryPayoutT28V;
      const allEmployees = storeTeam.map((e) => ({
        employeeId: e.employeeId,
        employeeName: e.employeeName,
        role: e.role,
        payrollStatus: e.payrollStatus,
        total: p.individualPayout,
        ineligible: false,
      }));
      return {
        kind: 'GROCERY',
        campaign: groceryCampaign,
        totalTarget: p.targetSalesValue,
        totalActual: p.actualSalesValue,
        totalPayout: p.totalStoreIncentive,
        achievementPct: p.achievementPct,
        employees: allEmployees,
        projections: p.projections,
      };
    }
    if (active.vertical === VERTICALS.FNL) {
      const p = fnlPayoutTRN0241;
      const allEmployees = p.employees.map((emp) => {
        const e = storeTeam.find((x) => x.employeeId === emp.employeeId);
        return {
          employeeId: emp.employeeId,
          employeeName: e?.employeeName || emp.employeeId,
          role: e?.role || emp.role,
          payrollStatus: e?.payrollStatus || 'ACTIVE',
          daysPresent: emp.daysPresent,
          eligible: emp.eligible && emp.daysPresent >= fnlWeeklyRules.minWorkingDays,
          total: emp.payout,
          ineligible: !(emp.eligible && emp.daysPresent >= fnlWeeklyRules.minWorkingDays),
        };
      });
      return {
        kind: 'FNL',
        week: { start: p.weekStart, end: p.weekEnd },
        totalTarget: p.weeklySalesTarget,
        totalActual: p.actualWeeklyGrossSales,
        totalPayout: p.totalStoreIncentive,
        achievementPct: Math.round((p.actualWeeklyGrossSales / p.weeklySalesTarget) * 100),
        storeQualifies: p.storeQualifies,
        employees: allEmployees,
      };
    }
    return null;
  }, [active, store, storeTeam]);

  if (!summary) return null;

  return (
    <div className={styles.shell}>
      <BottomNav active="home" employeeInitial={firstName[0]} />

      <div className={styles.layout}>
        <HeaderBar employeeName={firstName} streak={0} />

        <main className={styles.main}>
          <div className={`${styles.datemark} rise rise-1`}>
            <span>Store Manager · {store.storeName}</span>
            <span className={styles.line} />
            <span>{active.vertical}</span>
          </div>

          {/* Store hero */}
          <section className={`${styles.pad} rise rise-2`}>
            <div className={styles.storeHero}>
              <div className={styles.heroEyebrow}>
                {summary.kind === 'ELECTRONICS' && 'April 2026 · Month to date'}
                {summary.kind === 'GROCERY' && `${summary.campaign.campaignName} · ${summary.campaign.campaignStart} → ${summary.campaign.campaignEnd}`}
                {summary.kind === 'FNL' && `Week · ${summary.week.start} → ${summary.week.end}`}
              </div>

              <div className={styles.heroRow}>
                <div>
                  <div className={styles.bigPct}>{summary.achievementPct}<span className={styles.sign}>%</span></div>
                  <div className={styles.bigCap}>of store {summary.kind === 'FNL' ? 'weekly' : 'period'} target</div>
                </div>
                <div className={styles.heroDivider} />
                <div>
                  <div className={styles.miniFig}>{formatINR(summary.totalActual)}</div>
                  <div className={styles.miniCap}>of {formatINR(summary.totalTarget)}</div>
                </div>
              </div>

              <div className={styles.payoutRow}>
                <div>
                  <div className={styles.payoutLabel}>Total store payout</div>
                  <div className={styles.payoutValue}>{formatINR(summary.totalPayout)}</div>
                </div>
                <div className={styles.teamNote}>
                  <Users size={11} strokeWidth={2.2} />
                  <span>{summary.employees.length} staff</span>
                </div>
              </div>
            </div>
          </section>

          {/* Electronics: department multipliers applied to each dept */}
          {summary.kind === 'ELECTRONICS' && (
            <section className={`${styles.pad} rise rise-3`}>
              <div className={styles.cardDark}>
                <div className={styles.cardHead}>
                  <span className={styles.eyebrow}>Department multipliers</span>
                </div>
                <div className={styles.deptList}>
                  {summary.departments.map((d) => {
                    const mPct = Math.round(d.multiplier * 100);
                    return (
                      <div key={d.department} className={styles.deptRow}>
                        <div>
                          <div className={styles.deptName}>{d.department}</div>
                          <div className={styles.deptSub}>{formatINR(d.actualSales)} of {formatINR(d.target)}</div>
                        </div>
                        <div className={styles.deptAch}>{d.achievementPct}%</div>
                        <div className={`${styles.deptMult} ${d.multiplier === 0 ? styles.multZero : ''}`}>
                          {d.multiplier === 0 ? 'NO PAYOUT' : `${mPct}%`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* F&L: qualification flag */}
          {summary.kind === 'FNL' && !summary.storeQualifies && (
            <section className={`${styles.pad} rise rise-3`}>
              <div className={styles.notice}>
                <AlertTriangle size={14} strokeWidth={2.4} />
                <div>
                  <div className={styles.noticeTitle}>Store didn't beat target</div>
                  <div className={styles.noticeBody}>Per §8.6, no payout this week for any role. Gap: {formatINR(summary.totalTarget - summary.totalActual)}.</div>
                </div>
              </div>
            </section>
          )}

          {/* Grocery projections */}
          {summary.kind === 'GROCERY' && (
            <section className={`${styles.pad} rise rise-3`}>
              <div className={styles.cardDark}>
                <div className={styles.cardHead}>
                  <span className={styles.eyebrow}>Projections · per employee</span>
                </div>
                <div className={styles.projList}>
                  {summary.projections.map((p) => (
                    <div key={p.scenario} className={styles.projRow}>
                      <span className={styles.projName}>{p.scenario}</span>
                      <span className={styles.projRate}>₹{p.rate}/pc</span>
                      <span className={styles.projTotal}>{formatINR(p.estPerEmployee)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Team roster with individual payouts */}
          <section className={`${styles.pad} rise rise-4`}>
            <div className={styles.cardLight}>
              <div className={styles.cardHead}>
                <span className={styles.eyebrow}>Team · {summary.employees.length}</span>
                <span className={styles.headSub}>
                  <TrendingUp size={10} strokeWidth={2.4} />
                  Individual payouts
                </span>
              </div>
              <div className={styles.rosterList}>
                {summary.employees.map((e) => (
                  <div key={e.employeeId} className={`${styles.rosterRow} ${e.ineligible ? styles.rosterInelig : ''}`}>
                    <div className={styles.rosterLeft}>
                      <span className={styles.rosterRole}>{e.role}</span>
                      <span className={styles.rosterName}>{e.employeeName}</span>
                      {e.payrollStatus !== 'ACTIVE' && (
                        <span className={styles.rosterStatus}>{e.payrollStatus.replace(/_/g, ' ')}</span>
                      )}
                      {typeof e.daysPresent === 'number' && (
                        <span className={styles.rosterDays}>{e.daysPresent}/7 days</span>
                      )}
                    </div>
                    <span className={styles.rosterPayout}>
                      {e.ineligible ? '—' : formatINR(e.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Compliance footer */}
          <section className={`${styles.pad} rise rise-5`}>
            <div className={styles.complianceCard}>
              <div className={styles.complianceHead}><span>Store eligibility</span></div>
              <ul>
                <li><span>Store code</span><strong>{store.storeCode}</strong></li>
                <li><span>Format</span><strong>{store.storeFormat}</strong></li>
                <li><span>City · State</span><strong>{store.city}, {store.state}</strong></li>
                <li><span>Status</span><strong>{store.storeStatus}</strong></li>
                <li><span>Operational days (month)</span><strong>{store.operationalDaysInMonth} / 30</strong></li>
              </ul>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
