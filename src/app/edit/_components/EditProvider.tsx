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
import { geminiTagsAtom, mapInfoAtom, mapTagsAtom, videoIdAtom } from "../atoms/stateAtoms";
import { getEditAtomStore } from "../atoms/store";
import { EditorNewMapBackUpInfoData } from "../ts/type";

interface EditProviderProps {
  mapInfo?: RouterOutPuts["map"]["getMapInfo"];
  children: React.ReactNode;
}

const EditProvider = ({ mapInfo, children }: EditProviderProps) => {
  const store = getEditAtomStore();
  const searchParams = useSearchParams();
  const isBackUp = searchParams.get("backup") === "true";
  const utils = clientApi.useUtils();
  const setPreviewVideoState = useSetPreviewVideoState();
  const newVideoId = searchParams.get("new") || "";

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

  useHydrateAtoms(hydrationState, { dangerouslyForceHydrate: true, store });
  return <JotaiProvider store={store}>{children}</JotaiProvider>;
};

export default EditProvider;
