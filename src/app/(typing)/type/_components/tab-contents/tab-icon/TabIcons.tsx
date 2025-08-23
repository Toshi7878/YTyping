import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import EditIcon from "./icon-child/EditIcon";
import LikeIcon from "./icon-child/LikeIcon";
import SettingPopover from "./setting-card/SettingPopover";

export default function TabIcons() {
  const { data: session } = useSession();

  return (
    <div className={cn("text-foreground/60 mb-2.5 flex items-center justify-end")}>
      {session?.user.id ? <SettingPopover /> : null}
      {session?.user.id ? <LikeIcon /> : null}
      <EditIcon />
    </div>
  );
}
