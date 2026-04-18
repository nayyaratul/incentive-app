import React, { memo } from 'react';
import { Zap, Target, Lock, TrendingUp, Users, Clock } from 'lucide-react';
import HeroCard from './HeroCard';
import TargetTrendBreakdown from '../TargetTrendBreakdown/TargetTrendBreakdown';
import { formatINR } from '../../../utils/format';
import styles from './VerticalHero.module.scss';

function formatNum(n) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
}

const TIER_COLORS = {
  85: '#10B981',
  90: '#F59E0B',
  100: '#3B82F6',
  110: '#8B5CF6',
  120: '#EF4444',
};

/**
 * Electronics hero — unified SA and SM/DM view.
 *
 * Props shape: see `./mappers/electronics.js` output. The mapper is responsible
 * for producing a safe shape; this component assumes every numeric field is a
 * finite number.
 */
function ElectronicsHero(props) {
  const { context, primary, progress, milestones, _unlockPreview } = props;
  const role = context.role;

  // -------------------------------------------------------------------------
  // SA view (individual earnings)
  // -------------------------------------------------------------------------
  if (role === 'SA') {
    const earned = primary.amount;
    const isZeroState = earned === 0 && (progress.achievementPct > 0 || primary.potential > 0);
    const next = progress.gapToNext;
    const nextColor = next ? TIER_COLORS[next.atPct] || '#3B82F6' : null;

    return (
      <HeroCard ornament={isZeroState ? 'PAYOUT · LOCKED · KEEP PUSHING ·' : 'EARNINGS · MONTH · LIVE ·'}>
        <HeroCard.EyebrowRow>
          <HeroCard.Eyebrow withDot>Earned this month</HeroCard.Eyebrow>
          {primary.todayAmount > 0 && (
            <HeroCard.TrendPill>+{formatINR(primary.todayAmount)} today</HeroCard.TrendPill>
          )}
        </HeroCard.EyebrowRow>

        <HeroCard.Amount prefix="₹">{formatNum(earned)}</HeroCard.Amount>

        {/* Zero-state explainer */}
        {isZeroState && (
          <div className={styles.zeroExplainer}>
            <div className={styles.zeroReason}>
              <Lock size={13} strokeWidth={2.4} />
              <span>
                Dept. at <strong>{progress.achievementPct}%</strong> — needs <strong>{progress.unlockPct}%</strong> to unlock payout
              </span>
            </div>
            {primary.potential > 0 && (
              <div className={styles.zeroPotential}>
                <TrendingUp size={12} strokeWidth={2.2} />
                <span>Potential earnings: <strong>₹{formatNum(primary.potential)}</strong></span>
              </div>
            )}
            {next && next.amount > 0 && (
              <div className={styles.zeroNudge}>
                Push <strong>{next.amount.toFixed(1)}%</strong> more dept. sales to start earning
              </div>
            )}
          </div>
        )}

        {/* Normal-state caption */}
        {!isZeroState && (
          <HeroCard.Caption>
            <strong>{progress.achievementPct}%</strong>
            <span>· dept achievement ·</span>
            {progress.currentMultiplierPct > 0
              ? <em>{progress.currentMultiplierPct}% multiplier active</em>
              : <em>{next ? `${next.amount.toFixed(0)}% to go` : 'At target'}</em>}
          </HeroCard.Caption>
        )}

        {/* Potential row when earning but multiplier < 100% */}
        {!isZeroState && primary.potential > 0 && progress.currentMultiplierPct > 0 && progress.currentMultiplierPct < 100 && (
          <div className={styles.potentialRow}>
            <span className={styles.potentialLabel}>Potential at 100%</span>
            <span className={styles.potentialValue}>₹{formatNum(primary.potential)}</span>
          </div>
        )}

        <HeroCard.Progress
          pct={Math.min(100, Math.round((progress.achievementPct / progress.max) * 100))}
          scale={['0%', '85%', '100%', '120%']}
        />

        {/* Milestone countdown nudge */}
        {next && !isZeroState && (
          <div className={styles.milestone}>
            <div className={styles.milestoneIcon} style={{ '--ms-color': nextColor }}>
              <Target size={13} strokeWidth={2.6} />
            </div>
            <div className={styles.milestoneText}>
              <span className={styles.milestoneAmount}>
                Push {next.amount.toFixed(0)}%
              </span>
              <span className={styles.milestoneLabel}> to unlock </span>
              <span className={styles.milestoneName} style={{ color: nextColor }}>
                {next.nextMultiplierPct}% payout
              </span>
            </div>
            <div className={styles.milestonePct}>{next.atPct}%</div>
          </div>
        )}

        {/* Zero-state unlock preview */}
        {isZeroState && _unlockPreview && (
          <div className={styles.milestone}>
            <div className={styles.milestoneIcon} style={{ '--ms-color': '#10B981' }}>
              <Target size={13} strokeWidth={2.6} />
            </div>
            <div className={styles.milestoneText}>
              <span className={styles.milestoneLabel}>At {_unlockPreview.atPct}% → </span>
              <span className={styles.milestoneAmount}>₹{formatNum(_unlockPreview.estEarning)}</span>
              <span className={styles.milestoneLabel}> earned</span>
            </div>
            <div className={styles.milestonePct}>{_unlockPreview.multiplierPct}%</div>
          </div>
        )}

        {/* Milestone dots */}
        {milestones && milestones.length > 0 && !isZeroState && (
          <div className={styles.milestoneDots}>
            <Zap size={10} strokeWidth={2.6} className={styles.milestoneDotsIcon} />
            {milestones.map((m) => (
              <span
                key={m.id}
                className={`${styles.dot} ${m.crossed ? styles.dotCrossed : ''}`}
                title={m.label}
              />
            ))}
            <span className={styles.milestoneDotsLabel}>
              {milestones.filter((m) => m.crossed).length}/{milestones.length} milestones
            </span>
          </div>
        )}
      </HeroCard>
    );
  }

  // -------------------------------------------------------------------------
  // SM / DM view (store-level)
  // -------------------------------------------------------------------------
  const { pool, temporal } = props;
  const achPct = progress.achievementPct;

  return (
    <HeroCard>
      <HeroCard.EyebrowRow>
        <HeroCard.Eyebrow withDot>{context.periodLabel || 'Month to date'}</HeroCard.Eyebrow>
        {achPct >= 100 && <HeroCard.TrendPill>Target exceeded!</HeroCard.TrendPill>}
      </HeroCard.EyebrowRow>

      <HeroCard.Amount suffix="%" tone={primary.tone}>
        {achPct}
      </HeroCard.Amount>
      <HeroCard.AmountCap>of store period target</HeroCard.AmountCap>

      <TargetTrendBreakdown
        actualValue={progress.actual}
        targetValue={progress.target}
        extraCaption={
          progress.gapToNext && progress.gapToNext.amount > 0 ? (
            <>
              <span>·</span>
              <Target size={13} strokeWidth={2.2} />
              <strong>{formatINR(progress.gapToNext.amount)}</strong> more to hit target
            </>
          ) : null
        }
      />

      <HeroCard.FooterBlock>
        <div>
          <HeroCard.FooterLabel>Total store payout</HeroCard.FooterLabel>
          <HeroCard.FooterValue>{formatINR(pool?.storePool || 0)}</HeroCard.FooterValue>
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
          {temporal?.runRate && temporal.runRate.projectedPct > 0 && (
            <HeroCard.FooterMeta>
              <TrendingUp size={12} strokeWidth={2.2} />
              <span>On pace for {temporal.runRate.projectedPct}%</span>
            </HeroCard.FooterMeta>
          )}
        </HeroCard.FooterMetaGroup>
      </HeroCard.FooterBlock>
    </HeroCard>
  );
}

export default memo(ElectronicsHero);
