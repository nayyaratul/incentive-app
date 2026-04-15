import { forwardRef } from 'react';
import cx from 'classnames';
import styles from './Overlay.module.scss';

export const Overlay = forwardRef(function Overlay(
  {
    visible = true,
    onClick,
    className,
    ...rest
  },
  ref,
) {
  return (
    <div
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cx(
        styles.overlay,
        !visible && styles.hidden,
        className,
      )}
      onClick={onClick}
      {...rest}
    />
  );
});
