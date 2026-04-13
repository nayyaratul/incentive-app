import React, { useState } from 'react';
import { Info, Store, ArrowUpRight, Package } from 'lucide-react';
import styles from './BrandAssociateHome.module.scss';
import { usePersona } from '../../context/PersonaContext';
import { employees } from '../../data/masters';
import { baContributionsRD3675 } from '../../data/payouts';
import { electronicsActualsRD3675 } from '../../data/configs';
import HeaderBar from '../../components/Organism/HeaderBar/HeaderBar';
import BottomNav from '../../components/Organism/BottomNav/BottomNav';
import RulesScreen from '../screens/RulesScreen';
import ComplianceLink from '../../components/Molecule/ComplianceLink/ComplianceLink';
import { formatINR } from '../../utils/format';

export default function BrandAssociateHome() {
  const [tab, setTab] = useState('home');
  const { active, employee, store } = usePersona();
  const firstName = employee.employeeName.split(' ')[0];
  const sm = employees.find((e) => e.storeCode === store.storeCode && e.role === 'SM');

  // BA's OWN contribution stats (not the SM's credited base)
  const myContribution = baContributionsRD3675[employee.employeeId] || null;

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
          {/* Eligibility notice */}
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

          {/* My contribution — BA's own qty + gross, NOT the SM's credited base */}
          {myContribution && (
            <section className={`${styles.pad} rise rise-3`}>
              <div className={styles.cardLight}>
                <div className={styles.cardHead}>
                  <span className={styles.eyebrow}>Your contribution this month</span>
                  <span className={styles.brandPill}>{myContribution.brand}</span>
                </div>

                <div className={styles.contribGrid}>
                  <div>
                    <div className={styles.contribVal}>{myContribution.unitsSold}</div>
                    <div className={styles.contribCap}>units sold</div>
                  </div>
                  <div className={styles.contribDiv} />
                  <div>
                    <div className={styles.contribVal}>{formatINR(myContribution.grossValue)}</div>
                    <div className={styles.contribCap}>gross value (pre-tax)</div>
                  </div>
                </div>

                <p className={styles.contribNote}>
                  Recorded under <strong>{sm?.employeeName}</strong> for calculation and reporting.
                  Your performance still affects the store's department achievement %, which sets the
                  multiplier applied to the SM's payout.
                </p>
              </div>
            </section>
          )}

          {/* Top SKUs sold this month */}
          {myContribution && myContribution.topSkus.length > 0 && (
            <section className={`${styles.pad} rise rise-4`}>
              <div className={styles.cardLight}>
                <div className={styles.cardHead}>
                  <span className={styles.eyebrow}>Your top SKUs</span>
                  <Package size={13} strokeWidth={2.2} className={styles.iconMuted} />
                </div>
                <div className={styles.skuList}>
                  {myContribution.topSkus.map((s, i) => (
                    <div key={i} className={styles.skuRow}>
                      <span className={styles.skuRank}>{String(i + 1).padStart(2, '0')}</span>
                      <div className={styles.skuMid}>
                        <div className={styles.skuName}>{s.sku}</div>
                        <div className={styles.skuFamily}>{s.family}</div>
                      </div>
                      <span className={styles.skuUnits}>
                        <strong>{s.units}</strong>
                        <span className={styles.skuUnitsCap}>units</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Store pulse */}
          <section className={`${styles.pad} rise rise-5`}>
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

          <section className={`${styles.pad} rise rise-5`}>
            <ComplianceLink
              label="Your record"
              items={[
                { label: 'Employee ID',        value: employee.employeeId },
                { label: 'Role',                value: 'Brand Associate (BA)' },
                { label: 'Brand represented',   value: active.brandRep },
                { label: 'Store',               value: `${store.storeCode} · ${store.storeName}` },
                { label: 'Payroll status',      value: employee.payrollStatus },
              ]}
            />
          </section>
          </>)}
        </main>
      </div>
    </div>
  );
}
