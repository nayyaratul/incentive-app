// Pure helpers for BadgesStrip. Kept separate so the sort rules can be
// unit-tested without needing to render any React.

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

const RARITY_ORDER = { gold: 0, silver: 1, bronze: 2 };

/**
 * True iff the badge was unlocked within the last 24 hours. Returns false for
 * null / undefined / future timestamps.
 */
export function isNewBadge(unlockedAt, now = new Date()) {
  if (!unlockedAt) return false;
  const unlocked = new Date(unlockedAt).getTime();
  if (Number.isNaN(unlocked)) return false;
  const elapsed = now.getTime() - unlocked;
  return elapsed >= 0 && elapsed < TWENTY_FOUR_HOURS_MS;
}

/**
 * Returns a new array of badges ordered for the home shelf:
 *   1. newly-unlocked (within 24h) first
 *   2. then earned badges by rarity gold > silver > bronze
 *   3. within the same rarity, more-recent unlocks first
 *   4. locked badges last, also ordered gold > silver > bronze
 *
 * Does not mutate the input.
 */
export function sortBadgesForStrip(badges, now = new Date()) {
  return [...badges].sort((a, b) => {
    const aNew = isNewBadge(a.unlockedAt, now);
    const bNew = isNewBadge(b.unlockedAt, now);
    if (aNew !== bNew) return aNew ? -1 : 1;

    const aLocked = !a.unlockedAt;
    const bLocked = !b.unlockedAt;
    if (aLocked !== bLocked) return aLocked ? 1 : -1;

    const rarityDiff = (RARITY_ORDER[a.rarity] ?? 99) - (RARITY_ORDER[b.rarity] ?? 99);
    if (rarityDiff !== 0) return rarityDiff;

    // Most recent unlockedAt first (applies only to earned; locked have null and tie).
    if (a.unlockedAt && b.unlockedAt) {
      return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
    }
    return 0;
  });
}
