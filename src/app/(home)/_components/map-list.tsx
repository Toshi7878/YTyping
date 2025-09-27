"use client";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import MapLeftThumbnail from "@/components/shared/map-card-thumbnail";
import MapInfo from "@/components/shared/map-info/map-info";
import { CardWithContent } from "@/components/ui/card";
import Spinner from "@/components/ui/spinner";
import { useMapListQueryOptions } from "../../../utils/queries/map-list.queries";
import { useIsSearchingState, useSetIsSearching } from "../_lib/atoms";

const MapList = () => {
  const searchParams = useSearchParams();
  const isSearching = useIsSearchingState();
  const setIsSearchingAtom = useSetIsSearching();

  const { data, isFetchingNextPage, fetchNextPage, hasNextPage } = useSuspenseInfiniteQuery(
    useMapListQueryOptions().infiniteList(searchParams),
  );

  const { ref, inView } = useInView({ threshold: 0, rootMargin: "1800px 0px" });

  useEffect(() => {
    if (data) {
      setIsSearchingAtom(false);
    }
  }, [data]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <section className={isSearching ? "opacity-20" : ""}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {data.pages.map((page) =>
          page.maps.map((map) => {
            return (
              <CardWithContent key={map.id} variant="map">
                <MapLeftThumbnail alt={map.info.title} media={map.media} size="home" />
                <MapInfo map={map} />
              </CardWithContent>
            );
          }),
        )}
      </div>

      {hasNextPage && <Spinner ref={ref} />}
    </section>
  );
};

export default MapList;
