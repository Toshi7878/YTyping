import { dispatchEditHistory } from "./history-reducer";
import { resetRawMap } from "./map-reducer";
import { dispatchLine, resetUtilityParams, resetYTPlayer, resetYTPlayerStatus } from "./state";

export const pathChangeAtomReset = () => {
  resetYTPlayerStatus();
  resetUtilityParams();
  resetYTPlayer();
  resetRawMap();
  dispatchLine({ type: "reset" });
  dispatchEditHistory({ type: "reset" });
};
