import { clearAllLineResult } from "./family";
import { resetLineCount, resetLineSubstatus, resetSubstatus, resetUtilityRefParams, resetYTPlayer } from "./ref";
import { resetSpeed } from "./speed-reducer";
import {
  resetBuiltMap,
  resetCurrentLine,
  resetMapId,
  resetSubstatusState,
  resetTypingStatus,
  resetUtilityParams,
} from "./state";

export const resetAllStateOnCleanup = () => {
  resetYTPlayer();
  resetCurrentLine();
  clearAllLineResult();
  resetMapId();
  resetUtilityParams();
  resetSpeed();
  resetBuiltMap();
  resetTypingStatus();
  resetUtilityRefParams();
  resetSubstatusState();
  resetSubstatus();
  resetLineSubstatus();
  resetLineCount();
};
