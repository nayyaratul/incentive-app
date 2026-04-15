import React from 'react';
import styles from './Medallion.module.scss';

/**
 * Medallion — circular coin-style badge visual.
 *
 * Props:
 *   icon     string | ReactNode  — emoji or icon centered in the coin
 *   rarity   'bronze' | 'silver' | 'gold'  — drives fill + rim tokens
 *   locked   boolean  — if true, renders dashed-silhouette state
 *   isNew    boolean  — if true, adds red NEW flag + pulsing halo
 *   size     'sm' | 'md' | 'lg'  — 44 / 54 / 96 px (default 'md')
 *   ariaLabel string  — accessible label
 *   onClick  function  — if provided, rendered as a <button>; otherwise <div role="img">
 */
export default function Medallion({
  icon,
  rarity,
  locked = false,
  isNew = false,
  size = 'md',
  ariaLabel,
  onClick,
}) {
  const rarityClass = locked ? styles.locked : styles[rarity] || styles.bronze;
  const className = [
    styles.medallion,
    styles[size],
    rarityClass,
    isNew && !locked ? styles.new : '',
  ].filter(Boolean).join(' ');

  const content = (
    <>
      <span aria-hidden="true">{icon}</span>
      {isNew && !locked && <span className={styles.newFlag}>New</span>}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={className}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={className} role="img" aria-label={ariaLabel}>
      {content}
    </div>
  );
}
