import type { InputMode } from "lyrics-typing-engine";
import { medianIgnoringZeros } from "@/utils/array";
import type { TypingLineResults } from "@/validator/result";
import type { BuiltMapLineWithOption } from "../types";

export function buildInitialLineResult(
  builtMapLines: BuiltMapLineWithOption[],
  inputMode: InputMode,
): TypingLineResults {
  const initialLineResultData: TypingLineResults = [];

  for (const line of builtMapLines) {
    if (line.notes.roma > 0) {
      initialLineResultData.push({
        status: {
          p: 0,
          tBonus: 0,
          lType: 0,
          lMiss: 0,
          lRkpm: 0,
          lKpm: 0,
          lostW: null,
          lLost: 0,
          combo: 0,
          tTime: 0,
          mode: inputMode,
          sp: 1,
        },
        types: [],
      });
    } else {
      initialLineResultData.push({
        status: {
          combo: 0,
          tTime: 0,
          mode: inputMode,
          sp: 1,
        },
        types: [],
      });
    }
  }

  return initialLineResultData;
}

export function extractTypingLineIndexes(builtMapLines: BuiltMapLineWithOption[]): number[] {
  const typingLineIndexes: number[] = [];

  for (const [index, line] of builtMapLines.entries()) {
    if (line.notes.roma > 0) {
      typingLineIndexes.push(index);
    }
  }

  return typingLineIndexes;
}

export function extractChangeCSSIndexes(builtMapLines: BuiltMapLineWithOption[]): number[] {
  const changeCSSIndexes: number[] = [];

  for (const [index, line] of builtMapLines.entries()) {
    if (line.options?.isChangeCSS) {
      changeCSSIndexes.push(index);
    }
  }

  return changeCSSIndexes;
}

export const getStartLine = (builtMapLines: BuiltMapLineWithOption[]) => {
  if (!builtMapLines[0]) {
    throw new Error("builtMapLines is empty: cannot find start line");
  }

  for (const [index, line] of builtMapLines.entries()) {
    if (line.notes.roma > 0) {
      return { ...line, index };
    }
  }

  return { ...builtMapLines[0], index: builtMapLines.length - 1 };
};

export const calculateSpeedDifficulty = (lines: BuiltMapLineWithOption[]) => {
  const romaSpeedList = lines.map((line) => line.kpm.roma);
  const kanaSpeedList = lines.map((line) => line.kpm.kana);

  const romaMedianSpeed = medianIgnoringZeros(romaSpeedList);
  const kanaMedianSpeed = medianIgnoringZeros(kanaSpeedList);
  const romaMaxSpeed = Math.max(...romaSpeedList);
  const kanaMaxSpeed = Math.max(...kanaSpeedList);

  return {
    median: { r: romaMedianSpeed, k: kanaMedianSpeed },
    max: { r: romaMaxSpeed, k: kanaMaxSpeed },
  };
};

export const calculateTotalNotes = (typingWords: BuiltMapLineWithOption[]) => {
  return typingWords.reduce(
    (acc, line) => {
      acc.kana += line.notes.kana;
      acc.roma += line.notes.roma;
      return acc;
    },
    { kana: 0, roma: 0 },
  );
};

export const calculateKeyAndMissRates = ({ romaTotalNotes }: { romaTotalNotes: number }) => {
  const keyRate = 100 / romaTotalNotes;
  const missRate = keyRate / 2;

  return { keyRate, missRate };
};

export const calculateDuration = (builtMapLines: BuiltMapLineWithOption[]): number => {
  const endLine = builtMapLines.findLast((line) => line.lyrics === "end");
  if (endLine) return endLine.time;

  const lastLine = builtMapLines[builtMapLines.length - 1];
  return lastLine?.time ?? 0;
};

export const hasAlphabetChunk = (builtMapLines: BuiltMapLineWithOption[]): boolean =>
  builtMapLines.some((line) => line.wordChunks.some((chunk) => chunk.type === "alphabet"));