import React from 'react';
import styles from './OpportunityStrip.module.scss';
import OpportunityCard from '../../Molecule/OpportunityCard/OpportunityCard';

export default function OpportunityStrip({ opportunities }) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Push these now</h2>
        <button className={styles.seeAll}>See all →</button>
      </div>
      <div className={styles.scroll}>
        {opportunities.map((opp) => (
          <OpportunityCard key={opp.sku} {...opp} />
        ))}
      </div>
    </section>
  );
}
