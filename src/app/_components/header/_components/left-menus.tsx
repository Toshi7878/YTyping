import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { LEFT_LINKS, LEFT_MENU_LINK_ITEM } from "@/app/_components/header/lib/const";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const SiteLogo = () => {
  return (
    <Link
      href="/"
      className="hover:bg-secondary/30 text-header-foreground h-9 px-2 text-2xl font-bold transition-colors duration-200"
    >
      <span>Y</span>
      <span>Typing</span>
    </Link>
  );
};

export const LeftMenus = () => {
  return (
    <nav className="text-header-foreground/80 hidden items-center select-none md:flex">
      <LinksDropdownMenu />
      {LEFT_LINKS.map((link) => (
        <Button key={link.title} variant="unstyled" size="sm" asChild className="hover:text-header-foreground text-sm">
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
        <Button variant="unstyled" size="sm" className="hover:text-header-foreground text-sm">
          Menu <ChevronDown className="relative top-[1px] size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-fit">
        {LEFT_MENU_LINK_ITEM.map((menuItem) => (
          <Link href={menuItem.href} key={menuItem.title}>
            <DropdownMenuItem>{menuItem.title}</DropdownMenuItem>
          </Link>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
