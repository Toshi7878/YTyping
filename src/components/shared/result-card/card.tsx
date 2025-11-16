"use client";
import Link from "next/link";
import type { HTMLAttributes } from "react";
import { LikeCountIcon } from "@/components/shared/map-count/like-count";
import { RankingCount } from "@/components/shared/map-count/ranking-count";
import { Badge } from "@/components/ui/badge";
import { Card, CardContentWithThumbnail, CardFooter, CardHeader } from "@/components/ui/card";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ResultWithMapItem } from "@/server/api/routers/result";
import { useLazyRender } from "@/utils/hooks/use-lazy-render";
import { nolink } from "@/utils/no-link";
import { MapLeftThumbnail } from "../map-card-thumbnail";
import { DateDistanceText } from "../text/date-distance-text";
import { ResultClapButton } from "./clap-button";
import { ResultBadgesMobile, ResultStatusBadges } from "./status-badges";

interface ResultCardProps {
  result: ResultWithMapItem;
  priority?: boolean;
}

export const ResultCard = ({ result, priority = false }: ResultCardProps) => {
  const { ref, shouldRender } = useLazyRender({ priority });
  return <ResultCardLayout ref={ref} result={shouldRender ? result : null} priority={priority} />;
};

interface ResultCardLayoutProps {
  ref: ReturnType<typeof useLazyRender>["ref"];
  result: ResultWithMapItem | null;
  priority: boolean;
}

const ResultCardLayout = ({ ref, result, priority }: ResultCardLayoutProps) => {
  const src = result
    ? result.map.media.thumbnailQuality === "maxresdefault"
      ? `https://i.ytimg.com/vi_webp/${result.map.media.videoId}/maxresdefault.webp`
      : `https://i.ytimg.com/vi/${result.map.media.videoId}/mqdefault.jpg`
    : "";

  return (
    <Card
      className={result ? "map-card-hover block w-full py-0 transition-shadow duration-300" : "block w-full py-0"}
      ref={ref}
    >
      <ResultCardHeader
        player={result?.player ?? null}
        resultId={result?.id ?? 0}
        updatedAt={result?.updatedAt}
        clap={result?.clap ?? null}
        className="mx-0 py-4 md:mx-6"
      />

      <CardContentWithThumbnail src={src} className="relative mx-auto max-w-[95%]">
        <ResultCardContent result={result ?? null} priority={priority} />
        <div className="absolute bottom-0 left-4 z-2 flex items-center space-x-1">
          <RankingCount
            // key={result?.map.ranking.myRank ?? 0}
            myRank={result?.map.ranking.myRank ?? null}
            rankingCount={result?.map.ranking.count ?? 0}
            myRankUpdatedAt={result?.map.ranking.myRankUpdatedAt ?? null}
          />
          <LikeCountIcon
            // key={result ? `${result.map.id}-${result.map.like.hasLiked}` : "skeleton"}
            mapId={result?.map.id ?? null}
            hasLiked={result?.map.like.hasLiked ?? false}
            likeCount={result?.map.like.count ?? 0}
          />
        </div>
      </CardContentWithThumbnail>

      <CardFooter className="py-4">
        <ResultBadgesMobile result={result ?? null} className="flex md:hidden" />
      </CardFooter>
    </Card>
  );
};

interface ResultCardHeaderProps {
  player: ResultWithMapItem["player"] | null;
  resultId: ResultWithMapItem["id"] | null;
  updatedAt: ResultWithMapItem["updatedAt"] | undefined;
  clap: ResultWithMapItem["clap"] | null;
  className?: string;
}

const ResultCardHeader = ({ player, resultId, updatedAt, clap, className }: ResultCardHeaderProps) => {
  return (
    <CardHeader className={cn("flex items-center justify-between", className)}>
      <div className="flex flex-row items-center gap-2">
        {player && (
          <>
            <Link
              href={`/user/${player.id}`}
              className="text-secondary max-w-32 truncate font-bold hover:underline sm:max-w-none"
            >
              {player.name}
            </Link>
            {" - "}
          </>
        )}
        {updatedAt && <DateDistanceText date={updatedAt} />}
      </div>
      <ResultClapButton resultId={resultId} clapCount={clap?.count ?? 0} hasClapped={clap?.hasClapped ?? false} />
    </CardHeader>
  );
};

const ResultCardContent = ({ result, priority = false }: { result: ResultWithMapItem | null; priority: boolean }) => {
  return (
    <div className="flex w-full items-center gap-4 py-6">
      {result && (
        <Badge
          variant="result"
          className={cn("hidden font-bold md:flex", result?.rank === 1 && "outline-text text-perfect")}
          size="lg"
        >
          Rank: #{result.rank}
        </Badge>
      )}

      <MapLeftThumbnail
        alt={result?.map.info.title ?? ""}
        media={result?.map.media ?? undefined}
        size="timeline"
        loading={priority ? "eager" : "lazy"}
      />

      {result && <MapInfo map={result.map} className="flex-1" />}
      {result && <ResultStatusBadges result={result} className="hidden md:flex" />}
    </div>
  );
};

interface MapInfoProps extends HTMLAttributes<HTMLDivElement> {
  map: ResultWithMapItem["map"];
}

const MapInfo = ({ map, className, ...rest }: MapInfoProps) => {
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
