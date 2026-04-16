import React from 'react';
import cx from 'classnames';
import { TrendingUp, Check, X as XIcon } from 'lucide-react';
import { Card } from '@/nexus/molecules';
import { ProgressBar, Tag } from '@/nexus/atoms';
import styles from './HeroCard.module.scss';

/**
 * Unified hero card shell for every persona's primary metric card.
 *
 * Each vertical has a different incentive mechanic (Electronics = individual ₹,
 * Grocery = store achievement %, F&L = weekly pool share ₹) so the primary
 * metric varies — but the visual shell, type scale, and subcomponents are
 * shared via this compound component.
 *
 * Rebuilt on Nexus Card + design-system tokens.
 *
 * Example:
 *   <HeroCard>
 *     <HeroCard.EyebrowRow>
 *       <HeroCard.Eyebrow withDot>Earned this month</HeroCard.Eyebrow>
 *       <HeroCard.TrendPill>+₹1,200 today</HeroCard.TrendPill>
 *     </HeroCard.EyebrowRow>
 *     <HeroCard.Amount prefix="₹">45,000</HeroCard.Amount>
 *     <HeroCard.Caption>82% · of monthly goal · ₹10k to go</HeroCard.Caption>
 *     <HeroCard.Progress pct={82} />
 *   </HeroCard>
 */
export default function HeroCard({ ornament, children, className = '' }) {
  return (
    <Card variant="elevated" size="lg" className={cx(styles.hero, className)}>
      {ornament && <Ornament text={ornament} />}
      <div className={styles.content}>{children}</div>
    </Card>
  );
}

function Ornament({ text }) {
  return (
    <svg className={styles.ornament} viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <path id="hc-circ" d="M 60,60 m -48,0 a 48,48 0 1,1 96,0 a 48,48 0 1,1 -96,0" />
      </defs>
      <text fontFamily="var(--mono)" fontSize="8.5" letterSpacing="2.4" fill="currentColor">
        <textPath href="#hc-circ" startOffset="0">{text}&nbsp;{text}&nbsp;</textPath>
      </text>
    </svg>
  );
}

function EyebrowRow({ children, className = '' }) {
  return <div className={cx(styles.eyebrowRow, className)}>{children}</div>;
}

function Eyebrow({ withDot = false, children }) {
  return (
    <span className={styles.eyebrow}>
      {withDot && <span className={styles.dot} aria-hidden="true" />}
      {children}
    </span>
  );
}

function TrendPill({ icon: Icon = TrendingUp, children }) {
  return (
    <Tag variant="success" size="sm" icon={<Icon size={11} strokeWidth={2.4} />} className={styles.trendPill}>
      {children}
    </Tag>
  );
}

function QualifyPill({ qualifies, children }) {
  const Icon = qualifies ? Check : XIcon;
  return (
    <span className={cx(styles.qualifyPill, qualifies ? styles.qYes : styles.qNo)}>
      <Icon size={13} strokeWidth={2.6} />
      {children}
    </span>
  );
}

function HeroBadge({ children, tone = 'neutral' }) {
  return <span className={cx(styles.badge, styles[`tone-${tone}`])}>{children}</span>;
}

function Title({ children }) {
  return <h2 className={styles.title}>{children}</h2>;
}

function Meta({ children }) {
  return <p className={styles.meta}>{children}</p>;
}

function MetaDot() {
  return <span className={styles.metaDot} aria-hidden="true">·</span>;
}

function Amount({ prefix, suffix, children, tone }) {
  return (
    <div className={styles.amountRow}>
      <span className={cx(styles.amount, tone && styles[`amount-${tone}`])}>
        {prefix && <span className={cx(styles.amountAffix, styles.prefixAffix)}>{prefix}</span>}
        {children}
        {suffix && <span className={cx(styles.amountAffix, styles.suffixAffix)}>{suffix}</span>}
      </span>
    </div>
  );
}

function AmountCap({ children }) {
  return <div className={styles.amountCap}>{children}</div>;
}

function Caption({ children }) {
  return <p className={styles.caption}>{children}</p>;
}

function Progress({ pct, scale }) {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  return (
    <div className={styles.progress}>
      <ProgressBar value={clamped} max={100} size="md" className={styles.progressBar} />
      {scale && scale.length > 0 && (
        <div className={styles.scale} aria-hidden="true">
          {scale.map((s, i) => <span key={i}>{s}</span>)}
        </div>
      )}
    </div>
  );
}

function Figures({ children, dense = false, noBottomDivider = false }) {
  return (
    <div className={cx(styles.figures, dense && styles.dense, noBottomDivider && styles.noBottomDivider)}>
      {children}
    </div>
  );
}

function Figure({ label, value, cap, sub }) {
  return (
    <div className={styles.figure}>
      {label && <div className={styles.figLabel}>{label}</div>}
      <div className={styles.figValue}>{value}</div>
      {cap && <div className={styles.figCap}>{cap}</div>}
      {sub && <div className={styles.figSub}>{sub}</div>}
    </div>
  );
}

function FigureDivider() {
  return <div className={styles.figDivider} aria-hidden="true" />;
}

function HeroDivider() {
  return <div className={styles.divider} aria-hidden="true" />;
}

function FooterBlock({ children }) {
  return <div className={styles.footerBlock}>{children}</div>;
}

function FooterLabel({ children }) {
  return <div className={styles.footerLabel}>{children}</div>;
}

function FooterValue({ children }) {
  return <div className={styles.footerValue}>{children}</div>;
}

function FooterMeta({ children }) {
  return <div className={styles.footerMeta}>{children}</div>;
}

HeroCard.EyebrowRow = EyebrowRow;
HeroCard.Eyebrow = Eyebrow;
HeroCard.TrendPill = TrendPill;
HeroCard.QualifyPill = QualifyPill;
HeroCard.Badge = HeroBadge;
HeroCard.Title = Title;
HeroCard.Meta = Meta;
HeroCard.MetaDot = MetaDot;
HeroCard.Amount = Amount;
HeroCard.AmountCap = AmountCap;
HeroCard.Caption = Caption;
HeroCard.Progress = Progress;
HeroCard.Figures = Figures;
HeroCard.Figure = Figure;
HeroCard.FigureDivider = FigureDivider;
HeroCard.Divider = HeroDivider;
HeroCard.FooterBlock = FooterBlock;
HeroCard.FooterLabel = FooterLabel;
HeroCard.FooterValue = FooterValue;
HeroCard.FooterMeta = FooterMeta;
