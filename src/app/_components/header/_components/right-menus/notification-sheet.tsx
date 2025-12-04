"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellDot } from "lucide-react";
import {
  ClapNotificationMapCard,
  LikeNotificationMapCard,
  OverTakeNotificationMapCard,
} from "@/components/shared/map-card/compact-card";
import { DateDistanceText } from "@/components/shared/text/date-distance-text";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useTRPC } from "@/trpc/provider";
import { useInfiniteScroll } from "@/utils/hooks/intersection";

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

      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader className="py-2">
          <SheetTitle>通知</SheetTitle>
        </SheetHeader>
        <NotificationContent />
      </SheetContent>
    </Sheet>
  );
};

const NotificationContent = () => {
  const trpc = useTRPC();
  const { data, fetchNextPage, hasNextPage, isPending, isFetchingNextPage } = useInfiniteQuery(
    trpc.notification.getInfinite.infiniteQueryOptions(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        refetchOnWindowFocus: false,
        gcTime: Infinity,
      },
    ),
  );

  const ref = useInfiniteScroll({ isFetchingNextPage, fetchNextPage, hasNextPage }, { threshold: 0.8 });
  return (
    <div className="h-full overflow-y-auto px-3">
      {isPending ? (
        <Spinner />
      ) : (
        <div className="h-full space-y-4">
          {data?.pages.length ? (
            data.pages.map((page) => {
              return page.items.map((notification) => {
                return (
                  <div key={notification.id}>
                    {notification.type === "OVER_TAKE" && <OverTakeNotificationMapCard notification={notification} />}
                    {notification.type === "LIKE" && <LikeNotificationMapCard notification={notification} />}
                    {notification.type === "CLAP" && <ClapNotificationMapCard notification={notification} />}
                    <DateDistanceText
                      date={notification.updatedAt}
                      className="text-muted-foreground flex justify-end"
                    />
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
