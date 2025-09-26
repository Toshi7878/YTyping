"use client"
import LikeCountIcon from "@/components/shared/map-count/like-count"
import RankingCount from "@/components/shared/map-count/ranking-count"
import { Card, CardContentWithThumbnail, CardFooter } from "@/components/ui/card"
import type { RouterOutPuts } from "@/server/api/trpc"
import { ResultBadgesMobile } from "./child/result-status"
import ResultCardContent from "./result-card-content"
import ResultCardHeader from "./result-card-header"

interface ResultCardProps {
  result: RouterOutPuts["result"]["usersResultList"]["items"][number]
}

function ResultCard({ result }: ResultCardProps) {
  const src =
    result.map.media.thumbnailQuality === "maxresdefault"
      ? `https://i.ytimg.com/vi_webp/${result.map.media.videoId}/maxresdefault.webp`
      : `https://i.ytimg.com/vi/${result.map.media.videoId}/mqdefault.jpg`

  return (
    <Card className="map-card-hover block w-full py-0 transition-shadow duration-300">
      <ResultCardHeader
        player={result.player}
        resultId={result.id}
        updatedAt={result.updatedAt}
        clap={result.clap}
        className="mx-0 py-4 md:mx-6"
      />

      <CardContentWithThumbnail src={src} className="relative mx-auto max-w-[95%]">
        <ResultCardContent result={result} />
        <div className="absolute bottom-0 left-4 z-2 flex items-center space-x-1">
          <RankingCount myRank={result.map.ranking.myRank} rankingCount={result.map.ranking.count} />
          <LikeCountIcon
            mapId={result.map.id}
            hasLiked={result.map.like.hasLiked ?? false}
            likeCount={result.map.like.count}
          />
        </div>
      </CardContentWithThumbnail>

      <CardFooter className="py-4">
        <ResultBadgesMobile result={result} className="flex md:hidden" />
      </CardFooter>
    </Card>
  )
}

export default ResultCard
