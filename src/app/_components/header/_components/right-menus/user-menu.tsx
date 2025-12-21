import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { buildUserMenuLinkItems } from "../../menu-items";
import { LogOutDropdownItem } from "./auth/auth-dropdown-items";
import { ThemeDropdownSubmenu } from "./theme-dropdown-sub-menu";

interface UserMenuProps {
  userName: string;
  className: string;
  userId: string;
}

export const UserMenu = ({ userName, className, userId }: UserMenuProps) => {
  const userMenuLinkItems = buildUserMenuLinkItems(userId);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="unstyled"
          size="sm"
          className={cn("mb-0.5 text-header-foreground/80 hover:text-header-foreground", className)}
        >
          {userName}
          <ChevronDown className="relative top-px size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-fit">
        {userMenuLinkItems.map((item) => (
          <Link href={item.href} key={item.title}>
            <DropdownMenuItem>{item.title}</DropdownMenuItem>
          </Link>
        ))}
        <ThemeDropdownSubmenu />

        <DropdownMenuSeparator />

        <LogOutDropdownItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
