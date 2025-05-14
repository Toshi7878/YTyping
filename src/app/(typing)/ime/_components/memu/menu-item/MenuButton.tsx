import { Image, ImageProps } from "@chakra-ui/next-js";
import { Button } from "@chakra-ui/react";
import { ICON_SIZE } from "../MenuBar";

interface MenuButtonProps {
  image: ImageProps["src"];
  onClick: (value: boolean) => void;
  title: string;
}

const MenuButton = ({ image, title, onClick }: MenuButtonProps) => {
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
      {title}
    </Button>
  );
};

export default MenuButton;
