"use client";
import Link from "next/link";
import { LikeCountIcon } from "@/components/shared/map-count/like-count";
import { RankingCount } from "@/components/shared/map-count/ranking-count";
import { CardWithContent } from "@/components/ui/card";
import { TooltipWrapper } from "@/components/ui/tooltip";
import type { MapListItem } from "@/server/api/routers/map-list";
import { formatTime } from "@/utils/format-time";
import { useLazyRender } from "@/utils/hooks/use-lazy-render";
import { nolink } from "@/utils/no-link";
import { Badge } from "../../ui/badge";
import { MapLeftThumbnail } from "../map-card-thumbnail";
import { DateDistanceText } from "../text/date-distance-text";
import { UserNameLinkText } from "../text/user-name-link-text";

interface MapCardProps {
  map: MapListItem;
  className?: string;
  priority?: boolean;
}

export const MapCard = ({ map, className, priority = false }: MapCardProps) => {
  const { ref, shouldRender } = useLazyRender({ priority });
  return <MapCardLayout ref={ref} map={shouldRender ? map : null} className={className} priority={priority} />;
};

interface MapCardLayoutProps {
  ref: ReturnType<typeof useLazyRender>["ref"];
  map: MapListItem | null;
  className?: string;
  priority: boolean;
}

const MapCardLayout = ({ ref, map, className, priority }: MapCardLayoutProps) => {
  return (
    <CardWithContent variant="map" className={{ card: className }} ref={ref}>
      <MapLeftThumbnail
        alt={map?.info.title ?? ""}
        media={map?.media ?? undefined}
        size="home"
        loading={priority ? "eager" : "lazy"}
      />
      {map && <MapInfo map={map} />}
    </CardWithContent>
  );
};

interface MapInfoProps {
  map: MapListItem;
}

const MapInfo = ({ map }: MapInfoProps) => {
  const musicSource = map.info.source ? `【${map.info.source}】` : "";

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden text-xs sm:text-sm md:text-base lg:text-lg">
      <Link className="absolute h-full w-full" href={`/type/${map.id}`} />
      <div className="flex h-full flex-col justify-between pt-2 pl-3 hover:no-underline">
        <section className="flex flex-col gap-1">
          <TooltipWrapper
            delayDuration={500}
            label={nolink(`${map.info.title} / ${map.info.artistName}${musicSource}`)}
          >
            <Link
              href={`/type/${map.id}`}
              className="text-secondary z-1 truncate overflow-hidden text-base font-bold whitespace-nowrap hover:no-underline"
            >
              {map.info.title}
            </Link>
          </TooltipWrapper>

          <div className="text-secondary truncate overflow-hidden text-xs font-bold whitespace-nowrap sm:text-sm">
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

const MapInfoBottom = ({ map }: { map: MapListItem }) => {
  return (
    <div className="mr-3 flex w-fit justify-end md:justify-between lg:w-[98%]">
      <div className="mr-2 flex items-center gap-2">
        <Badge variant="accent-light" className="rounded-full px-2 text-sm">
          <span className="hidden text-xs sm:inline-block">★</span>
          {(map.difficulty.romaKpmMedian / 100).toFixed(1)}
        </Badge>
        <Badge variant="accent-light" className="hidden rounded-full px-2 text-sm md:block">
          {formatTime(map.info.duration)}
        </Badge>
      </div>
      <div className="flex items-center space-x-1">
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
