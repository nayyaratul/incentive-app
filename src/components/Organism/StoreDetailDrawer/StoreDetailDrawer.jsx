import React from 'react';
import { Store, MapPin } from 'lucide-react';
import { Drawer } from '@/nexus/molecules';
import styles from './StoreDetailDrawer.module.scss';
import { formatINR } from '../../../utils/format';
import { centralReporting } from '../../../data/payouts';

/**
 * Bottom-sheet store drill-down for the Central Reporting persona.
 * Shows the store header, key stats, and any anomaly flags raised against it.
 * Now uses Nexus Drawer for overlay, animation, focus management, and close handling.
 */
export default function StoreDetailDrawer({ store, open, onClose }) {
  if (!store) return null;

  const flags = centralReporting.flags.filter((f) => f.storeCode === store.storeCode);
  const ach = store.achievementPct;
  const achState =
    ach >= 110 ? 'over' :
    ach >= 100 ? 'hit' :
    ach >= 85  ? 'on-track' :
    'behind';

  const locationLine = `${store.storeCode} \u00b7 ${store.city}, ${store.state}`;

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      placement="bottom"
      title={store.storeName}
      subtitle={locationLine}
      icon={<Store size={18} strokeWidth={2.2} />}
    >
      <div className={styles.body}>
        {/* Quick stats strip */}
        <section className={styles.stats}>
          <div>
            <div className={`${styles.statVal} ${styles[`ach-${achState}`]}`}>
              {ach}<span className={styles.statUnit}>%</span>
            </div>
            <div className={styles.statCap}>achievement</div>
          </div>
          <div className={styles.statDiv} />
          <div>
            <div className={styles.statVal} style={{ color: store.payoutMTD > 0 ? 'var(--brand-70)' : 'var(--color-text-tertiary)' }}>
              {formatINR(store.payoutMTD)}
            </div>
            <div className={styles.statCap}>payout MTD</div>
          </div>
          <div className={styles.statDiv} />
          <div>
            <div className={styles.statVal}>{store.staffCount}</div>
            <div className={styles.statCap}>staff</div>
          </div>
        </section>

        {/* Anomaly flags raised against this store */}
        {flags.length > 0 && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Open flags</h3>
            <div className={styles.flagList}>
              {flags.map((f) => (
                <div key={f.id} className={`${styles.flagRow} ${styles[`sev-${f.severity}`]}`}>
                  <span className={styles.flagSev}>{f.severity}</span>
                  <span className={styles.flagMsg}>{f.message}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Master fields */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Store record</h3>
          <div className={styles.metaList}>
            <Row label="Store code"   value={store.storeCode} />
            <Row label="Vertical"     value={store.vertical} />
            <Row label="Format"       value={store.format} />
            <Row label="City \u00b7 State" value={`${store.city}, ${store.state}`} />
            <Row label="Status"       value={store.status} />
            <Row label="Staff"        value={String(store.staffCount)} />
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
