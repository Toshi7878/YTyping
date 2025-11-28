import { clearAllLineResult } from "./family";
import { resetLineCount, resetLineSubstatus, resetSubstatus, resetUtilityRefParams } from "./ref";
import { resetSpeed } from "./speed-reducer";
import {
  resetBuiltMap,
  resetCurrentLine,
  resetReplayRankingResult,
  resetSubstatusState,
  resetTypingStatus,
  resetUtilityParams,
} from "./state";
import { resetYTPlayer } from "./yt-player";

export const resetAllStateOnCleanup = () => {
  resetYTPlayer();
  resetCurrentLine();
  clearAllLineResult();
  resetUtilityParams();
  resetSpeed();
  resetBuiltMap();
  resetTypingStatus();
  resetUtilityRefParams();
  resetSubstatusState();
  resetSubstatus();
  resetLineSubstatus();
  resetLineCount();
  resetReplayRankingResult();
};
