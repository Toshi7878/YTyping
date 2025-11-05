"use client";
import { Provider } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import type React from "react";
import { useEffect } from "react";
import { toast } from "sonner";
import { resetPreviewVideo } from "@/lib/atoms/global-atoms";
import { pathChangeAtomReset } from "../_lib/atoms/reset";
import { creatorIdAtom, mapIdAtom, useCreatorIdState, videoIdAtom } from "../_lib/atoms/state";
import { getEditAtomStore } from "../_lib/atoms/store";
import { hasMapUploadPermission } from "../_lib/map-table/has-map-upload-permission";

const NOT_EDIT_PERMISSION_TOAST_ID = "not-edit-permission-toast";

interface EditProviderProps {
  children: React.ReactNode;
}

interface JotaiProviderProps {
  mapId?: string;
  videoId: string;
  creatorId?: number;
  children: React.ReactNode;
}
export const JotaiProvider = ({ mapId, videoId, creatorId, children }: JotaiProviderProps) => {
  const store = getEditAtomStore();
  useHydrateAtoms(
    [
      ...(mapId ? [[mapIdAtom, Number(mapId)] as const] : []),
      ...(creatorId ? [[creatorIdAtom, creatorId] as const] : []),
      [videoIdAtom, videoId],
    ],
    { store },
  );

  return <Provider store={store}>{children}</Provider>;
};

export const EditProvider = ({ children }: EditProviderProps) => {
  const { data: session } = useSession();
  const creatorId = useCreatorIdState();
  const hasUploadPermission = hasMapUploadPermission(session, creatorId);
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
    return () => {
      pathChangeAtomReset();
    };
  }, [mapId]);

  return <>{children}</>;
};
