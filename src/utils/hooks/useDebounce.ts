"use client";

import { useCallback, useRef, useState } from "react";

type Debounce = (fn: () => void | Promise<void>) => void;

interface UseDebounceReturn {
  debounce: Debounce;
  isPending: boolean;
  cancel: () => void;
}

export const useDebounce = (timeout: number): UseDebounceReturn => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPending, setIsPending] = useState(false);

  const debounce: Debounce = useCallback(
    (fn) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }

      setIsPending(true);

      timer.current = setTimeout(() => {
        void fn();
        setIsPending(false);
      }, timeout);
    },
    [timeout],
  );

  const cancel = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setIsPending(false);
  }, []);

  return { debounce, isPending, cancel };
};
