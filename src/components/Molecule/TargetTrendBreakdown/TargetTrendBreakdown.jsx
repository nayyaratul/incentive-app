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
  extraCaption,
}) {
  const variance = (Number(actualValue) || 0) - (Number(targetValue) || 0);
  const pctText = variancePctText(variance, targetValue);

  return (
    <>
      <HeroCard.Figures noBottomDivider>
        <HeroCard.Figure
          value={formatINR(actualValue)}
          cap={achievedLabel}
        />
        <HeroCard.FigureDivider />
        <HeroCard.Figure
          value={formatINR(targetValue)}
          cap={targetLabel}
        />
      </HeroCard.Figures>
      <HeroCard.Caption>
        <strong>{formatSignedINR(variance)}</strong>
        <span>{varianceLabel(variance)}</span>
        {pctText && <em>{pctText}</em>}
        {extraCaption && <>{extraCaption}</>}
      </HeroCard.Caption>
    </>
  );
}
