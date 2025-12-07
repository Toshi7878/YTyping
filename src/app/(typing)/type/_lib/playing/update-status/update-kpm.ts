import { readLineSubstatus, readSubstatus, readUserStats, writeSubstatus, writeUserStats } from "../../atoms/ref";
import { readTypingStatus, setAllTypingStatus } from "../../atoms/status";
import { setLineKpm } from "../../atoms/sub-status";
import { calculateLineKpm, calculateLineRkpm, calculateTotalKpm } from "../../utils/calculate-kpm";

export const updateKpmOnLineEnded = ({ constantLineTime }: { constantLineTime: number }) => {
  const { totalTypeTime } = readSubstatus();
  writeSubstatus({ totalTypeTime: totalTypeTime + constantLineTime });

  const { type: lineTypeCount } = readLineSubstatus();
  const { latency: lineLatency } = readLineSubstatus();
  calculateLineRkpm({ lineLatency, lineTypeCount, constantLineTime });

  if (lineTypeCount !== 0) {
    const { typingTime } = readUserStats();
    writeUserStats({ typingTime: typingTime + constantLineTime });
  }
};

export const updateKpmOnTyping = ({ constantLineTime }: { constantLineTime: number }) => {
  const { type: lineTypeCount } = readLineSubstatus();
  const newLineKpm = calculateLineKpm({ lineTypeCount, constantLineTime });

  const { type: totalTypeCount } = readTypingStatus();
  const { totalTypeTime } = readSubstatus();
  const newTotalKpm = calculateTotalKpm({ totalTypeCount, totalTypeTime, constantLineTime });

  setLineKpm(newLineKpm);
  setAllTypingStatus((prev) => ({ ...prev, kpm: newTotalKpm }));
};
