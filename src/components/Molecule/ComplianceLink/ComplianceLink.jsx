import React, { useState } from 'react';
import { ShieldCheck, ChevronRight } from 'lucide-react';
import styles from './ComplianceLink.module.scss';

/**
 * Shared demoted disclosure for rule/eligibility details.
 * Renders as a quiet inline link by default; tap to reveal a compact
 * key-value panel. Use this across verticals (Electronics, Grocery, F&L)
 * and roles (SA, DM, BA, SM) to keep the "rules fine print" treatment
 * consistent — never a big card above the fold.
 *
 * items = [{ label: string, value: ReactNode | string }, ...]
 */
export default function ComplianceLink({ label = 'Eligibility & rules', items = [] }) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;

  return (
    <div className={styles.wrap}>
      <button type="button" className={styles.link} onClick={() => setOpen(!open)} aria-expanded={open}>
        <ShieldCheck size={12} strokeWidth={2.2} />
        <span>{label}</span>
        <ChevronRight
          size={13}
          strokeWidth={2.2}
          className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
        />
      </button>
      {open && (
        <div className={styles.panel}>
          {items.map((it, i) => (
            <div key={i} className={styles.row}>
              <span className={styles.rowLabel}>{it.label}</span>
              <strong className={styles.rowValue}>{it.value}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
