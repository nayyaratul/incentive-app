import React from 'react';
import styles from './OpportunityCard.module.scss';

export default function OpportunityCard({ index, sku, band, earn }) {
  const idx = String(index).padStart(2, '0');
  return (
    <article className={styles.card}>
      <header className={styles.head}>
        <span className={styles.idx}>{idx}</span>
        <span className={styles.rule} aria-hidden="true" />
      </header>

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
