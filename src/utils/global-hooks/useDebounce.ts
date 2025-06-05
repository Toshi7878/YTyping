import { useCallback, useRef } from "react";

type Debounce = (fn: () => void) => void;

export const useDebounce = (timeout: number): Debounce => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounce: Debounce = useCallback(
    (fn) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => {
        fn();
      }, timeout);
    },
    [timeout]
  );

  return debounce;
};

import { useEffect, useState } from "react";

export function useDebounceState<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
