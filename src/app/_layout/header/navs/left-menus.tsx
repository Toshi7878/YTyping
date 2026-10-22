import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { LEFT_LINKS, LEFT_MENU_LINK_ITEMS } from "./menu-items";

export const SiteLogo = () => {
  const isHome = usePathname() === "/";
  return (
    <Link
      href="/"
      onClick={() => {
        if (isHome) {
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      }}
      className="h-9 px-2 font-bold text-2xl text-header-foreground transition-colors duration-200 hover:bg-secondary/30"
    >
      <span>Y</span>
      <span>Typing</span>
    </Link>
  );
};

export const LeftMenus = () => {
  const t = useTranslations("header.menu");

  return (
    <nav className="hidden select-none items-center text-header-foreground/80 md:flex">
      <LinksDropdownMenu />
      {LEFT_LINKS.map((link) => (
        <Link
          key={link.labelKey}
          href={link.href}
          className={buttonVariants({
            variant: "unstyled",
            size: "sm",
            className: "text-sm hover:text-header-foreground",
          })}
        >
          {t(link.labelKey)}
        </Link>
      ))}
    </nav>
  );
};

const LinksDropdownMenu = () => {
  const t = useTranslations("header.menu");

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        render={
          <Button variant="unstyled" size="sm" className="text-sm hover:text-header-foreground">
            Menu <ChevronDown className="relative top-px size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="min-w-fit">
        {LEFT_MENU_LINK_ITEMS.map((menuItem) => (
          <Link href={menuItem.href} key={menuItem.labelKey}>
            <DropdownMenuItem>{t(menuItem.labelKey)}</DropdownMenuItem>
          </Link>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
