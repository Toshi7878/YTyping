import LikeCountIcon from "@/components/share-components/map-count-icon/LikeCountIcon";
import RankingCountIcon from "@/components/share-components/map-count-icon/RankingCountIcon";
import { RouterOutPuts } from "@/server/api/trpc";
import { formatTime } from "@/utils/formatTime";
import MapBadge from "./MapBadge";

interface MapBadgesProps {
  map: RouterOutPuts["mapList"]["getByVideoId"][number];
}

const MapBadges = (props: MapBadgesProps) => {
  const { map } = props;

  return (
    <div className="mr-3 flex w-fit justify-end md:justify-between lg:w-[98%]">
      <div className="mr-2 flex items-center gap-2">
        <MapBadge>
          <span className="hidden text-xs sm:inline-block">★</span>
          {(map.difficulty!.roma_kpm_median / 100).toFixed(1)}
        </MapBadge>
        <MapBadge className="hidden md:block">{formatTime(map.difficulty!.total_time)}</MapBadge>
      </div>
      <div className="flex">
        <RankingCountIcon key={map.results[0]?.rank} myRank={map.results[0]?.rank} rankingCount={map.ranking_count} />
        <LikeCountIcon mapId={map.id} isLiked={!!map.map_likes[0]?.is_liked} likeCount={map.like_count} />
      </div>
    </div>
  );
};

export default MapBadges;
