import { Button } from "@/components/ui/button";
import Image, { StaticImageData } from "next/image";
import { ICON_SIZE } from "../../../ts/const";

interface MenuButtonProps {
  image?: StaticImageData;
  title: string;
  onClick?: () => void;
}

const MenuButton = ({ image, title, onClick, ...props }: MenuButtonProps & React.ComponentProps<typeof Button>) => {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="gap-2" {...props}>
      {image && <Image src={image} alt={title} width={ICON_SIZE} height={ICON_SIZE} className="shrink-0" />}
      {title}
    </Button>
  );
};

export default MenuButton;
