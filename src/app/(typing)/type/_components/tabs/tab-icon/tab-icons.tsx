import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { EditIconButton } from "./icon-button/edit-icon-button";
import { LikeIconButton } from "./icon-button/like-icon-button";
import { SettingPopover } from "./setting/popover";

export const TabIcons = ({ className }: { className?: string }) => {
  const { data: session } = useSession();

  return (
    <div className={cn("relative flex text-foreground/60 max-sm:pr-10 md:bottom-1", className)}>
      {session?.user.id ? <SettingPopover /> : null}
      {session?.user.id ? <LikeIconButton /> : null}
      <EditIconButton />
    </div>
  );
};
