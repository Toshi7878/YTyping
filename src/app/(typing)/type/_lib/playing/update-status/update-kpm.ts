import {
  readLineSubstatus,
  readTypingSubstatus,
  readUserStats,
  writeTypingSubstatus,
  writeUserStats,
} from "../../atoms/ref";

export const updateTypingTimeOnLineEnded = ({ constantLineTime }: { constantLineTime: number }) => {
  const { totalTypeTime } = readTypingSubstatus();
  writeTypingSubstatus({ totalTypeTime: totalTypeTime + constantLineTime });

  const { typeCount: lineTypeCount } = readLineSubstatus();

  if (lineTypeCount !== 0) {
    const { typingTime } = readUserStats();
    writeUserStats({ typingTime: typingTime + constantLineTime });
  }
};
