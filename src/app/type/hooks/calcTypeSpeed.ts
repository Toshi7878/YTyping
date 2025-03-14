import { useStore } from "jotai";
import { lineTypingStatusRefAtom, typingStatusRefAtom } from "../atoms/refAtoms";

export const useCalcTypeSpeed = () => {
  const typeAtomStore = useStore();

  const calcLineKpm = ({ constantLineTime, newLineTypeCount }) => {
    const lineKpm = constantLineTime ? Math.round((newLineTypeCount / constantLineTime) * 60) : 0;
    return lineKpm;
  };

  const calcLineRkpm = ({ lineKpm, newLineTypeCount, rkpmTime }) => {
    const lineRkpm =
      newLineTypeCount != 0 ? Math.round((newLineTypeCount / rkpmTime) * 60) : lineKpm;
    return lineRkpm;
  };

  const calcTotalKpm = ({ newTotalTypeCount, totalTypeTime }) => {
    return totalTypeTime ? Math.round((newTotalTypeCount / totalTypeTime) * 60) : 0;
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
    const isAddTypeCount = updateType === "keydown" || updateType === "completed";

    const lineTypeCount = typeAtomStore.get(lineTypingStatusRefAtom).type;

    const newLineTypeCount = isAddTypeCount ? lineTypeCount + 1 : lineTypeCount;
    const lineKpm = calcLineKpm({ constantLineTime, newLineTypeCount });

    if (updateType === "timer") {
      return { lineKpm };
    }

    const newTotalTypeCount = isAddTypeCount ? totalTypeCount + 1 : totalTypeCount;
    const totalTypeTime = constantLineTime + typeAtomStore.get(typingStatusRefAtom).totalTypeTime;
    const totalKpm = calcTotalKpm({ newTotalTypeCount, totalTypeTime });

    if (updateType === "keydown") {
      return { lineKpm, totalKpm };
    }

    if (updateType === "lineUpdate" || updateType === "completed") {
      //ラインアップデート時、ラインクリア時はラインのrkpmも計算する
      const lineLatency = typeAtomStore.get(lineTypingStatusRefAtom).latency;
      const rkpmTime = constantLineTime - lineLatency;
      const lineRkpm = calcLineRkpm({ rkpmTime, newLineTypeCount, lineKpm });
      return { lineKpm, lineRkpm, totalKpm };
    }
  };
};
