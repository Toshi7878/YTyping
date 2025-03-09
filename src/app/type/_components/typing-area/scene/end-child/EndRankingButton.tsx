"use client";

import { useSetTabIndexAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import { useCustomToast } from "@/lib/global-hooks/useCustomToast";
import { clientApi } from "@/trpc/client-api";
import { UploadResult } from "@/types";
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
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import AlertDialogButton from "./child/AlertDialogButton";
import EndMainButton from "./child/EndMainButton";

interface UploadButtonProps {
  isScoreUpdated: boolean;
  formAction: () => void;
  state: UploadResult;
}

const EndUploadButton = ({ isScoreUpdated, formAction, state }: UploadButtonProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const setTabIndex = useSetTabIndexAtom();
  const utils = clientApi.useUtils();
  const toast = useCustomToast();

  useEffect(() => {
    if (state.status === 200) {
      setIsDisabled(true);
      utils.ranking.invalidate();
      onClose();
    } else {
      setIsDisabled(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  const handleClick = () => {
    if (!isScoreUpdated) {
      onOpen();
    }
  };

  useEffect(() => {
    if (state.status !== 0) {
      const title = state.title;
      const message = state.message;
      const isSuccess = state.status === 200 ? true : false;

      if (isSuccess) {
        setTabIndex(1);
        toast({ type: "success", title, message });
      } else {
        toast({ type: "error", title, message });
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <>
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              スコア未更新
            </AlertDialogHeader>
            <AlertDialogBody>
              ランキング登録済みのスコアから下がりますが、ランキングに登録しますか？
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                キャンセル
              </Button>
              <Box as="form" action={formAction}>
                <AlertDialogButton />
              </Box>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
      <Box as="form" action={formAction}>
        <EndMainButton
          text={isDisabled ? "ランキング登録完了" : "ランキング登録"}
          isDisabled={isDisabled}
          type={isScoreUpdated ? "submit" : "button"}
          onClick={handleClick}
        />
      </Box>
    </>
  );
};

export default EndUploadButton;
