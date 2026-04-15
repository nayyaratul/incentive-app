import React from 'react';
import { Target, CheckCircle2, Gift } from 'lucide-react';
import { Card } from '@/nexus/molecules';
import { ProgressBar, Text, Tag } from '@/nexus/atoms';
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
 *
 * Layout: section header (title + live counter) followed by a stack of
 * standalone Nexus Cards, one per quest. No outer card wrapping the stack.
 */
export default function QuestCard({ employeeId, vertical }) {
  const direct = questsByEmployee[employeeId];
  const fallbackId = VERTICAL_SAMPLE_ID[vertical];
  const quests = direct || (fallbackId ? questsByEmployee[fallbackId] : null) || [];
  if (quests.length === 0) return null;

  const activeCount = quests.filter((q) => q.status === 'active').length;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Target size={14} strokeWidth={2.4} className={styles.iconBrand} aria-hidden="true" />
          <span className={styles.title}>Active quests</span>
        </div>
        <Text as="span" variant="caption" size="sm" className={styles.counter}>
          <strong>{activeCount}</strong> live
        </Text>
      </div>

      <ul className={styles.list}>
        {quests.map((q) => {
          const pctRaw = q.progress.target > 0 ? q.progress.current / q.progress.target : 0;
          const pctInt = Math.min(100, Math.round(pctRaw * 100));
          const done = q.status === 'completed';
          return (
            <li key={q.id}>
              <Card
                as="article"
                variant="outlined"
                size="md"
                className={`${styles.quest} ${done ? styles.questDone : ''}`}
              >
                <div className={styles.qHead}>
                  <Tag variant="default" size="sm">{q.type}</Tag>
                  {done && (
                    <Tag
                      variant="success"
                      size="sm"
                      icon={<CheckCircle2 size={12} strokeWidth={2.4} />}
                    >
                      Unlocked
                    </Tag>
                  )}
                </div>

                <Card.Subtitle
                  as="div"
                  weight="semibold"
                  color={done ? 'var(--color-text-secondary)' : 'var(--color-text-primary)'}
                >
                  {q.title}
                </Card.Subtitle>

                <div className={styles.qProgRow}>
                  <ProgressBar
                    value={pctInt}
                    max={100}
                    size="sm"
                    variant={done ? 'success' : 'default'}
                    className={styles.qTrack}
                  />
                  <span className={`${styles.qCount} ${done ? styles.qCountDone : ''}`}>
                    {formatProgress(q.progress)}
                  </span>
                </div>

                <Card.Footer align="start" className={styles.qReward}>
                  <Gift
                    size={12}
                    strokeWidth={2.4}
                    className={styles.qRewardIcon}
                    aria-hidden="true"
                  />
                  <Text as="span" variant="caption" size="sm" className={styles.qRewardText}>
                    {q.reward}
                  </Text>
                </Card.Footer>
              </Card>
            </li>
          );
        })}
      </ul>
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
