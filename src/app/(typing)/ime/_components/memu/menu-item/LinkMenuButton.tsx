import { useLinkClick } from "@/util/global-hooks/useLinkClick";
import { Image, ImageProps, Link, LinkProps } from "@chakra-ui/next-js";
import { Button } from "@chakra-ui/react";
import { ICON_SIZE } from "../../../ts/const";

interface LinkMenuButtonProps {
  image?: ImageProps["src"];
  title: string;
}

const LinkMenuButton = ({ image, title, ...props }: LinkMenuButtonProps & LinkProps) => {
  const handleLinkClick = useLinkClick();

  return (
    <Link {...props} onClick={(event) => handleLinkClick(event, "replace")}>
      <Button
        leftIcon={image ? <Image src={image} alt={title} width={ICON_SIZE} height={ICON_SIZE} /> : undefined}
        variant="outline"
        size="sm"
      >
        {title}
      </Button>
    </Link>
  );
};

export default LinkMenuButton;
