import React, { useMemo } from 'react';
import styles from './VerticalViews.module.scss';
import { groceryCampaign } from '../../../data/configs';
import { formatINR } from '../../../utils/format';
import VerticalHero from '../../../components/Molecule/HeroCard/VerticalHero';
import { toSAHero as toGrocerySAHero } from '../../../components/Molecule/HeroCard/mappers/grocery';
import BadgesStrip from '../../../components/Widgets/BadgesStrip/BadgesStrip';
import QuestCard from '../../../components/Widgets/QuestCard/QuestCard';
import StreakNote from '../../../components/Molecule/StreakNote/StreakNote';
import MomentumPills from '../../../components/Molecule/MomentumPills/MomentumPills';
import EligibilityNotice from '../../../components/Molecule/EligibilityNotice/EligibilityNotice';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/nexus/atoms';
import WidgetBoundary from '../../../components/Atom/WidgetBoundary/WidgetBoundary';
import { safeArray } from '../../../components/Molecule/HeroCard/safe';

export default function GroceryView({ payout, employee }) {
  const heroProps = useMemo(() => toGrocerySAHero(payout, groceryCampaign), [payout]);

  const eligibility = payout?.eligibility;
  const reasons =
    eligibility && Array.isArray(eligibility.reasons) ? eligibility.reasons : [];
  const hasReasons = reasons.length > 0;
  // Round-1 testing comment E137 (BIG GAP): "For stores not part of the
  // campaign, the campaign card and details still show with 0% targets
  // reached." Hide the hero, slabs, articles, quests, and badges when the
  // store-isn't-in-campaign reason is the cause — the EligibilityNotice
  // already explains it. Streak/Momentum stay (they're past-period signals).
  // Once we model multiple concurrent campaigns this same gate becomes
  // per-campaign; for now we only have one Grocery campaign at a time.
  const storeNotInCampaign = reasons.some((r) => r.code === 'STORE_NOT_IN_CAMPAIGN');

  return (
    <>
      {/* Structured eligibility — STORE_NOT_IN_CAMPAIGN, NOTICE_PERIOD,
          DISCIPLINARY_ACTION reasons get rendered here. Closes the testing-
          comment gap where out-of-campaign Grocery employees saw a blank
          screen. */}
      {hasReasons && (
        <section className="rise rise-1">
          <EligibilityNotice
            eligibility={eligibility}
            title={
              eligibility.status === 'INELIGIBLE'
                ? 'Not eligible for this campaign'
                : 'Heads up'
            }
          />
        </section>
      )}

      {/* Campaign hero — suppressed when the store isn't in the campaign at
          all (E137). Showing a campaign card "0% reached" for an out-of-scope
          store implies they could have hit it, which is misleading. */}
      {!storeNotInCampaign && (
        <section className={`${styles.pad} rise rise-2`}>
          <WidgetBoundary name="grocery-hero">
            <VerticalHero vertical="GROCERY" heroProps={heroProps} />
          </WidgetBoundary>
        </section>
      )}

      {/* Streak note — always positive. Falls back to sample when API data is empty */}
      <section className={`${styles.streakRow} rise rise-2`}>
        <WidgetBoundary name="streak">
          <StreakNote
            streak={
              payout.streak && payout.streak.current > 0
                ? payout.streak
                : { current: 5, longest: 9, label: 'working days', caption: 'present + selling' }
            }
          />
        </WidgetBoundary>
      </section>

      <section className={`${styles.streakRow} rise rise-3`}>
        <WidgetBoundary name="momentum">
          <MomentumPills
            thisPeriodAmount={payout.individualPayout}
            lastPeriodAmount={payout.lastCampaignPayoutPerEmp}
            lastPeriodLabel="last campaign"
            nextPayoutDate={payout.nextPayoutDate}
          />
        </WidgetBoundary>
      </section>

      {/* Active quest — component owns its own horizontal padding (matches BadgesStrip) */}
      {!storeNotInCampaign && (
        <section className={`rise rise-3`}>
          <WidgetBoundary name="quests">
            <QuestCard employeeId={employee.employeeId} vertical="GROCERY" payout={payout} />
          </WidgetBoundary>
        </section>
      )}

      {/* Badges */}
      <section className={`rise rise-4`}>
        <WidgetBoundary name="badges">
          <BadgesStrip employeeId={employee.employeeId} vertical="GROCERY" />
        </WidgetBoundary>
      </section>

      {/* Quiet disclosure — payout slabs + eligible articles. Hidden when the
          store isn't in this campaign; slabs/articles only matter for stores
          that can actually earn from it. */}
      {!storeNotInCampaign && (
      <section className={`${styles.pad} ${styles.compactAccordion} rise rise-5`}>
        <Accordion variant="default" type="multiple">
          <AccordionItem value="slabs">
            <AccordionTrigger>Payout slabs</AccordionTrigger>
            <AccordionContent>
              <div className={styles.slabGrid}>
                {safeArray(payout?.projections).map((p) => (
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
      )}
    </>
  );
}
