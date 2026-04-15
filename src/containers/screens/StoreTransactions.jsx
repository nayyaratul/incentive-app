import React, { useMemo, useState } from 'react';
import { Info, Search, X, Users } from 'lucide-react';
import styles from './SharedScreens.module.scss';
import { employees } from '../../data/masters';
import { getStoreTransactions } from '../../data/transactions';
import { formatINR } from '../../utils/format';
import TransactionDetailSheet from '../../components/Organism/TransactionDetailSheet/TransactionDetailSheet';
import TabPageHeader from '../../components/Molecule/TabPageHeader/TabPageHeader';

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
  return new Date(dateStr).toISOString().slice(0, 10);
}

function dayHeading(dateStr, today) {
  const d = new Date(dateStr);
  const t = new Date(today);
  const diffDays = Math.round((t - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });
}

export default function StoreTransactions({ storeCode, initialEmployeeFilter = 'ALL' }) {
  const [period, setPeriod]       = useState('month');
  const [query, setQuery]         = useState('');
  const [txType, setTxType]       = useState('ALL');
  const [empFilter, setEmpFilter] = useState(initialEmployeeFilter);
  const [selectedTx, setSelectedTx] = useState(null);

  // If parent forwards a different initial filter (e.g. user drilled in from
  // another roster row), respect it.
  React.useEffect(() => {
    setEmpFilter(initialEmployeeFilter);
  }, [initialEmployeeFilter]);

  const today = '2026-04-13';
  const storeTeam = useMemo(() => employees.filter((e) => e.storeCode === storeCode), [storeCode]);
  const allTx = useMemo(() => getStoreTransactions(storeCode, storeTeam), [storeCode, storeTeam]);
  const empLookup = useMemo(() => {
    const m = {};
    storeTeam.forEach((e) => { m[e.employeeId] = e; });
    return m;
  }, [storeTeam]);

  const filtered = useMemo(() => {
    let list = allTx;
    if (period === 'month') list = list.filter((tx) => sameMonth(tx.transactionDate, today));
    if (txType !== 'ALL') list = list.filter((tx) => tx.transactionType === txType);
    if (empFilter !== 'ALL') list = list.filter((tx) => tx.employeeId === empFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((tx) =>
        [tx.transactionId, tx.articleCode, tx.brand, tx.employeeId, empLookup[tx.employeeId]?.employeeName, tx.department, tx.productFamily]
          .filter(Boolean)
          .some((f) => f.toLowerCase().includes(q))
      );
    }
    return list;
  }, [allTx, period, txType, empFilter, query, empLookup]);

  const txCount     = filtered.length;
  const grossTotal  = filtered.reduce((s, tx) => s + tx.grossAmount, 0);
  const finalTotal  = filtered.reduce((s, tx) => s + (tx.finalIncentive || 0), 0);
  const excludedCount = filtered.filter((tx) => tx.transactionType !== 'NORMAL').length;

  const grouped = useMemo(() => {
    const groups = new Map();
    for (const tx of filtered) {
      const key = dayKey(tx.transactionDate);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(tx);
    }
    return Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const anyFilterActive = txType !== 'ALL' || empFilter !== 'ALL' || query.trim();

  return (
    <div className={styles.screen}>
      <div className="rise rise-1">
        <TabPageHeader
          title="Store transactions"
          subtitle="Read-only stream of every sale recorded in this store."
        />
      </div>

      {/* Period tabs */}
      <div className={`${styles.tabs} rise rise-2`} role="tablist">
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

      {/* Search */}
      <div className={`${styles.searchRow} rise rise-2`}>
        <div className={styles.searchWrap}>
          <Search size={14} strokeWidth={2.2} className={styles.searchIcon} />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search employee · SKU · brand · tx ID"
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

      {/* Tx-type chips */}
      <div className={`${styles.chipsRow} rise rise-3`}>
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
      </div>

      {/* Employee chips */}
      <div className={`${styles.chipsRow} rise rise-3`}>
        <button
          type="button"
          className={`${styles.chip} ${empFilter === 'ALL' ? styles.chipActive : ''}`}
          onClick={() => setEmpFilter('ALL')}
        >
          <Users size={12} strokeWidth={2.2} style={{ marginRight: 4, verticalAlign: '-2px' }} />
          All staff
        </button>
        {storeTeam
          .filter((e) => ['SA','DM','SM','BA'].includes(e.role))
          .map((e) => (
            <button
              key={e.employeeId}
              type="button"
              className={`${styles.chip} ${empFilter === e.employeeId ? styles.chipActive : ''}`}
              onClick={() => setEmpFilter(e.employeeId)}
            >
              {e.role} · {e.employeeName.split(' ')[0]}
            </button>
          ))}
      </div>

      {/* Summary strip */}
      <section className={`${styles.summaryRow4} rise rise-4`}>
        <div>
          <div className={styles.summaryVal}>{txCount}</div>
          <div className={styles.summaryCap}>tx</div>
        </div>
        <div className={styles.summaryDiv} />
        <div>
          <div className={styles.summaryVal}>{formatINR(grossTotal)}</div>
          <div className={styles.summaryCap}>gross</div>
        </div>
        <div className={styles.summaryDiv} />
        <div>
          <div className={styles.summaryVal} style={{ color: 'var(--brand-70)' }}>{formatINR(finalTotal)}</div>
          <div className={styles.summaryCap}>incentive</div>
        </div>
        <div className={styles.summaryDiv} />
        <div>
          <div className={styles.summaryVal} style={{ color: excludedCount > 0 ? 'var(--color-text-warning)' : 'var(--color-text-primary)' }}>{excludedCount}</div>
          <div className={styles.summaryCap}>excluded</div>
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className={`${styles.empty} rise rise-5`}>
          <Info size={16} strokeWidth={2.2} />
          <p>
            {anyFilterActive
              ? 'No transactions match your filters.'
              : 'No store transactions recorded for this period.'}
          </p>
          {anyFilterActive && (
            <button
              type="button"
              className={styles.emptyReset}
              onClick={() => { setQuery(''); setTxType('ALL'); setEmpFilter('ALL'); }}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className={`${styles.groupedList} rise rise-5`}>
          {grouped.map(([day, txs]) => (
            <section key={day} className={styles.dayGroup}>
              <div className={styles.dayHead}>
                <span>{dayHeading(day, today)}</span>
                <span className={styles.dayMeta}>{txs.length} tx · {formatINR(txs.reduce((s, t) => s + (t.finalIncentive || 0), 0))}</span>
              </div>
              <div className={styles.txList}>
                {txs.map((tx) => (
                  <StoreTxRow
                    key={tx.transactionId}
                    tx={tx}
                    employee={empLookup[tx.employeeId]}
                    onSelect={() => setSelectedTx(tx)}
                  />
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

function StoreTxRow({ tx, employee, onSelect }) {
  const earned = typeof tx.finalIncentive === 'number' ? tx.finalIncentive : null;
  return (
    <button type="button" className={styles.txCardBtn} onClick={onSelect}>
      <div className={styles.txLeft}>
        <div className={styles.txArticle}>
          {tx.brand && <span className={styles.txBrand}>{tx.brand}</span>}
          <span className={styles.txArticleCode}>{tx.articleCode}</span>
        </div>
        <div className={styles.txMeta}>
          {employee && (
            <>
              <span className={styles.txEmpBadge}>{employee.role}</span>
              <span>{employee.employeeName.split(' ')[0]}</span>
            </>
          )}
          {tx.department && <span className={styles.metaDiv}>·</span>}
          {tx.department && <span>{tx.department}</span>}
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
