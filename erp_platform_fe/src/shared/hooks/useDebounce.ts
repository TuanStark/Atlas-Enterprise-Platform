import { useState, useCallback } from 'react';

/**
 * useDebounce — Debounce a callback function
 *
 * Usage:
 *   const debouncedSearch = useDebounce((value: string) => fetchData(value), 300);
 */
export function useDebounce<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number,
): T {
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const newTimeoutId = setTimeout(() => {
        callback(...args);
      }, delay);

      setTimeoutId(newTimeoutId);
    },
    [callback, delay, timeoutId],
  ) as T;

  return debouncedCallback;
}
