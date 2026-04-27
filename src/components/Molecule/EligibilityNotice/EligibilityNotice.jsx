import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import styles from './EligibilityNotice.module.scss';

/**
 * Renders the structured eligibility reasons emitted by the backend
 * `eligibility.reasons[]` block. One block per reason, ordered with
 * BLOCKING first (those drive the leading "Not eligible" headline) and
 * WARNING second.
 *
 * Per the engine contract (server/calculations/eligibility.ts), each
 * reason looks like:
 *   { code: ReasonCode, severity: 'BLOCKING' | 'WARNING', message: string, payload?: object }
 *
 * The component is deliberately dumb — copy is composed by the backend
 * so we don't risk drift between server-side and client-side wording.
 */
export default function EligibilityNotice({ eligibility, title, className }) {
  if (!eligibility) return null;
  const reasons = Array.isArray(eligibility.reasons) ? eligibility.reasons : [];
  if (reasons.length === 0) return null;

  // Sort BLOCKING first so the most consequential message is at the top.
  const ordered = [...reasons].sort((a, b) => {
    const rank = (sev) => (sev === 'BLOCKING' ? 0 : 1);
    return rank(a.severity) - rank(b.severity);
  });

  const status = eligibility.status ?? 'INELIGIBLE';
  const headerTitle =
    title ??
    (status === 'INELIGIBLE'
      ? 'Not eligible for this period'
      : status === 'PARTIALLY_ELIGIBLE'
        ? 'Heads up'
        : '');

  return (
    <div className={`${styles.notice} ${className || ''}`} role="status">
      <div className={styles.iconWrap}>
        {status === 'INELIGIBLE' ? (
          <AlertTriangle size={14} strokeWidth={2.4} />
        ) : (
          <Info size={14} strokeWidth={2.4} />
        )}
      </div>
      <div className={styles.body}>
        {headerTitle && <div className={styles.title}>{headerTitle}</div>}
        <ul className={styles.reasonList}>
          {ordered.map((r, i) => (
            <li
              key={`${r.code}-${i}`}
              className={r.severity === 'BLOCKING' ? styles.blocking : styles.warning}
            >
              {r.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
