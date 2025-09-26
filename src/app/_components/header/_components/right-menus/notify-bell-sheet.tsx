"use client"

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Bell, BellDot, Loader2 } from "lucide-react"
import type { ReactNode } from "react"
import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import MapLeftThumbnail from "@/components/shared/map-card-thumbnail"
import CompactMapInfo from "@/components/shared/map-info/compact-map-info"
import DateDistanceText from "@/components/shared/text/date-distance-text"
import UserNameLinkText from "@/components/shared/text/user-name-link-text"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { TooltipWrapper } from "@/components/ui/tooltip"
import type { RouterOutPuts } from "@/server/api/trpc"
import { useTRPC } from "@/trpc/provider"
import { useNotificationQueries } from "@/utils/queries/notification.queries"

export default function NotifyBellSheet() {
  const trpc = useTRPC()
  const { data: isNewNotificationFound } = useQuery(trpc.notification.hasUnread.queryOptions())
  const queryClient = useQueryClient()

  const postUserNotificationRead = useMutation(
    trpc.notification.postUserNotificationRead.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(trpc.notification.hasUnread.queryFilter())
      },
    }),
  )

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
        <SheetHeader>
          <SheetTitle>通知</SheetTitle>
        </SheetHeader>
        <NotifyDrawerInnerContent />
      </SheetContent>
    </Sheet>
  )
}

const NotifyDrawerInnerContent = () => {
  const { ref, inView } = useInView({ threshold: 0.8 })

  const { data, fetchNextPage, hasNextPage, isPending, isFetchingNextPage } = useInfiniteQuery(
    useNotificationQueries().infinite(),
  )

  useEffect(() => {
    if (inView && hasNextPage) {
      void fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  return (
    <div className="h-full overflow-y-auto px-3">
      {isPending ? (
        <LoadingSpinner />
      ) : (
        <div className="h-full">
          {data?.pages.length ? (
            data.pages.map((page, pageIndex: number) => {
              return page.notifications.map((notify, notifyIndex: number) => {
                const { map } = notify

                return (
                  <div key={`${pageIndex}-${notifyIndex}`} className="mb-4">
                    <div className="mb-2">
                      <NotificationMapCard notify={notify}>
                        <MapLeftThumbnail alt={map.info.title} media={map.media} size="notification" />

                        <CompactMapInfo map={map} />
                      </NotificationMapCard>
                      <div className="text-muted-foreground/80 text-right">
                        <DateDistanceText date={notify.created_at} />
                      </div>
                    </div>
                  </div>
                )
              })
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
  )
}

interface NotificationMapCardProps {
  notify: RouterOutPuts["notification"]["getInfinite"]["notifications"][number]
  children: ReactNode
}

function NotificationMapCard({ notify, children }: NotificationMapCardProps) {
  return (
    <Card variant="map" className="block transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="bg-header-background rounded-t-md px-2 py-2 text-sm">
        <span className="flex items-center gap-1">
          <UserNameLinkText
            className="text-header-foreground/80 hover:text-header-foreground underline"
            userId={notify.visitor.id}
            userName={notify.visitor.name}
          />
          <span>
            さんがスコア {notify.visitor.score - notify.myResult.score} 差で {Number(notify.myResult.old_rank)}位
            の記録を抜かしました
          </span>
        </span>
      </CardHeader>
      <CardContent className="text-muted-foreground flex h-full items-start rounded-md border-none p-0">
        {children}
      </CardContent>
    </Card>
  )
}

const LoadingSpinner = () => {
  return (
    <div className="mt-10 flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  )
}
