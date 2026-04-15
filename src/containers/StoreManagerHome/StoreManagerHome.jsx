import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { Users, TrendingUp, AlertTriangle, Target, Zap, Clock, Trophy, Medal } from 'lucide-react';
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
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/nexus/atoms';

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
  const periodStart = dayjs().startOf('month').format('YYYY-MM-DD');
  const periodEnd = dayjs().endOf('month').format('YYYY-MM-DD');

  const storeDetailResult = useAsync(
    () => store?.storeCode ? fetchStoreIncentive(store.storeCode, active?.vertical, periodStart, periodEnd) : Promise.resolve(null),
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

      // Sort tiers by achievementFrom ascending for "next tier" logic
      const sortedTiers = [...tiers].sort((a, b) => Number(a.achievementFrom) - Number(b.achievementFrom));

      const findNextTier = (pct) => {
        for (const t of sortedTiers) {
          if (pct < Number(t.achievementFrom)) return { pct: Number(t.achievementFrom), mult: Number(t.multiplierPct) };
        }
        return null;
      };

      const storeAchPct = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0;

      return {
        kind: 'ELECTRONICS',
        totalTarget, totalActual, totalPayout,
        achievementPct: storeAchPct,
        daysLeft: dayjs().endOf('month').diff(dayjs(), 'day'),
        gapToTarget: totalTarget > totalActual ? totalTarget - totalActual : 0,
        departments: depts.map((d) => {
          const ach = Number(d.achievementPct) || 0;
          const target = Number(d.target) || 0;
          const actual = Number(d.actual) || 0;
          const next = findNextTier(ach);
          const gapToNext = next && target > 0 ? Math.max(0, Math.round(target * next.pct / 100 - actual)) : null;

          return {
            department: d.department,
            actualSales: actual,
            achievementPct: ach,
            target,
            multiplier: findMult(ach),
            nextTier: next,
            gapToNext,
          };
        }),
        // Find minimum achievement % needed to unlock any multiplier
        unlockPct: tiers.length > 0
          ? Math.min(...tiers.map((t) => Number(t.achievementFrom)))
          : null,
        employees: emps.map((emp) => {
          const master = storeTeam.find((x) => x.employeeId === emp.employeeId);
          return {
            employeeId: emp.employeeId,
            employeeName: emp.employeeName || master?.employeeName || emp.employeeId,
            role: emp.role || master?.role || '—',
            payrollStatus: master?.payrollStatus || 'ACTIVE',
            achievementPct: Number(emp.achievementPct) || 0,
            potential: Number(emp.baseIncentive) || 0,
            earned: Number(emp.finalIncentive) || 0,
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
        daysLeft: dayjs().endOf('month').diff(dayjs(), 'day'),
        gapToTarget: deptTarget > deptActual ? deptTarget - deptActual : 0,
        unlockPct: 100, // Grocery requires 100% store achievement
        employees: emps.map((emp) => {
          const master = storeTeam.find((x) => x.employeeId === emp.employeeId);
          return {
            employeeId: emp.employeeId,
            employeeName: emp.employeeName || master?.employeeName || emp.employeeId,
            role: emp.role || master?.role || '—',
            payrollStatus: master?.payrollStatus || 'ACTIVE',
            achievementPct: achPct, // store-level for grocery
            potential: Number(emp.baseIncentive) || perEmp,
            earned: perEmp,
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
        daysLeft: 7 - dayjs().day(), // days left in week
        gapToTarget: totalTarget > totalActual ? totalTarget - totalActual : 0,
        unlockPct: 100,
        employees: emps.map((emp) => {
          const master = storeTeam.find((x) => x.employeeId === emp.employeeId);
          return {
            employeeId: emp.employeeId,
            employeeName: emp.employeeName || master?.employeeName || emp.employeeId,
            role: emp.role || master?.role || '—',
            payrollStatus: master?.payrollStatus || 'ACTIVE',
            daysPresent: undefined, // needs attendance endpoint data
            achievementPct: Number(emp.achievementPct) || 0,
            potential: Number(emp.baseIncentive) || 0,
            earned: Number(emp.finalIncentive) || 0,
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

          {tab === 'board' && (
            <>
              <div className={`${styles.datemark} rise rise-1`}>
                <span>Leaderboard · {store.storeName}</span>
                <span className={styles.line} />
                <span>by earned</span>
              </div>
              <section className={`${styles.pad} rise rise-2`}>
                <StoreLeaderboard employees={summary.employees} storeName={store.storeName} />
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
                    {summary.achievementPct >= 100 && (
                      <HeroCard.TrendPill>Target exceeded!</HeroCard.TrendPill>
                    )}
                  </HeroCard.EyebrowRow>

                  <HeroCard.Amount suffix="%" tone={summary.achievementPct >= 100 ? 'success' : undefined}>
                    {summary.achievementPct}
                  </HeroCard.Amount>
                  <HeroCard.AmountCap>
                    of store {summary.kind === 'FNL' ? 'weekly' : 'period'} target
                  </HeroCard.AmountCap>

                  {/* Gap to target or surplus */}
                  {summary.achievementPct < 100 && summary.gapToTarget > 0 && (
                    <HeroCard.Caption>
                      <Target size={13} strokeWidth={2.2} />
                      <strong>{formatINR(summary.gapToTarget)}</strong> more to hit target
                    </HeroCard.Caption>
                  )}

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
                    <div style={{ textAlign: 'right' }}>
                      <HeroCard.FooterMeta>
                        <Users size={12} strokeWidth={2.2} />
                        <span>{summary.employees.length} staff</span>
                      </HeroCard.FooterMeta>
                      {typeof summary.daysLeft === 'number' && (
                        <HeroCard.FooterMeta>
                          <Clock size={12} strokeWidth={2.2} />
                          <span>{summary.daysLeft} days left</span>
                        </HeroCard.FooterMeta>
                      )}
                    </div>
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
                        const isClose = d.nextTier && d.gapToNext != null && d.gapToNext > 0 && (d.nextTier.pct - d.achievementPct) <= 15;

                        return (
                          <div key={d.department} className={styles.deptRow}>
                            <div className={styles.deptInfo}>
                              <div className={styles.deptName}>{d.department}</div>
                              <div className={styles.deptSub}>{formatINR(d.actualSales)} of {formatINR(d.target)}</div>
                              {isClose && (
                                <div className={styles.deptNudge}>
                                  <Zap size={11} strokeWidth={2.4} />
                                  {formatINR(d.gapToNext)} to unlock {d.nextTier.mult}%
                                </div>
                              )}
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
  const unlockPct = summary.unlockPct;

  return (
    <div className={styles.cardLight}>
      <div className={styles.cardHead}>
        <span className={styles.eyebrow}>Team · {summary.employees.length}</span>
        <span className={styles.headSub}>
          <TrendingUp size={11} strokeWidth={2.4} />
          Tap a row for detail
        </span>
      </div>

      {/* Column headers */}
      <div className={styles.rosterHeader}>
        <span>Employee</span>
        <span className={styles.rosterHeaderRight}>Potential</span>
        <span className={styles.rosterHeaderRight}>Earned</span>
      </div>

      <div className={styles.rosterList}>
        {summary.employees.map((e) => {
          const ach = e.achievementPct;
          const unlocked = unlockPct != null && ach >= unlockPct;

          return (
            <button
              key={e.employeeId}
              type="button"
              className={`${styles.rosterRow3Col} ${styles.rosterRowBtn} ${e.ineligible ? styles.rosterInelig : ''}`}
              onClick={() => onSelectRow && onSelectRow(e)}
            >
              <div className={styles.rosterLeft}>
                <span className={styles.rosterName}>{e.employeeName}</span>
                <div className={styles.rosterMeta}>
                  <span className={styles.rosterRole}>{e.role}</span>
                  {!e.ineligible && ach > 0 && (
                    <span className={`${styles.rosterAch} ${unlocked ? styles.rosterAchGreen : ''}`}>
                      {ach}%
                    </span>
                  )}
                  {e.payrollStatus !== 'ACTIVE' && (
                    <span className={styles.rosterStatus}>{e.payrollStatus.replace(/_/g, ' ')}</span>
                  )}
                  {typeof e.daysPresent === 'number' && (
                    <span className={styles.rosterDays}>{e.daysPresent}/7 days</span>
                  )}
                </div>
              </div>
              <span className={styles.rosterPotential}>
                {e.ineligible ? '—' : formatINR(e.potential)}
              </span>
              <span className={styles.rosterEarned}>
                {e.ineligible ? '—' : formatINR(e.earned)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StoreLeaderboard({ employees, storeName }) {
  const ranked = [...employees]
    .sort((a, b) => b.earned - a.earned)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

  return (
    <div className={styles.cardLight}>
      <div className={styles.cardHead}>
        <span className={styles.eyebrow}>
          <Trophy size={12} strokeWidth={2.4} style={{ marginRight: 4 }} />
          Store ranking
        </span>
        <span className={styles.headSub}>{storeName}</span>
      </div>

      {/* Podium — top 3 */}
      {ranked.length >= 3 && (
        <div className={styles.podium}>
          {[ranked[1], ranked[0], ranked[2]].map((e, i) => {
            const pos = [2, 1, 3][i];
            return (
              <div key={e.employeeId} className={`${styles.podiumSlot} ${pos === 1 ? styles.podiumFirst : ''}`}>
                <div className={styles.podiumMedal} style={{ color: medalColors[pos - 1] }}>
                  <Medal size={pos === 1 ? 28 : 22} strokeWidth={2} />
                </div>
                <div className={styles.podiumName}>{e.employeeName.split(' ')[0]}</div>
                <div className={styles.podiumAmount}>{formatINR(e.earned)}</div>
                <div className={styles.podiumRank}>#{pos}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div className={styles.boardList}>
        {ranked.map((e) => (
          <div key={e.employeeId} className={`${styles.boardRow} ${e.rank <= 3 ? styles.boardTop3 : ''}`}>
            <span className={styles.boardRank}>
              {e.rank <= 3 ? (
                <Medal size={14} strokeWidth={2.2} style={{ color: medalColors[e.rank - 1] }} />
              ) : (
                e.rank
              )}
            </span>
            <div className={styles.boardInfo}>
              <span className={styles.boardName}>{e.employeeName}</span>
              <span className={styles.rosterRole}>{e.role}</span>
            </div>
            <span className={styles.boardEarned}>{formatINR(e.earned)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
