"use client";

import { useReadMap } from "@/app/edit/_lib/atoms/mapReducerAtom";
import { useCanUploadState, useSetCanUpload } from "@/app/edit/_lib/atoms/stateAtoms";
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
          // const mapInfo = readMapInfo();
          // const tags = readTags();
          const mapData = readMap();

          // backupNewMap({
          //   videoId: newVideoId,
          //   title: mapInfo.title,
          //   artistName: mapInfo.artist,
          //   musicSource: mapInfo.source,
          //   creatorComment: mapInfo.comment,
          //   tags,
          //   previewTime: mapInfo.previewTime,
          //   mapData,
          // });
        }
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return <div>UploadButton</div>;
};

export default UploadButton;
