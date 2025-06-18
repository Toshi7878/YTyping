"use client";
import LikeCountIcon from "@/components/share-components/map-count-icon/LikeCountIcon";
import RankingCountIcon from "@/components/share-components/map-count-icon/RankingCountIcon";
import { Card, CardContentWithThumbnail, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";
import { ResultCardInfo } from "../../ts/type";
import { MapResultBadgesMobile } from "./child/child/MapResultBadgesLayout";
import ResultInnerCardBody from "./child/ResultCardBody";
import ResultCardHeader from "./child/ResultCardHeader";

interface ResultCardProps {
  result: ResultCardInfo;
}

function ResultCard(props: ResultCardProps) {
  const { result } = props;

  const src = result
    ? result.map.thumbnail_quality === "maxresdefault"
      ? `https://i.ytimg.com/vi_webp/${result.map.video_id}/maxresdefault.webp`
      : `https://i.ytimg.com/vi/${result.map.video_id}/mqdefault.jpg`
    : null;

  return (
    <Card className="map-card-hover block py-0 transition-shadow duration-300">
      <ResultCardHeader result={result} className="py-4" />

      <CardContentWithThumbnail src={src}>
        {result && <MapIcons result={result} bottom="25px" left="35px" className="hidden md:flex" />}
        <ResultInnerCardBody result={result} />
      </CardContentWithThumbnail>

      <CardFooter className="pb-6">
        <MapResultBadgesMobile result={result} className="flex md:hidden" />
      </CardFooter>
    </Card>
  );
}

interface MapIconsProps extends HTMLAttributes<HTMLDivElement> {
  result: ResultCardInfo;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

const MapIcons = ({
  result,
  top = "auto",
  right = "auto",
  bottom = "auto",
  left = "auto",
  className,
  ...rest
}: MapIconsProps) => {
  return (
    <div className={cn("absolute z-[2]", className)} style={{ top, right, bottom, left }} {...rest}>
      <RankingCountIcon myRank={result.map.results[0]?.rank} rankingCount={result.map.ranking_count} />
      <LikeCountIcon
        mapId={result.map.id}
        isLiked={!!result.map.map_likes[0]?.is_liked}
        likeCount={result.map.like_count}
      />
    </div>
  );
};

export default ResultCard;
