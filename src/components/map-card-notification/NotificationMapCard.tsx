"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RouterOutPuts } from "@/server/api/trpc";
import UserLinkText from "../share-components/text/UserLinkText";

interface NotificationMapCardProps {
  notify: RouterOutPuts["notification"]["getInfiniteUserNotifications"]["notifications"][number];
  children: React.ReactNode;
}

function NotificationMapCard({ notify, children }: NotificationMapCardProps) {
  return (
    <Card variant="map" className="block transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="bg-header-background rounded-t-md px-2 py-2 text-sm">
        <span>
          <UserLinkText userId={notify.visitor_id} userName={notify.visitor.name!} />
          さんがスコア {notify.visitorResult.status!.score - notify.visitedResult.status!.score} 差で{" "}
          {Number(notify.old_rank)}位 の記録を抜かしました
        </span>
      </CardHeader>
      <CardContent className="text-muted-foreground flex h-full items-start rounded-md border-none p-0">
        {children}
      </CardContent>
    </Card>
  );
}

export default NotificationMapCard;
