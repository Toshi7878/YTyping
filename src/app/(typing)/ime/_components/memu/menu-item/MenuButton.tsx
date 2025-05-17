import { Image, ImageProps } from "@chakra-ui/next-js";
import { Button, ButtonProps } from "@chakra-ui/react";
import { ICON_SIZE } from "../../../ts/const";

interface MenuButtonProps {
  image: ImageProps["src"];
  title: string;
}

const MenuButton = ({ image, title, ...props }: MenuButtonProps & ButtonProps) => {
  return (
    <Button
      leftIcon={<Image src={image} alt={title} width={ICON_SIZE} height={ICON_SIZE} />}
      variant="ghost"
      size="sm"
      {...props}
    >
      {title}
    </Button>
  );
};

export default MenuButton;
