import { LEFT_LINKS, LEFT_MENU_ITEM } from "@/app/_components/header/lib/const";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

export const SiteLogo = () => {
  return (
    <Link
      href="/"
      className="hover:bg-secondary/30 relative top-[-2px] px-2 text-2xl font-bold transition-colors duration-200"
    >
      <span>Y</span>
      <span>Typing</span>
    </Link>
  );
};

function LeftMenus() {
  return (
    <nav className="text-header-foreground hidden items-center select-none md:flex">
      <LinksDropdownMenu />
      {LEFT_LINKS.map((link, index) => (
        <Button key={index} variant="unstyled" size="sm" asChild className="hover:text-foreground text-sm">
          <Link href={link.href}>{link.title}</Link>
        </Button>
      ))}
    </nav>
  );
}

const LinksDropdownMenu = () => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="unstyled" size="sm" className="hover:text-foreground text-sm">
          Menu <ChevronDown className="relative top-[1px] size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-fit">
        {LEFT_MENU_ITEM.map((menuItem, index) => (
          <Link href={menuItem.href} key={index}>
            <DropdownMenuItem>{menuItem.title}</DropdownMenuItem>
          </Link>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LeftMenus;
