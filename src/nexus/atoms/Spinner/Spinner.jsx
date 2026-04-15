import cx from 'classnames';
import styles from './Spinner.module.scss';

const sizeMap = {
  xs: 14,
  sm: 18,
  md: 24,
  lg: 32,
  xl: 48,
};

export function Spinner({
  size = 'md',
  variant = 'spin',
  className,
  'aria-label': ariaLabel = 'Loading',
  ...rest
}) {
  const px = sizeMap[size] || sizeMap.md;

  if (variant === 'dots') {
    return (
      <span
        className={cx(styles.dots, className)}
        role="status"
        aria-label={ariaLabel}
        {...rest}
      >
        <span className={styles.dot} />
        <span className={cx(styles.dot, styles.dotDelay1)} />
        <span className={cx(styles.dot, styles.dotDelay2)} />
      </span>
    );
  }

  return (
    <svg
      className={cx(styles.spinner, className)}
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label={ariaLabel}
      {...rest}
    >
      <circle
        className={styles.track}
        cx="12"
        cy="12"
        r="10"
        strokeWidth="3"
      />
      <circle
        className={styles.arc}
        cx="12"
        cy="12"
        r="10"
        strokeWidth="3"
        strokeDasharray="31.4 31.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
