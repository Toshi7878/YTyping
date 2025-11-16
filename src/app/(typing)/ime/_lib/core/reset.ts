import { mutatePlayCountStats } from "@/lib/mutations/play-count";
import { readMapId, resetMapId } from "../atoms/hydrate";
import { readTypingTextarea } from "../atoms/ref";
import {
  initializeResultsFromMap,
  readScene,
  readStatus,
  resetBuiltMap,
  resetNotifications,
  resetScene,
  resetStatus,
  resetUtilityParams,
  setScene,
} from "../atoms/state";
import { resetYTPlayer, seekYTPlayer } from "../atoms/yt-player";

export const initializePlayScene = () => {
  const mapId = readMapId();
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
};

export const pathChangeAtomReset = () => {
  resetUtilityParams();
  resetYTPlayer();
  resetBuiltMap();
  resetScene();
  resetStatus();
  resetNotifications();
  resetMapId();
};
