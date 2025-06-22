import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

interface AlertDialogButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

const AlertDialogButton = ({ className, isLoading, ...props }: AlertDialogButtonProps) => {
  return (
    <Button 
      variant="destructive" 
      type="submit" 
      className={cn("ml-3", className)}
      loading={isLoading}
      {...props}
    >
      ランキングに登録
    </Button>
  );
};

export default AlertDialogButton;
