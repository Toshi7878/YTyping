"use client";
import LikeCountIcon from "@/components/shared/map-count-icon/LikeCountIcon";
import RankingCountIcon from "@/components/shared/map-count-icon/RankingCountIcon";
import { Card, CardContentWithThumbnail, CardFooter } from "@/components/ui/card";
import { RouterOutPuts } from "@/server/api/trpc";
import { MapResultBadgesMobile } from "./child/MapResultStatus";
import ResultCardContent from "./ResultCardContent";
import ResultCardHeader from "./ResultCardHeader";

interface ResultCardProps {
  result: RouterOutPuts["result"]["usersResultList"]["items"][number];
}

function ResultCard({ result }: ResultCardProps) {
  const src =
    result.map.thumbnailQuality === "maxresdefault"
      ? `https://i.ytimg.com/vi_webp/${result.map.videoId}/maxresdefault.webp`
      : `https://i.ytimg.com/vi/${result.map.videoId}/mqdefault.jpg`;

  return (
    <Card className="map-card-hover block w-full py-0 transition-shadow duration-300">
      <ResultCardHeader result={result} className="mx-0 py-4 md:mx-6" />

      <CardContentWithThumbnail src={src} className="relative mx-auto max-w-[95%]">
        <ResultCardContent result={result} />
        <div className="absolute bottom-0 left-4 z-2 flex items-center space-x-1">
          <RankingCountIcon myRank={result.map.myRank} rankingCount={result.map.rankingCount} />
          <LikeCountIcon
            mapId={result.map.id}
            isLiked={result.map.hasLiked ?? false}
            likeCount={result.map.likeCount}
          />
        </div>
      </CardContentWithThumbnail>

      <CardFooter className="py-4">
        <MapResultBadgesMobile result={result} className="flex md:hidden" />
      </CardFooter>
    </Card>
  );
}

export default ResultCard;
