"use client";
import Link from "next/link";
import { LikeCountIcon } from "@/components/shared/map-count/like-count";
import { RankingCount } from "@/components/shared/map-count/ranking-count";
import { HoverExtractCard, HoverExtractCardTrigger } from "@/components/ui/hover-extract-card";
import { Separator } from "@/components/ui/separator";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useReadyInputModeState } from "@/lib/atoms/global-atoms";
import type { MapListItem } from "@/server/api/routers/map";
import type { RouterOutputs } from "@/server/api/trpc";
import { formatTime } from "@/utils/format-time";
import { nolink } from "@/utils/no-link";
import { Badge } from "../../ui/badge";
import { MapLeftThumbnail } from "../map-card-thumbnail";

interface MinimumMapCardProps {
  map: MapListItem;
}

export const MinimumMapCard = ({ map }: MinimumMapCardProps) => {
  return (
    <HoverExtractCard
      variant="map"
      cardHoverContentClassName="py-1"
      openDelay={50}
      closeDelay={40}
      extractContent={<MapDifficultyExtractContent map={map} />}
    >
      <MapLeftThumbnail alt={map.info.title} media={map.media} size="xs" />
      <CompactMapInfo map={map} />
    </HoverExtractCard>
  );
};

interface CompactMapInfoProps {
  map: MapListItem;
}

const CompactMapInfo = ({ map }: CompactMapInfoProps) => {
  const musicSource = map.info.source ? `【${map.info.source}】` : "";

  return (
    <div className="relative h-auto w-full overflow-hidden">
      <Link className="absolute size-full" href={`/type/${map.id}`} />
      <div className="flex h-full flex-col justify-between pt-0.5 pl-1.5">
        <section className="flex flex-col">
          <TooltipWrapper
            delayDuration={300}
            label={nolink(`${map.info.title} / ${map.info.artistName}${musicSource}`)}
          >
            <Link href={`/type/${map.id}`} className="z-1 truncate font-bold text-secondary text-sm">
              {nolink(map.info.title)}
            </Link>
          </TooltipWrapper>
          <div className="truncate font-semibold text-secondary text-xs">{nolink(map.info.artistName)}</div>
        </section>
        <section className="flex h-full w-[98%] items-center justify-between">
          <MapBadges map={map} />
          <MapIcons map={map} />
        </section>
      </div>
    </div>
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
          <span>{(map.difficulty.romaKpmMedian / 100).toFixed(1)}</span>
        </Badge>
      </Link>
    </HoverExtractCardTrigger>
  );
};

interface MapCountIconsProps {
  map: MapListItem;
}

const MapIcons = ({ map }: MapCountIconsProps) => {
  return (
    <div className="absolute right-1 -bottom-px flex items-center space-x-1">
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
      <Badge variant="accent-light" size="xs" className="rounded-full">
        {formatTime(map.info.duration)}
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
