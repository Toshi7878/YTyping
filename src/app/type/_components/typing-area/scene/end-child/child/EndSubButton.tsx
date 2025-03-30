import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  useDisclosure,
  useTheme,
} from "@chakra-ui/react";

import { useSceneState } from "@/app/type/atoms/stateAtoms";
import { useRetry } from "@/app/type/hooks/playing-hooks/retry";
import { PlayMode } from "@/app/type/ts/type";
import { ThemeColors } from "@/types";
import { useRef } from "react";

interface EndSubButtonProps {
  retryMode: PlayMode;
  isRetryAlert: boolean;
  retryBtnRef: React.RefObject<HTMLButtonElement>;
}

const EndSubButton = ({ isRetryAlert, retryMode, retryBtnRef }: EndSubButtonProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);
  const theme: ThemeColors = useTheme();
  const scene = useSceneState();
  const retry = useRetry();

  const handleRetry = () => {
    if (isRetryAlert) {
      onOpen();
    } else {
      retry(retryMode);
    }
  };

  const getButtonText = () => {
    if (retryMode === "practice" && scene !== "practice_end") return "練習モードへ";
    if (retryMode === "play" && scene !== "play_end") return "本番モードへ";
    if (retryMode === "practice") return "もう一度練習";
    if (retryMode === "replay") return "もう一度リプレイ";
    if (retryMode === "play") return "もう一度プレイ";
  };

  return (
    <>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        motionPreset="slideInBottom"
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              リトライ確認
            </AlertDialogHeader>

            <AlertDialogBody>
              <Box>ランキング登録が完了していませんが、リトライしますか？</Box>
              <Box>※リトライすると今回の記録は失われます</Box>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                キャンセル
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  onClose();
                  retry(retryMode);
                }}
                ml={3}
              >
                リトライ
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Button
        ref={retryBtnRef}
        size="2xl"
        px={20}
        py={6}
        fontSize="2xl"
        variant="outline"
        borderColor={theme.colors.border.card}
        color={theme.colors.text.body}
        _hover={{
          bg: theme.colors.button.sub.hover,
        }}
        onClick={handleRetry}
      >
        {getButtonText()}
      </Button>
    </>
  );
};

export default EndSubButton;
