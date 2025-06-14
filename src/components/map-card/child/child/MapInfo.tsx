"use client";
import Link from "@/components/ui/link/link";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { RouterOutPuts } from "@/server/api/trpc";
import { useLinkClick } from "@/utils/global-hooks/useLinkClick";
import MapBadges from "./MapBadgesLayout";
import MapCreateUser from "./MapCreateUser";

interface MapInfoProps {
  map: RouterOutPuts["mapList"]["getByVideoId"][number];
}
function MapInfo({ map }: MapInfoProps) {
  const handleLinkClick = useLinkClick();

  return (
    <div className="flex h-full flex-col justify-between pt-2 pl-3 hover:no-underline">
      <div className="flex flex-col gap-1">
        <TooltipWrapper label={`${map.title} / ${map.artist_name}${map.music_source ? `【${map.music_source}】` : ""}`}>
          <Link
            href={`/type/${map.id}`}
            onClick={handleLinkClick}
            className="text-secondary z-[1] truncate overflow-hidden text-base font-bold whitespace-nowrap hover:no-underline"
          >
            {map.title}
          </Link>
        </TooltipWrapper>

        <div className="text-secondary truncate overflow-hidden text-xs font-bold whitespace-nowrap sm:text-sm">
          {map.artist_name || ""}
          {map.music_source ? `【${map.music_source}】` : ""}
        </div>
      </div>
      <div className="flex flex-row items-baseline justify-between lg:flex-col">
        <MapCreateUser map={map} />
        <MapBadges map={map} />
      </div>
    </div>
  );
}

export default MapInfo;
