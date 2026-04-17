import { resetRetryCount } from "../lib/play-restart";
import { resetMapId } from "../provider";
import { resetTypingOptions } from "../tabs/setting/popover";
import { resetTabNameAtom } from "../tabs/tabs";
import { resetTypingStatusHard } from "../tabs/typing-status/status-cell";
import { resetLineStyleIndexAtom } from "../typing-card/custom-style";
import { resetElapsedSecTime } from "../typing-card/footer/playback-time";
import { resetSkipKeyAtom } from "../typing-card/footer/skip";
import { resetTotalTimeProgressAtoms } from "../typing-card/footer/total-time-progress";
import { resetComboAtom } from "../typing-card/header/combo";
import { resetLineKpmAtom } from "../typing-card/header/line-kpm";
import { resetLineTimeProgressAtoms } from "../typing-card/header/line-time-progress";
import { resetNotifyAtom } from "../typing-card/header/notify";
import { resetLineRemainTime } from "../typing-card/header/remain-time";
import { resetLyricsAtom } from "../typing-card/playing/lyrics";
import { resetNextLyricsAtoms } from "../typing-card/playing/next-lyrics";
import { resetPlayingSceneAtoms } from "../typing-card/playing/playing-scene";
import { resetSceneAtom } from "../typing-card/typing-card";
import { resetYoutubeUiAtoms } from "../youtube/youtube-player";
import { resetBuiltMap } from "./built-map";
import { clearAllLineResult, resetLineSelectIndex } from "./line-result";
import { resetLineSubstatus } from "./line-substatus";
import { resetReplayRankingResult } from "./replay";
import { resetTypingStats } from "./stats";
import { resetTypingSubstatus } from "./substatus";
import { resetTypingWordAtoms } from "./typing-word";
import { resetYTPlayer } from "./youtube-player";

/** `/type` セッション用 Jotai 状態をすべて初期値へ戻す（store の差し替えはしない） */
export function resetAllTypingFeatureAtoms() {
  resetSceneAtom();
  resetNotifyAtom();
  resetTabNameAtom();
  resetRetryCount();
  resetSkipKeyAtom();

  resetTypingStatusHard();
  resetTypingStats();
  resetTypingSubstatus();
  resetLineSubstatus();
  resetTypingWordAtoms();
  resetReplayRankingResult();
  resetComboAtom();
  resetLineKpmAtom();
  resetLineRemainTime();
  resetLineTimeProgressAtoms();
  resetTotalTimeProgressAtoms();
  resetElapsedSecTime();
  resetPlayingSceneAtoms();
  resetNextLyricsAtoms();
  resetLyricsAtom();
  resetLineStyleIndexAtom();

  resetYoutubeUiAtoms();
  resetYTPlayer();

  resetTypingOptions();

  clearAllLineResult();
  resetLineSelectIndex();

  resetBuiltMap();
  resetMapId();
}
