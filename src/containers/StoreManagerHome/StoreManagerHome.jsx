import React, { useState, useMemo } from 'react';
import { Users, TrendingUp, AlertTriangle } from 'lucide-react';
import styles from './StoreManagerHome.module.scss';
import { usePersona } from '../../context/PersonaContext';
import { VERTICALS } from '../../data/masters';
import useAsync from '../../hooks/useAsync';
import { fetchStoreIncentive } from '../../api/incentives';
import { fetchEmployees } from '../../api/employees';
import { fetchRules } from '../../api/rules';
import HeaderBar from '../../components/Organism/HeaderBar/HeaderBar';
import BottomNav from '../../components/Organism/BottomNav/BottomNav';
import StoreTransactions from '../screens/StoreTransactions';
import ComplianceLink from '../../components/Molecule/ComplianceLink/ComplianceLink';
import HeroCard from '../../components/Molecule/HeroCard/HeroCard';
import EmployeeDetailDrawer from '../../components/Organism/EmployeeDetailDrawer/EmployeeDetailDrawer';
import { formatINR, formatDateRange } from '../../utils/format';

export default function StoreManagerHome() {
  const [tab, setTab] = useState('home');
  const [selectedRow, setSelectedRow] = useState(null);
  const [txEmpFilter, setTxEmpFilter] = useState('ALL');
  const { active, employee, store } = usePersona();

  const handleViewAllTransactions = (employeeId) => {
    setTxEmpFilter(employeeId);
    setSelectedRow(null);   // close the drawer
    setTab('tx');           // switch to the Transactions tab
  };

  const handleNavigate = (id) => {
    if (id !== 'tx') setTxEmpFilter('ALL');  // clear pre-filter when leaving tx
    setTab(id);
  };
  const firstName = employee?.employeeName?.split(' ')[0] ?? '';

  /* ---- API data ---- */
  const storeDetailResult = useAsync(
    () => store?.storeCode ? fetchStoreIncentive(store.storeCode, active?.vertical) : Promise.resolve(null),
    [store?.storeCode, active?.vertical],
  );

  const employeesResult = useAsync(
    () => store?.storeCode ? fetchEmployees(store.storeCode) : Promise.resolve([]),
    [store?.storeCode],
  );

  const rulesResult = useAsync(
    () => active?.vertical ? fetchRules(active.vertical) : Promise.resolve([]),
    [active?.vertical],
  );

  const storeTeam = useMemo(() => employeesResult.data || [], [employeesResult.data]);

  const summary = useMemo(() => {
    const storeDetail = storeDetailResult.data;
    const plans = rulesResult.data || [];

    if (!storeDetail || !active) return null;

    if (active.vertical === VERTICALS.ELECTRONICS) {
      const depts = storeDetail.departments || [];
      const emps = storeDetail.employees || [];
      const totalTarget = depts.reduce((s, d) => s + (Number(d.target) || 0), 0);
      const totalActual = depts.reduce((s, d) => s + (Number(d.actual) || 0), 0);
      const totalPayout = emps.reduce((s, e) => s + (Number(e.finalIncentive) || 0), 0);

      // Get multiplier tiers from active plan
      const activePlan = plans.find((p) => p.status === 'ACTIVE');
      const tiers = activePlan?.achievementMultipliers || [];
      const findMult = (pct) => {
        const t = tiers.find((x) => pct >= Number(x.achievementFrom) && pct < Number(x.achievementTo));
        return t ? Number(t.multiplierPct) / 100 : 0;
      };

      return {
        kind: 'ELECTRONICS',
        totalTarget, totalActual, totalPayout,
        achievementPct: totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0,
        departments: depts.map((d) => ({
          department: d.department,
          actualSales: Number(d.actual) || 0,
          achievementPct: Number(d.achievementPct) || 0,
          target: Number(d.target) || 0,
          multiplier: findMult(Number(d.achievementPct) || 0),
        })),
        employees: emps.map((emp) => {
          const master = storeTeam.find((x) => x.employeeId === emp.employeeId);
          return {
            employeeId: emp.employeeId,
            employeeName: emp.employeeName || master?.employeeName || emp.employeeId,
            role: emp.role || master?.role || '—',
            payrollStatus: master?.payrollStatus || 'ACTIVE',
            total: Number(emp.finalIncentive) || 0,
            ineligible: master?.payrollStatus && master.payrollStatus !== 'ACTIVE',
          };
        }),
      };
    }

    if (active.vertical === VERTICALS.GROCERY) {
      // storeDetail has summary with totalIncentive, and employees
      const emps = storeDetail.employees || [];
      const empCount = emps.length || 1;
      const totalPayout = Number(storeDetail.summary?.totalIncentive) || 0;
      const perEmp = empCount > 0 ? Math.round(totalPayout / empCount) : 0;

      // Get campaign config from rules
      const activePlan = plans.find((p) => p.status === 'ACTIVE');
      const campaign = activePlan?.campaignConfigs?.[0] || null;
      // Get payout slabs for projections
      const slabs = campaign?.payoutSlabs || [];
      const totalTarget = Number(campaign?.storeTargets?.find((st) => st.storeCode === store.storeCode)?.targetValue) || 0;
      // Use departments if available, or summary
      const deptTarget = storeDetail.departments?.reduce((s, d) => s + (Number(d.target) || 0), 0) || totalTarget;
      const deptActual = storeDetail.departments?.reduce((s, d) => s + (Number(d.actual) || 0), 0) || 0;
      const achPct = deptTarget > 0 ? Math.round((deptActual / deptTarget) * 100) : 0;

      return {
        kind: 'GROCERY',
        campaign: campaign ? { campaignName: campaign.campaignName, campaignStart: campaign.startDate, campaignEnd: campaign.endDate } : {},
        totalTarget: deptTarget,
        totalActual: deptActual,
        totalPayout,
        achievementPct: achPct,
        employees: emps.map((emp) => {
          const master = storeTeam.find((x) => x.employeeId === emp.employeeId);
          return {
            employeeId: emp.employeeId,
            employeeName: emp.employeeName || master?.employeeName || emp.employeeId,
            role: emp.role || master?.role || '—',
            payrollStatus: master?.payrollStatus || 'ACTIVE',
            total: perEmp,
            ineligible: false,
          };
        }),
        projections: slabs.filter((s) => Number(s.achievementFrom) >= 100).map((s) => ({
          scenario: `${Number(s.achievementFrom)}%`,
          rate: Number(s.perPieceRate) || 0,
          estPerEmployee: 0, // rough placeholder
        })),
      };
    }

    if (active.vertical === VERTICALS.FNL) {
      const emps = storeDetail.employees || [];
      const depts = storeDetail.departments || [];
      const totalTarget = depts.reduce((s, d) => s + (Number(d.target) || 0), 0);
      const totalActual = depts.reduce((s, d) => s + (Number(d.actual) || 0), 0);
      const totalPayout = emps.reduce((s, e) => s + (Number(e.finalIncentive) || 0), 0);

      return {
        kind: 'FNL',
        week: { start: '', end: '' }, // Will need period info
        totalTarget,
        totalActual,
        totalPayout,
        achievementPct: totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0,
        storeQualifies: totalActual >= totalTarget,
        employees: emps.map((emp) => {
          const master = storeTeam.find((x) => x.employeeId === emp.employeeId);
          return {
            employeeId: emp.employeeId,
            employeeName: emp.employeeName || master?.employeeName || emp.employeeId,
            role: emp.role || master?.role || '—',
            payrollStatus: master?.payrollStatus || 'ACTIVE',
            daysPresent: undefined, // needs attendance endpoint data
            eligible: true, // placeholder
            total: Number(emp.finalIncentive) || 0,
            ineligible: false,
          };
        }),
      };
    }

    return null;
  }, [active, store, storeTeam, storeDetailResult.data, rulesResult.data]);

  const dataLoading = storeDetailResult.loading || employeesResult.loading || rulesResult.loading;
  if (!active || !employee || !store || dataLoading) {
    return <div className={styles.shell}><div className={styles.loading}>Loading...</div></div>;
  }

  if (!summary) return null;

  // Look up the full master record for the selected roster row (drawer needs it)
  const selectedEmployee = selectedRow
    ? storeTeam.find((e) => e.employeeId === selectedRow.employeeId) || null
    : null;

  return (
    <div className={styles.shell}>
      <BottomNav active={tab} role="SM" onNavigate={handleNavigate} />

      <EmployeeDetailDrawer
        employee={selectedEmployee}
        summaryRow={selectedRow?.row}
        open={!!selectedRow}
        onClose={() => setSelectedRow(null)}
        onViewAllTransactions={handleViewAllTransactions}
      />

      <div className={styles.layout}>
        <HeaderBar
          employeeName={tab === 'home' ? firstName : null}
          streak={0}
          showStreak={false}
        />

        <main className={styles.main}>
          {tab === 'team' && (
            <>
              <div className={`${styles.datemark} rise rise-1`}>
                <span>Team · {store.storeName}</span>
                <span className={styles.line} />
                <span>{summary.employees.length} staff</span>
              </div>
              <section className={`${styles.pad} rise rise-2`}>
                <TeamRoster summary={summary} onSelectRow={(row) => setSelectedRow({ row, employeeId: row.employeeId })} />
              </section>
            </>
          )}

          {tab === 'tx' && (
            <StoreTransactions
              storeCode={store.storeCode}
              initialEmployeeFilter={txEmpFilter}
            />
          )}

          {tab === 'home' && (
            <>
              <section className={`${styles.pad} rise rise-2`}>
                <HeroCard>
                  <HeroCard.EyebrowRow>
                    <HeroCard.Eyebrow withDot>
                      {summary.kind === 'ELECTRONICS' && 'April 2026 · Month to date'}
                      {summary.kind === 'GROCERY' && `${summary.campaign.campaignName} · ${formatDateRange(summary.campaign.campaignStart, summary.campaign.campaignEnd)}`}
                      {summary.kind === 'FNL' && `Week · ${summary.week.start} → ${summary.week.end}`}
                    </HeroCard.Eyebrow>
                  </HeroCard.EyebrowRow>

                  <HeroCard.Amount suffix="%">{summary.achievementPct}</HeroCard.Amount>
                  <HeroCard.AmountCap>
                    of store {summary.kind === 'FNL' ? 'weekly' : 'period'} target
                  </HeroCard.AmountCap>

                  <HeroCard.Figures>
                    <HeroCard.Figure
                      value={formatINR(summary.totalActual)}
                      cap={`of ${formatINR(summary.totalTarget)}`}
                    />
                  </HeroCard.Figures>

                  <HeroCard.FooterBlock>
                    <div>
                      <HeroCard.FooterLabel>Total store payout</HeroCard.FooterLabel>
                      <HeroCard.FooterValue>{formatINR(summary.totalPayout)}</HeroCard.FooterValue>
                    </div>
                    <HeroCard.FooterMeta>
                      <Users size={12} strokeWidth={2.2} />
                      <span>{summary.employees.length} staff</span>
                    </HeroCard.FooterMeta>
                  </HeroCard.FooterBlock>
                </HeroCard>
              </section>

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

              {summary.kind === 'FNL' && !summary.storeQualifies && (
                <section className={`${styles.pad} rise rise-3`}>
                  <div className={styles.notice}>
                    <AlertTriangle size={14} strokeWidth={2.4} />
                    <div>
                      <div className={styles.noticeTitle}>Store didn't beat target</div>
                      <div className={styles.noticeBody}>No payout this week for any role — the store needed to beat the weekly target. Gap: {formatINR(summary.totalTarget - summary.totalActual)}.</div>
                    </div>
                  </div>
                </section>
              )}

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

              <section className={`${styles.pad} rise rise-4`}>
                <TeamRoster summary={summary} onSelectRow={(row) => setSelectedRow({ row, employeeId: row.employeeId })} />
              </section>

              <section className={`${styles.pad} rise rise-5`}>
                <ComplianceLink
                  label="Store eligibility"
                  items={[
                    { label: 'Store code',              value: store.storeCode },
                    { label: 'Format',                   value: store.storeFormat },
                    { label: 'City · State',             value: `${store.city}, ${store.state}` },
                    { label: 'Status',                   value: store.storeStatus },
                    { label: 'Operational days',         value: `${store.operationalDaysInMonth} / 30` },
                  ]}
                />
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function TeamRoster({ summary, onSelectRow }) {
  return (
    <div className={styles.cardLight}>
      <div className={styles.cardHead}>
        <span className={styles.eyebrow}>Team · {summary.employees.length}</span>
        <span className={styles.headSub}>
          <TrendingUp size={11} strokeWidth={2.4} />
          Tap a row for detail
        </span>
      </div>
      <div className={styles.rosterList}>
        {summary.employees.map((e) => (
          <button
            key={e.employeeId}
            type="button"
            className={`${styles.rosterRow} ${styles.rosterRowBtn} ${e.ineligible ? styles.rosterInelig : ''}`}
            onClick={() => onSelectRow && onSelectRow(e)}
          >
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
          </button>
        ))}
      </div>
    </div>
  );
}
