// src/services/GamificationEngine/buildLeaderboardView.test.js
import { buildLeaderboardView } from './buildLeaderboardView';

describe('buildLeaderboardView', () => {
  const me = { id: 'EMP-0041', storeId: 'STR-MUM-0117' };

  const buildEntries = (count) =>
    Array.from({ length: count }, (_, i) => ({
      employeeId: `EMP-${String(i + 1).padStart(4, '0')}`,
      displayName: `Person ${i + 1}`,
      avatarUrl: null,
      rank: i + 1,
      earnings: 10000 - i * 100,
      isSelf: false,
    }));

  test('top N (≤20) returned as-is with delta annotations', () => {
    const entries = buildEntries(10);
    entries[2] = { ...entries[2], employeeId: 'EMP-0041', isSelf: true };
    const lb = { scope: 'store', scopeId: 'STR-MUM-0117', period: 'month', entries, myEntry: entries[2] };
    const view = buildLeaderboardView(lb, me);
    expect(view.entries).toHaveLength(10);
    expect(view.myRank).toBe(3);
    expect(view.deltaToNextAbove).toBe(100); // #3 earns 9800, #2 earns 9900
    expect(view.deltaToNextBelow).toBe(100);
  });

  test('self outside top 20 → top20 + separator + self pinned', () => {
    const entries = buildEntries(30);
    entries[24] = { ...entries[24], employeeId: 'EMP-0041', isSelf: true };
    const lb = { scope: 'store', scopeId: 'STR-MUM-0117', period: 'month', entries, myEntry: entries[24] };
    const view = buildLeaderboardView(lb, me);
    expect(view.entries).toHaveLength(22); // 20 + separator + self
    expect(view.entries[20]).toEqual({ kind: 'separator' });
    expect(view.entries[21].isSelf).toBe(true);
    expect(view.myRank).toBe(25);
  });

  test('self at rank 1 → no deltaToNextAbove', () => {
    const entries = buildEntries(5);
    entries[0] = { ...entries[0], employeeId: 'EMP-0041', isSelf: true };
    const lb = { scope: 'store', scopeId: 'STR-MUM-0117', period: 'month', entries, myEntry: entries[0] };
    const view = buildLeaderboardView(lb, me);
    expect(view.myRank).toBe(1);
    expect(view.deltaToNextAbove).toBe(null);
    expect(view.deltaToNextBelow).toBe(100);
  });

  test('self at last rank → no deltaToNextBelow', () => {
    const entries = buildEntries(5);
    entries[4] = { ...entries[4], employeeId: 'EMP-0041', isSelf: true };
    const lb = { scope: 'store', scopeId: 'STR-MUM-0117', period: 'month', entries, myEntry: entries[4] };
    const view = buildLeaderboardView(lb, me);
    expect(view.deltaToNextAbove).toBe(100);
    expect(view.deltaToNextBelow).toBe(null);
  });

  test('handles single-person leaderboard gracefully', () => {
    const entries = [{ employeeId: 'EMP-0041', displayName: 'Rohit S.', rank: 1, earnings: 500, isSelf: true, avatarUrl: null }];
    const lb = { scope: 'store', scopeId: 'STR-MUM-0117', period: 'month', entries, myEntry: entries[0] };
    const view = buildLeaderboardView(lb, me);
    expect(view.entries).toHaveLength(1);
    expect(view.deltaToNextAbove).toBe(null);
    expect(view.deltaToNextBelow).toBe(null);
  });
});
