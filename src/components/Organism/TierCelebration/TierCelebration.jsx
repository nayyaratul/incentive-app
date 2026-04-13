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

      {/* Concentric ring burst for top-tier moments (100%+) */}
      {cfg.rings && (
        <div className={styles.ringLayer} aria-hidden="true">
          <span className={styles.ring} style={{ animationDelay: '0ms' }} />
          <span className={styles.ring} style={{ animationDelay: '200ms' }} />
          <span className={styles.ring} style={{ animationDelay: '400ms' }} />
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

const PALETTE_LIGHT  = ['#0F7A3A', '#0F7A3A', '#0F7A3A', '#0F7A3A'];                       // green only
const PALETTE_MED    = ['#0F7A3A', '#BD2925', '#0F7A3A', '#BD2925'];                       // green + red
const PALETTE_BIG    = ['#FFC233', '#0F7A3A', '#BD2925', '#FFC233'];                       // gold + green + red
const PALETTE_MAX    = ['#FFC233', '#FFB703', '#0F7A3A', '#BD2925', '#2F427D', '#FFC233']; // gold heavy + brand
const STREAMER_PALETTE = ['#FFC233', '#FFB703', '#BD2925', '#FFC233', '#0F7A3A'];

const INTENSITY = {
  0: { pieces: 0,  waves: 0, duration: 600,  halo: null,     rings: false, streamers: false, pulse: false, distance: 0,   palette: [],            cardSize: null,    iconSize: 22 },
  1: { pieces: 18, waves: 1, duration: 1400, halo: null,     rings: false, streamers: false, pulse: false, distance: 240, palette: PALETTE_LIGHT, cardSize: null,    iconSize: 22 }, // 50%
  2: { pieces: 32, waves: 1, duration: 1700, halo: 'soft',   rings: false, streamers: false, pulse: false, distance: 280, palette: PALETTE_MED,   cardSize: null,    iconSize: 22 }, // 80%
  3: { pieces: 60, waves: 2, duration: 2300, halo: 'medium', rings: true,  streamers: false, pulse: true,  distance: 340, palette: PALETTE_BIG,   cardSize: 'big',   iconSize: 26 }, // 100%
  4: { pieces: 80, waves: 2, duration: 2500, halo: 'bright', rings: true,  streamers: false, pulse: true,  distance: 380, palette: PALETTE_BIG,   cardSize: 'big',   iconSize: 28 }, // 110%
  5: { pieces: 110, waves: 3, duration: 2800, halo: 'max',   rings: true,  streamers: true,  pulse: true,  distance: 440, palette: PALETTE_MAX,   cardSize: 'max',   iconSize: 30 }, // 120%
};
