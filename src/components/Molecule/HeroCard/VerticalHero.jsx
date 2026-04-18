import React, { memo } from 'react';
import ElectronicsHero from './ElectronicsHero';
import GroceryHero from './GroceryHero';
import FnlHero from './FnlHero';

/**
 * VerticalHero — router that dispatches to the correct per-vertical hero.
 *
 * Usage:
 *   const heroProps = useMemo(() => toSAHero(payout), [payout]);
 *   <VerticalHero vertical="ELECTRONICS" heroProps={heroProps} />
 *
 * The `heroProps` object must be produced by a mapper from
 * `./mappers/{electronics,grocery,fnl}.js`. The mapper is responsible for
 * guaranteeing a safe shape — this router is a thin switch.
 *
 * Why a switch over conditional imports: per-vertical chunks are tiny (~5KB
 * each) and the home container renders exactly one at a time, so the code-
 * split benefit is marginal and the webpack chunk overhead isn't worth it.
 * If bundle audit ever shows this is a hot spot, swap to React.lazy here.
 */
function VerticalHero({ vertical, heroProps }) {
  if (!heroProps) return null;

  switch (vertical) {
    case 'ELECTRONICS':
      return <ElectronicsHero {...heroProps} />;
    case 'GROCERY':
      return <GroceryHero {...heroProps} />;
    case 'FNL':
      return <FnlHero {...heroProps} />;
    default:
      // eslint-disable-next-line no-console
      console.warn(`[VerticalHero] unknown vertical: ${vertical}`);
      return null;
  }
}

export default memo(VerticalHero);
