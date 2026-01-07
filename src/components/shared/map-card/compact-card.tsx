"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { LikeCountIcon } from "@/components/shared/map-count/like-count";
import { RankingCount } from "@/components/shared/map-count/ranking-count";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { HoverExtractCard, HoverExtractCardTrigger } from "@/components/ui/hover-extract-card";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { MapListItem } from "@/server/api/routers/map";
import { nolink } from "@/utils/no-link";
import { Badge } from "../../ui/badge";
import { MapLeftThumbnail } from "../map-card-thumbnail";
import { UserNameLinkText } from "../text/user-name-link-text";
import { MapDifficultyExtractContent } from "./card";

interface NotificationMapCardContentProps {
  map: MapListItem;
  user: { id: number; name: string };
  title: ReactNode;
  className: string;
}

export const NotificationMapCardContent = ({ map, user, className, title }: NotificationMapCardContentProps) => {
  return (
    <Card variant="map" className="block transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className={cn("flex flex-wrap items-center gap-1 rounded-t-md px-2 py-1.5 text-sm", className)}>
        <UserNameLinkText
          className="text-header-foreground underline hover:text-header-foreground"
          userId={user.id}
          userName={user.name}
        />
        <span>{title}</span>
      </CardHeader>
      <CardContent className="flex h-full items-start rounded-md border-none p-0 text-muted-foreground">
        <MapLeftThumbnail
          alt={map.info.title}
          media={map.media}
          size="notification"
          imageClassName="rounded-t-none rounded-br-none"
        />
        <CompactMapInfo map={map} />
      </CardContent>
    </Card>
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
    <div className="flex">
      <HoverExtractCardTrigger>
        <Badge variant="accent-light" className="rounded-full px-2 text-sm">
          <span className="hidden text-xs sm:inline-block">★</span>
          {(map.difficulty.romaKpmMedian / 100).toFixed(1)}
        </Badge>
      </HoverExtractCardTrigger>
    </div>
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
