import React, { useState, useMemo } from 'react';
import { Info, Search, X } from 'lucide-react';
import styles from './SharedScreens.module.scss';
import useAsync from '../../hooks/useAsync';
import { fetchSales } from '../../api/sales';
import { transformTransactions } from '../../api/transformers/transactions';
import { formatINR } from '../../utils/format';
import TransactionDetailSheet from '../../components/Organism/TransactionDetailSheet/TransactionDetailSheet';

const PERIODS = [
  { id: 'month', label: 'This month' },
  { id: 'all',   label: 'All' },
];

const TX_TYPE_CHIPS = [
  { id: 'ALL',     label: 'All' },
  { id: 'NORMAL',  label: 'In-store' },
  { id: 'SFS',     label: 'SFS' },
  { id: 'PAS',     label: 'PAS' },
  { id: 'JIOMART', label: 'JioMart' },
];

function sameMonth(dateStr, ref) {
  const d = new Date(dateStr);
  const r = new Date(ref);
  return d.getFullYear() === r.getFullYear() && d.getMonth() === r.getMonth();
}

function dayKey(dateStr) {
  const d = new Date(dateStr);
  return d.toISOString().slice(0, 10);
}

function dayHeading(dateStr, today) {
  const d = new Date(dateStr);
  const t = new Date(today);
  const diffDays = Math.round((t - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });
}

export default function HistoryScreen({ employeeId }) {
  const [period, setPeriod] = useState('month');
  const [query, setQuery] = useState('');
  const [txType, setTxType] = useState('ALL');
  const [earningOnly, setEarningOnly] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  const today = new Date().toISOString().slice(0, 10);

  const salesResult = useAsync(
    () => employeeId
      ? fetchSales({ employeeId }).then(transformTransactions)
      : Promise.resolve([]),
    [employeeId]
  );
  const allTx = salesResult.data || [];

  const filtered = useMemo(() => {
    let list = allTx;
    if (period === 'month') {
      list = list.filter((tx) => sameMonth(tx.transactionDate, today));
    }
    if (txType !== 'ALL') {
      list = list.filter((tx) => tx.transactionType === txType);
    }
    if (earningOnly) {
      list = list.filter((tx) => typeof tx.finalIncentive === 'number' && tx.finalIncentive > 0);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((tx) =>
        [tx.transactionId, tx.articleCode, tx.brand, tx.productFamily, tx.department]
          .filter(Boolean)
          .some((f) => f.toLowerCase().includes(q))
      );
    }
    return list;
  }, [allTx, period, txType, earningOnly, query]);

  const mtdEarned = filtered.reduce((s, tx) => s + (tx.finalIncentive || 0), 0);
  const mtdGross  = filtered.reduce((s, tx) => s + tx.grossAmount, 0);

  // Group filtered transactions by day
  const grouped = useMemo(() => {
    const groups = new Map();
    for (const tx of filtered) {
      const key = dayKey(tx.transactionDate);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(tx);
    }
    return Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const anyFilterActive = txType !== 'ALL' || earningOnly || query.trim();

  return (
    <div className={styles.screen}>
      <header className={styles.screenHead}>
        <h1 className={styles.title}>Sales history</h1>
        <p className={styles.sub}>Read-only log of your sales for the period.</p>
      </header>

      {/* Period tabs */}
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

      {/* Search + chips */}
      <div className={styles.searchRow}>
        <div className={styles.searchWrap}>
          <Search size={14} strokeWidth={2.2} className={styles.searchIcon} />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search SKU · brand · transaction ID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button type="button" className={styles.searchClear} onClick={() => setQuery('')} aria-label="Clear search">
              <X size={12} strokeWidth={2.4} />
            </button>
          )}
        </div>
      </div>

      <div className={styles.chipsRow}>
        {TX_TYPE_CHIPS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`${styles.chip} ${txType === c.id ? styles.chipActive : ''}`}
            onClick={() => setTxType(c.id)}
          >
            {c.label}
          </button>
        ))}
        <button
          type="button"
          className={`${styles.chip} ${earningOnly ? styles.chipActive : ''}`}
          onClick={() => setEarningOnly(!earningOnly)}
          aria-pressed={earningOnly}
        >
          Incentive only
        </button>
      </div>

      {/* Summary strip — reflects filtered set */}
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

      {salesResult.loading && (
        <div className={styles.loadingBar}>Loading transactions...</div>
      )}

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <Info size={16} strokeWidth={2.2} />
          <p>
            {anyFilterActive
              ? 'No transactions match your filters.'
              : 'No transactions yet for this period.'}
          </p>
          {anyFilterActive && (
            <button
              type="button"
              className={styles.emptyReset}
              onClick={() => { setQuery(''); setTxType('ALL'); setEarningOnly(false); }}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className={styles.groupedList}>
          {grouped.map(([day, txs]) => (
            <section key={day} className={styles.dayGroup}>
              <div className={styles.dayHead}>
                <span>{dayHeading(day, today)}</span>
                <span className={styles.dayMeta}>{txs.length} tx · {formatINR(txs.reduce((s, t) => s + (t.finalIncentive || 0), 0))}</span>
              </div>
              <div className={styles.txList}>
                {txs.map((tx) => (
                  <TxRow key={tx.transactionId} tx={tx} onSelect={() => setSelectedTx(tx)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <TransactionDetailSheet
        tx={selectedTx}
        open={!!selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
}

function TxRow({ tx, onSelect }) {
  const earned = typeof tx.finalIncentive === 'number' ? tx.finalIncentive : null;
  return (
    <button type="button" className={styles.txCardBtn} onClick={onSelect}>
      <div className={styles.txLeft}>
        <div className={styles.txArticle}>
          {tx.brand && <span className={styles.txBrand}>{tx.brand}</span>}
          <span className={styles.txArticleCode}>{tx.articleCode}</span>
        </div>
        <div className={styles.txMeta}>
          {tx.department && <span>{tx.department}</span>}
          {tx.productFamily && tx.department && <span className={styles.metaDiv}>·</span>}
          {tx.productFamily && <span>{tx.productFamily}</span>}
          {tx.transactionType !== 'NORMAL' && (
            <span className={styles.txTypeTag}>{tx.transactionType}</span>
          )}
        </div>
      </div>
      <div className={styles.txRight}>
        <div className={styles.txGross}>{formatINR(tx.grossAmount)}</div>
        {earned !== null && (
          <div className={`${styles.txEarn} ${earned === 0 ? styles.txZero : ''}`}>
            {earned > 0 ? `+₹${earned}` : '₹0'}
          </div>
        )}
      </div>
    </button>
  );
}
