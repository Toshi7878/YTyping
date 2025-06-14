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

function LeftMenus() {
  return (
    <nav className="hidden items-center md:flex">
      <Menu />
      {leftLink.map((link, index) => (
        <Button
          key={index}
          variant="ghost"
          size="sm"
          asChild
          className="text-header-foreground hover:text-foreground text-sm"
        >
          <Link href={link.href} className="w-full">
            {link.title}
          </Link>
        </Button>
      ))}
    </nav>
  );
}

const Menu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="unstyled" size="sm" className="text-header-foreground hover:text-foreground text-sm">
          Menu <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-fit">
        {leftMenuItem.map((menuItem, index) => (
          <DropdownMenuItem key={index} asChild>
            <Link href={menuItem.href} className="w-full">
              {menuItem.title}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LeftMenus;
