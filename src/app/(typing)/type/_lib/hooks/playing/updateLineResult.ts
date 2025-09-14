import { calcWordKanaNotes, CHAR_POINT, MISS_PENALTY } from "@/utils/build-map/buildMap";
import { useLineCount, useLineStatus, useReadYTStatus, useTypingDetails } from "../../atoms/refAtoms";
import { usePlaySpeedStateRef } from "../../atoms/speedReducerAtoms";
import {
  useReadAllLineResult,
  useReadCombo,
  useReadGameUtilParams,
  useReadLineKpm,
  useReadLineWord,
  useReadMap,
  useReadTypingStatus,
  useSetLineResult,
  useSetTypingStatus,
} from "../../atoms/stateAtoms";

export const useUpdateLineResult = () => {
  const setLineResult = useSetLineResult();

  const { readLineStatus } = useLineStatus();
  const { readStatus, writeStatus } = useTypingDetails();
  const readAllLineResults = useReadAllLineResult();
  const { readCount } = useLineCount();
  const readCombo = useReadCombo();
  const readTypingResult = useReadTypingStatus();
  const readLineWord = useReadLineWord();
  const readGameStateUtils = useReadGameUtilParams();
  const readPlaySpeed = usePlaySpeedStateRef();
  const { readYTStatus } = useReadYTStatus();
  const readLineKpm = useReadLineKpm();
  const readMap = useReadMap();
  const { setTypingStatus } = useSetTypingStatus();

  const generateLostWord = () => {
    const lineWord = readLineWord();

    const isCompleted = !lineWord.nextChar["k"];

    if (isCompleted) {
      return { lostWord: "", actualLostNotes: 0, pointLostNotes: 0 };
    }

    const romaLostWordOmitNextChar = lineWord.word.map((w) => w["r"][0]).join("");
    const pointLostNotes = !isCompleted ? lineWord.nextChar["p"] / CHAR_POINT + romaLostWordOmitNextChar.length : 0;

    const { inputMode } = readGameStateUtils();

    if (inputMode === "roma") {
      const romaLostWord = lineWord.nextChar["r"][0] + romaLostWordOmitNextChar;
      const actualLostNotes = romaLostWord.length;
      return { lostWord: romaLostWord, actualLostNotes, pointLostNotes };
    } else {
      const kanaLostWord = lineWord.nextChar["k"] + lineWord.word.map((w) => w["k"]).join("");
      const actualLostNotes = calcWordKanaNotes({ kanaWord: kanaLostWord });
      return { lostWord: kanaLostWord, actualLostNotes, pointLostNotes };
    }
  };

  const isLinePointUpdated = () => {
    const lineResults = readAllLineResults();
    const count = readCount();
    const { miss: lineMiss } = readLineStatus();
    const lineResult = lineResults[count - 1];
    const typingStatus = readTypingResult();

    const newLineScore = typingStatus.point + typingStatus.timeBonus + lineMiss * MISS_PENALTY;
    const oldLineScore =
      (lineResult?.status.p ?? 0) + (lineResult?.status.tBonus ?? 0) + (lineResult?.status.lMiss ?? 0) * MISS_PENALTY;

    const { isPaused } = readYTStatus();
    const { scene } = readGameStateUtils();
    const { playSpeed } = readPlaySpeed();
    return newLineScore >= oldLineScore && !isPaused && scene !== "replay" && playSpeed >= 1;
  };

  const updateLineResult = () => {
    const { lostWord, actualLostNotes, pointLostNotes } = generateLostWord();
    const map = readMap();
    if (!map) return;

    if (actualLostNotes > 0) setTypingStatus((prev) => ({ ...prev, lost: prev.lost + actualLostNotes }));
    if (pointLostNotes > 0) writeStatus({ clearRate: readStatus().clearRate - map.keyRate * pointLostNotes });

    const count = readCount();
    const typingStatus = readTypingResult();
    const { miss: lineMiss, type: lineType, typeResult, startSpeed, startInputMode, rkpm: lineRkpm } = readLineStatus();
    const isTypingLine = map.mapData[count - 1].kpm.r > 0;
    const { totalTypeTime } = readStatus();
    const roundedTotalTypeTime = Math.floor(totalTypeTime * 1000) / 1000;

    setLineResult({
      index: count - 1,
      lineResult: isTypingLine
        ? {
            status: {
              p: typingStatus.point,
              tBonus: typingStatus.timeBonus,
              lType: lineType,
              lMiss: lineMiss,
              lRkpm: lineRkpm,
              lKpm: readLineKpm(),
              lostW: lostWord,
              lLost: actualLostNotes,
              combo: readCombo(),
              tTime: roundedTotalTypeTime,
              mode: startInputMode,
              sp: startSpeed,
            },
            typeResult,
          }
        : {
            status: {
              combo: readCombo(),
              tTime: roundedTotalTypeTime,
              mode: startInputMode,
              sp: startSpeed,
            },
            typeResult,
          },
    });
  };

  return { updateLineResult, isLinePointUpdated };
};
