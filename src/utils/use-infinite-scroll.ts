import type { UseInfiniteQueryResult } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

type InfiniteScrollProps<TData = unknown, TError = unknown> = Pick<
  UseInfiniteQueryResult<TData, TError>,
  "isFetchingNextPage" | "fetchNextPage" | "hasNextPage"
>;

type InfiniteScrollOptions = {
  rootMargin?: string;
  threshold?: number;
};

export const useInfiniteScroll = <TData = unknown, TError = unknown>(
  props: InfiniteScrollProps<TData, TError>,
  options: InfiniteScrollOptions = {},
) => {
  const { isFetchingNextPage, fetchNextPage, hasNextPage } = props;
  const { rootMargin = "1800px 0px", threshold = 0 } = options;

  const { ref, inView } = useInView({ threshold, rootMargin });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return ref;
};
