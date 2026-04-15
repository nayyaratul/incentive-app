import React from 'react';
import { Card } from '@/nexus/molecules';
import { Text } from '@/nexus/atoms';
import styles from './OpportunityCard.module.scss';

export default function OpportunityCard({ sku, band, earn }) {
  return (
    <Card as="article" variant="elevated" className={styles.card}>
      <div className={styles.body}>
        <h3 className={styles.sku}>{sku}</h3>
        <Text as="span" variant="caption" className={styles.band}>
          {band}
        </Text>
      </div>

      <footer className={styles.earn}>
        <span className={styles.earnAmount}>
          <span className={styles.earnRupee}>&#8377;</span>
          {earn}
        </span>
        <Text as="span" variant="micro" className={styles.earnUnit}>
          per sale
        </Text>
      </footer>
    </Card>
  );
}
