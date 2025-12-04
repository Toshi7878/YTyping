"use client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { useEffect } from "react";
import { MapCard } from "@/components/shared/map-card/card";
import { Spinner } from "@/components/ui/spinner";
import { mapListSearchParams } from "@/lib/search-params/map-list";
import { useTRPC } from "@/trpc/provider";
import { useInfiniteScroll } from "@/utils/hooks/intersection";
import { setIsSearching, useIsSearchingState } from "../_lib/atoms";

export const MapList = () => {
  const isSearching = useIsSearchingState();
  const trpc = useTRPC();
  const [params] = useQueryStates(mapListSearchParams);

  const { data, isFetchingNextPage, fetchNextPage, hasNextPage } = useSuspenseInfiniteQuery(
    trpc.mapList.get.infiniteQueryOptions(params, {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      gcTime: Infinity,
    }),
  );

  useEffect(() => {
    if (data) {
      setIsSearching(false);
    }
  }, [data]);

  const ref = useInfiniteScroll({ isFetchingNextPage, fetchNextPage, hasNextPage });

  return (
    <section className={isSearching ? "opacity-20" : ""}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {data.pages.map((page, pageIndex) =>
          page.items.map((map) => (
            <MapCard key={map.id} map={map} initialInView={data.pages.length - 1 === pageIndex} />
          )),
        )}
      </div>

      {hasNextPage && <Spinner ref={ref} />}
    </section>
  );
};
