import { CreateMap, MISS_PENALTY } from "../../../../lib/instanceMapData";
import { Status } from "../../ts/type";
import {
  useMapAtom,
  usePlayingInputModeAtom,
  useRankingScoresAtom,
  useSceneAtom,
  useSetComboAtom,
  useSetStatusAtoms,
  useStatusAtomsValues
} from "../../type-atoms/gameRenderAtoms";
import { useRefs } from "../../type-contexts/refsProvider";

export const useTypeSuccess = () => {
  const { statusRef } = useRefs();

  const map = useMapAtom() as CreateMap;
  const inputMode = usePlayingInputModeAtom();
  const scene = useSceneAtom();
  const setCombo = useSetComboAtom();
  const { setStatusValues } = useSetStatusAtoms();
  const statusAtomsValues = useStatusAtomsValues();
  const calcCurrentRank = useCalcCurrentRank();

  const updateSuccessStatus = ({
    newLineWord,
    lineRemainConstantTime,
    updatePoint,
    totalKpm,
    combo,
  }): Status => {
    const status = statusAtomsValues();
    const newStatus = { ...status };
    const isUp = {
      point: false,
      score: false,
      kpm: true,
      type: true,
      line: false,
      rank: false,
      timeBonus: false,
    };

    if (statusRef.current!.lineStatus.lineType === 1) {
      newStatus.point = updatePoint;
      isUp.point = true;
    } else if (updatePoint > 0) {
      newStatus.point += updatePoint;
      isUp.point = true;
    }
    newStatus.kpm = totalKpm;
    newStatus.type++;

    if (!newLineWord.nextChar["k"]) {
      const timeBonus = Math.round(lineRemainConstantTime * 1 * 100);
      newStatus.timeBonus = timeBonus; //speed;
      isUp.timeBonus = true;
      newStatus.score += newStatus.point + timeBonus;
      isUp.score = true;

      newStatus.line =
        map.lineLength -
        (statusRef.current!.status.completeCount + statusRef.current!.status.failureCount);
      isUp.line = true;

      newStatus.rank = calcCurrentRank(newStatus.score);

      isUp.rank = newStatus.rank !== status.rank ? true : false;
    }

    setStatusValues(newStatus);

    setCombo(combo+1);

    return newStatus;
  };

  const updateSuccessStatusRefs = ({ constantLineTime, newLineWord, successKey, combo }) => {
    if (statusRef.current!.lineStatus.lineType === 0) {
      statusRef.current!.lineStatus.latency = constantLineTime;
    }

    statusRef.current!.status.missCombo = 0;

    const newCombo = combo + 1
    if (newCombo > statusRef.current!.status.maxCombo) {
      statusRef.current!.status.maxCombo = newCombo;
    }

    if (inputMode === "roma") {
      statusRef.current!.status.romaType++;
    } else if (inputMode === "kana") {
      statusRef.current!.status.kanaType++;
    } else if (inputMode === "flick") {
      statusRef.current!.status.flickType++;
    }

    statusRef.current!.lineStatus.lineType++;

    //ライン打ち切り
    if (!newLineWord.nextChar["k"]) {
      statusRef.current!.lineStatus.lineClearTime = constantLineTime;
      statusRef.current!.status.completeCount++;
    }

    if (scene !== "replay") {
      statusRef.current!.lineStatus.typeResult.push({
        c: successKey,
        is: true,
        t: constantLineTime,
      });
    }
  };

  return { updateSuccessStatus, updateSuccessStatusRefs };
};

export const useCalcCurrentRank = () => {
  const rankingScores = useRankingScoresAtom();

  return (currentScore: number) => {
    // 現在のスコアが何番目に入るかを取得
    const rank = rankingScores.findIndex((score) => score <= currentScore);
    return (rank < 0 ? rankingScores.length : rank) + 1;
  };
};

export const useTypeMiss = () => {
  const { statusRef } = useRefs();
  const map = useMapAtom() as CreateMap;
  const setCombo = useSetComboAtom();
  const statusAtomsValues = useStatusAtomsValues();
  const { setStatusValues } = useSetStatusAtoms();

  const updateMissStatus = () => {
    const status = statusAtomsValues();

    const newStatus = { ...status };

    newStatus.miss++;
    newStatus.point -= MISS_PENALTY;

    setCombo(0);
    setStatusValues({ miss: newStatus.miss, point: newStatus.point });
  };

  const updateMissRefStatus = ({ constantLineTime, failKey }) => {
    statusRef.current!.status.clearRate -= map.missRate;
    statusRef.current!.lineStatus.typeResult.push({
      c: failKey,
      t: constantLineTime,
    });
    statusRef.current!.lineStatus.lineMiss++;
    statusRef.current!.status.missCombo++;
  };

  return { updateMissStatus, updateMissRefStatus };
};
