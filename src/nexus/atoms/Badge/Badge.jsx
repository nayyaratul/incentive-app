import cx from 'classnames';
import styles from './Badge.module.scss';

export function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  count,
  className,
  children,
  ...rest
}) {
  if (dot) {
    return (
      <span
        className={cx(styles.dot, styles[`dot-${variant}`], className)}
        role="status"
        {...rest}
      />
    );
  }

  const displayCount = typeof count === 'number'
    ? (count > 99 ? '99+' : String(count))
    : null;

  return (
    <span
      className={cx(
        styles.badge,
        styles[variant],
        styles[size],
        displayCount && styles.count,
        className,
      )}
      {...rest}
    >
      {displayCount || children}
    </span>
  );
}
