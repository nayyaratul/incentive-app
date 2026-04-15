/**
 * Compute which rows to render in the leaderboard focus list,
 * and whether to show "..." affordances above/below.
 *
 * @param {Array<{rank:number, name:string, earned:number, isSelf?:boolean, note?:string}>} entries
 * @param {number} selfRank
 * @returns {{rows: Array, ellipsisTop: boolean, ellipsisBottom: boolean}}
 */
export function computeFocusRows(entries, selfRank) {
  const sorted = [...entries].sort((a, b) => a.rank - b.rank);
  const byRank = new Map(sorted.map((e) => [e.rank, e]));
  const maxRank = sorted.length ? sorted[sorted.length - 1].rank : 0;

  const pick = (ranks) =>
    ranks.map((r) => byRank.get(r)).filter(Boolean);

  // Case A: self is on the podium (ranks 1–3) — show next chasers #4 and #5.
  if (selfRank <= 3) {
    return {
      rows: pick([4, 5]),
      ellipsisTop: false,
      ellipsisBottom: maxRank > 5,
    };
  }

  // Case B: self is exactly rank 4 — rank 3 is already on the podium, so
  // show only #4 (self) and #5. No top ellipsis.
  if (selfRank === 4) {
    return {
      rows: pick([4, 5]),
      ellipsisTop: false,
      ellipsisBottom: maxRank > 5,
    };
  }

  // Case C: self is somewhere ≥ 5. Show self ± 1 neighbour.
  const ranks = [selfRank - 1, selfRank, selfRank + 1];
  return {
    rows: pick(ranks),
    ellipsisTop: true,
    ellipsisBottom: selfRank + 1 < maxRank,
  };
}
