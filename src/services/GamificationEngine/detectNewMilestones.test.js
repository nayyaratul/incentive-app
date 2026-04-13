// src/services/GamificationEngine/detectNewMilestones.test.js
import { detectNewMilestones, bucketKey } from './detectNewMilestones';

describe('detectNewMilestones', () => {
  const earnings = {
    today: { amount: 180, count: 2 },
    thisWeek: { amount: 920, count: 11 },
    thisMonth: { amount: 5100, count: 50 },
    lifetime: { amount: 48120, count: 612 },
  };
  const now = new Date('2026-04-13T12:00:00+05:30');

  const ms1k = { id: 'MS-1000', threshold: 1000, period: 'monthly', label: '₹1k', celebration: 'both' };
  const ms5k = { id: 'MS-5000', threshold: 5000, period: 'monthly', label: '₹5k', celebration: 'both' };
  const ms10k = { id: 'MS-10000', threshold: 10000, period: 'monthly', label: '₹10k', celebration: 'both' };

  test('returns only newly crossed milestones', () => {
    const celebrated = new Set();
    const result = detectNewMilestones([ms1k, ms5k, ms10k], earnings, celebrated, now);
    expect(result.map((m) => m.id)).toEqual(['MS-1000', 'MS-5000']);
  });

  test('is idempotent — once marked celebrated, not returned again', () => {
    const celebrated = new Set([
      bucketKey(ms1k, now),
      bucketKey(ms5k, now),
    ]);
    const result = detectNewMilestones([ms1k, ms5k, ms10k], earnings, celebrated, now);
    expect(result).toHaveLength(0);
  });

  test('does not return milestones not yet crossed', () => {
    const low = { today: { amount: 0, count: 0 }, thisWeek: { amount: 0, count: 0 }, thisMonth: { amount: 500, count: 5 }, lifetime: { amount: 0, count: 0 } };
    const result = detectNewMilestones([ms1k, ms5k], low, new Set(), now);
    expect(result).toHaveLength(0);
  });

  test('period rollover: new month = empty celebrated set fires again', () => {
    const prevMonth = new Date('2026-03-31T12:00:00+05:30');
    const celebratedPrev = new Set([bucketKey(ms1k, prevMonth)]);
    const result = detectNewMilestones([ms1k], earnings, celebratedPrev, now);
    expect(result.map((m) => m.id)).toEqual(['MS-1000']);
  });
});

describe('bucketKey', () => {
  test('monthly bucket includes YYYY-MM', () => {
    const m = { id: 'MS-X', period: 'monthly' };
    expect(bucketKey(m, new Date('2026-04-13T00:00:00+05:30'))).toBe('MS-X:2026-04');
  });
  test('weekly bucket includes YYYY-Www', () => {
    const m = { id: 'MS-Y', period: 'weekly' };
    expect(bucketKey(m, new Date('2026-04-13T00:00:00+05:30'))).toMatch(/^MS-Y:2026-W\d{2}$/);
  });
  test('daily bucket includes YYYY-MM-DD', () => {
    const m = { id: 'MS-Z', period: 'daily' };
    expect(bucketKey(m, new Date('2026-04-13T00:00:00+05:30'))).toBe('MS-Z:2026-04-13');
  });
});
