"use client";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { RouterOutPuts } from "@/server/api/trpc";
import { useLinkClick } from "@/utils/global-hooks/useLinkClick";
import Link from "next/link";
import MapBadges from "./MapBadgesLayout";

interface MapCardProps {
  map: RouterOutPuts["notification"]["getInfiniteUserNotifications"]["notifications"][number]["map"];
}
function NotificationMapInfo({ map }: MapCardProps) {
  const handleLinkClick = useLinkClick();

  return (
    <Link
      className="flex h-full flex-col justify-between hover:no-underline"
      href={`/type/${map.id}`}
      onClick={handleLinkClick}
    >
      <div className="flex flex-col gap-1">
        <CustomToolTip
          label={`${map.title} / ${map.artist_name}${map.music_source ? `【${map.music_source}】` : ""}`}
          placement="top"
          right={12}
        >
          <div className="text-secondary truncate overflow-hidden text-base font-bold whitespace-nowrap">
            {map.title}
          </div>
        </CustomToolTip>
        <div className="text-secondary truncate overflow-hidden text-xs font-bold whitespace-nowrap sm:text-sm">
          {map.artist_name || ""}
        </div>
      </div>
      <MapBadges map={map} />
    </Link>
  );
}

export default NotificationMapInfo;
