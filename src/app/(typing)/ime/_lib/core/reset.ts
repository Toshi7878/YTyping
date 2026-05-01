import { mutatePlayCountStats } from "@/lib/mutations/play-count";
import { resetNotifications } from "../../_feature/notifications";
import { getMapId, resetMapId } from "../../_feature/provider";
import { dispatchImeEvent } from "../../_feature/user-script";
import { resetUserResults } from "../../_feature/view-area/end/score-ranking";
import { readTypingTextarea } from "../atoms/ref";
import {
  getTypeCount,
  initializeResultsFromMap,
  readScene,
  resetBuiltMap,
  resetScene,
  resetTypeCount,
  resetTypingWord,
  resetUtilityParams,
  setScene,
} from "../atoms/state";
import { resetYTPlayer, seekYTPlayer } from "../atoms/yt-player";

export const initializePlayScene = () => {
  const mapId = getMapId();
  if (mapId && (getTypeCount() > 0 || readScene() === "ready")) {
    mutatePlayCountStats({ mapId });
  }

  resetUtilityParams();
  resetTypeCount();
  initializeResultsFromMap();
  resetNotifications();
  resetUserResults();

  const textarea = readTypingTextarea();
  if (textarea) {
    textarea.focus();
  }

  setScene("play");
  seekYTPlayer(0);
  dispatchImeEvent("start");
};

export const pathChangeAtomReset = () => {
  resetTypingWord();
  resetUtilityParams();
  resetYTPlayer();
  resetBuiltMap();
  resetScene();
  resetTypeCount();
  resetUserResults();
  resetNotifications();
  resetMapId();
};
