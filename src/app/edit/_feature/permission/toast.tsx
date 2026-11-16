"use client";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useSession } from "@/auth/client";
import { toast } from "@/ui/toast";
import { useCreatorId } from "../provider";
import { hasMapUploadPermission } from "./has-permission";

const NOT_EDIT_PERMISSION_TOAST_ID = "not-edit-permission-toast";

export const PermissionToast = () => {
  const t = useTranslations("editor");
  const { data: session } = useSession();
  const creatorId = useCreatorId();
  const hasUploadPermission = hasMapUploadPermission(session, creatorId);

  useEffect(() => {
    if (!hasUploadPermission) {
      requestAnimationFrame(() => {
        toast.warning(t("noPermission"), {
          id: NOT_EDIT_PERMISSION_TOAST_ID,
          duration: Infinity,
        });
      });
    }

    return () => {
      toast.dismiss(NOT_EDIT_PERMISSION_TOAST_ID);
    };
  }, [hasUploadPermission, t]);

  return null;
};
