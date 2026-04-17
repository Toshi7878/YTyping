import { getBuiltMap } from "../../../atoms/built-map";
import { getLineSubstatus, setLineSubstatus } from "../../../atoms/line-substatus";
import { getTypingSubstatus, setTypingSubstatus } from "../../../atoms/substatus";
import { MISS_PENALTY_POINT } from "../../../lib/const";
import { getTypingStatus, setTypingStatus } from "../../../tabs/typing-status/status-cell";
import { setCombo } from "../../header/combo";

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

  const { clearRate, missCombo } = getTypingSubstatus();
  setTypingSubstatus({ clearRate: clearRate - map.missRate, missCombo: missCombo + 1 });

  const { missCount: lineMissCount, types } = getLineSubstatus();

  setLineSubstatus({
    missCount: lineMissCount + 1,
    types: [...types, { char: failKey, time: constantLineTime }],
  });
};
