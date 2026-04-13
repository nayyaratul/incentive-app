// src/services/GamificationEngine/computeStreak.test.js
import { computeStreak } from './computeStreak';

describe('computeStreak', () => {
  test('returns 0/0 when sales array is empty', () => {
    const result = computeStreak([], new Date('2026-04-13T12:00:00+05:30'));
    expect(result).toEqual({
      current: 0,
      longest: 0,
      lastQualifyingDay: null,
    });
  });

  test('current=1 when one qualifying sale today', () => {
    const sales = [
      { id: 's1', earned: 90, soldAt: '2026-04-13T11:42:00+05:30' },
    ];
    const result = computeStreak(sales, new Date('2026-04-13T20:00:00+05:30'));
    expect(result.current).toBe(1);
    expect(result.longest).toBe(1);
    expect(result.lastQualifyingDay).toBe('2026-04-13');
  });

  test('current=7 for seven consecutive qualifying days', () => {
    const sales = [];
    for (let i = 0; i < 7; i++) {
      sales.push({ id: `s${i}`, earned: 50, soldAt: `2026-04-${String(7 + i).padStart(2, '0')}T10:00:00+05:30` });
    }
    const result = computeStreak(sales, new Date('2026-04-13T20:00:00+05:30'));
    expect(result.current).toBe(7);
    expect(result.longest).toBe(7);
  });

  test('broken day resets current to 0 (and counts from most recent run)', () => {
    const sales = [
      { id: 'a', earned: 50, soldAt: '2026-04-01T10:00:00+05:30' },
      { id: 'b', earned: 50, soldAt: '2026-04-02T10:00:00+05:30' },
      { id: 'c', earned: 50, soldAt: '2026-04-03T10:00:00+05:30' },
      // gap: 04-04, 04-05
      { id: 'd', earned: 50, soldAt: '2026-04-10T10:00:00+05:30' },
    ];
    const today = new Date('2026-04-13T20:00:00+05:30');
    const result = computeStreak(sales, today);
    expect(result.current).toBe(0);
    expect(result.longest).toBe(3);
    expect(result.lastQualifyingDay).toBe('2026-04-10');
  });

  test('current=1 when today has no sale but yesterday did', () => {
    const sales = [
      { id: 'a', earned: 50, soldAt: '2026-04-12T10:00:00+05:30' },
    ];
    const today = new Date('2026-04-13T09:00:00+05:30');
    const result = computeStreak(sales, today);
    expect(result.current).toBe(1);
    expect(result.lastQualifyingDay).toBe('2026-04-12');
  });

  test('ignores sales with earned <= 0', () => {
    const sales = [
      { id: 'a', earned: 0, soldAt: '2026-04-13T10:00:00+05:30' },
      { id: 'b', earned: 50, soldAt: '2026-04-13T11:00:00+05:30' },
    ];
    const today = new Date('2026-04-13T12:00:00+05:30');
    const result = computeStreak(sales, today);
    expect(result.current).toBe(1);
  });
});
