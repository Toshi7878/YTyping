import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { IoMdSettings } from "react-icons/io";

const SettingIcon = () => {
  return (
    <TooltipWrapper label="設定" delayDuration={500} className="relative top-2">
      <Button variant="unstyled" size="icon" className="hover:text-foreground/90 relative bottom-[0.5px]">
        <IoMdSettings className="size-9" />
      </Button>
    </TooltipWrapper>
  );
};

export default SettingIcon;
