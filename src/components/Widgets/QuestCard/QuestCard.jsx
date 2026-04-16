import React from 'react';
import { Target, CheckCircle2, Gift } from 'lucide-react';
import { Card } from '@/nexus/molecules';
import { ProgressBar, Text, Tag } from '@/nexus/atoms';
import styles from './QuestCard.module.scss';
import { questsByEmployee } from '../../../data/gamification';

const useMock = process.env.REACT_APP_USE_MOCK_DATA === 'true';

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
export default function QuestCard({ employeeId, vertical, payout }) {
  const quests = useMock
    ? getMockQuests(employeeId, vertical)
    : buildQuestsFromPayout(vertical, payout);

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

      {quests.length === 0 && (
        <div className={styles.empty}>
          <Target size={20} strokeWidth={1.8} className={styles.emptyIcon} />
          <Text as="div" variant="caption" size="sm" className={styles.emptyText}>
            No active quests yet. Keep selling to unlock your first quest!
          </Text>
        </div>
      )}

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

// ---------------------------------------------------------------------------
// Mock data path
// ---------------------------------------------------------------------------

function getMockQuests(employeeId, vertical) {
  const direct = questsByEmployee[employeeId];
  const fallbackId = VERTICAL_SAMPLE_ID[vertical];
  return direct || (fallbackId ? questsByEmployee[fallbackId] : null) || [];
}

// ---------------------------------------------------------------------------
// API data path — derive quests from payout/projection data
// ---------------------------------------------------------------------------

function buildQuestsFromPayout(vertical, payout) {
  if (!payout) return [];

  if (vertical === 'GROCERY') return buildGroceryQuests(payout);
  if (vertical === 'ELECTRONICS') return buildElectronicsQuests(payout);
  if (vertical === 'FNL') return buildFnlQuests(payout);
  return [];
}

function buildGroceryQuests(payout) {
  const ach = payout.achievementPct ?? 0;
  const projections = payout.projections || [];
  const targetValue = payout.targetSalesValue || payout.totalTarget || 0;
  const targetLabel = targetValue >= 1e5
    ? `₹${(targetValue / 1e5).toFixed(2)}L`
    : `₹${targetValue.toLocaleString('en-IN')}`;

  return projections.map((p, i) => {
    const scenarioPct = parseInt(p.scenario, 10) || 100;
    const done = ach >= scenarioPct;
    const isFirst = i === 0;

    return {
      id: `q-store-${scenarioPct}`,
      type: 'Store gate',
      title: isFirst
        ? `Get store to ${scenarioPct}% of ${targetLabel} target`
        : `Stretch — Store at ${scenarioPct}%`,
      progress: { current: ach, target: scenarioPct, unit: '%' },
      reward: `₹${p.rate} per piece${isFirst ? ' across all eligible articles sold' : ' — applies to every piece, not just above ' + scenarioPct + '%'}`,
      status: done ? 'completed' : 'active',
    };
  });
}

function buildElectronicsQuests(payout) {
  const quests = [];
  const depts = payout.byDepartment || [];

  for (const dept of depts) {
    const ach = dept.achievementPct ?? 0;
    // Quest for departments below 85% — first unlock gate
    if (ach < 85) {
      quests.push({
        id: `q-${dept.department}-85`,
        type: 'Dept multiplier',
        title: `Help ${dept.department} reach 85% of target`,
        progress: { current: ach, target: 85, unit: '%' },
        reward: `Unlocks 50% payout on your ${dept.department} base incentive`,
        status: 'active',
      });
    }
    // Quest for departments below 100%
    if (ach < 100 && ach >= 85) {
      quests.push({
        id: `q-${dept.department}-100`,
        type: 'Dept multiplier',
        title: `Push ${dept.department} to 100%`,
        progress: { current: ach, target: 100, unit: '%' },
        reward: `Unlocks full 100% payout on ${dept.department} base`,
        status: 'active',
      });
    }
    // Completed quests for departments at or above 120%
    if (ach >= 120) {
      quests.push({
        id: `q-${dept.department}-120`,
        type: 'Dept multiplier',
        title: `${dept.department} at 120%`,
        progress: { current: ach, target: 120, unit: '%' },
        reward: `1.20× on your ${dept.department} base — active now`,
        status: 'completed',
      });
    }
  }

  return quests;
}

function buildFnlQuests(payout) {
  const quests = [];
  const isMonth = Boolean(payout.isMonthView);
  const target = payout.weeklySalesTarget || payout.totalTarget || 0;
  const actual = payout.actualWeeklyGrossSales || payout.totalActual || 0;
  const qualifies = payout.storeQualifies ?? (target > 0 && actual >= target);
  const targetLabel = target >= 1e5
    ? `₹${Math.round(target / 1e5)}L`
    : `₹${target.toLocaleString('en-IN')}`;

  if (isMonth) {
    // Month view: show aggregate quest
    const wQ = payout.weeksQualified || 0;
    const wT = payout.weeksTotal || 0;
    quests.push({
      id: 'q-month-summary',
      type: 'Monthly',
      title: `${wQ} of ${wT} weeks qualified this month`,
      progress: { current: wQ, target: wT, unit: 'weeks' },
      reward: `Total month payout: ₹${(payout.myPayout || 0).toLocaleString('en-IN')}`,
      status: wQ === wT ? 'completed' : 'active',
    });
  } else {
    quests.push({
      id: 'q-store-beat',
      type: 'Store gate',
      title: `Store beats ${targetLabel} weekly target`,
      progress: { current: actual, target, unit: '₹' },
      reward: 'Unlocks 1% of weekly gross as store pool',
      status: qualifies ? 'completed' : 'active',
    });

    // 5-day attendance quest
    const days = payout.myAttendanceDays ?? (payout.streak?.current || 0);
    if (days > 0 || !qualifies) {
      quests.push({
        id: 'q-5-days',
        type: 'Eligibility',
        title: 'Be present 5+ days this week',
        progress: { current: Math.min(days, 7), target: 5, unit: 'days' },
        reward: "Keeps you eligible for this week's payout",
        status: days >= 5 ? 'completed' : 'active',
      });
    }
  }

  return quests;
}

function formatProgress(p) {
  if (p.unit === '%') return `${p.current}% / ${p.target}%`;
  if (p.unit === 'days') return `${p.current}/${p.target} days`;
  if (p.unit === 'weeks') return `${p.current}/${p.target} weeks`;
  if (p.unit === '₹') return `${lakh(p.current)} / ${lakh(p.target)}`;
  return `${p.current}/${p.target}`;
}

function lakh(n) {
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}
