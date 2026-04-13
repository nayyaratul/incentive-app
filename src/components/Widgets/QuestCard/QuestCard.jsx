import React from 'react';
import { Target, CheckCircle2 } from 'lucide-react';
import styles from './QuestCard.module.scss';
import { questsByEmployee } from '../../../data/gamification';

/**
 * Brief-aligned quests only. Each quest tracks progress toward a gate/mechanic
 * defined in the vendor brief. Rewards quote the brief's own payout — no
 * invented bonuses.
 */
export default function QuestCard({ employeeId }) {
  const quests = questsByEmployee[employeeId] || [];
  if (quests.length === 0) return null;

  const activeCount = quests.filter((q) => q.status === 'active').length;

  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <span className={styles.eyebrow}>
          <Target size={13} strokeWidth={2.4} />
          Active quests
        </span>
        <span className={styles.counter}>{activeCount} live</span>
      </header>

      <div className={styles.list}>
        {quests.map((q) => {
          const pctRaw = q.progress.target > 0 ? q.progress.current / q.progress.target : 0;
          const pctInt = Math.min(100, Math.round(pctRaw * 100));
          const done = q.status === 'completed';
          return (
            <div key={q.id} className={`${styles.quest} ${done ? styles.questDone : ''}`}>
              <div className={styles.qHead}>
                <span className={styles.qType}>{q.type}</span>
                {done && (
                  <span className={styles.qDoneTag}>
                    <CheckCircle2 size={12} strokeWidth={2.4} />
                    Unlocked
                  </span>
                )}
              </div>
              <div className={styles.qTitle}>{q.title}</div>

              <div className={styles.qProgRow}>
                <div className={styles.qTrack}>
                  <div className={styles.qFill} style={{ width: `${pctInt}%` }} />
                </div>
                <span className={styles.qCount}>
                  {formatProgress(q.progress)}
                </span>
              </div>

              <div className={styles.qReward}>{q.reward}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function formatProgress(p) {
  if (p.unit === '%') return `${p.current}% / ${p.target}%`;
  if (p.unit === 'days') return `${p.current}/${p.target} days`;
  if (p.unit === '₹') return `${lakh(p.current)} / ${lakh(p.target)}`;
  return `${p.current}/${p.target}`;
}

function lakh(n) {
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}
