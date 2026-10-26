import { useState, useEffect } from 'react';

/**
 * Custom Hook to debounce any fast-changing value.
 * @param value The value to debounce (e.g. search input string)
 * @param delay Time in milliseconds to wait before updating (default: 300ms)
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancel the timer if value changes before delay has passed
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

