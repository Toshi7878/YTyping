import { setLyrics } from "../_feature/typing-card/playing/lyrics";
import { clearAllLineResult } from "./line-result";
import { resetLineCount, resetLineSubstatus, resetTypingSubstatus, resetUtilityRefParams } from "./ref";
import { resetBuiltMap, resetReplayRankingResult, resetUtilityParams } from "./state";
import { resetAllTypingStatus } from "./status";
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
  resetAllTypingStatus();
  resetUtilityRefParams();
  resetSubstatusState();
  resetTypingSubstatus();
  resetLineSubstatus();
  resetLineCount();
  resetReplayRankingResult();
};
