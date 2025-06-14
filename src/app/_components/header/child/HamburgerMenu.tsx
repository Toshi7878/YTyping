"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "@/components/ui/link/link";
import { leftLink, leftMenuItem, loginMenuItem } from "@/config/headerNav";
import { useUserAgent } from "@/utils/useUserAgent";
import { Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import { BsDiscord, BsGoogle } from "react-icons/bs";
import LogOutMenuItem from "./right-child/login/child/LogOutMenuItem";
import SignInMenuItem from "./right-child/login/child/SignInMenuItem";

interface HamburgerMenuProps {
  className?: string;
}

const HamburgerMenu = ({ className }: HamburgerMenuProps) => {
  const { data: session } = useSession();
  const { isMobile } = useUserAgent();

  const menus = leftMenuItem.concat(leftLink);

  return (
    <div className={className}>
      <DropdownMenu>
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
                <DropdownMenuItem key={index} asChild>
                  <Link href={menuItem.href} className="w-full">
                    {menuItem.title}
                  </Link>
                </DropdownMenuItem>
              );
            }
            return null;
          })}

          <DropdownMenuSeparator />

          {session?.user?.name ? (
            <>
              {loginMenuItem.map((item, index) => (
                <DropdownMenuItem key={index} asChild>
                  <Link href={item.href} className="w-full">
                    {item.title}
                  </Link>
                </DropdownMenuItem>
              ))}
              <LogOutMenuItem />
            </>
          ) : (
            !session && (
              <>
                <DropdownMenuItem asChild>
                  <SignInMenuItem
                    className="flex w-full items-center gap-2 hover:bg-[#7289DA] hover:text-white"
                    text="Discordでログイン"
                    leftIcon={<BsDiscord size="1.5em" />}
                    provider="discord"
                  />
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <SignInMenuItem
                    className="flex w-full items-center gap-2 hover:bg-[#DB4437] hover:text-white"
                    text="Googleでログイン"
                    leftIcon={<BsGoogle size="1.5em" />}
                    provider="google"
                  />
                </DropdownMenuItem>
              </>
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default HamburgerMenu;
