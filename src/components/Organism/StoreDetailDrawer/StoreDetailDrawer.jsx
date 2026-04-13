import React, { useEffect } from 'react';
import { X, Store, MapPin } from 'lucide-react';
import styles from './StoreDetailDrawer.module.scss';
import { formatINR } from '../../../utils/format';
import { centralReporting } from '../../../data/payouts';

/**
 * Bottom-sheet store drill-down for the Central Reporting persona.
 * Shows the store header, key stats, and any anomaly flags raised against it.
 */
export default function StoreDetailDrawer({ store, open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !store) return null;

  const flags = centralReporting.flags.filter((f) => f.storeCode === store.storeCode);
  const ach = store.achievementPct;
  const achState =
    ach >= 110 ? 'over' :
    ach >= 100 ? 'hit' :
    ach >= 85  ? 'on-track' :
    'behind';

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-label="Store detail">
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle} aria-hidden="true" />

        <header className={styles.head}>
          <div className={styles.headLeft}>
            <div className={styles.iconWrap} aria-hidden="true"><Store size={18} strokeWidth={2.2} /></div>
            <div className={styles.headText}>
              <div className={styles.name}>{store.storeName}</div>
              <div className={styles.metaLine}>
                <span className={styles.code}>{store.storeCode}</span>
                <span className={styles.meta}>
                  <MapPin size={11} strokeWidth={2.4} />
                  {store.city}, {store.state}
                </span>
                {store.status !== 'ACTIVE' && (
                  <span className={styles.statusChip}>{store.status.replace(/_/g, ' ').toLowerCase()}</span>
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
              <div className={`${styles.statVal} ${styles[`ach-${achState}`]}`}>
                {ach}<span className={styles.statUnit}>%</span>
              </div>
              <div className={styles.statCap}>achievement</div>
            </div>
            <div className={styles.statDiv} />
            <div>
              <div className={styles.statVal} style={{ color: store.payoutMTD > 0 ? 'var(--brand-deep)' : 'var(--text-muted)' }}>
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
              <Row label="City · State" value={`${store.city}, ${store.state}`} />
              <Row label="Status"       value={store.status} />
              <Row label="Staff"        value={String(store.staffCount)} />
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
