import { zip } from "@/utils/array";
import { countKanaWordWithDakuonSplit } from "@/utils/kana";
import type { MapLine } from "@/validator/map-json";
import type { BuiltMapLine, TypeChunk } from "../../app/(typing)/type/_lib/type";
import { generateTypingWord } from "./generate-typing-word";
import { sentenceToKanaChunkWords } from "./sentence-to-kana-chunk-words";

export const CHAR_POINT = 50;
export const MISS_PENALTY = CHAR_POINT / 2;

export const buildMap = (mapJson: MapLine[]): BuiltMapLine[] => {
  const wordsData: BuiltMapLine[] = [];
  let lineLength = 0;

  const kanaChunkWords = sentenceToKanaChunkWords(mapJson.map((line) => line.word).join("\n"));
  for (const [i, [mapLine, kanaChunkWord]] of zip(mapJson, kanaChunkWords).entries()) {
    const line = {
      time: Number(mapLine.time),
      lyrics: mapLine.lyrics,
      kanaWord: kanaChunkWord.join(""),
      options: mapLine.options,
      word: generateTypingWord(kanaChunkWord),
    };

    const hasWord = !!kanaChunkWord.length;
    const nextLine = mapJson[i + 1];
    if (hasWord && line.lyrics !== "end" && nextLine) {
      lineLength++;

      const notes = calcLineNotes(line.word);
      wordsData.push({
        kpm: calcLineKpm({ notes, lineDuration: Number(nextLine.time) - line.time }),
        notes,
        lineCount: lineLength,
        ...line,
      });
    } else {
      wordsData.push({
        kpm: { kana: 0, roma: 0 },
        notes: { kana: 0, roma: 0 },
        ...line,
      });
    }
  }

  return wordsData;
};

const calcLineKpm = ({ notes, lineDuration: remainTime }: { notes: BuiltMapLine["notes"]; lineDuration: number }) => {
  const romaKpm = Math.max(1, Math.floor((notes.roma / remainTime) * 60));
  const kanaKpm = Math.max(1, Math.floor((notes.kana / remainTime) * 60));
  return { roma: romaKpm, kana: kanaKpm };
};

const calcLineNotes = (word: TypeChunk[]) => {
  const kanaWord = word.map((item) => item.k).join("");
  const kanaNotes = countKanaWordWithDakuonSplit({ kanaWord });
  const romaNotes = word.map((item) => item.r[0]).join("").length;

  return { kana: kanaNotes, roma: romaNotes };
};
