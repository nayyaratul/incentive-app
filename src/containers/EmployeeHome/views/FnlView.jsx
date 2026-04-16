import React from 'react';
import { Calendar, Check, X as XIcon } from 'lucide-react';
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

export default function FnlView({ payout, employee, store, role }) {
  const qualifies = payout.storeQualifies;
  const myPayout = payout.myPayout ?? 0;
  const myDays = payout.myAttendanceDays ?? 0;
  const eligible5Day = payout.myAttendanceEligible ?? (myDays >= fnlWeeklyRules.minWorkingDays);
  const achPct = payout.weeklySalesTarget > 0
    ? Math.round((payout.actualWeeklyGrossSales / payout.weeklySalesTarget) * 100)
    : 0;

  return (
    <>
      {/* Week hero — simplified: store target, achievement %, your payout */}
      <section className={`${styles.pad} rise rise-2`}>
        <HeroCard>
          <HeroCard.EyebrowRow>
            <HeroCard.Eyebrow withDot>
              <Calendar size={11} strokeWidth={2.2} />
              Week of {payout.weekStart}
            </HeroCard.Eyebrow>
            <HeroCard.QualifyPill qualifies={qualifies}>
              {qualifies ? 'Target met' : 'Below target'}
            </HeroCard.QualifyPill>
          </HeroCard.EyebrowRow>

          <HeroCard.Amount prefix="₹">
            {qualifies && eligible5Day
              ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(myPayout)
              : '0'}
          </HeroCard.Amount>
          <HeroCard.AmountCap>Your payout this week</HeroCard.AmountCap>

          <HeroCard.Figures dense noBottomDivider>
            <HeroCard.Figure value={`${achPct}%`} cap="achievement" />
            <HeroCard.FigureDivider />
            <HeroCard.Figure value={formatINR(payout.weeklySalesTarget)} cap="store target" />
            <HeroCard.FigureDivider />
            <HeroCard.Figure value={formatINR(payout.actualWeeklyGrossSales)} cap="actual sales" />
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
          lastPeriodAmount={payout.lastWeekSaPayout}
          lastPeriodLabel="last week"
          nextPayoutDate={payout.nextPayoutDate}
        />
      </section>

      {/* 5-day eligibility card */}
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

      {/* Active quest */}
      <section className={`rise rise-4`}>
        <QuestCard employeeId={employee.employeeId} vertical="FNL" payout={payout} />
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
            <AccordionTrigger>Past 4 weeks</AccordionTrigger>
            <AccordionContent>
              <div className={styles.weeksList}>
                {payout.recentWeeks.map((w) => (
                  <div key={w.weekStart} className={styles.weekRow}>
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
            <AccordionTrigger>Eligibility & your record</AccordionTrigger>
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
