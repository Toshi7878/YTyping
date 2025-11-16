"use client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { useEffect } from "react";
import { MapCard } from "@/components/shared/map-card/card";
import { Spinner } from "@/components/ui/spinner";
import { mapListSearchParams } from "@/lib/search-params/map-list";
import { useTRPC } from "@/trpc/provider";
import { useInfiniteScroll } from "@/utils/hooks/use-infinite-scroll";
import { setIsSearching, useIsSearchingState } from "../_lib/atoms";

export const MapList = () => {
  const isSearching = useIsSearchingState();
  const trpc = useTRPC();
  const [params] = useQueryStates(mapListSearchParams);

  const { data, isFetchingNextPage, fetchNextPage, hasNextPage } = useSuspenseInfiniteQuery(
    trpc.mapList.get.infiniteQueryOptions(params, {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
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
          page.items.map((map) => {
            return <MapCard key={map.id} map={map} priority={pageIndex === 0} />;
          }),
        )}
      </div>

      {hasNextPage && <Spinner ref={ref} />}
    </section>
  );
};
