import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import EditIcon from "./icon-child/EditIcon";
import LikeIcon from "./icon-child/LikeIcon";
import SettingPopover from "./setting-card/SettingPopover";

export default function TabIcons({ className }: { className?: string }) {
  const { data: session } = useSession();

  return (
    <div className={cn("text-foreground/60 relative flex md:bottom-1", className)}>
      {session?.user.id ? <SettingPopover /> : null}
      {session?.user.id ? <LikeIcon /> : null}
      <EditIcon />
    </div>
  );
}
