import { readLineSubstatus, readSubstatus, readUserStats, writeSubstatus, writeUserStats } from "../../atoms/ref";

export const updateTypingTimeOnLineEnded = ({ constantLineTime }: { constantLineTime: number }) => {
  const { totalTypeTime } = readSubstatus();
  writeSubstatus({ totalTypeTime: totalTypeTime + constantLineTime });

  const { type: lineTypeCount } = readLineSubstatus();

  if (lineTypeCount !== 0) {
    const { typingTime } = readUserStats();
    writeUserStats({ typingTime: typingTime + constantLineTime });
  }
};
