// ============================================================================
// Legacy shim — the single dummyData object that the original Home.jsx reads.
// New code uses `usePersona()` + the richer dataset in masters/configs/payouts.
// ============================================================================

import { employees, stores } from './masters';
import { electronicsPayoutsRD3675 } from './payouts';

const rohit = employees.find((e) => e.employeeId === 'EMP-0041');
const rohitStore = stores.find((s) => s.storeCode === rohit.storeCode);
const rohitPayout = electronicsPayoutsRD3675.find((p) => p.employeeId === 'EMP-0041');

const totalFinal = rohitPayout.byDepartment.reduce((s, d) => s + d.finalPayout, 0);

export const dummyData = {
  employee: { name: rohit.employeeName.split(' ')[0], storeName: rohitStore.storeName },
  streak: { current: rohitPayout.streak },
  earnings: {
    thisMonth: { amount: totalFinal },
    today: { amount: rohitPayout.todayEarned },
  },
  goal: {
    target: rohitPayout.monthlyGoalTarget,
    pct: totalFinal / rohitPayout.monthlyGoalTarget,
  },
  storeBoost: {
    storeName: rohitStore.storeName,
    period: 'April',
    target: 3200000,
    achieved: 2305000,
    pct: 0.72,
    tiers: [
      { gate: 0.70, multiplier: 1.0, label: 'Base' },
      { gate: 0.80, multiplier: 1.1, label: 'Push' },
      { gate: 0.90, multiplier: 1.2, label: 'Strong' },
      { gate: 1.00, multiplier: 1.3, label: 'Full hit' },
    ],
    currentTierIndex: 0,
    nextTierIndex: 1,
  },
  opportunities: [
    { sku: 'Vivo Y28',       band: '₹15k–20k band', earn: 50 },
    { sku: 'Samsung M14',    band: '₹10k–15k band', earn: 25 },
    { sku: 'boAt Airdopes',  band: '₹1k–2k band',   earn: 40 },
    { sku: 'Noise ColorFit', band: '₹2k–5k band',   earn: 50 },
  ],
  myRank: { rank: 3, deltaAbove: 40, scope: 'store' },
  momentum: {
    vsLastMonth: { pct: 0.18, direction: 'up', lastMonth: 3620 },
    nextMilestone: { amount: 5000, remaining: 1240, label: '₹5,000 this month' },
    bestWindow: { range: '6–8 PM', category: 'Electronics', lift: '2.3×' },
  },
  floorFeed: [
    { who: 'Priya S.',  action: 'sold',      sku: 'boAt Airdopes',   earned: 40, mins: 2  },
    { who: 'Vikram D.', action: 'sold',      sku: 'Samsung M14',     earned: 25, mins: 6  },
    { who: 'Anita R.',  action: 'milestone', label: '₹3,000 crossed',            mins: 11 },
    { who: 'Rohit S.',  action: 'sold',      sku: 'Vivo Y28',        earned: 50, mins: 14 },
    { who: 'Kiran P.',  action: 'sold',      sku: 'Noise ColorFit',  earned: 50, mins: 18 },
  ],
};
