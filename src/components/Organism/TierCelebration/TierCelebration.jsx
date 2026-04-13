import React, { useEffect, useState } from 'react';
import { Sparkles, AlertTriangle, Trophy } from 'lucide-react';
import styles from './TierCelebration.module.scss';

/**
 * Brief-aligned celebration overlay for an Electronics dept multiplier
 * crossing a tier gate (§6.4 Step 2 values).
 *
 * `tier` shape:
 *   { eyebrow, title, multiplier, dept, note, kind, intensity }
 *  - kind:      'up' | 'down' | 'top'
 *  - intensity: 0..5  (drives confetti count, waves, halo, streamers)
 */
export default function TierCelebration({ open, tier, onDismiss }) {
  const [visible, setVisible] = useState(false);

  const intensity = tier?.intensity ?? 0;
  const cfg = INTENSITY[intensity] || INTENSITY[0];

  useEffect(() => {
    if (!open) { setVisible(false); return; }
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      onDismiss && onDismiss();
    }, cfg.duration + 600); // hold for animations + a beat
    return () => clearTimeout(t);
  }, [open, cfg.duration, onDismiss]);

  if (!open && !visible) return null;
  if (!tier) return null;

  const kind = tier.kind || 'up';
  const Icon = kind === 'down' ? AlertTriangle : kind === 'top' ? Trophy : Sparkles;

  return (
    <div
      className={`${styles.overlay} ${styles[`kind-${kind}`]} ${styles[`intensity-${intensity}`]}`}
      onClick={() => { setVisible(false); onDismiss && onDismiss(); }}
    >
      {/* Halo glow behind the card — scales with intensity */}
      {cfg.halo && <div className={`${styles.halo} ${styles[`halo-${cfg.halo}`]}`} aria-hidden="true" />}

      {/* Ring burst — count varies by tier (1 ring at 80%, 3 at 100%+) */}
      {cfg.rings > 0 && (
        <div className={styles.ringLayer} aria-hidden="true">
          {Array.from({ length: cfg.rings }).map((_, i) => (
            <span key={i} className={styles.ring} style={{ animationDelay: `${i * 200}ms` }} />
          ))}
        </div>
      )}

      {/* Continuous gold sparkles for bonus / top tiers */}
      {cfg.sparkles && (
        <div className={styles.sparkleLayer} aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              className={styles.sparkle}
              style={{
                '--left':  `${10 + Math.random() * 80}%`,
                '--top':   `${10 + Math.random() * 80}%`,
                '--delay': `${i * 110}ms`,
                '--size':  `${6 + (i % 4) * 3}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* Multi-wave confetti */}
      {cfg.pieces > 0 && (
        <div className={styles.confettiLayer} aria-hidden="true">
          {Array.from({ length: cfg.waves }).map((_, waveIdx) => (
            <Wave
              key={waveIdx}
              count={cfg.pieces / cfg.waves}
              delayBase={waveIdx * 380}
              palette={cfg.palette}
              maxDistance={cfg.distance}
            />
          ))}
        </div>
      )}

      {/* Falling streamers (120% only) */}
      {cfg.streamers && (
        <div className={styles.streamerLayer} aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              className={styles.streamer}
              style={{
                '--left': `${(i / 13) * 100}%`,
                '--delay': `${i * 90}ms`,
                '--bg': STREAMER_PALETTE[i % STREAMER_PALETTE.length],
              }}
            />
          ))}
        </div>
      )}

      <div className={`${styles.card} ${cfg.cardSize ? styles[`card-${cfg.cardSize}`] : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrap} aria-hidden="true">
          <Icon size={cfg.iconSize || 22} strokeWidth={2.4} />
        </div>
        <div className={styles.eyebrow}>{tier.eyebrow}</div>
        <div className={styles.title}>{tier.title}</div>
        <div className={`${styles.bigPct} ${cfg.pulse ? styles.bigPctPulse : ''}`}>{tier.multiplier}</div>
        <div className={styles.dept}>{tier.dept}</div>
        {tier.note && <div className={styles.note}>{tier.note}</div>}
      </div>
    </div>
  );
}

function Wave({ count, delayBase, palette, maxDistance }) {
  const dots = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (i % 2 ? 0.08 : -0.08);
    const distance = maxDistance - (i % 5) * 36;
    dots.push({
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance - 30,
      rot: (i * 47) % 360,
      delay: delayBase + (i % 6) * 26,
      color: palette[i % palette.length],
    });
  }
  return dots.map((d, i) => (
    <span
      key={`${delayBase}-${i}`}
      className={styles.confetto}
      style={{
        '--tx': `${d.tx}px`,
        '--ty': `${d.ty}px`,
        '--rot': `${d.rot}deg`,
        '--delay': `${d.delay}ms`,
        '--bg': d.color,
      }}
    />
  ));
}

// ---------- Tuning per intensity level ----------
// Each tier has its own *character* (color theme + special layers), not just
// 'more confetti'. Every celebratory tier carries: halo + confetti + pulse.
// The ladder differentiates via WHAT layers are present, not whether they are.

const PALETTE_GREEN  = ['#0F7A3A', '#37A85B', '#0F7A3A', '#7CC487', '#0F7A3A']; // 50% — relief / unlock
const PALETTE_AMBER  = ['#FFA833', '#FFC233', '#0F7A3A', '#FF8B1A', '#FFC233']; // 80% — climbing / warming up
const PALETTE_GOLD   = ['#FFC233', '#0F7A3A', '#BD2925', '#FFB703', '#FFC233']; // 100% — triumph
const PALETTE_RICH   = ['#FFC233', '#FFB703', '#FFC233', '#BD2925', '#FFC233', '#0F7A3A']; // 110% — bonus
const PALETTE_MAX    = ['#FFC233', '#FFB703', '#0F7A3A', '#BD2925', '#2F427D', '#FFC233', '#FFB703']; // 120% — full
const STREAMER_PALETTE = ['#FFC233', '#FFB703', '#BD2925', '#FFC233', '#0F7A3A'];

const INTENSITY = {
  0: { pieces: 0,   waves: 0, duration: 600,  halo: null,           rings: 0, sparkles: false, streamers: false, pulse: false, distance: 0,   palette: [],           cardSize: null,  iconSize: 22 },

  // 50% — Green / "back in the game"
  1: { pieces: 30,  waves: 1, duration: 1700, halo: 'green-soft',   rings: 0, sparkles: false, streamers: false, pulse: true,  distance: 280, palette: PALETTE_GREEN, cardSize: null,  iconSize: 24 },

  // 80% — Amber / "climbing"
  2: { pieces: 48,  waves: 1, duration: 2000, halo: 'amber',        rings: 1, sparkles: false, streamers: false, pulse: true,  distance: 320, palette: PALETTE_AMBER, cardSize: 'big', iconSize: 26 },

  // 100% — Gold / "target hit"
  3: { pieces: 70,  waves: 2, duration: 2400, halo: 'gold',         rings: 3, sparkles: false, streamers: false, pulse: true,  distance: 360, palette: PALETTE_GOLD,  cardSize: 'big', iconSize: 28 },

  // 110% — Gold-rich / "bonus"
  4: { pieces: 90,  waves: 2, duration: 2600, halo: 'gold-bright',  rings: 3, sparkles: true,  streamers: false, pulse: true,  distance: 400, palette: PALETTE_RICH,  cardSize: 'big', iconSize: 30 },

  // 120% — Max / "legendary"
  5: { pieces: 120, waves: 3, duration: 2900, halo: 'max',          rings: 3, sparkles: true,  streamers: true,  pulse: true,  distance: 460, palette: PALETTE_MAX,   cardSize: 'max', iconSize: 32 },
};
