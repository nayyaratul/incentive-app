import React, { useState, useMemo, useEffect } from 'react';
import dayjs from 'dayjs';
import { Check, X as XIcon, AlertTriangle } from 'lucide-react';
import { fetchAttendanceStatus } from '../../../api/incentives';
import { ToggleGroup, ToggleGroupItem } from '@/nexus/atoms';
import styles from './VerticalViews.module.scss';
import { formatINR } from '../../../utils/format';
import { fnlWeeklyRules } from '../../../data/configs';
import VerticalHero from '../../../components/Molecule/HeroCard/VerticalHero';
import { toSAHero as toFnlSAHero, resolveActivePeriod } from '../../../components/Molecule/HeroCard/mappers/fnl';
import { safeArray, safeNum } from '../../../components/Molecule/HeroCard/safe';
import WidgetBoundary from '../../../components/Atom/WidgetBoundary/WidgetBoundary';
import BadgesStrip from '../../../components/Widgets/BadgesStrip/BadgesStrip';
import QuestCard from '../../../components/Widgets/QuestCard/QuestCard';
import StreakNote from '../../../components/Molecule/StreakNote/StreakNote';
import MomentumPills from '../../../components/Molecule/MomentumPills/MomentumPills';
import EligibilityNotice from '../../../components/Molecule/EligibilityNotice/EligibilityNotice';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/nexus/atoms';

/** Determine which week index is "this week" based on today's date. */
function findCurrentWeekIndex(weekPayouts) {
  if (!weekPayouts || weekPayouts.length === 0) return -1;
  const today = dayjs();
  return weekPayouts.findIndex(
    (w) => today.isAfter(dayjs(w.weekStart).subtract(1, 'day')) && today.isBefore(dayjs(w.weekEnd).add(1, 'day')),
  );
}

/**
 * Derive the week-of-month label (1..5) from the period's start date instead
 * of the array index.
 *
 * BUG FIX (round-1 testing E183): "If Unqualified weeks exist, let's say W2,
 * the W3 is shown as W2 on the dashboard." Root cause was using `i + 1` from
 * the period-selector map — when targets were missing for a week the array
 * was sparse and indices shifted. Phase 4.6 made the engine emit a row per
 * (employee, week) so density should now hold, but the DERIVED label is the
 * robust fix: same week → same label, regardless of upstream gaps. Reliance
 * F&L weekly targets are calendar-aligned (W1 = days 1-7, W2 = 8-14, etc.).
 */
function weekOfMonthLabel(weekStart) {
  if (!weekStart) return null;
  const day = dayjs(weekStart).date();
  return Math.min(5, Math.floor((day - 1) / 7) + 1);
}

