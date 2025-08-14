"use client";
import CompactMapInfo from "@/components/map-card-notification/child/child/NotificationMapInfo";
import NotificationMapCardRightInfo from "@/components/map-card-notification/child/NotificationMapCardRightInfo";
import MapLeftThumbnail from "@/components/share-components/MapCardThumbnail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardWithContent } from "@/components/ui/card";
import Link from "@/components/ui/link/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useOnlineUsersState } from "@/lib/globalAtoms";
import { useActiveUserQueries } from "@/utils/queries/activeUser.queries";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { useState } from "react";
import useActiveUsers from "./useActiveUser";

const ActiveUsersDrawer = () => {
  useActiveUsers();
  const [open, setOpen] = useState(false);
  const onlineUsers = useOnlineUsersState();
  const activeUserMapQuery = useQuery({
    ...useActiveUserQueries().userPlayingMaps(onlineUsers),
    enabled: open,
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <TooltipWrapper label="アクティブユーザー" delayDuration={600}>
          <Button variant="unstyled" size="icon" className="hover:text-foreground">
            <Users size={18} strokeWidth={2.5} />
          </Button>
        </TooltipWrapper>
      </SheetTrigger>

      <SheetContent className="block">
        <SheetHeader className="border-border/30 w-full border-b py-0">
          <SheetTitle className="flex items-baseline gap-3 py-3">
            <span>アクティブユーザー</span>
            <Badge variant="secondary" className="text-xs">
              {onlineUsers.length}人
            </Badge>
          </SheetTitle>
        </SheetHeader>
        <Table className="table-fixed">
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
                        <CardWithContent variant="map">
                          <MapLeftThumbnail
                            alt={user.map.title}
                            src={`https://i.ytimg.com/vi/${user.map.video_id}/mqdefault.jpg`}
                            mapVideoId={user.map.video_id}
                            mapPreviewTime={user.map.preview_time}
                            size="activeUser"
                          />
                          <NotificationMapCardRightInfo>
                            <CompactMapInfo map={user.map} />
                          </NotificationMapCardRightInfo>
                        </CardWithContent>
                      ) : (
                        <CardWithContent variant="map">
                          <MapLeftThumbnail size="activeUser" alt={stateMsg} />
                        </CardWithContent>
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

export default ActiveUsersDrawer;
