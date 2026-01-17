"use client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { InfiniteScrollSpinner } from "@/components/shared/infinite-scroll-spinner";
import { MapCard } from "@/components/shared/map-card/card";
import { ThreeColumnCompactMapCard } from "@/components/shared/map-card/three-column-compact-card";
import { useMapListFilterQueryStates, useMapListSortQueryState } from "@/lib/search-params/map-list";
import { useTRPC } from "@/trpc/provider";
import { setIsSearching, useIsSearchingState, useListLayoutTypeState } from "../_lib/atoms";

export const MapList = () => {
  const isSearching = useIsSearchingState();
  const trpc = useTRPC();
  const listLayout = useListLayoutTypeState();
  const [filterParams] = useMapListFilterQueryStates();
  const [sortParams] = useMapListSortQueryState();
  const [imagePriority, setImagePriority] = useState(true);

  const { data, ...pagination } = useSuspenseInfiniteQuery(
    trpc.map.list.get.infiniteQueryOptions(
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

  useEffect(() => {
    if (pagination.isFetchedAfterMount) {
      setImagePriority(false);
    }
  }, [pagination.isFetchedAfterMount]);

  return (
    <section className={isSearching ? "opacity-20" : ""}>
      {listLayout === "THREE_COLUMNS" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.pages.map((page, pageIndex) =>
            page.items.map((map) => (
              <ThreeColumnCompactMapCard
                key={map.id}
                map={map}
                initialInView={data.pages.length - 1 === pageIndex}
                imagePriority={imagePriority}
              />
            )),
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {data.pages.map((page, pageIndex) =>
            page.items.map((map) => (
              <MapCard
                key={map.id}
                map={map}
                initialInView={data.pages.length - 1 === pageIndex}
                imagePriority={imagePriority}
              />
            )),
          )}
        </div>
      )}
      <InfiniteScrollSpinner
        rootMarginVariant={listLayout === "THREE_COLUMNS" ? "threeColumnMapList" : "default"}
        {...pagination}
      />
    </section>
  );
};
