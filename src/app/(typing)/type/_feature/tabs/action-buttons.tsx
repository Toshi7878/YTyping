"use client";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useParams } from "next/navigation";
import { useSession } from "@/auth/client";
import { BookmarkListPopover } from "@/shared/map/bookmark/lists-popover";
import { useToggleMapLikeMutation } from "@/shared/map/like";
import { useTRPC } from "@/trpc/provider";
import { BookmarkListIconButton, EditIconLinkButton } from "@/ui/icon-button";
import { LikeToggleButton } from "@/ui/like-button/like-button";
import { TooltipWrapper } from "@/ui/tooltip";
import { cn } from "@/utils/cn";
import { SettingPopover } from "./setting/popover";

export const MapActionIconButtons = ({ className }: { className: string }) => {
  const { data: session } = useSession();
  const { id: mapId } = useParams();
  const trpc = useTRPC();
  const { data: mapInfo } = useSuspenseQuery(trpc.map.getById.queryOptions({ mapId: Number(mapId) }));
  const hasBookmarked = mapInfo.bookmark.hasBookmarked;
  const hasLiked = mapInfo.like.hasLiked;

  return (
    <div
      id="action-buttons"
      className={cn(
        "mb-1.5 flex gap-18 text-foreground/60 max-md:mr-12 md:gap-2 [&>a]:hover:text-foreground/90 [&>button]:hover:text-foreground/90 [&_svg]:size-24! md:[&_svg]:size-9!",
        className,
      )}
    >
      {session?.user.id && <SettingPopover />}
      {session?.user.id && <BookmarkListButton id={mapInfo.id} hasBookmarked={hasBookmarked} />}
      {session?.user.id && <MapLikeButton id={mapInfo.id} hasLiked={hasLiked} />}
      {session?.user.id && <MapEditLinkButton id={mapInfo.id} />}
    </div>
  );
};

const BookmarkListButton = ({ id, hasBookmarked }: { id: number; hasBookmarked: boolean }) => {
  return (
    <BookmarkListPopover
      mapId={id}
      trigger={<BookmarkListIconButton bookmarked={hasBookmarked} />}
      tooltipLabel="ブックマーク"
    />
  );
};

const MapLikeButton = ({ id, hasLiked }: { id: number; hasLiked: boolean }) => {
  const toggleMapLike = useToggleMapLikeMutation();

  const handleClick = () => {
    if (toggleMapLike.isPending) return;
    toggleMapLike.mutate({ mapId: id, newState: !hasLiked });
  };

  return (
    <TooltipWrapper label="いいね" asChild>
      <LikeToggleButton onClick={handleClick} liked={hasLiked} />
    </TooltipWrapper>
  );
};

const MapEditLinkButton = ({ id }: { id: number }) => {
  return (
    <TooltipWrapper label="編集" asChild>
      <EditIconLinkButton href={`/edit/${id}`} replace />
    </TooltipWrapper>
  );
};
