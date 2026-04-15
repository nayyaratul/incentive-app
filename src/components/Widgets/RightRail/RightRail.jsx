import React from 'react';
import { TrendingUp, Target, Clock, Dot, Flame, ShoppingBag } from 'lucide-react';
import { Card } from '@/nexus/molecules';
import { Text } from '@/nexus/atoms';
import styles from './RightRail.module.scss';
import { formatINR } from '../../../utils/format';

function MomentumCard({ momentum }) {
  const pctInt = Math.round(momentum.vsLastMonth.pct * 100);
  return (
    <Card as="section" variant="outlined" size="md">
      <Card.Header>
        <Card.Eyebrow className={styles.eyebrow}>
          <TrendingUp size={12} strokeWidth={2.4} className={styles.iconBrand} />
          Your momentum
        </Card.Eyebrow>
      </Card.Header>

      <Card.Body>
        <div className={styles.momentumRow}>
          <span className={styles.momentumPct}>
            +{pctInt}<span className={styles.sign}>%</span>
          </span>
          <Text variant="caption" size="sm" color="var(--color-text-secondary)" className={styles.momentumCaption}>
            vs <strong className={styles.momentumStrong}>{formatINR(momentum.vsLastMonth.lastMonth)}</strong> last month
          </Text>
        </div>

        <div className={styles.divider} aria-hidden="true" />

        <div className={styles.miniRow}>
          <Target size={12} strokeWidth={2.2} className={styles.iconMuted} />
          <Text variant="caption" size="sm" as="span" color="var(--color-text-secondary)">Next milestone</Text>
          <span className={styles.miniValue}>
            {formatINR(momentum.nextMilestone.remaining)} <span className={styles.miniUnit}>to go</span>
          </span>
        </div>

        <div className={styles.miniRow}>
          <Clock size={12} strokeWidth={2.2} className={styles.iconMuted} />
          <Text variant="caption" size="sm" as="span" color="var(--color-text-secondary)">Push window</Text>
          <span className={styles.miniValue}>
            {momentum.bestWindow.range}
            <span className={styles.miniUnit}> · {momentum.bestWindow.lift}</span>
          </span>
        </div>
      </Card.Body>
    </Card>
  );
}

function FloorFeed({ items }) {
  return (
    <Card as="section" variant="outlined" size="md">
      <Card.Header>
        <Card.Eyebrow className={styles.eyebrow}>
          <div className={styles.live} aria-hidden="true" />
          On the floor · Live
        </Card.Eyebrow>
      </Card.Header>

      <Card.Body>
        <ul className={styles.feed}>
          {items.map((item, i) => (
            <li key={i} className={styles.feedItem}>
              <Text variant="caption" size="sm" weight="semibold" as="span" className={styles.who}>
                {item.who}
              </Text>
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
              <Text variant="micro" as="span" color="var(--color-text-tertiary)" className={styles.feedTime}>
                {item.mins}m
              </Text>
            </li>
          ))}
        </ul>
        <button type="button" className={styles.feedAll}>
          See full floor feed
        </button>
      </Card.Body>
    </Card>
  );
}

function QuoteCard() {
  return (
    <Card as="section" variant="outlined" size="md" className={styles.quoteCard}>
      <Card.Body>
        <div className={styles.quoteMark} aria-hidden="true">&ldquo;</div>
        <p className={styles.quote}>
          Every sale is a relationship. <br />
          Every relationship, a win.
        </p>
        <Text variant="overline" size="xs" color="var(--color-text-tertiary)" as="p" className={styles.quoteAttr}>
          <Dot size={10} strokeWidth={3} />
          Reliance Retail · Sales charter
        </Text>
      </Card.Body>
    </Card>
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
