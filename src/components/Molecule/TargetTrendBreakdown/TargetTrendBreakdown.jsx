import React from 'react';
import HeroCard from '../HeroCard/HeroCard';
import { formatINR } from '../../../utils/format';

function formatINRCompact(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

function formatSignedINR(amount) {
  if (!amount) return '₹0';
  const abs = formatINR(Math.abs(amount));
  return `${amount > 0 ? '+' : '-'}${abs.replace('₹', '₹')}`;
}

function varianceLabel(variance) {
  if (variance > 0) return 'over target';
  if (variance < 0) return 'to clear';
  return 'on target';
}

function variancePctText(variance, target) {
  if (!target) return 'no target baseline';
  const pct = Math.abs((variance / target) * 100);
  return `${pct.toFixed(1)}% of target`;
}

export default function TargetTrendBreakdown({
  actualValue,
  targetValue,
  achievedLabel = 'sales achieved',
  targetLabel = 'target',
}) {
  const variance = (Number(actualValue) || 0) - (Number(targetValue) || 0);

  return (
    <HeroCard.Figures dense noBottomDivider>
      <HeroCard.Figure
        value={formatINRCompact(actualValue)}
        cap={achievedLabel}
        sub={formatINR(actualValue)}
      />
      <HeroCard.FigureDivider />
      <HeroCard.Figure
        value={formatINRCompact(targetValue)}
        cap={targetLabel}
        sub={formatINR(targetValue)}
      />
      <HeroCard.FigureDivider />
      <HeroCard.Figure
        value={formatSignedINR(variance)}
        cap={varianceLabel(variance)}
        sub={variancePctText(variance, targetValue)}
      />
    </HeroCard.Figures>
  );
}
