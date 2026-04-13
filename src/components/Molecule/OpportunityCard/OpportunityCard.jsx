import React from 'react';
import styles from './OpportunityCard.module.scss';

export default function OpportunityCard({ sku, band, earn }) {
  return (
    <article className={styles.card}>
      <div className={styles.body}>
        <h3 className={styles.sku}>{sku}</h3>
        <p className={styles.band}>{band}</p>
      </div>

      <footer className={styles.earn}>
        <span className={styles.earnAmount}>
          <span className={styles.earnRupee}>₹</span>
          {earn}
        </span>
        <span className={styles.earnUnit}>per sale</span>
      </footer>
    </article>
  );
}
