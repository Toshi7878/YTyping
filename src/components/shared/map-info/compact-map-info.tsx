"use client";
import LikeCountIcon from "@/components/shared/map-count/like-count";
import RankingCount from "@/components/shared/map-count/ranking-count";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { RouterOutPuts } from "@/server/api/trpc";
import { nolink } from "@/utils/no-link";
import Link from "next/link";
import { Badge } from "../../ui/badge";

interface CompactMapCardProps {
  map: RouterOutPuts["mapList"]["getList"]["maps"][number];
}

function CompactMapInfo({ map }: CompactMapCardProps) {
  const musicSource = map.info.source ? `【${map.info.source}】` : "";

  return (
    <div className="flex w-full flex-col justify-between overflow-hidden py-1 pl-3 text-xs sm:text-sm md:text-base lg:text-lg">
      <Link className="flex h-full flex-col justify-between hover:no-underline" href={`/type/${map.id}`}>
        <section className="flex flex-col gap-1">
          <TooltipWrapper
            delayDuration={300}
            label={nolink(`${map.info.title} / ${map.info.artistName}${musicSource}`)}
          >
            <div className="text-secondary truncate overflow-hidden text-base font-bold whitespace-nowrap">
              {nolink(map.info.title)}
            </div>
          </TooltipWrapper>
          <div className="text-secondary truncate overflow-hidden text-xs font-bold whitespace-nowrap sm:text-sm">
            {nolink(map.info.artistName)}
          </div>
        </section>
        <MapBadges map={map} />
      </Link>
    </div>
  );
}

interface MapBadgesProps {
  map: RouterOutPuts["mapList"]["getList"]["maps"][number];
}

const MapBadges = ({ map }: MapBadgesProps) => {
  return (
    <div className="flex w-[98%] justify-between">
      <div className="flex">
        <TooltipWrapper
          label={
            <div>
              <div>最高速度:{map.difficulty.romaKpmMax}kpm</div>
            </div>
          }
        >
          <Badge variant="accent-light" className="rounded-full px-2 text-sm">
            <span className="hidden text-xs sm:inline-block">★</span>
            {(map.difficulty.romaKpmMedian / 100).toFixed(1)}
          </Badge>
        </TooltipWrapper>
      </div>
      <div className="flex items-center space-x-1">
        <RankingCount myRank={map.ranking.myRank ?? 0} rankingCount={map.ranking.count} />
        <LikeCountIcon mapId={map.id} hasLiked={map.like.hasLiked ?? false} likeCount={map.like.count} />
      </div>
    </div>
  );
};

export default CompactMapInfo;
