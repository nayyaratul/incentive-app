import React, { useEffect, useState } from 'react';
import { Sparkles, ChevronUp } from 'lucide-react';
import styles from './LevelUpToast.module.scss';
import { tierFor } from '../../../data/gamification';

/**
 * Celebratory toast that slides up from the bottom when an employee
 * crosses an earnings tier boundary. Auto-dismisses after 4 seconds.
 *
 * Props:
 *   previousAmount — last known payout total (e.g. from yesterday / last refresh)
 *   currentAmount  — current MTD payout
 *
 * Uses LEVEL_TIERS from gamification.js to detect tier transitions.
 * On first render it checks if `currentAmount` crossed into a higher tier
 * than `previousAmount`, and if so, displays the celebration toast.
 */
export default function LevelUpToast({ previousAmount = 0, currentAmount = 0 }) {
  const [visible, setVisible] = useState(false);
  const [tier, setTier] = useState(null);

  useEffect(() => {
    const prevTier = tierFor(previousAmount);
    const currTier = tierFor(currentAmount);

    if (currTier && prevTier && currTier.id !== prevTier.id && currentAmount > previousAmount) {
      setTier(currTier);
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 4500);
      return () => clearTimeout(timer);
    }
  }, [previousAmount, currentAmount]);

  if (!visible || !tier) return null;

  return (
    <div
      className={styles.toast}
      style={{ '--tier-gradient': tier.gradient, '--tier-color': tier.color }}
      role="status"
      aria-live="polite"
    >
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.iconWrap}>
          <Sparkles size={18} strokeWidth={2.2} />
        </div>
        <div className={styles.text}>
          <div className={styles.eyebrow}>
            <ChevronUp size={12} strokeWidth={3} />
            Level up!
          </div>
          <div className={styles.tierName}>{tier.label}</div>
          <div className={styles.note}>
            You crossed ₹{tier.floor.toLocaleString('en-IN')} in earnings this month
          </div>
        </div>
      </div>
    </div>
  );
}
