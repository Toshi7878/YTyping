"use client";
import type { Route } from "next";
import Link from "next/link";
import { useMapLinkMode } from "@/app/_layout/user-script";
import { useReadyInputMode } from "@/app/(typing)/type/_feature/typing-card/ready/input-mode-radio-cards";
import { MapListActionButtons } from "@/components/shared/map/action-buttons";
import { RatingBadge } from "@/components/shared/map/rating";
import { MapThumbnailImage } from "@/components/shared/map-thumbnail-image";
import { Badge } from "@/components/ui/badge";
import { HoverExtractCard, HoverExtractCardTrigger } from "@/components/ui/hover-extract-card";
import { Separator } from "@/components/ui/separator";
import { TooltipWrapper } from "@/components/ui/tooltip";
import type { MapListItem } from "@/server/api/routers/map";
import type { RouterOutputs } from "@/server/api/trpc";
import { formatTime } from "@/utils/format-time";
import { nolink } from "@/utils/no-link";

interface MinimumMapCardProps {
  map: MapListItem;
}

export const MinimumMapCard = ({ map }: MinimumMapCardProps) => {
  return (
    <HoverExtractCard
      variant="map"
      cardHoverContentClassName="py-1 z-50"
      openDelay={50}
      closeDelay={40}
      extractContent={<MapDifficultyExtractContent map={map} />}
    >
      <MapThumbnailImage
        alt={map.info.title}
        media={map.media}
        size="xs"
        isStyledMap={map.info.categories.includes("CSS")}
      />
      <MinumumMapInfo map={map} />
    </HoverExtractCard>
  );
};

interface MinumumMapInfoProps {
  map: MapListItem;
}

const MinumumMapInfo = ({ map }: MinumumMapInfoProps) => {
  const musicSource = map.info.source ? `【${map.info.source}】` : "";
  const linkMode = useMapLinkMode();
  const link = (linkMode === "type" ? `/type/${map.id}` : `/ime/${map.id}`) as Route;

  return (
    <div className="relative h-auto w-full overflow-hidden">
      <Link className="absolute size-full" href={link} />
      <div className="flex h-full flex-col justify-between pt-0.5 pl-1.5">
        <section className="flex flex-col">
          <TooltipWrapper label={nolink(`${map.info.title} / ${map.info.artistName}${musicSource}`)} asChild>
            <Link href={link} className="z-1 truncate font-bold text-secondary text-sm">
              {nolink(map.info.title)}
            </Link>
          </TooltipWrapper>
          <div className="truncate font-semibold text-secondary text-xs">{nolink(map.info.artistName)}</div>
        </section>
        <section className="flex h-full w-[98%] items-center justify-between">
          <MapBadges map={map} href={link} />
          <MapListActionButtons map={map} showBookmark={false} className="absolute right-1 -bottom-px" />
        </section>
      </div>
    </div>
  );
};

interface MapBadgesProps {
  map: MapListItem;
  href: Route;
}

const MapBadges = ({ map, href }: MapBadgesProps) => {
  return (
    <HoverExtractCardTrigger>
      <Link href={href} className="z-10 mb-0.5 flex flex-1 items-center">
        <RatingBadge rating={map.difficulty.rating} />
      </Link>
    </HoverExtractCardTrigger>
  );
};

type Map = NonNullable<RouterOutputs["map"]["list"]["get"]["items"]>[number];

const MapDifficultyExtractContent = ({ map }: { map: Map }) => {
  const inputMode = useReadyInputMode();
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
