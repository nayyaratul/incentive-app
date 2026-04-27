import React from 'react';
import HeroCard from '../HeroCard/HeroCard';
import { formatINR } from '../../../utils/format';

function formatSignedINR(amount) {
  if (!amount) return '₹0';
  const abs = formatINR(Math.abs(amount));
  return `${amount > 0 ? '+' : '-'}${abs}`;
}

function varianceLabel(variance) {
  if (variance > 0) return 'over target';
  if (variance < 0) return 'to clear';
  return 'on target';
}

function variancePctText(variance, target) {
  if (!target) return '';
  const pct = Math.abs((variance / target) * 100);
  return `${pct.toFixed(1)}% of target`;
}

export default function TargetTrendBreakdown({
  actualValue,
  targetValue,
  achievedLabel = 'sales achieved',
  targetLabel = 'target',
  // Round-1 testing comment E121: "When campaign is below 100%, the visual
  // doesn't make incompleteness obvious." When `incomplete` is true and the
  // actual is short of target, render the achieved figure with a danger tone
  // so it pops out against the target — calibrated to the existing design
  // tokens (--danger / --danger-text).
  incomplete = false,
}) {
  const target = Number(targetValue) || 0;
  const actual = Number(actualValue) || 0;
  const variance = actual - target;
  const pctText = variancePctText(variance, target);
  const showIncomplete = incomplete && actual < target;

  return (
    <>
      <HeroCard.Figures noBottomDivider>
        <HeroCard.Figure
          value={formatINR(actual)}
          cap={achievedLabel}
          tone={showIncomplete ? 'danger' : undefined}
        />
        <HeroCard.FigureDivider />
        <HeroCard.Figure
          value={formatINR(target)}
          cap={targetLabel}
        />
      </HeroCard.Figures>
      <HeroCard.Caption>
        <strong>{formatSignedINR(variance)}</strong>
        <span>{varianceLabel(variance)}</span>
        {pctText && <em>{pctText}</em>}
      </HeroCard.Caption>
    </>
  );
}
