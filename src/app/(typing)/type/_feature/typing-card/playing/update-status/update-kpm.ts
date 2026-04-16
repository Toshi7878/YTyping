import { readLineSubstatus } from "../../../atoms/line-substatus";
import { getTypingStats, setTypingStats } from "../../../atoms/stats";
import { getTypingSubstatus, setTypingSubstatus } from "../../../atoms/substatus";

export const updateTypingTime = ({ constantLineTime }: { constantLineTime: number }) => {
  const { totalTypeTime } = getTypingSubstatus();
  setTypingSubstatus({ totalTypeTime: totalTypeTime + constantLineTime });

  const { typeCount: lineTypeCount } = readLineSubstatus();
  if (lineTypeCount !== 0) {
    const { typingTime } = getTypingStats();
    setTypingStats({ typingTime: typingTime + constantLineTime });
  }
};
