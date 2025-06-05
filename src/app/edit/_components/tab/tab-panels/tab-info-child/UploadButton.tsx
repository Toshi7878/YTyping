"use client";
import { Button, useTheme } from "@chakra-ui/react";

import { useReadMap } from "@/app/edit/atoms/mapReducerAtom";
import { useCanUploadState, useReadMapInfo, useReadMapTags, useSetCanUpload } from "@/app/edit/atoms/stateAtoms";
import { useBackupNewMap, useDeleteBackupNewMap } from "@/lib/db";
import { useTRPC } from "@/trpc/trpc";
import { ThemeColors, UploadResult } from "@/types";
import { useCustomToast } from "@/util/global-hooks/useCustomToast";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useFormStatus } from "react-dom";

interface UploadButtonProps {
  state: UploadResult;
}
const UploadButton = ({ state }: UploadButtonProps) => {
  const { pending } = useFormStatus();
  const theme: ThemeColors = useTheme();
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
            tags: tags.map((tag) => tag.text),
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
function useUtils() {
  throw new Error("Function not implemented.");
}
