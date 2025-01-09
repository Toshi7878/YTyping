import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  useTheme,
} from "@chakra-ui/react";
import { memo, useEffect, useRef, useState } from "react";

interface ResultDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

function ResultDrawer({ isOpen, onClose }: ResultDrawerProps) {
  const [drawerHeight, setDrawerHeight] = useState("100vh");
  const modalContentRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    const updateHeight = () => {
      setDrawerHeight(`${window.innerHeight}px`);
    };

    window.addEventListener("resize", updateHeight);
    updateHeight();

    return () => window.removeEventListener("resize", updateHeight);
  }, []);
  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay backgroundColor="transparent" />
      <DrawerContent height={drawerHeight} backgroundColor={`${theme.colors.background.body}dd`}>
        <DrawerHeader fontSize="md" py={2} color={theme.colors.textColor.body}>
          テーマ
        </DrawerHeader>
        <DrawerCloseButton
          tabIndex={-1}
          autoFocus={false}
          mr={5}
          color={theme.colors.textColor.body}
        />
        <DrawerBody overflowY="auto" position="relative" ref={modalContentRef}></DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

export default memo(ResultDrawer);
