import UpdateAtText from "@/components/custom-ui/UpdateAtText";
import NotificationMapInfo from "@/components/map-card-notification/child/child/NotificationMapInfo";
import NotificationMapCardRightInfo from "@/components/map-card-notification/child/NotificationMapCardRightInfo";
import NotificationMapCard from "@/components/map-card-notification/NotificationMapCard";
import MapLeftThumbnail from "@/components/map-card/child/MapCardLeftThumbnail";
import { NOTIFICATION_MAP_THUBNAIL_HEIGHT, NOTIFICATION_MAP_THUBNAIL_WIDTH } from "@/config/consts";
import { clientApi } from "@/trpc/client-api";
import { ThemeColors } from "@/types";
import {
  Box,
  DrawerBody,
  DrawerCloseButton,
  DrawerHeader,
  Spinner,
  useTheme,
} from "@chakra-ui/react";
import InfiniteScroll from "react-infinite-scroller";

const NotifyDrawerInnerContent = () => {
  // const {
  //   data,
  //   error,
  //   fetchNextPage,
  //   fetchPreviousPage,
  //   hasNextPage,
  //   hasPreviousPage,
  //   isFetching,
  //   isFetchingNextPage,
  //   isFetchingPreviousPage,
  //   isLoading,
  // } = useNotifyInfiniteQuery();

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
    isLoading,
  } = clientApi.notification.getInfiniteUserNotifications.useInfiniteQuery(
    { cursor: 1 }, // 必要な引数を指定
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
      initialCursor: 1, // 必要に応じて初期カーソルを設定
    },
  );
  // const utils = clientApi.useUtils();
  // utils.invalidate();

  const theme: ThemeColors = useTheme();

  return (
    <>
      <DrawerCloseButton />
      <DrawerHeader>通知</DrawerHeader>

      <DrawerBody px={3}>
        {isLoading ? (
          <Box display="flex" mt={10} justifyContent="center" alignItems="center">
            <Spinner />
          </Box>
        ) : (
          <InfiniteScroll
            loadMore={() => fetchNextPage()}
            // loader={<LoadingMapCard />}
            hasMore={hasNextPage}
            threshold={500} // スクロールの閾値を追加
          >
            {data?.pages.length ? (
              data.pages.map((page, index: number) => {
                return page.notifications.map((notify, index: number) => {
                  const { map } = notify;
                  const src =
                    map.thumbnailQuality === "maxresdefault"
                      ? `https://i.ytimg.com/vi_webp/${map.videoId}/maxresdefault.webp`
                      : `https://i.ytimg.com/vi/${map.videoId}/mqdefault.jpg`;

                  return (
                    <Box key={index} mb={4}>
                      <Box mb={2}>
                        <NotificationMapCard notify={notify}>
                          <MapLeftThumbnail
                            alt={map.title}
                            fallbackSrc={`https://i.ytimg.com/vi/${map.videoId}/mqdefault.jpg`}
                            src={src}
                            mapVideoId={map.videoId}
                            mapPreviewTime={map.previewTime}
                            thumbnailQuality={map.thumbnailQuality}
                            thumnailWidth={NOTIFICATION_MAP_THUBNAIL_WIDTH}
                            thumnailHeight={NOTIFICATION_MAP_THUBNAIL_HEIGHT}
                          />
                          <NotificationMapCardRightInfo>
                            <NotificationMapInfo map={map} />
                          </NotificationMapCardRightInfo>
                        </NotificationMapCard>
                        <Box textAlign="end" color={`${theme.colors.text.body}cc`}>
                          <UpdateAtText updatedAt={notify.createdAt} />
                        </Box>
                      </Box>
                    </Box>
                  );
                });
              })
            ) : (
              <Box>まだ通知はありません</Box>
            )}
          </InfiniteScroll>
        )}
      </DrawerBody>
    </>
  );
};

export default NotifyDrawerInnerContent;
