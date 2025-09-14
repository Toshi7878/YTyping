"use client";
import LikeCountIcon from "@/components/shared/map-count-icon/LikeCountIcon";
import RankingCountIcon from "@/components/shared/map-count-icon/RankingCountIcon";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { MapItem } from "@/server/api/routers/mapListRouter";
import { nolink } from "@/utils/no-link";
import Link from "next/link";
import { Badge } from "../../ui/badge";

interface CompactMapCardProps {
  map: MapItem;
}

function CompactMapInfo({ map }: CompactMapCardProps) {
  const musicSource = map.music_source ? `【${map.music_source}】` : "";

  return (
    <div className="flex w-full flex-col justify-between overflow-hidden py-1 pl-3 text-xs sm:text-sm md:text-base lg:text-lg">
      <Link className="flex h-full flex-col justify-between hover:no-underline" href={`/type/${map.id}`}>
        <section className="flex flex-col gap-1">
          <TooltipWrapper delayDuration={300} label={nolink(`${map.title} / ${map.artist_name}${musicSource}`)}>
            <div className="text-secondary truncate overflow-hidden text-base font-bold whitespace-nowrap">
              {nolink(map.title)}
            </div>
          </TooltipWrapper>
          <div className="text-secondary truncate overflow-hidden text-xs font-bold whitespace-nowrap sm:text-sm">
            {nolink(map.artist_name)}
          </div>
        </section>
        <MapBadges map={map} />
      </Link>
    </div>
  );
}

interface MapBadgesProps {
  map: MapItem;
}

const MapBadges = ({ map }: MapBadgesProps) => {
  return (
    <div className="flex w-[98%] justify-between">
      <div className="flex">
        <TooltipWrapper
          label={
            <div>
              <div>最高速度:{map.difficulty.roma_kpm_max}kpm</div>
            </div>
          }
        >
          <Badge variant="accent-light" className="rounded-full px-2 text-sm">
            <span className="hidden text-xs sm:inline-block">★</span>
            {(map.difficulty.roma_kpm_median / 100).toFixed(1)}
          </Badge>
        </TooltipWrapper>
      </div>
      <div className="flex items-center space-x-1">
        <RankingCountIcon myRank={map.myRank} rankingCount={map.ranking_count} />
        <LikeCountIcon mapId={map.id} isLiked={map.is_liked} likeCount={map.like_count} />
      </div>
    </div>
  );
};

export default CompactMapInfo;
