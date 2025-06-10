import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReactNode } from "react";

interface CustomToolTipProps {
  children: ReactNode;
  label: ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  isDisabled?: boolean;
  isOpen?: boolean;
}

const CustomToolTip = ({ label, children, placement = "top", isDisabled, isOpen }: CustomToolTipProps) => {
  if (isDisabled) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip open={isOpen}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={placement} className="whitespace-nowrap">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CustomToolTip;
