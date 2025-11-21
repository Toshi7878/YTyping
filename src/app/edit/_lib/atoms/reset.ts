import { dispatchEditHistory } from "./history-reducer";
import { resetMap } from "./map-reducer";
import { dispatchLine, resetUtilityParams, resetYTPlayer, resetYTPlayerStatus } from "./state";

export const pathChangeAtomReset = () => {
  resetYTPlayerStatus();
  resetUtilityParams();
  resetYTPlayer();
  resetMap();
  dispatchLine({ type: "reset" });
  dispatchEditHistory({ type: "reset" });
};
