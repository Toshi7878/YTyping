"use client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { useEffect, useRef } from "react";
import { MapCard } from "@/components/shared/map-card/card";
import { Spinner } from "@/components/ui/spinner";
import { useTRPC } from "@/trpc/provider";
import { mapListSearchParams } from "@/utils/queries/search-params/map-list";
import { useInfiniteScroll } from "@/utils/use-infinite-scroll";
import { useIsSearchingState, useSetIsSearching } from "../_lib/atoms";

export const MapList = () => {
  useSearchParamsTracker();
  const isSearching = useIsSearchingState();
  const setIsSearching = useSetIsSearching();
  const trpc = useTRPC();
  const [params] = useQueryStates(mapListSearchParams);

  const { data, isFetchingNextPage, fetchNextPage, hasNextPage, isFetching } = useSuspenseInfiniteQuery(
    trpc.mapList.getList.infiniteQueryOptions(params, {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
      gcTime: Infinity,
    }),
  );

  useEffect(() => {
    if (isFetching) {
      setIsSearching(false);
    }
  }, [isFetching, setIsSearching, data]);

  const ref = useInfiniteScroll({ isFetchingNextPage, fetchNextPage, hasNextPage });
  return (
    <section className={isSearching ? "opacity-20" : ""}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {data.pages.map((page) => page.items.map((map) => <MapCard key={map.id} map={map} />))}
      </div>

      {hasNextPage && <Spinner ref={ref} />}
    </section>
  );
};

const useSearchParamsTracker = () => {
  const [params] = useQueryStates(mapListSearchParams);
  const setIsSearching = useSetIsSearching();
  const prevParamsRef = useRef<string | null>(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    const current = JSON.stringify(params);

    if (!isMountedRef.current) {
      isMountedRef.current = true;
      prevParamsRef.current = current;
      return;
    }

    if (prevParamsRef.current !== current) {
      setIsSearching(true);
      prevParamsRef.current = current;
    }
  }, [params, setIsSearching]);
};
