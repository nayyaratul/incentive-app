import React from 'react';
import styles from './TabPageHeader.module.scss';

export default function TabPageHeader({ title, subtitle, className = '' }) {
  return (
    <header className={`${styles.head} ${className}`.trim()}>
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <p className={styles.sub}>{subtitle}</p>}
    </header>
  );
}
