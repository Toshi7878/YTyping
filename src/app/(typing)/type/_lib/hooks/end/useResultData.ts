import { sendResultSchema } from "@/server/api/routers/rankingRouter";
import { useParams } from "next/navigation";
import z from "zod";
import { useTypingDetails } from "../../atoms/refAtoms";
import { useReadLineResults, useReadTypingStatus } from "../../atoms/stateAtoms";

export const useResultData = () => {
  const { id: mapId } = useParams();
  const { readStatus } = useTypingDetails();

  const readLineResults = useReadLineResults();
  const readTypingStatus = useReadTypingStatus();

  const getMinSpeed = (lineResults: z.infer<typeof sendResultSchema>["lineResults"]) => {
    return lineResults.reduce((min, result) => {
      if (result.status!.tTime !== 0) {
        return Math.min(min, result.status!.sp);
      }
      return min;
    }, Infinity);
  };

  return () => {
    const { totalTypeTime, totalLatency, kanaToRomaConvertCount, clearRate, maxCombo } = readStatus();
    const { romaType, kanaType, flickType, englishType, spaceType, symbolType, numType } = readStatus();
    const lineResults = readLineResults();
    const minSp = getMinSpeed(lineResults);
    const rkpmTime = totalTypeTime - totalLatency;
    const typingStatus = readTypingStatus();

    const sendStatus: z.infer<typeof sendResultSchema>["status"] = {
      score: typingStatus.score,
      roma_type: romaType,
      kana_type: kanaType,
      flick_type: flickType,
      english_type: englishType,
      space_type: spaceType,
      symbol_type: symbolType,
      num_type: numType,
      miss: typingStatus.miss,
      lost: typingStatus.lost,
      rkpm: Math.floor((typingStatus.type / rkpmTime) * 60),
      max_combo: maxCombo,
      kpm: typingStatus.kpm,
      roma_kpm: Math.floor((kanaToRomaConvertCount / totalTypeTime) * 60),
      roma_rkpm: Math.floor((kanaToRomaConvertCount / rkpmTime) * 60),
      default_speed: minSp,
      clear_rate: Number(clearRate.toFixed(1)),
    };

    return {
      mapId: Number(mapId),
      status: sendStatus,
      lineResults,
    };
  };
};
