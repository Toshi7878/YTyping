"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellDot } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { buildBookmarkListUrl } from "@/app/user/[id]/_components/bookmark-lists";
import { InfiniteScrollSpinner } from "@/components/shared/infinite-scroll-spinner";
import { NotificationMapCard } from "@/components/shared/map-card/compact-card";
import { DateDistanceText } from "@/components/shared/text/date-distance-text";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { TooltipWrapper } from "@/components/ui/tooltip";
import type { RouterOutputs } from "@/server/api/trpc";
import { useTRPC } from "@/trpc/provider";

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
      <TooltipWrapper label="通知" className="relative bottom-3">
        <SheetTrigger asChild>
          <Button
            variant="unstyled"
            size="icon"
            className="p-2 text-header-foreground/80 hover:text-header-foreground"
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
  const { data, isPending, ...pagination } = useInfiniteQuery(
    trpc.notification.getInfinite.infiniteQueryOptions(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        refetchOnWindowFocus: false,
        gcTime: Infinity,
      },
    ),
  );

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
                    {notification.type === "MAP_BOOKMARK" && (
                      <BookMarkNotificationMapCard notification={notification} />
                    )}
                    <DateDistanceText
                      date={notification.updatedAt}
                      className="flex justify-end text-muted-foreground"
                    />
                  </div>
                );
              });
            })
          ) : (
            <div className="py-8 text-center text-muted-foreground">まだ通知はありません</div>
          )}
          <InfiniteScrollSpinner className="py-4" inViewPreset="notificationSheet" {...pagination} />
        </div>
      )}
    </div>
  );
};

type Notification = NonNullable<RouterOutputs["notification"]["getInfinite"]["items"][number]>;

type OverTakeNotification = Extract<Notification, { type: "OVER_TAKE" }>;
const OverTakeNotificationMapCard = ({ notification }: { notification: OverTakeNotification }) => {
  const { map, visitor, myResult } = notification;
  return (
    <NotificationMapCard
      map={map}
      user={{ id: visitor.id, name: visitor.name ?? "" }}
      className="bg-header-background"
      title={`さんがスコア ${visitor.score - myResult.score} 差で ${Number(myResult.prevRank)}位 の記録を抜かしました`}
    />
  );
};

type LikeNotification = Extract<Notification, { type: "LIKE" }>;
const LikeNotificationMapCard = ({ notification }: { notification: LikeNotification }) => {
  const { map, liker } = notification;
  return (
    <NotificationMapCard
      map={map}
      user={{ id: liker.id, name: liker.name ?? "" }}
      className="bg-like/85"
      title="さんが作成した譜面にいいねしました"
    />
  );
};

type ClapNotification = Extract<Notification, { type: "CLAP" }>;
const ClapNotificationMapCard = ({ notification }: { notification: ClapNotification }) => {
  const { map, clapper } = notification;
  return (
    <NotificationMapCard
      map={map}
      user={{ id: clapper.id, name: clapper.name ?? "" }}
      className="bg-perfect/65"
      title="さんが記録に拍手しました"
    />
  );
};

type BookMarkNotification = Extract<Notification, { type: "MAP_BOOKMARK" }>;
const BookMarkNotificationMapCard = ({ notification }: { notification: BookMarkNotification }) => {
  const { map, bookmarker, mapBookmark } = notification;
  return (
    <NotificationMapCard
      map={map}
      user={{ id: bookmarker.id, name: bookmarker.name ?? "" }}
      className="bg-secondary-dark/85"
      title={
        <span>
          さんが譜面を
          <Link className="underline" href={buildBookmarkListUrl(String(bookmarker.id), mapBookmark.list.id) as Route}>
            {mapBookmark.list.title}
          </Link>
          リストにブックマークしました
        </span>
      }
    />
  );
};
