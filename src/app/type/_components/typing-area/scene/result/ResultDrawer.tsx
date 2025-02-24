"use client";
import { useSceneAtom } from "@/app/type/type-atoms/gameRenderAtoms";
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
  const scene = useSceneAtom();

  const memoizedResultLineList = useMemo(() => {
    if (scene === "end" || scene === "practice" || scene === "replay") {
      return <ResultLineList />;
    }
  }, [scene]);

  return (
    <Drawer
      isOpen={scene === "end" ? isOpen : scene === "practice" || scene === "replay" ? true : false}
      placement="right"
      trapFocus={false}
      blockScrollOnMount={false}
      onClose={onClose}
      size={{ base: "xs", xl: "sm" }}
      variant="alwaysOpen"
    >
      <DrawerOverlay
        backgroundColor="transparent"
        onClick={onClose}
        display={isOpen ? "block" : "none"}
      />
      <DrawerContent
        height="100vh"
        display={isOpen ? "block" : "none"}
        backgroundColor={`${theme.colors.background.body}dd`}
      >
        <DrawerHeader fontSize="md" py={2} color={theme.colors.text.body}>
          タイピングリザルト
        </DrawerHeader>
        <DrawerCloseButton tabIndex={-1} autoFocus={false} mr={5} color={theme.colors.text.body} />
        <DrawerBody overflowY="auto" position="relative" height="100%">
          {memoizedResultLineList}
        </DrawerBody>
      </DrawerContent>
      <style>
        {`
        .result-line-select-outline {
          outline:3px solid ${theme.colors.primary.main};
        }

        .result-line-hover:hover {
          outline:1px solid ${theme.colors.text.body};
        }
        `}
      </style>
    </Drawer>
  );
}

export default ResultDrawer;
