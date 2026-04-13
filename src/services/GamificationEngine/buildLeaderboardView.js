// src/services/GamificationEngine/buildLeaderboardView.js

const TOP = 20;

/**
 * Trims to top 20 + self pinned if outside. Annotates deltas.
 * @param {{scope, scopeId, period, entries, myEntry}} lb
 * @param {{id: string}} me
 */
export function buildLeaderboardView(lb, me) {
  const sorted = [...lb.entries].sort((a, b) => a.rank - b.rank);
  const myIndex = sorted.findIndex((e) => e.employeeId === me.id);
  const myEntry = myIndex >= 0 ? sorted[myIndex] : lb.myEntry;
  const myRank = myEntry ? myEntry.rank : null;

  let entries;
  if (myIndex >= 0 && myIndex < TOP) {
    entries = sorted.slice(0, TOP);
  } else if (myIndex >= TOP) {
    entries = [...sorted.slice(0, TOP), { kind: 'separator' }, sorted[myIndex]];
  } else {
    entries = sorted.slice(0, TOP);
  }

  // Deltas relative to self, computed over the full sorted list (not the trimmed view).
  let deltaToNextAbove = null;
  let deltaToNextBelow = null;
  if (myIndex > 0) {
    deltaToNextAbove = sorted[myIndex - 1].earnings - myEntry.earnings;
  }
  if (myIndex >= 0 && myIndex < sorted.length - 1) {
    deltaToNextBelow = myEntry.earnings - sorted[myIndex + 1].earnings;
  }

  return {
    scope: lb.scope,
    scopeId: lb.scopeId,
    period: lb.period,
    myRank,
    deltaToNextAbove,
    deltaToNextBelow,
    entries,
  };
}
