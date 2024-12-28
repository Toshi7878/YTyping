import { CreateMap } from "@/app/type/ts/scene-ts/ready/createTypingWord";
import { useStore as useJotaiStore } from "jotai";
import { useStore as useReduxStore } from "react-redux";

import { UploadResult } from "@/types";
import { useParams } from "next/navigation";
import { actions } from "../../../server/actions/sendMapDataActions";
import {
  editCreatorCommentAtom,
  editMapArtistNameAtom,
  editMapTitleAtom,
  editMusicSourceAtom,
  editPreviewTimeInputAtom,
  editTagsAtom,
  isMapDataEditedAtom,
} from "../edit-atom/editAtom";
import { useRefs } from "../edit-contexts/refsProvider";
import { RootState } from "../redux/store";
import { getThumbnailQuality } from "../ts/tab/info-upload/getThumbailQuality";

export function useUploadMap() {
  const editReduxStore = useReduxStore<RootState>();
  const editAtomStore = useJotaiStore();
  const { playerRef } = useRefs();
  const { id: mapId } = useParams();

  const upload = async () => {
    const mapData = editReduxStore.getState().mapData.value;
    const mapTitle = editAtomStore.get(editMapTitleAtom);
    const artistName = editAtomStore.get(editMapArtistNameAtom);
    const creatorComment = editAtomStore.get(editCreatorCommentAtom);
    const musicSource = editAtomStore.get(editMusicSourceAtom);
    const tags = editAtomStore.get(editTagsAtom);
    const previewTime = editAtomStore.get(editPreviewTimeInputAtom);
    const isMapDataEdited = editAtomStore.get(isMapDataEditedAtom);

    const map = new CreateMap(mapData);
    const mapVideoId = playerRef.current.getVideoData().video_id;
    const videoDuration: number = playerRef.current.getDuration();
    const sendData = {
      videoId: mapVideoId,
      title: mapTitle,
      artistName,
      musicSource: musicSource,
      creatorComment,
      tags: tags.map((tag) => tag.id),
      previewTime:
        Number(previewTime) < videoDuration ? previewTime : mapData[map.startLine]["time"],
      romaKpmMedian: map.speedDifficulty.median.r,
      romaKpmMax: map.speedDifficulty.max.r,
      kanaKpmMedian: map.speedDifficulty.median.r,
      kanaKpmMax: map.speedDifficulty.max.r,
      totalTime: map.movieTotalTime,
      romaTotalNotes: map.totalNotes.r,
      kanaTotalNotes: map.totalNotes.k,
      thumbnailQuality: (await getThumbnailQuality(mapVideoId)) as "maxresdefault" | "mqdefault",
    };

    const result: UploadResult = await actions(
      sendData,
      mapData,
      isMapDataEdited,
      Array.isArray(mapId) ? mapId[0] : mapId || "new",
    );

    return result;
  };

  return upload;
}
