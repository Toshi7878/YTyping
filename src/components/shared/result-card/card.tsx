"use client";
import type { Route } from "next";
import Link from "next/link";
import type { HTMLAttributes } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContentWithThumbnail, CardFooter, CardHeader } from "@/components/ui/card";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useMapLinkMode } from "@/lib/atoms/global-atoms";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import type { ResultWithMapItem } from "@/server/api/routers/result/list";
import { useInViewRender } from "@/utils/hooks/intersection";
import { nolink } from "@/utils/no-link";
import { buildYouTubeThumbnailUrl } from "@/utils/ytimg";
import { MapListActionButtons } from "../list-action-buttons";
import { RatingBadge } from "../map/rating";
import { MapThumbnailImage } from "../map-thumbnail-image";
import { DateDistanceText } from "../text/date-distance-text";
import { ResultClapButton } from "./clap-button";
import { ResultBadgesMobile, ResultStatusBadges } from "./status-badges";

interface ResultCardProps {
  result: ResultWithMapItem;
  initialInView: boolean;
  imagePriority?: boolean;
}

export const ResultCard = ({ result, initialInView = false, imagePriority = false }: ResultCardProps) => {
  const { data: session } = useSession();
  const { ref, shouldRender } = useInViewRender({ initialInView });
  const src = buildYouTubeThumbnailUrl(result.map.media.videoId, result.map.media.thumbnailQuality);
  return (
    <Card className="map-card-hover block w-full py-0 transition-shadow duration-300" ref={ref}>
      <CardHeader className="mx-0 flex items-center justify-between py-4 md:mx-6">
        <div className="flex flex-row items-center gap-2">
          {shouldRender && (
            <>
              <Link
                href={`/user/${result.player.id}`}
                className="max-w-32 truncate font-bold text-secondary hover:underline sm:max-w-none"
              >
                {result.player.name}
              </Link>
              {" - "}
              <DateDistanceText date={result.updatedAt} />
            </>
          )}
        </div>
        <ResultClapButton
          resultId={result.id}
          clapCount={result.clap.count}
          hasClapped={result.clap?.hasClapped ?? false}
          className={cn(!shouldRender && "invisible")}
        />
      </CardHeader>
      <CardContentWithThumbnail src={shouldRender ? src : undefined} className="relative mx-auto max-w-[95%]">
        <div className="flex w-full items-center gap-4 py-6">
          {shouldRender && (
            <Badge
              variant="result"
              className={cn("hidden font-bold md:flex", result?.rank === 1 && "text-perfect outline-text")}
              size="lg"
            >
              Rank: #{result.rank}
            </Badge>
          )}

          <MapThumbnailImage
            alt={shouldRender ? result.map.info.title : ""}
            media={shouldRender ? result?.map.media : undefined}
            size="xs"
            priority={imagePriority || initialInView}
            isStyledMap={result.map.info.categories.includes("CSS")}
          />
          {shouldRender && <MapInfo map={result.map} className="flex-1" />}
          {shouldRender && <ResultStatusBadges result={result} className="hidden md:flex" />}
        </div>
        {shouldRender && (
          <MapListActionButtons
            map={result.map}
            showBookmark={!!session}
            className={cn("absolute bottom-0", session ? "left-0" : "left-2")}
          />
        )}
      </CardContentWithThumbnail>

      <CardFooter className="py-4">
        <ResultBadgesMobile result={shouldRender ? result : null} className="flex md:hidden" />
      </CardFooter>
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
    <div className={cn("flex flex-col justify-center gap-1.5 truncate", className)} {...rest}>
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
