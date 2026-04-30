import { mutatePlayCountStats } from "@/lib/mutations/play-count";
import { resetNotifications } from "../../_feature/notifications-display";
import { getMapId, resetMapId } from "../../_feature/provider";
import { dispatchImeEvent } from "../../_feature/user-script";
import { readTypingTextarea } from "../atoms/ref";
import {
  initializeResultsFromMap,
  readScene,
  readStatus,
  resetBuiltMap,
  resetScene,
  resetStatus,
  resetTypingWord,
  resetUtilityParams,
  setScene,
} from "../atoms/state";
import { resetYTPlayer, seekYTPlayer } from "../atoms/yt-player";

export const initializePlayScene = () => {
  const mapId = getMapId();
  if (mapId && (readStatus().typeCount > 0 || readScene() === "ready")) {
    mutatePlayCountStats({ mapId });
  }

  resetUtilityParams();
  resetStatus();
  initializeResultsFromMap();
  resetNotifications();

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
  resetStatus();
  resetNotifications();
  resetMapId();
};
