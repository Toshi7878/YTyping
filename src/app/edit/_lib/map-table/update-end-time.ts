import { readMap, setMapAction } from "../atoms/map-reducer";

export const updateEndTime = (player: YT.Player) => {
  const duration = player.getDuration();
  if (!duration) return;

  const map = readMap();
  const endLineIndex = map.findLastIndex((item) => item.lyrics === "end");
  const endLine = {
    time: duration.toFixed(3),
    lyrics: "end",
    word: "",
  };

  if (endLineIndex === -1) {
    setMapAction({ type: "add", payload: endLine });
  } else {
    setMapAction({ type: "update", payload: endLine, index: endLineIndex });
  }
};
