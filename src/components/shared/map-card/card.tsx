"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { LikeCountIcon } from "@/components/shared/map-count/like-count";
import { RankingCount } from "@/components/shared/map-count/ranking-count";
import { HoverExtractCard, HoverExtractCardTrigger } from "@/components/ui/hover-extract-card";
import { Separator } from "@/components/ui/separator";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useReadyInputModeState } from "@/lib/atoms/global-atoms";
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
    <div className="relative flex size-full flex-col justify-between overflow-hidden text-xs sm:text-sm md:text-base lg:text-lg">
      <Link className="absolute size-full" href={`/type/${map.id}`} />
      <div className="flex h-full flex-col justify-between pt-2 pl-3 hover:no-underline">
        <section className="flex flex-col gap-1">
          <TooltipWrapper
            delayDuration={500}
            label={nolink(`${map.info.title} / ${map.info.artistName}${musicSource}`)}
          >
            <Link
              href={`/type/${map.id}`}
              className="z-1 overflow-hidden truncate whitespace-nowrap font-bold text-base text-secondary hover:no-underline"
            >
              {map.info.title}
            </Link>
          </TooltipWrapper>

          <div className="overflow-hidden truncate whitespace-nowrap font-bold text-secondary text-xs sm:text-sm">
            {nolink(map.info.artistName + musicSource)}
          </div>
        </section>
        <section className="flex flex-row items-baseline justify-between space-y-1 lg:flex-col">
          <MapCreatorInfo creator={map.creator} updatedAt={map.updatedAt} />

          <MapInfoBottom map={map} />
        </section>
      </div>
    </div>
  );
};

const MapInfoBottom = ({ map }: { map: Map }) => {
  const { status } = useSession();

  return (
    <div className="mr-3 flex w-fit justify-end md:justify-between lg:w-[98%]">
      <HoverExtractCardTrigger>
        <Link href={`/type/${map.id}`} className="z-10 mr-2 flex flex-1 items-center gap-2">
          <Badge variant="accent-light" className="rounded-full px-2 text-sm">
            <span className="hidden text-xs sm:inline-block">★</span>
            {(map.difficulty.romaKpmMedian / 100).toFixed(1)}
          </Badge>
          <Badge variant="accent-light" className="hidden rounded-full px-2 text-sm md:block">
            {formatTime(map.info.duration)}
          </Badge>
        </Link>
      </HoverExtractCardTrigger>
      <div className="z-10 flex items-center space-x-1">
        {status === "authenticated" ? (
          <BookmarkListPopover className="relative mr-1.5" mapId={map.id} hasBookmarked={map.bookmark.hasBookmarked} />
        ) : null}
        <RankingCount
          myRank={map.ranking.myRank}
          rankingCount={map.ranking.count}
          myRankUpdatedAt={map.ranking.myRankUpdatedAt}
        />
        <LikeCountIcon mapId={map.id} hasLiked={map.like.hasLiked ?? false} likeCount={map.like.count} />
      </div>
    </div>
  );
};

interface MapCreatorInfoProps {
  creator: MapListItem["creator"];
  updatedAt: Date;
}

const MapCreatorInfo = ({ creator, updatedAt }: MapCreatorInfoProps) => {
  return (
    <small className="mt-2 block truncate">
      <UserNameLinkText userId={creator.id} userName={creator.name} />
      <span className="hidden text-xs md:inline-block">
        <span className="mx-1">
          - <DateDistanceText date={updatedAt} />
        </span>
      </span>
    </small>
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
