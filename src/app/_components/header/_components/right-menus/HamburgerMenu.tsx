"use client";

import { LEFT_LINKS, LEFT_MENU_ITEM, LOGIN_MENU_ITEM } from "@/app/_components/header/lib/const";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserAgent } from "@/utils/useUserAgent";
import { Menu } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useActionState } from "react";
import { SignInDropdownItems } from "./login/AuthDropdownItems";

interface HamburgerMenuProps {
  className?: string;
}

const HamburgerMenu = ({ className }: HamburgerMenuProps) => {
  const { data: session } = useSession();
  const { isMobile } = useUserAgent();

  const menus = LEFT_MENU_ITEM.concat(LEFT_LINKS);
  const [, formAction] = useActionState(async () => {
    return await signOut({ redirect: false });
  }, null);

  return (
    <div className={className}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="border-border/50 border border-solid p-2">
            <Menu className="h-4 w-4" />
            <span className="sr-only">メニューを開く</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          {menus.reverse().map((menuItem, index) => {
            if (isMobile === undefined) {
              return null;
            }
            if ((menuItem.device === "PC" && !isMobile) || !menuItem.device) {
              return (
                <Link href={menuItem.href} key={index}>
                  <DropdownMenuItem>{menuItem.title}</DropdownMenuItem>
                </Link>
              );
            }
            return null;
          })}

          <DropdownMenuSeparator />

          {session?.user?.name ? (
            <>
              {LOGIN_MENU_ITEM.map((item, index) => (
                <Link href={item.href} key={index}>
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

export default HamburgerMenu;
