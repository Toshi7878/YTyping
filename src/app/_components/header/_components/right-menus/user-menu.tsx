import { ChevronDown } from "lucide-react"
import Link from "next/link"
import { LOGIN_MENU_LINK_ITEM } from "@/app/_components/header/lib/const"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { LogOutDropdownItem } from "./auth/auth-dropdown-items"
import { ThemeDropdownSubmenu } from "./theme-dropdown-sub-menu"

interface UserMenuProps {
  userName: string
  className: string
}

export default function UserMenu({ userName, className }: UserMenuProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="unstyled"
          size="sm"
          className={cn("hover:text-header-foreground text-header-foreground/80 mb-0.5", className)}
        >
          {userName}
          <ChevronDown className="relative top-[1px] size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-fit">
        {LOGIN_MENU_LINK_ITEM.map((item, index) => (
          <Link href={item.href} key={index}>
            <DropdownMenuItem>{item.title}</DropdownMenuItem>
          </Link>
        ))}
        <ThemeDropdownSubmenu />

        <DropdownMenuSeparator />

        <LogOutDropdownItem />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
