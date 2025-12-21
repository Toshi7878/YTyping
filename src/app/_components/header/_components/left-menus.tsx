import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LEFT_LINKS, LEFT_MENU_LINK_ITEMS } from "../menu-items";

export const SiteLogo = () => {
  return (
    <Link
      href="/"
      className="h-9 px-2 font-bold text-2xl text-header-foreground transition-colors duration-200 hover:bg-secondary/30"
    >
      <span>Y</span>
      <span>Typing</span>
    </Link>
  );
};

export const LeftMenus = () => {
  return (
    <nav className="hidden select-none items-center text-header-foreground/80 md:flex">
      <LinksDropdownMenu />
      {LEFT_LINKS.map((link) => (
        <Button key={link.title} variant="unstyled" size="sm" asChild className="text-sm hover:text-header-foreground">
          <Link href={link.href}>{link.title}</Link>
        </Button>
      ))}
    </nav>
  );
};

const LinksDropdownMenu = () => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="unstyled" size="sm" className="text-sm hover:text-header-foreground">
          Menu <ChevronDown className="relative top-[1px] size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-fit">
        {LEFT_MENU_LINK_ITEMS.map((menuItem) => (
          <Link href={menuItem.href} key={menuItem.title}>
            <DropdownMenuItem>{menuItem.title}</DropdownMenuItem>
          </Link>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
