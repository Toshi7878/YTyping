"use client";

import CompactMapInfo from "@/components/map-card-notification/child/child/NotificationMapInfo";
import NotificationMapCardRightInfo from "@/components/map-card-notification/child/NotificationMapCardRightInfo";
import NotificationMapCard from "@/components/map-card-notification/NotificationMapCard";
import MapLeftThumbnail from "@/components/share-components/MapCardThumbnail";
import DateDistanceText from "@/components/share-components/text/DateDistanceText";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useTRPC } from "@/trpc/provider";
import { useNotificationQueries } from "@/utils/queries/notification.queries";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellDot, Loader2 } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useInView } from "react-intersection-observer";

export default function NotifyBellDrawer() {
  const { data: isNewNotification } = useQuery(useNotificationQueries().hasNewNotification());
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const postUserNotificationRead = useMutation(
    trpc.notification.postUserNotificationRead.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.notification.hasNewNotification.queryFilter());
      },
    }),
  );

  const notificationOpen = useCallback(() => {
    postUserNotificationRead.mutate();
  }, [postUserNotificationRead]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <TooltipWrapper label="通知" delayDuration={600} className="relative bottom-3">
          <Button variant="unstyled" size="icon" className="hover:text-foreground p-2" onClick={notificationOpen}>
            {isNewNotification ? <BellDot size={18} strokeWidth={2.5} /> : <Bell size={18} strokeWidth={2.5} />}
          </Button>
        </TooltipWrapper>
      </SheetTrigger>

      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>通知</SheetTitle>
        </SheetHeader>
        <NotifyDrawerInnerContent />
      </SheetContent>
    </Sheet>
  );
}

const NotifyDrawerInnerContent = () => {
  const { ref, inView } = useInView({
    threshold: 0.8,
  });

  const { data, fetchNextPage, hasNextPage, isPending, isFetchingNextPage } = useInfiniteQuery(
    useNotificationQueries().infiniteNotifications(),
  );

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <div className="h-full overflow-y-auto px-3">
      {isPending ? (
        <LoadingSpinner />
      ) : (
        <div className="h-full">
          {data?.pages.length ? (
            data.pages.map((page, index: number) => {
              return page.notifications.map((notify, index: number) => {
                const { map } = notify;

                return (
                  <div key={index} className="mb-4">
                    <div className="mb-2">
                      <NotificationMapCard notify={notify}>
                        <MapLeftThumbnail
                          alt={map.title}
                          src={`https://i.ytimg.com/vi/${map.video_id}/mqdefault.jpg`}
                          mapVideoId={map.video_id}
                          mapPreviewTime={map.preview_time}
                          size="notification"
                        />
                        <NotificationMapCardRightInfo>
                          <CompactMapInfo map={map} />
                        </NotificationMapCardRightInfo>
                      </NotificationMapCard>
                      <div className="text-muted-foreground/80 text-right">
                        <DateDistanceText date={new Date(notify.created_at)} />
                      </div>
                    </div>
                  </div>
                );
              });
            })
          ) : (
            <div className="text-muted-foreground py-8 text-center">まだ通知はありません</div>
          )}
          <div ref={ref} className="py-4">
            {isFetchingNextPage && <LoadingSpinner />}
          </div>
        </div>
      )}
    </div>
  );
};

const LoadingSpinner = () => {
  return (
    <div className="mt-10 flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
};
