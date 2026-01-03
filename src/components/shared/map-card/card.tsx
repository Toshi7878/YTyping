"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRef, useState } from "react";
import { LikeCountIcon } from "@/components/shared/map-count/like-count";
import { RankingCount } from "@/components/shared/map-count/ranking-count";
import { CardWithContent } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { TooltipWrapper } from "@/components/ui/tooltip";
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

type Map = NonNullable<RouterOutputs["mapList"]["get"]["items"]>[number];

interface MapCardProps {
  map: Map;
  className?: string;
  initialInView?: boolean;
}

export const MapCard = ({ map, className, initialInView = false }: MapCardProps) => {
  const { ref, shouldRender } = useInViewRender({ initialInView });
  const cardContentRef = useRef<HTMLDivElement>(null);
  const [hoverOpen, setHoverOpen] = useState(false);
  return (
    <CardWithContent
      variant="map"
      className={{ card: className, cardContent: cn("relative", hoverOpen ? "z-50" : "") }}
      cardContentRef={cardContentRef}
      ref={ref}
    >
      {hoverOpen && (
        <div className="absolute bottom-0 left-0 z-10 size-full rounded-t-md border-primary-light border-x-2 border-t-2" />
      )}
      <MapLeftThumbnail
        alt={shouldRender ? map.info.title : ""}
        media={shouldRender ? map.media : undefined}
        size="home"
        priority={initialInView}
      />
      {shouldRender && (
        <MapInfo map={map} cardContentRef={cardContentRef} hoverOpen={hoverOpen} setHoverOpen={setHoverOpen} />
      )}
    </CardWithContent>
  );
};

interface MapInfoProps {
  map: Map;
  cardContentRef: React.RefObject<HTMLDivElement | null>;
  hoverOpen: boolean;
  setHoverOpen: (hoverOpen: boolean) => void;
}

const MapInfo = ({ map, cardContentRef, hoverOpen, setHoverOpen }: MapInfoProps) => {
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

          <MapInfoBottom map={map} cardContentRef={cardContentRef} hoverOpen={hoverOpen} setHoverOpen={setHoverOpen} />
        </section>
      </div>
    </div>
  );
};

const MapInfoBottom = ({
  map,
  cardContentRef,
  hoverOpen,
  setHoverOpen,
}: {
  map: Map;
  cardContentRef: React.RefObject<HTMLDivElement | null>;
  hoverOpen: boolean;
  setHoverOpen: (hoverOpen: boolean) => void;
}) => {
  const { status } = useSession();

  return (
    <div className="mr-3 flex w-fit justify-end md:justify-between lg:w-[98%]">
      <HoverCard openDelay={100} closeDelay={0} open={hoverOpen} onOpenChange={setHoverOpen}>
        <HoverCardTrigger asChild>
          <Link href={`/type/${map.id}`} className="z-10 mr-2 flex flex-1 items-center gap-2">
            <Badge variant="accent-light" className="rounded-full px-2 text-sm">
              <span className="hidden text-xs sm:inline-block">★</span>
              {(map.difficulty.romaKpmMedian / 100).toFixed(1)}
            </Badge>
            <Badge variant="accent-light" className="hidden rounded-full px-2 text-sm md:block">
              {formatTime(map.info.duration)}
            </Badge>
          </Link>
        </HoverCardTrigger>
        <HoverCardContent
          className="z-40 flex flex-col gap-3 rounded-t-none border-primary-light border-x-2 border-t-0 border-b-2 px-3 py-3 text-sm"
          align="start"
          alignOffset={-236}
          sideOffset={-2}
          style={{ width: cardContentRef.current?.offsetWidth ?? 0 }}
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">難易度</span>
              <span className="font-semibold tabular-nums">{map.difficulty.romaKpmMedian}kpm</span>
            </div>

            <div className="h-3 w-px bg-border/60" />

            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">最大KPM</span>
              <span className="font-semibold tabular-nums">{map.difficulty.romaKpmMax}kpm</span>
            </div>

            <div className="h-3 w-px bg-border/60" />

            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">ローマ字打鍵数</span>
              <span className="font-semibold tabular-nums">{map.difficulty.romaTotalNotes}打</span>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
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
