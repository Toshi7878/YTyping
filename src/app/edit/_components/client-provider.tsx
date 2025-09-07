"use client";
import { useSetPreviewVideo } from "@/lib/globalAtoms";
import { Provider as JotaiProvider } from "jotai";
import { RESET } from "jotai/utils";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { usePathChangeAtomReset } from "../_lib/atoms/reset";
import { getEditAtomStore } from "../_lib/atoms/store";
import { NOT_EDIT_PERMISSION_TOAST_ID } from "../_lib/const";
import useHasMapUploadPermission from "../_lib/hooks/useHasMapUploadPermission";
import { useTimerRegistration } from "../_lib/hooks/useTimer";

interface EditProviderProps {
  children: React.ReactNode;
}

const EditProvider = ({ children }: EditProviderProps) => {
  const store = getEditAtomStore();
  const setPreviewVideoState = useSetPreviewVideo();
  const hasUploadPermission = useHasMapUploadPermission();
  const { addTimer, removeTimer } = useTimerRegistration();
  const pathChangeReset = usePathChangeAtomReset();
  const pathname = usePathname();

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
  }, [pathname]);

  return <JotaiProvider store={store}>{children}</JotaiProvider>;
};

export default EditProvider;
