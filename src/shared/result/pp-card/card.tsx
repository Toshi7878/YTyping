"use client";
import type { Route } from "next";
import Link from "next/link";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/tailwind";
import type { ResultWithMapItem } from "@/server/api/routers/result/list";
import { RatingBadge } from "@/shared/map/rating";
import { MapThumbnailImage } from "@/shared/map-thumbnail-image";
import { useMapLinkMode } from "@/store/map-link-type";
import { Badge } from "@/ui/badge";
import { Card, CardContentWithThumbnail } from "@/ui/card";
import { TooltipWrapper } from "@/ui/tooltip";
import { nolink } from "@/utils/no-link";
import { buildYouTubeThumbnailUrl } from "@/utils/ytimg";

interface ResultCardProps {
  result: ResultWithMapItem;
  initialInView: boolean;
}

export const PPResultCard = ({ result, initialInView = false }: ResultCardProps) => {
  const src = buildYouTubeThumbnailUrl(result.map.media.videoId, result.map.media.thumbnailQuality);

  return (
    <Card className="map-card-hover block w-full py-0 transition-shadow duration-300">
      <CardContentWithThumbnail src={src} className="relative flex items-center gap-4 py-2">
        <MapThumbnailImage
          alt={result.map.info.title}
          media={result.map.media}
          size="xs"
          priority={initialInView}
          isStyledMap={result.map.info.categories.includes("CSS")}
        />

        <MapInfo map={result.map} className="flex-1" />
        <PPBadges result={result} />
      </CardContentWithThumbnail>
    </Card>
  );
};

interface MapInfoProps {
  map: ResultWithMapItem["map"];
}

const MapInfo = ({ map, className, ...rest }: MapInfoProps & HTMLAttributes<HTMLDivElement>) => {
  const musicSource = map.info.source ? `【${map.info.source}】` : "";
  const linkMode = useMapLinkMode();
  const link = (linkMode === "type" ? `/type/${map.id}` : `/ime/${map.id}`) as Route;

  return (
    <div className={cn("flex flex-col gap-2 truncate", className)} {...rest}>
      <TooltipWrapper label={nolink(`${map.info.title} / ${map.info.artistName}${musicSource}`)} asChild>
        <Link href={link} className="block text-secondary hover:underline">
          <div className="truncate font-bold text-sm sm:text-base">
            {nolink(`${map.info.title} / ${map.info.artistName}`)}
          </div>
        </Link>
      </TooltipWrapper>

      <RatingBadge rating={map.difficulty.rating} />

      <div className="truncate text-xs">
        制作者:{" "}
        <Link href={`/user/${map.creator.id}`} className="text-secondary hover:underline">
          {map.creator.name}
        </Link>
        {map.info.visibility === "UNLISTED" ? (
          <Badge variant="outline" size="xs" className="h-4 rounded-full px-1 text-[0.6rem]">
            限定公開
          </Badge>
        ) : null}
      </div>
    </div>
  );
};

const PPBadges = ({ result, className }: { result: ResultWithMapItem; className?: string }) => {
  return (
    <div className={cn("flex flex-col items-end gap-5", className)}>
      <Badge variant="result" size="lg">
        {result.otherStatus.pp} pp
      </Badge>
    </div>
  );
};
