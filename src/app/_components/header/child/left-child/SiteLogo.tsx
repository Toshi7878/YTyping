import { Link } from "@/components/ui/link/link";
import { usePathname } from "next/navigation";

function SiteLogo() {
  const pathname = usePathname();
  return (
    <Link
      href={pathname === "/user/register" ? "/user/register" : "/"}
      className="text-foreground hover:bg-secondary/30 hover:text-header-foreground relative top-[-2.5px] px-2 text-2xl font-bold transition-colors duration-200"
    >
      <span>Y</span>
      <span>Typing</span>
    </Link>
  );
}

export default SiteLogo;
