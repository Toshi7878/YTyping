"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useTRPC } from "@/trpc/trpc";
import { useNotificationQueries } from "@/utils/queries/notification.queries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellDot } from "lucide-react";
import { useCallback } from "react";
import NotifyDrawerInnerContent from "./child/NotifyDrawerInnerContent";

export default function NotifyBell() {
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
        <Button variant="ghost" size="icon" className="p-2" onClick={notificationOpen}>
          <TooltipWrapper label="通知" delayDuration={600}>
            <div className="relative">
              {isNewNotification ? <BellDot size={18} strokeWidth={2.5} /> : <Bell size={18} strokeWidth={2.5} />}
            </div>
          </TooltipWrapper>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-auto lg:w-[450px]">
        <NotifyDrawerInnerContent />
      </SheetContent>
    </Sheet>
  );
}
