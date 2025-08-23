import { Button } from "@/components/ui/button";
import Image, { StaticImageData } from "next/image";
import { ICON_SIZE } from "../../../_lib/const";

interface MenuSpeedButtonProps {
  image: StaticImageData;
  title: string;
  onClick?: () => void;
}

const MenuSpeedButton = ({
  image,
  title,
  onClick,
  ...props
}: MenuSpeedButtonProps & React.ComponentProps<typeof Button>) => {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} title={title} {...props}>
      <Image src={image} alt={title} width={ICON_SIZE} height={ICON_SIZE} />
      {title}
    </Button>
  );
};

export default MenuSpeedButton;
