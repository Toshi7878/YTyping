import NotificationMapInfo from "@/components/map-card-notification/child/child/NotificationMapInfo";
import NotificationMapCardRightInfo from "@/components/map-card-notification/child/NotificationMapCardRightInfo";
import NotificationMapCard from "@/components/map-card-notification/NotificationMapCard";
import MapLeftThumbnail from "@/components/share-components/MapCardThumbnail";
import DateDistanceText from "@/components/share-components/text/DateDistanceText";
import { ThemeColors } from "@/types";
import { useInView } from "react-intersection-observer";

import { useNotificationQueries } from "@/util/global-hooks/queries/notification.queries";
import { Box, DrawerBody, DrawerCloseButton, DrawerHeader, Spinner, useTheme } from "@chakra-ui/react";
import { useEffect } from "react";

const NotifyDrawerInnerContent = () => {
  const { ref, inView } = useInView({
    threshold: 0.8,
  });

  const { data, fetchNextPage, hasNextPage, isPending, isFetchingNextPage } =
    useNotificationQueries.getInfiniteNotifications();

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

                  return (
                    <Box key={index} mb={4}>
                      <Box mb={2}>
                        <NotificationMapCard notify={notify}>
                          <MapLeftThumbnail
                            alt={map.title}
                            src={`https://i.ytimg.com/vi/${map.video_id}/mqdefault.jpg`}
                            mapVideoId={map.video_id}
                            mapPreviewTime={map.preview_time}
                            size="notification"
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
