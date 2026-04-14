import React, { useState, useMemo } from 'react';
import { Info, Store, ArrowUpRight, Package } from 'lucide-react';
import styles from './BrandAssociateHome.module.scss';
import { usePersona } from '../../context/PersonaContext';
import useAsync from '../../hooks/useAsync';
import { fetchSales } from '../../api/sales';
import { fetchEmployees } from '../../api/employees';
import { fetchStoreIncentive } from '../../api/incentives';
import HeaderBar from '../../components/Organism/HeaderBar/HeaderBar';
import BottomNav from '../../components/Organism/BottomNav/BottomNav';
import ComplianceLink from '../../components/Molecule/ComplianceLink/ComplianceLink';
import { formatINR } from '../../utils/format';

export default function BrandAssociateHome() {
  const [tab, setTab] = useState('home');
  const { active, employee, store } = usePersona();

  // Fetch BA's own sales for contribution stats
  const salesResult = useAsync(
    () => employee?.employeeId ? fetchSales({ employeeId: employee.employeeId, vertical: 'ELECTRONICS' }) : Promise.resolve([]),
    [employee?.employeeId]
  );

  // Fetch store team to find the SM
  const teamResult = useAsync(
    () => store?.storeCode ? fetchEmployees(store.storeCode) : Promise.resolve([]),
    [store?.storeCode]
  );

  // Fetch store detail for storeActual
  const storeDetailResult = useAsync(
    () => store?.storeCode ? fetchStoreIncentive(store.storeCode, 'ELECTRONICS') : Promise.resolve(null),
    [store?.storeCode]
  );

  const sm = (teamResult.data || []).find((e) => e.role === 'SM') || null;

  // BA's OWN contribution stats (not the SM's credited base)
  const myContribution = useMemo(() => {
    const rows = salesResult.data;
    if (!rows || rows.length === 0) return null;
    const unitsSold = rows.reduce((sum, r) => sum + (r.quantity || 0), 0);
    const grossValue = rows.reduce((sum, r) => sum + (r.grossAmount || 0), 0);
    const skuMap = {};
    rows.forEach((r) => {
      if (!skuMap[r.articleCode]) skuMap[r.articleCode] = { sku: r.articleCode, family: '', units: 0 };
      skuMap[r.articleCode].units += r.quantity || 0;
    });
    const topSkus = Object.values(skuMap).sort((a, b) => b.units - a.units).slice(0, 5);
    return { brand: employee?.brandRep || active?.brandRep || 'N/A', unitsSold, grossValue, topSkus };
  }, [salesResult.data, employee, active]);

  // Store-level actuals
  const storeActual = useMemo(() => {
    const depts = storeDetailResult.data?.departments || [];
    return depts.reduce((s, d) => s + (Number(d.actual) || 0), 0);
  }, [storeDetailResult.data]);

  const firstName = employee?.employeeName?.split(' ')[0] ?? '';

  const dataLoading = salesResult.loading || teamResult.loading || storeDetailResult.loading;
  if (!active || !employee || !store || dataLoading) {
    return <div className={styles.shell}><div className={styles.loading}>Loading...</div></div>;
  }

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
                  <div className={styles.pulseVal}>{store.operationalDaysInMonth ?? '—'}</div>
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
