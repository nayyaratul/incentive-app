import cx from 'classnames';
import styles from './Heading.module.scss';

const levelStyleMap = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
};

export function Heading({
  level = 2,
  as,
  color,
  align,
  truncate = false,
  className,
  children,
  ...rest
}) {
  const Tag = as || `h${level}`;
  const styleKey = levelStyleMap[level] || 'h2';

  return (
    <Tag
      className={cx(
        styles.heading,
        styles[styleKey],
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
