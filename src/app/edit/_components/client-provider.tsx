"use client";
import { Provider as JotaiProvider } from "jotai";
import { useParams } from "next/navigation";
import type React from "react";
import { useEffect } from "react";
import { toast } from "sonner";
import { resetPreviewVideo } from "@/lib/atoms/global-atoms";
import { usePathChangeAtomReset } from "../_lib/atoms/reset";
import { getEditAtomStore } from "../_lib/atoms/store";
import { useHasMapUploadPermission } from "../_lib/map-table/use-has-map-upload-permission";
import { addTimer, removeTimer } from "../_lib/youtube-player/timer";

const NOT_EDIT_PERMISSION_TOAST_ID = "not-edit-permission-toast";

interface EditProviderProps {
  children: React.ReactNode;
}

export const EditProvider = ({ children }: EditProviderProps) => {
  const store = getEditAtomStore();
  const hasUploadPermission = useHasMapUploadPermission();
  const pathChangeReset = usePathChangeAtomReset();
  const { id: mapId } = useParams();

  useEffect(() => {
    resetPreviewVideo();
  }, []);

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
