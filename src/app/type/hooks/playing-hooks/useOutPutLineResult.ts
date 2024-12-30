import { useCalcCurrentRank } from "@/app/type/hooks/playing-hooks/useUpdateStatus";
import {
  playingInputModeAtom,
  sceneAtom,
  useMapAtom,
  useStatusAtomsValues,
} from "@/app/type/type-atoms/gameRenderAtoms";
import { useStore } from "jotai";
import { CHAR_POINT, CreateMap } from "../../../../lib/instanceMapData";
import { LineWord, Status } from "../../ts/type";
import { useRefs } from "../../type-contexts/refsProvider";

interface useOutPutLineResultProps {
  newLineWord: LineWord;
  totalTypeSpeed: number;
}

export const useOutPutLineResult = () => {
  const typeAtomStore = useStore();

  const { statusRef } = useRefs();
  const map = useMapAtom() as CreateMap;

  const statusAtomsValues = useStatusAtomsValues();
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
    const status: Status = statusAtomsValues();
    const scene = typeAtomStore.get(sceneAtom);

    const newStatus = { ...status };
    if (scene === "playing" && statusRef.current) {
      statusRef.current.status.kanaToRomaConvertCount += newLineWord.correct.r.length;
    }

    newStatus.timeBonus = 0;

    const isLineFailure = newLineWord.nextChar["k"];
    if (isLineFailure) {
      newStatus.kpm = totalTypeSpeed;
      statusRef.current!.status.failureCount++;
      newStatus.line =
        map.lineLength -
        (statusRef.current!.status.completeCount + statusRef.current!.status.failureCount);
      newStatus.lost += lostLength;
      statusRef.current!.status.clearRate -= map.keyRate * lostLength;
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
