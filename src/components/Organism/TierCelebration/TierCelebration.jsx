import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import styles from './TierCelebration.module.scss';

/**
 * Brief-aligned celebration overlay for a department multiplier (or campaign
 * slab) crossing a tier gate. The "moment" itself is a UI affordance; the
 * tier values + multiplier % shown come from the brief (§6.4 Step 2 for
 * Electronics, §7.2 for Grocery).
 *
 * Auto-dismisses after `duration` ms (default 3.2s).
 */
export default function TierCelebration({ open, kind = 'up', tier, onDismiss, duration = 3200 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      onDismiss && onDismiss();
    }, duration);
    return () => clearTimeout(t);
  }, [open, duration, onDismiss]);

  if (!open && !visible) return null;
  if (!tier) return null;

  return (
    <div className={`${styles.overlay} ${styles[`kind-${kind}`]}`} onClick={() => { setVisible(false); onDismiss && onDismiss(); }}>
      {/* Confetti dots — simple animated CSS, no library */}
      <div className={styles.confettiLayer} aria-hidden="true">
        {Array.from({ length: 22 }).map((_, i) => (
          <span key={i} className={styles.confetto} style={{ '--i': i }} />
        ))}
      </div>

      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrap} aria-hidden="true">
          <Sparkles size={20} strokeWidth={2.4} />
        </div>
        <div className={styles.eyebrow}>
          {kind === 'up' ? 'Tier unlocked' : kind === 'down' ? 'Tier change' : 'Tier'}
        </div>
        <div className={styles.tierPct}>{tier.label}</div>
        <div className={styles.dept}>{tier.dept}</div>
        {tier.note && <div className={styles.note}>{tier.note}</div>}
      </div>
    </div>
  );
}
