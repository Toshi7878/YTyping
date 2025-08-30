import { ResultCardInfo } from "@/app/timeline/_lib/type";
import MapLeftThumbnail from "@/components/share-components/MapCardThumbnail";
import { Badge } from "@/components/ui/badge";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useLinkClick } from "@/utils/global-hooks/useLinkClick";
import Link from "next/link";
import { HTMLAttributes } from "react";
import { MapResultStatus } from "./child/MapResultStatus";

const ResultCardContent = ({ result }: { result: ResultCardInfo }) => {
  const isToggledInputMode = result.status.roma_type != 0 && result.status.kana_type != 0;

  return (
    <div className="flex w-full items-center gap-4 py-6">
      <Badge variant="result" className="hidden font-bold md:flex" size="lg">
        Rank: #{result.rank}
      </Badge>

      <MapLeftThumbnail
        alt={result.map.title}
        src={`https://i.ytimg.com/vi/${result.map.video_id}/mqdefault.jpg`}
        mapVideoId={result?.map.video_id}
        mapPreviewTime={result?.map.preview_time}
        mapPreviewSpeed={result?.status.default_speed}
        size="timeline"
      />

      <MapInfo map={result.map} isToggledInputMode={isToggledInputMode} className="flex-1" />

      <MapResultStatus result={result} className="hidden md:flex" />
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
    <div className={cn("flex flex-col justify-center gap-4 truncate", className)} {...rest}>
      <TooltipWrapper label={`${map.title} / ${map.artist_name}${map.music_source ? `【${map.music_source}】` : ""}`}>
        <Link href={`/type/${map.id}`} onClick={handleLinkClick} className="text-secondary block hover:underline">
          <div className="truncate text-sm font-bold sm:text-base">{`${map.title} / ${map.artist_name}`}</div>
        </Link>
      </TooltipWrapper>
      <div className="truncate text-xs">
        制作者:{" "}
        <Link href={`/user/${map.creator.id}`} onClick={handleLinkClick} className="text-secondary hover:underline">
          {map.creator.name}
        </Link>
      </div>
    </div>
  );
}

export default ResultCardContent;
