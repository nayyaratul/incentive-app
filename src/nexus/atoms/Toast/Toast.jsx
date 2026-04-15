import { forwardRef } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import cx from 'classnames';
import styles from './Toast.module.scss';

export const ToastProvider = ToastPrimitive.Provider;

export const ToastViewport = forwardRef(function ToastViewport({ className, ...props }, ref) {
  return (
    <ToastPrimitive.Viewport
      ref={ref}
      className={cx(styles.viewport, className)}
      {...props}
    />
  );
});

export const Toast = forwardRef(function Toast(
  { variant = 'default', className, children, ...props },
  ref,
) {
  return (
    <ToastPrimitive.Root
      ref={ref}
      className={cx(styles.toast, styles[variant], className)}
      {...props}
    >
      {children}
    </ToastPrimitive.Root>
  );
});

export const ToastTitle = forwardRef(function ToastTitle({ className, ...props }, ref) {
  return (
    <ToastPrimitive.Title
      ref={ref}
      className={cx(styles.title, className)}
      {...props}
    />
  );
});

export const ToastDescription = forwardRef(function ToastDescription({ className, ...props }, ref) {
  return (
    <ToastPrimitive.Description
      ref={ref}
      className={cx(styles.description, className)}
      {...props}
    />
  );
});

export const ToastAction = forwardRef(function ToastAction({ className, ...props }, ref) {
  return (
    <ToastPrimitive.Action
      ref={ref}
      className={cx(styles.action, className)}
      {...props}
    />
  );
});

export const ToastClose = forwardRef(function ToastClose({ className, ...props }, ref) {
  return (
    <ToastPrimitive.Close
      ref={ref}
      className={cx(styles.close, className)}
      aria-label="Close"
      {...props}
    >
      <X size={14} />
    </ToastPrimitive.Close>
  );
});
