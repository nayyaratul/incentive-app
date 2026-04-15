// ============================================================================
// Gamification layer — badges + quests.
// IMPORTANT: quests reference ONLY the incentive gates defined in the brief.
// No invented bonuses. Each quest's "reward" is the exact payout treatment
// described in the brief when the corresponding gate is crossed.
// ============================================================================

// -------- Levels / Tiers (currently unused on home — kept for future) --------
export const LEVEL_TIERS = [
  { id: 'starter',  label: 'Starter',  floor: 0,    ceiling: 1000,    color: '#6B7280', gradient: 'linear-gradient(135deg, #D1D5DB 0%, #9CA3AF 100%)' },
  { id: 'bronze',   label: 'Bronze',   floor: 1000, ceiling: 3000,    color: '#9C6A2F', gradient: 'linear-gradient(135deg, #E7BE8A 0%, #B57832 100%)' },
  { id: 'silver',   label: 'Silver',   floor: 3000, ceiling: 5000,    color: '#6B7280', gradient: 'linear-gradient(135deg, #E5E7EB 0%, #9CA3AF 100%)' },
  { id: 'gold',     label: 'Gold',     floor: 5000, ceiling: 7500,    color: '#B58400', gradient: 'linear-gradient(135deg, #F7D973 0%, #B58400 100%)' },
  { id: 'platinum', label: 'Platinum', floor: 7500, ceiling: 12000,   color: '#2F427D', gradient: 'linear-gradient(135deg, #A5B5E5 0%, #2F427D 100%)' },
  { id: 'diamond',  label: 'Diamond',  floor: 12000, ceiling: Infinity, color: '#BD2925', gradient: 'linear-gradient(135deg, #F29C99 0%, #BD2925 100%)' },
];

export function tierFor(mtdPayout) {
  return LEVEL_TIERS.find((t) => mtdPayout >= t.floor && mtdPayout < t.ceiling) || LEVEL_TIERS[0];
}

// -------- Badges — progress markers, no extra ₹ reward --------
// These celebrate reaching brief-defined gates (multiplier unlocked, streak,
// campaign qualification). No invented rupee value.
export const badgesByEmployee = {
  'EMP-0041': [
    { id: 'first-sale',     icon: '🎯', label: 'First sale',          note: 'Made your first qualifying sale this month',       unlockedAt: '2026-04-01T10:32:00' },
    { id: 'streak-7',       icon: '🔥', label: '7-day streak',        note: 'Qualifying sale every day for 7 days',             unlockedAt: '2026-04-13T12:01:00' },
    { id: 'multiplier-120', icon: '🎉', label: 'Dept at 120%',        note: 'Large Appliances crossed 120% — paying 1.20× rate', unlockedAt: '2026-04-11T17:22:00' },
    { id: 'tv-premium',     icon: '📺', label: 'Premium TV',          note: 'Sold a TV in the ₹60k+ top-incentive band',         unlockedAt: null },
    { id: 'all-depts',      icon: '🧭', label: 'All depts',           note: 'Made at least one qualifying sale in every dept',  unlockedAt: null },
  ],
  'GRC-2203': [
    { id: 'first-campaign', icon: '🎂', label: 'Campaign opener',     note: 'Sold your first eligible article in the campaign', unlockedAt: '2026-04-15T11:20:00' },
    { id: 'store-100',      icon: '🎯', label: 'Store at 100%',       note: 'Store crosses target — unlocks ₹2/pc per brief',   unlockedAt: null },
    { id: 'all-brands',     icon: '✨', label: 'Every brand',         note: 'Sold at least one piece from every campaign brand', unlockedAt: '2026-04-18T14:15:00' },
  ],
  'FNL-3103': [
    { id: 'full-week',      icon: '📅', label: 'Full week present',   note: '7 PRESENT days — exceeds the weekly minimum',      unlockedAt: '2026-04-18T19:00:00' },
    { id: 'first-qualify',  icon: '✅', label: 'Store qualified',     note: 'Store beat the weekly target — pool unlocked',     unlockedAt: '2026-04-11T20:00:00' },
    { id: 'consistency',    icon: '🏆', label: '3 weeks in a row',    note: 'Store qualified three consecutive weeks',          unlockedAt: null },
  ],
  'FNL-3110': [
    { id: 'first-qualify',  icon: '✅', label: 'Store qualified',     note: 'Store beat the weekly target — pool unlocked',     unlockedAt: '2026-04-11T20:00:00' },
    { id: 'streak-5',       icon: '🔥', label: '5-day attendance',    note: 'Crossed the F&L minimum working-days threshold',   unlockedAt: '2026-04-17T18:10:00' },
    { id: 'weekend-push',   icon: '🛍️', label: 'Weekend push',        note: 'Strong conversion during Fri-Sat peak hours',      unlockedAt: null },
  ],
};

