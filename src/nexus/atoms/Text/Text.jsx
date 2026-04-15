import cx from 'classnames';
import styles from './Text.module.scss';

export function Text({
  variant = 'body',
  size,
  weight,
  color,
  align,
  truncate = false,
  as,
  className,
  children,
  ...rest
}) {
  const Tag = as || (variant === 'caption' || variant === 'overline' || variant === 'micro' ? 'span' : 'p');

  return (
    <Tag
      className={cx(
        styles.text,
        styles[variant],
        size && styles[`size-${size}`],
        weight && styles[`weight-${weight}`],
        truncate && styles.truncate,
        className,
      )}
      style={{
        ...(color ? { color } : {}),
        ...(align ? { textAlign: align } : {}),
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
