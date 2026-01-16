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
import { useInViewRender } from "@/utils/hooks/intersection";
import { nolink } from "@/utils/no-link";
import { Badge } from "../../ui/badge";
import { BookmarkListPopover } from "../bookmark/bookmark-list-popover";
import { MapLeftThumbnail } from "../map-card-thumbnail";
import { DateDistanceText } from "../text/date-distance-text";
import { UserNameLinkText } from "../text/user-name-link-text";

interface ThreeColumnCompactMapCardProps {
  map: MapListItem;
  initialInView: boolean;
}

export const ThreeColumnCompactMapCard = ({ map, initialInView }: ThreeColumnCompactMapCardProps) => {
  const { ref, shouldRender } = useInViewRender({ initialInView });
  return (
    <HoverExtractCard
      ref={ref}
      variant="map"
      cardContentClassName="h-full"
      cardHoverContentClassName="px-2"
      openDelay={50}
      closeDelay={40}
      extractContent={<MapDifficultyExtractContent map={map} />}
    >
      <MapLeftThumbnail
        alt={shouldRender ? map.info.title : ""}
        media={shouldRender ? map.media : undefined}
        size={"notification"}
        priority={shouldRender}
      />
      {shouldRender && <CompactMapInfo map={map} />}
    </HoverExtractCard>
  );
};

interface CompactMapInfoProps {
  map: MapListItem;
}

const CompactMapInfo = ({ map }: CompactMapInfoProps) => {
  const musicSource = map.info.source ? `【${map.info.source}】` : "";

  return (
    <div className="flex size-full flex-col justify-between overflow-hidden rounded-md bg-card pt-0.5 pl-2 text-xs sm:text-sm md:text-base lg:text-lg">
      <Link className="absolute inset-0 flex size-full" href={`/type/${map.id}`} />
      <section className="flex flex-col">
        <TooltipWrapper delayDuration={300} label={nolink(`${map.info.title} / ${map.info.artistName}${musicSource}`)}>
          <div className="overflow-hidden truncate whitespace-nowrap font-bold text-base text-secondary">
            {nolink(map.info.title)}
          </div>
        </TooltipWrapper>
        <div className="overflow-hidden truncate whitespace-nowrap font-bold text-secondary text-xs">
          {nolink(map.info.artistName)}
        </div>
        <MapCreatorInfo creator={map.creator} updatedAt={map.updatedAt} />
      </section>
      <section className="flex w-[98%] items-center justify-between">
        <MapBadges map={map} />
        <MapIcons map={map} />
      </section>
    </div>
  );
};

interface MapCreatorInfoProps {
  creator: MapListItem["creator"];
  updatedAt: Date;
}

export const MapCreatorInfo = ({ creator, updatedAt }: MapCreatorInfoProps) => {
  return (
    <small className="mt-1.5 truncate text-[0.6rem]">
      <UserNameLinkText userId={creator.id} userName={creator.name} />
      <span className="mx-1">
        - <DateDistanceText date={updatedAt} />
      </span>
    </small>
  );
};

interface MapBadgesProps {
  map: MapListItem;
}

const MapBadges = ({ map }: MapBadgesProps) => {
  return (
    <HoverExtractCardTrigger>
      <Link href={`/type/${map.id}`} className="z-10 mb-0.5 flex flex-1 items-center">
        <Badge variant="accent-light" className="h-5 rounded-full px-1 text-xs">
          <span>★</span>
          {(map.difficulty.romaKpmMedian / 100).toFixed(1)}
        </Badge>
      </Link>
    </HoverExtractCardTrigger>
  );
};

interface MapCountIconsProps {
  map: MapListItem;
}

const MapIcons = ({ map }: MapCountIconsProps) => {
  const { status } = useSession();

  return (
    <div className="absolute right-1 -bottom-px flex items-center space-x-1">
      {status === "authenticated" ? (
        <BookmarkListPopover
          className="relative z-10 mr-1 size-8"
          mapId={map.id}
          hasBookmarked={map.bookmark.hasBookmarked}
        />
      ) : null}
      <RankingCount
        className="z-10"
        key={map.ranking.myRank}
        myRank={map.ranking.myRank}
        rankingCount={map.ranking.count}
        myRankUpdatedAt={map.ranking.myRankUpdatedAt}
      />
      <LikeCountIcon mapId={map.id} hasLiked={map.like.hasLiked ?? false} likeCount={map.like.count} />
    </div>
  );
};

type Map = NonNullable<RouterOutputs["map"]["list"]["get"]["items"]>[number];

const MapDifficultyExtractContent = ({ map }: { map: Map }) => {
  const inputMode = useReadyInputModeState();
  const maxKpm = inputMode === "roma" ? map.difficulty.romaKpmMax : map.difficulty.kanaKpmMax;
  const totalNotes = inputMode === "roma" ? map.difficulty.romaTotalNotes : map.difficulty.kanaTotalNotes;
  return (
    <div className="flex flex-wrap items-center gap-x-2">
      <Badge variant={inputMode === "roma" ? "roma" : "kana"} size="xs">
        {inputMode === "roma" ? "ローマ字" : "かな"}
      </Badge>
      <Separator orientation="vertical" className="bg-border/60 data-[orientation=vertical]:h-3" />
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">最大</span>
        <span className="font-semibold tabular-nums">{maxKpm}kpm</span>
      </div>
      <Separator orientation="vertical" className="bg-border/60 data-[orientation=vertical]:h-3" />
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">打鍵数</span>
        <span className="font-semibold tabular-nums">{totalNotes}打</span>
      </div>
    </div>
  );
};
