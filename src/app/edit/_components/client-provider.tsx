"use client";
import { Provider as JotaiProvider } from "jotai";
import { RESET } from "jotai/utils";
import { useParams } from "next/navigation";
import type React from "react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useSetPreviewVideo } from "@/lib/global-atoms";
import { usePathChangeAtomReset } from "../_lib/atoms/reset";
import { getEditAtomStore } from "../_lib/atoms/store";
import { NOT_EDIT_PERMISSION_TOAST_ID } from "../_lib/const";
import { useHasMapUploadPermission } from "../_lib/utils/use-has-map-upload-permission";
import { useTimerRegistration } from "../_lib/youtube-player/use-timer";

interface EditProviderProps {
  children: React.ReactNode;
}

export const EditProvider = ({ children }: EditProviderProps) => {
  const store = getEditAtomStore();
  const setPreviewVideoState = useSetPreviewVideo();
  const hasUploadPermission = useHasMapUploadPermission();
  const { addTimer, removeTimer } = useTimerRegistration();
  const pathChangeReset = usePathChangeAtomReset();
  const { id: mapId } = useParams();

  useEffect(() => {
    setPreviewVideoState(RESET);
  }, [setPreviewVideoState]);

  useEffect(() => {
    if (!hasUploadPermission) {
      toast.warning("編集保存権限がないため譜面の更新はできません", {
        id: NOT_EDIT_PERMISSION_TOAST_ID,
        duration: Infinity,
      });
    } else {
      toast.dismiss(NOT_EDIT_PERMISSION_TOAST_ID);
    }
  }, [hasUploadPermission]);

  useEffect(() => {
    addTimer();
    return () => {
      removeTimer();
      pathChangeReset();
      toast.dismiss(NOT_EDIT_PERMISSION_TOAST_ID);
    };
  }, [mapId]);

  return <JotaiProvider store={store}>{children}</JotaiProvider>;
};
