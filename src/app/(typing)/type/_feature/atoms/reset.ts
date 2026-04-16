import { setTabName } from "../tabs/tabs";
import { resetTypingStatus } from "../tabs/typing-status/status-cell";
import { setTotalProgressValue } from "../typing-card/footer/total-time-progress";
import { setLineProgressValue } from "../typing-card/header/line-time-progress";
import { setLyrics } from "../typing-card/playing/lyrics";
import { setScene } from "../typing-card/typing-card";
import { resetBuiltMap } from "./built-map";
import { clearAllLineResult } from "./line-result";
import { resetLineSubstatus } from "./line-substatus";
import { resetReplayRankingResult } from "./replay";
import { resetTypingSubstatus } from "./substatus";
import { resetTypingWord } from "./typing-word";
import { resetYTPlayer } from "./youtube-player";

export const resetAllStateOnCleanup = () => {
  resetYTPlayer();
  resetTypingWord();
  setLyrics("");
  clearAllLineResult();
  resetBuiltMap();
  resetTypingStatus();
  resetTypingSubstatus();
  resetLineSubstatus();
  resetReplayRankingResult();
  setLineProgressValue(0);
  setTotalProgressValue(0);
  setTabName("ランキング");
  setScene("ready");
};
