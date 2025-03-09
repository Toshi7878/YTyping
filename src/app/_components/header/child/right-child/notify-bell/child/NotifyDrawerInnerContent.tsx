import NotificationMapInfo from "@/components/map-card-notification/child/child/NotificationMapInfo";
import NotificationMapCardRightInfo from "@/components/map-card-notification/child/NotificationMapCardRightInfo";
import NotificationMapCard from "@/components/map-card-notification/NotificationMapCard";
import MapLeftThumbnail from "@/components/share-components/MapCardThumbnail";
import DateDistanceText from "@/components/share-components/text/DateDistanceText";
import {
  NOTIFICATION_MAP_THUBNAIL_HEIGHT,
  NOTIFICATION_MAP_THUBNAIL_WIDTH,
} from "@/config/consts/globalConst";
import { ThemeColors } from "@/types";
import { useInView } from "react-intersection-observer";

import { useInfiniteNotificationsQuery } from "@/lib/global-hooks/query/notificationRouterQuery";
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

  const { data, fetchNextPage, hasNextPage, isPending, isFetchingNextPage } =
    useInfiniteNotificationsQuery();

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
        {isPending ? (
          <LoadingSpinner />
        ) : (
          <Box>
            {data?.pages.length ? (
              data.pages.map((page, index: number) => {
                return page.notifications.map((notify, index: number) => {
                  const { map } = notify;
                  const src =
                    map.thumbnail_quality === "maxresdefault"
                      ? `https://i.ytimg.com/vi_webp/${map.video_id}/maxresdefault.webp`
                      : `https://i.ytimg.com/vi/${map.video_id}/mqdefault.jpg`;

                  return (
                    <Box key={index} mb={4}>
                      <Box mb={2}>
                        <NotificationMapCard notify={notify}>
                          <MapLeftThumbnail
                            alt={map.title}
                            fallbackSrc={`https://i.ytimg.com/vi/${map.video_id}/mqdefault.jpg`}
                            src={src}
                            mapVideoId={map.video_id}
                            mapPreviewTime={map.preview_time}
                            thumbnailQuality={map.thumbnail_quality}
                            thumnailWidth={NOTIFICATION_MAP_THUBNAIL_WIDTH}
                            thumnailHeight={NOTIFICATION_MAP_THUBNAIL_HEIGHT}
                          />
                          <NotificationMapCardRightInfo>
                            <NotificationMapInfo map={map} />
                          </NotificationMapCardRightInfo>
                        </NotificationMapCard>
                        <Box textAlign="end" color={`${theme.colors.text.body}cc`}>
                          <DateDistanceText date={new Date(notify.created_at)} />
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
