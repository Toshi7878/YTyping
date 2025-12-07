import { readLineSubstatus, readSubstatus, writeLineSubstatus, writeSubstatus } from "../../atoms/ref";
import { readBuiltMap } from "../../atoms/state";
import { readTypingStatus, setAllTypingStatus } from "../../atoms/status";
import { setCombo } from "../../atoms/sub-status";
import { MISS_PENALTY_POINT } from "../../const";

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

  const { clearRate, missCombo } = readSubstatus();
  writeSubstatus({ clearRate: clearRate - map.missRate, missCombo: missCombo + 1 });

  const { miss: lineMissCount, types } = readLineSubstatus();

  writeLineSubstatus({
    miss: lineMissCount + 1,
    types: [...types, { c: failKey, t: constantLineTime }],
  });
};
