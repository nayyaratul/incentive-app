import React from 'react';
import styles from './OpportunityStrip.module.scss';
import OpportunityCard from '../../Molecule/OpportunityCard/OpportunityCard';

export default function OpportunityStrip({ opportunities }) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          <span className={styles.eyebrow}>Floor intelligence</span>
          <h2 className={styles.title}>
            Push these <span className={styles.italic}>now</span>
          </h2>
        </div>
      </div>
      <div className={styles.scroll}>
        {opportunities.map((opp) => (
          <OpportunityCard key={opp.sku} {...opp} />
        ))}
        <div className={styles.endCap} aria-hidden="true">
          <span className={styles.endMark}>END</span>
        </div>
      </div>
    </section>
  );
}
