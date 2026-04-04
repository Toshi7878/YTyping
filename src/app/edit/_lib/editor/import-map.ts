import { readRawMap, setRawMapAction } from "@/app/edit/_lib/atoms/map-reducer";
import { normalizeSymbols } from "@/utils/string-transform";
import type { RawMapLine } from "@/validator/map/raw-map-json";
import { dispatchEditHistory } from "../atoms/history-reducer";
import { getYTDuration } from "../atoms/youtube-player";
import { wordConvert } from "./typable-word-convert";

/** time / lyrics / word を持つオブジェクト行 */
type TimelineObjectRow = { time: unknown; lyrics?: unknown; word?: unknown };

function isTimelineObjectRow(value: unknown): value is TimelineObjectRow {
  return typeof value === "object" && value !== null && "time" in value;
}

function normalizeImportedTime(value: unknown): string {
  if (typeof value === "number") {
    return value === 0 ? "0.001" : String(value);
  }
  const s = String(value ?? "");
  return s === "0" ? "0.001" : s;
}

const normalizeString = (value: unknown): string => {
  return String(value);
};

const timelineObjectArrayConverter = async (rows: TimelineObjectRow[]) => {
  const result: RawMapLine[] = [{ time: "0", lyrics: "", word: "" }];

  for (const row of rows) {
    const time = normalizeImportedTime(row.time);
    if (!time) continue;
    const lyrics = normalizeString(row.lyrics);
    const word = normalizeString(row.word);

    if ((time === "0" && word === "" && lyrics === "") || lyrics === "end") {
      continue;
    }

    result.push({ time, lyrics, word });
  }

  result.push({ time: getYTDuration()?.toFixed(3) ?? "0", lyrics: "end", word: "" });

  return result;
};

export const importMapFromJsonText = async (text: string) => {
  const parsed: unknown = JSON.parse(text);
  let convertedData: RawMapLine[];

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) {
      throw new Error("JSON 配列が空です");
    }
    if (isTimelineObjectRow(parsed[0])) {
      convertedData = await timelineObjectArrayConverter(parsed);
    } else if (Array.isArray(parsed[0])) {
      convertedData = jsonConverter(parsed as JsonMap);
    } else {
      throw new Error("未対応の JSON 配列形式です（オブジェクト行か [秒,歌詞,word] のタプル行を指定してください）");
    }
  } else if (parsed && typeof parsed === "object" && "map" in parsed) {
    const map = (parsed as { map: unknown }).map;
    if (!Array.isArray(map) || map.length === 0) {
      throw new Error("map が空か不正です");
    }
    if (isTimelineObjectRow(map[0])) {
      convertedData = await timelineObjectArrayConverter(map);
    } else {
      convertedData = jsonConverter(map as JsonMap);
    }
  } else {
    throw new Error("JSON は [{ time, lyrics, word }, ...] か { map: ... } である必要があります");
  }

  dispatchEditHistory({
    type: "add",
    payload: { actionType: "replaceAll", data: { old: readRawMap(), new: convertedData } },
  });
  setRawMapAction({ type: "replaceAll", payload: convertedData });
};

/** textarea 先頭が JSON オブジェクト／配列なら true。LRC の [mm:ss.xx] 行は [ の次が数字のため false。 */
export function isImportTextLikelyJson(text: string): boolean {
  const t = text.replace(/^\uFEFF/, "").trimStart();
  if (t.startsWith("{")) return true;
  if (!t.startsWith("[")) return false;
  let i = 1;
  while (i < t.length) {
    const ch = t[i];
    if (ch === undefined || !/\s/.test(ch)) break;
    i++;
  }
  const c = i < t.length ? t[i] : undefined;
  if (c === undefined) return false;
  // LRC 行は [00:00.00] のように [ の直後が数字
  if (/\d/.test(c)) return false;
  return c === "{" || c === "[" || c === '"';
}

/** 上記判別に基づき LRC または JSON としてインポートする */
export async function importMapFromTextAutoDetect(text: string): Promise<void> {
  if (isImportTextLikelyJson(text)) {
    await importMapFromJsonText(text);
  } else {
    await importMapFromLrcText(text);
  }
}

export const importMapFromLrcText = async (text: string) => {
  const lrc = text.split(/\r\n|\n/);
  const convertedData = await lrcConverter(lrc);
  dispatchEditHistory({
    type: "add",
    payload: { actionType: "replaceAll", data: { old: readRawMap(), new: convertedData } },
  });
  setRawMapAction({ type: "replaceAll", payload: convertedData });
};

type JsonMap = [string, string, string][];

const jsonConverter = (jsonMap: JsonMap) => {
  const result: RawMapLine[] = [{ time: "0", lyrics: "", word: "" }];

  for (const line of jsonMap) {
    const time = line[0] === "0" ? "0.001" : line[0];
    if (!time) continue;
    const lyrics = normalizeSymbols(line[1] ?? "");
    const word = normalizeSymbols(line[2] ?? "");

    if ((time === "0" && word === "" && lyrics === "") || lyrics === "end") {
      continue;
    }

    result.push({ time, lyrics, word });
  }

  result.push({ time: getYTDuration()?.toFixed(3) ?? "0", lyrics: "end", word: "" });

  return result;
};

const lrcConverter = async (lrc: string[]) => {
  const result: RawMapLine[] = [{ time: "0", lyrics: "", word: "" }];
  for (const line of lrc) {
    const matchedTimeTags = line.match(/\[\d\d.\d\d.\d\d\]/);

    if (matchedTimeTags) {
      const matchedTimeTag = matchedTimeTags[0].match(/\d\d/g);
      if (!matchedTimeTag) continue;
      const minute = Number(matchedTimeTag[0]);
      const second = Number(matchedTimeTag[1]);
      const minSec = Number(matchedTimeTag[2]);

      const time = (minute * 60 + second + minSec * 0.01).toString();
      const lyrics = normalizeSymbols(line.replace(/\[\d\d.\d\d.\d\d\]/g, ""));
      const word = (await wordConvert(lyrics)) ?? "";

      result.push({ time, lyrics, word });
    }
  }

  result.push({ time: getYTDuration()?.toFixed(3) ?? "0", lyrics: "end", word: "" });

  return result;
};
