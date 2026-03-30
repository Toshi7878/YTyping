import { readRawMap, setRawMapAction } from "@/app/edit/_lib/atoms/map-reducer";
import { normalizeSymbols } from "@/utils/string-transform";
import type { RawMapLine } from "@/validator/map/raw-map-json";
import { dispatchEditHistory } from "../atoms/history-reducer";
import { getYTDuration } from "../atoms/youtube-player";
import { wordConvert } from "./typable-word-convert";

export const importMapFromJsonText = (text: string) => {
  const convertedData = jsonConverter(JSON.parse(text).map);
  dispatchEditHistory({
    type: "add",
    payload: { actionType: "replaceAll", data: { old: readRawMap(), new: convertedData } },
  });
  setRawMapAction({ type: "replaceAll", payload: convertedData });
};

export const importMapFromLrcText = async (text: string) => {
  const lrc = text.split(/\r\n|\n/);
  const convertedData = await lrcConverter(lrc);
  dispatchEditHistory({
    type: "add",
    payload: { actionType: "replaceAll", data: { old: readRawMap(), new: convertedData } },
  });
  setRawMapAction({ type: "replaceAll", payload: convertedData });
};

type JsonMap = [string, string, string];

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
