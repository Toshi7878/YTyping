import {
  useMapStateRef,
  usePlayingInputModeStateRef,
  useSceneStateRef,
  useTypingStatusStateRef,
} from "@/app/type/atoms/stateAtoms";
import { useCalcCurrentRank } from "@/app/type/hooks/playing-hooks/useUpdateStatus";
import { CHAR_POINT } from "../../../../lib/instanceMapData";
import { useStatusRef } from "../../atoms/refAtoms";
import { LineWord } from "../../ts/type";

interface useOutPutLineResultProps {
  newLineWord: LineWord;
  totalTypeSpeed: number;
}

export const useOutPutLineResult = () => {
  const calcCurrentRank = useCalcCurrentRank();

  const { readStatus, writeStatus } = useStatusRef();
  const readPlayingInputMode = usePlayingInputModeStateRef();
  const readTypingStatus = useTypingStatusStateRef();
  const readScene = useSceneStateRef();
  const readMap = useMapStateRef();

  const getLostWord = (newLineWord: LineWord) => {
    if (newLineWord.nextChar["k"]) {
      const romaLostWord = newLineWord.nextChar["r"][0] + newLineWord.word.map((w) => w["r"][0]).join("");
      const kanaLostWord = newLineWord.nextChar["k"] + newLineWord.word.map((w) => w["k"]).join("");

      const inputMode = readPlayingInputMode();
      return inputMode === "roma" ? romaLostWord : kanaLostWord;
    } else {
      return "";
    }
  };

  const updateStatus = (newLineWord: LineWord, lostLength: number, totalTypeSpeed: number) => {
    const map = readMap();
    const status = readTypingStatus();
    const scene = readScene();

    const newStatus = { ...status };

    if (scene === "playing") {
      const { kanaToRomaConvertCount } = readStatus();

      writeStatus({
        kanaToRomaConvertCount: kanaToRomaConvertCount + newLineWord.correct.r.length,
      });
    }

    newStatus.timeBonus = 0;

    const isLineFailure = newLineWord.nextChar["k"];
    if (isLineFailure) {
      const { failureCount, clearRate, completeCount } = readStatus();

      newStatus.kpm = totalTypeSpeed;
      const newFailureCount = failureCount + 1;

      writeStatus({
        failureCount: newFailureCount,
        clearRate: clearRate - map.keyRate * lostLength,
      });

      newStatus.line = map.lineLength - (completeCount + newFailureCount);
      newStatus.lost += lostLength;
      newStatus.score += newStatus.point;
      newStatus.rank = calcCurrentRank(newStatus.score);
    }

    newStatus.point = 0;
    return newStatus;
  };

  return ({ newLineWord, totalTypeSpeed }: useOutPutLineResultProps) => {
    const lostLength = newLineWord.nextChar["k"]
      ? newLineWord.nextChar["p"] / CHAR_POINT + newLineWord.word.map((w) => w["r"][0]).join("").length
      : 0;

    const newStatus = updateStatus(newLineWord, lostLength, totalTypeSpeed);
    const lostWord = getLostWord(newLineWord);

    return { newStatus, lostWord, lostLength };
  };
};
