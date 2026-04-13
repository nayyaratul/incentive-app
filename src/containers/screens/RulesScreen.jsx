import React, { useState } from 'react';
import { Info } from 'lucide-react';
import styles from './SharedScreens.module.scss';
import { VERTICALS } from '../../data/masters';
import {
  electronicsBaseSlabs,
  electronicsMultiplierTiers,
  electronicsExclusions,
  groceryCampaign,
  fnlWeeklyRules,
} from '../../data/configs';
import { formatINR } from '../../utils/format';

const VERTICAL_LABELS = {
  [VERTICALS.ELECTRONICS]: 'Electronics',
  [VERTICALS.GROCERY]:     'Grocery',
  [VERTICALS.FNL]:         'Trends F&L',
};

export default function RulesScreen({ defaultVertical = VERTICALS.ELECTRONICS }) {
  const [tab, setTab] = useState(defaultVertical);

  return (
    <div className={styles.screen}>
      <header className={styles.screenHead}>
        <h1 className={styles.title}>Incentive rules</h1>
        <p className={styles.sub}>Read-only copy of the rules your payout is calculated from.</p>
      </header>

      <div className={styles.tabs} role="tablist">
        {Object.values(VERTICALS).map((v) => (
          <button
            key={v}
            role="tab"
            aria-selected={tab === v}
            className={`${styles.tab} ${tab === v ? styles.tabActive : ''}`}
            onClick={() => setTab(v)}
            type="button"
          >
            {VERTICAL_LABELS[v]}
          </button>
        ))}
      </div>

      <div className={styles.tabBody}>
        {tab === VERTICALS.ELECTRONICS && <ElectronicsRules />}
        {tab === VERTICALS.GROCERY && <GroceryRules />}
        {tab === VERTICALS.FNL && <FnlRules />}
      </div>
    </div>
  );
}

