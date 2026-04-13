// src/services/GamificationEngine/detectNewMilestones.js
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(weekOfYear);

const EARNED_KEY = {
  daily: 'today',
  weekly: 'thisWeek',
  monthly: 'thisMonth',
};

export function bucketKey(milestone, now = new Date()) {
  const d = dayjs(now);
  switch (milestone.period) {
    case 'monthly':
      return `${milestone.id}:${d.format('YYYY-MM')}`;
    case 'weekly':
      return `${milestone.id}:${d.format('YYYY')}-W${String(d.week()).padStart(2, '0')}`;
    case 'daily':
      return `${milestone.id}:${d.format('YYYY-MM-DD')}`;
    default:
      return `${milestone.id}:unknown`;
  }
}

/**
 * Returns milestones newly crossed *and* not yet celebrated for this period bucket.
 * The caller is responsible for merging returned bucket keys into `alreadyCelebrated`
 * (persisted to localStorage under `incentive.celebrated.v1`) after firing animations.
 *
 * @param {Array} milestones
 * @param {object} earnings
 * @param {Set<string>} alreadyCelebrated
 * @param {Date} now
 * @returns {Array}
 */
export function detectNewMilestones(milestones, earnings, alreadyCelebrated, now = new Date()) {
  if (!milestones || milestones.length === 0) return [];
  return milestones.filter((m) => {
    const earned = earnings[EARNED_KEY[m.period]]?.amount ?? 0;
    const crossed = earned >= m.threshold;
    if (!crossed) return false;
    return !alreadyCelebrated.has(bucketKey(m, now));
  });
}
