import { Icon } from '../atoms/Icon/Icon';
import { Heading } from '../atoms/Heading/Heading';
import { Text } from '../atoms/Text/Text';
import { Button } from '../atoms/Button/Button';
import styles from './EmptyState.module.scss';
import cx from 'classnames';

function renderAction(action, key, variant = 'primary') {
  if (!action) return null;

  const { label, onClick, href, iconLeft, iconRight, ...rest } = action;
  const asLink = Boolean(href);

  if (asLink) {
    return (
      <Button
        key={key}
        as="a"
        href={href}
        variant={variant}
        iconLeft={iconLeft}
        iconRight={iconRight}
        {...rest}
      >
        {label}
      </Button>
    );
  }

  return (
    <Button
      key={key}
      variant={variant}
      onClick={onClick}
      iconLeft={iconLeft}
      iconRight={iconRight}
      {...rest}
    >
      {label}
    </Button>
  );
}

export function EmptyState({
  variant = 'default',
  size = 'section',
  iconName,
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  align = 'center',
  children,
  className,
  ...rest
}) {
  const showIcon = icon || iconName;

  return (
    <section
      className={cx(
        styles.root,
        styles[variant],
        styles[size],
        align === 'start' && styles.alignStart,
        className,
      )}
      aria-label={typeof title === 'string' ? title : undefined}
      {...rest}
    >
      {showIcon && (
        <div className={styles.icon} aria-hidden>
          {icon || <Icon name={iconName} size={size === 'inline' ? 'sm' : 'lg'} />}
        </div>
      )}

      {title && (
        <Heading as="h3" level={6} className={styles.title}>
          {title}
        </Heading>
      )}

      {description && (
        <Text variant="body" size="md" className={styles.description}>
          {description}
        </Text>
      )}

      {(primaryAction || secondaryAction) && (
        <div className={styles.actions}>
          {renderAction(primaryAction, 'primary', 'primary')}
          {renderAction(secondaryAction, 'secondary', 'ghost')}
        </div>
      )}

      {children && <div className={styles.extra}>{children}</div>}
    </section>
  );
}

