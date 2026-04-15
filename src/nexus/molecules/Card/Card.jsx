import { forwardRef } from 'react';
import cx from 'classnames';
import { Heading } from '../../atoms/Heading/Heading';
import { Text } from '../../atoms/Text/Text';
import styles from './Card.module.scss';

export const Card = forwardRef(function Card(
  {
    variant = 'elevated',
    size = 'md',
    interactive = false,
    as,
    className,
    children,
    ...rest
  },
  ref,
) {
  const Tag = as || 'div';

  return (
    <Tag
      ref={ref}
      className={cx(
        styles.card,
        styles[variant],
        styles[size],
        interactive && styles.interactive,
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
});

const CardHeader = forwardRef(function CardHeader(
  { align = 'start', className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx(
        styles.header,
        align === 'center' && styles.headerAlignCenter,
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});

const CardBody = forwardRef(function CardBody(
  { className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx(styles.body, className)} {...rest}>
      {children}
    </div>
  );
});

const CardFooter = forwardRef(function CardFooter(
  { align = 'end', className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx(
        styles.footer,
        align === 'start' && styles.footerAlignStart,
        align === 'center' && styles.footerAlignCenter,
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});

const CardMedia = forwardRef(function CardMedia(
  { className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx(styles.media, className)} {...rest}>
      {children}
    </div>
  );
});

const CardTitle = function CardTitle({
  level = 6,
  align,
  color,
  className,
  children,
  ...rest
}) {
  return (
    <Heading
      level={level}
      align={align}
      color={color}
      className={cx(styles.title, className)}
      {...rest}
    >
      {children}
    </Heading>
  );
};

const CardEyebrow = function CardEyebrow({
  variant = 'overline',
  size = 'sm',
  weight = 'medium',
  color = 'var(--color-text-tertiary)',
  className,
  children,
  ...rest
}) {
  return (
    <Text
      variant={variant}
      size={size}
      weight={weight}
      color={color}
      className={cx(styles.eyebrow, className)}
      {...rest}
    >
      {children}
    </Text>
  );
};

const CardSubtitle = function CardSubtitle({
  variant = 'body',
  size = 'md',
  color = 'var(--color-text-secondary)',
  className,
  children,
  ...rest
}) {
  return (
    <Text
      variant={variant}
      size={size}
      color={color}
      className={cx(styles.subtitle, className)}
      {...rest}
    >
      {children}
    </Text>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Media = CardMedia;
Card.Title = CardTitle;
Card.Eyebrow = CardEyebrow;
Card.Subtitle = CardSubtitle;

