import { Action, Dispatch } from "@reduxjs/toolkit";
import iconv from "iconv-lite";
import jschardet from "jschardet";
import { setMapData } from "../../../redux/mapDataSlice";
import { RootState } from "../../../redux/store";

export class ImportFile {
  async open(
    file: File,
    wordConvert: (lyrics: string) => Promise<string>,
    dispatch: Dispatch<Action>,
    mapData: RootState["mapData"]["value"]
  ) {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);

    let data = await new Promise((resolve) => {
      fileReader.onload = (event: ProgressEvent<FileReader>) =>
        resolve((event.target as FileReader).result);
    });

    const buffer = Buffer.from(new Uint8Array(data as ArrayBuffer));
    const detected = jschardet.detect(buffer);
    const decodedData = iconv.decode(buffer, detected.encoding);

    if (file.name.endsWith(".lrc")) {
      const lrc = decodedData.split("\r\n");
      const convertedData = await Convert.lrc(lrc, wordConvert, mapData);
      dispatch(setMapData(convertedData));
    } else {
      const convertedData = await Convert.json(JSON.parse(decodedData).map, mapData);
      dispatch(setMapData(convertedData));
    }
  }
}

type JsonMap = [string, string, string];
class Convert {
  static json(jsonMap: JsonMap, mapData: RootState["mapData"]["value"]) {
    const result: RootState["mapData"]["value"] = [{ time: "0", lyrics: "", word: "" }];

    for (let i = 0; i < jsonMap.length; i++) {
      const lyrics = jsonMap[i][1];
      const time = jsonMap[i][0] === "0" ? "0.001" : jsonMap[i][0];
      const word = jsonMap[i][2];

      if ((time === "0" && word === "" && lyrics === "") || lyrics === "end") {
        continue;
      }

      result.push({ time, lyrics, word });
    }

    result.push(mapData[mapData.length - 1]);

    return result;
  }

  static async lrc(
    lrc: string[],
    wordConvert: (lyrics: string) => Promise<string>,
    mapData: RootState["mapData"]["value"]
  ) {
    const result: RootState["mapData"]["value"] = [{ time: "0", lyrics: "", word: "" }];
    for (let i = 0; i < lrc.length; i++) {
      const timeTagMatch = lrc[i].match(/\[\d\d:\d\d.\d\d\]/);

      if (timeTagMatch) {
        const timeTag = timeTagMatch[0].match(/\d\d/g);
        const minute = +timeTag![0];
        const second = +timeTag![1];
        const minSec = +timeTag![2];

        const time = (minute * 60 + second + minSec * 0.01).toString();
        const lyrics = lrc[i].replace(/\[\d\d:\d\d.\d\d\]/g, "").trim();
        const word = (await wordConvert(lyrics)) ?? "";

        result.push({ time, lyrics, word });
      }
    }

    result.push(mapData[mapData.length - 1]);

    return result;
  }
}
