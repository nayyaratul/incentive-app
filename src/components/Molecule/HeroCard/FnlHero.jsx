import React, { memo } from 'react';
import dayjs from 'dayjs';
import { Calendar, Target, Users, Clock } from 'lucide-react';
import HeroCard from './HeroCard';
import TargetTrendBreakdown from '../TargetTrendBreakdown/TargetTrendBreakdown';
import { formatINR } from '../../../utils/format';

function formatNum(n) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
}

/**
 * F&L hero — unified SA and SM/DM view with weekly / month-aggregate support.
 *
 * The hero is stateless with respect to period selection — the view owns the
 * ToggleGroup and passes the already-resolved `active` period through the
 * mapper. This keeps the hero pure and memoizable.
 */
function FnlHero(props) {
  const {
    context,
    primary,
    progress,
    pool,
    isMonthView,
    weekSummary,
    temporal,
    _footerAmountLabel,
    _footerAmount,
  } = props;

  const role = context.role;
  const isSA = role === 'SA';
  const qualifies = progress.achievementPct >= 100;

  const eyebrowLabel = isMonthView
    ? 'Month to date'
    : context.periodStart && context.periodEnd
      ? `${dayjs(context.periodStart).format('MMM D')} – ${dayjs(context.periodEnd).format('MMM D')}`
      : context.periodLabel || 'This week';

  return (
    <HeroCard>
      <HeroCard.EyebrowRow>
        <HeroCard.Eyebrow withDot>
          <Calendar size={11} strokeWidth={2.2} />
          {eyebrowLabel}
        </HeroCard.Eyebrow>
        {!isMonthView && (
          <HeroCard.QualifyPill qualifies={qualifies}>
            {qualifies ? 'Target met' : 'Below target'}
          </HeroCard.QualifyPill>
        )}
        {isMonthView && weekSummary && (
          <HeroCard.QualifyPill qualifies={weekSummary.weeksQualified > 0}>
            {weekSummary.weeksQualified}/{weekSummary.weeksTotal} weeks qualified
          </HeroCard.QualifyPill>
        )}
      </HeroCard.EyebrowRow>

      {isSA ? (
        <>
          <HeroCard.Amount prefix="₹">{formatNum(primary.amount)}</HeroCard.Amount>
          <HeroCard.AmountCap>{primary.label}</HeroCard.AmountCap>

          <HeroCard.Figures dense noBottomDivider>
            <HeroCard.Figure value={`${progress.achievementPct}%`} cap="achievement" />
            <HeroCard.FigureDivider />
            <HeroCard.Figure
              value={formatINR(progress.target)}
              cap={isMonthView ? 'total target' : 'store target'}
            />
            <HeroCard.FigureDivider />
            <HeroCard.Figure
              value={formatINR(progress.actual)}
              cap="actual sales"
            />
          </HeroCard.Figures>
        </>
      ) : (
        <>
          <HeroCard.Amount suffix="%" tone={primary.tone}>
            {primary.amount}
          </HeroCard.Amount>
          <HeroCard.AmountCap>{primary.label}</HeroCard.AmountCap>

          {progress.target > 0 && (
            <TargetTrendBreakdown
              actualValue={progress.actual}
              targetValue={progress.target}
              extraCaption={
                !qualifies && progress.gapToNext && progress.gapToNext.amount > 0 ? (
                  <>
                    <span>·</span>
                    <Target size={13} strokeWidth={2.2} />
                    <strong>{formatINR(progress.gapToNext.amount)}</strong> more to hit target
                  </>
                ) : null
              }
            />
          )}

          <HeroCard.FooterBlock>
            <div>
              <HeroCard.FooterLabel>{_footerAmountLabel || 'Total week payout'}</HeroCard.FooterLabel>
              <HeroCard.FooterValue>{formatINR(_footerAmount || 0)}</HeroCard.FooterValue>
            </div>
            <HeroCard.FooterMetaGroup>
              <HeroCard.FooterMeta>
                <Users size={12} strokeWidth={2.2} />
                <span>{pool?.staffCount || 0} staff</span>
              </HeroCard.FooterMeta>
              {typeof temporal?.daysLeftInPeriod === 'number' && temporal.daysLeftInPeriod > 0 && (
                <HeroCard.FooterMeta>
                  <Clock size={12} strokeWidth={2.2} />
                  <span>{temporal.daysLeftInPeriod} days left</span>
                </HeroCard.FooterMeta>
              )}
            </HeroCard.FooterMetaGroup>
          </HeroCard.FooterBlock>
        </>
      )}
    </HeroCard>
  );
}

export default memo(FnlHero);
