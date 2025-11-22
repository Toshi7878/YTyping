import { MISS_PENALTY } from "@/lib/build-map/build-map";
import { readLineSubstatus, readSubstatus, writeLineSubstatus, writeSubstatus } from "../../atoms/ref";
import { readBuiltMap, readTypingStatus, setCombo, setTypingStatus } from "../../atoms/state";

export const updateMissStatus = () => {
  const status = readTypingStatus();
  const newStatus = { ...status };

  newStatus.miss++;
  newStatus.point -= MISS_PENALTY;

  setCombo(0);
  setTypingStatus(newStatus);
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
