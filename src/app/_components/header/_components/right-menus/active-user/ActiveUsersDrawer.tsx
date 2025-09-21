"use client";
import MapLeftThumbnail from "@/components/shared/map-card-thumbnail";
import CompactMapInfo from "@/components/shared/map-info/compact-map-info";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardWithContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table/table";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useOnlineUsersState } from "@/lib/globalAtoms";
import { useTRPC } from "@/trpc/provider";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useActiveUsers from "./useActiveUser";

const ActiveUsersDrawer = () => {
  useActiveUsers();
  const [open, setOpen] = useState(false);
  const onlineUsers = useOnlineUsersState();
  const trpc = useTRPC();
  const { data: activeUsersWithMap } = useQuery({
    ...trpc.mapList.getActiveUserPlayingMaps.queryOptions(onlineUsers),
    enabled: open,
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <TooltipWrapper label="アクティブユーザー" delayDuration={600} className="relative bottom-3">
        <SheetTrigger asChild>
          <Button variant="unstyled" size="icon" className="hover:text-header-foreground text-header-foreground/80">
            <Users size={18} strokeWidth={2.5} />
          </Button>
        </SheetTrigger>
      </TooltipWrapper>

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
            {activeUsersWithMap?.map((user) => {
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
                  <TableCell className="px-0 py-2" width={100}>
                    <TooltipWrapper label={user.name}>
                      <Link href={`/user/${user.id}`} className="block truncate px-3 py-4 text-sm hover:underline">
                        {user.name}
                      </Link>
                    </TooltipWrapper>
                  </TableCell>
                  <TableCell className="px-0 py-2">
                    {user.state === "type" && user.map ? (
                      <CardWithContent variant="map">
                        <MapLeftThumbnail alt={user.map.info.title} media={user.map.media} size="activeUser" />

                        <CompactMapInfo map={user.map} />
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
