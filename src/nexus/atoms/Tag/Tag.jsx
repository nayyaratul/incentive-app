import cx from 'classnames';
import { X } from 'lucide-react';
import styles from './Tag.module.scss';

export function Tag({
  variant = 'default',
  size = 'md',
  dismissible = false,
  onDismiss,
  icon,
  className,
  children,
  ...rest
}) {
  return (
    <span
      className={cx(styles.tag, styles[variant], styles[size], className)}
      {...rest}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{children}</span>
      {dismissible && (
        <button
          className={styles.dismiss}
          onClick={onDismiss}
          aria-label="Remove tag"
          type="button"
        >
          <X size={size === 'sm' ? 10 : 12} />
        </button>
      )}
    </span>
  );
}
