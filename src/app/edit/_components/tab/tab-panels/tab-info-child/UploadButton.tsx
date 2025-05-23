"use client";
import { Button, useTheme } from "@chakra-ui/react";

import { useCanUploadState, useSetCanUpload } from "@/app/edit/atoms/stateAtoms";
import { useUpdateNewMapBackUp } from "@/app/edit/hooks/utils/useUpdateNewMapBackUp";
import { useInitializeEditorCreateBak } from "@/lib/db";
import { clientApi } from "@/trpc/client-api";
import { ThemeColors, UploadResult } from "@/types";
import { useCustomToast } from "@/util/global-hooks/useCustomToast";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useFormStatus } from "react-dom";

interface UploadButtonProps {
  state: UploadResult;
}
const UploadButton = ({ state }: UploadButtonProps) => {
  const { pending } = useFormStatus();
  const theme: ThemeColors = useTheme();
  const canUpload = useCanUploadState();
  const setCanUpload = useSetCanUpload();
  const toast = useCustomToast();
  const initializeEditorCreateIndexedDB = useInitializeEditorCreateBak();
  const router = useRouter();
  const updateNewMapBackUp = useUpdateNewMapBackUp();
  const searchParams = useSearchParams();
  const newVideoId = searchParams.get("new") || "";
  const utils = clientApi.useUtils();

  useEffect(() => {
    if (state.status !== 0) {
      const isSuccess = state.status === 200;
      const title = state.title;
      const message = state.message;

      if (isSuccess) {
        utils.map.getMap.invalidate();
        toast({ type: "success", title, message });
        setCanUpload(false);
        if (state.id) {
          router.replace(`/edit/${state.id}`);
          initializeEditorCreateIndexedDB();
        }
      } else {
        toast({ type: "error", title, message });
        if (newVideoId) {
          updateNewMapBackUp(newVideoId);
        }
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Button
      className="cursor-pointer"
      variant="solid"
      size="lg"
      width="200px"
      border="1px"
      isLoading={pending}
      bg={theme.colors.primary.main}
      color={theme.colors.text.body}
      _hover={{
        bg: canUpload ? theme.colors.primary.light : theme.colors.primary.main,
      }}
      borderColor={theme.colors.border.card}
      opacity={canUpload ? "1" : "0.7"}
      type="submit"
      onClick={(e) => {
        if (!canUpload) {
          e.preventDefault();
        }
      }}
    >
      保存
    </Button>
  );
};

export default UploadButton;
function useUtils() {
  throw new Error("Function not implemented.");
}
