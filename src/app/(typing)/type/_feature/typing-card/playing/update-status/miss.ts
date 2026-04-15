import { readLineSubstatus, readTypingSubstatus, writeLineSubstatus, writeTypingSubstatus } from "../../../atoms/ref";
import { getBuiltMap } from "../../../atoms/state";
import { setCombo } from "../../../atoms/substatus";
import { MISS_PENALTY_POINT } from "../../../lib/const";
import { getTypingStatus, setTypingStatus } from "../../../tabs/typing-status/status-cell";

export const updateMissStatus = () => {
  const status = getTypingStatus();
  const newStatus = { ...status };

  newStatus.miss++;
  newStatus.point -= MISS_PENALTY_POINT;

  setCombo(0);
  setTypingStatus(newStatus);
};

export const updateMissSubstatus = ({ constantLineTime, failKey }: { constantLineTime: number; failKey: string }) => {
  const map = getBuiltMap();
  if (!map) return;

  const { clearRate, missCombo } = readTypingSubstatus();
  writeTypingSubstatus({ clearRate: clearRate - map.missRate, missCombo: missCombo + 1 });

  const { missCount: lineMissCount, types } = readLineSubstatus();

  writeLineSubstatus({
    missCount: lineMissCount + 1,
    types: [...types, { char: failKey, time: constantLineTime }],
  });
};
