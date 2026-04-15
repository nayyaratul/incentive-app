import React from 'react';
import { Calendar, Users } from 'lucide-react';
import styles from './VerticalViews.module.scss';
import { groceryCampaign } from '../../../data/configs';
import { formatINR, formatDateRange } from '../../../utils/format';
import HeroCard from '../../../components/Molecule/HeroCard/HeroCard';
import BadgesStrip from '../../../components/Widgets/BadgesStrip/BadgesStrip';
import QuestCard from '../../../components/Widgets/QuestCard/QuestCard';
import StreakNote from '../../../components/Molecule/StreakNote/StreakNote';
import MomentumPills from '../../../components/Molecule/MomentumPills/MomentumPills';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/nexus/atoms';

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
            <span>{formatDateRange(groceryCampaign.campaignStart, groceryCampaign.campaignEnd)}</span>
            <HeroCard.MetaDot />
            <span>{groceryCampaign.geography}</span>
            <HeroCard.MetaDot />
            <span>{groceryCampaign.channel}</span>
          </HeroCard.Meta>

          <HeroCard.Amount suffix="%">{achievementPct}</HeroCard.Amount>
          <HeroCard.AmountCap>of {formatINR(payout.targetSalesValue)} store target</HeroCard.AmountCap>

          <HeroCard.Figures>
            <HeroCard.Figure
              value={formatINR(payout.actualSalesValue)}
              cap={salesCapText(achievementPct, payout.actualSalesValue, payout.targetSalesValue)}
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

      {/* Streak note — always positive. Falls back to sample when API data is empty */}
      <section className={`${styles.streakRow} rise rise-2`}>
        <StreakNote
          streak={
            payout.streak && payout.streak.current > 0
              ? payout.streak
              : { current: 5, longest: 9, label: 'working days', caption: 'present + selling' }
          }
        />
      </section>

      <section className={`${styles.streakRow} rise rise-3`}>
        <MomentumPills
          thisPeriodAmount={payout.individualPayout}
          lastPeriodAmount={payout.lastCampaignPayoutPerEmp}
          lastPeriodLabel="last campaign"
          nextPayoutDate={payout.nextPayoutDate}
        />
      </section>

      {/* Active quest — component owns its own horizontal padding (matches BadgesStrip) */}
      <section className={`rise rise-3`}>
        <QuestCard employeeId={employee.employeeId} vertical="GROCERY" />
      </section>

      {/* Badges */}
      <section className={`rise rise-4`}>
        <BadgesStrip employeeId={employee.employeeId} vertical="GROCERY" />
      </section>

      {/* Unified quiet disclosure — distribution rule, payout slabs, eligible articles.
          Default (line-separated) variant + subdued trigger styling so this footer
          metadata reads as quiet reference, not a primary content block. */}
      <section className={`${styles.pad} ${styles.compactAccordion} rise rise-5`}>
        <Accordion variant="default" type="multiple">
          <AccordionItem value="distribution">
            <AccordionTrigger>Distribution rule & your record</AccordionTrigger>
            <AccordionContent>
              <dl className={styles.compactList}>
                {[
                  { label: 'Store incentive', value: formatINR(totalStoreIncentive) },
                  { label: 'Total staff',     value: String(payout.staffCount) },
                  { label: 'Per employee',    value: formatINR(per) },
                  { label: 'Role',            value: `${role} · ${employee?.employeeId}` },
                  { label: 'Split rule',      value: 'Equal across SM, DM, SA, BA' },
                ].map((it) => (
                  <div key={it.label} className={styles.compactRow}>
                    <dt className={styles.compactLabel}>{it.label}</dt>
                    <dd className={styles.compactValue}>{it.value}</dd>
                  </div>
                ))}
              </dl>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="slabs">
            <AccordionTrigger>Payout slabs</AccordionTrigger>
            <AccordionContent>
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
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="articles">
            <AccordionTrigger>
              Eligible articles ({groceryCampaign.eligibleArticles.length})
            </AccordionTrigger>
            <AccordionContent>
              <ul className={styles.artList}>
                <li><strong>Andree</strong> Butterscotch · Dates · Plum</li>
                <li><strong>Bakemill</strong> Chocolate · Coffee · Dates & Carrot · Jackfruit</li>
                <li><strong>Kairali</strong> Pudding CBD</li>
                <li><strong>Unibic</strong> Plum (Egg) · Veg Plum</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </>
  );
}

// Cap line for the sales figure. Target value is already shown in the amount
// cap up top ("of ₹67,000 store target") and achievement % is the big number,
// so this cap only carries the gap-to-target or over-target delta — never
// repeats the target value or the percentage.
function salesCapText(achievementPct, actualSalesValue, targetSalesValue) {
  if (achievementPct < 100) {
    const gap = targetSalesValue - actualSalesValue;
    return `${formatINR(gap)} to clear`;
  }
  const over = actualSalesValue - targetSalesValue;
  if (over > 0) return `+${formatINR(over)} over`;
  return 'target cleared';
}
