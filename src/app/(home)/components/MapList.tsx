"use client";
import SkeletonCard from "@/components/map-card/SkeletonCard";
import MapCardRightInfo from "@/components/map-card/child/MapCardRightInfo";
import MapInfo from "@/components/map-card/child/child/MapInfo";
import MapLink from "@/components/map-card/child/child/MapLink";
import MapLeftThumbnail from "@/components/share-components/MapCardThumbnail";
import { RouterOutPuts } from "@/server/api/trpc";
import { Box } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import MapCard from "../../../components/map-card/MapCard";
import { MapListResponse, useMapListInfiniteQuery } from "../../../util/global-hooks/query/useMapListQuery";
import { useIsSearchingState, useSetIsSearching } from "../atoms/atoms";
import { HOME_THUBNAIL_HEIGHT, HOME_THUBNAIL_WIDTH, PARAM_NAME } from "../ts/consts";
import MapCardLayout from "./MapCardLayout";

type MapCardInfo = RouterOutPuts["map"]["getCreatedVideoIdMapList"][number];

function LoadingMapCard({ cardLength }: { cardLength: number }) {
  return (
    <MapCardLayout>
      {[...Array(cardLength)].map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </MapCardLayout>
  );
}

function MapList() {
  const searchParams = useSearchParams();
  const isSearching = useIsSearchingState();
  const setIsSearchingAtom = useSetIsSearching();

  const { data, isFetching, isRefetching, isFetchingNextPage, fetchNextPage, hasNextPage } = useMapListInfiniteQuery();

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
    <div className={isSearching ? "opacity-20" : ""}>
      <MapCardLayout>
        {data.pages.map((page: MapListResponse) =>
          page.maps.map((map: MapCardInfo) => {
            const src =
              map.thumbnail_quality === "maxresdefault"
                ? `https://i.ytimg.com/vi_webp/${map.video_id}/maxresdefault.webp`
                : `https://i.ytimg.com/vi/${map.video_id}/mqdefault.jpg`;

            return (
              <MapCard key={map.id}>
                <MapLeftThumbnail
                  alt={map.title}
                  fallbackSrc={`https://i.ytimg.com/vi/${map.video_id}/mqdefault.jpg`}
                  src={src}
                  mapVideoId={map.video_id}
                  mapPreviewTime={map.preview_time}
                  thumbnailQuality={map.thumbnail_quality}
                  thumnailWidth={HOME_THUBNAIL_WIDTH}
                  thumnailHeight={HOME_THUBNAIL_HEIGHT}
                />
                <MapCardRightInfo>
                  <MapLink mapId={map.id} />
                  <MapInfo map={map} />
                </MapCardRightInfo>
              </MapCard>
            );
          })
        )}
      </MapCardLayout>

      {hasNextPage && (
        <Box ref={ref}>
          <LoadingMapCard cardLength={2} />
        </Box>
      )}
    </div>
  );
}

export default MapList;
