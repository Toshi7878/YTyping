import { useParams } from "next/navigation";
import type z from "zod";
import type { CreateResultStatusSchema, ResultData } from "@/server/drizzle/validator/result";
import { readSubstatus } from "../atoms/read-atoms";
import { useReadAllLineResult, useReadTypingStatus } from "../atoms/state-atoms";

export const useResultData = () => {
  const { id: mapId } = useParams();

  const readAllLineResults = useReadAllLineResult();
  const readTypingStatus = useReadTypingStatus();

  const getMinSpeed = (lineResults: ResultData) => {
    return lineResults.reduce((min, result) => {
      const { status } = result;
      if (status && status.tTime !== 0) {
        return Math.min(min, status.sp);
      }
      return min;
    }, Infinity);
  };

  return () => {
    const {
      totalTypeTime,
      totalLatency,
      kanaToRomaConvertCount,
      clearRate,
      romaType,
      kanaType,
      flickType,
      englishType,
      spaceType,
      symbolType,
      numType,
      maxCombo,
    } = readSubstatus();

    const lineResults = readAllLineResults();
    const minPlaySpeed = getMinSpeed(lineResults);
    const rkpmTime = totalTypeTime - totalLatency;
    const typingStatus = readTypingStatus();

    const sendStatus: z.output<typeof CreateResultStatusSchema> = {
      score: typingStatus.score,
      rkpm: Math.floor((typingStatus.type / rkpmTime) * 60),
      kpm: typingStatus.kpm,
      miss: typingStatus.miss,
      lost: typingStatus.lost,
      romaType,
      kanaType,
      flickType,
      englishType,
      spaceType,
      symbolType,
      numType,
      maxCombo,
      minPlaySpeed,
      kanaToRomaKpm: Math.floor((kanaToRomaConvertCount / totalTypeTime) * 60),
      kanaToRomaRkpm: Math.floor((kanaToRomaConvertCount / rkpmTime) * 60),
      clearRate: Number(Math.max(0, clearRate).toFixed(1)),
    };

    return {
      mapId: Number(mapId),
      status: sendStatus,
      lineResults,
    };
  };
};
