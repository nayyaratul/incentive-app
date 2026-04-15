import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import cx from 'classnames';
import { X } from 'lucide-react';
import { Overlay } from '../atoms/Overlay/Overlay';
import { Heading } from '../atoms/Heading/Heading';
import { Text } from '../atoms/Text/Text';
import styles from './Drawer.module.scss';

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
];

function useId(prefix = 'drawer') {
  const [id] = useState(() => `${prefix}-${Math.random().toString(36).slice(2, 10)}`);
  return id;
}

export function Drawer({
  open,
  onOpenChange,
  placement = 'end',
  size = 'md',
  height = 'auto',
  hasBackdrop = true,
  closeOnBackdropClick = true,
  closeOnEsc = true,
  dismissible = true,
  showCloseButton = true,
  title,
  subtitle,
  icon,
  headerActions,
  footer,
  ariaLabel,
  ariaDescribedBy,
  className,
  children,
  ...rest
}) {
  const panelRef = useRef(null);
  const id = useId('drawer');
  const titleId = useMemo(() => (title ? `${id}-title` : undefined), [id, title]);
  const subtitleId = useMemo(() => (subtitle ? `${id}-subtitle` : undefined), [id, subtitle]);

  const handleClose = useCallback(() => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  }, [onOpenChange]);

  const handleBackdropClick = useCallback(() => {
    if (!dismissible || !closeOnBackdropClick) return;
    handleClose();
  }, [dismissible, closeOnBackdropClick, handleClose]);

  const getFocusableElements = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return [];
    const nodes = panel.querySelectorAll(FOCUSABLE_SELECTORS.join(','));
    return Array.from(nodes).filter(
      (el) =>
        !el.hasAttribute('disabled') &&
        el.getAttribute('aria-hidden') !== 'true' &&
        el.tabIndex !== -1,
    );
  }, []);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    const focusables = getFocusableElements();
    const target = focusables.length ? focusables[0] : panel;

    if (target && typeof target.focus === 'function') {
      target.focus();
    }
  }, [open, getFocusableElements]);

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
      if (current === first || !panelRef.current.contains(current)) {
        event.preventDefault();
        last.focus();
      }
    } else if (current === last || !panelRef.current.contains(current)) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!open) return null;

  const ariaLabelledBy = title ? titleId : undefined;
  const ariaLabelValue = !title ? ariaLabel : undefined;
  const ariaDescribedByValue = ariaDescribedBy || subtitleId;

  const rootClassName = cx(
    styles.root,
    placement === 'start' && styles.placementStart,
    placement === 'end' && styles.placementEnd,
    placement === 'bottom' && styles.placementBottom,
  );

  const surfaceClassName = cx(
    styles.surface,
    styles[size],
    height === 'half' && styles.heightHalf,
    height === 'full' && styles.heightFull,
    className,
  );

  const headerHasContent =
    icon || title || subtitle || headerActions || (dismissible && showCloseButton);

  const content = (
    <>
      {hasBackdrop && <Overlay visible onClick={handleBackdropClick} />}
      <div className={rootClassName}>
        <div
          ref={panelRef}
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
                  {subtitle && (
                    <Text
                      variant="body"
                      size="sm"
                      id={subtitleId}
                      className={styles.subtitle}
                    >
                      {subtitle}
                    </Text>
                  )}
                </div>
              </div>
              {(headerActions || (dismissible && showCloseButton)) && (
                <div className={styles.headerActions}>
                  {headerActions}
                  {dismissible && showCloseButton && (
                    <button
                      type="button"
                      className={styles.closeButton}
                      onClick={handleClose}
                      aria-label={
                        ariaLabel ||
                        (typeof title === 'string' ? `Close ${title}` : 'Close drawer')
                      }
                    >
                      <X size={20} aria-hidden="true" />
                    </button>
                  )}
                </div>
              )}
            </header>
          )}
          <div className={styles.body}>{children}</div>
          {footer && <footer className={styles.footer}>{footer}</footer>}
        </div>
      </div>
    </>
  );

  if (typeof document === 'undefined') {
    return content;
  }

  return createPortal(content, document.body);
}

