import React, { memo } from 'react';
import { Calendar, Users, Clock, Package } from 'lucide-react';
import HeroCard from './HeroCard';
import TargetTrendBreakdown from '../TargetTrendBreakdown/TargetTrendBreakdown';
import { formatINR, formatDateRange } from '../../../utils/format';

/**
 * Grocery hero — unified SA and SM/DM view.
 *
 * SA shows "Your payout"; SM shows same structure with store-level amounts and
 * a total-pool footer.
 */
function GroceryHero(props) {
  const { context, campaign, primary, progress, rate, pool, temporal, _individualPayout, _selfPayout } = props;
  const role = context.role;
  const isSM = role === 'SM' || role === 'DM';

  const daysLeft = temporal?.daysLeftInPeriod
    || (campaign?.end ? Math.max(0, Math.round((new Date(campaign.end) - new Date()) / (1000 * 60 * 60 * 24))) : 0);

  const footerPayout = isSM ? (_selfPayout || 0) : (_individualPayout || 0);
  const showStorePool = (pool?.storePool || 0) > 0;

  return (
    <HeroCard>
      <HeroCard.EyebrowRow>
        <HeroCard.Eyebrow withDot dotTone="live">Live campaign</HeroCard.Eyebrow>
        {progress.achievementPct >= 100 && <HeroCard.TrendPill>Target exceeded!</HeroCard.TrendPill>}
      </HeroCard.EyebrowRow>

      {campaign && (
        <>
          <HeroCard.Title>{campaign.title}</HeroCard.Title>
          <HeroCard.Meta>
            <Calendar size={11} strokeWidth={2.2} />
            <span>{formatDateRange(campaign.start, campaign.end)}</span>
            {campaign.geography && (
              <>
                <HeroCard.MetaDot />
                <span>{campaign.geography}</span>
              </>
            )}
            {campaign.channel && (
              <>
                <HeroCard.MetaDot />
                <span>{campaign.channel}</span>
              </>
            )}
          </HeroCard.Meta>
        </>
      )}

      <HeroCard.Amount suffix="%" tone={primary.tone}>
        {primary.amount}
      </HeroCard.Amount>
      <HeroCard.AmountCap>
        {primary.label || (progress.target > 0 ? `of ${formatINR(progress.target)} campaign target` : 'campaign target')}
      </HeroCard.AmountCap>

      {progress.target > 0 && (
        <TargetTrendBreakdown
          actualValue={progress.actual}
          targetValue={progress.target}
        />
      )}

      <HeroCard.Caption>
        <Package size={13} strokeWidth={2.2} />
        <strong>{(rate?.unitsSold || 0).toLocaleString('en-IN')}</strong> {rate?.unitLabel || 'pcs'} sold
        {rate?.appliedRate > 0 ? (
          <>
            <span>×</span>
            <strong>₹{rate.appliedRate}{rate.rateUnit}</strong>
            <span>=</span>
            <strong>{formatINR(pool?.storePool || 0)}</strong> store pool
          </>
        ) : (
          <span>· below 100% — no payout yet</span>
        )}
      </HeroCard.Caption>

      <HeroCard.FooterBlock>
        <div>
          <HeroCard.FooterLabel>{isSM ? 'Your payout so far' : 'Your payout'}</HeroCard.FooterLabel>
          <HeroCard.FooterValue>{formatINR(footerPayout)}</HeroCard.FooterValue>
        </div>
        <HeroCard.FooterMetaGroup>
          {showStorePool && (
            <HeroCard.FooterMeta>
              <Package size={12} strokeWidth={2.2} />
              <span>Store pool {formatINR(pool.storePool)} ÷ {pool.staffCount} staff</span>
            </HeroCard.FooterMeta>
          )}
          <HeroCard.FooterMeta>
            <Users size={12} strokeWidth={2.2} />
            <span>Split equally across {pool?.staffCount || 0} staff</span>
          </HeroCard.FooterMeta>
          {daysLeft > 0 && (
            <HeroCard.FooterMeta>
              <Clock size={12} strokeWidth={2.2} />
              <span>{daysLeft} days left</span>
            </HeroCard.FooterMeta>
          )}
        </HeroCard.FooterMetaGroup>
      </HeroCard.FooterBlock>
    </HeroCard>
  );
}

export default memo(GroceryHero);
