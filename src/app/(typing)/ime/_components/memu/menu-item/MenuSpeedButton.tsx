import { Button } from "@/components/ui/button";
import Image, { StaticImageData } from "next/image";
import { ICON_SIZE } from "../../../ts/const";

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
    <Button variant="ghost" size="sm" onClick={onClick} title={title} className="gap-2" {...props}>
      <Image src={image} alt={title} width={ICON_SIZE} height={ICON_SIZE} className="shrink-0" />
      {title}
    </Button>
  );
};

export default MenuSpeedButton;
