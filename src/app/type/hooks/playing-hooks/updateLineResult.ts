import { calcWordKanaNotes, CHAR_POINT, MISS_PENALTY } from "@/util/parseMap";
import { useCountRef, useLineStatusRef, useStatusRef, useYTStatusRef } from "../../atoms/refAtoms";
import { usePlaySpeedStateRef } from "../../atoms/speedReducerAtoms";
import {
  useComboStateRef,
  useGameStateUtilsRef,
  useLineKpmStateRef,
  useLineResultsStateRef,
  useLineWordStateRef,
  useMapStateRef,
  useSetLineResultsState,
  useSetTypingStatusState,
  useTypingStatusStateRef,
} from "../../atoms/stateAtoms";

export const useUpdateLineResult = () => {
  const setLineResults = useSetLineResultsState();

  const { readLineStatus } = useLineStatusRef();
  const { readStatus, writeStatus } = useStatusRef();
  const readLineResults = useLineResultsStateRef();
  const { readCount } = useCountRef();
  const readCombo = useComboStateRef();
  const readTypingResult = useTypingStatusStateRef();
  const readLineWord = useLineWordStateRef();
  const readGameStateUtils = useGameStateUtilsRef();
  const readPlaySpeed = usePlaySpeedStateRef();
  const { readYTStatus } = useYTStatusRef();
  const readLineKpm = useLineKpmStateRef();
  const readMap = useMapStateRef();
  const { setTypingStatus } = useSetTypingStatusState();

  const generateLostWord = () => {
    const lineWord = readLineWord();

    const isCompleted = !lineWord.nextChar["k"];

    if (isCompleted) {
      return { lostWord: "", actualLostNotesCount: 0 };
    }

    const romaLostWordOmitNextChar = lineWord.word.map((w) => w["r"][0]).join("");
    const pointLostNotes = !isCompleted ? lineWord.nextChar["p"] / CHAR_POINT + romaLostWordOmitNextChar.length : 0;

    writeStatus({ clearRate: readStatus().clearRate - readMap().keyRate * pointLostNotes });

    const { inputMode } = readGameStateUtils();

    if (inputMode === "roma") {
      const romaLostWord = lineWord.nextChar["r"][0] + romaLostWordOmitNextChar;
      const actualLostNotesCount = romaLostWord.length;
      return { lostWord: romaLostWord, actualLostNotesCount };
    } else {
      const kanaLostWord = lineWord.nextChar["k"] + lineWord.word.map((w) => w["k"]).join("");
      const actualLostNotesCount = calcWordKanaNotes({ kanaWord: kanaLostWord });
      return { lostWord: kanaLostWord, actualLostNotesCount };
    }
  };

  const isLinePointUpdated = () => {
    const lineResultList = readLineResults();
    const count = readCount();
    const { miss: lineMiss } = readLineStatus();
    const lineResult = lineResultList[count - 1];
    const typingStatus = readTypingResult();

    const newLineScore = typingStatus.point + typingStatus.timeBonus + lineMiss * MISS_PENALTY;
    const oldLineScore =
      (lineResult.status.p ?? 0) + (lineResult.status.tBonus ?? 0) + (lineResult.status.lMiss ?? 0) * MISS_PENALTY;

    const { isPaused } = readYTStatus();
    const { scene } = readGameStateUtils();
    const { playSpeed } = readPlaySpeed();
    return newLineScore >= oldLineScore && !isPaused && scene !== "replay" && playSpeed >= 1;
  };

  const updateLineResult = () => {
    const count = readCount();
    const typingStatus = readTypingResult();

    const { miss: lineMiss, type: lineType, typeResult, startSpeed, startInputMode, rkpm: lineRkpm } = readLineStatus();

    const { totalTypeTime } = readStatus();

    const roundedTotalTypeTime = Math.round(totalTypeTime * 1000) / 1000;
    const { lostWord, actualLostNotesCount } = generateLostWord();

    const map = readMap();
    const isTypingLine = map.mapData[count - 1].kpm.r > 0;

    if (isTypingLine) {
      setTypingStatus((prev) => ({ ...prev, lost: prev.lost + actualLostNotesCount }));
    }

    setLineResults((prev) => {
      const newLineResults = [...prev];

      if (isTypingLine) {
        newLineResults[count - 1] = {
          status: {
            p: typingStatus.point,
            tBonus: typingStatus.timeBonus,
            lType: lineType,
            lMiss: lineMiss,
            lRkpm: lineRkpm,
            lKpm: readLineKpm(),
            lostW: lostWord,
            lLost: actualLostNotesCount,
            combo: readCombo(),
            tTime: roundedTotalTypeTime,
            mode: startInputMode,
            sp: startSpeed,
          },
          typeResult,
        };
      } else {
        newLineResults[count - 1] = {
          status: {
            combo: readCombo(),
            tTime: roundedTotalTypeTime,
            mode: startInputMode,
            sp: startSpeed,
          },
          typeResult,
        };
      }

      return newLineResults;
    });
  };

  return { updateLineResult, isLinePointUpdated };
};
