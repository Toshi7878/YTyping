import { clearAllLineResult } from "./family";
import { resetLineCount, resetLineSubstatus, resetTypingSubstatus, resetUtilityRefParams } from "./ref";
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
  resetBuiltMap();
  resetAllTypingStatus();
  resetUtilityRefParams();
  resetSubstatusState();
  resetTypingSubstatus();
  resetLineSubstatus();
  resetLineCount();
  resetReplayRankingResult();
};
