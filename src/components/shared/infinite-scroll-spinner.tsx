import type { UseInfiniteQueryResult } from "@tanstack/react-query";
import { useEffect } from "react";
import { type IntersectionOptions, useInView } from "react-intersection-observer";
import { Spinner } from "../ui/spinner";

const ROOT_MARGIN_MAP = {
  default: { rootMargin: "1500px 0px" },
  resultListWithMap: { rootMargin: "2000px 0px" },
  notificationSheet: { threshold: 0.8 },
} as const;

type UseInfiniteScrollProps<TData = unknown, TError = unknown> = Pick<
  UseInfiniteQueryResult<TData, TError>,
  "isFetchingNextPage" | "fetchNextPage" | "hasNextPage"
>;

interface InfiniteScrollSpinnerProps {
  rootMarginVariant?: keyof typeof ROOT_MARGIN_MAP;
  className?: string;
}

export const InfiniteScrollSpinner = ({
  rootMarginVariant = "default",
  className,
  ...pagination
}: InfiniteScrollSpinnerProps & UseInfiniteScrollProps) => {
  const ref = useInfiniteScroll({
    ...pagination,
    ...ROOT_MARGIN_MAP[rootMarginVariant],
  });
  if (!pagination.hasNextPage) return null;

  return <Spinner ref={ref} className={className} />;
};

const useInfiniteScroll = ({
  isFetchingNextPage,
  fetchNextPage,
  hasNextPage,
  ...options
}: UseInfiniteScrollProps & IntersectionOptions) => {
  const { ref, inView } = useInView(options);

  useEffect(() => {
    if (!hasNextPage) return;
    if (!inView) return;
    if (isFetchingNextPage) return;
    void fetchNextPage();
  }, [hasNextPage, inView, isFetchingNextPage, fetchNextPage]);

  return ref;
};
