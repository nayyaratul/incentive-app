import React, { useState, useMemo } from 'react';
import { Users, TrendingUp, AlertTriangle, Calendar, Check, X as XIcon } from 'lucide-react';
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
import HeroCard from '../../components/Molecule/HeroCard/HeroCard';
import EmployeeDetailDrawer from '../../components/Organism/EmployeeDetailDrawer/EmployeeDetailDrawer';
import LeaderboardDrawer from '../../components/Organism/LeaderboardDrawer/LeaderboardDrawer';
import BadgesStrip from '../../components/Widgets/BadgesStrip/BadgesStrip';
import QuestCard from '../../components/Widgets/QuestCard/QuestCard';
import StreakNote from '../../components/Molecule/StreakNote/StreakNote';
import MomentumPills from '../../components/Molecule/MomentumPills/MomentumPills';
import TabPageHeader from '../../components/Molecule/TabPageHeader/TabPageHeader';
import TargetTrendBreakdown from '../../components/Molecule/TargetTrendBreakdown/TargetTrendBreakdown';
import { formatINR, formatDateRange } from '../../utils/format';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/nexus/atoms';
import { employees as staticEmployees } from '../../data/masters';
import {
  electronicsPayoutsRD3675,
  groceryPayoutT28V,
  fnlPayoutTRN0241,
} from '../../data/payouts';
import {
  electronicsActualsRD3675,
  electronicsTargetsRD3675,
  groceryCampaign,
  fnlWeeklyRules,
} from '../../data/configs';

const useMock = process.env.REACT_APP_USE_MOCK_DATA === 'true';

