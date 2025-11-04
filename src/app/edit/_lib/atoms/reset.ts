import { dispatchEditHistory } from "./history-reducer";
import { mapAction } from "./map-reducer";
import { dispatchLine, resetUtilityParams, resetYTPlayerStatus } from "./state";

export const usePathChangeAtomReset = () => {
  return () => {
    resetYTPlayerStatus();
    resetUtilityParams();
    mapAction({ type: "reset" });
    dispatchLine({ type: "reset" });
    dispatchEditHistory({ type: "reset" });
  };
};
