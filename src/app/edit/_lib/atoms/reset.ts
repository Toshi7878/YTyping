import { dispatchEditHistory } from "./history-reducer";
import { setMapAction } from "./map-reducer";
import { dispatchLine, resetUtilityParams, resetYTPlayer, resetYTPlayerStatus } from "./state";

export const pathChangeAtomReset = () => {
  resetYTPlayerStatus();
  resetUtilityParams();
  resetYTPlayer();
  setMapAction({ type: "reset" });
  dispatchLine({ type: "reset" });
  dispatchEditHistory({ type: "reset" });
};
