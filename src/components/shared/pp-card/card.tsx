"use client";
import Link from "next/link";
import type { HTMLAttributes } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContentWithThumbnail } from "@/components/ui/card";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ResultWithMapItem } from "@/server/api/routers/result/list";
import { formatMapDifficultyRating } from "@/utils/format-map-difficulty-rating";
import { nolink } from "@/utils/no-link";
import { buildYouTubeThumbnailUrl } from "@/utils/ytimg";
import { MapThumbnailImage } from "../map-thumbnail-image";

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
  return (
    <div className={cn("flex flex-col gap-2 truncate", className)} {...rest}>
      <TooltipWrapper label={nolink(`${map.info.title} / ${map.info.artistName}${musicSource}`)} asChild>
        <Link href={`/type/${map.id}`} className="block text-secondary hover:underline">
          <div className="truncate font-bold text-sm sm:text-base">
            {nolink(`${map.info.title} / ${map.info.artistName}`)}
          </div>
        </Link>
      </TooltipWrapper>
      <div className="text-muted-foreground text-xs tabular-nums">
        難易度: {formatMapDifficultyRating(map.difficulty.rating)}
      </div>
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
