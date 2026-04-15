import React, { useState } from 'react';
import { ChevronDown, Trophy } from 'lucide-react';
import { Text, Button } from '@/nexus/atoms';
import styles from './RankSummary.module.scss';
import { formatINR } from '../../../utils/format';

/**
 * Compact rank chip that lives at the top of the home screen.
 * Default: "#3 in store . $40 to catch #2"  (low visual weight)
 * Tap: expands inline to show the top 5 with you highlighted.
 */
export default function RankSummary({ rank, deltaAbove, scope = 'store', topRows = DEFAULT_TOP }) {
  const [open, setOpen] = useState(false);

  return (
    <section className={`${styles.wrap} ${open ? styles.wrapOpen : ''}`}>
      <button
        type="button"
        className={styles.chip}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className={styles.iconWrap} aria-hidden="true">
          <Trophy size={12} strokeWidth={2.4} />
        </span>
        <span className={styles.text}>
          <strong>#{rank}</strong> in {scope}
          {typeof deltaAbove === 'number' && deltaAbove > 0 && (
            <Text as="span" variant="caption" className={styles.delta}>
              {' '}&middot; &#8377;{deltaAbove} to #{rank - 1}
            </Text>
          )}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2.2}
          className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <Text as="span" variant="overline" className={styles.panelEyebrow}>
              Leaderboard &middot; {scope}
            </Text>
          </div>
          <div className={styles.list}>
            {topRows.map((row) => {
              const isSelf = row.rank === rank;
              return (
                <div key={row.rank} className={`${styles.row} ${isSelf ? styles.rowSelf : ''}`}>
                  <span className={styles.rowRank}>#{row.rank}</span>
                  <Text as="span" variant="body" className={styles.rowName}>{row.name}</Text>
                  <span className={styles.rowEarn}>{formatINR(row.earned)}</span>
                </div>
              );
            })}
          </div>
          <button type="button" className={styles.seeAll}>See full leaderboard &rarr;</button>
        </div>
      )}
    </section>
  );
}

// Dummy top rows for the POC; real app will pull from /leaderboard API
const DEFAULT_TOP = [
  { rank: 1, name: 'Vikram Patil',   earned: 5480 },
  { rank: 2, name: 'Priya Desai',    earned: 3800 },
  { rank: 3, name: 'Rohit Sharma',   earned: 3760 },
  { rank: 4, name: 'Kiran Pawar',    earned: 2210 },
  { rank: 5, name: 'Manoj Iyer (BA)', earned: 0, note: 'BA \u2014 not eligible' },
];
