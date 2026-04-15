import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Drawer } from '@/nexus/molecules';
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
 * Now uses Nexus Drawer for overlay, animation, focus management, and close handling.
 */
export default function EmployeeDetailDrawer({ employee, summaryRow, open, onClose, onViewAllTransactions }) {
  if (!employee) return null;

  const initial = employee.employeeName?.[0] || '?';
  const elecPayout = electronicsPayoutsRD3675.find((p) => p.employeeId === employee.employeeId);
  const allTx = transactionsByEmployee[employee.employeeId] || [];
  const recentTx = allTx.slice(0, 5);
  const totalTxCount = allTx.length;

  const ineligible = summaryRow?.ineligible;
  const total = summaryRow?.total ?? 0;
  const days = summaryRow?.daysPresent;

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
              {ineligible ? '\u2014' : formatINR(total)}
            </div>
            <div className={styles.statCap}>this period</div>
          </div>
          <div className={styles.statDiv} />
          <div>
            <div className={styles.statVal}>{typeof days === 'number' ? `${days}/7` : '\u2014'}</div>
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
                <span>&times;</span>
                <span>Final</span>
              </div>
              {elecPayout.byDepartment.map((d) => {
                const m = findMultiplier(d.achievementPct);
                const zero = m === 0;
                return (
                  <div key={d.department} className={`${styles.deptRow} ${zero ? styles.deptZero : ''}`}>
                    <span className={styles.deptName}>{d.department}</span>
                    <span className={styles.deptVal}>{d.achievementPct}%</span>
                    <span className={styles.deptVal}>{m === 0 ? '\u2014' : `${m.toFixed(2)}\u00d7`}</span>
                    <span className={`${styles.deptFinal} ${zero ? styles.deptZeroFinal : ''}`}>
                      {d.finalPayout === 0 ? '\u20B90' : formatINR(d.finalPayout)}
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
              {onViewAllTransactions && totalTxCount > 0 && (
                <button
                  type="button"
                  className={styles.viewAll}
                  onClick={() => onViewAllTransactions(employee.employeeId)}
                >
                  {totalTxCount > recentTx.length
                    ? `See all ${totalTxCount}`
                    : 'Open in Transactions'}
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
                        {tx.department && ` \u00b7 ${tx.department}`}
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
