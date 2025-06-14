import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { Dispatch } from "react";
import { IoMdSettings } from "react-icons/io";

interface SettingIconProps {
  setIsCardVisible: Dispatch<(prev: boolean) => boolean>;
}

const SettingIcon = ({ setIsCardVisible }: SettingIconProps) => {
  return (
    <CustomToolTip label="設定" placement="top" left={1} top={1}>
      <div
        className="h-[60px] flex items-center cursor-pointer pl-3 pr-1 hover:opacity-80"
        id="option_icon"
        onClick={() => setIsCardVisible((prev) => !prev)}
      >
        <IoMdSettings className="w-[72px] h-[72px] md:w-9 md:h-9" />
      </div>
    </CustomToolTip>
  );
};

export default SettingIcon;
