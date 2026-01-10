"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { LikeCountIcon } from "@/components/shared/map-count/like-count";
import { RankingCount } from "@/components/shared/map-count/ranking-count";
import { CardHeader } from "@/components/ui/card";
import { HoverExtractCard, HoverExtractCardTrigger } from "@/components/ui/hover-extract-card";
import { Separator } from "@/components/ui/separator";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useReadyInputModeState } from "@/lib/atoms/global-atoms";
import { cn } from "@/lib/utils";
import type { MapListItem } from "@/server/api/routers/map";
import type { RouterOutputs } from "@/server/api/trpc";
import { nolink } from "@/utils/no-link";
import { Badge } from "../../ui/badge";
import { MapLeftThumbnail } from "../map-card-thumbnail";
import { UserNameLinkText } from "../text/user-name-link-text";

interface NotificationMapCardContentProps {
  map: MapListItem;
  user: { id: number; name: string };
  title: ReactNode;
  className: string;
}

export const NotificationMapCardContent = ({ map, user, className, title }: NotificationMapCardContentProps) => {
  return (
    <HoverExtractCard
      variant="map"
      cardClassName="block transition-shadow duration-300 hover:shadow-lg"
      cardContentClassName="flex h-full items-start rounded-md border-none p-0 text-muted-foreground"
      cardHeader={
        <CardHeader className={cn("flex flex-wrap items-center gap-1 rounded-t-md px-2 py-1.5 text-sm", className)}>
          <UserNameLinkText
            className="text-header-foreground underline hover:text-header-foreground"
            userId={user.id}
            userName={user.name}
          />
          <span>{title}</span>
        </CardHeader>
      }
      openDelay={50}
      closeDelay={40}
      extractContent={<MapDifficultyExtractContent map={map} />}
    >
      <MapLeftThumbnail
        alt={map.info.title}
        media={map.media}
        size="notification"
        imageClassName="rounded-t-none rounded-br-none"
      />
      <CompactMapInfo map={map} />
    </HoverExtractCard>
  );
};

interface CompactMapCardProps {
  map: MapListItem;
  thumbnailSize: "activeUser";
}

export const CompactMapCard = ({ map, thumbnailSize }: CompactMapCardProps) => {
  return (
    <HoverExtractCard
      variant="map"
      cardHoverContentClassName="px-2"
      openDelay={50}
      closeDelay={40}
      extractContent={<MapDifficultyExtractContent map={map} />}
    >
      <MapLeftThumbnail alt={map.info.title} media={map.media} size={thumbnailSize} />
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
    <div className="flex w-full flex-col justify-between overflow-hidden py-1 pl-3 text-xs sm:text-sm md:text-base lg:text-lg">
      <Link className="flex h-full flex-col justify-between hover:no-underline" href={`/type/${map.id}`}>
        <section className="flex flex-col gap-1">
          <TooltipWrapper
            delayDuration={300}
            label={nolink(`${map.info.title} / ${map.info.artistName}${musicSource}`)}
          >
            <div className="overflow-hidden truncate whitespace-nowrap font-bold text-base text-secondary">
              {nolink(map.info.title)}
            </div>
          </TooltipWrapper>
          <div className="overflow-hidden truncate whitespace-nowrap font-bold text-secondary text-xs sm:text-sm">
            {nolink(map.info.artistName)}
          </div>
        </section>
        <section className="flex w-[98%] items-center justify-between">
          <MapBadges map={map} />
          <MapIcons mapId={map.id} ranking={map.ranking} like={map.like} />
        </section>
      </Link>
    </div>
  );
};

interface MapBadgesProps {
  map: MapListItem;
}

const MapBadges = ({ map }: MapBadgesProps) => {
  return (
    <HoverExtractCardTrigger>
      <div className="flex-1">
        <Badge variant="accent-light" className="rounded-full px-2 text-sm">
          <span className="hidden text-xs sm:inline-block">★</span>
          {(map.difficulty.romaKpmMedian / 100).toFixed(1)}
        </Badge>
      </div>
    </HoverExtractCardTrigger>
  );
};

interface MapCountIconsProps {
  mapId: number;
  ranking: MapListItem["ranking"];
  like: MapListItem["like"];
}

const MapIcons = ({ mapId, ranking, like }: MapCountIconsProps) => {
  return (
    <div className="flex items-center space-x-1">
      <RankingCount
        key={ranking.myRank}
        myRank={ranking.myRank}
        rankingCount={ranking.count}
        myRankUpdatedAt={ranking.myRankUpdatedAt}
      />
      <LikeCountIcon mapId={mapId} hasLiked={like.hasLiked ?? false} likeCount={like.count} />
    </div>
  );
};

type Map = NonNullable<RouterOutputs["mapList"]["get"]["items"]>[number];

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
