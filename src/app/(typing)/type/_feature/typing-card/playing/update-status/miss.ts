import {
  readLineSubstatus,
  readTypingSubstatus,
  writeLineSubstatus,
  writeTypingSubstatus,
} from "../../../../_atoms/ref";
import { readBuiltMap } from "../../../../_atoms/state";
import { readTypingStatus, setAllTypingStatus } from "../../../../_atoms/status";
import { setCombo } from "../../../../_atoms/substatus";
import { MISS_PENALTY_POINT } from "../../../../_lib/const";

export const updateMissStatus = () => {
  const status = readTypingStatus();
  const newStatus = { ...status };

  newStatus.miss++;
  newStatus.point -= MISS_PENALTY_POINT;

  setCombo(0);
  setAllTypingStatus(newStatus);
};

export const updateMissSubstatus = ({ constantLineTime, failKey }: { constantLineTime: number; failKey: string }) => {
  const map = readBuiltMap();
  if (!map) return;

  const { clearRate, missCombo } = readTypingSubstatus();
  writeTypingSubstatus({ clearRate: clearRate - map.missRate, missCombo: missCombo + 1 });

  const { missCount: lineMissCount, types } = readLineSubstatus();

  writeLineSubstatus({
    missCount: lineMissCount + 1,
    types: [...types, { char: failKey, time: constantLineTime }],
  });
};
