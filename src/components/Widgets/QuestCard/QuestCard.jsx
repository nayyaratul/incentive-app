import React from 'react';
import { Target, CheckCircle2 } from 'lucide-react';
import { Card } from '@/nexus/molecules';
import { Badge, ProgressBar, Text } from '@/nexus/atoms';
import styles from './QuestCard.module.scss';
import { questsByEmployee } from '../../../data/gamification';

// Sample employee per vertical — used when the API-fetched employeeId
// isn't in the gamification mock data, so every user sees example quests.
const VERTICAL_SAMPLE_ID = {
  ELECTRONICS: 'EMP-0041',
  GROCERY: 'GRC-2203',
  FNL: 'FNL-3103',
};

/**
 * Brief-aligned quests only. Each quest tracks progress toward a gate/mechanic
 * defined in the vendor brief. Rewards quote the brief's own payout — no
 * invented bonuses.
 */
export default function QuestCard({ employeeId, vertical }) {
  const direct = questsByEmployee[employeeId];
  const fallbackId = VERTICAL_SAMPLE_ID[vertical];
  const quests = direct || (fallbackId ? questsByEmployee[fallbackId] : null) || [];
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
        <ul className={styles.list}>
          {quests.map((q) => {
            const pctRaw = q.progress.target > 0 ? q.progress.current / q.progress.target : 0;
            const pctInt = Math.min(100, Math.round(pctRaw * 100));
            const done = q.status === 'completed';
            return (
              <li key={q.id} className={`${styles.quest} ${done ? styles.questDone : ''}`}>
                <div className={styles.qHead}>
                  <Text
                    as="span"
                    variant="overline"
                    size="xs"
                    weight="semibold"
                    className={styles.qType}
                  >
                    {q.type}
                  </Text>
                  {done && (
                    <span className={styles.qDoneTag}>
                      <CheckCircle2 size={12} strokeWidth={2.4} aria-hidden="true" />
                      <Text as="span" variant="micro" weight="semibold">Unlocked</Text>
                    </span>
                  )}
                </div>

                <Text
                  as="div"
                  variant="body"
                  size="md"
                  weight="semibold"
                  className={styles.qTitle}
                >
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
                  <span className={styles.qCount}>{formatProgress(q.progress)}</span>
                </div>

                <div className={styles.qReward}>
                  <span className={styles.qRewardArrow} aria-hidden="true">↳</span>
                  <Text as="span" variant="caption" size="sm">{q.reward}</Text>
                </div>
              </li>
            );
          })}
        </ul>
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
