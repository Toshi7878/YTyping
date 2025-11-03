import { CHAR_POINT, calcWordKanaNotes, MISS_PENALTY } from "@/lib/build-map/build-map";
import { readLineSubstatus, readSubstatus, writeSubstatus } from "../atoms/read-atoms";
import { useReadPlaySpeed } from "../atoms/speed-reducer-atoms";
import {
  useReadAllLineResult,
  useReadCombo,
  useReadGameUtilityParams,
  useReadLineKpm,
  useReadLineWord,
  useReadMap,
  useReadTypingStatus,
  useSetLineResult,
  useSetTypingStatus,
} from "../atoms/state-atoms";

export const useUpdateLineResult = () => {
  const setLineResult = useSetLineResult();

  const readAllLineResults = useReadAllLineResult();
  const readCombo = useReadCombo();
  const readTypingResult = useReadTypingStatus();
  const readLineWord = useReadLineWord();
  const readGameUtilityParams = useReadGameUtilityParams();
  const readPlaySpeed = useReadPlaySpeed();
  const readLineKpm = useReadLineKpm();
  const readMap = useReadMap();
  const { setTypingStatus } = useSetTypingStatus();

  const generateLostWord = () => {
    const lineWord = readLineWord();

    const isCompleted = !lineWord.nextChar.k;

    if (isCompleted) {
      return { lostWord: "", actualLostNotes: 0, pointLostNotes: 0 };
    }

    const romaLostWordOmitNextChar = lineWord.word.map((w) => w.r[0]).join("");
    const pointLostNotes = !isCompleted ? lineWord.nextChar.p / CHAR_POINT + romaLostWordOmitNextChar.length : 0;

    const { inputMode } = readGameUtilityParams();

    if (inputMode === "roma") {
      const romaLostWord = lineWord.nextChar.r[0] + romaLostWordOmitNextChar;
      const actualLostNotes = romaLostWord.length;
      return { lostWord: romaLostWord, actualLostNotes, pointLostNotes };
    }

    const kanaLostWord = lineWord.nextChar.k + lineWord.word.map((w) => w.k).join("");
    const actualLostNotes = calcWordKanaNotes({ kanaWord: kanaLostWord });
    return { lostWord: kanaLostWord, actualLostNotes, pointLostNotes };
  };

  const hasLineResultImproved = (count: number) => {
    const lineResults = readAllLineResults();
    console.log(lineResults);
    const { miss: lineMiss } = readLineSubstatus();
    const savedLineResult = lineResults[count];
    const typingStatus = readTypingResult();

    const currentLineScore = typingStatus.point + typingStatus.timeBonus + lineMiss * MISS_PENALTY;
    const savedLineScore =
      (savedLineResult?.status.p ?? 0) +
      (savedLineResult?.status.tBonus ?? 0) +
      (savedLineResult?.status.lMiss ?? 0) * MISS_PENALTY;

    const { scene, isPaused } = readGameUtilityParams();
    const { playSpeed } = readPlaySpeed();
    return currentLineScore >= savedLineScore && !isPaused && scene !== "replay" && playSpeed >= 1;
  };

  const saveLineResult = (count: number) => {
    const { lostWord, actualLostNotes, pointLostNotes } = generateLostWord();
    const map = readMap();
    if (!map) return;

    if (actualLostNotes > 0) setTypingStatus((prev) => ({ ...prev, lost: prev.lost + actualLostNotes }));
    if (pointLostNotes > 0) {
      const { clearRate } = readSubstatus();
      writeSubstatus({ clearRate: clearRate - map.keyRate * pointLostNotes });
    }

    const typingStatus = readTypingResult();
    const { miss: lineMiss, type: lineType, types, startSpeed, startInputMode, rkpm: lineRkpm } = readLineSubstatus();
    const isTypingLine = (map.mapData[count]?.kpm.r ?? 0) > 0;
    const { totalTypeTime } = readSubstatus();
    const roundedTotalTypeTime = Math.floor(totalTypeTime * 1000) / 1000;

    setLineResult({
      index: count,
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
            types,
          }
        : {
            status: {
              combo: readCombo(),
              tTime: roundedTotalTypeTime,
              mode: startInputMode,
              sp: startSpeed,
            },
            types,
          },
    });
  };

  return { saveLineResult, hasLineResultImproved };
};
