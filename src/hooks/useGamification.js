import { useMemo } from 'react';
import { computeStreak } from '../services/GamificationEngine/computeStreak';
import { tierFor, badgesByEmployee, questsByEmployee } from '../data/gamification';

/**
 * Computes gamification state from live API data.
 * badges and quests remain config-driven for now (no backend storage).
 */
export default function useGamification(employeeId, salesRows, mtdEarned) {
  const streak = useMemo(() => {
    if (!salesRows?.length) return { current: 0, longest: 0, lastQualifyingDay: null };
    const input = salesRows.map((s) => ({
      earned: s.incentiveAmount ?? s.finalIncentive ?? 0,
      soldAt: s.transactionDate,
    }));
    return computeStreak(input, new Date(), 'Asia/Kolkata');
  }, [salesRows]);

  const tier = useMemo(() => tierFor(mtdEarned || 0), [mtdEarned]);

  const badges = badgesByEmployee[employeeId] || [];
  const quests = questsByEmployee[employeeId] || [];

  return { streak, tier, badges, quests };
}
