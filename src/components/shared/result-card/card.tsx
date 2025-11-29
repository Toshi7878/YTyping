"use client";
import Link from "next/link";
import { type HTMLAttributes, memo } from "react";
import { LikeCountIcon } from "@/components/shared/map-count/like-count";
import { RankingCount } from "@/components/shared/map-count/ranking-count";
import { Badge } from "@/components/ui/badge";
import { Card, CardContentWithThumbnail, CardFooter, CardHeader } from "@/components/ui/card";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ResultWithMapItem } from "@/server/api/routers/result";
import { useLazyRender } from "@/utils/hooks/use-lazy-render";
import { nolink } from "@/utils/no-link";
import { buildYouTubeThumbnailUrl } from "@/utils/ytimg";
import { MapLeftThumbnail } from "../map-card-thumbnail";
import { DateDistanceText } from "../text/date-distance-text";
import { ResultClapButton } from "./clap-button";
import { ResultBadgesMobile, ResultStatusBadges } from "./status-badges";

interface ResultCardProps {
  result: ResultWithMapItem;
  priority?: boolean;
}

export const ResultCard = memo(({ result, priority = false }: ResultCardProps) => {
  const { ref, shouldRender } = useLazyRender({ priority });
  const src = buildYouTubeThumbnailUrl(result.map.media.videoId, result.map.media.thumbnailQuality);

  return (
    <Card className="map-card-hover block w-full py-0 transition-shadow duration-300" ref={ref}>
      <CardHeader className="flex items-center justify-between mx-0 py-4 md:mx-6">
        <div className="flex flex-row items-center gap-2">
          {shouldRender && (
            <>
              <Link
                href={`/user/${result.player.id}`}
                className="text-secondary max-w-32 truncate font-bold hover:underline sm:max-w-none"
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
              className={cn("hidden font-bold md:flex", result?.rank === 1 && "outline-text text-perfect")}
              size="lg"
            >
              Rank: #{result.rank}
            </Badge>
          )}

          <MapLeftThumbnail
            alt={shouldRender ? result.map.info.title : ""}
            media={shouldRender ? result?.map.media : undefined}
            size="timeline"
            loading={priority ? "eager" : "lazy"}
          />
          {shouldRender && <MapInfo map={result.map} className="flex-1" />}
          {shouldRender && <ResultStatusBadges result={result} className="hidden md:flex" />}
        </div>
        {shouldRender && (
          <div className="absolute bottom-0 left-4 z-2 flex items-center space-x-1">
            <RankingCount
              myRank={result.map.ranking.myRank}
              rankingCount={result.map.ranking.count}
              myRankUpdatedAt={result.map.ranking.myRankUpdatedAt}
            />
            <LikeCountIcon
              mapId={result.map.id}
              hasLiked={result.map.like.hasLiked ?? false}
              likeCount={result.map.like.count}
            />
          </div>
        )}
      </CardContentWithThumbnail>

      <CardFooter className="py-4">
        <ResultBadgesMobile result={shouldRender ? result : null} className="flex md:hidden" />
      </CardFooter>
    </Card>
  );
});

interface MapInfoProps {
  map: ResultWithMapItem["map"];
}

const MapInfo = ({ map, className, ...rest }: MapInfoProps & HTMLAttributes<HTMLDivElement>) => {
  const musicSource = map.info.source ? `【${map.info.source}】` : "";
  return (
    <div className={cn("flex flex-col justify-center gap-4 truncate", className)} {...rest}>
      <TooltipWrapper delayDuration={300} label={nolink(`${map.info.title} / ${map.info.artistName}${musicSource}`)}>
        <Link href={`/type/${map.id}`} className="text-secondary block hover:underline">
          <div className="truncate text-sm font-bold sm:text-base">
            {nolink(`${map.info.title} / ${map.info.artistName}`)}
          </div>
        </Link>
      </TooltipWrapper>
      <div className="truncate text-xs">
        制作者:{" "}
        <Link href={`/user/${map.creator.id}`} className="text-secondary hover:underline">
          {map.creator.name}
        </Link>
      </div>
    </div>
  );
};
