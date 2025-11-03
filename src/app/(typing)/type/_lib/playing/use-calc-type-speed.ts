import {
  readLineSubstatus,
  readSubstatus,
  readUserStats,
  writeLineSubstatus,
  writeSubstatus,
  writeUserStats,
} from "../atoms/ref";
import { readTypingStatus, setLineKpm, setTypingStatus } from "../atoms/state";

type UpdateType = "keydown" | "completed" | "timer" | "lineUpdate";
export const useCalcTypeSpeed = () => {
  const calcLineKpm = ({ constantLineTime }: { constantLineTime: number }) => {
    const { type: lineTypeCount } = readLineSubstatus();

    const lineKpm = constantLineTime ? Math.floor((lineTypeCount / constantLineTime) * 60) : 0;
    setLineKpm(lineKpm);
    return lineKpm;
  };

  const calcLineRkpm = ({ lineKpm, constantLineTime }: { lineKpm: number; constantLineTime: number }) => {
    const { latency: lineLatency, type: lineTypeCount } = readLineSubstatus();

    const rkpmTime = constantLineTime - lineLatency;
    const lineRkpm = lineTypeCount !== 0 ? Math.floor((lineTypeCount / rkpmTime) * 60) : lineKpm;
    writeLineSubstatus({ rkpm: lineRkpm });
  };

  const calcTotalKpm = ({ constantLineTime }: { constantLineTime: number }) => {
    const { type: totalTypeCount } = readTypingStatus();
    const { totalTypeTime } = readSubstatus();

    const newTotalTypeTime = totalTypeTime + constantLineTime;

    const totalKpm = Math.floor((totalTypeCount / newTotalTypeTime) * 60);
    setTypingStatus((prev) => ({ ...prev, kpm: totalKpm }));
  };

  return ({ updateType, constantLineTime }: { updateType: UpdateType; constantLineTime: number }) => {
    const lineKpm = calcLineKpm({ constantLineTime });

    if (updateType === "timer") {
      return;
    }

    calcTotalKpm({ constantLineTime });

    if (updateType === "keydown") {
      return;
    }

    if (updateType === "lineUpdate" || updateType === "completed") {
      const { totalTypeTime } = readSubstatus();
      writeSubstatus({
        totalTypeTime: totalTypeTime + constantLineTime,
      });

      const { type: lineTypeCount } = readLineSubstatus();
      if (lineTypeCount !== 0) {
        const { typingTime } = readUserStats();
        writeUserStats({ typingTime: typingTime + constantLineTime });
      }
      calcLineRkpm({ lineKpm, constantLineTime });
    }
  };
};
