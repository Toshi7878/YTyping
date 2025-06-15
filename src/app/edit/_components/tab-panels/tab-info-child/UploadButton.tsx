"use client";
import { Button } from "@/components/ui/button";

import { useReadMap } from "@/app/edit/_lib/atoms/mapReducerAtom";
import { useCanUploadState, useReadMapInfo, useReadMapTags, useSetCanUpload } from "@/app/edit/_lib/atoms/stateAtoms";
import { useBackupNewMap, useDeleteBackupNewMap } from "@/lib/db";
import { useTRPC } from "@/trpc/trpc";
import { UploadResult } from "@/types";
import { useCustomToast } from "@/utils/global-hooks/useCustomToast";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useFormStatus } from "react-dom";

interface UploadButtonProps {
  state: UploadResult;
}
const UploadButton = ({ state }: UploadButtonProps) => {
  const { pending } = useFormStatus();
  const canUpload = useCanUploadState();
  const setCanUpload = useSetCanUpload();
  const toast = useCustomToast();
  const deleteBackupNewMap = useDeleteBackupNewMap();
  const router = useRouter();
  const searchParams = useSearchParams();
  const newVideoId = searchParams.get("new") || "";
  const backupNewMap = useBackupNewMap();
  const readMapInfo = useReadMapInfo();
  const readTags = useReadMapTags();
  const readMap = useReadMap();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { id: mapId } = useParams() as { id: string };

  useEffect(() => {
    if (state.status !== 0) {
      const isSuccess = state.status === 200;
      const title = state.title;
      const message = state.message;

      if (isSuccess) {
        queryClient.invalidateQueries(trpc.map.getMap.queryFilter({ mapId }));
        toast({ type: "success", title, message });
        setCanUpload(false);
        if (state.id) {
          router.replace(`/edit/${state.id}`);
          deleteBackupNewMap();
        }
      } else {
        toast({ type: "error", title, message });

        if (newVideoId) {
          const mapInfo = readMapInfo();
          const tags = readTags();
          const mapData = readMap();

          backupNewMap({
            videoId: newVideoId,
            title: mapInfo.title,
            artistName: mapInfo.artist,
            musicSource: mapInfo.source,
            creatorComment: mapInfo.comment,
            tags,
            previewTime: mapInfo.previewTime,
            mapData,
          });
        }
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Button
      className={`w-[200px] cursor-pointer border ${canUpload ? "opacity-100 hover:opacity-90" : "opacity-70"}`}
      variant="default"
      size="lg"
      disabled={pending}
      type="submit"
      onClick={(e) => {
        if (!canUpload) {
          e.preventDefault();
        }
      }}
    >
      {pending ? "保存中..." : "保存"}
    </Button>
  );
};

export default UploadButton;
