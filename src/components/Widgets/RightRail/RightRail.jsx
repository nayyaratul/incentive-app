import React from 'react';
import { TrendingUp, Target, Clock, Dot, Flame, ShoppingBag } from 'lucide-react';
import styles from './RightRail.module.scss';
import { formatINR } from '../../../utils/format';

function MomentumCard({ momentum }) {
  const pctInt = Math.round(momentum.vsLastMonth.pct * 100);
  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <TrendingUp size={12} strokeWidth={2.4} className={styles.iconBrand} />
        <span className={styles.eyebrow}>Your momentum</span>
      </div>

      <div className={styles.momentumRow}>
        <span className={styles.momentumPct}>
          +{pctInt}<span className={styles.sign}>%</span>
        </span>
        <span className={styles.momentumCaption}>
          vs <strong>{formatINR(momentum.vsLastMonth.lastMonth)}</strong> last month
        </span>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      <div className={styles.miniRow}>
        <Target size={12} strokeWidth={2.2} className={styles.iconMuted} />
        <span className={styles.miniLabel}>Next milestone</span>
        <span className={styles.miniValue}>
          {formatINR(momentum.nextMilestone.remaining)} <span className={styles.miniUnit}>to go</span>
        </span>
      </div>

      <div className={styles.miniRow}>
        <Clock size={12} strokeWidth={2.2} className={styles.iconMuted} />
        <span className={styles.miniLabel}>Push window</span>
        <span className={styles.miniValue}>
          {momentum.bestWindow.range}
          <span className={styles.miniUnit}> · {momentum.bestWindow.lift}</span>
        </span>
      </div>
    </section>
  );
}

function FloorFeed({ items }) {
  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <div className={styles.live} aria-hidden="true" />
        <span className={styles.eyebrow}>On the floor · Live</span>
      </div>
      <ul className={styles.feed}>
        {items.map((item, i) => (
          <li key={i} className={styles.feedItem}>
            <span className={styles.who}>{item.who}</span>
            {item.action === 'sold' ? (
              <>
                <ShoppingBag size={10} strokeWidth={2.2} className={styles.feedIcon} />
                <span className={styles.feedBody}>
                  {item.sku}
                  <span className={styles.feedEarn}> +₹{item.earned}</span>
                </span>
              </>
            ) : (
              <>
                <Flame size={10} strokeWidth={2.2} className={styles.feedIconAccent} />
                <span className={styles.feedBody}>
                  <span className={styles.feedEarn}>{item.label}</span>
                </span>
              </>
            )}
            <span className={styles.feedTime}>{item.mins}m</span>
          </li>
        ))}
      </ul>
      <button type="button" className={styles.feedAll}>
        See full floor feed
      </button>
    </section>
  );
}

function QuoteCard() {
  return (
    <section className={`${styles.card} ${styles.quoteCard}`}>
      <div className={styles.quoteMark} aria-hidden="true">“</div>
      <p className={styles.quote}>
        Every sale is a relationship. <br />
        Every relationship, a win.
      </p>
      <p className={styles.quoteAttr}>
        <Dot size={10} strokeWidth={3} />
        Reliance Retail · Sales charter
      </p>
    </section>
  );
}

export default function RightRail({ momentum, floorFeed }) {
  return (
    <aside className={styles.rail} aria-label="Dashboard insights">
      <MomentumCard momentum={momentum} />
      <FloorFeed items={floorFeed} />
      <QuoteCard />
    </aside>
  );
}
