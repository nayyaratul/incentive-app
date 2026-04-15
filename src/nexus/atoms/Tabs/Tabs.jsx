import { forwardRef, createContext, useContext } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import cx from 'classnames';
import styles from './Tabs.module.scss';

const TabsContext = createContext({ variant: 'default', size: 'md' });

export const Tabs = forwardRef(function Tabs(
  {
    variant = 'default',
    size = 'md',
    defaultValue,
    value,
    onValueChange,
    orientation,
    className,
    ...rest
  },
  ref,
) {
  return (
    <TabsContext.Provider value={{ variant, size }}>
      <TabsPrimitive.Root
        ref={ref}
        defaultValue={defaultValue}
        value={value}
        onValueChange={onValueChange}
        orientation={orientation}
        className={cx(
          styles.root,
          styles[`root--${variant}`],
          orientation === 'vertical' && styles['root--vertical'],
          className,
        )}
        {...rest}
      />
    </TabsContext.Provider>
  );
});

export const TabsList = forwardRef(function TabsList(
  { className, ...rest },
  ref,
) {
  const { variant, size } = useContext(TabsContext);
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cx(
        styles.list,
        styles[`list--${variant}`],
        styles[`list--${size}`],
        className,
      )}
      {...rest}
    />
  );
});

export const TabsTrigger = forwardRef(function TabsTrigger(
  { value, disabled, icon: Icon, children, className, ...rest },
  ref,
) {
  const { variant, size } = useContext(TabsContext);
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      value={value}
      disabled={disabled}
      className={cx(
        styles.trigger,
        styles[`trigger--${variant}`],
        styles[`trigger--${size}`],
        className,
      )}
      {...rest}
    >
      {Icon && (
        <span className={styles.triggerIcon}>
          {typeof Icon === 'function' || Icon?.$$typeof ? (
            <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
          ) : (
            Icon
          )}
        </span>
      )}
      {children}
    </TabsPrimitive.Trigger>
  );
});

export const TabsContent = forwardRef(function TabsContent(
  { value, forceMount, children, className, ...rest },
  ref,
) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      value={value}
      forceMount={forceMount}
      className={cx(styles.content, className)}
      {...rest}
    >
      {children}
    </TabsPrimitive.Content>
  );
});
