import { cn } from "@/lib/utils";
import { LeftNav, RightNav } from "./_components/navs";

interface HeaderProps {
  className: string;
}

export const Header = ({ className }: HeaderProps) => {
  return (
    <header id="header" className={cn("bg-header-background", className)}>
      <nav className="mx-4 flex items-center justify-between pt-px md:mx-10 lg:mx-36">
        <LeftNav />
        <RightNav />
      </nav>
    </header>
  );
};
