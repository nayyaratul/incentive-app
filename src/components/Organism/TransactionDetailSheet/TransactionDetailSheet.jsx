import React, { useEffect, useState } from 'react';
import { Copy, Check, Receipt } from 'lucide-react';
import { Drawer } from '@/nexus/molecules';
import styles from './TransactionDetailSheet.module.scss';
import { formatINR } from '../../../utils/format';

/**
 * Shared bottom-sheet that renders all 16 fields of a transaction plus the
 * incentive calculation trace (base x multiplier = final). Used by both
 * the employee HistoryScreen and the Store Manager Transactions screen.
 * Now uses Nexus Drawer for overlay, animation, focus management, and close handling.
 */
export default function TransactionDetailSheet({ tx, open, onClose }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  if (!tx) return null;

  const handleCopy = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(tx.transactionId).catch(() => {});
    }
    setCopied(true);
  };

  const excluded = tx.transactionType !== 'NORMAL' || tx.finalIncentive === 0;
  const includes = tx.finalIncentive > 0;

  const titleText = tx.brand ? `${tx.brand} \u00b7 ${tx.articleCode}` : tx.articleCode;
  const subtitleText = `${tx.vertical} \u00b7 ${new Date(tx.transactionDate).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}`;

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      placement="bottom"
      title={titleText}
      subtitle={subtitleText}
      icon={<Receipt size={16} strokeWidth={2.2} />}
    >
      <div className={styles.body}>
        {/* Incentive trace -- the value-conveying summary.
            Laid out as a 5-column x 2-row grid: labels on row 1, values
            and operators on row 2 with baseline alignment so the `x` and
            `=` line up with the value baselines even though Final is
            larger than Base/Multiplier. */}
        <section className={`${styles.trace} ${excluded ? styles.traceZero : ''} ${includes ? styles.traceEarned : ''}`}>
          <span className={styles.traceLabel}>Base incentive</span>
          <span className={styles.traceSpacer} aria-hidden="true" />
          <span className={styles.traceLabel}>Multiplier</span>
          <span className={styles.traceSpacer} aria-hidden="true" />
          <span className={styles.traceLabel}>Final</span>

          <span className={styles.traceValue}>
            {typeof tx.baseIncentive === 'number' ? `\u20B9${tx.baseIncentive}` : '\u2014'}
          </span>
          <span className={styles.traceOp} aria-hidden="true">&times;</span>
          <span className={styles.traceValue}>
            {typeof tx.multiplierApplied === 'number'
              ? `${(tx.multiplierApplied * 100).toFixed(0)}%`
              : '\u2014'}
          </span>
          <span className={styles.traceOp} aria-hidden="true">=</span>
          <span className={`${styles.traceValue} ${styles.traceFinal}`}>
            {typeof tx.finalIncentive === 'number' ? `\u20B9${tx.finalIncentive}` : '\u2014'}
          </span>
        </section>

        {tx.note && (
          <p className={styles.note}>{tx.note}</p>
        )}

        {/* Full 16-field record (brief S9) */}
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
          <Row label="Store format" value={tx.storeFormat || '\u2014'} />
          <Row label="Vertical" value={tx.vertical} />
          <Row label="Employee ID" value={tx.employeeId || '\u2014'} />
          <Row label="Channel" value={tx.channel} />
          <Row label="Transaction type" value={tx.transactionType}
               tag={tx.transactionType !== 'NORMAL' ? 'excluded' : undefined} />
        </section>

        <section className={styles.grid}>
          <h3 className={styles.groupTitle}>Product</h3>
          <Row label="Article code" value={tx.articleCode} />
          <Row label="Brand" value={tx.brand || '\u2014'} />
          <Row label="Department" value={tx.department || '\u2014'} />
          <Row label="Product family" value={tx.productFamily || '\u2014'} />
          <Row label="Family code" value={tx.productFamilyCode || '\u2014'} />
        </section>

        <section className={styles.grid}>
          <h3 className={styles.groupTitle}>Amounts</h3>
          <Row label="Quantity" value={String(tx.quantity)} />
          <Row label="Gross (pre-tax)" value={formatINR(tx.grossAmount)} />
          <Row label="Tax" value={formatINR(tx.taxAmount)} />
          <Row label="Total" value={formatINR(tx.totalAmount)} strong />
        </section>
      </div>
    </Drawer>
  );
}

function Row({ label, value, strong, tail, tag }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={`${styles.rowValue} ${strong ? styles.rowValueStrong : ''}`}>
        <span className={styles.rowValueText}>{value}</span>
        {tag && <span className={`${styles.rowTag} ${styles[`tag-${tag}`]}`}>{tag}</span>}
        {tail}
      </span>
    </div>
  );
}
