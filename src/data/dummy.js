export const dummyData = {
  employee: { name: 'Rohit', storeName: 'Reliance Digital, Andheri West' },
  streak: { current: 7 },
  earnings: {
    thisMonth: { amount: 4280 },
    today: { amount: 180 },
  },
  goal: { target: 7000, pct: 0.611 },
  // Store-level collective target. Multiplier applies to personal incentives
  // once the store clears each threshold. Fed from admin portal in v2.
  storeBoost: {
    storeName: 'Reliance Digital, Andheri West',
    period: 'April',
    target: 3_200_000,      // ₹ store target for the month
    achieved: 2_305_000,    // current ₹ achieved
    pct: 0.72,              // achieved / target
    // Ladder of multiplier tiers. Each kicks in when store pct crosses the gate.
    tiers: [
      { gate: 0.70, multiplier: 1.0,  label: 'Base' },
      { gate: 0.80, multiplier: 1.1,  label: 'Push' },
      { gate: 0.90, multiplier: 1.2,  label: 'Strong' },
      { gate: 1.00, multiplier: 1.3,  label: 'Full hit' },
    ],
    currentTierIndex: 0,    // derived from pct vs gates
    nextTierIndex: 1,
  },
  opportunities: [
    { sku: 'Vivo Y28', band: '₹15k–20k band', earn: 90 },
    { sku: 'boAt Airdopes', band: '₹1k–2k band', earn: 40 },
    { sku: 'Samsung M14', band: '₹10k–15k', earn: 75 },
    { sku: 'Noise ColorFit', band: '₹2k–5k', earn: 55 },
  ],
  myRank: { rank: 3, deltaAbove: 40, scope: 'store' },
};
