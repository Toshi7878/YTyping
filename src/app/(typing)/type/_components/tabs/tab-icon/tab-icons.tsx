import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { BiEdit } from "react-icons/bi";
import { BookmarkListPopover } from "@/components/shared/bookmark/bookmark-list-popover";
import { LikeButton } from "@/components/shared/like-button/like-button";
import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useToggleMapLikeMutation } from "@/lib/mutations/like";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/provider";
import { useBreakPoint } from "@/utils/hooks/use-break-point";
import { useMapIdState } from "../../../_lib/atoms/hydrate";
import { SettingPopover } from "./setting/popover";

export const TabIcons = ({ className }: { className?: string }) => {
  const { data: session } = useSession();

  return (
    <div className={cn("relative flex text-foreground/60 max-sm:pr-10 md:bottom-1", className)}>
      {session?.user.id ? <SettingPopover /> : null}
      {session?.user.id ? <BookmarkListIconButton /> : null}
      {session?.user.id ? <LikeIconButton /> : null}
      <EditIconButton />
    </div>
  );
};

export const BookmarkListIconButton = () => {
  const mapId = useMapIdState();

  const trpc = useTRPC();
  const { data: mapInfo } = useSuspenseQuery(trpc.map.getMapInfo.queryOptions({ mapId: mapId ?? 0 }));

  const hasBookmarked = mapInfo.bookmark.hasBookmarked;

  return (
    <TooltipWrapper label="ブックマークリスト" delayDuration={500}>
      <BookmarkListPopover
        mapId={mapId ?? 0}
        hasBookmarked={hasBookmarked}
        variant="unstyled"
        className={cn(
          "group relative bottom-0.5 ml-3 size-20 p-5 max-sm:mt-8 max-sm:ml-8 md:size-8 dark:hover:bg-transparent",
          hasBookmarked && "hover:opacity-80",
        )}
        iconClassName={cn("size-20 md:size-8", !hasBookmarked && "group-hover:text-foreground/90")}
      />
    </TooltipWrapper>
  );
};

export const LikeIconButton = () => {
  const { isSmScreen } = useBreakPoint();
  const toggleMapLike = useToggleMapLikeMutation();
  const trpc = useTRPC();
  const mapId = useMapIdState();
  const { data: mapInfo } = useSuspenseQuery(trpc.map.getMapInfo.queryOptions({ mapId: mapId ?? 0 }));

  const handleClick = () => {
    if (toggleMapLike.isPending) return;

    toggleMapLike.mutate({ mapId: mapInfo.id, newState: !mapInfo.like.hasLiked });
  };

  return (
    <TooltipWrapper label="譜面にいいね" delayDuration={500} className="relative top-1">
      <LikeButton
        onClick={handleClick}
        size={isSmScreen ? 164 : 64}
        defaultLiked={mapInfo.like.hasLiked}
        className={cn(
          "bottom-3.5 max-sm:mb-[-25px]",
          mapInfo.like.hasLiked ? "hover:opacity-80" : "hover:text-foreground/90",
        )}
      />
    </TooltipWrapper>
  );
};

const EditIconButton = () => {
  const mapId = useMapIdState();
  const { data: session } = useSession();

  const trpc = useTRPC();
  const { data: mapInfo } = useSuspenseQuery(trpc.map.getMapInfo.queryOptions({ mapId: mapId ?? 0 }));

  const role = session?.user.role;
  const creatorId = mapInfo.creator.id;
  const userId = session?.user.id;

  const tooltipLabel = `譜面のEditページに移動${Number(userId) !== Number(creatorId) && role === "USER" ? "(閲覧のみ)" : ""}`;
  return (
    <TooltipWrapper label={tooltipLabel} delayDuration={500}>
      <Link href={`/edit/${mapId}`} replace className="max-sm:relative max-sm:top-[50px] max-sm:ml-6">
        <Button variant="unstyled" size="icon" className="hover:text-foreground/90">
          <BiEdit className="size-24 md:size-9" />
        </Button>
      </Link>
    </TooltipWrapper>
  );
};
