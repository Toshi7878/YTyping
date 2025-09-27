"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useActionState } from "react";
import { LEFT_LINKS, LEFT_MENU_LINK_ITEM, LOGIN_MENU_LINK_ITEM } from "@/app/_components/header/lib/const";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserAgent } from "@/lib/global-atoms";
import { SignInDropdownItems } from "./auth/auth-dropdown-items";
import { ThemeDropdownSubmenu } from "./theme-dropdown-sub-menu";

interface HamburgerMenuProps {
  className?: string;
}

export const HamburgerMenu = ({ className }: HamburgerMenuProps) => {
  const { data: session } = useSession();
  const isMobile = useUserAgent()?.getDevice().type === "mobile";

  const menus = LEFT_MENU_LINK_ITEM.concat(LEFT_LINKS);
  const [, formAction] = useActionState(() => signOut({ redirect: false }), null);

  return (
    <div className={className}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-header-foreground hover:bg-accent/50 border border-solid p-2"
          >
            <Menu className="text-header-foreground size-4" />
            <span className="sr-only">メニューを開く</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          {menus.reverse().map((menuItem) => {
            if (isMobile === undefined) {
              return null;
            }
            if ((menuItem.device === "PC" && !isMobile) || !menuItem.device) {
              return (
                <Link href={menuItem.href} key={menuItem.title}>
                  <DropdownMenuItem>{menuItem.title}</DropdownMenuItem>
                </Link>
              );
            }
            return null;
          })}

          <ThemeDropdownSubmenu />
          <DropdownMenuSeparator />

          {session?.user?.name ? (
            <>
              {LOGIN_MENU_LINK_ITEM.map((item) => (
                <Link href={item.href} key={item.title}>
                  <DropdownMenuItem>{item.title}</DropdownMenuItem>
                </Link>
              ))}
              <DropdownMenuItem onSelect={() => formAction()}>ログアウト</DropdownMenuItem>
            </>
          ) : (
            !session && <SignInDropdownItems />
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
