import { Image, ImageProps } from "@chakra-ui/next-js";
import { Button, ButtonProps } from "@chakra-ui/react";
import { ICON_SIZE } from "../../../ts/const";

interface MenuSpeedButtonProps {
  image: ImageProps["src"];
  title: string;
}

const MenuSpeedButton = ({ image, title, ...props }: MenuSpeedButtonProps & ButtonProps) => {
  return (
    <Button
      leftIcon={<Image src={image} alt={title} width={ICON_SIZE} height={ICON_SIZE} />}
      title={title}
      variant="ghost"
      size="sm"
      {...props}
    >
      {"1.00"}
      {title}
    </Button>
  );
};

export default MenuSpeedButton;
