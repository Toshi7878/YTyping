import { mutatePlayCountStats } from "@/domain/map/play-count";
import { resetUserResultMap } from "../../_feature/memu/result-dialog";
import { resetNotifications } from "../../_feature/notifications";
import { getMapId, resetMapId } from "../../_feature/provider";
import { dispatchImeEvent } from "../../_feature/user-script";
import { readTypingTextarea } from "../atoms/ref";
import { readScene, resetBuiltMap, resetScene, resetTypingWord, resetUtilityParams, setScene } from "../atoms/state";
import { resetYTPlayer, seekYTPlayer } from "../atoms/yt-player";

export const initializePlayScene = () => {
  const mapId = getMapId();

  if (mapId && readScene() === "ready") {
    mutatePlayCountStats({ mapId });
  }

  resetUtilityParams();
  resetNotifications();
  resetUserResultMap();

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
  resetUserResultMap();
  resetNotifications();
  resetMapId();
};
