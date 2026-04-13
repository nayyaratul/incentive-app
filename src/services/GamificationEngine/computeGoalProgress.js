// src/services/GamificationEngine/computeGoalProgress.js
import dayjs from 'dayjs';

const EARNED_KEY = {
  daily: 'today',
  weekly: 'thisWeek',
  monthly: 'thisMonth',
};

function elapsedFraction(period, now) {
  const d = dayjs(now);
  switch (period) {
    case 'daily': {
      const start = d.startOf('day');
      const end = d.endOf('day');
      return (d.valueOf() - start.valueOf()) / (end.valueOf() - start.valueOf());
    }
    case 'weekly': {
      const start = d.startOf('week');
      const end = d.endOf('week');
      return (d.valueOf() - start.valueOf()) / (end.valueOf() - start.valueOf());
    }
    case 'monthly': {
      const start = d.startOf('month');
      const end = d.endOf('month');
      return (d.valueOf() - start.valueOf()) / (end.valueOf() - start.valueOf());
    }
    default:
      return 0;
  }
}

function deriveState(pct, elapsed) {
  if (pct > 1) return 'exceeded';
  if (pct === 1) return 'hit';
  if (pct >= elapsed + 0.15) return 'ahead';
  if (pct >= elapsed - 0.05) return 'on-track';
  return 'behind';
}

/**
 * Per-goal progress view.
 * @returns {Array<{period, earned, target, pct, remaining, state}>}
 */
export function computeGoalProgress(earnings, goals, now = new Date()) {
  return goals.map((g) => {
    const earned = earnings[EARNED_KEY[g.period]]?.amount ?? 0;
    const target = g.target;
    const pct = target > 0 ? earned / target : 0;
    const elapsed = elapsedFraction(g.period, now);
    const remaining = Math.max(0, target - earned);
    return {
      period: g.period,
      earned,
      target,
      pct,
      remaining,
      state: deriveState(pct, elapsed),
    };
  });
}
