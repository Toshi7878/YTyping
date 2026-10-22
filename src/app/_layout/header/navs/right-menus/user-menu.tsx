"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Session } from "@/auth/client";
import { orpc } from "@/orpc/provider";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { cn } from "@/utils/cn";
import { buildAdminMenuLinkItems, buildUserMenuLinkItems, CONTACT_MENU_ITEM } from "../menu-items";
import { LogOutDropdownItem } from "./auth/auth-dropdown-items";
import { LanguageDropdownSubmenu } from "./language-dropdown-sub-menu";
import { ThemeDropdownSubmenu } from "./theme-dropdown-sub-menu";

interface UserMenuProps {
  session: Session;
  className: string;
}

export const UserMenu = ({ session, className }: UserMenuProps) => {
  const t = useTranslations("header.menu");
  const { data: ppRank } = useSuspenseQuery(orpc.ranking.pp.getRankByUserId.queryOptions({ input: session.user.id }));
  const userMenuLinkItems = buildUserMenuLinkItems(session);
  const adminMenuLinkItems = buildAdminMenuLinkItems(session);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="unstyled"
            size="sm"
            className={cn("mb-0.5 text-header-foreground/80 hover:text-header-foreground", className)}
          >
            <span id="header_user_name">{session.user.name}</span>
            <span className="tabular-nums opacity-60">#{ppRank}</span>
            <ChevronDown className="relative top-px size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-fit">
        {userMenuLinkItems.map((item) => (
          <Link href={item.href} key={item.labelKey}>
            <DropdownMenuItem>{t(item.labelKey)}</DropdownMenuItem>
          </Link>
        ))}
        <ThemeDropdownSubmenu />
        <LanguageDropdownSubmenu />
        <Link href={CONTACT_MENU_ITEM.href}>
          <DropdownMenuItem>{t(CONTACT_MENU_ITEM.labelKey)}</DropdownMenuItem>
        </Link>
        {adminMenuLinkItems.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {adminMenuLinkItems.map((item) => (
              <Link href={item.href} key={item.labelKey}>
                <DropdownMenuItem>{t(item.labelKey)}</DropdownMenuItem>
              </Link>
            ))}
          </>
        )}

        <DropdownMenuSeparator />

        <LogOutDropdownItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
