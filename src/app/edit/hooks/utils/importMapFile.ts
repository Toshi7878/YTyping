import { useMapReducer, useMapStateRef } from "@/app/edit/atoms/mapReducerAtom";
import { usePlayer } from "@/app/edit/atoms/refAtoms";
import { useWordConverter } from "@/app/edit/hooks/utils/useWordConverter";
import { MapLine } from "@/types/map";
import iconv from "iconv-lite";
import jschardet from "jschardet";
import { useHistoryReducer } from "../../atoms/historyReducerAtom";

export const useImportMapFile = () => {
  const mapDispatch = useMapReducer();
  const historyDispatch = useHistoryReducer();
  const readMap = useMapStateRef();
  const lrcConverter = useLrcConverter();
  const jsonConverter = useJsonConverter();

  return async (file: File) => {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);

    let data = await new Promise((resolve) => {
      fileReader.onload = (event: ProgressEvent<FileReader>) => resolve((event.target as FileReader).result);
    });

    const buffer = Buffer.from(new Uint8Array(data as ArrayBuffer));
    const detected = jschardet.detect(buffer);
    const decodedData = iconv.decode(buffer, detected.encoding);

    if (file.name.endsWith(".lrc")) {
      const lrc = decodedData.split("\r\n");
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

    for (let i = 0; i < jsonMap.length; i++) {
      const lyrics = jsonMap[i][1];
      const time = jsonMap[i][0] === "0" ? "0.001" : jsonMap[i][0];
      const word = jsonMap[i][2];

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
    for (let i = 0; i < lrc.length; i++) {
      const timeTagMatch = lrc[i].match(/\[\d\d.\d\d.\d\d\]/);

      if (timeTagMatch) {
        const timeTag = timeTagMatch[0].match(/\d\d/g);
        const minute = +timeTag![0];
        const second = +timeTag![1];
        const minSec = +timeTag![2];

        const time = (minute * 60 + second + minSec * 0.01).toString();
        const lyrics = lrc[i].replace(/\[\d\d.\d\d.\d\d\]/g, "").trim();
        const word = (await wordConvert(lyrics)) ?? "";

        result.push({ time, lyrics, word });
      }
    }

    result.push({ time: readPlayer().getDuration().toFixed(3), lyrics: "end", word: "" });

    return result;
  };
}
