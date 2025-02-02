import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { ThemeColors } from "@/types";
import { Box, useBreakpointValue, useTheme } from "@chakra-ui/react";
import { Dispatch } from "react";
import { IoMdSettings } from "react-icons/io";

interface SettingIconProps {
  setIsCardVisible: Dispatch<(prev: boolean) => boolean>;
}

const SettingIcon = ({ setIsCardVisible }: SettingIconProps) => {
  const theme: ThemeColors = useTheme();
  const iconSize = useBreakpointValue({ base: 72, md: 36 });

  return (
    <CustomToolTip label="設定" placement="top" left={1} top={1}>
      <Box
        height="60px"
        display="flex"
        _hover={{ color: theme.colors.text.body }}
        alignItems="center"
        cursor="pointer"
        id="option_icon"
        pl={3}
        pr={1}
        onClick={() => setIsCardVisible((prev) => !prev)}
      >
        <IoMdSettings size={iconSize} />
      </Box>
    </CustomToolTip>
  );
};

export default SettingIcon;
