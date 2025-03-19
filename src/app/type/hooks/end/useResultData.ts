import { sendResultSchema } from "@/server/api/routers/rankingRouter";
import { useParams } from "next/navigation";
import { z } from "zod";
import { useStatusRef } from "../../atoms/refAtoms";
import { useLineResultsStateRef, useTypingStatusStateRef } from "../../atoms/stateAtoms";

export const useResultData = () => {
  const { id: mapId } = useParams();
  const { readStatus } = useStatusRef();

  const readLineResults = useLineResultsStateRef();
  const readTypingStatus = useTypingStatusStateRef();

  const getMinSpeed = (lineResults: z.infer<typeof sendResultSchema>["lineResults"]) => {
    return lineResults.reduce((min, result) => {
      if (result.status!.tTime !== 0) {
        return Math.min(min, result.status!.sp);
      }
      return min;
    }, Infinity);
  };

  return () => {
    const statusRef = readStatus();
    const lineResults = readLineResults();
    const minSp = getMinSpeed(lineResults);
    const totalTypeTime = statusRef.totalTypeTime;
    const rkpmTime = totalTypeTime - statusRef.totalLatency;
    const kanaToRomaConvertCount = statusRef.kanaToRomaConvertCount;
    const typingStatus = readTypingStatus();
    const sendStatus: z.infer<typeof sendResultSchema>["status"] = {
      score: typingStatus.score,
      roma_type: statusRef.romaType,
      kana_type: statusRef.kanaType,
      flick_type: statusRef.flickType,
      english_type: statusRef.englishType,
      space_type: statusRef.spaceType,
      symbol_type: statusRef.symbolType,
      num_type: statusRef.numType,
      miss: typingStatus.miss,
      lost: typingStatus.lost,
      rkpm: Math.round((typingStatus.type / rkpmTime) * 60),
      max_combo: statusRef.maxCombo,
      kpm: typingStatus.kpm,
      roma_kpm: Math.round((kanaToRomaConvertCount / totalTypeTime) * 60),
      default_speed: minSp,
      clear_rate: +statusRef.clearRate.toFixed(1),
    };

    return {
      mapId: Number(mapId),
      status: sendStatus,
      lineResults,
    };
  };
};
