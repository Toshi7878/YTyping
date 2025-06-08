import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import MapBadge from "@/components/map-card/child/child/MapBadge";
import LikeCountIcon from "@/components/share-components/map-count-icon/LikeCountIcon";
import RankingCountIcon from "@/components/share-components/map-count-icon/RankingCountIcon";
import { RouterOutPuts } from "@/server/api/trpc";

interface MapBadgesProps {
  map: RouterOutPuts["notification"]["getInfiniteUserNotifications"]["notifications"][number]["map"];
}

const MapBadges = ({ map }: MapBadgesProps) => {
  return (
    <div className="flex w-[98%] justify-between">
      <div className="flex">
        <CustomToolTip
          label={
            <div>
              <div>最高速度:{map.difficulty!.roma_kpm_max}kpm</div>
            </div>
          }
          placement="top"
        >
          <MapBadge>
            <span className="hidden text-xs sm:inline-block">★</span>
            {(map.difficulty!.roma_kpm_median / 100).toFixed(1)}
          </MapBadge>
        </CustomToolTip>
      </div>
      <div className="flex">
        <RankingCountIcon myRank={map.results[0]?.rank} rankingCount={map.ranking_count} />
        <LikeCountIcon mapId={map.id} isLiked={!!map.map_likes[0]?.is_liked} likeCount={map.like_count} />
      </div>
    </div>
  );
};

export default MapBadges;
