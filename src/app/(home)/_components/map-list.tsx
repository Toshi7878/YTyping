"use client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { MapCard } from "@/components/shared/map-card/card";
import { Spinner } from "@/components/ui/spinner";
import { useInfiniteScroll } from "@/utils/use-infinite-scroll";
import { useMapListQueryOptions } from "../../../utils/queries/map-list.queries";
import { useIsSearchingState, useSetIsSearching } from "../_lib/atoms";

export const MapList = () => {
  const searchParams = useSearchParams();
  const isSearching = useIsSearchingState();
  const setIsSearchingAtom = useSetIsSearching();

  const { data, isFetchingNextPage, fetchNextPage, hasNextPage } = useSuspenseInfiniteQuery(
    useMapListQueryOptions().infiniteList(searchParams),
  );

  useEffect(() => {
    if (data) {
      setIsSearchingAtom(false);
    }
  }, [data]);

  const ref = useInfiniteScroll({ isFetchingNextPage, fetchNextPage, hasNextPage });
  return (
    <section className={isSearching ? "opacity-20" : ""}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {data.pages.map((page) => page.maps.map((map) => <MapCard key={map.id} map={map} />))}
      </div>

      {hasNextPage && <Spinner ref={ref} />}
    </section>
  );
};
