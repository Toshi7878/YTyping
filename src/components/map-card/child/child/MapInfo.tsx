"use client";
import LikeCountIcon from "@/components/share-components/map-count-icon/LikeCountIcon";
import RankingCountIcon from "@/components/share-components/map-count-icon/RankingCountIcon";
import Link from "@/components/ui/link/link";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { RouterOutPuts } from "@/server/api/trpc";
import { formatTime } from "@/utils/formatTime";
import { useLinkClick } from "@/utils/global-hooks/useLinkClick";
import MapBadge from "./MapBadge";
import MapCreateUser from "./MapCreateUser";

interface MapInfoProps {
  map: RouterOutPuts["mapList"]["getByVideoId"][number];
}
function MapInfo({ map }: MapInfoProps) {
  const handleLinkClick = useLinkClick();

  const musicSourceDisplay = map.music_source ? `【${map.music_source}】` : "";

  return (
    <div className="flex h-full flex-col justify-between pt-2 pl-3 hover:no-underline">
      <div className="flex flex-col gap-1">
        <TooltipWrapper label={`${map.title} / ${map.artist_name}${musicSourceDisplay}`}>
          <Link
            href={`/type/${map.id}`}
            onClick={handleLinkClick}
            className="text-secondary z-1 truncate overflow-hidden text-base font-bold whitespace-nowrap hover:no-underline"
          >
            {map.title}
          </Link>
        </TooltipWrapper>

        <div className="text-secondary truncate overflow-hidden text-xs font-bold whitespace-nowrap sm:text-sm">
          {map.artist_name || ""}
          {musicSourceDisplay}
        </div>
      </div>
      <div className="flex flex-row items-baseline justify-between space-y-1 lg:flex-col">
        <MapCreateUser map={map} />
        <MapInfoBottom map={map} />
      </div>
    </div>
  );
}

const MapInfoBottom = ({ map }: MapInfoProps) => {
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

export default MapInfo;
