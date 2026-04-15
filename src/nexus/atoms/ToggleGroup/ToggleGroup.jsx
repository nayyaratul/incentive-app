import { forwardRef } from 'react';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import cx from 'classnames';
import styles from './ToggleGroup.module.scss';

export const ToggleGroup = forwardRef(function ToggleGroup(
  {
    type = 'single',
    value,
    defaultValue,
    onValueChange,
    orientation = 'horizontal',
    size = 'md',
    variant = 'outline',
    disabled = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <ToggleGroupPrimitive.Root
      ref={ref}
      type={type}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      orientation={orientation}
      disabled={disabled}
      className={cx(
        styles.group,
        orientation === 'vertical' && styles.vertical,
        className,
      )}
      data-size={size}
      data-variant={variant}
      {...rest}
    >
      {children}
    </ToggleGroupPrimitive.Root>
  );
});

export const ToggleGroupItem = forwardRef(function ToggleGroupItem(
  {
    value,
    disabled,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      value={value}
      disabled={disabled}
      className={cx(
        styles.item,
        className,
      )}
      {...rest}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});
