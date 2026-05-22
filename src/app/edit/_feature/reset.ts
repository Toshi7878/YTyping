import { dispatchEditHistory } from "./map-table/history";
import { resetRawMap } from "./map-table/map-reducer";
import { dispatchLine } from "./tabs/editor/select-line-input";
import { YTPlayer } from "./youtube-player";

export const pathChangeAtomReset = () => {
  YTPlayer.reset();
  resetRawMap();
  dispatchLine({ type: "reset" });
  dispatchEditHistory({ type: "reset" });
};
