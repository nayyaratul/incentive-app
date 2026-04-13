import React from 'react';
import { Calendar, Users } from 'lucide-react';
import styles from './VerticalViews.module.scss';
import { groceryCampaign } from '../../../data/configs';
import { formatINR } from '../../../utils/format';
import BadgesStrip from '../../../components/Widgets/BadgesStrip/BadgesStrip';
import QuestCard from '../../../components/Widgets/QuestCard/QuestCard';

export default function GroceryView({ payout, employee, store, role }) {
  const appliedRate = payout.appliedRate;
  const totalStoreIncentive = payout.totalStoreIncentive;
  const per = payout.individualPayout;
  const achievementPct = payout.achievementPct;

  return (
    <>
      {/* Campaign hero */}
      <section className={`${styles.pad} rise rise-2`}>
        <div className={styles.campaignCard}>
          <div className={styles.campEyebrowRow}>
            <span className={styles.campEyebrow}>Live campaign</span>
            <span className={styles.campBadge}>{groceryCampaign.incentiveType}</span>
          </div>
          <h2 className={styles.campTitle}>{groceryCampaign.campaignName}</h2>
          <p className={styles.campMeta}>
            <Calendar size={11} strokeWidth={2.2} />
            <span>{groceryCampaign.campaignStart} → {groceryCampaign.campaignEnd}</span>
            <span className={styles.dot}>·</span>
            <span>{groceryCampaign.geography}</span>
            <span className={styles.dot}>·</span>
            <span>{groceryCampaign.channel}</span>
          </p>

          <div className={styles.campGrid}>
            <div>
              <div className={styles.bigNum}>
                {achievementPct}<span className={styles.bigUnit}>%</span>
              </div>
              <div className={styles.bigCap}>of store target</div>
            </div>
            <div className={styles.campDivider} />
            <div>
              <div className={styles.miniFig}>{formatINR(payout.actualSalesValue)}</div>
              <div className={styles.miniCap}>of {formatINR(payout.targetSalesValue)}</div>
              <div className={styles.pieces}>{payout.piecesSoldTotal} pieces sold</div>
            </div>
          </div>

          <div className={styles.rateLine}>
            <span className={styles.rateLabel}>Current rate per piece</span>
            <span className={styles.rateVal}>
              {appliedRate === 0 ? 'Not yet unlocked' : `₹${appliedRate}`}
            </span>
          </div>

          <div className={styles.individualPayout}>
            <div>
              <div className={styles.payoutLabel}>Your payout so far</div>
              <div className={styles.payoutValue}>{formatINR(per)}</div>
            </div>
            <div className={styles.staffNote}>
              <Users size={11} strokeWidth={2.2} />
              <span>Split equally across {payout.staffCount} staff</span>
            </div>
          </div>
        </div>
      </section>

      {/* Slab ladder — what store needs to unlock each rate */}
      <section className={`${styles.pad} rise rise-3`}>
        <div className={styles.cardDark}>
          <div className={styles.cardHead}>
            <span className={styles.eyebrow}>Payout slabs · §7.2</span>
          </div>
          <div className={styles.slabGrid}>
            {payout.projections.map((p) => (
              <div key={p.scenario} className={styles.slabRow}>
                <div className={styles.slabLeft}>
                  <span className={styles.slabTitle}>{p.scenario}</span>
                  <span className={styles.slabAt}>at {formatINR(p.atSalesValue)}</span>
                </div>
                <div className={styles.slabMid}>
                  <span className={styles.slabRate}>₹{p.rate}/pc</span>
                </div>
                <div className={styles.slabRight}>
                  <span className={styles.slabTotal}>{formatINR(p.estPerEmployee)}</span>
                  <span className={styles.slabPer}>per employee</span>
                </div>
              </div>
            ))}
          </div>
          <p className={styles.slabFootnote}>
            Higher slab rates apply to <strong>all pieces sold</strong>, not just the incremental pieces above the threshold.
          </p>
        </div>
      </section>

      {/* Active quest */}
      <section className={`${styles.pad} rise rise-3`}>
        <QuestCard employeeId={employee.employeeId} />
      </section>

      {/* Badges */}
      <section className={`rise rise-4`}>
        <BadgesStrip employeeId={employee.employeeId} />
      </section>

      {/* Campaign leaderboard — 3 Kerala stores */}
      <section className={`${styles.pad} rise rise-4`}>
        <div className={styles.cardLight}>
          <div className={styles.cardHead}>
            <span className={styles.eyebrow}>Campaign leaderboard · Kerala</span>
          </div>
          <div className={styles.lbList}>
            {payout.campaignLeaderboard.map((r) => (
              <div key={r.storeCode} className={`${styles.lbRow} ${r.isSelf ? styles.lbSelf : ''}`}>
                <span className={styles.lbRank}>#{r.rank}</span>
                <div className={styles.lbBody}>
                  <div className={styles.lbName}>{r.storeName}</div>
                  <div className={styles.lbSub}>
                    {formatINR(r.actualSalesValue)} · {r.achievementPct}%
                  </div>
                </div>
                <span className={styles.lbPer}>{formatINR(r.perEmpAtCurrent)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligible articles list */}
      <section className={`${styles.pad} rise rise-5`}>
        <div className={styles.cardLight}>
          <div className={styles.cardHead}>
            <span className={styles.eyebrow}>Eligible articles ({groceryCampaign.eligibleArticles.length})</span>
          </div>
          <ul className={styles.artList}>
            <li><strong>Andree</strong> Butterscotch · Dates · Plum</li>
            <li><strong>Bakemill</strong> Chocolate · Coffee · Dates & Carrot · Jackfruit</li>
            <li><strong>Kairali</strong> Pudding CBD</li>
            <li><strong>Unibic</strong> Plum (Egg) · Veg Plum</li>
          </ul>
        </div>
      </section>

      {/* Compliance */}
      <section className={`${styles.pad} rise rise-5`}>
        <div className={styles.complianceCard}>
          <div className={styles.complianceHead}>
            <span>Distribution rule (§7.4)</span>
          </div>
          <ul>
            <li><span>Store incentive</span><strong>{formatINR(totalStoreIncentive)}</strong></li>
            <li><span>Total staff</span><strong>{payout.staffCount}</strong></li>
            <li><span>Per employee</span><strong>{formatINR(per)}</strong></li>
            <li><span>Role</span><strong>{role} · {employee?.employeeId}</strong></li>
          </ul>
        </div>
      </section>
    </>
  );
}
