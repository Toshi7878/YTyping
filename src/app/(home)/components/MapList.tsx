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
import InfiniteScroll from "react-infinite-scroller";
import MapCard from "../../../components/map-card/MapCard";
import { useMapListInfiniteQuery } from "../../../lib/global-hooks/query/useMapListInfiniteQuery";
import { useIsSearchingAtom, useSetIsSearchingAtom } from "../atoms/atoms";
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
  const isSearching = useIsSearchingAtom();
  const setIsSearchingAtom = useSetIsSearchingAtom();

  const { data, isFetching, isRefetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useMapListInfiniteQuery();

  useEffect(() => {
    if (data) {
      setIsSearchingAtom(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const isRandomSort = searchParams.get(PARAM_NAME.sort) === "random";

  const isRandomLoading = (isFetching || isRefetching) && isRandomSort && !isFetchingNextPage;

  if (isRandomLoading) {
    return <LoadingMapCard cardLength={10} />;
  }

  return (
    <InfiniteScroll
      className={isSearching ? "opacity-20" : ""}
      loadMore={() => fetchNextPage()}
      loader={
        <Box key={0}>
          <LoadingMapCard cardLength={2} />
        </Box>
      }
      hasMore={hasNextPage}
      threshold={1800}
    >
      <MapCardLayout>
        {data?.pages.map((page: MapCardInfo[]) =>
          page.map((map: MapCardInfo) => {
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
    </InfiniteScroll>
  );
}

export default MapList;
