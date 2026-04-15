import { resetTypingStatus } from "../tabs/typing-status/status-cell";
import { setTotalProgressValue } from "../typing-card/footer/total-time-progress";
import { setLineProgressValue } from "../typing-card/header/line-time-progress";
import { setLyrics } from "../typing-card/playing/lyrics";
import { clearAllLineResult } from "./line-result";
import { resetLineCount, resetLineSubstatus, resetTypingSubstatus, resetUtilityRefParams } from "./ref";
import { resetBuiltMap, resetReplayRankingResult, resetUtilityParams } from "./state";
import { resetSubstatusState } from "./substatus";
import { resetTypingWord } from "./typing-word";
import { resetYTPlayer } from "./youtube-player";

export const resetAllStateOnCleanup = () => {
  resetYTPlayer();
  resetTypingWord();
  setLyrics("");
  clearAllLineResult();
  resetUtilityParams();
  resetBuiltMap();
  resetTypingStatus();
  resetUtilityRefParams();
  resetSubstatusState();
  resetTypingSubstatus();
  resetLineSubstatus();
  resetLineCount();
  resetReplayRankingResult();
  setLineProgressValue(0);
  setTotalProgressValue(0);
};
