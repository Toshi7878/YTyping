import { useParams } from "next/navigation";
import { actions } from "../../../server/actions/sendTypingResultActions";
import { useStatusRef } from "../atoms/refAtoms";
import { useLineResultsStateRef, useTypingStatusStateRef } from "../atoms/stateAtoms";
import { LineResultData, SendResultData } from "../ts/type";

export const useSendResult = () => {
  const { id: mapId } = useParams();
  const { readStatus } = useStatusRef();

  const readLineResults = useLineResultsStateRef();
  const readTypingStatus = useTypingStatusStateRef();

  const getMinSpeed = (lineResults: LineResultData[]) => {
    return lineResults.reduce((min, result) => {
      if (result.status!.tTime !== 0) {
        return Math.min(min, result.status!.sp);
      }
      return min;
    }, Infinity);
  };

  return async (): Promise<ReturnType<typeof actions>> => {
    const statusRef = readStatus();
    const lineResults = readLineResults();
    const minSp = getMinSpeed(lineResults);
    const totalTypeTime = statusRef.totalTypeTime;
    const rkpmTime = totalTypeTime - statusRef.totalLatency;
    const kanaToRomaConvertCount = statusRef.kanaToRomaConvertCount;

    const typingStatus = readTypingStatus();
    const sendStatus: SendResultData["status"] = {
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
    const sendData = {
      map_id: Number(mapId),
      status: sendStatus,
    };

    const result = await actions(sendData, lineResults);

    return result;
  };
};
