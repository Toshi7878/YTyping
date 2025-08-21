import { TooltipWrapper } from "@/components/ui/tooltip";
import { forwardRef } from "react";
import { IoMdSettings } from "react-icons/io";

const SettingIcon = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <TooltipWrapper label="設定">
      <div
        ref={ref}
        className="flex h-[60px] cursor-pointer items-center pr-1 pl-3 hover:opacity-80"
        id="option_icon"
        {...props}
      >
        <IoMdSettings className="h-[72px] w-[72px] md:h-9 md:w-9" />
      </div>
    </TooltipWrapper>
  );
});

SettingIcon.displayName = "SettingIcon";

export default SettingIcon;
