import { readMap } from "../atoms/map-reducer";
import { dispatchLine, readSelectLine, readUtilityParams, seekYTPlayer } from "../atoms/state";
import { scrollMapTable } from "./scroll-map-table";

export const moveLine = (type: "next" | "prev") => {
  const { directEditingIndex } = readUtilityParams();

  const { selectIndex } = readSelectLine();
  if (selectIndex !== null && !directEditingIndex) {
    const seekCount = selectIndex + (type === "next" ? 1 : -1);
    const seekLine = readMap()[seekCount];
    if (seekLine) {
      seekYTPlayer(Number(seekLine.time));
      dispatchLine({
        type: "set",
        line: {
          time: seekLine.time,
          lyrics: seekLine.lyrics,
          word: seekLine.word,
          selectIndex: seekCount,
        },
      });
      scrollMapTable({ rowIndex: seekCount });
    }
  }
};
