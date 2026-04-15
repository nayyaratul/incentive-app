import cx from 'classnames';
import styles from './Divider.module.scss';

const spacingMap = {
  sm: { h: styles.spacingSm, v: styles.verticalSpacingSm },
  md: { h: styles.spacingMd, v: styles.verticalSpacingMd },
  lg: { h: styles.spacingLg, v: styles.verticalSpacingLg },
};

export function Divider({
  orientation = 'horizontal',
  variant = 'solid',
  label,
  spacing = 'md',
  className,
  ...rest
}) {
  const isVertical = orientation === 'vertical';
  const spacingClass = spacingMap[spacing]?.[isVertical ? 'v' : 'h'];

  // Labeled horizontal divider
  if (label && !isVertical) {
    return (
      <div
        role="separator"
        className={cx(styles.labeled, spacingClass, className)}
        {...rest}
      >
        <span className={cx(styles.labeledLine, styles[variant])} />
        <span className={styles.labelText}>{label}</span>
        <span className={cx(styles.labeledLine, styles[variant])} />
      </div>
    );
  }

  // Vertical divider
  if (isVertical) {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cx(styles.divider, styles.vertical, styles[variant], spacingClass, className)}
        {...rest}
      />
    );
  }

  // Default horizontal divider
  return (
    <hr
      className={cx(styles.divider, styles[variant], spacingClass, className)}
      {...rest}
    />
  );
}
