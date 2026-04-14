import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './OpportunityStrip.module.scss';
import OpportunityCard from '../../Molecule/OpportunityCard/OpportunityCard';

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
        <div className={styles.scroll}>
          {opportunities.map((opp) => (
            <OpportunityCard key={opp.sku} {...opp} />
          ))}
          <div className={styles.endCap} aria-hidden="true">
            <span className={styles.endMark}>END</span>
          </div>
        </div>
      </div>
    </section>
  );
}
