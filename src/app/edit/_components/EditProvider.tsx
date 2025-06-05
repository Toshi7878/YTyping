"use client";
import { useFetchBackupData } from "@/lib/db";
import { useSetPreviewVideo } from "@/lib/global-atoms/globalAtoms";
import { RouterOutPuts } from "@/server/api/trpc";
import { useTRPC } from "@/trpc/trpc";
import { useQueryClient } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import { RESET, useHydrateAtoms } from "jotai/utils";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { useMapReducer } from "../atoms/mapReducerAtom";
import { geminiTagsAtom, mapInfoAtom, mapTagsAtom, useSetCanUpload, videoIdAtom } from "../atoms/stateAtoms";
import { getEditAtomStore } from "../atoms/store";

interface EditProviderProps {
  mapInfo?: RouterOutPuts["map"]["getMapInfo"];
  children: React.ReactNode;
}

const EditProvider = ({ mapInfo, children }: EditProviderProps) => {
  const store = getEditAtomStore();
  const setPreviewVideoState = useSetPreviewVideo();
  const loadBackupData = useLoadBackupData();

  useEffect(() => {
    setPreviewVideoState(RESET);
    loadBackupData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useSetHydrationState(mapInfo);

  return <JotaiProvider store={store}>{children}</JotaiProvider>;
};

const useSetHydrationState = (mapInfo: RouterOutPuts["map"]["getMapInfo"] | undefined) => {
  const store = getEditAtomStore();
  const searchParams = useSearchParams();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const newVideoId = searchParams.get("new") || "";

  const videoId = mapInfo ? mapInfo.video_id : newVideoId;
  const geminiQueryData = queryClient.getQueryData(trpc.gemini.generateMapInfo.queryOptions({ videoId }).queryKey);
  const hydrationState: any[] = [];

  if (geminiQueryData) {
    hydrationState.push([geminiTagsAtom, geminiQueryData.otherTags]);
  }

  if (mapInfo) {
    hydrationState.push(
      [
        mapInfoAtom,
        {
          title: mapInfo.title,
          artist: mapInfo.artist_name,
          creatorId: mapInfo.creator_id,
          creatorComment: mapInfo.creator_comment,
          source: mapInfo.music_source,
          previewTime: mapInfo.preview_time,
        },
      ],
      [videoIdAtom, videoId],
      [
        mapTagsAtom,
        {
          type: "set",
          payload: mapInfo.tags?.map((tag) => ({ id: tag, text: tag, className: "" })) || [],
        },
      ],
    );
  } else {
    hydrationState.push(
      [
        mapInfoAtom,
        {
          title: geminiQueryData?.title || "",
          artist: geminiQueryData?.artistName || "",
          creatorId: null,
          creatorComment: "",
          source: geminiQueryData?.source || "",
          previewTime: "",
        },
      ],
      [videoIdAtom, newVideoId],
      [mapTagsAtom, { type: "reset" }],
    );
  }

  useHydrateAtoms(hydrationState, { dangerouslyForceHydrate: true, store });
};

const useLoadBackupData = () => {
  const store = getEditAtomStore();
  const searchParams = useSearchParams();
  const isBackUp = searchParams.get("backup") === "true";
  const fetchBackupData = useFetchBackupData();
  const mapDispatch = useMapReducer();
  const setCanUpload = useSetCanUpload();

  return () => {
    if (isBackUp) {
      fetchBackupData().then((data) => {
        if (data) {
          const { id: _, mapData, ...backupInfo } = data;

          store.set(mapInfoAtom, {
            title: backupInfo.title,
            artist: backupInfo.artistName,
            creatorId: null,
            comment: backupInfo.creatorComment,
            source: backupInfo.musicSource,
            previewTime: backupInfo.previewTime,
          });

          store.set(videoIdAtom, backupInfo.videoId);
          store.set(mapTagsAtom, {
            type: "set",
            payload: backupInfo.tags?.map((tag) => ({ id: tag, text: tag, className: "" })) || [],
          });
          mapDispatch({ type: "replaceAll", payload: mapData });
          setCanUpload(true);
        }
      });
    }
  };
};

export default EditProvider;
