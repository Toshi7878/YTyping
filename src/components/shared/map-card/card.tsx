"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { LikeCountIcon } from "@/components/shared/map-count/like-count";
import { RankingCount } from "@/components/shared/map-count/ranking-count";
import { HoverExtractCard, HoverExtractCardTrigger } from "@/components/ui/hover-extract-card";
import { Separator } from "@/components/ui/separator";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useReadyInputModeState } from "@/lib/atoms/global-atoms";
import { cn } from "@/lib/utils";
import type { MapListItem } from "@/server/api/routers/map";
import type { RouterOutputs } from "@/server/api/trpc";
import { formatTime } from "@/utils/format-time";
import { useInViewRender } from "@/utils/hooks/intersection";
import { nolink } from "@/utils/no-link";
import { Badge } from "../../ui/badge";
import { BookmarkListPopover } from "../bookmark/bookmark-list-popover";
import { MapLeftThumbnail } from "../map-card-thumbnail";
import { DateDistanceText } from "../text/date-distance-text";
import { UserNameLinkText } from "../text/user-name-link-text";

type Map = NonNullable<RouterOutputs["map"]["list"]["get"]["items"]>[number];

interface MapCardProps {
  map: Map;
  initialInView?: boolean;
  imagePriority?: boolean;
}

export const MapCard = ({ map, initialInView = false, imagePriority = false }: MapCardProps) => {
  const { ref, shouldRender } = useInViewRender({ initialInView });

  return (
    <HoverExtractCard
      variant="map"
      ref={ref}
      openDelay={50}
      closeDelay={40}
      extractContent={<MapDifficultyExtractContent map={map} />}
    >
      <MapLeftThumbnail alt={map.info.title} media={map.media} size="home" priority={imagePriority} />
      {shouldRender && <MapInfo map={map} />}
    </HoverExtractCard>
  );
};

interface MapInfoProps {
  map: Map;
}

const MapInfo = ({ map }: MapInfoProps) => {
  const musicSource = map.info.source ? `【${map.info.source}】` : "";

  return (
    <div className="relative h-auto w-full overflow-hidden">
      <Link className="absolute size-full" href={`/type/${map.id}`} />
      <div className="flex h-full flex-col justify-between pt-0.5 pl-2.5 sm:pt-1.5">
        <section className="flex flex-col sm:gap-0.5">
          <TooltipWrapper
            delayDuration={500}
            label={nolink(`${map.info.title} / ${map.info.artistName}${musicSource}`)}
          >
            <Link href={`/type/${map.id}`} className="z-1 truncate font-bold text-secondary sm:text-lg">
              {map.info.title}
            </Link>
          </TooltipWrapper>
          <div className="truncate font-bold text-secondary text-xs sm:text-sm">
            {nolink(map.info.artistName + musicSource)}
          </div>
          <MapCreatorInfo creator={map.creator} updatedAt={map.updatedAt} className="mt-2" />
        </section>
        <MapBadges map={map} className="mt-2 mb-0.5" />
        <MapCountIcons map={map} />
      </div>
    </div>
  );
};

const MapBadges = ({ map, className }: { map: Map; className?: string }) => {
  return (
    <HoverExtractCardTrigger>
      <Link href={`/type/${map.id}`} className={cn("z-10 flex flex-1 items-center gap-2", className)}>
        <Badge variant="accent-light" size="xs" className="rounded-full">
          <span>★</span>
          <span>{(map.difficulty.romaKpmMedian / 100).toFixed(1)}</span>
        </Badge>
        <Badge variant="accent-light" size="xs" className="rounded-full max-lg:hidden">
          {formatTime(map.info.duration)}
        </Badge>
      </Link>
    </HoverExtractCardTrigger>
  );
};

const MapCountIcons = ({ map }: { map: Map }) => {
  const { status } = useSession();

  return (
    <div className="absolute right-1 -bottom-px flex items-center space-x-1">
      {status === "authenticated" ? (
        <BookmarkListPopover
          className="relative z-10 mr-1.5"
          mapId={map.id}
          hasBookmarked={map.bookmark.hasBookmarked}
        />
      ) : null}
      <RankingCount
        className="z-10"
        myRank={map.ranking.myRank}
        rankingCount={map.ranking.count}
        myRankUpdatedAt={map.ranking.myRankUpdatedAt}
      />
      <LikeCountIcon mapId={map.id} hasLiked={map.like.hasLiked ?? false} likeCount={map.like.count} />
    </div>
  );
};

interface MapCreatorInfoProps {
  creator: MapListItem["creator"];
  updatedAt: Date;
  className?: string;
}

{
  /* <div className={cn("truncate text-[0.6rem]", className)}>
  <UserNameLinkText userId={creator.id} userName={creator.name} />
  <span className="mx-1">
    - <DateDistanceText date={updatedAt} />
  </span>
</div>; */
}
const MapCreatorInfo = ({ creator, updatedAt, className }: MapCreatorInfoProps) => {
  return (
    <div className={cn("truncate text-[0.6rem] sm:text-xs", className)}>
      <UserNameLinkText userId={creator.id} userName={creator.name} />
      <span className="mx-1">
        - <DateDistanceText date={updatedAt} />
      </span>
    </div>
  );
};

const MapDifficultyExtractContent = ({ map }: { map: Map }) => {
  const inputMode = useReadyInputModeState();
  const kpm = inputMode === "roma" ? map.difficulty.romaKpmMedian : map.difficulty.kanaKpmMedian;
  const maxKpm = inputMode === "roma" ? map.difficulty.romaKpmMax : map.difficulty.kanaKpmMax;
  const totalNotes = inputMode === "roma" ? map.difficulty.romaTotalNotes : map.difficulty.kanaTotalNotes;
  return (
    <div className="flex flex-wrap items-center gap-x-3">
      <Badge variant={inputMode === "roma" ? "roma" : "kana"} size="xs">
        {inputMode === "roma" ? "ローマ字" : "かな"}
      </Badge>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">中央値</span>
        <span className="font-semibold tabular-nums">{kpm}kpm</span>
      </div>
      <Separator orientation="vertical" className="bg-border/60 data-[orientation=vertical]:h-3" />
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">最大</span>
        <span className="font-semibold tabular-nums">{maxKpm}kpm</span>
      </div>
      <Separator orientation="vertical" className="bg-border/60 data-[orientation=vertical]:h-3" />
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">打鍵数</span>
        <span className="font-semibold tabular-nums">{totalNotes}打</span>
      </div>
    </div>
  );
};
