import React from 'react';
import { TrendingUp } from 'lucide-react';
import styles from './EarningsHero.module.scss';
import { formatINR } from '../../../utils/format';

// Split the amount so we can style the rupee symbol and decimal differently.
function splitAmount(n) {
  const formatted = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
  return formatted;
}

export default function EarningsHero({ thisMonth, today, goal }) {
  const pct = Math.round(goal.pct * 100);
  const remaining = goal.target - thisMonth.amount;

  return (
    <div className={styles.hero}>
      {/* Decorative circular ornament — feels like a postage stamp from a money magazine */}
      <svg className={styles.ornament} viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <path
            id="circ"
            d="M 60,60 m -48,0 a 48,48 0 1,1 96,0 a 48,48 0 1,1 -96,0"
          />
        </defs>
        <text fontFamily="Geist Mono" fontSize="8.5" letterSpacing="2.4" fill="currentColor">
          <textPath href="#circ" startOffset="0">
            EARNINGS · MONTH · LIVE · EARNINGS · MONTH · LIVE ·&nbsp;
          </textPath>
        </text>
      </svg>

      <div className={styles.topRow}>
        <span className={styles.label}>
          <span className={styles.dot} />
          Earned this month
        </span>
        <span className={styles.trendPill}>
          <TrendingUp size={11} strokeWidth={2.4} />
          +{formatINR(today.amount)} today
        </span>
      </div>

      <div className={styles.amountRow}>
        <span className={styles.rupee}>₹</span>
        <span className={styles.amount}>{splitAmount(thisMonth.amount)}</span>
      </div>

      <p className={styles.caption}>
        <span className={styles.captionNum}>{pct}%</span>
        <span className={styles.captionDiv}>·</span>
        <span>of monthly goal</span>
        <span className={styles.captionDiv}>·</span>
        <span className={styles.remaining}>{formatINR(remaining)} to go</span>
      </p>

      <div className={styles.progress}>
        <div className={styles.track}>
          <div
            className={styles.fill}
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <div className={styles.scale} aria-hidden="true">
          <span>0</span>
          <span>{formatINR(goal.target / 4)}</span>
          <span>{formatINR(goal.target / 2)}</span>
          <span>{formatINR((goal.target * 3) / 4)}</span>
          <span>{formatINR(goal.target)}</span>
        </div>
      </div>
    </div>
  );
}
