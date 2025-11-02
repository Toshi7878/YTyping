import iconv from "iconv-lite";
import jschardet from "jschardet";
import { useMapReducer, useReadMap } from "@/app/edit/_lib/atoms/map-reducer-atom";
import { usePlayer } from "@/app/edit/_lib/atoms/read-atoms";
import { useWordConverter } from "@/app/edit/_lib/editor/typable-word-converter";
import type { MapLine } from "@/server/drizzle/validator/map-json";
import { normalizeSymbols } from "@/utils/string-transform";
import { useHistoryReducer } from "../atoms/history-reducer-atom";

export const useImportMapFile = () => {
  const mapDispatch = useMapReducer();
  const historyDispatch = useHistoryReducer();
  const readMap = useReadMap();
  const lrcConverter = useLrcConverter();
  const jsonConverter = useJsonConverter();

  return async (file: File) => {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);

    const data = await new Promise((resolve) => {
      fileReader.onload = (event: ProgressEvent<FileReader>) => resolve((event.target as FileReader).result);
    });

    const buffer = Buffer.from(new Uint8Array(data as ArrayBuffer));
    const detected = jschardet.detect(buffer);
    const decodedData = iconv.decode(buffer, detected.encoding);

    if (file.name.endsWith(".lrc")) {
      const lrc = decodedData.split(/\r\n|\n/);
      const convertedData = await lrcConverter(lrc);
      historyDispatch({
        type: "add",
        payload: { actionType: "replaceAll", data: { old: readMap(), new: convertedData } },
      });
      mapDispatch({ type: "replaceAll", payload: convertedData });
    } else {
      const convertedData = jsonConverter(JSON.parse(decodedData).map);
      historyDispatch({
        type: "add",
        payload: { actionType: "replaceAll", data: { old: readMap(), new: convertedData } },
      });
      mapDispatch({ type: "replaceAll", payload: convertedData });
    }
  };
};
type JsonMap = [string, string, string];

function useJsonConverter() {
  const { readPlayer } = usePlayer();

  return (jsonMap: JsonMap) => {
    const result: MapLine[] = [{ time: "0", lyrics: "", word: "" }];

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

    result.push({ time: readPlayer().getDuration().toFixed(3), lyrics: "end", word: "" });

    return result;
  };
}

function useLrcConverter() {
  const wordConvert = useWordConverter();
  const { readPlayer } = usePlayer();
  return async (lrc: string[]) => {
    const result: MapLine[] = [{ time: "0", lyrics: "", word: "" }];
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

    result.push({ time: readPlayer().getDuration().toFixed(3), lyrics: "end", word: "" });

    return result;
  };
}
