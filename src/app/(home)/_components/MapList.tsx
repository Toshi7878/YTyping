"use client";
import MapInfo from "@/components/shared/map-info/MapInfo";
import MapLeftThumbnail from "@/components/shared/MapCardThumbnail";
import { CardWithContent } from "@/components/ui/card";
import Spinner from "@/components/ui/spinner";
import type { RouterOutPuts } from "@/server/api/trpc";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import type { MapListResponse } from "../../../utils/queries/mapList.queries";
import { useMapListQueryOptions } from "../../../utils/queries/mapList.queries";
import { useIsSearchingState, useSetIsSearching } from "../_lib/atoms";

type MapCardInfo = RouterOutPuts["mapList"]["getByVideoId"][number];

const MapList = () => {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const isSearching = useIsSearchingState();
  const setIsSearchingAtom = useSetIsSearching();

  const { data, isFetchingNextPage, fetchNextPage, hasNextPage } = useSuspenseInfiniteQuery(
    useMapListQueryOptions().infiniteList(session, searchParams),
  );

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

  return (
    <section className={isSearching ? "opacity-20" : ""}>
      <MapCardLayout>
        {data.pages.map((page: MapListResponse) =>
          page.maps.map((map: MapCardInfo) => {
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
      </MapCardLayout>

      {hasNextPage && <Spinner ref={ref} />}
    </section>
  );
};

const MapCardLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{children}</div>;
};

export default MapList;
