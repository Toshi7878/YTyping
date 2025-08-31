import { useParams } from "next/navigation";
import { useTypingDetails } from "../../atoms/refAtoms";
import { useReadAllLineResult, useReadTypingStatus } from "../../atoms/stateAtoms";
import { LineResultData, LineResultStatus } from "../../type";

export const useResultData = () => {
  const { id: mapId } = useParams();
  const { readStatus } = useTypingDetails();

  const readAllLineResults = useReadAllLineResult();
  const readTypingStatus = useReadTypingStatus();

  const getMinSpeed = (lineResults: LineResultData[]) => {
    return lineResults.reduce((min, result) => {
      const { status } = result;
      if (status && status.tTime !== 0) {
        return Math.min(min, status.sp);
      }
      return min;
    }, Infinity);
  };

  return () => {
    const { totalTypeTime, totalLatency, kanaToRomaConvertCount, clearRate, maxCombo } = readStatus();
    const { romaType, kanaType, flickType, englishType, spaceType, symbolType, numType } = readStatus();
    const lineResults = readAllLineResults();
    const minSp = getMinSpeed(lineResults);
    const rkpmTime = totalTypeTime - totalLatency;
    const typingStatus = readTypingStatus();

    const sendStatus: LineResultStatus = {
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
