import type { UseInfiniteQueryResult } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView, useOnInView } from "react-intersection-observer";
import { Spinner } from "@/ui/spinner";

export const usePageCounter = ({ onEnter, pageIndex }: { onEnter: (page: number) => void; pageIndex: number }) => {
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      onEnter(pageIndex);
    }
  }, [inView, onEnter, pageIndex]);

  return ref;
};

type InfiniteScrollControls<TData = unknown, TError = unknown> = Pick<
  UseInfiniteQueryResult<TData, TError>,
  "fetchNextPage" | "hasNextPage"
>;

interface InfiniteScrollSpinnerProps {
  rootMarginY: `${number}px`;
  className?: string;
  root?: Element | null;
}

export const InfiniteScrollSpinner = ({
  rootMarginY,
  className,
  root,
  fetchNextPage,
  hasNextPage,
}: InfiniteScrollSpinnerProps & InfiniteScrollControls) => {
  const ref = useOnInView(
    (inView) => {
      if (!inView) return;
      void fetchNextPage();
    },
    { rootMargin: `${rootMarginY} 0px`, root },
  );

  if (!hasNextPage) return null;
  return <Spinner ref={ref} className={className} />;
};
