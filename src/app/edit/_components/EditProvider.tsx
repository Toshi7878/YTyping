"use client";
import { useSetPreviewVideo } from "@/lib/globalAtoms";
import { Provider as JotaiProvider } from "jotai";
import { RESET } from "jotai/utils";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { usePathChangeAtomReset } from "../_lib/atoms/reset";
import { useCanUploadState } from "../_lib/atoms/stateAtoms";
import { getEditAtomStore } from "../_lib/atoms/store";
import { NOT_EDIT_PERMISSION_TOAST_ID } from "../_lib/const";
import useHasMapUploadPermission from "../_lib/hooks/useHasMapUploadPermission";
import { useWindowKeydownEvent } from "../_lib/hooks/useKeyDown";
import { useTimerRegistration } from "../_lib/hooks/useTimer";

interface EditProviderProps {
  children: React.ReactNode;
}

const EditProvider = ({ children }: EditProviderProps) => {
  const store = getEditAtomStore();
  const setPreviewVideoState = useSetPreviewVideo();
  const hasUploadPermission = useHasMapUploadPermission();
  const canUpload = useCanUploadState();
  const { addTimer, removeTimer } = useTimerRegistration();
  const pathChangeReset = usePathChangeAtomReset();
  const windowKeydownEvent = useWindowKeydownEvent();
  const pathname = usePathname();

  useEffect(() => {
    window.addEventListener("keydown", windowKeydownEvent);
    return () => {
      window.removeEventListener("keydown", windowKeydownEvent);
    };
  }, [windowKeydownEvent]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (canUpload) {
        event.preventDefault();
        return "このページを離れると、行った変更が保存されない可能性があります。";
      }
    };

    if (hasUploadPermission) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [canUpload, hasUploadPermission]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return <JotaiProvider store={store}>{children}</JotaiProvider>;
};

export default EditProvider;
