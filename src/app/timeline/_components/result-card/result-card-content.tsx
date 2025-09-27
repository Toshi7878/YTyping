import Link from "next/link";
import type { HTMLAttributes } from "react";
import MapLeftThumbnail from "@/components/shared/map-card-thumbnail";
import { Badge } from "@/components/ui/badge";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { RouterOutPuts } from "@/server/api/trpc";
import { nolink } from "@/utils/no-link";
import { ResultStatus } from "./child/result-status";

const ResultCardContent = ({ result }: { result: RouterOutPuts["result"]["usersResultList"]["items"][number] }) => {
  return (
    <div className="flex w-full items-center gap-4 py-6">
      <Badge
        variant="result"
        className={cn("hidden font-bold md:flex", result.rank === 1 && "outline-text text-perfect")}
        size="lg"
      >
        Rank: #{result.rank}
      </Badge>

      <MapLeftThumbnail alt={result.map.info.title} media={result.map.media} size="timeline" />

      <MapInfo map={result.map} className="flex-1" />

      <ResultStatus result={result} className="hidden md:flex" />
    </div>
  );
};

interface MapInfoProps extends HTMLAttributes<HTMLDivElement> {
  map: RouterOutPuts["result"]["usersResultList"]["items"][number]["map"];
}

function MapInfo({ map, className, ...rest }: MapInfoProps) {
  const musicSource = map.info.source ? `【${map.info.source}】` : "";
  return (
    <div className={cn("flex flex-col justify-center gap-4 truncate", className)} {...rest}>
      <TooltipWrapper delayDuration={300} label={nolink(`${map.info.title} / ${map.info.artistName}${musicSource}`)}>
        <Link href={`/type/${map.id}`} className="text-secondary block hover:underline">
          <div className="truncate text-sm font-bold sm:text-base">
            {nolink(`${map.info.title} / ${map.info.artistName}`)}
          </div>
        </Link>
      </TooltipWrapper>
      <div className="truncate text-xs">
        制作者:{" "}
        <Link href={`/user/${map.creator.id}`} className="text-secondary hover:underline">
          {map.creator.name}
        </Link>
      </div>
    </div>
  );
}

export default ResultCardContent;
