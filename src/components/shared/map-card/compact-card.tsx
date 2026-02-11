"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { ReactNode } from "react";
import { CardHeader } from "@/components/ui/card";
import { HoverExtractCard, HoverExtractCardTrigger } from "@/components/ui/hover-extract-card";
import { Separator } from "@/components/ui/separator";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useReadyInputModeState } from "@/lib/atoms/global-atoms";
import { cn } from "@/lib/utils";
import type { MapListItem } from "@/server/api/routers/map";
import type { RouterOutputs } from "@/server/api/trpc";
import { formatTime } from "@/utils/format-time";
import { useInViewRender } from "@/utils/hooks/intersection";
import { nolink } from "@/utils/no-link";
import { Badge } from "../../ui/badge";
import { MapListActionButtons } from "../like-count";
import { MapThumbnailImage } from "../map-thumbnail-image";
import { DateDistanceText } from "../text/date-distance-text";
import { UserNameLinkText } from "../text/user-name-link-text";

interface NotificationMapCardProps {
  map: MapListItem;
  user: { id: number; name: string };
  title: ReactNode;
  className: string;
}

export const NotificationMapCard = ({ map, user, className, title }: NotificationMapCardProps) => {
  return (
    <HoverExtractCard
      variant="map"
      cardClassName="block"
      cardHoverContentClassName="py-2 z-50"
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
      <MapThumbnailImage
        alt={map.info.title}
        media={map.media}
        size="sm"
        imageClassName="rounded-t-none rounded-br-none"
        isStyledMap={map.info.categories.includes("CSS")}
      />
      <CompactMapInfo map={map} />
    </HoverExtractCard>
  );
};

interface CompactMapCardProps {
  map: MapListItem;
  initialInView: boolean;
  imagePriority?: boolean;
}

export const CompactMapCard = ({ map, initialInView, imagePriority = false }: CompactMapCardProps) => {
  const { ref, shouldRender } = useInViewRender({ initialInView });
  return (
    <HoverExtractCard
      variant="map"
      cardHoverContentClassName="py-2"
      ref={ref}
      openDelay={50}
      closeDelay={40}
      extractContent={<MapDifficultyExtractContent map={map} />}
    >
      <MapThumbnailImage
        alt={map.info.title}
        media={map.media}
        size="sm"
        priority={imagePriority}
        isStyledMap={map.info.categories.includes("CSS")}
      />
      {shouldRender && <CompactMapInfo map={map} />}
    </HoverExtractCard>
  );
};

interface CompactMapInfoProps {
  map: MapListItem;
}

const CompactMapInfo = ({ map }: CompactMapInfoProps) => {
  const { status } = useSession();
  const musicSource = map.info.source ? `【${map.info.source}】` : "";

  return (
    <div className="relative h-auto w-full overflow-hidden rounded-md">
      <Link className="absolute size-full" href={`/type/${map.id}`} />
      <div className="flex h-full flex-col justify-between pt-0.5 pl-1.5">
        <section className="flex flex-col">
          <TooltipWrapper
            delayDuration={300}
            label={nolink(`${map.info.title} / ${map.info.artistName}${musicSource}`)}
          >
            <Link href={`/type/${map.id}`} className="z-1 truncate font-bold text-secondary">
              {nolink(map.info.title)}
            </Link>
          </TooltipWrapper>
          <div className="truncate font-semibold text-secondary text-xs">{nolink(map.info.artistName)}</div>
          <MapCreatorInfo className="mt-1.5" creator={map.creator} updatedAt={map.updatedAt} />
        </section>
        <MapBadges map={map} />
        <MapListActionButtons
          map={map}
          showBookmark={status === "authenticated"}
          className="absolute right-1 -bottom-px"
        />
      </div>
    </div>
  );
};

interface MapCreatorInfoProps {
  creator: MapListItem["creator"];
  updatedAt: Date;
  className?: string;
}

const MapCreatorInfo = ({ creator, updatedAt, className }: MapCreatorInfoProps) => {
  return (
    <div className={cn("truncate text-[0.6rem]", className)}>
      <UserNameLinkText userId={creator.id} userName={creator.name} />
      <span className="mx-1">
        - <DateDistanceText date={updatedAt} />
      </span>
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
        <Badge variant="accent-light" size="xs" className="rounded-full">
          <span>★</span>
          <span>{(map.difficulty.romaKpmMedian / 100).toFixed(1)}</span>
        </Badge>
      </Link>
    </HoverExtractCardTrigger>
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
      <Badge variant={inputMode === "roma" ? "roma" : "kana"} size="xs">
        {inputMode === "roma" ? "ローマ字" : "かな"}
      </Badge>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">最大</span>
        <span className="font-semibold tabular-nums">{maxKpm}kpm</span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">打鍵数</span>
        <span className="font-semibold tabular-nums">{totalNotes}打</span>
      </div>
    </div>
  );
};
