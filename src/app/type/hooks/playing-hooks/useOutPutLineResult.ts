import {
  playingInputModeAtom,
  sceneAtom,
  typingStatusAtom,
  useMapAtom,
} from "@/app/type/atoms/stateAtoms";
import { useCalcCurrentRank } from "@/app/type/hooks/playing-hooks/useUpdateStatus";
import { useStore } from "jotai";
import { CHAR_POINT, CreateMap } from "../../../../lib/instanceMapData";
import { typingStatusRefAtom } from "../../atoms/refAtoms";
import { LineWord } from "../../ts/type";

interface useOutPutLineResultProps {
  newLineWord: LineWord;
  totalTypeSpeed: number;
}

export const useOutPutLineResult = () => {
  const typeAtomStore = useStore();
  const map = useMapAtom() as CreateMap;
  const calcCurrentRank = useCalcCurrentRank();
  const getLostWord = (newLineWord: LineWord) => {
    if (newLineWord.nextChar["k"]) {
      const romaLostWord =
        newLineWord.nextChar["r"][0] + newLineWord.word.map((w) => w["r"][0]).join("");
      const kanaLostWord = newLineWord.nextChar["k"] + newLineWord.word.map((w) => w["k"]).join("");

      const inputMode = typeAtomStore.get(playingInputModeAtom);
      return inputMode === "roma" ? romaLostWord : kanaLostWord;
    } else {
      return "";
    }
  };

  const updateStatus = (newLineWord: LineWord, lostLength: number, totalTypeSpeed: number) => {
    const status = typeAtomStore.get(typingStatusAtom);
    const scene = typeAtomStore.get(sceneAtom);

    const newStatus = { ...status };
    if (scene === "playing") {
      typeAtomStore.set(typingStatusRefAtom, (prev) => ({
        ...prev,
        kanaToRomaConvertCount: (prev.kanaToRomaConvertCount += newLineWord.correct.r.length),
      }));
    }

    newStatus.timeBonus = 0;

    const isLineFailure = newLineWord.nextChar["k"];
    if (isLineFailure) {
      newStatus.kpm = totalTypeSpeed;
      typeAtomStore.set(typingStatusRefAtom, (prev) => ({
        ...prev,
        failureCount: prev.failureCount++,
        clearRate: prev.clearRate - map.keyRate * lostLength,
      }));

      const typingStatusRef = typeAtomStore.get(typingStatusRefAtom);
      newStatus.line =
        map.lineLength - (typingStatusRef.completeCount + typingStatusRef.failureCount);
      newStatus.lost += lostLength;
      newStatus.score += newStatus.point;
      newStatus.rank = calcCurrentRank(newStatus.score);
    }

    newStatus.point = 0;
    return newStatus;
  };

  return ({ newLineWord, totalTypeSpeed }: useOutPutLineResultProps) => {
    const lostLength = newLineWord.nextChar["k"]
      ? newLineWord.nextChar["p"] / CHAR_POINT +
        newLineWord.word.map((w) => w["r"][0]).join("").length
      : 0;

    const newStatus = updateStatus(newLineWord, lostLength, totalTypeSpeed);
    const lostWord = getLostWord(newLineWord);

    return { newStatus, lostWord, lostLength };
  };
};
