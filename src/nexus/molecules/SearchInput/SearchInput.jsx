import { forwardRef, useState, useRef, useCallback } from 'react';
import cx from 'classnames';
import { Input } from '../atoms/Input/Input';
import { Icon } from '../atoms/Icon/Icon';
import { Spinner } from '../atoms/Spinner/Spinner';
import styles from './SearchInput.module.scss';

export const SearchInput = forwardRef(function SearchInput(
  {
    value,
    defaultValue,
    onChange,
    onSubmit,
    onClear,
    onKeyDown,
    size = 'md',
    disabled = false,
    error = false,
    icon,
    showClear = true,
    loading = false,
    className,
    style,
    ...rest
  },
  ref,
) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const inputRef = useRef(null);

  const currentValue = isControlled ? value : internalValue;

  const setInputRef = useCallback(
    (node) => {
      inputRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

  const handleChange = (event) => {
    if (!isControlled) {
      setInternalValue(event.target.value);
    }
    onChange?.(event);
  };

  const handleKeyDown = (event) => {
    if (onKeyDown) {
      onKeyDown(event);
    }
    if (event.defaultPrevented) return;
    if (event.key === 'Enter' && onSubmit) {
      onSubmit(currentValue ?? '', event);
    }
  };

  const handleClear = (event) => {
    if (isControlled) {
      onChange?.({ target: { value: '' } });
    } else {
      setInternalValue('');
    }

    onClear?.(event);
    if (event.defaultPrevented) return;
    if (!disabled && inputRef.current && typeof inputRef.current.focus === 'function') {
      inputRef.current.focus();
    }
  };

  const resolvedIcon =
    icon === undefined ? <Icon name="Search" size="sm" aria-hidden /> : icon || null;

  const hasLeftIcon = Boolean(resolvedIcon);
  const showClearButton =
    showClear && !loading && !disabled && typeof currentValue === 'string' && currentValue.length > 0;

  const rootClassName = cx(
    styles.root,
    styles[size],
    error && styles.error,
    disabled && styles.disabled,
    className,
  );

  const inputClassName = cx(
    styles.input,
    hasLeftIcon && styles.inputWithIconLeft,
    (showClearButton || loading) && styles.inputWithIconRight,
  );

  return (
    <div className={rootClassName} style={style}>
      <Input
        ref={setInputRef}
        type="search"
        size={size}
        disabled={disabled}
        error={error}
        value={isControlled ? currentValue : undefined}
        defaultValue={isControlled ? undefined : internalValue}
        className={inputClassName}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        role="searchbox"
        {...rest}
      />
      {hasLeftIcon && (
        <span className={cx(styles.icon, styles.left)}>
          {resolvedIcon}
        </span>
      )}
      {loading && (
        <span className={styles.spinner} aria-hidden>
          <Spinner size="sm" />
        </span>
      )}
      {!loading && showClearButton && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={handleClear}
          disabled={disabled}
          aria-label="Clear search"
        >
          <Icon name="X" size="sm" aria-hidden />
        </button>
      )}
    </div>
  );
});

