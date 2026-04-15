import { useState } from 'react';
import cx from 'classnames';
import { User } from 'lucide-react';
import styles from './Avatar.module.scss';

const avatarHues = [
  { bg: 'var(--blue-10)',   color: 'var(--blue-60)' },
  { bg: 'var(--green-10)',  color: 'var(--green-60)' },
  { bg: 'var(--yellow-10)', color: 'var(--yellow-60)' },
  { bg: 'var(--red-10)',    color: 'var(--red-60)' },
  { bg: 'var(--cool-10)',   color: 'var(--cool-60)' },
];

function hashName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getInitials(name) {
  if (!name) return null;
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const iconSizeMap = { xs: 12, sm: 16, md: 20, lg: 24, xl: 32 };

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  online,
  className,
  ...rest
}) {
  const [imgError, setImgError] = useState(false);
  const showImage = src && !imgError;
  const initials = getInitials(name || alt);
  const hue = (name || alt) ? avatarHues[hashName(name || alt) % avatarHues.length] : null;

  return (
    <span
      className={cx(styles.avatar, styles[size], className)}
      style={!showImage && hue ? { background: hue.bg, color: hue.color } : undefined}
      role="img"
      aria-label={alt || name || 'Avatar'}
      {...rest}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt || name || ''}
          className={styles.image}
          onError={() => setImgError(true)}
        />
      ) : initials ? (
        <span className={styles.initials}>{initials}</span>
      ) : (
        <User size={iconSizeMap[size] || 20} strokeWidth={1.5} />
      )}
      {typeof online === 'boolean' && (
        <span
          className={cx(styles.indicator, online ? styles.online : styles.offline)}
          aria-label={online ? 'Online' : 'Offline'}
        />
      )}
    </span>
  );
}
