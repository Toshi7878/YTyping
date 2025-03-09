"use client";
import { db } from "@/lib/db";
import { getGlobalAtomStore, previewVideoIdAtom } from "@/lib/global-atoms/globalAtoms";
import { RouterOutPuts } from "@/server/api/trpc";
import { clientApi } from "@/trpc/client-api";
import { IndexDBOption } from "@/types";
import { Provider as JotaiProvider } from "jotai";
import { useSearchParams } from "next/navigation";
import React from "react";
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

  const globalAtomStore = getGlobalAtomStore();
  globalAtomStore.set(previewVideoIdAtom, null);

  const videoId = mapInfo ? mapInfo.video_id : newVideoId;
  const geminiQueryData = utils.gemini.generateMapInfo.getData({ videoId });

  editAtomStore.set(editGeminiTagsAtom, geminiQueryData?.otherTags || []);

  if (mapInfo) {
    editAtomStore.set(editMapTitleAtom, mapInfo.title);
    editAtomStore.set(editMapArtistNameAtom, mapInfo.artist_name);
    editAtomStore.set(editVideoIdAtom, mapInfo.video_id);
    editAtomStore.set(editCreatorIdAtom, mapInfo.creator_id);
    editAtomStore.set(editCreatorCommentAtom, mapInfo.creator_comment);
    editAtomStore.set(editMusicSourceAtom, mapInfo.music_source!);
    editAtomStore.set(editPreviewTimeInputAtom, mapInfo.preview_time);
    editAtomStore.set(editTagsAtom, {
      type: "set",
      payload: mapInfo.tags?.map((tag) => ({ id: tag, text: tag, className: "" })) || [],
    });
  } else {
    editAtomStore.set(editCreatorIdAtom, null);
    editAtomStore.set(editVideoIdAtom, newVideoId);

    if (isBackUp) {
      db.editorNewCreateBak
        .get({ optionName: "backupMapInfo" })
        .then((data: IndexDBOption | undefined) => {
          if (data) {
            const backupMap = data.value as EditorNewMapBackUpInfoData;

            editAtomStore.set(editMapTitleAtom, backupMap.title);
            editAtomStore.set(editMapArtistNameAtom, backupMap.artistName);
            editAtomStore.set(editMusicSourceAtom, backupMap.musicSource || "");
            editAtomStore.set(editCreatorCommentAtom, backupMap.creatorComment);
            editAtomStore.set(editPreviewTimeInputAtom, backupMap.previewTime);
            editAtomStore.set(editTagsAtom, {
              type: "set",
              payload: backupMap.tags?.map((tag) => ({ id: tag, text: tag, className: "" })) || [],
            });
          }
        });
    } else {
      //完全新規作成時
      editAtomStore.set(editMapTitleAtom, geminiQueryData?.musicTitle || "");
      editAtomStore.set(editMapArtistNameAtom, geminiQueryData?.artistName || "");
      editAtomStore.set(editMusicSourceAtom, geminiQueryData?.musicSource || "");
      editAtomStore.set(editCreatorCommentAtom, "");
      editAtomStore.set(editPreviewTimeInputAtom, "");
      editAtomStore.set(editTagsAtom, {
        type: "reset",
      });
    }
  }

  return (
    <RefsProvider>
      <ReduxProvider store={editStore}>
        <JotaiProvider store={editAtomStore}>{children}</JotaiProvider>
      </ReduxProvider>
    </RefsProvider>
  );
};

export default EditProvider;
