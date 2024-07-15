import { Ticker } from "@pixi/ticker";
import { timer } from "../../(ts)/timer";
import { RefsContextType } from "../../(contexts)/refsProvider";
import { Line } from "@/types";
import { SceneType, StatusRef, YTStateRef } from "../../(ts)/type";
export const ticker = new Ticker();

export let updateFunction;
class YTState {
  play(
    scene: SceneType,
    setScene: React.Dispatch<React.SetStateAction<SceneType>>,
    YTStateRef: React.RefObject<YTStateRef>,
    setNotify: React.Dispatch<React.SetStateAction<string>>,
  ) {
    console.log("再生 1");
    if (scene !== "end") {
      setScene("playing");
    }

    const isPaused = YTStateRef.current!.isPaused;

    if (isPaused) {
      YTStateRef.current!.isPaused = false;
      ticker.start();
      setNotify("▶");
    }
  }

  end(setScene: React.Dispatch<React.SetStateAction<SceneType>>) {
    console.log("プレイ終了");
    setScene("end");

    ticker.stop();
  }

  stop() {
    console.log("動画停止");
    ticker.stop();
  }

  pause(
    YTStateRef: React.RefObject<YTStateRef>,
    setNotify: React.Dispatch<React.SetStateAction<string>>,
  ) {
    console.log("一時停止");
    ticker.stop();

    const isPaused = YTStateRef.current!.isPaused;
    if (isPaused) {
      YTStateRef.current!.isPaused = true;
      setNotify("ll");
    }
  }

  seek(target: any, statusRef: React.RefObject<StatusRef>) {
    const time = target.getCurrentTime();

    if (time === 0) {
      statusRef.current!.status.count = 0;
    }
    console.log("シーク");
  }

  ready(refs: RefsContextType) {
    console.log("ready");

    refs.playerRef.current.setVolume(30);
    updateFunction = () => timer.update(refs.playerRef);

    ticker.add(updateFunction);
  }
}

function seekTimeIndex(time: number, mapData: Line[]) {
  let count = 0;

  for (let i = 0; i < mapData.length; i++) {
    if (Number(mapData[i]["time"]) - time >= 0) {
      count = i - 1;
      break;
    }
  }

  if (count < 0) {
    count = 0;
  }

  return count;
}

export const ytState = new YTState();
