import { TooltipWrapper } from "@/components/ui/tooltip";
import { IoMdSettings } from "react-icons/io";

const SettingIcon = () => {
  return (
    <TooltipWrapper label="設定">
      <div className="cursor-pointer p-1 hover:opacity-80">
        <IoMdSettings className="md:h-9 md:w-9" />
      </div>
    </TooltipWrapper>
  );
};

export default SettingIcon;
