import React, { useEffect } from 'react';
import { X, ArrowUpRight } from 'lucide-react';
import styles from './EmployeeDetailDrawer.module.scss';
import { formatINR } from '../../../utils/format';
import { transactionsByEmployee } from '../../../data/transactions';
import { electronicsPayoutsRD3675 } from '../../../data/payouts';
import { electronicsMultiplierTiers } from '../../../data/configs';

function findMultiplier(pct) {
  const tier = electronicsMultiplierTiers.find((t) => pct >= t.gateFromPct && pct < t.gateToPct);
  return tier ? tier.multiplier : 0;
}

/**
 * Bottom-sheet drilling into a single team member from the SM's roster.
 * Shows profile, MTD payout breakdown by department (Electronics), recent
 * transactions, and the eligibility/metadata footer.
 */
export default function EmployeeDetailDrawer({ employee, summaryRow, open, onClose, onViewAllTransactions }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !employee) return null;

  const initial = employee.employeeName?.[0] || '?';
  const elecPayout = electronicsPayoutsRD3675.find((p) => p.employeeId === employee.employeeId);
  const allTx = transactionsByEmployee[employee.employeeId] || [];
  const recentTx = allTx.slice(0, 5);
  const totalTxCount = allTx.length;

  const ineligible = summaryRow?.ineligible;
  const total = summaryRow?.total ?? 0;
  const days = summaryRow?.daysPresent;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-label="Employee detail">
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle} aria-hidden="true" />

        <header className={styles.head}>
          <div className={styles.headLeft}>
            <div className={styles.avatar} aria-hidden="true">{initial}</div>
            <div className={styles.headText}>
              <div className={styles.name}>{employee.employeeName}</div>
              <div className={styles.metaLine}>
                <span className={styles.roleBadge}>{employee.role}</span>
                <span className={styles.empId}>{employee.employeeId}</span>
                {employee.payrollStatus !== 'ACTIVE' && (
                  <span className={styles.statusChip}>
                    {employee.payrollStatus.replace(/_/g, ' ').toLowerCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <X size={18} strokeWidth={2.2} />
          </button>
        </header>

        <div className={styles.body}>
          {/* Quick stats strip */}
          <section className={styles.stats}>
            <div>
              <div className={styles.statVal} style={{ color: ineligible ? 'var(--text-muted)' : 'var(--brand-deep)' }}>
                {ineligible ? '—' : formatINR(total)}
              </div>
              <div className={styles.statCap}>this period</div>
            </div>
            <div className={styles.statDiv} />
            <div>
              <div className={styles.statVal}>{typeof days === 'number' ? `${days}/7` : '—'}</div>
              <div className={styles.statCap}>days present</div>
            </div>
            <div className={styles.statDiv} />
            <div>
              <div className={styles.statVal}>{recentTx.length}</div>
              <div className={styles.statCap}>recent tx</div>
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
          {elecPayout && elecPayout.byDepartment.length > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>By department</h3>
              <div className={styles.deptList}>
                <div className={styles.deptHead}>
                  <span>Dept</span>
                  <span>%</span>
                  <span>×</span>
                  <span>Final</span>
                </div>
                {elecPayout.byDepartment.map((d) => {
                  const m = findMultiplier(d.achievementPct);
                  const zero = m === 0;
                  return (
                    <div key={d.department} className={`${styles.deptRow} ${zero ? styles.deptZero : ''}`}>
                      <span className={styles.deptName}>{d.department}</span>
                      <span className={styles.deptVal}>{d.achievementPct}%</span>
                      <span className={styles.deptVal}>{m === 0 ? '—' : `${m.toFixed(2)}×`}</span>
                      <span className={`${styles.deptFinal} ${zero ? styles.deptZeroFinal : ''}`}>
                        {d.finalPayout === 0 ? '₹0' : formatINR(d.finalPayout)}
                      </span>
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
                {onViewAllTransactions && totalTxCount > recentTx.length && (
                  <button
                    type="button"
                    className={styles.viewAll}
                    onClick={() => onViewAllTransactions(employee.employeeId)}
                  >
                    See all {totalTxCount}
                    <ArrowUpRight size={12} strokeWidth={2.4} />
                  </button>
                )}
              </div>
              <div className={styles.txList}>
                {recentTx.map((tx) => {
                  const earned = typeof tx.finalIncentive === 'number' ? tx.finalIncentive : null;
                  return (
                    <div key={tx.transactionId} className={styles.txRow}>
                      <div className={styles.txLeft}>
                        <div className={styles.txArticle}>
                          {tx.brand && <span className={styles.txBrand}>{tx.brand}</span>}
                          <span className={styles.txArticleCode}>{tx.articleCode}</span>
                        </div>
                        <div className={styles.txMeta}>
                          {new Date(tx.transactionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          {tx.department && ` · ${tx.department}`}
                          {tx.transactionType !== 'NORMAL' && (
                            <span className={styles.txTag}>{tx.transactionType}</span>
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
              {employee.primaryDepartment && (
                <Row label="Primary dept"   value={employee.primaryDepartment} />
              )}
              {employee.brandRep && (
                <Row label="Brand"          value={employee.brandRep} />
              )}
              <Row label="Store"            value={employee.storeCode} />
              <Row label="Payroll status"   value={employee.payrollStatus} />
              <Row label="Joined"           value={employee.dateOfJoining} />
              {employee.dateOfExit && (
                <Row label="Exit date"      value={employee.dateOfExit} />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
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
