"use client";
import { Button, useTheme } from "@chakra-ui/react";

import { useCanUploadAtom, useSetCanUploadAtom } from "@/app/edit/edit-atom/editAtom";
import { useUpdateNewMapBackUp } from "@/app/edit/hooks/useUpdateNewMapBackUp";
import { useInitializeEditorCreateBak } from "@/lib/db";
import { useUploadToast } from "@/lib/global-hooks/useUploadToast";
import { ThemeColors, UploadResult } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useFormStatus } from "react-dom";

interface UploadButtonProps {
  state: UploadResult;
}
const UploadButton = ({ state }: UploadButtonProps) => {
  const { pending } = useFormStatus();
  const theme: ThemeColors = useTheme();
  const canUpload = useCanUploadAtom();
  const setCanUpload = useSetCanUploadAtom();
  const uploadToast = useUploadToast();
  const initializeEditorCreateIndexedDB = useInitializeEditorCreateBak();
  const router = useRouter();
  const updateNewMapBackUp = useUpdateNewMapBackUp();
  const searchParams = useSearchParams();
  const newVideoId = searchParams.get("new") || "";

  useEffect(() => {
    if (state.status !== 0) {
      uploadToast(state);

      const isSuccess = state.status === 200;

      if (isSuccess) {
        setCanUpload(false);
        if (state.id) {
          router.replace(`/edit/${state.id}`);
          initializeEditorCreateIndexedDB();
        }
      } else if (state.status === 500) {
        if (newVideoId) {
          updateNewMapBackUp(newVideoId);
        }
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (canUpload && !newVideoId) {
        event.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [canUpload, newVideoId]);

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
