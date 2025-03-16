"use client";
import { db } from "@/lib/db";
import { useSetPreviewVideoState } from "@/lib/global-atoms/globalAtoms";
import { RouterOutPuts } from "@/server/api/trpc";
import { clientApi } from "@/trpc/client-api";
import { IndexDBOption } from "@/types";
import { Provider as JotaiProvider } from "jotai";
import { DevTools } from "jotai-devtools";
import { RESET, useHydrateAtoms } from "jotai/utils";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { geminiTagsAtom, getEditAtomStore, mapInfoAtom, mapTagsAtom, videoIdAtom } from "../atoms/stateAtoms";
import { RefsProvider } from "../edit-contexts/refsProvider";
import editStore from "../redux/store";
import { EditorNewMapBackUpInfoData } from "../ts/type";

interface EditProviderProps {
  mapInfo?: RouterOutPuts["map"]["getMapInfo"];
  children: React.ReactNode;
}

const EditProvider = ({ mapInfo, children }: EditProviderProps) => {
  const jotaiStore = getEditAtomStore();
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
          musicSource: mapInfo.music_source,
          previewTime: mapInfo.preview_time,
        },
      ],
      [videoIdAtom, videoId]
    );
    hydrationState.push([
      mapTagsAtom,
      {
        type: "set",
        payload: mapInfo.tags?.map((tag) => ({ id: tag, text: tag, className: "" })) || [],
      },
    ]);
  } else {
    if (isBackUp) {
      db.editorNewCreateBak.get({ optionName: "backupMapInfo" }).then((data: IndexDBOption | undefined) => {
        if (data) {
          const backupMap = data.value as EditorNewMapBackUpInfoData;

          hydrationState.push(
            [
              mapInfoAtom,
              {
                title: backupMap.title,
                artist: backupMap.artistName,
                creatorId: null,
                creatorComment: backupMap.creatorComment,
                musicSource: backupMap.musicSource,
                previewTime: backupMap.previewTime,
              },
            ],
            [videoIdAtom, backupMap.videoId]
          );
          hydrationState.push([
            mapTagsAtom,
            {
              type: "set",
              payload: backupMap.tags?.map((tag) => ({ id: tag, text: tag, className: "" })) || [],
            },
          ]);
        }
      });
    } else {
      hydrationState.push(
        [
          mapInfoAtom,
          {
            title: geminiQueryData?.musicTitle || "",
            artist: geminiQueryData?.artistName || "",
            creatorId: null,
            creatorComment: "",
            musicSource: geminiQueryData?.musicSource || "",
            previewTime: "",
          },
        ],
        [videoIdAtom, newVideoId]
      );
      hydrationState.push([mapTagsAtom, { type: "reset" }]);
    }
  }

  useHydrateAtoms(hydrationState, { dangerouslyForceHydrate: true, store: jotaiStore });
  return (
    <RefsProvider>
      <ReduxProvider store={editStore}>
        <JotaiProvider store={jotaiStore}>
          <DevTools store={jotaiStore} />
          {children}
        </JotaiProvider>
      </ReduxProvider>
    </RefsProvider>
  );
};

export default EditProvider;
