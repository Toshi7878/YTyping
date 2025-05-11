import { sendEditorNewCreateBakIndexedDBData } from "@/lib/db";
import { Tag } from "@/types";
import { useMapStateRef } from "../../atoms/mapReducerAtom";
import { useReadMapInfo, useReadMapTags } from "../../atoms/stateAtoms";

export const useUpdateNewMapBackUp = () => {
  const readMapInfo = useReadMapInfo();
  const readTags = useReadMapTags();
  const readMap = useMapStateRef();

  return (newVideoId: string) => {
    const { title, artist, source, comment, previewTime } = readMapInfo();
    const map = readMap();
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
      map
    );
  };
};
