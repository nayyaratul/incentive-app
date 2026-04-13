import React from 'react';
import { Calendar, Check, X as XIcon } from 'lucide-react';
import styles from './VerticalViews.module.scss';
import { formatINR } from '../../../utils/format';
import { fnlWeeklyRules } from '../../../data/configs';
import BadgesStrip from '../../../components/Widgets/BadgesStrip/BadgesStrip';
import QuestCard from '../../../components/Widgets/QuestCard/QuestCard';
import StreakNote from '../../../components/Molecule/StreakNote/StreakNote';

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
        <div className={styles.weekHero}>
          <div className={styles.weekEyebrow}>
            <Calendar size={11} strokeWidth={2.2} />
            <span>Week · {payout.weekStart} → {payout.weekEnd}</span>
          </div>

          <div className={styles.weekQualify}>
            <span className={`${styles.qPill} ${qualifies ? styles.qYes : styles.qNo}`}>
              {qualifies ? <Check size={13} strokeWidth={2.6} /> : <XIcon size={13} strokeWidth={2.6} />}
              Store {qualifies ? 'qualifies' : 'missed target'}
            </span>
          </div>

          <div className={styles.weekFigures}>
            <div>
              <div className={styles.weekMini}>{formatINR(payout.actualWeeklyGrossSales)}</div>
              <div className={styles.weekMiniCap}>actual</div>
            </div>
            <div className={styles.weekDiv} />
            <div>
              <div className={styles.weekMini}>{formatINR(payout.weeklySalesTarget)}</div>
              <div className={styles.weekMiniCap}>target</div>
            </div>
            <div className={styles.weekDiv} />
            <div>
              <div className={styles.weekMini}>{formatINR(payout.totalStoreIncentive)}</div>
              <div className={styles.weekMiniCap}>store pool (1%)</div>
            </div>
          </div>

          <div className={styles.weekMyBlock}>
            <div>
              <div className={styles.payoutLabel}>Your share this week</div>
              <div className={styles.payoutValue}>{qualifies && eligible5Day ? formatINR(myPayout) : '₹0'}</div>
            </div>
            <div className={styles.weekRole}>
              <span>{role}</span>
              <strong>
                {role === 'SM' ? `${Math.round(split.smSharePct * 100)}% of pool` :
                 role === 'DM' ? `${Math.round(split.dmSharePctEach * 100)}% of pool (per DM)` :
                 `${Math.round(split.saPoolPct * 100)}% pool ÷ ${payout.staffing.eligibleSaCount}`}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* Streak note — always positive */}
      {payout.streak && payout.streak.current > 0 && (
        <section className={`${styles.streakRow} rise rise-2`}>
          <StreakNote streak={payout.streak} />
        </section>
      )}

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

      {/* Compliance */}
      <section className={`${styles.pad} rise rise-5`}>
        <div className={styles.complianceCard}>
          <div className={styles.complianceHead}>
            <span>Eligibility</span>
          </div>
          <ul>
            <li><span>Role</span><strong>{role} · {employee?.employeeId}</strong></li>
            <li><span>Payroll status</span><strong>{employee?.payrollStatus}</strong></li>
            <li><span>Days PRESENT this week</span><strong>{myDays} / 7</strong></li>
            <li><span>5-day rule</span><strong>{eligible5Day ? 'Met' : 'Not met'}</strong></li>
          </ul>
        </div>
      </section>
    </>
  );
}
