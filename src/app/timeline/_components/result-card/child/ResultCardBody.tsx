import { ResultCardInfo } from "@/app/timeline/ts/type";
import MapLeftThumbnail from "@/components/share-components/MapCardThumbnail";
import Link from "@/components/ui/link/link";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useLinkClick } from "@/utils/global-hooks/useLinkClick";
import { HTMLAttributes } from "react";
import { MapResultBadges } from "./child/MapResultBadgesLayout";
import UserRank from "./child/UserRank";

const ResultInnerCardBody = ({ result }: { result?: ResultCardInfo }) => {
  const isToggledInputMode = result?.status.roma_type != 0 && result?.status.kana_type != 0;

  return (
    <div className="z-0 flex min-w-full flex-row items-center justify-between py-6">
      <div className="flex w-full flex-row gap-4">
        {result && <UserRank userRank={result.rank} className="hidden md:flex" />}

        <MapLeftThumbnail
          alt={result ? result.map.title : ""}
          src={result ? `https://i.ytimg.com/vi/${result.map.video_id}/mqdefault.jpg` : ""}
          mapVideoId={result?.map.video_id}
          mapPreviewTime={result?.map.preview_time}
          mapPreviewSpeed={result?.status.default_speed}
          size="timeline"
        />

        {result && (
          <MapInfo
            map={result.map}
            isToggledInputMode={isToggledInputMode}
            className="overflow-hidden text-ellipsis whitespace-nowrap"
          />
        )}

        <div className="ml-auto hidden justify-end md:flex">
          <MapResultBadges result={result} />
        </div>
      </div>
    </div>
  );
};

interface MapInfoProps extends HTMLAttributes<HTMLDivElement> {
  map: ResultCardInfo["map"];
  isToggledInputMode: boolean;
}

function MapInfo({ map, isToggledInputMode, className, ...rest }: MapInfoProps) {
  const handleLinkClick = useLinkClick();

  return (
    <div className={cn("mt-2 mb-3 flex flex-col justify-between", className)} {...rest}>
      <TooltipWrapper label={`${map.title} / ${map.artist_name}${map.music_source ? `【${map.music_source}】` : ""}`}>
        <Link href={`/type/${map.id}`} onClick={handleLinkClick} className="text-secondary hover:underline">
          <div className="overflow-hidden text-base font-bold text-ellipsis whitespace-nowrap">
            {`${map.title} / ${map.artist_name}`}
          </div>
        </Link>
      </TooltipWrapper>
      <div className="text-xs">
        <span>
          制作者:{" "}
          <Link href={`/user/${map.creator.id}`} onClick={handleLinkClick} className="text-secondary hover:underline">
            {map.creator.name}
          </Link>
        </span>
      </div>
    </div>
  );
}

export default ResultInnerCardBody;
