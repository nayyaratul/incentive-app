import { forwardRef } from 'react';
import cx from 'classnames';
import styles from './Input.module.scss';

export const Input = forwardRef(function Input(
  {
    type = 'text',
    size = 'md',
    disabled = false,
    error = false,
    className,
    ...rest
  },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cx(
        styles.input,
        styles[size],
        error && styles.error,
        className,
      )}
      disabled={disabled}
      aria-invalid={error || undefined}
      {...rest}
    />
  );
});
