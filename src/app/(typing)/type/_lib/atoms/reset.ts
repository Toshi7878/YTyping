import { clearAllLineResult } from "./family";
import { resetLineCount, resetLineSubstatus, resetSubstatus, resetUtilityRefParams } from "./ref";
import { resetSpeed } from "./speed-reducer";
import { resetBuiltMap, resetReplayRankingResult, resetUtilityParams } from "./state";
import { resetAllTypingStatus } from "./status";
import { resetSubstatusState } from "./sub-status";
import { resetCurrentLine } from "./typing-word";
import { resetYTPlayer } from "./youtube-player";

export const resetAllStateOnCleanup = () => {
  resetYTPlayer();
  resetCurrentLine();
  clearAllLineResult();
  resetUtilityParams();
  resetSpeed();
  resetBuiltMap();
  resetAllTypingStatus();
  resetUtilityRefParams();
  resetSubstatusState();
  resetSubstatus();
  resetLineSubstatus();
  resetLineCount();
  resetReplayRankingResult();
};
