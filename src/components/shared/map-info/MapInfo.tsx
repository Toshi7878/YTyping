"use client";
import LikeCountIcon from "@/components/shared/map-count-icon/LikeCountIcon";
import RankingCountIcon from "@/components/shared/map-count-icon/RankingCountIcon";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { RouterOutPuts } from "@/server/api/trpc";
import { formatTime } from "@/utils/formatTime";
import Link from "next/link";
import { Badge } from "../../ui/badge";
import DateDistanceText from "../text/DateDistanceText";
import UserLinkText from "../text/UserLinkText";

interface MapInfoProps {
  map: RouterOutPuts["mapList"]["getByVideoId"][number];
}

function MapInfo({ map }: MapInfoProps) {
  const musicSourceDisplay = map.music_source ? `【${map.music_source}】` : "";

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden text-xs sm:text-sm md:text-base lg:text-lg">
      <Link className="absolute h-full w-full" href={`/type/${map.id}`} />
      <div className="flex h-full flex-col justify-between pt-2 pl-3 hover:no-underline">
        <section className="flex flex-col gap-1">
          <TooltipWrapper delayDuration={300} label={`${map.title} / ${map.artist_name}${musicSourceDisplay}`}>
            <Link
              href={`/type/${map.id}`}
              className="text-secondary z-1 truncate overflow-hidden text-base font-bold whitespace-nowrap hover:no-underline"
            >
              {map.title}
            </Link>
          </TooltipWrapper>

          <div className="text-secondary truncate overflow-hidden text-xs font-bold whitespace-nowrap sm:text-sm">
            {map.artist_name}
            {musicSourceDisplay}
          </div>
        </section>
        <section className="flex flex-row items-baseline justify-between space-y-1 lg:flex-col">
          <MapCreatorInfo creator={map.creator} updatedAt={map.updated_at} />
          <MapInfoBottom map={map} />
        </section>
      </div>
    </div>
  );
}

const MapInfoBottom = ({ map }: MapInfoProps) => {
  return (
    <div className="mr-3 flex w-fit justify-end md:justify-between lg:w-[98%]">
      <div className="mr-2 flex items-center gap-2">
        <Badge variant="accent-light" className="rounded-full px-2 text-sm">
          <span className="hidden text-xs sm:inline-block">★</span>
          {(map.difficulty!.roma_kpm_median / 100).toFixed(1)}
        </Badge>
        <Badge variant="accent-light" className="hidden rounded-full px-2 text-sm md:block">
          {formatTime(map.difficulty!.total_time)}
        </Badge>
      </div>
      <div className="flex">
        <RankingCountIcon key={map.results[0]?.rank} myRank={map.results[0]?.rank} rankingCount={map.ranking_count} />
        <LikeCountIcon mapId={map.id} isLiked={!!map.map_likes[0]?.is_liked} likeCount={map.like_count} />
      </div>
    </div>
  );
};

interface MapCreatorInfoProps {
  creator: RouterOutPuts["mapList"]["getByVideoId"][number]["creator"];
  updatedAt: Date;
}

const MapCreatorInfo = ({ creator, updatedAt }: MapCreatorInfoProps) => {
  return (
    <small className="mt-2 block truncate">
      <UserLinkText userId={creator.id} userName={creator.name} />
      <span className="hidden text-xs md:inline-block">
        <span className="mx-1">
          - <DateDistanceText date={new Date(updatedAt)} />
        </span>
      </span>
    </small>
  );
};

export default MapInfo;
