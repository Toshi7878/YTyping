import MapLeftThumbnail from "@/components/shared/MapCardThumbnail";
import { Badge } from "@/components/ui/badge";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { RouterOutPuts } from "@/server/api/trpc";
import { nolink } from "@/utils/no-link";
import Link from "next/link";
import { HTMLAttributes } from "react";
import { MapResultStatus } from "./child/MapResultStatus";

const ResultCardContent = ({ result }: { result: RouterOutPuts["result"]["usersResultList"]["items"][number] }) => {
  const isToggledInputMode = result.status.romaType != 0 && result.status.kanaType != 0;

  return (
    <div className="flex w-full items-center gap-4 py-6">
      <Badge
        variant="result"
        className={cn("hidden font-bold md:flex", result.rank === 1 && "outline-text text-perfect")}
        size="lg"
      >
        Rank: #{result.rank}
      </Badge>

      <MapLeftThumbnail
        alt={result.map.title}
        src={`https://i.ytimg.com/vi/${result.map.videoId}/mqdefault.jpg`}
        mapVideoId={result.map.videoId}
        mapPreviewTime={result.map.previewTime}
        mapPreviewSpeed={result.status.playSpeed}
        size="timeline"
      />

      <MapInfo map={result.map} isToggledInputMode={isToggledInputMode} className="flex-1" />

      <MapResultStatus result={result} className="hidden md:flex" />
    </div>
  );
};

interface MapInfoProps extends HTMLAttributes<HTMLDivElement> {
  map: RouterOutPuts["result"]["usersResultList"]["items"][number]["map"];
  isToggledInputMode: boolean;
}

function MapInfo({ map, isToggledInputMode, className, ...rest }: MapInfoProps) {
  const musicSource = map.musicSource ? `【${map.musicSource}】` : "";
  return (
    <div className={cn("flex flex-col justify-center gap-4 truncate", className)} {...rest}>
      <TooltipWrapper delayDuration={300} label={nolink(`${map.title} / ${map.artistName}${musicSource}`)}>
        <Link href={`/type/${map.id}`} className="text-secondary block hover:underline">
          <div className="truncate text-sm font-bold sm:text-base">{nolink(`${map.title} / ${map.artistName}`)}</div>
        </Link>
      </TooltipWrapper>
      <div className="truncate text-xs">
        制作者:{" "}
        <Link href={`/user/${map.creatorId}`} className="text-secondary hover:underline">
          {map.creatorName}
        </Link>
      </div>
    </div>
  );
}

export default ResultCardContent;
