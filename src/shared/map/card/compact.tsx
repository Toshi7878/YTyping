"use client";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { CardHeader } from "@/components/ui/card";
import { HoverExtractCard, HoverExtractCardTrigger } from "@/components/ui/hover-extract-card";
import { Separator } from "@/components/ui/separator";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useSession } from "@/lib/auth-client";
import { calcChunkRatios } from "@/lib/build-map/built-map-helper";
import { cn } from "@/lib/tailwind";
import type { MapListItem } from "@/server/api/routers/map";
import type { RouterOutputs } from "@/server/api/trpc";
import { MapListActionButtons } from "@/shared/map/action-buttons";
import { MapThumbnailImage } from "@/shared/map-thumbnail-image";
import { DateDistanceText } from "@/shared/text/date-distance-text";
import { UserNameLinkText } from "@/shared/text/user-name-link-text";
import { useMapLinkMode } from "@/store/map-link-type";
import { useReadyInputMode } from "@/store/ready-input-mode";
import { formatTime } from "@/utils/format-time";
import { useInViewRender } from "@/utils/hooks/intersection";
import { nolink } from "@/utils/no-link";
import { RatingBadge } from "../rating";

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
  const { data: session } = useSession();
  const linkMode = useMapLinkMode();
  const musicSource = map.info.source ? `【${map.info.source}】` : "";
  const link = (linkMode === "type" ? `/type/${map.id}` : `/ime/${map.id}`) as Route;

  return (
    <div className="relative h-auto w-full overflow-hidden rounded-md">
      <Link className="absolute size-full" href={link} />
      <div className="flex h-full flex-col justify-between pt-0.5 pl-1.5">
        <section className="flex flex-col">
          <TooltipWrapper label={nolink(`${map.info.title} / ${map.info.artistName}${musicSource}`)} asChild>
            <Link href={link} className="z-1 truncate font-bold text-secondary">
              {nolink(map.info.title)}
            </Link>
          </TooltipWrapper>
          <div className="truncate font-semibold text-secondary text-xs">{nolink(map.info.artistName)}</div>
          <MapCreatorInfo
            creator={map.creator}
            updatedAt={map.updatedAt}
            isUnlisted={map.info.visibility === "UNLISTED"}
            className="mt-1.5"
          />
        </section>
        <MapBadges map={map} href={link} />
        <MapListActionButtons map={map} showBookmark={!!session} className="absolute right-1 -bottom-px" />
      </div>
    </div>
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
    <div className={cn("truncate text-[0.6rem]", className)}>
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
  const { kanaRatio, alphabetRatio, otherRatio } = calcChunkRatios(map.difficulty);
  return (
    <div className="flex flex-wrap items-center gap-x-2">
      <Badge variant="accent-light" size="xs" className="rounded-full">
        {formatTime(map.info.duration)}
      </Badge>
      <Separator orientation="vertical" className="bg-border/60 data-[orientation=vertical]:h-3" />
      <Badge variant={kanaRatio === 0 ? "english" : inputMode === "roma" ? "roma" : "kana"} size="xs">
        {kanaRatio === 0 ? "英語" : inputMode === "roma" ? "ローマ字" : "かな"}
      </Badge>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">最大</span>
        <span className="font-semibold tabular-nums">{maxKpm}kpm</span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">打鍵数</span>
        <span className="font-semibold tabular-nums">{totalNotes}打</span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {kanaRatio > 0 && (
          <>
            <span className="text-muted-foreground">ひらがな</span>
            <span className="font-semibold tabular-nums">{Math.round(kanaRatio * 100)}%</span>
          </>
        )}
        {alphabetRatio > 0 && (
          <>
            <span className="text-muted-foreground">英字</span>
            <span className="font-semibold tabular-nums">{Math.round(alphabetRatio * 100)}%</span>
          </>
        )}
        {otherRatio > 0 && (
          <>
            <span className="text-muted-foreground">記号</span>
            <span className="font-semibold tabular-nums">{Math.round(otherRatio * 100)}%</span>
          </>
        )}
      </div>
    </div>
  );
};
