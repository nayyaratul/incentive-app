import { forwardRef } from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import cx from 'classnames';
import styles from './ProgressBar.module.scss';

export const ProgressBar = forwardRef(function ProgressBar(
  {
    value = 0,
    max = 100,
    size = 'md',
    variant = 'default',
    className,
    ...rest
  },
  ref,
) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <ProgressPrimitive.Root
      ref={ref}
      value={value}
      max={max}
      className={cx(styles.track, styles[`track-${size}`], variant === 'subtle' && styles.trackSubtle, className)}
      {...rest}
    >
      <ProgressPrimitive.Indicator
        className={cx(styles.fill, styles[variant])}
        style={{ width: `${percentage}%` }}
      />
    </ProgressPrimitive.Root>
  );
});
