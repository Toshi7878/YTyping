import { ParseMap } from "@/util/parse-map/parseMap";

import { UploadResult } from "@/types";
import { $Enums } from "@prisma/client";
import { useParams } from "next/navigation";
import { actions } from "../../../../server/actions/sendMapDataActions";
import { useMapStateRef } from "../../atoms/mapReducerAtom";
import { usePlayer } from "../../atoms/refAtoms";
import { useReadEditUtils, useReadMapInfo, useReadMapTags } from "../../atoms/stateAtoms";
import { getThumbnailQuality } from "../../ts/tab/info-upload/getThumbailQuality";
import { SendMapDifficulty, SendMapInfo } from "../../ts/type";

export function useUploadMap() {
  const { id: mapId } = useParams();
  const readEditUtils = useReadEditUtils();
  const readMapInfo = useReadMapInfo();
  const readTags = useReadMapTags();
  const { readPlayer } = usePlayer();
  const readMap = useMapStateRef();

  const upload = async () => {
    const { title, artist, source, comment, previewTime } = readMapInfo();
    const tags = readTags();

    const map = readMap();
    const { speedDifficulty, movieTotalTime, totalNotes, startLine } = new ParseMap(map);

    const { video_id } = readPlayer().getVideoData();
    const videoDuration = readPlayer().getDuration();

    const typingStartTime = Math.max(0, Number(map[startLine]["time"]) + 0.2);

    const newPreviewTime =
      Number(previewTime) > videoDuration || typingStartTime >= Number(previewTime)
        ? typingStartTime.toFixed(3)
        : previewTime;

    const sendMapInfo: SendMapInfo = {
      video_id,
      title,
      artist_name: artist,
      music_source: source ?? "",
      creator_comment: comment,
      tags: tags.map((tag) => tag.id),
      preview_time: newPreviewTime,
      thumbnail_quality: (await getThumbnailQuality(video_id)) as $Enums.thumbnail_quality,
    };

    const sendMapDifficulty: SendMapDifficulty = {
      roma_kpm_median: speedDifficulty.median.r,
      roma_kpm_max: speedDifficulty.max.r,
      kana_kpm_median: speedDifficulty.median.r,
      kana_kpm_max: speedDifficulty.max.r,
      total_time: movieTotalTime,
      roma_total_notes: totalNotes.r,
      kana_total_notes: totalNotes.k,
    };

    const { isUpdateUpdatedAt } = readEditUtils();
    const result: UploadResult = await actions(
      sendMapInfo,
      sendMapDifficulty,
      map,
      isUpdateUpdatedAt,
      Array.isArray(mapId) ? mapId[0] : mapId || "new"
    );

    return result;
  };

  return upload;
}
