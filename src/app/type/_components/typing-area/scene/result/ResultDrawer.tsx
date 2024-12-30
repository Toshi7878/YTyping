"use client";
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
import ResultLineList from "./child/ResultLineList";

interface ResultDrawerProps {
  drawerClosure: UseDisclosureReturn;
}

function ResultDrawer({ drawerClosure }: ResultDrawerProps) {
  const { isOpen, onClose } = drawerClosure;
  // const [drawerHeight, setDrawerHeight] = useState("100vh");
  const theme: ThemeColors = useTheme();

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay backgroundColor="transparent" />
      <DrawerContent height="100vh" backgroundColor={`${theme.colors.background.body}dd`}>
        <DrawerHeader fontSize="md" py={2} color={theme.colors.text.body}>
          タイピングリザルト
        </DrawerHeader>
        <DrawerCloseButton tabIndex={-1} autoFocus={false} mr={5} color={theme.colors.text.body} />
        <DrawerBody overflowY="auto" position="relative">
          <ResultLineList onClose={onClose} />
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
