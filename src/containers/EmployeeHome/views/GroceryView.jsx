import React from 'react';
import { Calendar, Users } from 'lucide-react';
import styles from './VerticalViews.module.scss';
import { groceryCampaign } from '../../../data/configs';
import { formatINR } from '../../../utils/format';
import HeroCard from '../../../components/Molecule/HeroCard/HeroCard';
import BadgesStrip from '../../../components/Widgets/BadgesStrip/BadgesStrip';
import QuestCard from '../../../components/Widgets/QuestCard/QuestCard';
import StreakNote from '../../../components/Molecule/StreakNote/StreakNote';
import MomentumPills from '../../../components/Molecule/MomentumPills/MomentumPills';
import ComplianceLink from '../../../components/Molecule/ComplianceLink/ComplianceLink';

export default function GroceryView({ payout, employee, store, role }) {
  const appliedRate = payout.appliedRate;
  const totalStoreIncentive = payout.totalStoreIncentive;
  const per = payout.individualPayout;
  const achievementPct = payout.achievementPct;

  return (
    <>
      {/* Campaign hero */}
      <section className={`${styles.pad} rise rise-2`}>
        <HeroCard>
          <HeroCard.EyebrowRow>
            <HeroCard.Eyebrow withDot>Live campaign</HeroCard.Eyebrow>
            <HeroCard.Badge tone="brand">{groceryCampaign.incentiveType}</HeroCard.Badge>
          </HeroCard.EyebrowRow>

          <HeroCard.Title>{groceryCampaign.campaignName}</HeroCard.Title>
          <HeroCard.Meta>
            <Calendar size={11} strokeWidth={2.2} />
            <span>{groceryCampaign.campaignStart} → {groceryCampaign.campaignEnd}</span>
            <HeroCard.MetaDot />
            <span>{groceryCampaign.geography}</span>
            <HeroCard.MetaDot />
            <span>{groceryCampaign.channel}</span>
          </HeroCard.Meta>

          <HeroCard.Amount suffix="%">{achievementPct}</HeroCard.Amount>
          <HeroCard.AmountCap>of store target</HeroCard.AmountCap>

          <HeroCard.Figures>
            <HeroCard.Figure
              value={formatINR(payout.actualSalesValue)}
              cap={`of ${formatINR(payout.targetSalesValue)}`}
              sub={`${payout.piecesSoldTotal} pieces sold`}
            />
            <HeroCard.FigureDivider />
            <HeroCard.Figure
              value={appliedRate === 0 ? '—' : `₹${appliedRate}`}
              cap="rate / piece"
              sub={appliedRate === 0 ? 'not yet unlocked' : 'current slab'}
            />
          </HeroCard.Figures>

          <HeroCard.FooterBlock>
            <div>
              <HeroCard.FooterLabel>Your payout so far</HeroCard.FooterLabel>
              <HeroCard.FooterValue>{formatINR(per)}</HeroCard.FooterValue>
            </div>
            <HeroCard.FooterMeta>
              <Users size={11} strokeWidth={2.2} />
              <span>Split equally across {payout.staffCount} staff</span>
            </HeroCard.FooterMeta>
          </HeroCard.FooterBlock>
        </HeroCard>
      </section>

      {/* Slab ladder — what store needs to unlock each rate */}
      <section className={`${styles.pad} rise rise-3`}>
        <div className={styles.cardDark}>
          <div className={styles.cardHead}>
            <span className={styles.eyebrow}>Payout slabs</span>
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

      {/* Streak note — always positive */}
      {payout.streak && payout.streak.current > 0 && (
        <section className={`${styles.streakRow} rise rise-2`}>
          <StreakNote streak={payout.streak} />
        </section>
      )}

      <section className={`${styles.streakRow} rise rise-3`}>
        <MomentumPills
          thisPeriodAmount={payout.individualPayout}
          lastPeriodAmount={payout.lastCampaignPayoutPerEmp}
          lastPeriodLabel="last campaign"
          nextPayoutDate={payout.nextPayoutDate}
        />
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

      {/* Compliance — demoted to quiet inline disclosure for consistency */}
      <section className={`${styles.pad} rise rise-5`}>
        <ComplianceLink
          label="Distribution rule & your record"
          items={[
            { label: 'Store incentive',  value: formatINR(totalStoreIncentive) },
            { label: 'Total staff',       value: String(payout.staffCount) },
            { label: 'Per employee',      value: formatINR(per) },
            { label: 'Role',              value: `${role} · ${employee?.employeeId}` },
            { label: 'Split rule',        value: 'Equal across SM, DM, SA, BA' },
          ]}
        />
      </section>
    </>
  );
}
