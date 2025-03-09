"use client";
import SkeletonCard from "@/components/map-card/SkeletonCard";
import MapCardRightInfo from "@/components/map-card/child/MapCardRightInfo";
import MapInfo from "@/components/map-card/child/child/MapInfo";
import MapLink from "@/components/map-card/child/child/MapLink";
import MapLeftThumbnail from "@/components/share-components/MapCardThumbnail";
import { QUERY_KEYS } from "@/config/consts/globalConst";
import { RouterOutPuts } from "@/server/api/trpc";
import { Box } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import InfiniteScroll from "react-infinite-scroller";
import MapCard from "../../../components/map-card/MapCard";
import { useMapListInfiniteQuery } from "../../../lib/global-hooks/query/useMapListInfiniteQuery";
import { useIsSearchingAtom, useSetIsSearchingAtom } from "../atoms/atoms";
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

export type MapListParams = {
  keyword: string;
  filter: string;
  sort: string;
  maxRate: string;
  minRate: string;
  played: string;
};

function MapList() {
  const searchParams = useSearchParams();
  const isSearching = useIsSearchingAtom();
  const queryClient = useQueryClient();
  const setIsSearchingAtom = useSetIsSearchingAtom();

  const queryParams: MapListParams = {
    keyword: searchParams.get("keyword") || "",
    filter: searchParams.get("f") || "",
    sort: searchParams.get("sort") || "",
    maxRate: searchParams.get("maxRate") || "",
    minRate: searchParams.get("minRate") || "",
    played: searchParams.get("played") || "",
  };

  const {
    data,
    isFetching,
    isLoading: isFirstLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useMapListInfiniteQuery(queryParams);

  useEffect(() => {
    queryClient.refetchQueries({
      queryKey: [...QUERY_KEYS.mapList, ...Object.values(queryParams)],
    });
    setIsSearchingAtom(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const isRandomSort = searchParams.get("sort") === "random";

  const isLoading = isFirstLoading || (isFetching && isRandomSort && !isFetchingNextPage);
  if (isLoading) {
    return <LoadingMapCard cardLength={10} />;
  }

  return (
    <InfiniteScroll
      className={!isLoading && isSearching ? "opacity-20" : ""}
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
