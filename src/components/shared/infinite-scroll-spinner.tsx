import type { UseInfiniteQueryResult } from "@tanstack/react-query";
import { type IntersectionOptions, useOnInView } from "react-intersection-observer";
import { Spinner } from "../ui/spinner";

const INFINITE_SCROLL_IN_VIEW_PRESETS = {
  default: { rootMargin: "1500px 0px" },
  threeColumnMapList: { rootMargin: "300px 0px" },
  resultListWithMap: { rootMargin: "2000px 0px" },
  notificationSheet: { threshold: 0.8 },
} as const satisfies Record<string, IntersectionOptions>;

type InfiniteScrollControls<TData = unknown, TError = unknown> = Pick<
  UseInfiniteQueryResult<TData, TError>,
  "fetchNextPage" | "hasNextPage"
>;

interface InfiniteScrollSpinnerProps {
  inViewPreset?: keyof typeof INFINITE_SCROLL_IN_VIEW_PRESETS;
  className?: string;
}

export const InfiniteScrollSpinner = ({
  inViewPreset = "default",
  className,
  fetchNextPage,
  hasNextPage,
}: InfiniteScrollSpinnerProps & InfiniteScrollControls) => {
  const ref = useInfiniteScroll(fetchNextPage, INFINITE_SCROLL_IN_VIEW_PRESETS[inViewPreset]);
  if (!hasNextPage) return null;

  return <Spinner ref={ref} className={className} />;
};

const useInfiniteScroll = (fetchNextPage: InfiniteScrollControls["fetchNextPage"], options: IntersectionOptions) => {
  return useOnInView((inView) => {
    if (inView) {
      void fetchNextPage();
    }
  }, options);
};
