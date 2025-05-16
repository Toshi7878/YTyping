import { MapLine } from "@/types/map";
import { useGenerateTokenizedWords } from "./repl";

const REGEX_LIST = ["[^-ぁ-んゔ", "ァ-ンヴ", "一-龥", "\\w", "\\d", " ", "々%&@&=+ー～~\u00C0-\u00FF"];
const HANGUL = ["\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uFFA0-\uFFDC\uFFA0-\uFFDC"];
const CYRILLIC_ALPHABET = ["\u0400-\u04FF]"];

const LYRICS_FORMAT_REGEX = REGEX_LIST.concat(HANGUL).concat(CYRILLIC_ALPHABET).join(""); // TODO: .concat(this.customRegex);

const MIN_LINE_SECONDS = 5;

export const useParseImeMap = () => {
  const generateTokenizedWords = useGenerateTokenizedWords();

  return async (mapData: MapLine[]) => {
    let lineWords: string[] = [];
    let lineTimes: number[] = [];
    const lines: { time: number; word: string }[][] = [];

    for (let i = 0; i < mapData.length; i++) {
      const line = mapData[i];
      const nextLine = mapData[i + 1];
      const nextToNextLine = mapData[i + 2];
      const formattedLyrics = formatLyrics(deleteRubyTag(line.lyrics));

      const isTypingLine = isValidTypingLine(formattedLyrics, line.word);

      if (isTypingLine) {
        if (lineWords.length !== 0 && lineWords[lineWords.length - 1] !== "") {
          // lineWords = addSpaceToLastChar(lineWords);
        }

        lineWords.push(formattedLyrics);
        lineTimes.push(Number(line.time));
      }

      const nextTime = getNextTime(nextLine, nextToNextLine);

      const shouldBreakLine = shouldCreateNewLine(lineWords, nextLine, nextTime, lineTimes);

      if (shouldBreakLine) {
        const lastTime = nextLine ? Number(nextLine.time) : lineTimes[lineTimes.length - 1] + 10; // 次の行がない場合は10秒後
        lineTimes.push(lastTime);
        lineWords.push("");

        //   const prevDisplayLyrics = displayLyrics[displayLyrics.length - 1];

        //   if (prevDisplayLyrics) {
        //     connectWithPreviousLyrics(displayLyrics, lineTimes);
        //   }

        const line = lineWords.map((word, index) => ({ time: lineTimes[index], word }));

        lines.push(line);

        lineWords = [];
        lineTimes = [];
      }
    }

    const words = await generateTokenizedWords(
      lines.map((line) => {
        return line
          .map((chunk) => chunk.word.split(" "))
          .flat()
          .filter((char) => char !== "");
      })
    );

    return { lines, words };
  };
};

const isValidTypingLine = (formattedLyrics: string, word: string): boolean => {
  return formattedLyrics !== "" && formattedLyrics !== "end" && word.replace(/\s/g, "") !== "";
};

const getNextTime = (nextLine: MapLine | undefined, lineAfterNext: MapLine | undefined): number => {
  if (!nextLine) return 0;

  return lineAfterNext && nextLine.word.replace(/\s/g, "") === "" ? Number(lineAfterNext.time) : Number(nextLine.time);
};

const shouldCreateNewLine = (
  lineChars: string[],
  nextLine: MapLine | undefined,
  nextTime: number,
  lineTimes: number[]
): boolean => {
  return lineChars.length > 0 && (!nextLine || MIN_LINE_SECONDS < nextTime - lineTimes[0]);
};

// const connectWithPreviousLyrics = (
//   displayLyrics: { times: number[]; chars: string[] }[],
//   lineTimes: number[]
// ): void => {
//   const prevLastTime = prevDisplayLyrics.times[prevDisplayLyrics.times.length - 1];

//   if (prevLastTime !== lineTimes[0]) {
//     if (!prevDisplayLyrics.times) {
//       prevDisplayLyrics.times = [];
//     }
//     if (!prevDisplayLyrics.chars) {
//       prevDisplayLyrics.chars = [];
//     }

//     prevDisplayLyrics.times.push(lineTimes[0]);
//     prevDisplayLyrics.chars.push("");
//   }
// };

/**
 *
 * @param param0 英語のスペースを判定に含める関数
 * @returns
 */
const insertSpacesEng = (comparison: string[]): string[] => {
  if (!false) return comparison; // 設定を追加する

  for (let i = 0; i < comparison.length; i++) {
    const isHalfWidth = /^[!-~]*$/.test(comparison[i]);
    const nextChar = comparison[i + 1];

    if (isHalfWidth && nextChar && /^[!-~]*$/.test(nextChar[0])) {
      comparison[i] = comparison[i] + " ";
    }
  }

  return comparison;
};

const deleteRubyTag = (text: string) => {
  const ruby_convert = text.match(/<*ruby(?: .+?)?>.*?<.*?\/ruby*>/g);
  if (ruby_convert) {
    for (let v = 0; v < ruby_convert.length; v++) {
      const start = ruby_convert[v].indexOf(">") + 1;
      const end = ruby_convert[v].indexOf("<rt>");
      const ruby = ruby_convert[v].slice(start, end);
      text = text.replace(ruby_convert[v], ruby);
    }
  }
  return text;
};

const formatLyrics = (text: string) => {
  text = text.replace(/<[^>]*?style>[\s\S]*?<[^>]*?\/style[^>]*?>/g, ""); //styleタグ全体削除
  text = text.replace(/[（\(].*?[\)）]/g, ""); //()（）の歌詞を削除
  text = text.replace(/<[^>]*>(.*?)<[^>]*?\/[^>]*>/g, "$1"); //HTMLタグの中の文字を取り出す

  text = text.replace(/<[^>]*>/, ""); //単体のHTMLタグを削除

  text = normalizeSymbols(text); //記号整形

  //   if (lrcSettingData["lrc-eng-case-sensitive"].data) {
  //     text = text.normalize("NFKC"); //全角を半角に変換
  //   } else {
  text = text.normalize("NFKC").toLowerCase(); //全角を半角に変換 & 小文字に変換;
  //   }

  // アルファベットと全角文字の間にスペースを追加
  text = text.replace(/([a-zA-Z])([ぁ-んゔァ-ンヴ一-龥])/g, "$1 $2"); // アルファベットの後に日本語文字がある場合
  text = text.replace(/([ぁ-んゔァ-ンヴ一-龥])([a-zA-Z])/g, "$1 $2"); // 日本語文字の後にアルファベットがある場合

  text = text.replace(new RegExp(LYRICS_FORMAT_REGEX, "g"), ""); //regexListに含まれていない文字を削除

  return text;
};

const normalizeSymbols = (text: string) => {
  return text
    .replace(/…/g, "...")
    .replace(/‥/g, "..")
    .replace(/･/g, "・")
    .replace(/〜/g, "～")
    .replace(/｢/g, "「")
    .replace(/｣/g, "」")
    .replace(/､/g, "、")
    .replace(/｡/g, "。")
    .replace(/－/g, "ー");
};
