import React from 'react';
import { Target, CheckCircle2 } from 'lucide-react';
import { Card } from '@/nexus/molecules';
import { Badge, ProgressBar, Text } from '@/nexus/atoms';
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
    <Card as="section" variant="outlined" size="md">
      <Card.Header>
        <div className={styles.head}>
          <Card.Eyebrow className={styles.eyebrow}>
            <Target size={13} strokeWidth={2.4} className={styles.iconBrand} />
            Active quests
          </Card.Eyebrow>
          <Badge variant="default" size="sm" className={styles.counter}>{activeCount} live</Badge>
        </div>
      </Card.Header>

      <Card.Body>
        <div className={styles.list}>
          {quests.map((q) => {
            const pctRaw = q.progress.target > 0 ? q.progress.current / q.progress.target : 0;
            const pctInt = Math.min(100, Math.round(pctRaw * 100));
            const done = q.status === 'completed';
            return (
              <div key={q.id} className={`${styles.quest} ${done ? styles.questDone : ''}`}>
                <div className={styles.qHead}>
                  <Text variant="overline" size="xs" weight="semibold" color="var(--color-text-tertiary)" as="span">
                    {q.type}
                  </Text>
                  {done && (
                    <span className={styles.qDoneTag}>
                      <CheckCircle2 size={12} strokeWidth={2.4} />
                      <Text variant="micro" as="span" color="var(--color-text-success)" weight="semibold">
                        Unlocked
                      </Text>
                    </span>
                  )}
                </div>
                <Text variant="body" size="md" weight="semibold" className={styles.qTitle}>
                  {q.title}
                </Text>

                <div className={styles.qProgRow}>
                  <ProgressBar
                    value={pctInt}
                    max={100}
                    size="sm"
                    variant={done ? 'success' : 'default'}
                    className={styles.qTrack}
                  />
                  <Text variant="micro" as="span" weight="semibold" color="var(--color-text-primary)" className={styles.qCount}>
                    {formatProgress(q.progress)}
                  </Text>
                </div>

                <div className={styles.qReward}>
                  <Text variant="caption" size="sm" color="var(--color-text-secondary)">
                    {q.reward}
                  </Text>
                </div>
              </div>
            );
          })}
        </div>
      </Card.Body>
    </Card>
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
