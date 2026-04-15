import cx from 'classnames';
import styles from './Skeleton.module.scss';

export function Skeleton({
  width,
  height,
  borderRadius,
  circle = false,
  count = 1,
  className,
  ...rest
}) {
  const style = {
    width: circle ? (width || height || 40) : width,
    height: circle ? (width || height || 40) : height,
    borderRadius: circle ? '50%' : borderRadius,
  };

  if (count <= 1) {
    return (
      <div
        className={cx(styles.skeleton, className)}
        style={style}
        aria-hidden="true"
        {...rest}
      />
    );
  }

  return (
    <div className={styles.stack} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={cx(styles.skeleton, className)}
          style={style}
          {...rest}
        />
      ))}
    </div>
  );
}