export default function FnlView({ payout, employee, store, role }) {
  const weekPayouts = safeArray(payout?.weekPayouts);
  const monthAgg = payout?.monthAggregate ?? null;

  const currentIdx = findCurrentWeekIndex(weekPayouts);
  const defaultKey = currentIdx >= 0
    ? `w${currentIdx}`
    : weekPayouts.length > 0 ? `w${weekPayouts.length - 1}` : 'month';
  const [selectedPeriod, setSelectedPeriod] = useState(defaultKey);

  const active = useMemo(
    () => resolveActivePeriod(payout, selectedPeriod),
    [selectedPeriod, payout],
  );

  const heroProps = useMemo(
    () => toFnlSAHero(payout, active, { role }),
    [payout, active, role],
  );

  const [attendanceStatus, setAttendanceStatus] = useState(null);
  useEffect(() => {
    let cancelled = false;
    fetchAttendanceStatus()
      .then((payload) => { if (!cancelled) setAttendanceStatus(payload); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  const attendanceMissing = attendanceStatus && !attendanceStatus.isConnected;

  const isMonth = Boolean(active.isMonthView);
  const qualifies = Boolean(active.storeQualifies);
  const myPayout = safeNum(active.myPayout, 0);
  const myDays = safeNum(active.myAttendanceDays, 0);
  const eligible5Day = Boolean(active.myAttendanceEligible) || myDays >= fnlWeeklyRules.minWorkingDays;

  // Structured eligibility for the active period. Falls back to {} so the
  // rest of the component keeps rendering (legacy behavior) if the backend
  // hasn't been redeployed with the new contract yet.
  const activeEligibility = active.eligibility || (isMonth ? payout.monthEligibility : null);
  const hasStructuredReasons = Boolean(
    activeEligibility &&
      Array.isArray(activeEligibility.reasons) &&
      activeEligibility.reasons.length > 0,
  );
  // Hide the 5-day card for non-SAs and for NP/DA. Backend sets this flag
  // explicitly per-week so the SA-on-notice case stops rendering "0/7 PRESENT,
  // need 5" alongside the real "On notice" reason.
  const showAttendanceCard =
    !isMonth &&
    role === 'SA' &&
    (activeEligibility ? activeEligibility.showAttendanceCard !== false : true);

  return (
    <>
      {attendanceMissing && (
        <section className={`${styles.pad} rise rise-1`}>
          <div className={styles.attendanceBanner} role="status">
            <AlertTriangle size={16} strokeWidth={2.4} />
            <div>
              <div className={styles.attendanceTitle}>Attendance data not connected</div>
              <div className={styles.attendanceSub}>
                Weekly payouts stay pending until your store manager uploads attendance.
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Period selector ── */}
      {weekPayouts.length > 0 && (
        <section className={`${styles.pad} rise rise-1`}>
          <div className={styles.periodSelector}>
            <ToggleGroup
              type="single"
              value={selectedPeriod}
              onValueChange={(val) => { if (val) setSelectedPeriod(val); }}
              size="sm"
              variant="outline"
            >
              <ToggleGroupItem value="month">Month</ToggleGroupItem>
              {weekPayouts.map((w, i) => {
                const label = weekOfMonthLabel(w.weekStart) ?? i + 1;
                return (
                  <ToggleGroupItem key={w.weekStart} value={`w${i}`}>
                    <span>W{label}</span>
                    {i === currentIdx && <span className={styles.currentDot} aria-label="current week" />}
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
            <div className={styles.periodCaption}>
              {isMonth
                ? `${dayjs(monthAgg?.weekStart).format('MMM D')} – ${dayjs(monthAgg?.weekEnd).format('MMM D')}`
                : (active.weekStart ? `${dayjs(active.weekStart).format('MMM D')} – ${dayjs(active.weekEnd).format('MMM D')}` : '')}
            </div>
          </div>
        </section>
      )}

      {/* ── Hero card ── */}
      <section className={`${styles.pad} rise rise-2`}>
        <WidgetBoundary name="fnl-hero">
          <VerticalHero vertical="FNL" heroProps={heroProps} />
        </WidgetBoundary>
      </section>

      {/* Streak note */}
      <section className={`${styles.streakRow} rise rise-2`}>
        <WidgetBoundary name="streak">
          <StreakNote
            streak={
              payout.streak && payout.streak.current > 0
                ? payout.streak
                : { current: 3, longest: 5, label: 'weeks qualified', caption: 'store beat target' }
            }
          />
        </WidgetBoundary>
      </section>

      <section className={`${styles.streakRow} rise rise-3`}>
        <WidgetBoundary name="momentum">
          <MomentumPills
            thisPeriodAmount={myPayout}
            lastPeriodAmount={isMonth ? payout.lastWeekSaPayout : (active.lastWeekSaPayout ?? payout.lastWeekSaPayout)}
            lastPeriodLabel={isMonth ? 'last month' : 'last week'}
            nextPayoutDate={payout.nextPayoutDate}
          />
        </WidgetBoundary>
      </section>

      {/* Structured eligibility — replaces the ad-hoc "store didn't beat
          target" notice. One block per reason (NOTICE_PERIOD,
          DISCIPLINARY_ACTION, STORE_UNQUALIFIED, INSUFFICIENT_ATTENDANCE,
          NEW_JOINER_PRORATA, etc.) sourced from the backend. */}
      {hasStructuredReasons && (
        <section className="rise rise-3">
          <EligibilityNotice
            eligibility={activeEligibility}
            title={
              isMonth
                ? activeEligibility.status === 'INELIGIBLE'
                  ? 'Not eligible this month'
                  : 'Heads up'
                : activeEligibility.status === 'INELIGIBLE'
                  ? 'Not eligible this week'
                  : 'Heads up'
            }
          />
        </section>
      )}

      {/* 5-day eligibility card — hide in month view, for non-SAs, and for
          NP/DA where the attendance signal is moot. */}
      {showAttendanceCard && (
        <section className={`${styles.pad} rise rise-3`}>
          <div className={eligible5Day ? styles.eligibleOk : styles.eligibleNo}>
            <div className={styles.eligIconWrap}>
              {eligible5Day ? <Check size={14} strokeWidth={2.6} /> : <XIcon size={14} strokeWidth={2.6} />}
            </div>
            <div className={styles.eligBody}>
              <div className={styles.eligTitle}>
                {eligible5Day ? 'Eligible this week' : 'Not eligible this week'}
              </div>
              <div className={styles.eligSub}>
                You have <strong>{myDays}</strong> PRESENT days · minimum {fnlWeeklyRules.minWorkingDays} needed
              </div>
            </div>
            <div className={styles.dayPips} aria-hidden="true">
              {Array.from({ length: 7 }, (_, i) => (
                <span key={i} className={i < myDays ? styles.pipOn : styles.pipOff} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Legacy "store didn't beat target" notice — only renders if the
          backend hasn't yet supplied a structured eligibility block. */}
      {!hasStructuredReasons && !isMonth && !qualifies && (
        <section className={`${styles.pad} rise rise-3`}>
          <div className={styles.notice}>
            <div className={styles.noticeTitle}>Store didn&rsquo;t beat target</div>
            <div className={styles.noticeBody}>
              No payout for any role — the store needed to beat the weekly target.
              Gap: {formatINR(Math.max(0, safeNum(active.weeklySalesTarget) - safeNum(active.actualWeeklyGrossSales)))}.
            </div>
          </div>
        </section>
      )}

      {/* Active quest — pass the active period's data */}
      <section className={`rise rise-4`}>
        <WidgetBoundary name="quests">
          <QuestCard employeeId={employee.employeeId} vertical="FNL" payout={active} />
        </WidgetBoundary>
      </section>

      {/* Badges */}
      <section className={`rise rise-4`}>
        <WidgetBoundary name="badges">
          <BadgesStrip employeeId={employee.employeeId} vertical="FNL" />
        </WidgetBoundary>
      </section>

      {/* Quiet disclosure — past weeks + eligibility. Split matrix only for SM/DM. */}
      <section className={`${styles.pad} ${styles.compactAccordion} rise rise-5`}>
        <Accordion variant="default" type="multiple">
          {(role === 'SM' || role === 'DM') && (
            <AccordionItem value="split">
              <AccordionTrigger>
                Split matrix · {payout.staffing.sms} SM · {payout.staffing.dms} DM
              </AccordionTrigger>
              <AccordionContent>
                <div className={styles.splitGrid}>
                  {fnlWeeklyRules.splitMatrix.map((m) => {
                    const isCurrent = m.sms === payout.staffing.sms && m.dms === payout.staffing.dms;
                    return (
                      <div key={`${m.sms}-${m.dms}`} className={`${styles.splitRow} ${isCurrent ? styles.splitCurrent : ''}`}>
                        <span className={styles.splitConfig}>{m.sms} SM · {m.dms} DM</span>
                        <span className={styles.splitSA}>SA {Math.round(m.saPoolPct * 100)}%</span>
                        <span className={styles.splitSM}>SM {Math.round(m.smSharePct * 100)}%</span>
                        <span className={styles.splitDM}>{m.dms > 0 ? `DM ${(m.dmSharePctEach * 100).toFixed(1)}% each` : '—'}</span>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          <AccordionItem value="weeks">
            <AccordionTrigger>All weeks this month</AccordionTrigger>
            <AccordionContent>
              <div className={styles.weeksList}>
                {(payout.recentWeeks ?? []).map((w, i) => (
                  <div
                    key={w.weekStart}
                    className={`${styles.weekRow} ${selectedPeriod === `w${i}` ? styles.weekRowActive : ''}`}
                    onClick={() => setSelectedPeriod(`w${i}`)}
                    role="button"
                    tabIndex={0}
                  >
                    <span className={styles.weekDates}>{w.weekStart}</span>
                    <span className={`${styles.weekStatus} ${w.storeQualified ? styles.wYes : styles.wNo}`}>
                      {w.storeQualified ? 'Qualified' : 'Missed'}
                    </span>
                    <span className={styles.weekActual}>{formatINR(w.actual)}</span>
                    <span className={styles.weekPayout}>{formatINR(w.totalIncentive)}</span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="eligibility">
            <AccordionTrigger>Eligibility &amp; your record</AccordionTrigger>
            <AccordionContent>
              <dl className={styles.compactList}>
                {[
                  { label: 'Role',                   value: `${role} · ${employee?.employeeId}` },
                  { label: 'Payroll status',         value: employee?.payrollStatus },
                  { label: 'Days PRESENT this week', value: `${myDays} / 7` },
                  { label: '5-day rule',             value: eligible5Day ? 'Met' : 'Not met' },
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
    </>
  );
}
