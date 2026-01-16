import { useSuspenseQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { BiEdit } from "react-icons/bi";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { BookmarkListPopover } from "@/components/shared/bookmark/bookmark-list-popover";
import { LikeButton } from "@/components/shared/like-button/like-button";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useToggleMapLikeMutation } from "@/lib/mutations/like";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/provider";
import { formatDate } from "@/utils/date";
import { formatTime } from "@/utils/format-time";
import { useBreakPoint } from "@/utils/hooks/use-break-point";
import { useMapIdState } from "../../../_lib/atoms/hydrate";
import { SettingPopover } from "./setting/popover";

export const TabIcons = ({ className }: { className?: string }) => {
  const { data: session } = useSession();

  return (
    <div className={cn("relative flex text-foreground/60 max-md:h-32 max-md:pr-10 md:bottom-1", className)}>
      <InfoIconButton />
      {session?.user.id ? <SettingPopover /> : null}
      {session?.user.id ? <BookmarkListIconButton /> : null}
      {session?.user.id ? <LikeIconButton /> : null}
      <EditIconButton />
    </div>
  );
};

const InfoIconButton = () => {
  const [open, setOpen] = useState(false);
  const trpc = useTRPC();
  const mapId = useMapIdState();
  const { data: mapInfo } = useSuspenseQuery(trpc.map.detail.get.queryOptions({ mapId: mapId ?? 0 }));

  const creatorComment = mapInfo.creator.comment?.trim() ? mapInfo.creator.comment : "-";
  const tags = mapInfo.info.tags ?? [];

  return (
    <HoverCard openDelay={200} closeDelay={200} open={open} onOpenChange={setOpen}>
      <HoverCardTrigger asChild>
        <Button
          variant="unstyled"
          size="icon"
          className="top-7 mr-14 cursor-help hover:text-foreground/90 max-md:relative max-md:top-12 md:mr-3"
          onMouseDown={() => {
            if (!open) {
              setOpen(true);
            }
          }}
        >
          <IoMdInformationCircleOutline className="size-24 md:size-9" />
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-96 max-w-[80vw] p-3 text-xs">
        <div className="mb-2 font-medium text-foreground">譜面情報</div>
        <div className="grid grid-cols-[96px_1fr] gap-x-3 gap-y-1.5">
          <div className="text-muted-foreground">タグ</div>
          <div className="flex flex-wrap gap-1">
            {mapInfo.info.tags.length ? (
              tags.map((tag) => (
                <Button
                  key={tag}
                  asChild
                  variant="secondary"
                  size="xs"
                  className="h-5 rounded-md px-1.5 font-normal text-[11px]"
                >
                  <Link href={`/?keyword=${tag}` as Route}>{tag}</Link>
                </Button>
              ))
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
          <div className="text-muted-foreground">タイトル</div>
          <div className="font-medium text-foreground">{mapInfo.info.title}</div>
          <div className="text-muted-foreground">アーティスト</div>
          <div className="font-medium text-foreground">{mapInfo.info.artistName || "-"}</div>
          <div className="text-muted-foreground">ソース</div>
          <div className="font-medium text-foreground">{mapInfo.info.source || "-"}</div>
          <div className="text-muted-foreground">制作者コメント</div>
          <div className="font-medium text-foreground">{creatorComment}</div>
          <div className="text-muted-foreground">時間</div>
          <div className="font-medium text-foreground">{formatTime(mapInfo.info.duration)}</div>

          <div className="col-span-2 mt-1 border-border border-t pt-2 font-medium text-foreground">難易度</div>
          <div className="text-muted-foreground">中央値kpm</div>
          <div className="font-medium text-foreground">{mapInfo.difficulty.romaKpmMedian}</div>
          <div className="text-muted-foreground">最大kpm</div>
          <div className="font-medium text-foreground">{mapInfo.difficulty.romaKpmMax}</div>
          <div className="text-muted-foreground">打鍵数</div>
          <div className="font-medium text-foreground">{mapInfo.difficulty.romaTotalNotes}</div>

          <div className="col-span-2 mt-1 border-border border-t pt-2" />
          <div className="text-muted-foreground">制作日時</div>
          <div className="font-medium text-foreground">{formatDate(mapInfo.createdAt, "ja-JP")}</div>
          <div className="text-muted-foreground">最終更新日時</div>
          <div className="font-medium text-foreground">{formatDate(mapInfo.updatedAt, "ja-JP")}</div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

const BookmarkListIconButton = () => {
  const mapId = useMapIdState();

  const trpc = useTRPC();
  const { data: mapInfo } = useSuspenseQuery(trpc.map.detail.get.queryOptions({ mapId: mapId ?? 0 }));

  const hasBookmarked = mapInfo.bookmark.hasBookmarked;

  return (
    <TooltipWrapper label="ブックマークリスト" delayDuration={500}>
      <BookmarkListPopover
        mapId={mapId ?? 0}
        hasBookmarked={hasBookmarked}
        variant="unstyled"
        className={cn(
          "group relative bottom-0.5 ml-3 size-20 p-5 max-md:mt-8 max-md:ml-8 md:size-8 dark:hover:bg-transparent",
          hasBookmarked && "hover:opacity-80",
        )}
        iconClassName={cn("size-20 md:size-8", !hasBookmarked && "group-hover:text-foreground/90")}
      />
    </TooltipWrapper>
  );
};

const LikeIconButton = () => {
  const { isSmScreen } = useBreakPoint();
  const toggleMapLike = useToggleMapLikeMutation();
  const trpc = useTRPC();
  const mapId = useMapIdState();
  const { data: mapInfo } = useSuspenseQuery(trpc.map.detail.get.queryOptions({ mapId: mapId ?? 0 }));

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
          "bottom-3.5 max-md:mb-[-25px]",
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
  const { data: mapInfo } = useSuspenseQuery(trpc.map.detail.get.queryOptions({ mapId: mapId ?? 0 }));

  const role = session?.user.role;
  const creatorId = mapInfo.creator.id;
  const userId = session?.user.id;

  const tooltipLabel = `譜面のEditページに移動${Number(userId) !== Number(creatorId) && role === "USER" ? "(閲覧のみ)" : ""}`;
  return (
    <TooltipWrapper label={tooltipLabel} delayDuration={500}>
      <Link href={`/edit/${mapId}`} replace className="max-md:relative max-md:top-[50px] max-md:ml-6">
        <Button variant="unstyled" size="icon" className="hover:text-foreground/90">
          <BiEdit className="size-24 md:size-9" />
        </Button>
      </Link>
    </TooltipWrapper>
  );
};
