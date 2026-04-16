import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { Users, TrendingUp, AlertTriangle, Calendar, Check, X as XIcon, Target, Zap, Clock, Trophy, Medal, Package } from 'lucide-react';
import styles from './StoreManagerHome.module.scss';
import { usePersona } from '../../context/PersonaContext';
import { VERTICALS } from '../../data/masters';
import useAsync from '../../hooks/useAsync';
import { fetchStoreIncentive, fetchLeaderboard } from '../../api/incentives';
import { transformStoreIncentive } from '../../api/transformers/storeIncentive';
import { fetchEmployees } from '../../api/employees';
import { fetchRules } from '../../api/rules';
import HeaderBar, { HeaderGreeting } from '../../components/Organism/HeaderBar/HeaderBar';
import BottomNav from '../../components/Organism/BottomNav/BottomNav';
import { buildStoreLeaderboard } from '../../data/storeLeaderboard';
import StoreTransactions from '../screens/StoreTransactions';
import HeroCard from '../../components/Molecule/HeroCard/HeroCard';
import EmployeeDetailDrawer from '../../components/Organism/EmployeeDetailDrawer/EmployeeDetailDrawer';
import LeaderboardDrawer from '../../components/Organism/LeaderboardDrawer/LeaderboardDrawer';
import LeaderboardPodium from '../../components/Molecule/LeaderboardPodium/LeaderboardPodium';
import LeaderboardFocusList from '../../components/Molecule/LeaderboardFocusList/LeaderboardFocusList';
import BadgesStrip from '../../components/Widgets/BadgesStrip/BadgesStrip';
import QuestCard from '../../components/Widgets/QuestCard/QuestCard';
import StreakNote from '../../components/Molecule/StreakNote/StreakNote';
import MomentumPills from '../../components/Molecule/MomentumPills/MomentumPills';
import TabPageHeader from '../../components/Molecule/TabPageHeader/TabPageHeader';
import TargetTrendBreakdown from '../../components/Molecule/TargetTrendBreakdown/TargetTrendBreakdown';
import DepartmentMultipliers from '../../components/Molecule/DepartmentMultipliers/DepartmentMultipliers';
import { formatINR, formatDateRange } from '../../utils/format';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  ToggleGroup,
  ToggleGroupItem,
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
  const [fnlPeriod, setFnlPeriod] = useState(null); // null = auto-detect current week
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
    () => {
      if (!store?.storeCode || !active?.vertical) return Promise.resolve(null);
      if (useMock) return Promise.resolve(buildMockStoreDetail(active.vertical, store.storeCode));
      return fetchStoreIncentive(store.storeCode, active.vertical, periodStart, periodEnd)
        .then((res) => transformStoreIncentive(res, active.vertical));
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

  const leaderboardResult = useAsync(
    () => {
      if (!store?.storeCode) return Promise.resolve(null);
      if (useMock) return Promise.resolve(null);
      return fetchLeaderboard(store.storeCode, 'store');
    },
    [store?.storeCode],
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
      const daysElapsed = dayjs().date();
      const daysLeft = dayjs().endOf('month').diff(dayjs(), 'day');
      const totalDays = dayjs().daysInMonth();
      const dailyPace = daysElapsed > 0 ? Math.round(totalActual / daysElapsed) : 0;
      const requiredPace = daysLeft > 0 && totalTarget > totalActual
        ? Math.round((totalTarget - totalActual) / daysLeft)
        : 0;
      const projectedTotal = Math.round(dailyPace * totalDays);

      return {
        kind: 'ELECTRONICS',
        totalTarget, totalActual, totalPayout,
        achievementPct: storeAchPct,
        daysLeft,
        daysElapsed,
        dailyPace,
        requiredPace,
        projectedTotal,
        gapToTarget: totalTarget > totalActual ? totalTarget - totalActual : 0,
        departments: depts.map((d) => {
          const ach = Number(d.achievementPct) || 0;
          const target = Number(d.target) || 0;
          const actual = Number(d.actual) || 0;
          const currentMult = findMult(ach);
          const next = findNextTier(ach);
          const gapToNext = next && target > 0 ? Math.max(0, Math.round(target * next.pct / 100 - actual)) : null;

          // "What if" — estimate payout uplift if next tier is reached
          // Use total base incentive for employees in this department's achievement bracket
          const deptBaseTotal = emps
            .filter((e) => Math.abs((Number(e.achievementPct) || 0) - ach) < 1)
            .reduce((s, e) => s + (Number(e.baseIncentive) || 0), 0);
          const currentPayout = Math.round(deptBaseTotal * currentMult);
          const nextPayout = next ? Math.round(deptBaseTotal * (next.mult / 100)) : currentPayout;
          const payoutUplift = nextPayout - currentPayout;

          return {
            department: d.department,
            actualSales: actual,
            achievementPct: ach,
            target,
            multiplier: currentMult,
            nextTier: next,
            gapToNext,
            payoutUplift: payoutUplift > 0 ? payoutUplift : null,
            employeesInDept: emps.filter((e) => Math.abs((Number(e.achievementPct) || 0) - ach) < 1).length,
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
      // Pieces sold: try summary fields, then sum from employee-level data
      const piecesSold = Number(storeDetail.summary?.totalPiecesSold)
        || Number(storeDetail.summary?.piecesSold)
        || Number(storeDetail.summary?.totalPieces)
        || (storeDetail.employees || []).reduce((s, e) => s + (Number(e.piecesSold) || Number(e.pieces) || 0), 0)
        || 0;
      const currentSlab = slabs.find((s) => {
        const from = Number(s.achievementFrom);
        const to = Number(s.achievementTo);
        return achPct >= from && (Number.isFinite(to) ? achPct < to : true);
      });
      const currentRate = Number(currentSlab?.perPieceRate) || Number(storeDetail.summary?.appliedRate) || 0;

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
      // Week payouts from API/transformer for the period selector
      const weekPayouts = storeDetail?.weekPayouts || (useMock ? fnlPayoutTRN0241.weekPayouts : null) || [];
      const monthAggregate = storeDetail?.monthAggregate || (useMock ? fnlPayoutTRN0241.monthAggregate : null) || null;

      // Derive current week start/end from weekPayouts or summary
      const lastWeek = weekPayouts.length > 0 ? weekPayouts[weekPayouts.length - 1] : null;
      const weekStart = lastWeek?.weekStart || storeDetail?.summary?.weekStart || (useMock ? fnlPayoutTRN0241.weekStart : null);
      const weekEnd = lastWeek?.weekEnd || storeDetail?.summary?.weekEnd || (useMock ? fnlPayoutTRN0241.weekEnd : null);

      return {
        kind: 'FNL',
        week: { start: weekStart, end: weekEnd },
        totalTarget,
        totalActual,
        totalPayout,
        achievementPct: totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0,
        storeQualifies: totalActual >= totalTarget,
        daysLeft: 7 - dayjs().day(), // days left in week
        gapToTarget: totalTarget > totalActual ? totalTarget - totalActual : 0,
        unlockPct: 100,
        weekPayouts,
        monthAggregate,
        employees: emps.map((emp) => {
          const master = storeTeam.find((x) => x.employeeId === emp.employeeId);
          return {
            employeeId: emp.employeeId,
            employeeName: emp.employeeName || master?.employeeName || emp.employeeId,
            role: emp.role || master?.role || '—',
            payrollStatus: master?.payrollStatus || 'ACTIVE',
            daysPresent: Number(emp.daysPresent),
            eligible: Number(emp.daysPresent) >= (Number(storeDetail?.summary?.minWorkingDays) || Number(fnlWeeklyRules.minWorkingDays) || 5),
            total: Number(emp.finalIncentive) || 0,
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
  const dataError = storeDetailResult.error || employeesResult.error || rulesResult.error;
  if (!active || !employee || !store || dataLoading) {
    return <div className={styles.shell}><div className={styles.loading}>Loading...</div></div>;
  }

  if (dataError) {
    return (
      <div className={styles.shell}>
        <div className={styles.loading}>Something went wrong loading store data. Please try again.</div>
      </div>
    );
  }

  if (!summary) return null;

  // Store-level leaderboard: use API data when available, otherwise mock builder
  const storeRank = leaderboardResult.data
    || (active?.vertical && store?.storeCode
        ? buildStoreLeaderboard(active.vertical, store.storeCode)
        : null);

  // Store-level leaderboard (stores vs stores) — used by the board tab
  const storeLeaderboard = active?.vertical
    ? buildStoreLeaderboard(active.vertical, store?.storeCode)
    : null;
  const selfRow = summary.employees.find((e) => e.employeeId === employee?.employeeId) || null;
  const selfPayout = selfRow?.earned || selfRow?.total || 0;
  const myDaysPresent = Number(selfRow?.daysPresent);
  const minWorkingDays = Number(storeDetailResult.data?.summary?.minWorkingDays) || Number(fnlWeeklyRules.minWorkingDays) || 5;
  const eligible5Day = Number.isFinite(myDaysPresent) && myDaysPresent >= minWorkingDays;
  const cycleMeta = buildCycleMeta(active?.vertical, employee, storeDetailResult.data, summary);

  // Derive period-aware FNL data from the period selector (plain derivation, not a hook)
  const fnlActive = (() => {
    if (summary?.kind !== 'FNL' || !summary.weekPayouts?.length) return null;
    const sel = fnlPeriod || (() => {
      const today = dayjs();
      const idx = summary.weekPayouts.findIndex(
        (w) => today.isAfter(dayjs(w.weekStart).subtract(1, 'day')) && today.isBefore(dayjs(w.weekEnd).add(1, 'day')),
      );
      return idx >= 0 ? `w${idx}` : `w${summary.weekPayouts.length - 1}`;
    })();
    if (sel === 'month' && summary.monthAggregate) {
      return { ...summary.monthAggregate, isMonthView: true };
    }
    const idx = parseInt(sel.replace('w', ''), 10);
    const wp = summary.weekPayouts[idx];
    return wp ? { ...wp, isMonthView: false } : null;
  })();

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
        myRank={storeRank}
      />

      <EmployeeDetailDrawer
        employee={selectedEmployee}
        summaryRow={selectedRow?.row}
        open={!!selectedRow}
        onClose={() => setSelectedRow(null)}
        onViewAllTransactions={handleViewAllTransactions}
      />

      <div className={styles.layout}>
        <HeaderBar />

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

          {tab === 'board' && storeLeaderboard && (
            <section className={styles.pad}>
              <div className="rise rise-1">
                <TabPageHeader
                  title="Leaderboard"
                  subtitle={`${store.storeName} · ${storeLeaderboard.scopeNote || 'store rankings'}`}
                />
              </div>
              <div className="rise rise-2">
                <LeaderboardPodium
                  entries={storeLeaderboard.top}
                  unitLabel={storeLeaderboard.unitLabel || 'achievement'}
                  isStoreScope
                />
              </div>
              <div className="rise rise-3">
                <LeaderboardFocusList
                  entries={storeLeaderboard.top}
                  selfRank={storeLeaderboard.rank}
                  unitLabel={storeLeaderboard.unitLabel || 'achievement'}
                  isStoreScope
                />
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
              <HeaderGreeting
                employeeName={firstName}
                storeName={`${store.storeFormat || store.storeName} — ${store.city}, ${store.state}`}
                rank={storeRank?.rank}
                onOpenLeaderboard={() => setLeaderboardOpen(true)}
              />
              {/* F&L period selector */}
              {summary.kind === 'FNL' && summary.weekPayouts && summary.weekPayouts.length > 0 && (
                <section className={`${styles.pad} rise rise-1`}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                    <ToggleGroup
                      type="single"
                      value={fnlPeriod || (() => {
                        const today = dayjs();
                        const idx = summary.weekPayouts.findIndex(
                          (w) => today.isAfter(dayjs(w.weekStart).subtract(1, 'day')) && today.isBefore(dayjs(w.weekEnd).add(1, 'day')),
                        );
                        return idx >= 0 ? `w${idx}` : `w${summary.weekPayouts.length - 1}`;
                      })()}
                      onValueChange={(val) => { if (val) setFnlPeriod(val); }}
                      size="sm"
                      variant="outline"
                    >
                      <ToggleGroupItem value="month">Month</ToggleGroupItem>
                      {summary.weekPayouts.map((w, i) => (
                        <ToggleGroupItem key={w.weekStart} value={`w${i}`}>W{i + 1}</ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                    <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                      {(() => {
                        const sel = fnlPeriod || `w${summary.weekPayouts.length - 1}`;
                        if (sel === 'month') return `${dayjs(summary.weekPayouts[0]?.weekStart).format('MMM D')} – ${dayjs(summary.weekPayouts[summary.weekPayouts.length - 1]?.weekEnd).format('MMM D')}`;
                        const idx = parseInt(sel.replace('w', ''), 10);
                        const w = summary.weekPayouts[idx];
                        return w ? `${dayjs(w.weekStart).format('MMM D')} – ${dayjs(w.weekEnd).format('MMM D')}` : '';
                      })()}
                    </span>
                  </div>
                </section>
              )}

              <section className={`${styles.pad} rise rise-2`}>
                <HeroCard>
                  <HeroCard.EyebrowRow>
                    {summary.kind === 'GROCERY' ? (
                      <HeroCard.Eyebrow withDot dotTone="live">Live campaign</HeroCard.Eyebrow>
                    ) : (
                      <HeroCard.Eyebrow withDot>
                        {summary.kind === 'ELECTRONICS' && 'April 2026 · Month to date'}
                        {summary.kind === 'FNL' && (() => {
                          if (fnlActive?.isMonthView) return 'Month to date';
                          const ws = fnlActive?.weekStart || summary.week.start;
                          const we = fnlActive?.weekEnd;
                          return we
                            ? `${dayjs(ws).format('MMM D')} – ${dayjs(we).format('MMM D')}`
                            : `Week of ${ws}`;
                        })()}
                      </HeroCard.Eyebrow>
                    )}
                    {(() => {
                      const isFnl = summary.kind === 'FNL' && fnlActive;
                      const achPct = isFnl
                        ? (fnlActive.weeklySalesTarget > 0
                            ? Math.round((fnlActive.actualWeeklyGrossSales / fnlActive.weeklySalesTarget) * 100)
                            : 0)
                        : summary.achievementPct;
                      return achPct >= 100 ? <HeroCard.TrendPill>Target exceeded!</HeroCard.TrendPill> : null;
                    })()}
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

                  {(() => {
                    const isFnl = summary.kind === 'FNL' && fnlActive;
                    const achPct = isFnl
                      ? (fnlActive.weeklySalesTarget > 0
                          ? Math.round((fnlActive.actualWeeklyGrossSales / fnlActive.weeklySalesTarget) * 100)
                          : 0)
                      : summary.achievementPct;
                    const tgt = isFnl ? fnlActive.weeklySalesTarget : summary.totalTarget;
                    const act = isFnl ? fnlActive.actualWeeklyGrossSales : summary.totalActual;
                    const gap = tgt > act ? tgt - act : 0;
                    const periodLabel = isFnl
                      ? (fnlActive.isMonthView ? 'monthly' : 'weekly')
                      : (summary.kind === 'GROCERY' ? 'campaign' : 'period');

                    return (
                      <>
                        <HeroCard.Amount suffix="%" tone={achPct >= 100 ? 'success' : undefined}>
                          {achPct}
                        </HeroCard.Amount>
                        <HeroCard.AmountCap>
                          {summary.kind === 'GROCERY'
                            ? `of ${formatINR(tgt)} campaign target`
                            : `of store ${periodLabel} target`}
                        </HeroCard.AmountCap>

                        <TargetTrendBreakdown
                          actualValue={act}
                          targetValue={tgt}
                          extraCaption={
                            achPct < 100 && gap > 0
                              ? <>
                                  <span>·</span>
                                  <Target size={13} strokeWidth={2.2} />
                                  <strong>{formatINR(gap)}</strong> more to hit target
                                </>
                              : null
                          }
                        />

                        {summary.kind === 'GROCERY' && (
                          <HeroCard.Caption>
                            <Package size={13} strokeWidth={2.2} />
                            <strong>{(summary.piecesSoldTotal || 0).toLocaleString('en-IN')}</strong> pcs sold
                            {summary.appliedRate > 0 ? (
                              <>
                                <span>×</span>
                                <strong>₹{summary.appliedRate}/pc</strong>
                                <span>=</span>
                                <strong>{formatINR(summary.totalPayout)}</strong> store pool
                              </>
                            ) : (
                              <span>· below 100% — no payout yet</span>
                            )}
                          </HeroCard.Caption>
                        )}
                      </>
                    );
                  })()}


                  <HeroCard.FooterBlock>
                    <div>
                      <HeroCard.FooterLabel>
                        {summary.kind === 'GROCERY'
                          ? 'Your payout so far'
                          : summary.kind === 'FNL' && fnlActive
                            ? (fnlActive.isMonthView ? 'Total month payout' : 'Total week payout')
                            : 'Total store payout'}
                      </HeroCard.FooterLabel>
                      <HeroCard.FooterValue>
                        {summary.kind === 'GROCERY'
                          ? formatINR(selfPayout)
                          : summary.kind === 'FNL' && fnlActive
                            ? formatINR(fnlActive.myPayout || 0)
                            : formatINR(summary.totalPayout)}
                      </HeroCard.FooterValue>
                    </div>
                    <HeroCard.FooterMetaGroup>
                      {summary.kind === 'GROCERY' && summary.totalPayout > 0 && (
                        <HeroCard.FooterMeta>
                          <Package size={12} strokeWidth={2.2} />
                          <span>Store pool {formatINR(summary.totalPayout)} ÷ {summary.employees.length} staff</span>
                        </HeroCard.FooterMeta>
                      )}
                      <HeroCard.FooterMeta>
                        <Users size={12} strokeWidth={2.2} />
                        <span>
                          {summary.kind === 'GROCERY'
                            ? `Split equally across ${summary.employees.length} staff`
                            : `${summary.employees.length} staff`}
                        </span>
                      </HeroCard.FooterMeta>
                      {typeof summary.daysLeft === 'number' && (
                        <HeroCard.FooterMeta>
                          <Clock size={12} strokeWidth={2.2} />
                          <span>{summary.daysLeft} days left</span>
                        </HeroCard.FooterMeta>
                      )}
                    </HeroCard.FooterMetaGroup>
                  </HeroCard.FooterBlock>
                </HeroCard>
              </section>

              {summary.kind === 'ELECTRONICS' && (
                <section className={`${styles.pad} rise rise-3`}>
                  <DepartmentMultipliers departments={summary.departments} />
                </section>
              )}

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

              {summary.kind === 'FNL' && Number.isFinite(myDaysPresent) && !(fnlActive?.isMonthView) && (
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

              {/* Daily Run Rate */}
              {summary.dailyPace > 0 && (
                <section className={`${styles.pad} rise rise-3`}>
                  <div className={styles.cardLight}>
                    <div className={styles.cardHead}>
                      <span className={styles.eyebrow}>
                        <TrendingUp size={12} strokeWidth={2.4} style={{ marginRight: 4 }} />
                        Daily run rate
                      </span>
                      <span className={styles.headSub}>day {summary.daysElapsed} of {summary.daysElapsed + summary.daysLeft}</span>
                    </div>
                    <div className={styles.runRateGrid}>
                      <div className={styles.runRateItem}>
                        <div className={styles.runRateValue}>{formatINR(summary.dailyPace)}</div>
                        <div className={styles.runRateCap}>current pace / day</div>
                      </div>
                      <div className={styles.runRateDivider} />
                      {summary.requiredPace > 0 ? (
                        <div className={styles.runRateItem}>
                          <div className={styles.runRateValue}>{formatINR(summary.requiredPace)}</div>
                          <div className={styles.runRateCap}>needed / day</div>
                        </div>
                      ) : (
                        <div className={styles.runRateItem}>
                          <div className={`${styles.runRateValue} ${styles.runRateGreen}`}>{formatINR(summary.projectedTotal)}</div>
                          <div className={styles.runRateCap}>projected total</div>
                        </div>
                      )}
                    </div>
                    {summary.projectedTotal >= summary.totalTarget ? (
                      <div className={styles.runRateStatus}>
                        <TrendingUp size={13} strokeWidth={2.4} />
                        On pace to hit <strong>{Math.round((summary.projectedTotal / summary.totalTarget) * 100)}%</strong> of target
                      </div>
                    ) : (
                      <div className={`${styles.runRateStatus} ${styles.runRateBehind}`}>
                        <Target size={13} strokeWidth={2.2} />
                        Behind pace — need to increase daily sales by <strong>{formatINR(summary.requiredPace - summary.dailyPace)}</strong>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* What If Simulator */}
              {summary.kind === 'ELECTRONICS' && summary.departments.some((d) => d.payoutUplift > 0) && (
                <section className={`${styles.pad} rise rise-5`}>
                  <div className={styles.cardLight}>
                    <div className={styles.cardHead}>
                      <span className={styles.eyebrow}>
                        <Zap size={12} strokeWidth={2.4} style={{ marginRight: 4 }} />
                        What if?
                      </span>
                      <span className={styles.headSub}>unlock potential</span>
                    </div>
                    <div className={styles.whatIfList}>
                      {summary.departments
                        .filter((d) => d.payoutUplift > 0 && d.nextTier && d.gapToNext > 0)
                        .sort((a, b) => b.payoutUplift - a.payoutUplift)
                        .map((d) => (
                          <div key={d.department} className={styles.whatIfRow}>
                            <div className={styles.whatIfQuestion}>
                              If <strong>{d.department}</strong> hits {d.nextTier.pct}%
                            </div>
                            <div className={styles.whatIfDetail}>
                              Sell <strong>{formatINR(d.gapToNext)}</strong> more → multiplier jumps to <strong>{d.nextTier.mult}%</strong>
                            </div>
                            <div className={styles.whatIfResult}>
                              +{formatINR(d.payoutUplift)} extra payout for {d.employeesInDept} staff
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </section>
              )}

              {summary.kind === 'FNL' && (() => {
                const qualifies = fnlActive ? fnlActive.storeQualifies : summary.storeQualifies;
                if (qualifies) return null;
                const tgt = fnlActive ? fnlActive.weeklySalesTarget : summary.totalTarget;
                const act = fnlActive ? fnlActive.actualWeeklyGrossSales : summary.totalActual;
                const label = fnlActive?.isMonthView ? 'month' : 'week';
                return (
                  <section className={`${styles.pad} rise rise-3`}>
                    <div className={styles.notice}>
                      <AlertTriangle size={14} strokeWidth={2.4} />
                      <div>
                        <div className={styles.noticeTitle}>Store didn't beat target</div>
                        <div className={styles.noticeBody}>
                          No payout this {label} for any role — the store needed to beat the {label === 'month' ? 'monthly' : 'weekly'} target. Gap: {formatINR(tgt - act)}.
                        </div>
                      </div>
                    </div>
                  </section>
                );
              })()}

              <section className={`rise rise-4`}>
                <QuestCard employeeId={employee.employeeId} vertical={active.vertical} payout={summary.kind === 'FNL' && fnlActive ? fnlActive : summary} />
              </section>

              <section className={`rise rise-4`}>
                <BadgesStrip employeeId={employee.employeeId} vertical={active.vertical} />
              </section>

              {summary.kind === 'ELECTRONICS' && (
                <section className={`${styles.pad} ${styles.compactAccordion} rise rise-5`}>
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
  const unlockPct = summary.unlockPct;

  return (
    <div className={`${styles.cardLight} ${styles.teamRosterCard}`}>
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

function StoreLeaderboard({ leaderboardData, loading, storeName }) {
  const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

  if (loading) {
    return <div className={styles.cardLight}><div className={styles.loading}>Loading leaderboard...</div></div>;
  }

  const ranked = leaderboardData?.leaderboard || [];

  if (ranked.length === 0) {
    return (
      <div className={styles.cardLight}>
        <div className={styles.cardHead}>
          <span className={styles.eyebrow}><Trophy size={12} strokeWidth={2.4} style={{ marginRight: 4 }} /> Store ranking</span>
        </div>
        <div className={styles.loading}>No sales data yet this month</div>
      </div>
    );
  }

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
                <div className={styles.podiumAmount}>{formatINR(e.totalSales)}</div>
                <div className={styles.podiumRank}>#{pos}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Column header */}
      <div className={styles.boardHeader}>
        <span>#</span>
        <span>Employee</span>
        <span style={{ textAlign: 'right' }}>Sales</span>
      </div>

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
            <span className={styles.boardEarned}>{formatINR(e.totalSales)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildCycleMeta(vertical, employee, storeDetail, summary) {
  // Use streak from API response when available; derive from employee data if possible
  const apiStreak = storeDetail?.summary?.streak || null;

  // Derive streak from employee's daysPresent (FNL) or days elapsed (Electronics/Grocery)
  function deriveStreak() {
    if (apiStreak) return apiStreak;
    const selfRow = summary?.employees?.find((e) => e.employeeId === employee?.employeeId);
    const days = Number(selfRow?.daysPresent);
    if (Number.isFinite(days) && days > 0) {
      return { current: days, longest: days, label: 'working days', caption: 'present + selling' };
    }
    // Use days elapsed in month as a proxy when no better data exists
    const elapsed = dayjs().date();
    return { current: elapsed, longest: elapsed, label: 'working days', caption: 'present + selling' };
  }

  const streak = deriveStreak();

  const byVertical = {
    ELECTRONICS: {
      streak,
      lastPeriodLabel: 'last month',
      nextPayoutDate: storeDetail?.summary?.nextPayoutDate || nextMonthlyPayoutDate(),
    },
    GROCERY: {
      streak,
      lastPeriodLabel: 'last campaign',
      nextPayoutDate: storeDetail?.summary?.nextPayoutDate || resolveGroceryPayoutDate(),
    },
    FNL: {
      streak,
      lastPeriodLabel: 'last week',
      nextPayoutDate: storeDetail?.summary?.nextPayoutDate || nextSaturdayPayoutDate(),
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
  const selfRow2 = summary?.employees?.find((e) => e.employeeId === employee?.employeeId);
  const selfPayout = selfRow2?.earned || selfRow2?.total || 0;
  const derivedLast = tenureDays >= 30 && selfPayout > 0 ? Math.round(selfPayout * 0.9) : 0;

  return {
    ...meta,
    lastPeriodAmount: reportedLast > 0 ? reportedLast : derivedLast,
  };
}

function resolveGroceryPayoutDate() {
  // Grocery: paid end of current month
  const d = new Date();
  d.setMonth(d.getMonth() + 1, 0); // last day of current month
  return d.toISOString().slice(0, 10);
}

function nextMonthlyPayoutDate() {
  // Electronics: paid end of current month
  const d = new Date();
  d.setMonth(d.getMonth() + 1, 0); // last day of current month
  return d.toISOString().slice(0, 10);
}

function nextSaturdayPayoutDate() {
  // F&L: Sunday–Saturday cycle, paid on Saturday
  const d = new Date();
  const day = d.getDay(); // 0=Sun..6=Sat
  const diff = day === 6 ? 0 : 6 - day; // days until Saturday
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
