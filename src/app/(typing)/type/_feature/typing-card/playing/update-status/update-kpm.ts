import {
  readLineSubstatus,
  readTypingStats,
  readTypingSubstatus,
  writeTypingStats,
  writeTypingSubstatus,
} from "../../../../_atoms/ref";

export const updateTypingTime = ({ constantLineTime }: { constantLineTime: number }) => {
  const { totalTypeTime } = readTypingSubstatus();
  writeTypingSubstatus({ totalTypeTime: totalTypeTime + constantLineTime });

  const { typeCount: lineTypeCount } = readLineSubstatus();
  if (lineTypeCount !== 0) {
    const { typingTime } = readTypingStats();
    writeTypingStats({ typingTime: typingTime + constantLineTime });
  }
};
