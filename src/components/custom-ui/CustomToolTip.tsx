import { ThemeColors } from "@/types";
import { Box, Tooltip, TooltipProps, useTheme } from "@chakra-ui/react";
import { ReactNode } from "react";

interface CustomToolTipProps extends TooltipProps {
  children: ReactNode;
}
const CustomToolTip = ({ label, children, ...rest }: CustomToolTipProps) => {
  const theme: ThemeColors = useTheme();

  return (
    <Tooltip
      bg={theme.colors.background.body}
      color={theme.colors.text.body}
      borderWidth="1px"
      borderStyle="solid"
      borderColor={theme.colors.border.card}
      css={{
        "--popper-arrow-bg": theme.colors.background.body,
        "--popper-arrow-shadow-color": theme.colors.border.card,
      }}
      hasArrow
      label={<Box whiteSpace="nowrap">{label}</Box>}
      minWidth="fit-content"
      {...rest}
    >
      {children}
    </Tooltip>
  );
};

export default CustomToolTip;
