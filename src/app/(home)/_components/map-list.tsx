"use client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { useEffect } from "react";
import { MapCard } from "@/components/shared/map-card/card";
import { Spinner } from "@/components/ui/spinner";
import { mapListSearchParams } from "@/lib/queries/schema/map-list";
import { useTRPC } from "@/trpc/provider";
import { useInfiniteScroll } from "@/utils/hooks/use-infinite-scroll";
import { useIsSearchingState, useSetIsSearching } from "../_lib/atoms";

export const MapList = () => {
  const isSearching = useIsSearchingState();
  const setIsSearching = useSetIsSearching();
  const trpc = useTRPC();
  const [params] = useQueryStates(mapListSearchParams);

  const { data, isFetchingNextPage, fetchNextPage, hasNextPage } = useSuspenseInfiniteQuery(
    trpc.mapList.getList.infiniteQueryOptions(params, {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
      gcTime: Infinity,
    }),
  );

  useEffect(() => {
    if (data) {
      setIsSearching(false);
    }
  }, [setIsSearching, data]);

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
