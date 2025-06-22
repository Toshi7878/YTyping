import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

interface EndMainButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const EndMainButton = ({ children, className, ...props }: EndMainButtonProps) => {
  return (
    <Button 
      variant="primary-light" 
      size="lg"
      className={cn("text-xl font-bold", className)}
      {...props}
    >
      {children}
    </Button>
  );
};

export default EndMainButton;
