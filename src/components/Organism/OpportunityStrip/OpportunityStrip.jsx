import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './OpportunityStrip.module.scss';

export default function OpportunityStrip({ opportunities, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={styles.section}>
      <button
        type="button"
        className={styles.header}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className={styles.titleWrap}>
          <span className={styles.eyebrow}>Floor intelligence</span>
          <h2 className={styles.title}>
            Push these <span className={styles.italic}>now</span>
          </h2>
        </div>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>
          <ChevronDown size={18} strokeWidth={2.2} />
        </span>
      </button>

      <div className={`${styles.body} ${open ? styles.bodyOpen : ''}`}>
        <div className={styles.list}>
          {opportunities.map((opp, i) => (
            <div key={opp.sku} className={styles.row}>
              <span className={styles.rank}>{String(i + 1).padStart(2, '0')}</span>
              <div className={styles.info}>
                <div className={styles.sku}>{opp.sku}</div>
                <div className={styles.band}>{opp.band}</div>
              </div>
              <div className={styles.earn}>
                <span className={styles.earnAmount}>
                  <span className={styles.earnRupee}>₹</span>{opp.earn}
                </span>
                <span className={styles.earnUnit}>per sale</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