// -------- Quests — brief-aligned only --------
// Each quest tracks progress toward a gate/mechanic already defined in the
// vendor brief. Rewards quote the brief's own payout — no added incentives.
export const questsByEmployee = {
  // Rohit (SA, Electronics — primary dept Telecom, currently at 75%)
  'EMP-0041': [
    {
      id: 'q-telecom-85',
      type: 'Dept multiplier',
      title: 'Help Telecom reach 85% of target',
      progress: { current: 75, target: 85, unit: '%' },
      reward: 'Unlocks 50% payout on your Telecom base incentive',
      status: 'active',
    },
    {
      id: 'q-telecom-100',
      type: 'Dept multiplier',
      title: 'Stretch — Telecom at 100%',
      progress: { current: 75, target: 100, unit: '%' },
      reward: 'Unlocks full 100% payout on Telecom base',
      status: 'active',
    },
    {
      id: 'q-tv-premium',
      type: 'Top slab',
      title: 'Sell one TV in the ₹60k+ band',
      progress: { current: 0, target: 1, unit: 'sold' },
      reward: '₹225 per unit — highest TV base incentive slab',
      status: 'active',
    },
    {
      id: 'q-large-appl-120',
      type: 'Dept multiplier',
      title: 'Large Appliances at 120%',
      progress: { current: 127, target: 120, unit: '%' },
      reward: '1.20× on your Large Appliance base — active now',
      status: 'completed',
    },
  ],

  // Meena (SA, Grocery — Cake Rush at 92%)
  'GRC-2203': [
    {
      id: 'q-store-100',
      type: 'Store gate',
      title: 'Get store to 100% of ₹1.67L target',
      progress: { current: 92, target: 100, unit: '%' },
      reward: '₹2 per piece across all eligible articles sold',
      status: 'active',
    },
    {
      id: 'q-store-120',
      type: 'Store gate',
      title: 'Stretch — Store at 120%',
      progress: { current: 92, target: 120, unit: '%' },
      reward: '₹3 per piece — applies to every piece, not just above 120%',
      status: 'active',
    },
    {
      id: 'q-store-130',
      type: 'Store gate',
      title: 'Stretch — Store at 130%',
      progress: { current: 92, target: 130, unit: '%' },
      reward: '₹4 per piece — top slab; applies to all pieces',
      status: 'active',
    },
  ],

  // Sara (SA, F&L — week qualified, 7/7 present)
  'FNL-3103': [
    {
      id: 'q-store-beat',
      type: 'Store gate',
      title: 'Store beats ₹12L weekly target',
      progress: { current: 1260000, target: 1200000, unit: '₹' },
      reward: 'Unlocks 1% of weekly gross as store pool',
      status: 'completed',
    },
    {
      id: 'q-5-days',
      type: 'Eligibility',
      title: 'Be present 5+ days this week',
      progress: { current: 7, target: 5, unit: 'days' },
      reward: 'Keeps you eligible for this week\'s payout',
      status: 'completed',
    },
  ],
  'FNL-3110': [
    {
      id: 'q-store-beat',
      type: 'Store gate',
      title: 'Store beats ₹12L weekly target',
      progress: { current: 1260000, target: 1200000, unit: '₹' },
      reward: 'Unlocks 1% of weekly gross as store pool',
      status: 'completed',
    },
    {
      id: 'q-5-days',
      type: 'Eligibility',
      title: 'Be present 5+ days this week',
      progress: { current: 6, target: 5, unit: 'days' },
      reward: 'Keeps you eligible for this week\'s payout',
      status: 'completed',
    },
  ],
};
