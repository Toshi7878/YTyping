"use client";

import { useSetTabIndex } from "@/app/(typing)/type/atoms/stateAtoms";
import { useResultData } from "@/app/(typing)/type/hooks/end/useResultData";
import { useTRPC } from "@/trpc/trpc";
import { useCustomToast } from "@/util/global-hooks/useCustomToast";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useRef } from "react";
import AlertDialogButton from "./child/AlertDialogButton";
import EndMainButton from "./child/EndMainButton";

interface UploadButtonProps {
  isScoreUpdated: boolean;
  isSendResultBtnDisabled: boolean;
  setIsSendResultBtnDisabled: (isDisabled: boolean) => void;
}

const EndUploadButton = ({
  isScoreUpdated,
  isSendResultBtnDisabled,
  setIsSendResultBtnDisabled,
}: UploadButtonProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);
  const { id: mapId } = useParams();
  const setTabIndex = useSetTabIndex();
  const toast = useCustomToast();

  const resultData = useResultData();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const sendResult = useMutation(
    trpc.result.sendResult.mutationOptions({
      onSuccess: () => {
        setIsSendResultBtnDisabled(true);
        queryClient.invalidateQueries(trpc.ranking.getMapRanking.queryFilter({ mapId: Number(mapId) }));
        onClose();
        setTabIndex(1);
        toast({ type: "success", title: "ランキング登録が完了しました" });
      },
      onError: () => {
        setIsSendResultBtnDisabled(false);
      },
    }),
  );

  const handleClick = async () => {
    if (!isScoreUpdated) {
      onOpen();
    } else {
      sendResult.mutate(resultData());
    }
  };

  return (
    <>
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef as any} onClose={onClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              スコア未更新
            </AlertDialogHeader>
            <AlertDialogBody>ランキング登録済みのスコアから下がりますが、ランキングに登録しますか？</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                キャンセル
              </Button>
              <AlertDialogButton onClick={() => sendResult.mutate(resultData())} isLoading={sendResult.isPending} />
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
      <EndMainButton
        isDisabled={isSendResultBtnDisabled}
        onClick={handleClick}
        type={isScoreUpdated ? "submit" : "button"}
        isLoading={sendResult.isPending}
      >
        {isSendResultBtnDisabled ? "ランキング登録完了" : "ランキング登録"}
      </EndMainButton>
    </>
  );
};

export default EndUploadButton;
