"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { clientApi } from "@/trpc/client-api";
import { Bell, BellDot } from "lucide-react";
import { useCallback } from "react";
import NotifyDrawerInnerContent from "./child/NotifyDrawerInnerContent";

export default function NotifyBell() {
  const { data: isNewNotification } = clientApi.notification.newNotificationCheck.useQuery();
  const postUserNotificationRead = clientApi.notification.postUserNotificationRead.useMutation();

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
