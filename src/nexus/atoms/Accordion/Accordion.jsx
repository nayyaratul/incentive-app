import { forwardRef, createContext, useContext } from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import cx from 'classnames';
import styles from './Accordion.module.scss';

const AccordionContext = createContext('default');

export const Accordion = forwardRef(function Accordion(
  { variant = 'default', className, ...props },
  ref,
) {
  return (
    <AccordionContext.Provider value={variant}>
      <AccordionPrimitive.Root
        ref={ref}
        className={cx(styles.root, styles[variant], className)}
        {...props}
      />
    </AccordionContext.Provider>
  );
});

export const AccordionItem = forwardRef(function AccordionItem(
  { className, ...props },
  ref,
) {
  const variant = useContext(AccordionContext);
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cx(styles.item, styles[`item--${variant}`], className)}
      {...props}
    />
  );
});

export const AccordionTrigger = forwardRef(function AccordionTrigger(
  { icon: Icon, className, children, ...props },
  ref,
) {
  return (
    <AccordionPrimitive.Header className={styles.header}>
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cx(styles.trigger, className)}
        {...props}
      >
        <span className={styles.triggerContent}>
          {Icon && (
            <span className={styles.icon}>
              {typeof Icon === 'function' || Icon?.$$typeof ? <Icon size={18} /> : Icon}
            </span>
          )}
          {children}
        </span>
        <ChevronDown className={styles.chevron} size={16} aria-hidden />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});

export const AccordionContent = forwardRef(function AccordionContent(
  { className, children, ...props },
  ref,
) {
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className={cx(styles.content, className)}
      {...props}
    >
      <div className={styles.contentInner}>{children}</div>
    </AccordionPrimitive.Content>
  );
});
