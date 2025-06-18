import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "@/components/ui/link/link";
import { leftLink, leftMenuItem } from "@/config/headerNav";
import { ChevronDown } from "lucide-react";

export const SiteLogo = () => {
  return (
    <Link
      href="/"
      className="hover:bg-secondary/30 relative top-[-2.5px] px-2 text-2xl font-bold transition-colors duration-200"
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
      {leftLink.map((link, index) => (
        <Button key={index} variant="unstyled" size="sm" asChild className="hover:text-foreground text-sm">
          <Link href={link.href}>{link.title}</Link>
        </Button>
      ))}
    </nav>
  );
}

const LinksDropdownMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="unstyled" size="sm" className="hover:text-foreground text-sm">
          Menu <ChevronDown className="relative top-[1px] size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-fit">
        {leftMenuItem.map((menuItem, index) => (
          <DropdownMenuItem key={index} asChild>
            <Link href={menuItem.href}>{menuItem.title}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LeftMenus;
