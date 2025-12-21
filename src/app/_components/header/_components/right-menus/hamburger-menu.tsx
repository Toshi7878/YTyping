"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { buildUserMenuLinkItems, LEFT_LINKS, LEFT_MENU_LINK_ITEMS } from "@/app/_components/header/lib/menu-items";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsDesktopDeviceState } from "@/lib/atoms/user-agent";
import { LogOutDropdownItem, SignInDropdownItems } from "./auth/auth-dropdown-items";
import { ThemeDropdownSubmenu } from "./theme-dropdown-sub-menu";

interface HamburgerMenuProps {
  className?: string;
}

export const HamburgerMenu = ({ className }: HamburgerMenuProps) => {
  const { data: session } = useSession();

  return (
    <div className={className}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border border-header-foreground border-solid p-2 hover:bg-accent/50"
          >
            <Menu className="size-4 text-header-foreground" />
            <span className="sr-only">メニューを開く</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <MenuDropdownItems />

          <ThemeDropdownSubmenu />
          <DropdownMenuSeparator />

          {session?.user?.name ? (
            <UserMenuDropdownItems userId={session.user.id} />
          ) : (
            !session && <SignInDropdownItems />
          )}
          {session?.user?.name && (
            <>
              <DropdownMenuSeparator />
              <LogOutDropdownItem />
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const MenuDropdownItems = () => {
  const isDesktop = useIsDesktopDeviceState();
  const menus = [...LEFT_LINKS, ...LEFT_MENU_LINK_ITEMS];

  return (
    <>
      {menus.map((menuItem) => {
        const isDesktopMenuItem = menuItem.device === "PC";
        if ((isDesktopMenuItem && isDesktop) || !isDesktopMenuItem) {
          return (
            <Link href={menuItem.href} key={menuItem.title}>
              <DropdownMenuItem>{menuItem.title}</DropdownMenuItem>
            </Link>
          );
        }
        return null;
      })}
    </>
  );
};

const UserMenuDropdownItems = ({ userId }: { userId: string }) => {
  const userMenuLinkItems = buildUserMenuLinkItems(userId);
  return (
    <>
      {userMenuLinkItems.map((item) => (
        <Link href={item.href} key={item.title}>
          <DropdownMenuItem>{item.title}</DropdownMenuItem>
        </Link>
      ))}
    </>
  );
};
