"use client";
import Link from "next/link";
import { LikeCountIcon } from "@/components/shared/map-count/like-count";
import { RankingCount } from "@/components/shared/map-count/ranking-count";
import { Card, CardContent, CardHeader, CardWithContent } from "@/components/ui/card";
import { TooltipWrapper } from "@/components/ui/tooltip";
import type { MapListItem } from "@/server/api/routers/map-list";
import type { RouterOutPuts } from "@/server/api/trpc";
import { nolink } from "@/utils/no-link";
import { Badge } from "../../ui/badge";
import { MapLeftThumbnail } from "../map-card-thumbnail";
import { UserNameLinkText } from "../text/user-name-link-text";

type Notification = NonNullable<RouterOutPuts["notification"]["getInfinite"]["items"][number]>;

type OverTakeNotification = Extract<Notification, { type: "OVER_TAKE" }>;
export const OverTakeNotificationMapCard = ({ notification }: { notification: OverTakeNotification }) => {
  const { map, visitor, myResult } = notification;
  return (
    <Card variant="map" className="block transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="bg-header-background rounded-t-md px-2 py-1.5 text-sm">
        <span className="flex flex-wrap items-center gap-1">
          <UserNameLinkText
            className="text-header-foreground/80 hover:text-header-foreground underline"
            userId={visitor.id}
            userName={visitor.name}
          />
          <span>
            さんがスコア {visitor.score - myResult.score} 差で {Number(myResult.prevRank)}位 の記録を抜かしました
          </span>
        </span>
      </CardHeader>
      <CardContent className="text-muted-foreground flex h-full items-start rounded-md border-none p-0">
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

type LikeNotification = Extract<Notification, { type: "LIKE" }>;
export const LikeNotificationMapCard = ({ notification }: { notification: LikeNotification }) => {
  const { map, liker } = notification;
  return (
    <Card variant="map" className="block transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="bg-like/85 rounded-t-md px-2 py-1.5 text-sm">
        <span className="flex flex-wrap items-center gap-1">
          <UserNameLinkText
            className="text-header-foreground hover:text-header-foreground underline"
            userId={liker.id}
            userName={liker.name}
          />
          <span>さんが作成した譜面にいいねしました</span>
        </span>
      </CardHeader>
      <CardContent className="text-muted-foreground flex h-full items-start rounded-md border-none p-0">
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

type ClapNotification = Extract<Notification, { type: "CLAP" }>;
export const ClapNotificationMapCard = ({ notification }: { notification: ClapNotification }) => {
  const { map, clapper } = notification;
  return (
    <Card variant="map" className="block transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="bg-perfect/70 rounded-t-md px-2 py-1.5 text-sm">
        <span className="flex flex-wrap items-center gap-1">
          <UserNameLinkText
            className="text-header-foreground hover:text-header-foreground underline"
            userId={clapper.id}
            userName={clapper.name}
          />
          <span>さんが記録に拍手しました</span>
        </span>
      </CardHeader>
      <CardContent className="text-muted-foreground flex h-full items-start rounded-md border-none p-0">
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
    <CardWithContent variant="map">
      <MapLeftThumbnail alt={map.info.title} media={map.media} size={thumbnailSize} />
      <CompactMapInfo map={map} />
    </CardWithContent>
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
            <div className="text-secondary truncate overflow-hidden text-base font-bold whitespace-nowrap">
              {nolink(map.info.title)}
            </div>
          </TooltipWrapper>
          <div className="text-secondary truncate overflow-hidden text-xs font-bold whitespace-nowrap sm:text-sm">
            {nolink(map.info.artistName)}
          </div>
        </section>
        <section className="flex w-[98%] justify-between items-center">
          <MapBadges map={map} />
          <MapCountIcons mapId={map.id} ranking={map.ranking} like={map.like} />
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
      <TooltipWrapper
        label={
          <div>
            <div>最高速度:{map.difficulty.romaKpmMax}kpm</div>
          </div>
        }
      >
        <Badge variant="accent-light" className="rounded-full px-2 text-sm">
          <span className="hidden text-xs sm:inline-block">★</span>
          {(map.difficulty.romaKpmMedian / 100).toFixed(1)}
        </Badge>
      </TooltipWrapper>
    </div>
  );
};

interface MapCountIconsProps {
  mapId: number;
  ranking: MapListItem["ranking"];
  like: MapListItem["like"];
}

const MapCountIcons = ({ mapId, ranking, like }: MapCountIconsProps) => {
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
