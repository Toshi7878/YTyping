"use client";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { MinimumMapCard } from "@/components/shared/map-card/minimum-card";
import { MapThumbnailImage } from "@/components/shared/map-thumbnail-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardWithContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table/table";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { type ActiveUserStatus, useOnlineUsersState } from "@/lib/atoms/global-atoms";
import { useTRPC } from "@/trpc/provider";
import { useActiveUsers } from "./use-active-user";

export const ActiveUsersSheet = () => {
  useActiveUsers();
  const [open, setOpen] = useState(false);
  const onlineUsers = useOnlineUsersState();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <TooltipWrapper label="アクティブユーザー" className="relative bottom-3">
        <SheetTrigger asChild>
          <Button variant="unstyled" size="icon" className="text-header-foreground/80 hover:text-header-foreground">
            <Users size={18} strokeWidth={2.5} />
          </Button>
        </SheetTrigger>
      </TooltipWrapper>

      <SheetContent className="block">
        <SheetHeader className="w-full border-border/30 border-b py-0">
          <SheetTitle className="flex items-baseline gap-3 py-3">
            <span>アクティブユーザー</span>
            <Badge variant="secondary" className="text-xs">
              {onlineUsers.length}人
            </Badge>
          </SheetTitle>
        </SheetHeader>
        <Table className="table-fixed">
          <TableBody>
            {onlineUsers.map((user) => {
              return (
                <TableRow key={user.id} className="border-border/30 border-b">
                  <TableCell className="px-0 py-2" width={100}>
                    <TooltipWrapper label={user.name} asChild>
                      <Link href={`/user/${user.id}`} className="block truncate px-3 py-4 text-sm hover:underline">
                        {user.name}
                      </Link>
                    </TooltipWrapper>
                  </TableCell>
                  <TableCell className="px-0 py-2">
                    <ActiveMapCard activeUser={user} />
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

const ActiveMapCard = ({ activeUser }: { activeUser: ActiveUserStatus }) => {
  const trpc = useTRPC();
  const { data: map } = useQuery(
    trpc.map.list.getByMapId.queryOptions({ mapId: activeUser.mapId ?? 0 }, { enabled: !!activeUser.mapId }),
  );

  if (!map) {
    const stateMessage = buildStateMessage(activeUser.state);
    return (
      <CardWithContent variant="map">
        <MapThumbnailImage size="xs" alt={stateMessage} />
      </CardWithContent>
    );
  }

  return <MinimumMapCard map={map} />;
};

const buildStateMessage = (state: ActiveUserStatus["state"]) => {
  switch (state) {
    case "askMe":
      return "Ask Me";
    case "edit":
      return "譜面編集中";
    case "idle":
      return "待機中";
    default:
      return "";
  }
};
