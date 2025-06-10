import { ThemeColors } from "@/types";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/use-theme";
import { ReactNode } from "react";

interface CustomToolTipProps {
  children: ReactNode;
  label?: ReactNode;
  placement?: "top" | "right" | "bottom" | "left";
  [key: string]: any;
}

const CustomToolTip = ({ label, children, placement = "top", ...rest }: CustomToolTipProps) => {
  const theme: ThemeColors = useTheme();

  if (!label) {
    return <>{children}</>;
  }

  return (
    <TooltipWrapper
      label={label}
      side={placement}
      className="whitespace-nowrap"
      style={{
        backgroundColor: theme.colors.background.body,
        color: theme.colors.text.body,
        borderColor: theme.colors.border.card
      }}
      {...rest}
    >
      {children}
    </TooltipWrapper>
  );
};

export default CustomToolTip;
