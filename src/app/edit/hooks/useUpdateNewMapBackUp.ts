import { sendEditorNewCreateBakIndexedDBData } from "@/lib/db";
import { Tag } from "@/types";
import { useStore as useReduxStore } from "react-redux";
import { useMapInfoStateRef, useMapTagsStateRef } from "../atoms/stateAtoms";

import { RootState } from "../redux/store";

export const useUpdateNewMapBackUp = () => {
  const editReduxStore = useReduxStore<RootState>();
  const readMapInfo = useMapInfoStateRef();
  const readTags = useMapTagsStateRef();

  return (newVideoId: string) => {
    const { title, artist, source, comment, previewTime } = readMapInfo();
    const mapData = editReduxStore.getState().mapData.value;
    const tags = readTags();

    sendEditorNewCreateBakIndexedDBData(
      {
        title,
        artistName: artist,
        musicSource: source,
        creatorComment: comment,
        videoId: newVideoId,
        previewTime,
        tags: tags.map((tag: Tag) => tag.id),
      },
      mapData
    );
  };
};
