import { Button } from "@/components/ui/button";
import Link from "@/components/ui/link";
import { useLinkClick } from "@/utils/global-hooks/useLinkClick";
import Image from "next/image";
import { ICON_SIZE } from "../../../_lib/const";

interface LinkMenuButtonProps {
  image?: string;
  title: string;
  href: string;
}

const LinkMenuButton = ({ image, title, href, ...props }: LinkMenuButtonProps) => {
  const handleLinkClick = useLinkClick();

  return (
    <Link href={href} onClick={(event) => handleLinkClick(event, "replace")} {...props}>
      <Button variant="outline" size="sm" className="gap-2">
        {image && <Image src={image} alt={title} width={ICON_SIZE} height={ICON_SIZE} className="shrink-0" />}
        {title}
      </Button>
    </Link>
  );
};

export default LinkMenuButton;
