import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import cx from 'classnames';
import { X } from 'lucide-react';
import { Overlay } from '../atoms/Overlay/Overlay';
import { Heading } from '../atoms/Heading/Heading';
import { Text } from '../atoms/Text/Text';
import styles from './Modal.module.scss';

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
];

function useId(prefix = 'modal') {
  const [id] = useState(() => `${prefix}-${Math.random().toString(36).slice(2, 10)}`);
  return id;
}

export function Modal({
  open,
  onOpenChange,
  size = 'md',
  variant = 'default',
  placement = 'center',
  scrollBehavior = 'inside',
  alignFooter = 'end',
  showCloseButton = true,
  dismissible = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  initialFocusRef,
  title,
  description,
  truncateDescription = false,
  icon,
  footer,
  ariaLabel,
  ariaDescribedBy,
  className,
  children,
  ...rest
}) {
  const dialogRef = useRef(null);
  const id = useId('modal');
  const titleId = useMemo(() => (title ? `${id}-title` : undefined), [id, title]);
  const descriptionId = useMemo(
    () => (description ? `${id}-description` : undefined),
    [id, description],
  );

  const handleClose = useCallback(() => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  }, [onOpenChange]);

  const handleOverlayClick = useCallback(() => {
    if (!dismissible || !closeOnOverlayClick) return;
    handleClose();
  }, [dismissible, closeOnOverlayClick, handleClose]);

  const getFocusableElements = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog) return [];
    const nodes = dialog.querySelectorAll(FOCUSABLE_SELECTORS.join(','));
    return Array.from(nodes).filter(
      (el) =>
        !el.hasAttribute('disabled') &&
        el.getAttribute('aria-hidden') !== 'true' &&
        el.tabIndex !== -1,
    );
  }, []);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusables = getFocusableElements();
    const target =
      (initialFocusRef && initialFocusRef.current) ||
      (focusables.length ? focusables[0] : dialog);

    if (target && typeof target.focus === 'function') {
      target.focus();
    }
  }, [open, getFocusableElements, initialFocusRef]);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && dismissible && closeOnEsc) {
      event.preventDefault();
      event.stopPropagation();
      handleClose();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusables = getFocusableElements();
    if (!focusables.length) {
      event.preventDefault();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const current = document.activeElement;

    if (event.shiftKey) {
      if (current === first || !dialogRef.current.contains(current)) {
        event.preventDefault();
        last.focus();
      }
    } else if (current === last || !dialogRef.current.contains(current)) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!open) return null;

  const ariaLabelledBy = title ? titleId : undefined;
  const ariaLabelValue = !title ? ariaLabel : undefined;
  const ariaDescribedByValue = ariaDescribedBy || descriptionId;

  const rootClassName = cx(
    styles.root,
    placement === 'top' && styles.placementTop,
    scrollBehavior === 'inside' && styles.scrollInside,
  );

  const surfaceClassName = cx(
    styles.surface,
    styles[size],
    styles[variant],
    className,
  );

  const headerHasContent = icon || title || description || (dismissible && showCloseButton);

  const footerClassName = cx(
    styles.footer,
    alignFooter === 'start' && styles.footerAlignStart,
    alignFooter === 'center' && styles.footerAlignCenter,
  );

  const content = (
    <>
      <Overlay visible onClick={handleOverlayClick} />
      <div className={rootClassName}>
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={ariaLabelledBy}
          aria-label={ariaLabelValue}
          aria-describedby={ariaDescribedByValue}
          className={surfaceClassName}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          {...rest}
        >
          {headerHasContent && (
            <header className={styles.header}>
              <div className={styles.headerMain}>
                {icon && <span className={styles.icon}>{icon}</span>}
                <div className={styles.headerText}>
                  {title && (
                    <Heading
                      as="h2"
                      level={3}
                      id={titleId}
                      className={styles.title}
                    >
                      {title}
                    </Heading>
                  )}
                  {description && (
                    <Text
                      variant="body"
                      size="md"
                      id={descriptionId}
                      truncate={truncateDescription}
                      className={styles.description}
                    >
                      {description}
                    </Text>
                  )}
                </div>
              </div>
              {dismissible && showCloseButton && (
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={handleClose}
                  aria-label={
                    ariaLabel ||
                    (typeof title === 'string' ? `Close ${title}` : 'Close dialog')
                  }
                >
                  <X size={20} aria-hidden="true" />
                </button>
              )}
            </header>
          )}
          <div className={styles.body}>{children}</div>
          {footer && <footer className={footerClassName}>{footer}</footer>}
        </div>
      </div>
    </>
  );

  if (typeof document === 'undefined') {
    return content;
  }

  return createPortal(content, document.body);
}

