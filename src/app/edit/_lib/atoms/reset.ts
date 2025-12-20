import { dispatchEditHistory } from "./history-reducer";
import { resetRawMap } from "./map-reducer";
import { dispatchLine, resetUtilityParams, resetYTPlayerStatus } from "./state";
import { resetYTPlayer } from "./youtube-player";

export const pathChangeAtomReset = () => {
  resetYTPlayerStatus();
  resetUtilityParams();
  resetYTPlayer();
  resetRawMap();
  dispatchLine({ type: "reset" });
  dispatchEditHistory({ type: "reset" });
};
