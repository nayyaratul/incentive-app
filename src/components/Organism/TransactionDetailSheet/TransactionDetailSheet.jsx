import React, { useEffect, useState } from 'react';
import { X, Copy, Check, Receipt } from 'lucide-react';
import styles from './TransactionDetailSheet.module.scss';
import { formatINR } from '../../../utils/format';

/**
 * Shared bottom-sheet that renders all 16 fields of a transaction plus the
 * incentive calculation trace (base × multiplier = final). Used by both
 * the employee HistoryScreen and the Store Manager Transactions screen.
 */
export default function TransactionDetailSheet({ tx, open, onClose }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  if (!open || !tx) return null;

  const handleCopy = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(tx.transactionId).catch(() => {});
    }
    setCopied(true);
  };

  const excluded = tx.transactionType !== 'NORMAL' || tx.finalIncentive === 0;
  const includes = tx.finalIncentive > 0;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-label="Transaction detail">
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle} aria-hidden="true" />

        <header className={styles.head}>
          <div className={styles.headLeft}>
            <div className={styles.iconWrap} aria-hidden="true"><Receipt size={16} strokeWidth={2.2} /></div>
            <div>
              <div className={styles.eyebrow}>
                {tx.vertical} · {new Date(tx.transactionDate).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
              </div>
              <h2 className={styles.title}>{tx.brand ? `${tx.brand} · ` : ''}{tx.articleCode}</h2>
            </div>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <X size={18} strokeWidth={2.2} />
          </button>
        </header>

        <div className={styles.body}>
          {/* Incentive trace — the value-conveying summary */}
          <section className={`${styles.trace} ${excluded ? styles.traceZero : ''} ${includes ? styles.traceEarned : ''}`}>
            <div className={styles.traceRow}>
              <span className={styles.traceLabel}>Base incentive</span>
              <span className={styles.traceValue}>
                {typeof tx.baseIncentive === 'number' ? `₹${tx.baseIncentive}` : '—'}
              </span>
            </div>
            <div className={styles.traceOp}>×</div>
            <div className={styles.traceRow}>
              <span className={styles.traceLabel}>Multiplier</span>
              <span className={styles.traceValue}>
                {typeof tx.multiplierApplied === 'number'
                  ? `${(tx.multiplierApplied * 100).toFixed(0)}%`
                  : '—'}
              </span>
            </div>
            <div className={styles.traceOp}>=</div>
            <div className={styles.traceRow}>
              <span className={styles.traceLabel}>Final</span>
              <span className={`${styles.traceValue} ${styles.traceFinal}`}>
                {typeof tx.finalIncentive === 'number' ? `₹${tx.finalIncentive}` : '—'}
              </span>
            </div>
          </section>

          {tx.note && (
            <p className={styles.note}>{tx.note}</p>
          )}

          {/* Full 16-field record (brief §9) */}
          <section className={styles.grid}>
            <h3 className={styles.groupTitle}>Transaction record</h3>
            <Row label="Transaction ID" value={tx.transactionId}
                 tail={
                   <button type="button" className={styles.copyBtn} onClick={handleCopy} aria-label="Copy transaction ID">
                     {copied ? <Check size={12} strokeWidth={2.4} /> : <Copy size={12} strokeWidth={2.2} />}
                   </button>
                 } />
            <Row label="Transaction date" value={new Date(tx.transactionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} />
            <Row label="Store code" value={tx.storeCode} />
            <Row label="Store format" value={tx.storeFormat || '—'} />
            <Row label="Vertical" value={tx.vertical} />
            <Row label="Employee ID" value={tx.employeeId || '—'} />
            <Row label="Channel" value={tx.channel} />
            <Row label="Transaction type" value={tx.transactionType}
                 tag={tx.transactionType !== 'NORMAL' ? 'excluded' : undefined} />
          </section>

          <section className={styles.grid}>
            <h3 className={styles.groupTitle}>Product</h3>
            <Row label="Article code" value={tx.articleCode} />
            <Row label="Brand" value={tx.brand || '—'} />
            <Row label="Department" value={tx.department || '—'} />
            <Row label="Product family" value={tx.productFamily || '—'} />
            <Row label="Family code" value={tx.productFamilyCode || '—'} />
          </section>

          <section className={styles.grid}>
            <h3 className={styles.groupTitle}>Amounts</h3>
            <Row label="Quantity" value={String(tx.quantity)} />
            <Row label="Gross (pre-tax)" value={formatINR(tx.grossAmount)} />
            <Row label="Tax" value={formatINR(tx.taxAmount)} />
            <Row label="Total" value={formatINR(tx.totalAmount)} strong />
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong, tail, tag }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={`${styles.rowValue} ${strong ? styles.rowValueStrong : ''}`}>
        {value}
        {tag && <span className={`${styles.rowTag} ${styles[`tag-${tag}`]}`}>{tag}</span>}
        {tail}
      </span>
    </div>
  );
}
