import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import EditIconButton from "./icon-button/edit-icon-button"
import LikeIconButton from "./icon-button/like-icon-button"
import SettingPopover from "./setting-card/setting-popover"

export default function TabIcons({ className }: { className?: string }) {
  const { data: session } = useSession()

  return (
    <div className={cn("text-foreground/60 relative flex md:bottom-1", className)}>
      {session?.user.id ? <SettingPopover /> : null}
      {session?.user.id ? <LikeIconButton /> : null}
      <EditIconButton />
    </div>
  )
}
