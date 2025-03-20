import { CreateMap } from "@/lib/instanceMapData";
import { useStore as useReduxStore } from "react-redux";

import { UploadResult } from "@/types";
import { $Enums } from "@prisma/client";
import { useParams } from "next/navigation";
import { actions } from "../../../server/actions/sendMapDataActions";
import { usePlayer } from "../atoms/refAtoms";
import { useEditUtilsStateRef, useMapInfoStateRef, useMapTagsStateRef } from "../atoms/stateAtoms";
import { RootState } from "../redux/store";
import { getThumbnailQuality } from "../ts/tab/info-upload/getThumbailQuality";
import { SendMapDifficulty, SendMapInfo } from "../ts/type";

export function useUploadMap() {
  const editReduxStore = useReduxStore<RootState>();
  const { id: mapId } = useParams();
  const readEditUtils = useEditUtilsStateRef();
  const readMapInfo = useMapInfoStateRef();
  const readTags = useMapTagsStateRef();
  const { readPlayer } = usePlayer();

  const upload = async () => {
    const { title, artist, source, comment, previewTime } = readMapInfo();
    const tags = readTags();
    const mapData = editReduxStore.getState().mapData.value;

    const map = new CreateMap(mapData);
    const mapVideoId = readPlayer().getVideoData().video_id;
    const videoDuration = readPlayer().getDuration();
    const sendMapInfo: SendMapInfo = {
      video_id: mapVideoId,
      title,
      artist_name: artist,
      music_source: source ?? "",
      creator_comment: comment,
      tags: tags.map((tag) => tag.id),
      preview_time: Number(previewTime) < videoDuration ? previewTime : mapData[map.startLine]["time"],
      thumbnail_quality: (await getThumbnailQuality(mapVideoId)) as $Enums.thumbnail_quality,
    };

    const sendMapDifficulty: SendMapDifficulty = {
      roma_kpm_median: map.speedDifficulty.median.r,
      roma_kpm_max: map.speedDifficulty.max.r,
      kana_kpm_median: map.speedDifficulty.median.r,
      kana_kpm_max: map.speedDifficulty.max.r,
      total_time: map.movieTotalTime,
      roma_total_notes: map.totalNotes.r,
      kana_total_notes: map.totalNotes.k,
    };

    const { isUpdateUpdatedAt } = readEditUtils();
    const result: UploadResult = await actions(
      sendMapInfo,
      sendMapDifficulty,
      mapData,
      isUpdateUpdatedAt,
      Array.isArray(mapId) ? mapId[0] : mapId || "new"
    );

    return result;
  };

  return upload;
}
