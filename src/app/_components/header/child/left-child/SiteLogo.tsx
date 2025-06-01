import { useLinkClick } from "@/util/global-hooks/useLinkClick";
import Link from "next/link";
import { usePathname } from "next/navigation";

function SiteLogo() {
  const handleLinkClick = useLinkClick();
  const pathname = usePathname();
  return (
    <Link
      href={pathname === "/user/register" ? "/user/register" : "/"}
      onClick={handleLinkClick}
      className="px-2 user-select-none text-2xl font-bold relative top-[-2.5px] text-foreground !hover:bg-secondary/30 !hover:text-header-foreground"
    >
      <span>Y</span>
      <span>Typing</span>
    </Link>
  );
}

export default SiteLogo;
