import React, { useState, useMemo } from 'react';
import { Info } from 'lucide-react';
import styles from './SharedScreens.module.scss';
import { transactionsByEmployee } from '../../data/transactions';
import { formatINR } from '../../utils/format';

const PERIODS = [
  { id: 'month', label: 'This month' },
  { id: 'all',   label: 'All' },
];

function sameMonth(dateStr, ref) {
  const d = new Date(dateStr);
  const r = new Date(ref);
  return d.getFullYear() === r.getFullYear() && d.getMonth() === r.getMonth();
}

export default function HistoryScreen({ employeeId, vertical }) {
  const [period, setPeriod] = useState('month');
  const allTx = transactionsByEmployee[employeeId] || [];

  const filtered = useMemo(() => {
    if (period === 'all') return allTx;
    const now = new Date('2026-04-13');
    return allTx.filter((tx) => sameMonth(tx.transactionDate, now));
  }, [allTx, period]);

  const mtdEarned = filtered.reduce((s, tx) => s + (tx.finalIncentive || 0), 0);
  const mtdGross = filtered.reduce((s, tx) => s + tx.grossAmount, 0);

  return (
    <div className={styles.screen}>
      <header className={styles.screenHead}>
        <h1 className={styles.title}>Sales history</h1>
        <p className={styles.sub}>Read-only log of your sales for the period.</p>
      </header>

      <div className={styles.tabs} role="tablist">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={period === p.id}
            className={`${styles.tab} ${period === p.id ? styles.tabActive : ''}`}
            onClick={() => setPeriod(p.id)}
            type="button"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary strip */}
      <section className={styles.summaryRow}>
        <div>
          <div className={styles.summaryVal}>{filtered.length}</div>
          <div className={styles.summaryCap}>transactions</div>
        </div>
        <div className={styles.summaryDiv} />
        <div>
          <div className={styles.summaryVal}>{formatINR(mtdGross)}</div>
          <div className={styles.summaryCap}>gross (pre-tax)</div>
        </div>
        <div className={styles.summaryDiv} />
        <div>
          <div className={styles.summaryVal} style={{ color: 'var(--brand-deep)' }}>{formatINR(mtdEarned)}</div>
          <div className={styles.summaryCap}>final incentive</div>
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <Info size={16} strokeWidth={2.2} />
          <p>No transactions yet for this period.</p>
        </div>
      ) : (
        <div className={styles.txList}>
          {filtered.map((tx) => (
            <article key={tx.transactionId} className={styles.txCard}>
              <div className={styles.txHead}>
                <div className={styles.txDate}>
                  {new Date(tx.transactionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </div>
                <div className={styles.txId}>{tx.transactionId}</div>
              </div>

              <div className={styles.txBody}>
                <div className={styles.txArticle}>
                  {tx.brand && <span className={styles.txBrand}>{tx.brand}</span>}
                  <span className={styles.txArticleCode}>{tx.articleCode}</span>
                </div>

                <div className={styles.txMeta}>
                  {tx.department && <span>{tx.department}</span>}
                  {tx.productFamily && <span>· {tx.productFamily}</span>}
                  {tx.transactionType !== 'NORMAL' && (
                    <span className={styles.txTypeTag}>{tx.transactionType}</span>
                  )}
                </div>
              </div>

              <div className={styles.txFooter}>
                <div className={styles.txAmounts}>
                  <div>
                    <span className={styles.txLabel}>Qty</span>
                    <span className={styles.txVal}>{tx.quantity}</span>
                  </div>
                  <div>
                    <span className={styles.txLabel}>Gross</span>
                    <span className={styles.txVal}>{formatINR(tx.grossAmount)}</span>
                  </div>
                  {typeof tx.finalIncentive === 'number' && (
                    <div>
                      <span className={styles.txLabel}>Incentive</span>
                      <span className={`${styles.txVal} ${tx.finalIncentive === 0 ? styles.txZero : styles.txEarn}`}>
                        {tx.finalIncentive > 0 ? `+₹${tx.finalIncentive}` : '₹0'}
                      </span>
                    </div>
                  )}
                </div>

                {tx.note && <div className={styles.txNote}>{tx.note}</div>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
