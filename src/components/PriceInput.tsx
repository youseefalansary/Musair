import React, { useState, useEffect, useRef } from 'react';

export interface PriceInputProps {
  value: number;
  onChange: (val: number) => void;
  className?: string;
  min?: number;
  max?: number;
  placeholder?: string;
  title?: string;
  disabled?: boolean;
  autoSelectOnFocus?: boolean;
  allowDecimals?: boolean;
  'aria-label'?: string;
}

/**
 * Normalizes Arabic-Indic (٠-٩) and Persian (۰-۹) digits to standard western digits (0-9).
 */
const normalizeDigits = (str: string): string => {
  return str
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776));
};

/**
 * Resilient numeric price input component that prevents the stuck zero issue.
 */
export const PriceInput: React.FC<PriceInputProps> = ({
  value,
  onChange,
  className = '',
  min = 0,
  max,
  placeholder = '0',
  title,
  disabled = false,
  autoSelectOnFocus = true,
  allowDecimals = false,
  'aria-label': ariaLabel,
}) => {
  const [displayValue, setDisplayValue] = useState<string>(() =>
    value === 0 ? '0' : String(value)
  );
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value === 0 ? '0' : String(value));
    } else {
      const parsed = displayValue.trim() === '' ? 0 : parseFloat(displayValue);
      if (!isNaN(parsed) && parsed !== value) {
        setDisplayValue(value === 0 ? '' : String(value));
      }
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = normalizeDigits(e.target.value);
    if (allowDecimals) {
      raw = raw.replace(/[^0-9.]/g, '');
      const parts = raw.split('.');
      if (parts.length > 2) {
        raw = parts[0] + '.' + parts.slice(1).join('');
      }
    } else {
      raw = raw.replace(/[^0-9]/g, '');
    }

    if (raw.length > 1 && raw.startsWith('0') && !raw.startsWith('0.')) {
      raw = raw.replace(/^0+/, '') || '0';
    }

    setDisplayValue(raw);

    if (raw === '') {
      onChange(min);
      return;
    }

    const numeric = parseFloat(raw);
    if (!isNaN(numeric)) {
      let clamped = Math.max(min, numeric);
      if (typeof max === 'number') {
        clamped = Math.min(max, clamped);
      }
      onChange(clamped);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (autoSelectOnFocus) {
      e.target.select();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (displayValue.trim() === '') {
      const fallback = String(min);
      setDisplayValue(fallback);
      onChange(min);
    } else {
      const numeric = parseFloat(displayValue);
      if (isNaN(numeric)) {
        const fallback = String(min);
        setDisplayValue(fallback);
        onChange(min);
      } else {
        let clamped = Math.max(min, numeric);
        if (typeof max === 'number') {
          clamped = Math.min(max, clamped);
        }
        setDisplayValue(String(clamped));
        onChange(clamped);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      inputRef.current?.blur();
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode={allowDecimals ? 'decimal' : 'numeric'}
      pattern={allowDecimals ? '[0-9]*[.]?[0-9]*' : '[0-9]*'}
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      title={title}
      disabled={disabled}
      aria-label={ariaLabel}
      className={className}
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
    />
  );
};
