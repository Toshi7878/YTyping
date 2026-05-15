"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellDot } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { buildUserBookmarkListUrl } from "@/app/user/[id]/_features/search-params";
import type { RouterOutputs } from "@/server/api/trpc";
import { NotificationMapCard } from "@/shared/map/list/card/compact";
import { getReportStatusBadgeVariant, getReportStatusLabel } from "@/shared/user/report";
import { useTRPC } from "@/trpc/provider";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { RelativeTime } from "@/ui/relative-time";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/ui/sheet";
import { ScrollSpinner, Spinner } from "@/ui/spinner";
import { TooltipWrapper } from "@/ui/tooltip";

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
      <TooltipWrapper label="通知" className="relative bottom-3" asChild>
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data, isPending, fetchNextPage, hasNextPage } = useInfiniteQuery(
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
    <div ref={scrollRef} className="h-full overflow-y-auto px-3">
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
                    {notification.type === "REPORT_RESULT" && (
                      <ReportResultNotificationCard notification={notification} />
                    )}
                    {notification.type === "WARNING" && <WarningNotificationCard notification={notification} />}
                    <RelativeTime date={notification.updatedAt} className="flex justify-end text-muted-foreground" />
                  </div>
                );
              });
            })
          ) : (
            <div className="py-8 text-center text-muted-foreground">まだ通知はありません</div>
          )}
          <ScrollSpinner
            className="pt-4 pb-8"
            rootMarginY="200px"
            root={scrollRef.current}
            onEnter={fetchNextPage}
            hasMore={hasNextPage}
          />
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
          <Link className="underline" href={buildUserBookmarkListUrl(String(bookmarker.id), mapBookmark.list.id)}>
            {mapBookmark.list.title}
          </Link>
          リストにブックマークしました
        </span>
      }
    />
  );
};

type ReportResultNotification = Extract<Notification, { type: "REPORT_RESULT" }>;
const ReportResultNotificationCard = ({ notification }: { notification: ReportResultNotification }) => {
  const { report } = notification;
  const isReportedUserBanned = report.status === "RESOLVED";
  const resultBadgeVariant = getReportStatusBadgeVariant(report.status, isReportedUserBanned);
  const resultLabel = getReportStatusLabel(report.status, isReportedUserBanned);

  return (
    <Card className="gap-3 rounded-md border py-3 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between gap-3 px-3">
        <CardTitle className="text-sm">通報結果</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-3 text-sm">
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs">対象ユーザー</p>
          <div className="flex items-center gap-2">
            <Link href={`/user/${report.reportedUser.id}`} className="font-medium text-foreground underline">
              {report.reportedUser.name ?? `ID: ${report.reportedUser.id}`}
            </Link>
            <Badge variant={resultBadgeVariant}>{resultLabel}</Badge>
          </div>
        </div>
        {report.adminNote && (
          <div className="space-y-1 rounded-sm">
            <p className="text-muted-foreground text-xs">管理者コメント</p>
            <p className="whitespace-pre-wrap text-foreground leading-relaxed">{report.adminNote}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

type WarningNotification = Extract<Notification, { type: "WARNING" }>;
const WarningNotificationCard = ({ notification }: { notification: WarningNotification }) => {
  const { warning } = notification;

  return (
    <Card className="gap-3 rounded-md border border-warning/40 py-3 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between gap-3 px-3">
        <CardTitle className="text-sm">警告通知</CardTitle>
        <Badge variant="secondary" className="bg-warning text-warning-foreground">
          警告
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3 px-3 text-sm">
        <div className="space-y-1 rounded-sm bg-warning/10 p-2">
          <p className="text-muted-foreground text-xs">警告コメント</p>
          <p className="whitespace-pre-wrap text-foreground leading-relaxed">{warning.comment}</p>
        </div>
      </CardContent>
    </Card>
  );
};
