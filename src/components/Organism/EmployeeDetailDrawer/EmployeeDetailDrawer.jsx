import React, { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Drawer } from '@/nexus/molecules';
import styles from './EmployeeDetailDrawer.module.scss';
import { formatINR } from '../../../utils/format';
import { fetchEmployeeIncentive } from '../../../api/incentives';
import { fetchSales } from '../../../api/sales';

/**
 * Bottom-sheet drilling into a single team member from the SM's roster.
 * Shows profile, MTD payout breakdown by department (Electronics), recent
 * transactions, and the eligibility/metadata footer.
 * Now uses Nexus Drawer for overlay, animation, focus management, and close handling.
 */
export default function EmployeeDetailDrawer({ employee, summaryRow, open, onClose, onViewAllTransactions }) {
  const [detail, setDetail] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !employee) {
      setDetail(null);
      setRecentTx([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const vertical = employee.vertical || 'ELECTRONICS';

    Promise.all([
      fetchEmployeeIncentive(employee.employeeId, vertical).catch(() => null),
      fetchSales({ employeeId: employee.employeeId, storeCode: employee.storeCode }).catch(() => []),
    ])
      .then(([empDetail, txRows]) => {
        if (cancelled) return;
        setDetail(empDetail);
        setRecentTx((txRows || []).slice(0, 5));
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [open, employee?.employeeId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!employee) return null;

  const initial = employee.employeeName?.[0] || '?';
  const totalTxCount = recentTx.length;

  const ineligible = summaryRow?.ineligible;
  const earned = summaryRow?.earned ?? summaryRow?.total ?? 0;
  const potential = summaryRow?.potential ?? summaryRow?.eligible ?? 0;
  const achievementPct = summaryRow?.achievementPct ?? 0;
  const days = summaryRow?.daysPresent;

  // Department breakdown from the API employee detail (Electronics)
  const departments = detail?.departments || [];
  const multiplierTiers = detail?.multiplierTiers || [];

  const findMultiplier = (pct) => {
    const tier = multiplierTiers.find((t) => pct >= Number(t.from) && pct < Number(t.to));
    return tier ? Number(tier.multiplierPct) / 100 : 0;
  };

  const headerIcon = (
    <div className={styles.avatar} aria-hidden="true">{initial}</div>
  );

  const statusSuffix = employee.payrollStatus !== 'ACTIVE'
    ? ` \u00b7 ${employee.payrollStatus.replace(/_/g, ' ').toLowerCase()}`
    : '';

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      placement="bottom"
      title={employee.employeeName}
      subtitle={`${employee.role} \u00b7 ${employee.employeeId}${statusSuffix}`}
      icon={headerIcon}
    >
      <div className={styles.body}>
        {/* Quick stats strip */}
        <section className={styles.stats}>
          <div>
            <div className={styles.statVal} style={{ color: ineligible ? 'var(--color-text-tertiary)' : 'var(--brand-70)' }}>
              {ineligible ? '\u2014' : formatINR(earned)}
            </div>
            <div className={styles.statCap}>earned</div>
          </div>
          <div className={styles.statDiv} />
          <div>
            <div className={styles.statVal}>
              {ineligible ? '\u2014' : formatINR(potential)}
            </div>
            <div className={styles.statCap}>potential</div>
          </div>
          <div className={styles.statDiv} />
          <div>
            <div className={styles.statVal}>{achievementPct > 0 ? `${achievementPct}%` : '\u2014'}</div>
            <div className={styles.statCap}>achievement</div>
          </div>
        </section>

        {ineligible && (
          <div className={styles.ineligNotice}>
            Not eligible for disbursement this cycle.
            {employee.payrollStatus !== 'ACTIVE' && (
              <> Payroll status: <strong>{employee.payrollStatus.replace(/_/g, ' ').toLowerCase()}</strong>.</>
            )}
          </div>
        )}

        {/* Department breakdown — Electronics only */}
        {departments.length > 0 && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>By department</h3>
            <div className={styles.deptList}>
              <div className={styles.deptHead}>
                <span>Dept</span>
                <span>%</span>
                <span>&times;</span>
              </div>
              {departments.map((d) => {
                const m = findMultiplier(Number(d.achievementPct) || 0);
                const zero = m === 0;
                return (
                  <div key={d.department} className={`${styles.deptRow} ${zero ? styles.deptZero : ''}`}>
                    <span className={styles.deptName}>{d.department}</span>
                    <span className={styles.deptVal}>{d.achievementPct}%</span>
                    <span className={styles.deptVal}>{m === 0 ? '\u2014' : `${m.toFixed(2)}\u00d7`}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Recent transactions */}
        {recentTx.length > 0 && (
          <section className={styles.section}>
            <div className={styles.txHead}>
              <h3 className={styles.sectionTitle}>Recent transactions</h3>
              {onViewAllTransactions && totalTxCount > 0 && (
                <button
                  type="button"
                  className={styles.viewAll}
                  onClick={() => onViewAllTransactions(employee.employeeId)}
                >
                  Open in Transactions
                  <ArrowUpRight size={12} strokeWidth={2.4} />
                </button>
              )}
            </div>
            <div className={styles.txList}>
              {recentTx.map((tx) => {
                const earned = typeof tx.incentiveAmount === 'number' ? tx.incentiveAmount : null;
                return (
                  <div key={tx.transactionId} className={styles.txRow}>
                    <div className={styles.txLeft}>
                      <div className={styles.txArticle}>
                        {tx.brand && tx.brand !== '—' && <span className={styles.txBrand}>{tx.brand}</span>}
                        <span className={styles.txArticleCode}>{tx.articleCode}</span>
                      </div>
                      <div className={styles.txMeta}>
                        {new Date(tx.transactionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        {tx.department && tx.department !== '—' && ` \u00b7 ${tx.department}`}
                        {tx.transactionType !== 'NORMAL' && (
                          <span className={styles.txTag}>{tx.transactionType}</span>
                        )}
                      </div>
                    </div>
                    <div className={styles.txRight}>
                      <div className={styles.txGross}>{formatINR(tx.grossAmount)}</div>
                      {earned !== null && (
                        <div className={`${styles.txEarn} ${earned === 0 ? styles.txZero : ''}`}>
                          {earned > 0 ? `+\u20B9${earned}` : '\u20B90'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Profile / metadata */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Profile</h3>
          <div className={styles.metaList}>
            <Row label="Employee ID"     value={employee.employeeId} />
            <Row label="Role"             value={employee.role} />
            {employee.department && (
              <Row label="Department"     value={employee.department} />
            )}
            <Row label="Store"            value={employee.storeCode} />
            <Row label="Payroll status"   value={employee.payrollStatus} />
          </div>
        </section>
      </div>
    </Drawer>
  );
}

function Row({ label, value }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <strong className={styles.rowValue}>{value}</strong>
    </div>
  );
}
