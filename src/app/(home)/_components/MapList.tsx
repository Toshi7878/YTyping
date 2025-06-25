"use client";
import SkeletonCard from "@/components/map-card/SkeletonCard";
import MapCardRightInfo from "@/components/map-card/child/MapCardRightInfo";
import MapInfo from "@/components/map-card/child/child/MapInfo";
import MapLeftThumbnail from "@/components/share-components/MapCardThumbnail";
import { CardWithContent } from "@/components/ui/card";
import Link from "@/components/ui/link/link";
import type { RouterOutPuts } from "@/server/api/trpc";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import type { MapListResponse } from "../../../utils/queries/mapList.queries";
import { useMapListQueryOptions } from "../../../utils/queries/mapList.queries";
import { useIsSearchingState, useSetIsSearching } from "../_lib/atoms";
import { PARAM_NAME } from "../_lib/const";

type MapCardInfo = RouterOutPuts["mapList"]["getByVideoId"][number];

const MapList = () => {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const isSearching = useIsSearchingState();
  const setIsSearchingAtom = useSetIsSearching();

  const { data, isFetching, isRefetching, isFetchingNextPage, fetchNextPage, hasNextPage } = useSuspenseInfiniteQuery(
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const isRandomSort = searchParams.get(PARAM_NAME.sort) === "random";

  const isRandomLoading = (isFetching || isRefetching) && isRandomSort && !isFetchingNextPage;

  if (isRandomLoading) {
    return <LoadingMapCard cardLength={10} />;
  }

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
                <MapCardRightInfo>
                  <MapLink mapId={map.id} />
                  <MapInfo map={map} />
                </MapCardRightInfo>
              </CardWithContent>
            );
          }),
        )}
      </MapCardLayout>

      {hasNextPage && (
        <div ref={ref}>
          <LoadingMapCard cardLength={2} />
        </div>
      )}
    </section>
  );
};

const MapCardLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{children}</div>;
};

const LoadingMapCard = ({ cardLength }: { cardLength: number }) => {
  return (
    <>
      {[...Array(cardLength)].map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </>
  );
};

const MapLink = ({ mapId }: { mapId: number }) => {
  return <Link className="absolute h-full w-full" href={`/type/${mapId}`} />;
};

export default MapList;
