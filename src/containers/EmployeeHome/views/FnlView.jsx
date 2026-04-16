import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { Calendar, Check, X as XIcon } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/nexus/atoms';
import styles from './VerticalViews.module.scss';
import { formatINR } from '../../../utils/format';
import { fnlWeeklyRules } from '../../../data/configs';
import HeroCard from '../../../components/Molecule/HeroCard/HeroCard';
import BadgesStrip from '../../../components/Widgets/BadgesStrip/BadgesStrip';
import QuestCard from '../../../components/Widgets/QuestCard/QuestCard';
import StreakNote from '../../../components/Molecule/StreakNote/StreakNote';
import MomentumPills from '../../../components/Molecule/MomentumPills/MomentumPills';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/nexus/atoms';

/**
 * Determine which week index is "this week" based on today's date.
 */
function findCurrentWeekIndex(weekPayouts) {
  if (!weekPayouts || weekPayouts.length === 0) return -1;
  const today = dayjs();
  return weekPayouts.findIndex(
    (w) => today.isAfter(dayjs(w.weekStart).subtract(1, 'day')) && today.isBefore(dayjs(w.weekEnd).add(1, 'day')),
  );
}

/**
 * Format a week date range for display.
 */
function weekLabel(w) {
  if (!w?.weekStart) return '';
  const s = dayjs(w.weekStart);
  const e = dayjs(w.weekEnd);
  return `${s.format('MMM D')} – ${e.format('MMM D')}`;
}

export default function FnlView({ payout, employee, store, role }) {
  const weekPayouts = payout.weekPayouts ?? [];
  const monthAgg = payout.monthAggregate ?? null;

  // Default to this week, fall back to latest week, fall back to month
  const currentIdx = findCurrentWeekIndex(weekPayouts);
  const defaultKey = currentIdx >= 0 ? `w${currentIdx}` : weekPayouts.length > 0 ? `w${weekPayouts.length - 1}` : 'month';
  const [selectedPeriod, setSelectedPeriod] = useState(defaultKey);

  // Derive active data from selection
  const active = useMemo(() => {
    if (selectedPeriod === 'month' && monthAgg) return monthAgg;
    const idx = parseInt(selectedPeriod.replace('w', ''), 10);
    if (weekPayouts[idx]) return weekPayouts[idx];
    // Fall back to the original payout (latest week)
    return payout;
  }, [selectedPeriod, weekPayouts, monthAgg, payout]);

  const isMonth = selectedPeriod === 'month';
  const qualifies = active.storeQualifies;
  const myPayout = active.myPayout ?? 0;
  const myDays = active.myAttendanceDays ?? 0;
  const eligible5Day = active.myAttendanceEligible ?? (myDays >= fnlWeeklyRules.minWorkingDays);
  const achPct = active.weeklySalesTarget > 0
    ? Math.round((active.actualWeeklyGrossSales / active.weeklySalesTarget) * 100)
    : 0;

  return (
    <>
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
              {weekPayouts.map((w, i) => (
                <ToggleGroupItem key={w.weekStart} value={`w${i}`}>
                  <span>W{i + 1}</span>
                  {i === currentIdx && <span className={styles.currentDot} aria-label="current week" />}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <div className={styles.periodCaption}>
              {isMonth
                ? `${dayjs(monthAgg?.weekStart).format('MMM D')} – ${dayjs(monthAgg?.weekEnd).format('MMM D')}`
                : weekLabel(active)}
            </div>
          </div>
        </section>
      )}

      {/* ── Hero card ── */}
      <section className={`${styles.pad} rise rise-2`}>
        <HeroCard>
          <HeroCard.EyebrowRow>
            <HeroCard.Eyebrow withDot>
              <Calendar size={11} strokeWidth={2.2} />
              {isMonth ? 'Month to date' : `Week of ${active.weekStart}`}
            </HeroCard.Eyebrow>
            {!isMonth && (
              <HeroCard.QualifyPill qualifies={qualifies}>
                {qualifies ? 'Target met' : 'Below target'}
              </HeroCard.QualifyPill>
            )}
            {isMonth && (
              <HeroCard.QualifyPill qualifies={active.weeksQualified > 0}>
                {active.weeksQualified}/{active.weeksTotal} weeks qualified
              </HeroCard.QualifyPill>
            )}
          </HeroCard.EyebrowRow>

          <HeroCard.Amount prefix="₹">
            {(isMonth || (qualifies && eligible5Day))
              ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(myPayout)
              : '0'}
          </HeroCard.Amount>
          <HeroCard.AmountCap>
            {isMonth ? 'Your payout this month' : 'Your payout this week'}
          </HeroCard.AmountCap>

          <HeroCard.Figures dense noBottomDivider>
            <HeroCard.Figure value={`${achPct}%`} cap="achievement" />
            <HeroCard.FigureDivider />
            <HeroCard.Figure
              value={formatINR(active.weeklySalesTarget)}
              cap={isMonth ? 'total target' : 'store target'}
            />
            <HeroCard.FigureDivider />
            <HeroCard.Figure
              value={formatINR(active.actualWeeklyGrossSales)}
              cap="actual sales"
            />
          </HeroCard.Figures>
        </HeroCard>
      </section>

      {/* Streak note */}
      <section className={`${styles.streakRow} rise rise-2`}>
        <StreakNote
          streak={
            payout.streak && payout.streak.current > 0
              ? payout.streak
              : { current: 3, longest: 5, label: 'weeks qualified', caption: 'store beat target' }
          }
        />
      </section>

      <section className={`${styles.streakRow} rise rise-3`}>
        <MomentumPills
          thisPeriodAmount={myPayout}
          lastPeriodAmount={isMonth ? payout.lastWeekSaPayout : (active.lastWeekSaPayout ?? payout.lastWeekSaPayout)}
          lastPeriodLabel={isMonth ? 'last month' : 'last week'}
          nextPayoutDate={payout.nextPayoutDate}
        />
      </section>

      {/* 5-day eligibility card — hide in month view */}
      {!isMonth && (
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

      {/* Store didn't beat target notice — only for weekly view */}
      {!isMonth && !qualifies && (
        <section className={`${styles.pad} rise rise-3`}>
          <div className={styles.notice}>
            <div className={styles.noticeTitle}>Store didn&rsquo;t beat target</div>
            <div className={styles.noticeBody}>
              No payout for any role — the store needed to beat the weekly target.
              Gap: {formatINR(active.weeklySalesTarget - active.actualWeeklyGrossSales)}.
            </div>
          </div>
        </section>
      )}

      {/* Active quest — pass the active period's data */}
      <section className={`rise rise-4`}>
        <QuestCard employeeId={employee.employeeId} vertical="FNL" payout={active} />
      </section>

      {/* Badges */}
      <section className={`rise rise-4`}>
        <BadgesStrip employeeId={employee.employeeId} vertical="FNL" />
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
