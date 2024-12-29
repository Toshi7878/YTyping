import { ThemeColors } from "@/types";
import { Button, useTheme } from "@chakra-ui/react";
import React from "react";

interface EditorButtonProps {
  isDisabled: boolean;
  isLoading: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  colorScheme: string;
  children: React.ReactNode;
}

const EditorButton = (props: EditorButtonProps) => {
  const theme: ThemeColors = useTheme();
  return (
    <Button
      isDisabled={props.isDisabled}
      isLoading={props.isLoading}
      variant="outline"
      size="sm"
      height="35px"
      className="w-[50%] lg:w-[60%] xl:w-[70%]"
      color={theme.colors.text.body}
      bg={theme.colors.background.body}
      _hover={{ bg: `${props.colorScheme}80` }}
      borderColor={props.colorScheme}
      onClick={props.onClick}
      sx={{ colorScheme: props.colorScheme }}
    >
      {props.children}
    </Button>
  );
};

export default EditorButton;
