import React from 'react';
import styles from './OpportunityCard.module.scss';

export default function OpportunityCard({ sku, band, earn }) {
  return (
    <div className={styles.card}>
      <p className={styles.sku}>{sku}</p>
      <p className={styles.band}>{band}</p>
      <div className={styles.earn}>
        <span className={styles.earnLabel}>You earn</span>
        <span className={styles.earnAmount}>₹{earn}/sale</span>
      </div>
    </div>
  );
}
