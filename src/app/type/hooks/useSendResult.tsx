import { useParams } from "next/navigation";
import { actions } from "../../../server/actions/sendTypingResultActions";
import { LineResultData, SendResultData } from "../ts/type";
import { useLineResultsAtom, useStatusAtomsValues } from "../type-atoms/gameRenderAtoms";
import { useRefs } from "../type-contexts/refsProvider";

export const useSendResult = () => {
  const { id: mapId } = useParams();
  const { statusRef } = useRefs();
  const lineResults: LineResultData[] = useLineResultsAtom();
  const minSp = lineResults.reduce((min, result) => {
    if (result.status!.tTime !== 0) {
      return Math.min(min, result.status!.sp);
    }
    return min;
  }, Infinity);
  const statusAtomsValue = useStatusAtomsValues();

  return async (): Promise<ReturnType<typeof actions>> => {
    const totalTypeTime = statusRef.current!.status.totalTypeTime;
    const rkpmTime = totalTypeTime - statusRef.current!.status.totalLatency;
    const kanaToRomaConvertCount = statusRef.current!.status.kanaToRomaConvertCount;
    const status = statusAtomsValue();

    const sendStatus: SendResultData["status"] = {
      score: status.score,
      roma_type: statusRef.current!.status.romaType,
      kana_type: statusRef.current!.status.kanaType,
      flick_type: statusRef.current!.status.flickType,
      english_type: 0,
      symbol_type: 0,
      num_type: 0,
      miss: status.miss,
      lost: status.lost,
      rkpm: Math.round((status.type / rkpmTime) * 60),
      max_combo: statusRef.current!.status.maxCombo,
      kpm: status.kpm,
      roma_kpm: Math.round((kanaToRomaConvertCount / totalTypeTime) * 60),
      default_speed: minSp,
      clear_rate: +statusRef.current!.status.clearRate.toFixed(1),
    };
    const sendData = {
      map_id: Number(mapId),
      status: sendStatus,
    };

    const result = await actions(sendData, lineResults);

    return result;
  };
};
