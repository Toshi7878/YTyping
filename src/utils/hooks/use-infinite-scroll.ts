import type { UseInfiniteQueryResult } from "@tanstack/react-query";
import { useEffect } from "react";
import { type IntersectionOptions, useInView } from "react-intersection-observer";

type UseInfiniteScrollProps<TData = unknown, TError = unknown> = Pick<
  UseInfiniteQueryResult<TData, TError>,
  "isFetchingNextPage" | "fetchNextPage" | "hasNextPage"
>;

export const useInfiniteScroll = (props: UseInfiniteScrollProps, options: IntersectionOptions) => {
  const { isFetchingNextPage, fetchNextPage, hasNextPage } = props;
  const { rootMargin = "1500px 0px" } = options;
  const { ref, inView } = useInView({ ...options, rootMargin });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return ref;
};
