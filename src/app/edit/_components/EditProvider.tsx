"use client";
import { db } from "@/lib/db";
import { useSetPreviewVideoState } from "@/lib/global-atoms/globalAtoms";
import { RouterOutPuts } from "@/server/api/trpc";
import { clientApi } from "@/trpc/client-api";
import { IndexDBOption } from "@/types";
import { Provider as JotaiProvider } from "jotai";
import { RESET, useHydrateAtoms } from "jotai/utils";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { Provider as ReduxProvider } from "react-redux";
import {
  editCreatorCommentAtom,
  editCreatorIdAtom,
  editGeminiTagsAtom,
  editMapArtistNameAtom,
  editMapTitleAtom,
  editMusicSourceAtom,
  editPreviewTimeInputAtom,
  editTagsAtom,
  editVideoIdAtom,
  getEditAtomStore,
} from "../edit-atom/editAtom";
import { RefsProvider } from "../edit-contexts/refsProvider";
import editStore from "../redux/store";
import { EditorNewMapBackUpInfoData } from "../ts/type";

interface EditProviderProps {
  mapInfo?: RouterOutPuts["map"]["getMapInfo"];
  children: React.ReactNode;
}

const EditProvider = ({ mapInfo, children }: EditProviderProps) => {
  const editAtomStore = getEditAtomStore();
  const searchParams = useSearchParams();
  const newVideoId = searchParams.get("new") || "";
  const isBackUp = searchParams.get("backup") === "true";
  const utils = clientApi.useUtils();
  const setPreviewVideoState = useSetPreviewVideoState();

  useEffect(() => {
    setPreviewVideoState(RESET);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const videoId = mapInfo ? mapInfo.video_id : newVideoId;
  const geminiQueryData = utils.gemini.generateMapInfo.getData({ videoId });
  const hydrationState: any[] = [[editGeminiTagsAtom, geminiQueryData?.otherTags || []]];

  if (mapInfo) {
    hydrationState.push([editMapTitleAtom, mapInfo.title]);
    hydrationState.push([editMapArtistNameAtom, mapInfo.artist_name]);
    hydrationState.push([editVideoIdAtom, mapInfo.video_id]);
    hydrationState.push([editCreatorIdAtom, mapInfo.creator_id]);
    hydrationState.push([editCreatorCommentAtom, mapInfo.creator_comment]);
    hydrationState.push([editMusicSourceAtom, mapInfo.music_source!]);
    hydrationState.push([editPreviewTimeInputAtom, mapInfo.preview_time]);
    hydrationState.push([
      editTagsAtom,
      {
        type: "set",
        payload: mapInfo.tags?.map((tag) => ({ id: tag, text: tag, className: "" })) || [],
      },
    ]);
  } else {
    hydrationState.push([editCreatorIdAtom, null]);
    hydrationState.push([editVideoIdAtom, newVideoId]);

    if (isBackUp) {
      db.editorNewCreateBak
        .get({ optionName: "backupMapInfo" })
        .then((data: IndexDBOption | undefined) => {
          if (data) {
            const backupMap = data.value as EditorNewMapBackUpInfoData;

            hydrationState.push([editMapTitleAtom, backupMap.title]);
            hydrationState.push([editMapArtistNameAtom, backupMap.artistName]);
            hydrationState.push([editMusicSourceAtom, backupMap.musicSource || ""]);
            hydrationState.push([editCreatorCommentAtom, backupMap.creatorComment]);
            hydrationState.push([editPreviewTimeInputAtom, backupMap.previewTime]);
            hydrationState.push([
              editTagsAtom,
              {
                type: "set",
                payload: backupMap.tags?.map((tag) => ({ id: tag, text: tag, className: "" })) || [],
              },
            ]);
          }
        });
    } else {
      //完全新規作成時
      hydrationState.push([editMapTitleAtom, geminiQueryData?.musicTitle || ""]);
      hydrationState.push([editMapArtistNameAtom, geminiQueryData?.artistName || ""]);
      hydrationState.push([editMusicSourceAtom, geminiQueryData?.musicSource || ""]);
      hydrationState.push([editCreatorCommentAtom, ""]);
      hydrationState.push([editPreviewTimeInputAtom, ""]);
      hydrationState.push([
        editTagsAtom,
        {
          type: "reset",
        },
      ]);
    }
  }

  useHydrateAtoms(hydrationState, { dangerouslyForceHydrate: true, store: editAtomStore });
  return (
    <RefsProvider>
      <ReduxProvider store={editStore}>
        <JotaiProvider store={editAtomStore}>{children}</JotaiProvider>
      </ReduxProvider>
    </RefsProvider>
  );
};

export default EditProvider;
