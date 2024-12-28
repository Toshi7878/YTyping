import UpdateAtText from "@/components/custom-ui/UpdateAtText";
import NotificationMapInfo from "@/components/map-card-notification/child/child/NotificationMapInfo";
import NotificationMapCardRightInfo from "@/components/map-card-notification/child/NotificationMapCardRightInfo";
import NotificationMapCard from "@/components/map-card-notification/NotificationMapCard";
import MapLeftThumbnail from "@/components/map-card/child/MapCardLeftThumbnail";
import { NOTIFICATION_MAP_THUBNAIL_HEIGHT, NOTIFICATION_MAP_THUBNAIL_WIDTH } from "@/config/consts";
import { clientApi } from "@/trpc/client-api";
import { ThemeColors } from "@/types";
import { useInView } from "react-intersection-observer";

import {
  Box,
  DrawerBody,
  DrawerCloseButton,
  DrawerHeader,
  Spinner,
  useTheme,
} from "@chakra-ui/react";
import { useEffect } from "react";

const NotifyDrawerInnerContent = () => {
  const { ref, inView } = useInView({
    threshold: 0.8,
  });
  const { data, error, fetchNextPage, hasNextPage, isFetching, isLoading, isFetchingNextPage } =
    clientApi.notification.getInfiniteUserNotifications.useInfiniteQuery(
      {
        limit: 20,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);
  const theme: ThemeColors = useTheme();

  return (
    <>
      <DrawerCloseButton />
      <DrawerHeader>通知</DrawerHeader>

      <DrawerBody px={3}>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <Box>
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
            <div ref={ref}>{isFetchingNextPage && <LoadingSpinner />}</div>
          </Box>
        )}
      </DrawerBody>
    </>
  );
};

const LoadingSpinner = () => {
  return (
    <Box display="flex" mt={10} justifyContent="center" alignItems="center">
      <Spinner />
    </Box>
  );
};

export default NotifyDrawerInnerContent;
