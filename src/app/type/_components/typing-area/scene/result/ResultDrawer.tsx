"use client";
import { useSceneGroupState, useSceneState } from "@/app/type/atoms/stateAtoms";
import { ThemeColors } from "@/types";
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  UseDisclosureReturn,
  useTheme,
} from "@chakra-ui/react";
import { useMemo } from "react";
import ResultLineList from "./child/ResultLineList";

interface ResultDrawerProps {
  drawerClosure: UseDisclosureReturn;
}

function ResultDrawer({ drawerClosure }: ResultDrawerProps) {
  const { isOpen, onClose } = drawerClosure;
  const theme: ThemeColors = useTheme();
  const scene = useSceneState();
  const sceneGroup = useSceneGroupState();

  const memoizedResultLineList = useMemo(() => {
    if (sceneGroup === "End" || scene === "practice" || scene === "replay") {
      return <ResultLineList />;
    }
  }, [scene, sceneGroup]);

  return (
    <Drawer
      isOpen={sceneGroup === "End" ? isOpen : scene === "practice" || scene === "replay" ? true : false}
      placement="right"
      trapFocus={false}
      blockScrollOnMount={false}
      onClose={onClose}
      size={scene === "practice" ? "xs" : "sm"}
      variant="alwaysOpen"
    >
      <DrawerOverlay backgroundColor="transparent" onClick={onClose} display={isOpen ? "block" : "none"} />
      <DrawerContent
        height="100vh"
        display={isOpen ? "block" : "none"}
        backgroundColor={`${theme.colors.background.body}dd`}
      >
        <DrawerHeader fontSize="md" py={2} color={theme.colors.text.body}>
          タイピングリザルト
        </DrawerHeader>
        <DrawerCloseButton tabIndex={-1} autoFocus={false} mr={5} color={theme.colors.text.body} />
        <DrawerBody overflowY="auto" position="relative" height="100%" pb={14}>
          {memoizedResultLineList}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

export default ResultDrawer;
