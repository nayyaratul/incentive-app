// ============================================================================
// Gamification layer — badges, levels (tiers), quests.
// Layered on top of the brief; not part of the formal incentive calculation.
// ============================================================================

// -------- Levels / Tiers --------
// Based on MTD final payout. Purely visual progression.
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

// -------- Badges --------
// One-off achievements earned when a condition is first met for this month.
// `unlockedAt` null = locked; set to a datetime when earned.
export const badgesByEmployee = {
  'EMP-0041': [
    { id: 'first-sale',   icon: '🎯', label: 'First sale',     note: 'Made your first qualifying sale this month',       unlockedAt: '2026-04-01T10:32:00' },
    { id: 'streak-7',     icon: '🔥', label: '7-day streak',   note: 'Qualifying sale every day for 7 consecutive days', unlockedAt: '2026-04-13T12:01:00' },
    { id: 'crore-club',   icon: '💎', label: 'Crore club',     note: 'Sold ₹1 lakh+ gross in a single day',              unlockedAt: null },
    { id: 'push-master',  icon: '🚀', label: 'Push master',    note: 'Cleared 3 priority SKUs in one shift',             unlockedAt: '2026-04-08T16:45:00' },
    { id: 'qled-pro',     icon: '📺', label: 'QLED pro',       note: 'Sold 2+ premium TVs this month',                   unlockedAt: '2026-04-12T18:20:00' },
    { id: 'top-5',        icon: '🏆', label: 'Top-5 in store', note: 'Finished top 5 on the store leaderboard this week', unlockedAt: null },
  ],
  'GRC-2203': [
    { id: 'campaign-starter', icon: '🎂', label: 'Campaign starter', note: 'Sold your first campaign article',    unlockedAt: '2026-04-15T11:20:00' },
    { id: 'cake-crusher',     icon: '🍰', label: 'Cake crusher',     note: 'Sold 10+ cakes in a single day',        unlockedAt: null },
    { id: 'all-brands',       icon: '✨', label: 'All brands',       note: 'Sold from every brand in the campaign', unlockedAt: '2026-04-18T14:15:00' },
  ],
  'FNL-3103': [
    { id: 'full-week',    icon: '📅', label: 'Full week',     note: 'Present all 7 days of the incentive week',   unlockedAt: '2026-04-18T19:00:00' },
    { id: 'first-qualify',icon: '✅', label: 'First qualifier', note: 'Store beat weekly target for the first time', unlockedAt: '2026-04-11T20:00:00' },
    { id: 'consistency',  icon: '🎯', label: 'Consistency',   note: 'Store qualified 3 weeks in a row',           unlockedAt: null },
  ],
};

// -------- Quests --------
// Short-duration tasks that admin portal can push; act as mini-contests.
// Statuses: active / completed / locked.
export const questsByEmployee = {
  'EMP-0041': [
    {
      id: 'q-today-3-samsung',
      type: 'daily',
      title: 'Sell 3 Samsung / Oppo / Vivo phones today',
      progress: { current: 2, target: 3 },
      reward: { kind: 'bonus', amount: 100 },
      status: 'active',
      expiresAt: '2026-04-13T22:00:00',
    },
    {
      id: 'q-week-premium-tv',
      type: 'weekly',
      title: 'Move one premium TV (₹60k+) this week',
      progress: { current: 0, target: 1 },
      reward: { kind: 'bonus', amount: 250 },
      status: 'active',
      expiresAt: '2026-04-19T22:00:00',
    },
    {
      id: 'q-5-airdopes',
      type: 'daily',
      title: 'Clear 5 boAt Airdopes as add-ons',
      progress: { current: 5, target: 5 },
      reward: { kind: 'bonus', amount: 75 },
      status: 'completed',
      completedAt: '2026-04-12T19:40:00',
    },
  ],
  'GRC-2203': [
    {
      id: 'q-unibic-push',
      type: 'weekly',
      title: 'Sell 20 pieces of Unibic plum cake this week',
      progress: { current: 12, target: 20 },
      reward: { kind: 'bonus', amount: 80 },
      status: 'active',
      expiresAt: '2026-04-25T23:00:00',
    },
  ],
  'FNL-3103': [
    {
      id: 'q-upsell',
      type: 'daily',
      title: 'Add 2 accessories to denim orders today',
      progress: { current: 1, target: 2 },
      reward: { kind: 'bonus', amount: 60 },
      status: 'active',
      expiresAt: '2026-04-13T22:00:00',
    },
  ],
};
