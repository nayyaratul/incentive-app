import React, { useEffect, useState } from 'react';
import { Sparkles, AlertTriangle, Trophy } from 'lucide-react';
import styles from './TierCelebration.module.scss';

/**
 * Brief-aligned celebration overlay for an Electronics dept multiplier
 * crossing a tier gate (§6.4 Step 2 values).
 *
 * `tier` shape:
 *   { eyebrow, title, multiplier, dept, note, kind }
 *  - kind: 'up' (good news) | 'down' (payout paused) | 'top' (100%+ moment)
 *
 * Auto-dismisses after `duration` ms (default 3.5s).
 */
export default function TierCelebration({ open, tier, onDismiss, duration = 3500 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) { setVisible(false); return; }
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      onDismiss && onDismiss();
    }, duration);
    return () => clearTimeout(t);
  }, [open, duration, onDismiss]);

  if (!open && !visible) return null;
  if (!tier) return null;

  const kind = tier.kind || 'up';
  const Icon = kind === 'down' ? AlertTriangle : kind === 'top' ? Trophy : Sparkles;

  return (
    <div
      className={`${styles.overlay} ${styles[`kind-${kind}`]}`}
      onClick={() => { setVisible(false); onDismiss && onDismiss(); }}
    >
      {/* Confetti only on celebratory kinds */}
      {kind !== 'down' && (
        <div className={styles.confettiLayer} aria-hidden="true">
          {CONFETTI_DOTS.map((d, i) => (
            <span
              key={i}
              className={styles.confetto}
              style={{
                '--tx': `${d.tx}px`,
                '--ty': `${d.ty}px`,
                '--rot': `${d.rot}deg`,
                '--delay': `${d.delay}ms`,
                '--bg': d.color,
              }}
            />
          ))}
        </div>
      )}

      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrap} aria-hidden="true">
          <Icon size={22} strokeWidth={2.4} />
        </div>
        <div className={styles.eyebrow}>{tier.eyebrow}</div>
        <div className={styles.title}>{tier.title}</div>
        <div className={styles.bigPct}>{tier.multiplier}</div>
        <div className={styles.dept}>{tier.dept}</div>
        {tier.note && <div className={styles.note}>{tier.note}</div>}
      </div>
    </div>
  );
}

// Pre-computed confetti dots — explicit x/y travel so each piece visibly
// flies outside the centered card (max 320px wide).
const CONFETTI_COLORS_UP   = ['#BD2925', '#2F427D', '#0F7A3A', '#FFC233', '#BD2925'];
const CONFETTI_COLORS_TOP  = ['#FFC233', '#BD2925', '#FFC233', '#0F7A3A', '#FFC233'];

function buildConfetti() {
  const out = [];
  const COUNT = 32;
  for (let i = 0; i < COUNT; i++) {
    const angle = (i / COUNT) * Math.PI * 2 + (i % 2 ? 0.1 : -0.1);
    const distance = 240 + (i % 4) * 60; // 240 / 300 / 360 / 420 px
    out.push({
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance - 40, // slight upward bias
      rot: (i * 47) % 360,
      delay: (i % 6) * 30,
      color: CONFETTI_COLORS_UP[i % CONFETTI_COLORS_UP.length],
    });
  }
  return out;
}

const CONFETTI_DOTS = buildConfetti();
