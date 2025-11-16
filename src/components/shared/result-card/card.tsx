"use client";
import { LikeCountIcon } from "@/components/shared/map-count/like-count";
import { RankingCount } from "@/components/shared/map-count/ranking-count";
import { Card, CardContentWithThumbnail, CardFooter } from "@/components/ui/card";
import type { ResultWithMapItem } from "@/server/api/routers/result";
import { useLazyRender } from "@/utils/hooks/use-lazy-render";
import { ResultCardContent } from "./card-content";
import { ResultCardHeader } from "./card-header";
import { ResultBadgesMobile } from "./status-badges";

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

  const skeletonPlayer = { id: 0, name: "" };
  const skeletonClap = { count: 0, hasClapped: false };
  const skeletonDate = new Date(0);

  return (
    <Card
      className={result ? "map-card-hover block w-full py-0 transition-shadow duration-300" : "block w-full py-0"}
      ref={ref}
    >
      <ResultCardHeader
        player={result?.player ?? skeletonPlayer}
        resultId={result?.id ?? 0}
        updatedAt={result?.updatedAt ?? skeletonDate}
        clap={result?.clap ?? skeletonClap}
        className="mx-0 py-4 md:mx-6"
      />

      <CardContentWithThumbnail src={src} className="relative mx-auto max-w-[95%]">
        {result && <ResultCardContent result={result} priority={priority} />}
        <div className="absolute bottom-0 left-4 z-2 flex items-center space-x-1">
          <RankingCount
            key={result?.map.ranking.myRank ?? 0}
            myRank={result?.map.ranking.myRank ?? null}
            rankingCount={result?.map.ranking.count ?? 0}
            myRankUpdatedAt={result?.map.ranking.myRankUpdatedAt ?? null}
          />
          <LikeCountIcon
            key={result ? `${result.map.id}-${result.map.like.hasLiked}` : "skeleton"}
            mapId={result?.map.id ?? 0}
            hasLiked={result?.map.like.hasLiked ?? false}
            likeCount={result?.map.like.count ?? 0}
          />
        </div>
      </CardContentWithThumbnail>

      <CardFooter className="py-4">
        {result && <ResultBadgesMobile result={result} className="flex md:hidden" />}
      </CardFooter>
    </Card>
  );
};
