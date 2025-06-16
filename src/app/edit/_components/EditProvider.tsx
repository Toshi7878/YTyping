"use client";
import { useFetchBackupData } from "@/lib/db";
import { useSetPreviewVideo } from "@/lib/global-atoms/globalAtoms";
import { RouterOutPuts } from "@/server/api/trpc";
import { Provider as JotaiProvider } from "jotai";
import { RESET, useHydrateAtoms } from "jotai/utils";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { useMapReducer } from "../_lib/atoms/mapReducerAtom";
import { useSetCanUpload } from "../_lib/atoms/stateAtoms";
import { getEditAtomStore } from "../_lib/atoms/store";

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

  const hydrationState: any[] = [];

  if (mapInfo) {
    hydrationState
      .push
      // [
      //   mapInfoAtom,
      //   {
      //     title: mapInfo.title,
      //     artist: mapInfo.artist_name,
      //     creatorId: mapInfo.creator_id,
      //     creatorComment: mapInfo.creator_comment,
      //     source: mapInfo.music_source,
      //     previewTime: mapInfo.preview_time,
      //   },
      // ],
      // [videoIdAtom, videoId],
      ();
  } else {
    hydrationState
      .push
      // [
      //   mapInfoAtom,
      //   {
      //     title: geminiQueryData?.title || "",
      //     artist: geminiQueryData?.artistName || "",
      //     creatorId: null,
      //     creatorComment: "",
      //     source: geminiQueryData?.source || "",
      //     previewTime: "",
      //   },
      // ],
      // [videoIdAtom, newVideoId],
      ();
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

          // store.set(mapInfoAtom, {
          //   title: backupInfo.title,
          //   artist: backupInfo.artistName,
          //   creatorId: null,
          //   comment: backupInfo.creatorComment,
          //   source: backupInfo.musicSource,
          //   previewTime: backupInfo.previewTime,
          // });

          // store.set(videoIdAtom, backupInfo.videoId);
          // store.set(mapTagsAtom, {
          //   type: "set",
          //   payload: backupInfo.tags,
          // });
          mapDispatch({ type: "replaceAll", payload: mapData });
          setCanUpload(true);
        }
      });
    }
  };
};

export default EditProvider;
