import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import React from "react";

interface EditorButtonProps {
  isDisabled: boolean;
  isLoading: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  colorScheme: string;
  children: React.ReactNode;
}

const EditorButton = (props: EditorButtonProps) => {
  const getColorClasses = () => {
    // Map colorScheme to Tailwind classes
    const colorMap: Record<string, string> = {
      red: "border-red-500 hover:bg-red-500/50",
      blue: "border-blue-500 hover:bg-blue-500/50",
      green: "border-green-500 hover:bg-green-500/50",
      yellow: "border-yellow-500 hover:bg-yellow-500/50",
      purple: "border-purple-500 hover:bg-purple-500/50",
    };
    return colorMap[props.colorScheme] || "border-primary hover:bg-primary/50";
  };

  return (
    <Button
      disabled={props.isDisabled}
      variant="outline"
      size="sm"
      className={`h-[35px] w-[50%] lg:w-[60%] xl:w-[70%] ${getColorClasses()}`}
      onClick={props.onClick}
    >
      {props.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {props.children}
    </Button>
  );
};

export default EditorButton;
