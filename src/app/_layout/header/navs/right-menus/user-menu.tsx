"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import type { Session } from "@/auth/client";
import { useTRPC } from "@/trpc/provider";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { cn } from "@/utils/cn";
import { buildUserMenuLinkItems } from "../menu-items";
import { LogOutDropdownItem } from "./auth/auth-dropdown-items";
import { ThemeDropdownSubmenu } from "./theme-dropdown-sub-menu";

interface UserMenuProps {
  session: Session;
  className: string;
}

export const UserMenu = ({ session, className }: UserMenuProps) => {
  const trpc = useTRPC();
  const { data: ppRank } = useSuspenseQuery(trpc.ranking.pp.getRankByUserId.queryOptions(session.user.id));
  const userMenuLinkItems = buildUserMenuLinkItems(session);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="unstyled"
          size="sm"
          className={cn("mb-0.5 text-header-foreground/80 hover:text-header-foreground", className)}
        >
          <span id="header_user_name">{session.user.name}</span>
          <span className="tabular-nums opacity-60">#{ppRank}</span>
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
