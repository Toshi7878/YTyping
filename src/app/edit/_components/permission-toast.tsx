"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useCreatorIdState } from "../_lib/atoms/hydrate";
import { hasMapUploadPermission } from "../_lib/map-table/has-map-upload-permission";

const NOT_EDIT_PERMISSION_TOAST_ID = "not-edit-permission-toast";

export const PermissionToast = () => {
  const { data: session } = useSession();
  const creatorId = useCreatorIdState();
  const hasUploadPermission = hasMapUploadPermission(session, creatorId);

  useEffect(() => {
    if (!hasUploadPermission) {
      requestAnimationFrame(() => {
        toast.warning("編集保存権限がないため譜面の更新はできません", {
          id: NOT_EDIT_PERMISSION_TOAST_ID,
          duration: Infinity,
        });
      });
    }

    return () => {
      toast.dismiss(NOT_EDIT_PERMISSION_TOAST_ID);
    };
  }, [hasUploadPermission]);

  return null;
};
