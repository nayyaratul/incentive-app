import React from 'react';
import { Calendar } from 'lucide-react';
import styles from './VerticalViews.module.scss';
import { groceryCampaign } from '../../../data/configs';
import { formatINR, formatDateRange } from '../../../utils/format';
import HeroCard from '../../../components/Molecule/HeroCard/HeroCard';
import TargetTrendBreakdown from '../../../components/Molecule/TargetTrendBreakdown/TargetTrendBreakdown';
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

export default function GroceryView({ payout, employee }) {
  const achievementPct = payout.achievementPct;

  return (
    <>
      {/* Campaign hero */}
      <section className={`${styles.pad} rise rise-2`}>
        <HeroCard>
          <HeroCard.EyebrowRow>
            <HeroCard.Eyebrow withDot dotTone="live">Live campaign</HeroCard.Eyebrow>
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
          <HeroCard.AmountCap>of {formatINR(payout.targetSalesValue)} campaign target</HeroCard.AmountCap>

          <TargetTrendBreakdown
            actualValue={payout.actualSalesValue}
            targetValue={payout.targetSalesValue}
          />

          <HeroCard.Caption>
            <span>Pool unlocked</span>
            <strong>{formatINR(payout.totalStoreIncentive)}</strong>
          </HeroCard.Caption>

          <HeroCard.FooterBlock>
            <div>
              <HeroCard.FooterLabel>Your pieces sold</HeroCard.FooterLabel>
              <HeroCard.FooterValue>{payout.myPiecesSold}</HeroCard.FooterValue>
            </div>
            <div>
              <HeroCard.FooterLabel>Your payout</HeroCard.FooterLabel>
              <HeroCard.FooterValue>{formatINR(payout.individualPayout)}</HeroCard.FooterValue>
            </div>
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
        <QuestCard employeeId={employee.employeeId} vertical="GROCERY" payout={payout} />
      </section>

      {/* Badges */}
      <section className={`rise rise-4`}>
        <BadgesStrip employeeId={employee.employeeId} vertical="GROCERY" />
      </section>

      {/* Quiet disclosure — payout slabs + eligible articles */}
      <section className={`${styles.pad} ${styles.compactAccordion} rise rise-5`}>
        <Accordion variant="default" type="multiple">
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

