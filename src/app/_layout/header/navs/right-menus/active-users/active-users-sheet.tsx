"use client";
import { skipToken, useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { orpc } from "@/orpc/provider";
import { MinimumMapCard } from "@/shared/map/list/card/minimum";
import { MapThumbnailImage } from "@/shared/map/thumbnail-image";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { CardWithContent } from "@/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/ui/sheet";
import { Table, TableBody, TableCell, TableRow } from "@/ui/table/table";
import { TooltipWrapper } from "@/ui/tooltip";
import { type ActiveUserStatus, useActiveUsers, useSyncActiveUsers } from "./active-users";

export const ActiveUsersSheet = () => {
  useSyncActiveUsers();
  const [open, setOpen] = useState(false);
  const activeUsers = useActiveUsers();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <TooltipWrapper label="アクティブユーザー" className="relative bottom-3" asChild>
        <SheetTrigger
          render={
            <Button variant="unstyled" size="icon" className="text-header-foreground/80 hover:text-header-foreground">
              <Users size={18} strokeWidth={2.5} />
            </Button>
          }
        />
      </TooltipWrapper>

      <SheetContent className="block">
        <SheetHeader className="w-full border-border/30 border-b py-0">
          <SheetTitle className="flex items-baseline gap-3 py-3">
            <span>アクティブユーザー</span>
            <Badge variant="secondary" className="text-xs">
              {activeUsers.length}人
            </Badge>
          </SheetTitle>
        </SheetHeader>
        <Table className="table-fixed">
          <TableBody>
            {activeUsers.map((user) => {
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
  const { data: map } = useQuery(
    orpc.map.list.getByMapId.queryOptions({ input: activeUser.mapId ? { mapId: activeUser.mapId } : skipToken }),
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
