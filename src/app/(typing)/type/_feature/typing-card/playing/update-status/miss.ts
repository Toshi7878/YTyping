import {
  readLineSubstatus,
  readTypingSubstatus,
  writeLineSubstatus,
  writeTypingSubstatus,
} from "../../../../_atoms/ref";
import { getBuiltMap } from "../../../../_atoms/state";
import { setCombo } from "../../../../_atoms/substatus";
import { MISS_PENALTY_POINT } from "../../../../_lib/const";
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
