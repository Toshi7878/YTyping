import { useParams } from "next/navigation";
import { useReadMap } from "../atoms/mapReducerAtom";
import { usePlayer } from "../atoms/refAtoms";
import { useReadEditUtils } from "../atoms/stateAtoms";

export function useUploadMap() {
  const { id: mapId } = useParams();
  const readEditUtils = useReadEditUtils();
  const { readPlayer } = usePlayer();
  const readMap = useReadMap();

  const upload = async () => {
    // const { title, artist, source, comment, previewTime } = readMapInfo();
    // const map = readMap();
    // const { speedDifficulty, movieTotalTime, totalNotes, startLine } = new ParseMap(map);
    // const { video_id } = readPlayer().getVideoData();
    // const videoDuration = readPlayer().getDuration();
    // const typingStartTime = Math.max(0, Number(map[startLine]["time"]) + 0.2);
    // const newPreviewTime =
    //   Number(previewTime) > videoDuration || typingStartTime >= Number(previewTime)
    //     ? typingStartTime.toFixed(3)
    //     : previewTime;
    // const sendMapInfo: SendMapInfo = {
    //   video_id,
    //   title,
    //   artist_name: artist,
    //   music_source: source ?? "",
    //   creator_comment: comment,
    //   tags: [],
    //   preview_time: newPreviewTime,
    //   thumbnail_quality: (await getThumbnailQuality(video_id)) as $Enums.thumbnail_quality,
    // };
    // const sendMapDifficulty: SendMapDifficulty = {
    //   roma_kpm_median: speedDifficulty.median.r,
    //   roma_kpm_max: speedDifficulty.max.r,
    //   kana_kpm_median: speedDifficulty.median.r,
    //   kana_kpm_max: speedDifficulty.max.r,
    //   total_time: movieTotalTime,
    //   roma_total_notes: totalNotes.r,
    //   kana_total_notes: totalNotes.k,
    // };
    // const { isUpdateUpdatedAt } = readEditUtils();
    // const result: UploadResult = await actions(
    //   sendMapInfo,
    //   sendMapDifficulty,
    //   map,
    //   isUpdateUpdatedAt,
    //   Array.isArray(mapId) ? mapId[0] : mapId || "new",
    // );
    // return result;
  };

  return upload;
}
