import { isNewBadge, sortBadgesForStrip } from './badgeSort';

describe('isNewBadge', () => {
  const now = new Date('2026-04-15T12:00:00');

  test('returns true when unlockedAt is within the last 24h', () => {
    expect(isNewBadge('2026-04-14T13:00:00', now)).toBe(true);
  });

  test('returns false when unlockedAt is older than 24h', () => {
    expect(isNewBadge('2026-04-14T11:00:00', now)).toBe(false);
  });

  test('returns false when unlockedAt is null (locked)', () => {
    expect(isNewBadge(null, now)).toBe(false);
  });

  test('returns false when unlockedAt is undefined', () => {
    expect(isNewBadge(undefined, now)).toBe(false);
  });

  test('returns false when unlockedAt is in the future (clock skew)', () => {
    expect(isNewBadge('2026-04-15T13:00:00', now)).toBe(false);
  });
});

describe('sortBadgesForStrip', () => {
  const now = new Date('2026-04-15T12:00:00');

  const mk = (id, rarity, unlockedAt) => ({ id, rarity, unlockedAt });

  test('newly-unlocked (within 24h) comes first regardless of rarity', () => {
    const input = [
      mk('a', 'gold',   '2026-04-10T10:00:00'), // older
      mk('b', 'bronze', '2026-04-14T14:00:00'), // new
    ];
    const out = sortBadgesForStrip(input, now);
    expect(out.map((b) => b.id)).toEqual(['b', 'a']);
  });

  test('among earned-not-new, orders by rarity gold > silver > bronze', () => {
    const input = [
      mk('b', 'bronze', '2026-04-01T10:00:00'),
      mk('s', 'silver', '2026-04-01T10:00:00'),
      mk('g', 'gold',   '2026-04-01T10:00:00'),
    ];
    const out = sortBadgesForStrip(input, now);
    expect(out.map((b) => b.id)).toEqual(['g', 's', 'b']);
  });

  test('within same rarity, more-recent unlockedAt comes first', () => {
    const input = [
      mk('old', 'silver', '2026-04-01T10:00:00'),
      mk('new', 'silver', '2026-04-10T10:00:00'),
    ];
    const out = sortBadgesForStrip(input, now);
    expect(out.map((b) => b.id)).toEqual(['new', 'old']);
  });

  test('locked badges come after all earned badges', () => {
    const input = [
      mk('locked', 'gold',   null),
      mk('earned', 'bronze', '2026-04-01T10:00:00'),
    ];
    const out = sortBadgesForStrip(input, now);
    expect(out.map((b) => b.id)).toEqual(['earned', 'locked']);
  });

  test('among locked badges, orders by rarity gold > silver > bronze', () => {
    const input = [
      mk('lb', 'bronze', null),
      mk('ls', 'silver', null),
      mk('lg', 'gold',   null),
    ];
    const out = sortBadgesForStrip(input, now);
    expect(out.map((b) => b.id)).toEqual(['lg', 'ls', 'lb']);
  });

  test('does not mutate the input array', () => {
    const input = [
      mk('b', 'bronze', '2026-04-01T10:00:00'),
      mk('g', 'gold',   '2026-04-01T10:00:00'),
    ];
    const before = input.map((b) => b.id).join(',');
    sortBadgesForStrip(input, now);
    expect(input.map((b) => b.id).join(',')).toBe(before);
  });
});
