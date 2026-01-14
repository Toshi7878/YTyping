"use client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { InfiniteScrollSpinner } from "@/components/shared/infinite-scroll-spinner";
import { MapCard } from "@/components/shared/map-card/card";
import { useMapListFilterQueryStates, useMapListSortQueryState } from "@/lib/search-params/map-list";
import { useTRPC } from "@/trpc/provider";
import { setIsSearching, useIsSearchingState } from "../_lib/atoms";

export const MapList = () => {
  const isSearching = useIsSearchingState();
  const trpc = useTRPC();
  const [filterParams] = useMapListFilterQueryStates();
  const [sortParams] = useMapListSortQueryState();

  const { data, ...pagination } = useSuspenseInfiniteQuery(
    trpc.mapList.get.infiniteQueryOptions(
      { ...filterParams, sort: sortParams },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        refetchOnWindowFocus: false,
        staleTime: Infinity,
        gcTime: Infinity,
      },
    ),
  );

  useEffect(() => {
    if (data) {
      setIsSearching(false);
    }
  }, [data]);

  return (
    <section className={isSearching ? "opacity-20" : ""}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {data.pages.map((page, pageIndex) =>
          page.items.map((map) => (
            <MapCard key={map.id} map={map} initialInView={data.pages.length - 1 === pageIndex} />
          )),
        )}
      </div>
      <InfiniteScrollSpinner {...pagination} />
    </section>
  );
};
