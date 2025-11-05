import { dispatchEditHistory } from "./history-reducer";
import { setMapAction } from "./map-reducer";
import {
  dispatchLine,
  resetCreatorId,
  resetMapId,
  resetUtilityParams,
  resetYTPlayer,
  resetYTPlayerStatus,
} from "./state";

export const pathChangeAtomReset = () => {
  resetYTPlayerStatus();
  resetUtilityParams();
  resetYTPlayer();
  resetMapId();
  resetCreatorId();
  setMapAction({ type: "reset" });
  dispatchLine({ type: "reset" });
  dispatchEditHistory({ type: "reset" });
};
