import type { BuiltMapLine, InputMode } from "lyrics-typing-engine";
import type z from "zod/v4";
import { medianIgnoringZeros } from "@/utils/array";
import type { LineOptionSchema } from "@/validator/map/raw-map-json";
import type { TypingLineResult } from "@/validator/result/result";

export type BuiltMapLineWithOption = BuiltMapLine<z.infer<typeof LineOptionSchema>>;

export function buildInitialLineResult(
  builtMapLines: BuiltMapLineWithOption[],
  inputMode: InputMode,
): TypingLineResult[] {
  const initialLineResultData: TypingLineResult[] = [];

  for (const line of builtMapLines) {
    if (line.notes.roma > 0) {
      initialLineResultData.push({
        status: {
          point: 0,
          timeBonus: 0,
          typeCount: 0,
          missCount: 0,
          rkpm: 0,
          kpm: 0,
          lostWord: null,
          lostCount: 0,
          combo: 0,
          typingTime: 0,
          mode: inputMode,
          speed: 1,
        },
        types: [],
      });
    } else {
      initialLineResultData.push({
        status: {
          combo: 0,
          typingTime: 0,
          mode: inputMode,
          speed: 1,
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

export const calcChunkCounts = (
  builtMapLines: BuiltMapLineWithOption[],
): {
  kanaChunkCount: number;
  alphabetChunkCount: number;
  numChunkCount: number;
  spaceChunkCount: number;
  symbolChunkCount: number;
} => {
  const counts = {
    kanaChunkCount: 0,
    alphabetChunkCount: 0,
    numChunkCount: 0,
    spaceChunkCount: 0,
    symbolChunkCount: 0,
  };

  for (const line of builtMapLines) {
    for (const chunk of line.wordChunks) {
      if (chunk.type === "kana") counts.kanaChunkCount++;
      else if (chunk.type === "alphabet") counts.alphabetChunkCount++;
      else if (chunk.type === "num") counts.numChunkCount++;
      else if (chunk.type === "space") counts.spaceChunkCount++;
      else if (chunk.type === "symbol") counts.symbolChunkCount++;
    }
  }

  return counts;
};

export const calcChunkRatios = ({
  kanaChunkCount,
  alphabetChunkCount,
  numChunkCount,
  spaceChunkCount,
  symbolChunkCount,
}: {
  kanaChunkCount: number;
  alphabetChunkCount: number;
  numChunkCount: number;
  spaceChunkCount: number;
  symbolChunkCount: number;
}): { kanaRatio: number; alphabetRatio: number; otherRatio: number } => {
  const otherChunkCount = numChunkCount + spaceChunkCount + symbolChunkCount;
  const total = kanaChunkCount + alphabetChunkCount + otherChunkCount;

  if (total === 0) {
    return { kanaRatio: 0, alphabetRatio: 0, otherRatio: 0 };
  }

  return {
    kanaRatio: kanaChunkCount / total,
    alphabetRatio: alphabetChunkCount / total,
    otherRatio: otherChunkCount / total,
  };
};
