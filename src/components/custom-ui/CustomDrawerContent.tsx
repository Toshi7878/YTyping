import { ThemeColors } from "@/types";
import { DrawerContent, DrawerContentProps, DrawerOverlay, useTheme } from "@chakra-ui/react";
import React from "react";

interface CustomDrawerContentProps extends DrawerContentProps {
  width?: { base: string; lg: string };
  children: React.ReactNode;
}

const CustomDrawerContent = ({ children, width, ...rest }: CustomDrawerContentProps) => {
  const theme: ThemeColors = useTheme();
  return (
    <>
      <DrawerOverlay />
      <DrawerContent
        minW={width}
        bg={theme.colors.background.body}
        color={theme.colors.text.body}
        {...rest}
      >
        {children}
      </DrawerContent>
    </>
  );
};

export default CustomDrawerContent;
