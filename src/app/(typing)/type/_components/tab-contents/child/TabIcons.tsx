import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import EditIcon from "./icon-child/EditIcon";
import LikeIcon from "./icon-child/LikeIcon";
import SettingPopover from "./setting-card/SettingPopover";

export default function TabIcons() {
  const { data: session } = useSession();

  return (
    <>
      <div className={cn("absolute -top-5 -right-2.5 flex items-center justify-end", "text-foreground/60")}>
        {session?.user.id ? <SettingPopover /> : null}
        {session?.user.id ? <LikeIcon /> : null}
        <EditIcon />
      </div>
    </>
  );
}
