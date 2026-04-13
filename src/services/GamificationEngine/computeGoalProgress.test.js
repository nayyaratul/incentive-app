// src/services/GamificationEngine/computeGoalProgress.test.js
import { computeGoalProgress } from './computeGoalProgress';

describe('computeGoalProgress', () => {
  const earnings = {
    today: { amount: 180, count: 2 },
    thisWeek: { amount: 920, count: 11 },
    thisMonth: { amount: 4280, count: 47 },
    lifetime: { amount: 48120, count: 612 },
  };

  const goals = [
    { period: 'daily', target: 300, currency: 'INR' },
    { period: 'weekly', target: 2000, currency: 'INR' },
    { period: 'monthly', target: 7000, currency: 'INR' },
  ];

  const midMonth = new Date('2026-04-15T12:00:00+05:30'); // 50% through Apr

  test('returns one GoalProgress per goal', () => {
    const result = computeGoalProgress(earnings, goals, midMonth);
    expect(result).toHaveLength(3);
    expect(result.map((g) => g.period)).toEqual(['daily', 'weekly', 'monthly']);
  });

  test('monthly at 4280/7000 on day 15/30 → "on-track" (pct≈0.61 vs elapsed≈0.50)', () => {
    const result = computeGoalProgress(earnings, goals, midMonth);
    const monthly = result.find((g) => g.period === 'monthly');
    expect(monthly.earned).toBe(4280);
    expect(monthly.target).toBe(7000);
    expect(monthly.pct).toBeCloseTo(0.611, 2);
    expect(monthly.remaining).toBe(2720);
    expect(monthly.state).toBe('on-track');
  });

  test('daily 180/300 on mid-day → "behind" when pct < elapsed', () => {
    const earlyEvening = new Date('2026-04-15T19:00:00+05:30'); // ~80% of day
    const result = computeGoalProgress(earnings, goals, earlyEvening);
    const daily = result.find((g) => g.period === 'daily');
    expect(daily.state).toBe('behind');
  });

  test('earned >= target → "hit"', () => {
    const e = { ...earnings, thisMonth: { amount: 7000, count: 50 } };
    const result = computeGoalProgress(e, goals, midMonth);
    expect(result.find((g) => g.period === 'monthly').state).toBe('hit');
  });

  test('earned > target → "exceeded"', () => {
    const e = { ...earnings, thisMonth: { amount: 8500, count: 60 } };
    const result = computeGoalProgress(e, goals, midMonth);
    expect(result.find((g) => g.period === 'monthly').state).toBe('exceeded');
  });
});
