import { useSuspenseQuery } from "@tanstack/react-query";

import type { Route } from "next";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { BookmarkListPopover } from "@/components/shared/bookmark/bookmark-list-popover";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { BookmarkListIconButton, EditIconLinkButton, InfoIconButton } from "@/components/ui/icon-button";
import { LikeToggleButton } from "@/components/ui/like-button/like-button";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useToggleMapLikeMutation } from "@/lib/mutations/like";
import { cn } from "@/lib/utils";
import type { RouterOutputs } from "@/server/api/trpc";
import { useTRPC } from "@/trpc/provider";
import { formatDate } from "@/utils/date";
import { formatTime } from "@/utils/format-time";
import { useMapIdState } from "../../../_lib/atoms/hydrate";
import { SettingPopover } from "./setting/popover";

export const MapActionIconButtons = ({ className }: { className: string }) => {
  const { data: session } = useSession();
  const mapId = useMapIdState();
  const trpc = useTRPC();
  const { data: mapInfo } = useSuspenseQuery(trpc.map.detail.get.queryOptions({ mapId: mapId ?? 0 }));
  const hasBookmarked = mapInfo.bookmark.hasBookmarked;
  const hasLiked = mapInfo.like.hasLiked;

  return (
    <div
      className={cn(
        "mb-1.5 flex gap-18 text-foreground/60 max-md:mr-12 md:gap-1.5 [&>a]:hover:text-foreground/90 [&>button]:hover:text-foreground/90 [&_svg]:size-24! md:[&_svg]:size-9!",
        className,
      )}
    >
      <MapInfoHoverCardButton mapInfo={mapInfo} />
      {session?.user.id && <SettingPopover />}
      {session?.user.id && <BookmarkListButton id={mapInfo.id} hasBookmarked={hasBookmarked} />}
      {session?.user.id && <MapLikeButton id={mapInfo.id} hasLiked={hasLiked} />}
      {session?.user.id && <MapEditLinkButton id={mapInfo.id} />}
    </div>
  );
};

const MapInfoHoverCardButton = ({ mapInfo }: { mapInfo: RouterOutputs["map"]["detail"]["get"] }) => {
  const [open, setOpen] = useState(false);
  const creatorComment = mapInfo.creator.comment?.trim() ? mapInfo.creator.comment : "-";
  const tags = mapInfo.info.tags ?? [];

  return (
    <HoverCard openDelay={200} closeDelay={200} open={open} onOpenChange={setOpen}>
      <HoverCardTrigger asChild>
        <InfoIconButton
          className="cursor-help"
          onMouseDown={() => {
            if (!open) {
              setOpen(true);
            }
          }}
        />
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
    <TooltipWrapper label="いいね">
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
