"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellDot } from "lucide-react";
import { NotificationMapCard } from "@/components/shared/map-card/compact-card";
import { DateDistanceText } from "@/components/shared/text/date-distance-text";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useTRPC } from "@/trpc/provider";
import { useNotificationQueries } from "@/utils/queries/notification.queries";
import { useInfiniteScroll } from "@/utils/use-infinite-scroll";

export const NotificationSheet = () => {
  const trpc = useTRPC();
  const { data: isNewNotificationFound } = useQuery(trpc.notification.hasUnread.queryOptions());
  const queryClient = useQueryClient();

  const postUserNotificationRead = useMutation(
    trpc.notification.postUserNotificationRead.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(trpc.notification.hasUnread.queryFilter());
      },
    }),
  );

  return (
    <Sheet>
      <TooltipWrapper label="通知" delayDuration={600} className="relative bottom-3">
        <SheetTrigger asChild>
          <Button
            variant="unstyled"
            size="icon"
            className="hover:text-header-foreground text-header-foreground/80 p-2"
            onClick={() => postUserNotificationRead.mutate()}
          >
            {isNewNotificationFound ? <BellDot size={18} strokeWidth={2.5} /> : <Bell size={18} strokeWidth={2.5} />}
          </Button>
        </SheetTrigger>
      </TooltipWrapper>

      <SheetContent side="right" className="block sm:max-w-md">
        <SheetHeader>
          <SheetTitle>通知</SheetTitle>
        </SheetHeader>
        <NotificationContent />
      </SheetContent>
    </Sheet>
  );
};

const NotificationContent = () => {
  const { data, fetchNextPage, hasNextPage, isPending, isFetchingNextPage } = useInfiniteQuery(
    useNotificationQueries().infinite(),
  );

  const ref = useInfiniteScroll({ isFetchingNextPage, fetchNextPage, hasNextPage }, { threshold: 0.8 });
  return (
    <div className="h-full overflow-y-auto px-3">
      {isPending ? (
        <Spinner />
      ) : (
        <div className="h-full">
          {data?.pages.length ? (
            data.pages.map((page) => {
              return page.notifications.map((notify) => {
                const { map } = notify;

                return (
                  <div key={`${notify.visitor.id}-${notify.map.id}`} className="mb-4">
                    <div className="mb-2">
                      <NotificationMapCard notify={notify} map={map} />
                      <DateDistanceText date={notify.created_at} className="text-muted-foreground flex justify-end" />
                    </div>
                  </div>
                );
              });
            })
          ) : (
            <div className="text-muted-foreground py-8 text-center">まだ通知はありません</div>
          )}
          <div ref={ref} className="py-4">
            {isFetchingNextPage && <Spinner />}
          </div>
        </div>
      )}
    </div>
  );
};
