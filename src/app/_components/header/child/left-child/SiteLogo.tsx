import { useLinkClick } from "@/utils/global-hooks/useLinkClick";
import Link from "next/link";
import { usePathname } from "next/navigation";

function SiteLogo() {
  const handleLinkClick = useLinkClick();
  const pathname = usePathname();
  return (
    <Link
      href={pathname === "/user/register" ? "/user/register" : "/"}
      onClick={handleLinkClick}
      className="user-select-none text-foreground !hover:bg-secondary/30 !hover:text-header-foreground relative top-[-2.5px] px-2 text-2xl font-bold"
    >
      <span>Y</span>
      <span>Typing</span>
    </Link>
  );
}

export default SiteLogo;
