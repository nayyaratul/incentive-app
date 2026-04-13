import React from 'react';
import styles from './BrandLogo.module.scss';
import logoColour from '../../../assets/brand/reliance-retail/Reliance_Retail.svg';
import logoBw from '../../../assets/brand/reliance-retail/Reliance_Retail bw.svg';

/**
 * Official Reliance Retail wordmark.
 * variant="full" (default): colour SVG
 * variant="mono": black/white SVG (for dark surfaces, loading states)
 */
export default function BrandLogo({ variant = 'full', height = 22, className = '' }) {
  const src = variant === 'mono' ? logoBw : logoColour;
  return (
    <img
      src={src}
      alt="Reliance Retail"
      className={`${styles.logo} ${className}`}
      style={{ height }}
      draggable={false}
    />
  );
}
