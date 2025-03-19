import { useLineStatusRef, useStatusRef } from "../atoms/refAtoms";

export const useCalcTypeSpeed = () => {
  const { readLineStatus } = useLineStatusRef();
  const { readStatus } = useStatusRef();

  const calcLineKpm = ({ constantLineTime, newLineTypeCount }) => {
    const lineKpm = constantLineTime ? Math.round((newLineTypeCount / constantLineTime) * 60) : 0;
    return lineKpm;
  };

  const calcLineRkpm = ({ lineKpm, newLineTypeCount, rkpmTime }) => {
    const lineRkpm = newLineTypeCount != 0 ? Math.round((newLineTypeCount / rkpmTime) * 60) : lineKpm;
    return lineRkpm;
  };

  const calcTotalKpm = ({ newTotalTypeCount, newTotalTypeTime }) => {
    return newTotalTypeTime ? Math.round((newTotalTypeCount / newTotalTypeTime) * 60) : 0;
  };

  return ({
    updateType = "timer",
    constantLineTime,
    totalTypeCount,
  }: {
    updateType: "keydown" | "completed" | "timer" | "lineUpdate";
    constantLineTime: number;
    totalTypeCount: number;
  }) => {
    const { type: lineTypeCount, latency: lineLatency } = readLineStatus();
    const { totalTypeTime } = readStatus();
    const isAddTypeCount = updateType === "keydown" || updateType === "completed";

    const newLineTypeCount = isAddTypeCount ? lineTypeCount + 1 : lineTypeCount;
    const lineKpm = calcLineKpm({ constantLineTime, newLineTypeCount });

    if (updateType === "timer") {
      return { lineKpm };
    }

    const newTotalTypeCount = isAddTypeCount ? totalTypeCount + 1 : totalTypeCount;
    const newTotalTypeTime = constantLineTime + totalTypeTime;
    const totalKpm = calcTotalKpm({ newTotalTypeCount, newTotalTypeTime });

    if (updateType === "keydown") {
      return { lineKpm, totalKpm };
    }

    if (updateType === "lineUpdate" || updateType === "completed") {
      //ラインアップデート時、ラインクリア時はラインのrkpmも計算する
      const rkpmTime = constantLineTime - lineLatency;
      const lineRkpm = calcLineRkpm({ rkpmTime, newLineTypeCount, lineKpm });
      return { lineKpm, lineRkpm, totalKpm };
    }
  };
};
