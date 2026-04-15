import { forwardRef } from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import cx from 'classnames';
import styles from './Toggle.module.scss';

export const Toggle = forwardRef(function Toggle(
  {
    pressed,
    onPressedChange,
    disabled = false,
    size = 'md',
    variant = 'default',
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <TogglePrimitive.Root
      ref={ref}
      pressed={pressed}
      onPressedChange={onPressedChange}
      disabled={disabled}
      className={cx(
        styles.toggle,
        styles[variant],
        styles[size],
        className,
      )}
      {...rest}
    >
      {children}
    </TogglePrimitive.Root>
  );
});
