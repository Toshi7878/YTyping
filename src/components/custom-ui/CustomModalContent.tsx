import { ThemeColors } from "@/types";
import { ModalContent, ModalContentProps, useTheme } from "@chakra-ui/react";
import React from "react";

interface CustomModalContentProps extends ModalContentProps {
  children: React.ReactNode;
}
const CustomModalContent = ({ children, ...rest }: CustomModalContentProps) => {
  const theme: ThemeColors = useTheme();
  return (
    <ModalContent bg={theme.colors.background.body} color={theme.colors.text.body} {...rest}>
      {children}
    </ModalContent>
  );
};

export default CustomModalContent;
