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
import ComplianceLink from '../../../components/Molecule/ComplianceLink/ComplianceLink';

function findSplit(sms, dms) {
  return fnlWeeklyRules.splitMatrix.find((m) => m.sms === sms && m.dms === dms) || fnlWeeklyRules.splitMatrix[0];
}

export default function FnlView({ payout, employee, store, role }) {
  const qualifies = payout.storeQualifies;
  const split = findSplit(payout.staffing.sms, payout.staffing.dms);
  const myEmp = payout.employees.find((e) => e.employeeId === employee.employeeId);
  const myPayout = myEmp?.payout ?? 0;
  const myDays = myEmp?.daysPresent ?? 0;
  const eligible5Day = myDays >= fnlWeeklyRules.minWorkingDays;

  return (
    <>
      {/* Week hero */}
      <section className={`${styles.pad} rise rise-2`}>
        <HeroCard>
          <HeroCard.EyebrowRow>
            <HeroCard.Eyebrow withDot>
              <Calendar size={11} strokeWidth={2.2} />
              Week of {payout.weekStart}
            </HeroCard.Eyebrow>
            <HeroCard.QualifyPill qualifies={qualifies}>
              {qualifies ? 'Qualifies' : 'Missed target'}
            </HeroCard.QualifyPill>
          </HeroCard.EyebrowRow>

          <HeroCard.Amount prefix="₹" tone="brand">
            {qualifies && eligible5Day
              ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(myPayout)
              : '0'}
          </HeroCard.Amount>
          <HeroCard.AmountCap>Your share this week</HeroCard.AmountCap>

          <HeroCard.Figures dense>
            <HeroCard.Figure value={formatINR(payout.actualWeeklyGrossSales)} cap="actual" />
            <HeroCard.FigureDivider />
            <HeroCard.Figure value={formatINR(payout.weeklySalesTarget)} cap="target" />
            <HeroCard.FigureDivider />
            <HeroCard.Figure value={formatINR(payout.totalStoreIncentive)} cap="pool · 1%" />
          </HeroCard.Figures>

          <HeroCard.FooterBlock>
            <div>
              <HeroCard.FooterLabel>Your pool share</HeroCard.FooterLabel>
              <HeroCard.FooterValue>
                {role === 'SM' ? `${Math.round(split.smSharePct * 100)}%` :
                 role === 'DM' ? `${Math.round(split.dmSharePctEach * 100)}%` :
                 `${Math.round(split.saPoolPct * 100)}%`}
              </HeroCard.FooterValue>
            </div>
            <HeroCard.FooterMeta>
              <span>{role}</span>
              <span>·</span>
              <span>
                {role === 'SM' ? 'of pool' :
                 role === 'DM' ? 'per DM' :
                 `÷ ${payout.staffing.eligibleSaCount} SAs`}
              </span>
            </HeroCard.FooterMeta>
          </HeroCard.FooterBlock>
        </HeroCard>
      </section>

      {/* Streak note — always positive */}
      {payout.streak && payout.streak.current > 0 && (
        <section className={`${styles.streakRow} rise rise-2`}>
          <StreakNote streak={payout.streak} />
        </section>
      )}

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
      <section className={`${styles.pad} rise rise-4`}>
        <QuestCard employeeId={employee.employeeId} />
      </section>

      {/* Badges */}
      <section className={`rise rise-4`}>
        <BadgesStrip employeeId={employee.employeeId} />
      </section>

      {/* Split matrix */}
      <section className={`${styles.pad} rise rise-4`}>
        <div className={styles.cardDark}>
          <div className={styles.cardHead}>
            <span className={styles.eyebrow}>Split matrix</span>
            <span className={styles.smallPill}>This store: {payout.staffing.sms} SM · {payout.staffing.dms} DM</span>
          </div>
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
        </div>
      </section>

      {/* Recent weeks trajectory */}
      <section className={`${styles.pad} rise rise-5`}>
        <div className={styles.cardLight}>
          <div className={styles.cardHead}>
            <span className={styles.eyebrow}>Past 4 weeks</span>
          </div>
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
        </div>
      </section>

      {/* Compliance — demoted to quiet inline disclosure for consistency */}
      <section className={`${styles.pad} rise rise-5`}>
        <ComplianceLink
          label="Eligibility & your record"
          items={[
            { label: 'Role',                   value: `${role} · ${employee?.employeeId}` },
            { label: 'Payroll status',          value: employee?.payrollStatus },
            { label: 'Days PRESENT this week',  value: `${myDays} / 7` },
            { label: '5-day rule',              value: eligible5Day ? 'Met' : 'Not met' },
          ]}
        />
      </section>
    </>
  );
}
