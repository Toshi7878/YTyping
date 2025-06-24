import { cn } from "@/lib/utils";
import { LeftNav, RightNav } from "./_components/Nav";

interface HeaderProps {
  className: string;
}

const Header = ({ className }: HeaderProps) => {
  return (
    <header id="header" className={cn("bg-header-background text-header-foreground", className)}>
      <nav className="mx-36 flex items-center justify-between">
        <LeftNav />
        <RightNav />
      </nav>
    </header>
  );
};

export default Header;
