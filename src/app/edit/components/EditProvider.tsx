"use client";
import { QUERY_KEYS } from "@/config/global-consts";
import { db } from "@/lib/db";
import { getGlobalAtomStore, previewVideoIdAtom } from "@/lib/global-atoms/globalAtoms";
import { RouterOutPuts } from "@/server/api/trpc";
import { IndexDBOption } from "@/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import { EditorNewMapBackUpInfoData, GeminiMapInfo } from "../ts/type";

const queryClient = new QueryClient();

interface EditProviderProps {
  mapInfo?: RouterOutPuts["map"]["getMapInfo"];
  children: React.ReactNode;
}

const EditProvider = ({ mapInfo, children }: EditProviderProps) => {
  const editAtomStore = getEditAtomStore();
  const searchParams = useSearchParams();
  const newVideoId = searchParams.get("new") || "";
  const isBackUp = searchParams.get("backup") === "true";

  const globalAtomStore = getGlobalAtomStore();
  globalAtomStore.set(previewVideoIdAtom, null);
  const geminiQueryData: GeminiMapInfo | undefined = queryClient.getQueryData(
    QUERY_KEYS.generateMapInfoGemini(mapInfo ? mapInfo.videoId : newVideoId),
  );

  editAtomStore.set(editGeminiTagsAtom, geminiQueryData?.otherTags || []);

  if (mapInfo) {
    editAtomStore.set(editMapTitleAtom, mapInfo.title);
    editAtomStore.set(editMapArtistNameAtom, mapInfo.artistName);
    editAtomStore.set(editVideoIdAtom, mapInfo.videoId);
    editAtomStore.set(editCreatorIdAtom, mapInfo.creatorId);
    editAtomStore.set(editCreatorCommentAtom, mapInfo.creatorComment);
    editAtomStore.set(editMusicSourceAtom, mapInfo.musicSource!);
    editAtomStore.set(editPreviewTimeInputAtom, mapInfo.previewTime);
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
            editAtomStore.set(editMusicSourceAtom, backupMap.musicSource);
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
      <QueryClientProvider client={queryClient}>
        <ReduxProvider store={editStore}>
          <JotaiProvider store={editAtomStore}>{children}</JotaiProvider>
        </ReduxProvider>
      </QueryClientProvider>
    </RefsProvider>
  );
};

export default EditProvider;
