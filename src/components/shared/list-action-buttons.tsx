import { useProgress } from "@bprogress/next";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { BookmarkListIconButton, RankingStarIconButton } from "@/components/ui/icon-button";
import { LikeToggleButton } from "@/components/ui/like-button/like-button";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useToggleMapLikeMutation } from "@/lib/mutations/like";
import { cn } from "@/lib/utils";
import type { MapListItem } from "@/server/api/routers/map";
import { BookmarkListPopover } from "./bookmark/bookmark-list-popover";

export const MapListActionButtons = ({
  showBookmark = true,
  map,
  className,
}: {
  showBookmark?: boolean;
  map: MapListItem;
  className?: string;
}) => {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {showBookmark && <MapListBookmarkButton mapId={map.id} hasBookmarked={map.bookmark.hasBookmarked} />}
      <RankingCountButton
        myRank={map.ranking.myRank}
        rankingCount={map.ranking.count}
        myRankUpdatedAt={map.ranking.myRankUpdatedAt}
      />
      <LikeCountButton mapId={map.id} hasLiked={map.like.hasLiked} likeCount={map.like.count} />
    </div>
  );
};

const LikeCountButton = ({
  mapId,
  hasLiked,
  likeCount,
}: {
  mapId: number | null;
  hasLiked: boolean;
  likeCount: number;
}) => {
  const { status } = useSession();
  const setLikeMutation = useToggleMapLikeMutation();
  const { stop } = useProgress();

  if (status !== "authenticated" || !mapId) {
    return <LikeToggleButton label={likeCount.toString()} liked={false} disabled={false} size="xs" />;
  }

  const handleClick = () => {
    if (setLikeMutation.isPending) return;
    setLikeMutation.mutate({ mapId, newState: !hasLiked });
    stop();
  };

  return (
    <LikeToggleButton
      label={likeCount.toString()}
      liked={hasLiked}
      onClick={handleClick}
      size="xs"
      className="z-30 hover:bg-like/30"
    />
  );
};

const MapListBookmarkButton = ({ mapId, hasBookmarked }: { mapId: number; hasBookmarked: boolean }) => {
  return (
    <BookmarkListPopover
      mapId={mapId}
      trigger={
        <BookmarkListIconButton
          size="xs"
          bookmarked={hasBookmarked}
          className="z-30 text-muted-foreground hover:bg-primary-light/30"
        />
      }
    />
  );
};

const RankingCountButton = ({
  myRank,
  rankingCount,
  myRankUpdatedAt,
}: {
  myRank: number | null;
  rankingCount: number;
  myRankUpdatedAt: Date | null;
}) => {
  const { data: session } = useSession();

  const buildColorClass = (myRank: number | null, session: Session | null) => {
    if (!session) return "text-muted-foreground";
    if (myRank === 1) return "text-perfect";
    if (myRank) return "text-secondary";
    return "text-muted-foreground";
  };

  const colorClass = buildColorClass(myRank, session);
  return (
    <TooltipWrapper
      label={
        <div>
          <p>
            自分の順位: <span className="font-bold">{myRank}位</span> (
            {myRankUpdatedAt?.toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
            })}
            )
          </p>
        </div>
      }
      disabled={!myRank || !session}
    >
      <RankingStarIconButton label={rankingCount.toString()} size="xs" className={cn(colorClass, "z-30 cursor-help")} />
    </TooltipWrapper>
  );
};
