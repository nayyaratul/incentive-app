import React from 'react';
import { TrendingUp, Check, X as XIcon } from 'lucide-react';
import styles from './HeroCard.module.scss';

/**
 * Unified hero card shell for every persona's primary metric card.
 *
 * Each vertical has a different incentive mechanic (Electronics = individual ₹,
 * Grocery = store achievement %, F&L = weekly pool share ₹) so the primary
 * metric varies — but the visual shell, type scale, and subcomponents are
 * shared via this compound component.
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
    <div className={`${styles.hero} ${className}`}>
      {ornament && <Ornament text={ornament} />}
      <div className={styles.content}>{children}</div>
    </div>
  );
}

function Ornament({ text }) {
  return (
    <svg className={styles.ornament} viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <path id="hc-circ" d="M 60,60 m -48,0 a 48,48 0 1,1 96,0 a 48,48 0 1,1 -96,0" />
      </defs>
      <text fontFamily="Geist Mono" fontSize="8.5" letterSpacing="2.4" fill="currentColor">
        <textPath href="#hc-circ" startOffset="0">{text}&nbsp;{text}&nbsp;</textPath>
      </text>
    </svg>
  );
}

function EyebrowRow({ children, className = '' }) {
  return <div className={`${styles.eyebrowRow} ${className}`}>{children}</div>;
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
    <span className={styles.trendPill}>
      <Icon size={11} strokeWidth={2.4} />
      {children}
    </span>
  );
}

function QualifyPill({ qualifies, children }) {
  const Icon = qualifies ? Check : XIcon;
  return (
    <span className={`${styles.qualifyPill} ${qualifies ? styles.qYes : styles.qNo}`}>
      <Icon size={13} strokeWidth={2.6} />
      {children}
    </span>
  );
}

function Badge({ children, tone = 'neutral' }) {
  return <span className={`${styles.badge} ${styles[`tone-${tone}`]}`}>{children}</span>;
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
      {prefix && <span className={styles.amountSymbol}>{prefix}</span>}
      <span className={`${styles.amount} ${tone ? styles[`amount-${tone}`] : ''}`}>
        {children}
      </span>
      {suffix && <span className={styles.amountSymbol}>{suffix}</span>}
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
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {scale && scale.length > 0 && (
        <div className={styles.scale} aria-hidden="true">
          {scale.map((s, i) => <span key={i}>{s}</span>)}
        </div>
      )}
    </div>
  );
}

function Figures({ children, dense = false }) {
  return (
    <div className={`${styles.figures} ${dense ? styles.dense : ''}`}>
      {children}
    </div>
  );
}

function Figure({ value, cap, sub }) {
  return (
    <div className={styles.figure}>
      <div className={styles.figValue}>{value}</div>
      {cap && <div className={styles.figCap}>{cap}</div>}
      {sub && <div className={styles.figSub}>{sub}</div>}
    </div>
  );
}

function FigureDivider() {
  return <div className={styles.figDivider} aria-hidden="true" />;
}

function Divider() {
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
HeroCard.Badge = Badge;
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
HeroCard.Divider = Divider;
HeroCard.FooterBlock = FooterBlock;
HeroCard.FooterLabel = FooterLabel;
HeroCard.FooterValue = FooterValue;
HeroCard.FooterMeta = FooterMeta;
