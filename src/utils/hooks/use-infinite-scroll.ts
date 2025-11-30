import type { UseInfiniteQueryResult } from "@tanstack/react-query";
import type { IntersectionOptions } from "react-intersection-observer";
import { useOnInView } from "react-intersection-observer";

type UseInfiniteScrollProps<TData = unknown, TError = unknown> = Pick<
  UseInfiniteQueryResult<TData, TError>,
  "isFetchingNextPage" | "fetchNextPage" | "hasNextPage"
>;

export const useInfiniteScroll = (props: UseInfiniteScrollProps, options: IntersectionOptions = {}) => {
  const { isFetchingNextPage, fetchNextPage, hasNextPage } = props;
  const { rootMargin = "1500px 0px" } = options;

  return useOnInView(
    (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
    { rootMargin },
  );
};
