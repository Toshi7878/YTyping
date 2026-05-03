"use client";
import type { Route } from "next";
import Link from "next/link";
import { HoverExtractCard, HoverExtractCardTrigger } from "@/components/ui/hover-extract-card";
import { Separator } from "@/components/ui/separator";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useMapLinkMode, useReadyInputModeState } from "@/lib/atoms/global-atoms";
import { useSession } from "@/lib/auth-client";
import { calcChunkRatios } from "@/lib/build-map/built-map-helper";
import { cn } from "@/lib/utils";
import type { MapListItem } from "@/server/api/routers/map";
import type { RouterOutputs } from "@/server/api/trpc";
import { formatTime } from "@/utils/format-time";
import { useInViewRender } from "@/utils/hooks/intersection";
import { nolink } from "@/utils/no-link";
import { Badge } from "../../ui/badge";
import { MapListActionButtons } from "../list-action-buttons";
import { RatingBadge } from "../map/rating";
import { MapThumbnailImage } from "../map-thumbnail-image";
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
      <MapThumbnailImage
        alt={map.info.title}
        media={map.media}
        size="md"
        priority={imagePriority}
        isStyledMap={map.info.categories.includes("CSS")}
      />
      {shouldRender && <MapInfo map={map} />}
    </HoverExtractCard>
  );
};

interface MapInfoProps {
  map: Map;
}

const MapInfo = ({ map }: MapInfoProps) => {
  const { data: session } = useSession();
  const musicSource = map.info.source ? `【${map.info.source}】` : "";
  const linkMode = useMapLinkMode();
  const link = (linkMode === "type" ? `/type/${map.id}` : `/ime/${map.id}`) as Route;

  return (
    <div className="relative h-auto w-full overflow-hidden">
      <Link className="absolute size-full" href={link} />
      <div className="flex h-full flex-col justify-between pt-0.5 pl-2.5 sm:pt-1.5">
        <section className="flex flex-col sm:gap-0.5">
          <TooltipWrapper label={nolink(`${map.info.title} / ${map.info.artistName}${musicSource}`)} asChild>
            <Link href={link} className="z-1 truncate font-bold text-secondary sm:text-lg">
              {map.info.title}
            </Link>
          </TooltipWrapper>
          <div className="truncate font-bold text-secondary text-xs sm:text-sm">
            {nolink(map.info.artistName + musicSource)}
          </div>
          <MapCreatorInfo
            creator={map.creator}
            updatedAt={map.updatedAt}
            isUnlisted={map.info.visibility === "UNLISTED"}
            className="mt-2"
          />
        </section>
        <MapBadges map={map} href={link} className="mt-2 mb-0.5" />
        <MapListActionButtons map={map} showBookmark={!!session} className="absolute right-1 -bottom-px" />
      </div>
    </div>
  );
};

const MapBadges = ({ map, href, className }: { map: Map; href: Route; className?: string }) => {
  return (
    <HoverExtractCardTrigger>
      <Link href={href} className={cn("z-10 flex flex-1 items-center gap-2", className)}>
        <RatingBadge rating={map.difficulty.rating} />
        <Badge variant="accent-light" className="rounded-full max-lg:hidden">
          {formatTime(map.info.duration)}
        </Badge>
      </Link>
    </HoverExtractCardTrigger>
  );
};

interface MapCreatorInfoProps {
  creator: MapListItem["creator"];
  updatedAt: Date;
  isUnlisted: boolean;
  className?: string;
}

const MapCreatorInfo = ({ creator, updatedAt, isUnlisted, className }: MapCreatorInfoProps) => {
  return (
    <div className={cn("truncate text-[0.6rem] sm:text-xs", className)}>
      <UserNameLinkText userId={creator.id} userName={creator.name} />
      <span className="mx-1">
        - <DateDistanceText date={updatedAt} />
      </span>
      {isUnlisted ? (
        <Badge variant="outline" size="xs" className="h-4 rounded-full px-1 text-[0.6rem]">
          限定公開
        </Badge>
      ) : null}
    </div>
  );
};

const MapDifficultyExtractContent = ({ map }: { map: Map }) => {
  const inputMode = useReadyInputModeState();
  const maxKpm = inputMode === "roma" ? map.difficulty.romaKpmMax : map.difficulty.kanaKpmMax;
  const totalNotes = inputMode === "roma" ? map.difficulty.romaTotalNotes : map.difficulty.kanaTotalNotes;
  const { kanaRatio, alphabetRatio, otherRatio } = calcChunkRatios(map.difficulty);
  return (
    <div className="flex flex-wrap items-center gap-x-3">
      <Badge variant={kanaRatio === 0 ? "english" : inputMode === "roma" ? "roma" : "kana"} size="xs">
        {kanaRatio === 0 ? "英語" : inputMode === "roma" ? "ローマ字" : "かな"}
      </Badge>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">最大</span>
        <span className="font-semibold tabular-nums">{maxKpm}kpm</span>
      </div>
      <Separator orientation="vertical" className="bg-border/60 data-[orientation=vertical]:h-3" />
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">打鍵数</span>
        <span className="font-semibold tabular-nums">{totalNotes}打</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground">かな</span>
        <span className="font-semibold tabular-nums">{Math.round(kanaRatio * 100)}%</span>
        <span className="text-muted-foreground">英字</span>
        <span className="font-semibold tabular-nums">{Math.round(alphabetRatio * 100)}%</span>
        <span className="text-muted-foreground">記号</span>
        <span className="font-semibold tabular-nums">{Math.round(otherRatio * 100)}%</span>
      </div>
    </div>
  );
};
