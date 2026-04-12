import { clearAllLineResult } from "./line-result";
import { resetLineCount, resetLineSubstatus, resetTypingSubstatus, resetUtilityRefParams } from "./ref";
import { resetBuiltMap, resetReplayRankingResult, resetUtilityParams } from "./state";
import { resetAllTypingStatus } from "./status";
import { resetSubstatusState } from "./substatus";
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
