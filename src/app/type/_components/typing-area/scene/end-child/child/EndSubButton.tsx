import {
  Button,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Box,
  useTheme,
} from "@chakra-ui/react";

import { useRefs } from "@/app/type/type-contexts/refsProvider";
import { useRef } from "react";
import { PlayMode } from "@/app/type/ts/type";
import { ThemeColors } from "@/types";
import { useProceedRetry } from "@/app/type/hooks/playing-hooks/useRetry";

interface EndSubButtonProps {
  retryMode: PlayMode;
  isRetryAlert: boolean;
}

const EndSubButton = ({ isRetryAlert, retryMode }: EndSubButtonProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);
  const theme: ThemeColors = useTheme();

  const { gameStateRef } = useRefs();
  const proceedRetry = useProceedRetry();

  const retry = (playMode: PlayMode) => {
    if (isRetryAlert) {
      onOpen();
    } else {
      proceedRetry(playMode);
    }
  };

  const getButtonText = () => {
    if (retryMode === "practice") return "練習モード";
    if (gameStateRef.current?.replay.userName) return "もう一度リプレイ";
    return "もう一度プレイ";
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
                  proceedRetry(retryMode);
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
        onClick={() => {
          retry(retryMode);
        }}
      >
        {getButtonText()}
      </Button>
    </>
  );
};

export default EndSubButton;
