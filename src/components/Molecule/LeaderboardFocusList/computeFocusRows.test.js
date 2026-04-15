import { computeFocusRows } from './computeFocusRows';

const mk = (rank, isSelf = false) => ({
  rank,
  name: `P${rank}`,
  earned: 1000 - rank * 100,
  isSelf,
});

const fiveEntries = [mk(1), mk(2), mk(3), mk(4), mk(5)];
const tenEntries = Array.from({ length: 10 }, (_, i) => mk(i + 1));

describe('computeFocusRows', () => {
  test('self in top 3 with exactly 5 entries: shows #4 and #5, no top/bottom ellipsis', () => {
    const entries = [mk(1), mk(2, true), mk(3), mk(4), mk(5)];
    const out = computeFocusRows(entries, 2);
    expect(out.rows.map((r) => r.rank)).toEqual([4, 5]);
    expect(out.ellipsisTop).toBe(false);
    expect(out.ellipsisBottom).toBe(false);
  });

  test('self in top 3 with 10 entries: shows #4 and #5, bottom ellipsis for #6+', () => {
    const entries = tenEntries.map((e) => (e.rank === 1 ? { ...e, isSelf: true } : e));
    const out = computeFocusRows(entries, 1);
    expect(out.rows.map((r) => r.rank)).toEqual([4, 5]);
    expect(out.ellipsisTop).toBe(false);
    expect(out.ellipsisBottom).toBe(true);
  });

  test('self === 4: shows #4 (self) and #5, no top ellipsis (podium covers #3), no bottom ellipsis if 5 total', () => {
    const entries = fiveEntries.map((e) => (e.rank === 4 ? { ...e, isSelf: true } : e));
    const out = computeFocusRows(entries, 4);
    expect(out.rows.map((r) => r.rank)).toEqual([4, 5]);
    expect(out.ellipsisTop).toBe(false);
    expect(out.ellipsisBottom).toBe(false);
  });

  test('self === 4 with 10 entries: shows #4 (self) and #5, bottom ellipsis for #6+', () => {
    const entries = tenEntries.map((e) => (e.rank === 4 ? { ...e, isSelf: true } : e));
    const out = computeFocusRows(entries, 4);
    expect(out.rows.map((r) => r.rank)).toEqual([4, 5]);
    expect(out.ellipsisBottom).toBe(true);
  });

  test('self in the middle (rank 6 of 10): shows #5 #6 #7, both ellipses', () => {
    const entries = tenEntries.map((e) => (e.rank === 6 ? { ...e, isSelf: true } : e));
    const out = computeFocusRows(entries, 6);
    expect(out.rows.map((r) => r.rank)).toEqual([5, 6, 7]);
    expect(out.ellipsisTop).toBe(true);
    expect(out.ellipsisBottom).toBe(true);
  });

  test('self is last (rank 10 of 10): shows #9 and #10, top ellipsis only', () => {
    const entries = tenEntries.map((e) => (e.rank === 10 ? { ...e, isSelf: true } : e));
    const out = computeFocusRows(entries, 10);
    expect(out.rows.map((r) => r.rank)).toEqual([9, 10]);
    expect(out.ellipsisTop).toBe(true);
    expect(out.ellipsisBottom).toBe(false);
  });

  test('handles unsorted input', () => {
    const entries = [mk(5), mk(2), mk(1), mk(4), mk(3, true)];
    const out = computeFocusRows(entries, 3);
    expect(out.rows.map((r) => r.rank)).toEqual([4, 5]);
    expect(out.ellipsisTop).toBe(false);
    expect(out.ellipsisBottom).toBe(false);
  });

  test('missing neighbour rank is skipped, not filled', () => {
    const entries = [mk(1), mk(2), mk(3), mk(4), mk(5), mk(8, true)];
    const out = computeFocusRows(entries, 8);
    expect(out.rows.map((r) => r.rank)).toEqual([8]);
    expect(out.ellipsisTop).toBe(true);
    expect(out.ellipsisBottom).toBe(false);
  });
});
