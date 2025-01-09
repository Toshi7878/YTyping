"use client";
import SkeletonCard from "@/components/map-card/SkeletonCard";
import MapCardRightInfo from "@/components/map-card/child/MapCardRightInfo";
import MapInfo from "@/components/map-card/child/child/MapInfo";
import MapLeftThumbnail from "@/components/share-components/MapCardThumbnail";
import { RouterOutPuts } from "@/server/api/trpc";
import { Box } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import nProgress from "nprogress";
import { useEffect } from "react";
import InfiniteScroll from "react-infinite-scroller";
import MapCard from "../../../components/map-card/MapCard";
import { useMapListInfiniteQuery } from "../hooks/useMapListInfiniteQuery";
import { HOME_THUBNAIL_HEIGHT, HOME_THUBNAIL_WIDTH } from "../ts/const/consts";
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

  const {
    data,
    error,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    status,
    refetch,
  } = useMapListInfiniteQuery();

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (!isFetching) {
      // ここに最初の取得に成功したときの処理を追加
      nProgress.done();
    }
  }, [isFetching]);

  if (status === "pending") {
    return <LoadingMapCard cardLength={10} />;
  }

  return (
    <InfiniteScroll
      loadMore={() => fetchNextPage()}
      loader={
        <Box key={0}>
          <LoadingMapCard cardLength={2} />
        </Box>
      }
      hasMore={hasNextPage}
      threshold={1800} // スクロールの閾値を追加
    >
      <MapCardLayout>
        {data?.pages.map((page: MapCardInfo[]) =>
          page.map((map: MapCardInfo) => {
            const src =
              map.thumbnailQuality === "maxresdefault"
                ? `https://i.ytimg.com/vi_webp/${map.videoId}/maxresdefault.webp`
                : `https://i.ytimg.com/vi/${map.videoId}/mqdefault.jpg`;

            return (
              <MapCard key={map.id}>
                <MapLeftThumbnail
                  alt={map.title}
                  fallbackSrc={`https://i.ytimg.com/vi/${map.videoId}/mqdefault.jpg`}
                  src={src}
                  mapVideoId={map.videoId}
                  mapPreviewTime={map.previewTime}
                  thumbnailQuality={map.thumbnailQuality}
                  thumnailWidth={HOME_THUBNAIL_WIDTH}
                  thumnailHeight={HOME_THUBNAIL_HEIGHT}
                />
                <MapCardRightInfo>
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
