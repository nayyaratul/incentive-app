import { icons } from 'lucide-react';
import cx from 'classnames';
import styles from './Icon.module.scss';

const sizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export function Icon({
  name,
  size = 'md',
  color,
  className,
  strokeWidth,
  'aria-label': ariaLabel,
  ...rest
}) {
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Icon "${name}" not found in Lucide`);
    }
    return null;
  }

  const px = sizeMap[size] || sizeMap.md;

  return (
    <LucideIcon
      size={px}
      strokeWidth={strokeWidth}
      className={cx(styles.icon, className)}
      style={color ? { color } : undefined}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
      role={ariaLabel ? 'img' : 'presentation'}
      {...rest}
    />
  );
}