// --- Electronics: slab table + multiplier ladder + exclusions ---
function ElectronicsRules() {
  // Collapse slabs by family so we render one group per family
  const groups = {};
  for (const slab of electronicsBaseSlabs) {
    const key = `${slab.productFamily} — ${slab.applicableBrands.join('/')}`;
    if (!groups[key]) groups[key] = { family: slab.productFamily, brands: slab.applicableBrands, rows: [] };
    groups[key].rows.push(slab);
  }

  return (
    <div className={styles.stack}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Step 1 · Base incentive per product</h2>
        <p className={styles.lede}>
          For each eligible product sold, the Store Associate earns a fixed amount based on product family, brand group,
          and selling price (pre-tax). §6.4
        </p>

        {Object.values(groups).map((g, idx) => (
          <div key={idx} className={styles.ruleCard}>
            <div className={styles.ruleCardHead}>
              <div className={styles.ruleFamily}>{g.family}</div>
              <div className={styles.ruleBrands}>{humanBrands(g.brands)}</div>
            </div>
            <div className={styles.slabTable}>
              <div className={styles.slabTableHead}>
                <span>Price band</span>
                <span>Incentive / unit</span>
              </div>
              {g.rows.map((row, i) => (
                <div key={i} className={styles.slabTableRow}>
                  <span>
                    {formatINR(row.minPrice)} – {row.maxPrice === Infinity ? '∞' : formatINR(row.maxPrice)}
                  </span>
                  <span className={styles.slabAmount}>₹{row.incentivePerUnit}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Step 2 · Department achievement multiplier</h2>
        <p className={styles.lede}>
          Your base total is scaled by how your department is tracking vs its monthly target. Below 85% = no payout.
        </p>
        <div className={styles.multTable}>
          {electronicsMultiplierTiers.map((t, i) => (
            <div key={i} className={styles.multRow}>
              <span className={styles.multBand}>
                {t.gateFromPct}% – {t.gateToPct === Infinity ? '∞' : `${t.gateToPct}%`}
              </span>
              <span className={`${styles.multValue} ${t.multiplier === 0 ? styles.multZero : ''}`}>
                {t.multiplier === 0 ? 'No payout' : `${Math.round(t.multiplier * 100)}%`}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Exclusions</h2>
        <div className={styles.excludeList}>
          <div className={styles.excludeRow}>
            <Info size={13} strokeWidth={2.2} />
            <span><strong>Brands excluded entirely:</strong> {electronicsExclusions.brands.join(', ')}</span>
          </div>
          <div className={styles.excludeRow}>
            <Info size={13} strokeWidth={2.2} />
            <span><strong>Transaction types excluded:</strong> {electronicsExclusions.transactionTypes.join(', ')} (Ship-from-store, Pick-at-store, JioMart online)</span>
          </div>
          <div className={styles.excludeRow}>
            <Info size={13} strokeWidth={2.2} />
            <span><strong>Store eligibility:</strong> operational for at least 15 days in the month</span>
          </div>
          <div className={styles.excludeRow}>
            <Info size={13} strokeWidth={2.2} />
            <span><strong>Role eligibility:</strong> SA only. BA sales attributed to SM; BA does not earn personally.</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function humanBrands(brands) {
  if (brands[0] === '*') return 'All brands';
  if (brands[0] === '*-APPLE-SURFACE') return 'All brands except Apple & Microsoft Surface';
  if (brands[0] === '*-ONEPLUS-MI-REALME') return 'All brands except OnePlus, MI, Realme';
  if (brands[0] === '*-IFB-WASHING') return 'All brands except IFB washing machines';
  if (brands.includes('OTHERS')) return `${brands.filter((b) => b !== 'OTHERS').join(', ')} + others (excl. Samsung/Oppo/Vivo/Apple/OnePlus)`;
  return brands.join(' / ');
}

// --- Grocery: active campaign snapshot ---
function GroceryRules() {
  const c = groceryCampaign;
  return (
    <div className={styles.stack}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Active campaign</h2>
        <div className={styles.ruleCard}>
          <div className={styles.campaignHead}>
            <div className={styles.ruleFamily}>{c.campaignName}</div>
            <div className={styles.ruleBrands}>
              {c.campaignStart} → {c.campaignEnd} · {c.geography} · {c.channel}
            </div>
          </div>
          <p className={styles.lede}>
            Type: <strong>{c.incentiveType}</strong> · Funding: {c.fundingSource}
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Payout slabs</h2>
        <p className={styles.lede}>The store's achievement of its sales target sets one rate that applies to all eligible pieces.</p>
        <div className={styles.multTable}>
          <div className={styles.multRow}>
            <span className={styles.multBand}>&lt; 100%</span>
            <span className={`${styles.multValue} ${styles.multZero}`}>No payout</span>
          </div>
          {c.payoutSlabs.map((s, i) => (
            <div key={i} className={styles.multRow}>
              <span className={styles.multBand}>
                {s.achievementFromPct}% – {s.achievementToPct === Infinity ? '∞' : `${s.achievementToPct}%`}
              </span>
              <span className={styles.multValue}>₹{s.ratePerPiece} / piece</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Distribution rule</h2>
        <div className={styles.excludeList}>
          <div className={styles.excludeRow}>
            <Info size={13} strokeWidth={2.2} />
            <span>Total store incentive is <strong>split equally</strong> across all store employees — SM, DM, SA, and BA. §7.4</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Eligible articles ({c.eligibleArticles.length})</h2>
        <div className={styles.articleList}>
          <div><strong>Andree</strong> Butterscotch · Rich Dates · Rich Plum</div>
          <div><strong>Bakemill</strong> Chocolate · Coffee · Dates & Carrot · Jackfruit</div>
          <div><strong>Kairali</strong> Pudding CBD</div>
          <div><strong>Unibic</strong> Plum Cake (Egg) · Veg Plum Cake</div>
        </div>
      </section>
    </div>
  );
}

// --- F&L: weekly rule + split matrix ---
function FnlRules() {
  const r = fnlWeeklyRules;
  return (
    <div className={styles.stack}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Weekly qualification</h2>
        <p className={styles.lede}>
          Week = Sunday → Saturday. Store must <strong>exceed</strong> the weekly sales target. If not, no one earns for that week.
        </p>
        <div className={styles.excludeList}>
          <div className={styles.excludeRow}>
            <Info size={13} strokeWidth={2.2} />
            <span>Store pool: <strong>1% of actual weekly gross sales</strong> (pre-tax).</span>
          </div>
          <div className={styles.excludeRow}>
            <Info size={13} strokeWidth={2.2} />
            <span>Employee must have <strong>≥ {r.minWorkingDays} PRESENT days</strong> in the week. §8.5</span>
          </div>
          <div className={styles.excludeRow}>
            <Info size={13} strokeWidth={2.2} />
            <span>Ineligible payroll statuses: {r.ineligiblePayrollStatuses.join(', ').toLowerCase().replace(/_/g, ' ')}</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Split by store staffing</h2>
        <p className={styles.lede}>Store pool is split between Store Associates and managerial staff based on how many SMs/DMs are on the roster.</p>
        <div className={styles.splitMatrix}>
          <div className={styles.splitHead}>
            <span>Config</span>
            <span>SA pool</span>
            <span>SM share</span>
            <span>DM share</span>
          </div>
          {r.splitMatrix.map((m, i) => (
            <div key={i} className={styles.splitRow}>
              <span>{m.sms} SM · {m.dms} DM</span>
              <span>{Math.round(m.saPoolPct * 100)}%</span>
              <span>{Math.round(m.smSharePct * 100)}%</span>
              <span>{m.dms > 0 ? `${(m.dmSharePctEach * 100).toFixed(1)}% each` : '—'}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
