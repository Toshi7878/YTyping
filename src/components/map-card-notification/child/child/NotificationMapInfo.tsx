"use client";
import Link from "@/components/ui/link";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { RouterOutPuts } from "@/server/api/trpc";
import { useLinkClick } from "@/utils/global-hooks/useLinkClick";
import MapBadges from "./MapBadgesLayout";

interface CompactMapCardProps {
  map: RouterOutPuts["notification"]["getInfiniteUserNotifications"]["notifications"][number]["map"];
}

function CompactMapInfo({ map }: CompactMapCardProps) {
  const handleLinkClick = useLinkClick();

  return (
    <Link
      className="flex h-full flex-col justify-between hover:no-underline"
      href={`/type/${map.id}`}
      onClick={handleLinkClick}
    >
      <div className="flex flex-col gap-1">
        <TooltipWrapper label={`${map.title} / ${map.artist_name}${map.music_source ? `【${map.music_source}】` : ""}`}>
          <div className="text-secondary truncate overflow-hidden text-base font-bold whitespace-nowrap">
            {map.title}
          </div>
        </TooltipWrapper>
        <div className="text-secondary truncate overflow-hidden text-xs font-bold whitespace-nowrap sm:text-sm">
          {map.artist_name || ""}
        </div>
      </div>
      <MapBadges map={map} />
    </Link>
  );
}

export default CompactMapInfo;
