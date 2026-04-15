import { forwardRef } from 'react';
import cx from 'classnames';
import styles from './Button.module.scss';
import { Spinner } from '../Spinner/Spinner';

export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    shape = 'default',
    disabled = false,
    loading = false,
    fullWidth = false,
    iconOnly = false,
    iconLeft,
    iconRight,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      data-shape={shape}
      className={cx(
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        iconOnly && styles.iconOnly,
        loading && styles.loading,
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Spinner size="xs" className={styles.spinner} />}
      <span className={cx(styles.content, loading && styles.contentHidden)}>
        {iconLeft && <span className={styles.iconSlot}>{iconLeft}</span>}
        {children && <span>{children}</span>}
        {iconRight && <span className={styles.iconSlot}>{iconRight}</span>}
      </span>
    </button>
  );
});
