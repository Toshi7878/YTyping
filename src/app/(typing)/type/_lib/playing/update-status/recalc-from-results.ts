import { readAllLineResult } from "../../atoms/family";
import { writeSubstatus } from "../../atoms/ref";
import { readBuiltMap, readUtilityParams, setTypingStatus } from "../../atoms/state";
import { calcCurrentRank } from "./calc-current-rank";

export const recalculateStatusFromResults = ({
  count,
  updateType,
}: {
  count: number;
  updateType: "lineUpdate" | "completed";
}) => {
  const map = readBuiltMap();
  if (!map) return;

  const newStatus = {
    score: 0,
    point: 0,
    timeBonus: 0,
    type: 0,
    miss: 0,
    lost: 0,
    kpm: 0,
    rank: 0,
    line: map.typingLineIndexes.length,
  };

  const lineResults = readAllLineResult();
  let totalTypeTime = 0;
  const { scene } = readUtilityParams();

  const updateCount = updateType === "completed" ? count + 1 : count;
  for (const lineResult of lineResults.slice(1, updateCount)) {
    newStatus.score += (lineResult.status.p ?? 0) + (lineResult.status.tBonus ?? 0);
    newStatus.miss += lineResult.status.lMiss ?? 0;
    newStatus.lost += lineResult.status.lLost ?? 0;

    if (scene === "practice") {
      newStatus.line -= lineResult.status.lLost === 0 ? 1 : 0;
    } else if (scene === "replay") {
      newStatus.line -= lineResult.status.lType !== undefined ? 1 : 0;
    }

    const typesLength = lineResult.types.length;
    if (typesLength) {
      totalTypeTime += lineResult.types[typesLength - 1]?.t ?? 0;
    }
    newStatus.type += lineResult.status.lType ?? 0;
  }

  const lineResult = lineResults[count - 1];
  newStatus.kpm = totalTypeTime > 0 ? Math.floor((newStatus.type / totalTypeTime) * 60) : 0;
  newStatus.rank = calcCurrentRank(newStatus.score);

  if (updateType === "completed") {
    newStatus.point = lineResult?.status.p ?? 0;
    newStatus.timeBonus = lineResult?.status.tBonus ?? 0;
  } else {
    newStatus.point = 0;
    newStatus.timeBonus = 0;
  }

  writeSubstatus({ totalTypeTime: lineResult?.status.tTime });
  setTypingStatus(newStatus);
};
