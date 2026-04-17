import { resetRetryCount } from "../lib/play-restart";
import { resetMapId } from "../provider";
import { resetTabName } from "../tabs/tabs";
import { resetTypingStatus } from "../tabs/typing-status/status-cell";
import { resetLineStyleIndex } from "../typing-card/custom-style";
import { resetElapsedSecTime } from "../typing-card/footer/playback-time";
import { resetSkipKey } from "../typing-card/footer/skip";
import { resetTotalTimeProgress } from "../typing-card/footer/total-time-progress";
import { resetCombo } from "../typing-card/header/combo";
import { resetLineKpm } from "../typing-card/header/line-kpm";
import { resetLineTimeProgress } from "../typing-card/header/line-time-progress";
import { resetNotify } from "../typing-card/header/notify";
import { resetLineRemainTime } from "../typing-card/header/remain-time";
import { resetLyrics } from "../typing-card/playing/lyrics";
import { resetNextLyrics } from "../typing-card/playing/next-lyrics";
import { resetLineCount, resetTimeOffset } from "../typing-card/playing/playing-scene";
import { resetScene } from "../typing-card/typing-card";
import { resetYoutubeStatus } from "../youtube/youtube-player";
import { resetBuiltMap } from "./built-map";
import { clearAllLineResult, resetLineSelectIndex } from "./line-result";
import { resetLineSubstatus } from "./line-substatus";
import { resetReplayRankingResult } from "./replay";
import { resetTypingStats } from "./stats";
import { resetTypingSubstatus } from "./substatus";
import { resetTypingWord } from "./typing-word";
import { resetYTPlayer } from "./youtube-player";

/** `/type` セッション用 Jotai 状態をすべて初期値へ戻す（store の差し替えはしない） */
export function resetAllTypingFeatureAtoms() {
  resetScene();
  resetNotify();
  resetTabName();
  resetRetryCount();
  resetSkipKey();

  resetTypingStatus();
  resetTypingStats();
  resetTypingSubstatus();
  resetLineSubstatus();
  resetTypingWord();
  resetReplayRankingResult();
  resetCombo();
  resetLineKpm();
  resetLineRemainTime();
  resetLineTimeProgress();
  resetTotalTimeProgress();
  resetElapsedSecTime();
  resetTimeOffset();
  resetLineCount();
  resetNextLyrics();
  resetLyrics();
  resetLineStyleIndex();

  resetYoutubeStatus();
  resetYTPlayer();
  clearAllLineResult();
  resetLineSelectIndex();
  resetBuiltMap();
  resetMapId();
}
