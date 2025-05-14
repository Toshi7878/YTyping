import { Image, ImageProps } from "@chakra-ui/next-js";
import { Button } from "@chakra-ui/react";
import { ICON_SIZE } from "../MenuBar";

interface MenuSpeedButtonProps {
  image: ImageProps["src"];
  onClick: (value: boolean) => void;
  title: string;
}

const MenuSpeedButton = ({ image, title, onClick }: MenuSpeedButtonProps) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  return (
    <Button
      leftIcon={<Image src={image} alt={title} width={ICON_SIZE} height={ICON_SIZE} />}
      title={title}
      onClick={handleClick}
      variant="ghost"
      size="sm"
    >
      {"1.00"}
      {title}
    </Button>
  );
};

export default MenuSpeedButton;