export default function StoreManagerHome() {
  const [tab, setTab] = useState('home');
  const [selectedRow, setSelectedRow] = useState(null);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
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
    () => {
      if (!store?.storeCode || !active?.vertical) return Promise.resolve(null);
      if (useMock) return Promise.resolve(buildMockStoreDetail(active.vertical, store.storeCode));
      return fetchStoreIncentive(store.storeCode, active.vertical);
    },
    [store?.storeCode, active?.vertical],
  );

  const employeesResult = useAsync(
    () => {
      if (!store?.storeCode) return Promise.resolve([]);
      if (useMock) {
        return Promise.resolve(staticEmployees.filter((e) => e.storeCode === store.storeCode));
      }
      return fetchEmployees(store.storeCode);
    },
    [store?.storeCode],
  );

  const rulesResult = useAsync(
    () => {
      if (!active?.vertical) return Promise.resolve([]);
      if (useMock) return Promise.resolve(buildMockRules(active.vertical));
      return fetchRules(active.vertical);
    },
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
      const piecesSold = Number(storeDetail.summary?.totalPiecesSold) || 0;
      const currentSlab = slabs.find((s) => {
        const from = Number(s.achievementFrom);
        const to = Number(s.achievementTo);
        return achPct >= from && (Number.isFinite(to) ? achPct < to : true);
      });
      const currentRate = Number(currentSlab?.perPieceRate) || 0;

      return {
        kind: 'GROCERY',
        campaign: campaign
          ? {
              campaignName: campaign.campaignName,
              campaignStart: campaign.startDate,
              campaignEnd: campaign.endDate,
              geography: campaign.geography || 'Kerala',
              channel: campaign.channel || 'OFFLINE',
              incentiveType: campaign.incentiveType || activePlan?.incentiveType || 'Multi-Article',
            }
          : {
              incentiveType: 'Multi-Article',
            },
        totalTarget: deptTarget,
        totalActual: deptActual,
        totalPayout,
        achievementPct: achPct,
        piecesSoldTotal: piecesSold,
        appliedRate: currentRate,
        splitPerEmployee: perEmp,
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
          atSalesValue: deptTarget > 0 ? Math.round((Number(s.achievementFrom) / 100) * deptTarget) : 0,
          estTotalIncentive: (Number(s.perPieceRate) || 0) * piecesSold,
          estPerEmployee: empCount > 0 ? Math.round(((Number(s.perPieceRate) || 0) * piecesSold) / empCount) : 0,
        })),
      };
    }

    if (active.vertical === VERTICALS.FNL) {
      const emps = storeDetail.employees || [];
      const depts = storeDetail.departments || [];
      const totalTarget = depts.reduce((s, d) => s + (Number(d.target) || 0), 0);
      const totalActual = depts.reduce((s, d) => s + (Number(d.actual) || 0), 0);
      const totalPayout = emps.reduce((s, e) => s + (Number(e.finalIncentive) || 0), 0);
      const weekStart = storeDetail?.summary?.weekStart || fnlPayoutTRN0241.weekStart;
      const weekEnd = storeDetail?.summary?.weekEnd || fnlPayoutTRN0241.weekEnd;

      return {
        kind: 'FNL',
        week: { start: weekStart, end: weekEnd },
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
            daysPresent: Number(emp.daysPresent),
            eligible: Number(emp.daysPresent) >= Number(fnlWeeklyRules.minWorkingDays || 5),
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

  const myRank = buildMyRankFromSummary(summary, employee?.employeeId);
  const selfPayout = summary.employees.find((e) => e.employeeId === employee?.employeeId)?.total || 0;
  const selfRow = summary.employees.find((e) => e.employeeId === employee?.employeeId) || null;
  const myDaysPresent = Number(selfRow?.daysPresent);
  const minWorkingDays = Number(fnlWeeklyRules.minWorkingDays || 5);
  const eligible5Day = Number.isFinite(myDaysPresent) && myDaysPresent >= minWorkingDays;
  const cycleMeta = buildCycleMeta(active?.vertical, employee, storeDetailResult.data, summary);

  // Look up the full master record for the selected roster row (drawer needs it)
  const selectedEmployee = selectedRow
    ? storeTeam.find((e) => e.employeeId === selectedRow.employeeId) || null
    : null;

  return (
    <div className={styles.shell}>
      <BottomNav active={tab} role={active.role} onNavigate={handleNavigate} />

      <LeaderboardDrawer
        open={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        myRank={myRank}
      />

      <EmployeeDetailDrawer
        employee={selectedEmployee}
        summaryRow={selectedRow?.row}
        open={!!selectedRow}
        onClose={() => setSelectedRow(null)}
        onViewAllTransactions={handleViewAllTransactions}
      />

      <div className={styles.layout}>
        {tab === 'home' && (
          <HeaderBar
            employeeName={firstName}
            rank={myRank?.rank}
            onOpenLeaderboard={() => setLeaderboardOpen(true)}
          />
        )}

        <main className={styles.main}>
          {tab === 'team' && (
            <section className={`${styles.pad} ${styles.teamStack}`}>
              <div className="rise rise-1">
                <TabPageHeader
                  title="Team"
                  subtitle={`${store.storeName} · ${summary.employees.length} staff`}
                />
              </div>
              <div className="rise rise-2">
                <TeamRoster summary={summary} onSelectRow={(row) => setSelectedRow({ row, employeeId: row.employeeId })} />
              </div>
            </section>
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
                    {summary.kind === 'GROCERY' ? (
                      <>
                        <HeroCard.Eyebrow withDot>Live campaign</HeroCard.Eyebrow>
                        <HeroCard.Badge tone="brand">{summary.campaign.incentiveType}</HeroCard.Badge>
                      </>
                    ) : (
                      <HeroCard.Eyebrow withDot>
                        {summary.kind === 'ELECTRONICS' && 'April 2026 · Month to date'}
                        {summary.kind === 'FNL' && `Week of ${summary.week.start}`}
                      </HeroCard.Eyebrow>
                    )}
                  </HeroCard.EyebrowRow>

                  {summary.kind === 'GROCERY' && (
                    <>
                      <HeroCard.Title>{summary.campaign.campaignName}</HeroCard.Title>
                      <HeroCard.Meta>
                        <Calendar size={11} strokeWidth={2.2} />
                        <span>{formatDateRange(summary.campaign.campaignStart, summary.campaign.campaignEnd)}</span>
                        <HeroCard.MetaDot />
                        <span>{summary.campaign.geography}</span>
                        <HeroCard.MetaDot />
                        <span>{summary.campaign.channel}</span>
                      </HeroCard.Meta>
                    </>
                  )}

                  <HeroCard.Amount suffix="%">{summary.achievementPct}</HeroCard.Amount>
                  <HeroCard.AmountCap>
                    {summary.kind === 'GROCERY'
                      ? `of ${formatINR(summary.totalTarget)} store target`
                      : `of store ${summary.kind === 'FNL' ? 'weekly' : 'period'} target`}
                  </HeroCard.AmountCap>

                  <TargetTrendBreakdown
                    actualValue={summary.totalActual}
                    targetValue={summary.totalTarget}
                  />

                  {summary.kind === 'GROCERY' && (
                    <HeroCard.Caption>
                      <strong>{summary.piecesSoldTotal}</strong>
                      <span>pieces sold</span>
                      <em>{summary.appliedRate > 0 ? `₹${summary.appliedRate}/piece` : 'rate not unlocked'}</em>
                    </HeroCard.Caption>
                  )}

                  <HeroCard.FooterBlock>
                    <div>
                      <HeroCard.FooterLabel>
                        {summary.kind === 'GROCERY' ? 'Your payout so far' : 'Total store payout'}
                      </HeroCard.FooterLabel>
                      <HeroCard.FooterValue>
                        {summary.kind === 'GROCERY' ? formatINR(selfPayout) : formatINR(summary.totalPayout)}
                      </HeroCard.FooterValue>
                    </div>
                    <HeroCard.FooterMeta>
                      <Users size={12} strokeWidth={2.2} />
                      <span>
                        {summary.kind === 'GROCERY'
                          ? `Split equally across ${summary.employees.length} staff`
                          : `${summary.employees.length} staff`}
                      </span>
                    </HeroCard.FooterMeta>
                  </HeroCard.FooterBlock>
                </HeroCard>
              </section>

              <section className={`${styles.streakRow} rise rise-3`}>
                <StreakNote streak={cycleMeta.streak} />
              </section>

              <section className={`${styles.streakRow} rise rise-3`}>
                <MomentumPills
                  thisPeriodAmount={selfPayout}
                  lastPeriodAmount={cycleMeta.lastPeriodAmount}
                  lastPeriodLabel={cycleMeta.lastPeriodLabel}
                  nextPayoutDate={cycleMeta.nextPayoutDate}
                />
              </section>

              {summary.kind === 'FNL' && Number.isFinite(myDaysPresent) && (
                <section className={`${styles.pad} rise rise-3`}>
                  <div className={eligible5Day ? styles.eligibleOk : styles.eligibleNo}>
                    <div className={styles.eligIconWrap}>
                      {eligible5Day
                        ? <Check size={14} strokeWidth={2.6} />
                        : <XIcon size={14} strokeWidth={2.6} />}
                    </div>
                    <div className={styles.eligBody}>
                      <div className={styles.eligTitle}>
                        {eligible5Day ? 'Eligible this week' : 'Not eligible this week'}
                      </div>
                      <div className={styles.eligSub}>
                        You have <strong>{myDaysPresent}</strong> PRESENT days · minimum {minWorkingDays} needed
                      </div>
                    </div>
                    <div className={styles.dayPips} aria-hidden="true">
                      {Array.from({ length: 7 }, (_, i) => (
                        <span key={i} className={i < myDaysPresent ? styles.pipOn : styles.pipOff} />
                      ))}
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

              <section className={`rise rise-4`}>
                <QuestCard employeeId={employee.employeeId} vertical={active.vertical} />
              </section>

              <section className={`rise rise-4`}>
                <BadgesStrip employeeId={employee.employeeId} vertical={active.vertical} />
              </section>

              {summary.kind === 'ELECTRONICS' && (
                <section className={`${styles.pad} ${styles.compactAccordion} rise rise-5`}>
                  <Accordion variant="default" type="multiple">
                    <AccordionItem value="dept-multipliers">
                      <AccordionTrigger>Department multipliers</AccordionTrigger>
                      <AccordionContent>
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
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="eligibility">
                      <AccordionTrigger>Store eligibility</AccordionTrigger>
                      <AccordionContent>
                        <dl className={styles.compactList}>
                          {[
                            { label: 'Store code', value: store.storeCode },
                            { label: 'Format', value: store.storeFormat },
                            { label: 'City · State', value: `${store.city}, ${store.state}` },
                            { label: 'Status', value: store.storeStatus },
                            { label: 'Operational days', value: `${store.operationalDaysInMonth} / 30` },
                          ].map((it) => (
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
              )}

              {summary.kind === 'GROCERY' && (
                <section className={`${styles.pad} ${styles.compactAccordion} rise rise-5`}>
                  <Accordion variant="default" type="multiple">
                    <AccordionItem value="projections">
                      <AccordionTrigger>Projections · per employee</AccordionTrigger>
                      <AccordionContent>
                        <div className={styles.projList}>
                          {summary.projections.map((p) => (
                            <div key={p.scenario} className={styles.projRow}>
                              <div className={styles.projLeft}>
                                <span className={styles.projName}>{p.scenario}</span>
                                <span className={styles.projAt}>at {formatINR(p.atSalesValue)}</span>
                              </div>
                              <span className={styles.projRate}>₹{p.rate}/pc</span>
                              <div className={styles.projRight}>
                                <span className={styles.projTotal}>{formatINR(p.estPerEmployee)}</span>
                                <span className={styles.projTotalSub}>per employee</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="eligibility">
                      <AccordionTrigger>Store eligibility</AccordionTrigger>
                      <AccordionContent>
                        <dl className={styles.compactList}>
                          {[
                            { label: 'Store code', value: store.storeCode },
                            { label: 'Format', value: store.storeFormat },
                            { label: 'City · State', value: `${store.city}, ${store.state}` },
                            { label: 'Status', value: store.storeStatus },
                            { label: 'Operational days', value: `${store.operationalDaysInMonth} / 30` },
                          ].map((it) => (
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
              )}

              {summary.kind === 'FNL' && (
                <section className={`${styles.pad} rise rise-5`}>
                  <Accordion variant="default" type="multiple">
                    <AccordionItem value="eligibility">
                      <AccordionTrigger>Store eligibility</AccordionTrigger>
                      <AccordionContent>
                        <dl className={styles.compactList}>
                          {[
                            { label: 'Store code', value: store.storeCode },
                            { label: 'Format', value: store.storeFormat },
                            { label: 'City · State', value: `${store.city}, ${store.state}` },
                            { label: 'Status', value: store.storeStatus },
                            { label: 'Operational days', value: `${store.operationalDaysInMonth} / 30` },
                          ].map((it) => (
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
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function TeamRoster({ summary, onSelectRow }) {
  return (
    <div className={`${styles.cardLight} ${styles.teamRosterCard}`}>
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

function buildMyRankFromSummary(summary, selfEmployeeId) {
  const rows = summary?.employees || [];
  if (!selfEmployeeId || rows.length === 0) return null;

  const sorted = [...rows]
    .map((r) => ({
      name: r.employeeName || r.employeeId,
      earned: Number(r.total) || 0,
      isSelf: r.employeeId === selfEmployeeId,
    }))
    .sort((a, b) => b.earned - a.earned)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  const self = sorted.find((r) => r.isSelf);
  if (!self) return null;

  const selfIdx = sorted.findIndex((r) => r.isSelf);
  const deltaAbove = selfIdx > 0 ? (sorted[selfIdx - 1].earned - self.earned) : 0;

  return {
    rank: self.rank,
    deltaAbove,
    scope: 'store',
    scopeNote: 'by incentive payout',
    unitLabel: 'earned',
    top: sorted.slice(0, 5),
  };
}

function buildCycleMeta(vertical, employee, storeDetail, summary) {
  const byVertical = {
    ELECTRONICS: {
      streak: { current: 6, longest: 11, label: 'working days', caption: 'present + selling' },
      lastPeriodLabel: 'last month',
      nextPayoutDate: nextMonthlyPayoutDate(),
    },
    GROCERY: {
      streak: { current: 5, longest: 9, label: 'working days', caption: 'present + selling' },
      lastPeriodLabel: 'last campaign',
      nextPayoutDate: resolveGroceryPayoutDate(summary),
    },
    FNL: {
      streak: { current: 4, longest: 8, label: 'working days', caption: 'present + selling' },
      lastPeriodLabel: 'last week',
      nextPayoutDate: nextMondayPayoutDate(),
    },
  };

  const meta = byVertical[vertical] || byVertical.ELECTRONICS;
  const tenureDays = employee?.dateOfJoining ? daysSince(employee.dateOfJoining) : 999;
  const reportedLast =
    Number(storeDetail?.summary?.lastPeriodPayout) ||
    Number(storeDetail?.summary?.lastCampaignPayoutPerEmp) ||
    Number(storeDetail?.summary?.lastWeekPayoutPerEmp) ||
    0;

  // Comparison appears only after first cycle. If no backend last-cycle figure
  // exists yet, derive a gentle baseline from current payout for tenured staff.
  const selfPayout = summary?.employees?.find((e) => e.employeeId === employee?.employeeId)?.total || 0;
  const derivedLast = tenureDays >= 30 && selfPayout > 0 ? Math.round(selfPayout * 0.9) : 0;

  return {
    ...meta,
    lastPeriodAmount: reportedLast > 0 ? reportedLast : derivedLast,
  };
}

function resolveGroceryPayoutDate(summary) {
  const end = summary?.campaign?.campaignEnd;
  if (!end) return null;
  const d = new Date(end);
  if (Number.isNaN(d.getTime())) return null;
  d.setDate(d.getDate() + 5);
  return d.toISOString().slice(0, 10);
}

function nextMonthlyPayoutDate() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(7);
  return d.toISOString().slice(0, 10);
}

function nextMondayPayoutDate() {
  const d = new Date();
  const day = d.getDay(); // 0..6
  const diff = (8 - day) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function daysSince(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return 0;
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function buildMockStoreDetail(vertical, storeCode) {
  if (vertical === VERTICALS.ELECTRONICS && storeCode === 'RD3675') {
    const byDeptTarget = electronicsTargetsRD3675.reduce((acc, row) => {
      const next = { ...(acc[row.department] || { target: 0, actual: 0, achievementPct: 0 }) };
      next.target += Number(row.monthlyTarget) || 0;
      acc[row.department] = next;
      return acc;
    }, {});

    for (const row of electronicsActualsRD3675) {
      const next = byDeptTarget[row.department] || { target: 0, actual: 0, achievementPct: 0 };
      next.actual = Number(row.actualSales) || 0;
      next.achievementPct = Number(row.achievementPct) || 0;
      byDeptTarget[row.department] = next;
    }

    const departments = Object.entries(byDeptTarget).map(([department, vals]) => ({
      department,
      target: vals.target,
      actual: vals.actual,
      achievementPct: vals.achievementPct,
    }));

    const employees = electronicsPayoutsRD3675.map((p) => {
      const total = (p.byDepartment || []).reduce((sum, d) => sum + (Number(d.finalPayout) || 0), 0);
      const master = staticEmployees.find((e) => e.employeeId === p.employeeId);
      return {
        employeeId: p.employeeId,
        employeeName: master?.employeeName || p.employeeId,
        role: master?.role || 'SA',
        finalIncentive: total,
      };
    });

    return { departments, employees, summary: { totalIncentive: employees.reduce((s, e) => s + e.finalIncentive, 0) } };
  }

  if (vertical === VERTICALS.GROCERY && storeCode === groceryPayoutT28V.storeCode) {
    const employees = staticEmployees
      .filter((e) => e.storeCode === storeCode)
      .map((e) => ({
        employeeId: e.employeeId,
        employeeName: e.employeeName,
        role: e.role,
        finalIncentive: groceryPayoutT28V.individualPayout,
      }));

    return {
      departments: [
        {
          department: 'Campaign',
          target: groceryPayoutT28V.targetSalesValue,
          actual: groceryPayoutT28V.actualSalesValue,
          achievementPct: groceryPayoutT28V.achievementPct,
        },
      ],
      employees,
      summary: {
        totalIncentive: groceryPayoutT28V.totalStoreIncentive,
        totalPiecesSold: groceryPayoutT28V.piecesSoldTotal,
      },
    };
  }

  if (vertical === VERTICALS.FNL && storeCode === 'TRN0241') {
    const employees = fnlPayoutTRN0241.employees.map((e) => {
      const master = staticEmployees.find((m) => m.employeeId === e.employeeId);
      return {
        employeeId: e.employeeId,
        employeeName: master?.employeeName || e.employeeId,
        role: e.role,
        daysPresent: Number(e.daysPresent),
        finalIncentive: e.payout,
      };
    });

    return {
      departments: [
        {
          department: 'Weekly',
          target: fnlPayoutTRN0241.weeklySalesTarget,
          actual: fnlPayoutTRN0241.actualWeeklyGrossSales,
          achievementPct: Math.round(
            (fnlPayoutTRN0241.actualWeeklyGrossSales / fnlPayoutTRN0241.weeklySalesTarget) * 100,
          ),
        },
      ],
      employees,
      summary: {
        totalIncentive: fnlPayoutTRN0241.totalStoreIncentive,
      },
    };
  }

  return { departments: [], employees: [], summary: {} };
}

function buildMockRules(vertical) {
  if (vertical === VERTICALS.ELECTRONICS) {
    return [
      {
        status: 'ACTIVE',
        achievementMultipliers: [
          { achievementFrom: 0, achievementTo: 85, multiplierPct: 0 },
          { achievementFrom: 85, achievementTo: 90, multiplierPct: 50 },
          { achievementFrom: 90, achievementTo: 100, multiplierPct: 80 },
          { achievementFrom: 100, achievementTo: 110, multiplierPct: 100 },
          { achievementFrom: 110, achievementTo: 120, multiplierPct: 110 },
          { achievementFrom: 120, achievementTo: Number.POSITIVE_INFINITY, multiplierPct: 120 },
        ],
      },
    ];
  }

  if (vertical === VERTICALS.GROCERY) {
    return [
      {
        status: 'ACTIVE',
        campaignConfigs: [
          {
            campaignName: groceryCampaign.campaignName,
            startDate: groceryCampaign.campaignStart,
            endDate: groceryCampaign.campaignEnd,
            geography: groceryCampaign.geography,
            channel: groceryCampaign.channel,
            incentiveType: groceryCampaign.incentiveType,
            storeTargets: groceryCampaign.stores.map((s) => ({
              storeCode: s.storeCode,
              targetValue: s.targetSalesValue,
            })),
            payoutSlabs: groceryCampaign.payoutSlabs.map((s) => ({
              achievementFrom: s.achievementFromPct,
              achievementTo: s.achievementToPct,
              perPieceRate: s.ratePerPiece,
            })),
          },
        ],
      },
    ];
  }

  if (vertical === VERTICALS.FNL) {
    return [{ status: 'ACTIVE', fnlRoleSplits: fnlWeeklyRules.splitMatrix }];
  }

  return [];
}
