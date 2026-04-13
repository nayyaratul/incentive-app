import React, { useState } from 'react';
import { Info, Store, ArrowUpRight } from 'lucide-react';
import styles from './BrandAssociateHome.module.scss';
import { usePersona } from '../../context/PersonaContext';
import { employees } from '../../data/masters';
import { electronicsPayoutsRD3675 } from '../../data/payouts';
import { electronicsActualsRD3675 } from '../../data/configs';
import HeaderBar from '../../components/Organism/HeaderBar/HeaderBar';
import BottomNav from '../../components/Organism/BottomNav/BottomNav';
import RulesScreen from '../screens/RulesScreen';
import { formatINR } from '../../utils/format';

export default function BrandAssociateHome() {
  const [tab, setTab] = useState('home');
  const { active, employee, store } = usePersona();
  const firstName = employee.employeeName.split(' ')[0];
  const sm = employees.find((e) => e.storeCode === store.storeCode && e.role === 'SM');

  // Sales BA sells are attributed to SM → use SM's payout pack for "your contribution"
  const smPayout = electronicsPayoutsRD3675.find((p) => p.employeeId === sm?.employeeId);
  const contribution = smPayout ? smPayout.byDepartment.reduce((s, d) => s + d.baseIncentive, 0) : 0;

  // Store-level actuals
  const storeActual = electronicsActualsRD3675.reduce((s, d) => s + d.actualSales, 0);

  return (
    <div className={styles.shell}>
      <BottomNav active={tab} role="BA" onNavigate={setTab} />

      <div className={styles.layout}>
        <HeaderBar
          employeeName={tab === 'home' ? firstName : null}
          streak={0}
          showStreak={false}
        />

        <main className={styles.main}>
          {tab === 'rules' && <RulesScreen defaultVertical={active.vertical} />}
          {tab === 'home' && (<>
          <div className={`${styles.datemark} rise rise-1`}>
            <span>Brand Associate · {active.brandRep}</span>
            <span className={styles.line} />
            <span>{store.storeName}</span>
          </div>

          {/* Big eligibility notice */}
          <section className={`${styles.pad} rise rise-2`}>
            <div className={styles.ineligCard}>
              <div className={styles.ineligIcon}><Info size={18} strokeWidth={2.2} /></div>
              <div>
                <div className={styles.ineligTitle}>You don't earn a personal sales incentive</div>
                <p className={styles.ineligBody}>
                  As a Brand Associate, you are <strong>not eligible</strong> for an individual sales incentive.
                  All sales you record are attributed under your Store Manager's ID for calculation and reporting
                  purposes.
                </p>
                <div className={styles.ineligMeta}>
                  <span>SM of record</span>
                  <strong>{sm?.employeeName}</strong>
                  <span>({sm?.employeeId})</span>
                </div>
              </div>
            </div>
          </section>

          {/* Contribution summary */}
          <section className={`${styles.pad} rise rise-3`}>
            <div className={styles.cardLight}>
              <div className={styles.cardHead}>
                <span className={styles.eyebrow}>Your contribution this month</span>
              </div>
              <div className={styles.contribGrid}>
                <div>
                  <div className={styles.contribVal}>{formatINR(contribution)}</div>
                  <div className={styles.contribCap}>base incentive credited to SM</div>
                </div>
                <div className={styles.contribDiv} />
                <div>
                  <div className={styles.contribVal2}>{active.brandRep}</div>
                  <div className={styles.contribCap}>your brand</div>
                </div>
              </div>
              <p className={styles.contribNote}>
                Your department-level performance still affects the store's achievement %, which sets the multiplier
                the Store Manager's payout is scaled by.
              </p>
            </div>
          </section>

          {/* Store pulse */}
          <section className={`${styles.pad} rise rise-4`}>
            <div className={styles.cardDark}>
              <div className={styles.cardHead}>
                <span className={styles.eyebrowLight}>Store pulse · {store.storeName}</span>
                <Store size={13} strokeWidth={2.2} className={styles.iconLight} />
              </div>

              <div className={styles.pulseFigures}>
                <div>
                  <div className={styles.pulseVal}>{formatINR(storeActual)}</div>
                  <div className={styles.pulseCap}>MTD actual sales (pre-tax)</div>
                </div>
                <div className={styles.pulseDiv} />
                <div>
                  <div className={styles.pulseVal}>{store.operationalDaysInMonth}</div>
                  <div className={styles.pulseCap}>operational days this month</div>
                </div>
              </div>
              <button type="button" className={styles.ctaLink}>
                <span>See department breakdown</span>
                <ArrowUpRight size={13} strokeWidth={2.4} />
              </button>
            </div>
          </section>

          {/* Compliance */}
          <section className={`${styles.pad} rise rise-5`}>
            <div className={styles.complianceCard}>
              <div className={styles.complianceHead}><span>Your record</span></div>
              <ul>
                <li><span>Employee ID</span><strong>{employee.employeeId}</strong></li>
                <li><span>Role</span><strong>Brand Associate (BA)</strong></li>
                <li><span>Brand represented</span><strong>{active.brandRep}</strong></li>
                <li><span>Store</span><strong>{store.storeCode} · {store.storeName}</strong></li>
                <li><span>Payroll status</span><strong>{employee.payrollStatus}</strong></li>
              </ul>
            </div>
          </section>
          </>)}
        </main>
      </div>
    </div>
  );
}
