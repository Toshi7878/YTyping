import NotificationMapInfo from "@/components/map-card-notification/child/child/NotificationMapInfo";
import NotificationMapCardRightInfo from "@/components/map-card-notification/child/NotificationMapCardRightInfo";
import MapLeftThumbnail from "@/components/share-components/MapCardThumbnail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "@/components/ui/link/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useActiveUserQueries } from "@/utils/queries/activeUser.queries";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { useActiveUsers } from "./useActiveUser";

const ActiveUsersDrawer = () => {
  const { onlineUsers } = useActiveUsers();
  const activeUserMapQuery = useQuery(useActiveUserQueries().userPlayingMaps(onlineUsers));

  if (activeUserMapQuery.isPending) {
    return;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="unstyled" size="icon" className="hover:text-foreground">
          <Users size={18} strokeWidth={2.5} />
        </Button>
      </SheetTrigger>

      <SheetContent>
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="text-sm">
              <TableHead className="w-1/4 px-3">
                <div className="flex items-baseline gap-1 whitespace-nowrap">
                  <span>ユーザー</span>
                  <Badge variant="secondary" className="text-xs">
                    {onlineUsers.length}人
                  </Badge>
                </div>
              </TableHead>
              <TableHead className="w-3/4 px-[17.5px]">プレイ中譜面</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeUserMapQuery.data &&
              activeUserMapQuery.data.map((user) => {
                const stateMsg =
                  user.state === "askMe"
                    ? "Ask Me"
                    : user.state === "type"
                      ? "プレイ中"
                      : user.state === "edit"
                        ? "譜面編集中"
                        : "待機中";

                return (
                  <TableRow key={user.id} className="border-border/30 border-b">
                    <TableCell className="px-0 py-2">
                      <TooltipWrapper label={user.name}>
                        <Link href={`/user/${user.id}`} className="block truncate px-3 py-4 text-sm hover:underline">
                          {user.name}
                        </Link>
                      </TooltipWrapper>
                    </TableCell>
                    <TableCell className="px-0 py-2">
                      {user.state === "type" && user.map ? (
                        <ActiveUserMapCard>
                          <MapLeftThumbnail
                            alt={user.map.title}
                            src={`https://i.ytimg.com/vi/${user.map.video_id}/mqdefault.jpg`}
                            mapVideoId={user.map.video_id}
                            mapPreviewTime={user.map.preview_time}
                            size="activeUser"
                          />
                          <NotificationMapCardRightInfo>
                            <NotificationMapInfo map={user.map} />
                          </NotificationMapCardRightInfo>
                        </ActiveUserMapCard>
                      ) : (
                        <ActiveUserMapCard>
                          <MapLeftThumbnail size="activeUser" />
                          <div
                            className={cn(
                              "absolute top-1/2 -translate-y-1/2",
                              user.state === "edit" ? "left-[20.5px]" : "left-[32.5px]",
                            )}
                          >
                            {stateMsg}
                          </div>
                        </ActiveUserMapCard>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </SheetContent>
    </Sheet>
  );
};

interface ActiveUserMapCardProps {
  children: React.ReactNode;
}

function ActiveUserMapCard({ children }: ActiveUserMapCardProps) {
  return (
    <Card className="bg-card transition-shadow duration-300 hover:shadow-lg">
      <CardContent className="text-card-foreground bg-card flex h-full items-start rounded-md border-none p-0">
        {children}
      </CardContent>
    </Card>
  );
}

export default ActiveUsersDrawer;
