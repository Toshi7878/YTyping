"use client";
import MapInfo from "@/components/shared/map-info/MapInfo";
import MapLeftThumbnail from "@/components/shared/MapCardThumbnail";
import { CardWithContent } from "@/components/ui/card";
import Spinner from "@/components/ui/spinner";
import { RouterOutPuts } from "@/server/api/trpc";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useMapListQueryOptions } from "../../../utils/queries/mapList.queries";
import { useIsSearchingState, useSetIsSearching } from "../_lib/atoms";

const MapList = ({ list }: { list: RouterOutPuts["mapList"]["getList"] }) => {
  const searchParams = useSearchParams();
  const isSearching = useIsSearchingState();
  const setIsSearchingAtom = useSetIsSearching();

  const base = useMapListQueryOptions().infiniteList(searchParams);
  const { data, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery({
    ...base,
    initialData: { pages: [list], pageParams: [null] },
    initialPageParam: null,
  });

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "1800px 0px",
  });

  useEffect(() => {
    if (data) {
      setIsSearchingAtom(false);
    }
  }, [data]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!data.pages) return null;

  return (
    <section className={isSearching ? "opacity-20" : ""}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {data.pages.map((page) =>
          page.maps.map((map) => {
            return (
              <CardWithContent key={map.id} variant="map">
                <MapLeftThumbnail
                  alt={map.title}
                  src={`https://i.ytimg.com/vi/${map.video_id}/mqdefault.jpg`}
                  mapVideoId={map.video_id}
                  mapPreviewTime={map.preview_time}
                  size="home"
                />

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
