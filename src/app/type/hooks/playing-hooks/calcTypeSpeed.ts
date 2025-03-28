import { useLineStatusRef, useStatusRef, useUserStatsRef } from "../../atoms/refAtoms";
import { useSetLineKpmState, useSetTypingStatusState, useTypingStatusStateRef } from "../../atoms/stateAtoms";

type UpdateType = "keydown" | "completed" | "timer" | "lineUpdate";
export const useCalcTypeSpeed = () => {
  const { readLineStatus } = useLineStatusRef();

  const readTypingStatus = useTypingStatusStateRef();
  const setLineKpm = useSetLineKpmState();
  const { writeLineStatus } = useLineStatusRef();
  const { setTypingStatus } = useSetTypingStatusState();
  const { readStatus, writeStatus } = useStatusRef();
  const { readUserStats, writeUserStats } = useUserStatsRef();

  const calcLineKpm = ({ constantLineTime }) => {
    const { type: lineTypeCount } = readLineStatus();

    const lineKpm = constantLineTime ? Math.round((lineTypeCount / constantLineTime) * 60) : 0;
    setLineKpm(lineKpm);
    return lineKpm;
  };

  const calcLineRkpm = ({ lineKpm, constantLineTime }) => {
    const { latency: lineLatency } = readLineStatus();
    const { type: lineTypeCount } = readLineStatus();

    const rkpmTime = constantLineTime - lineLatency;
    const lineRkpm = lineTypeCount !== 0 ? Math.round((lineTypeCount / rkpmTime) * 60) : lineKpm;
    writeLineStatus({ rkpm: lineRkpm });
  };

  const calcTotalKpm = ({ constantLineTime }: { constantLineTime: number }) => {
    const { type: totalTypeCount } = readTypingStatus();
    const { totalTypeTime } = readStatus();

    const newTotalTypeTime = totalTypeTime + constantLineTime;

    const totalKpm = Math.round((totalTypeCount / newTotalTypeTime) * 60);
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
      writeStatus({
        totalTypeTime: readStatus().totalTypeTime + constantLineTime,
      });

      if (readLineStatus().type !== 0) {
        writeUserStats({
          totalTypeTime: readUserStats().totalTypeTime + constantLineTime,
        });
      }
      calcLineRkpm({ lineKpm, constantLineTime });
      return;
    }
  };
};
