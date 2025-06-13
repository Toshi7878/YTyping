import { Button } from "@/components/ui/button";
import React from "react";

interface EditorButtonProps {
  isDisabled: boolean;
  isLoading: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  colorScheme: string;
  children: React.ReactNode;
}

const EditorButton = (props: EditorButtonProps) => {
  const getColorClasses = (colorScheme: string) => {
    const colorMap: { [key: string]: string } = {
      green: "hover:bg-green-500/50 border-green-500",
      yellow: "hover:bg-yellow-500/50 border-yellow-500",
      red: "hover:bg-red-500/50 border-red-500",
      blue: "hover:bg-blue-500/50 border-blue-500",
    };
    return colorMap[colorScheme] || "hover:bg-gray-500/50 border-gray-500";
  };

  return (
    <Button
      disabled={props.isDisabled || props.isLoading}
      variant="outline"
      size="sm"
      className={`h-[35px] w-[50%] lg:w-[60%] xl:w-[70%] ${getColorClasses(props.colorScheme)}`}
      onClick={props.onClick}
    >
      {props.isLoading ? (
        <span className="loading loading-spinner loading-xs" />
      ) : (
        props.children
      )}
    </Button>
  );
};

export default EditorButton;
