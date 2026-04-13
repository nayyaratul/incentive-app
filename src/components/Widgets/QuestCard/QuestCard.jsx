import React from 'react';
import { Target, CheckCircle2, Clock } from 'lucide-react';
import styles from './QuestCard.module.scss';
import { questsByEmployee } from '../../../data/gamification';

function timeLeft(isoStr) {
  const end = new Date(isoStr).getTime();
  const now = Date.now();
  const diff = end - now;
  if (diff <= 0) return 'Expired';
  const hrs = Math.floor(diff / 3_600_000);
  if (hrs >= 24) return `${Math.floor(hrs / 24)} d left`;
  return `${hrs} h left`;
}

export default function QuestCard({ employeeId }) {
  const quests = questsByEmployee[employeeId] || [];
  if (quests.length === 0) return null;

  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <span className={styles.eyebrow}>
          <Target size={12} strokeWidth={2.4} />
          Active quests
        </span>
        <span className={styles.counter}>{quests.filter((q) => q.status === 'active').length} live</span>
      </header>

      <div className={styles.list}>
        {quests.map((q) => {
          const pct = q.progress.target > 0 ? q.progress.current / q.progress.target : 0;
          const pctInt = Math.min(100, Math.round(pct * 100));
          const done = q.status === 'completed';
          return (
            <div key={q.id} className={`${styles.quest} ${done ? styles.questDone : ''}`}>
              <div className={styles.qHead}>
                <span className={styles.qType}>{q.type === 'daily' ? 'Daily' : 'Weekly'}</span>
                <span className={styles.qReward}>+₹{q.reward.amount}</span>
              </div>
              <div className={styles.qTitle}>{q.title}</div>
              <div className={styles.qProgRow}>
                <div className={styles.qTrack}>
                  <div className={styles.qFill} style={{ width: `${pctInt}%` }} />
                </div>
                <span className={styles.qCount}>{q.progress.current}/{q.progress.target}</span>
              </div>
              <div className={styles.qFooter}>
                {done ? (
                  <span className={styles.qDoneTag}>
                    <CheckCircle2 size={12} strokeWidth={2.4} />
                    Completed
                  </span>
                ) : (
                  <span className={styles.qTime}>
                    <Clock size={11} strokeWidth={2.2} />
                    {timeLeft(q.expiresAt)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
