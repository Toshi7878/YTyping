import { useEffect } from "react";
import { getSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { getTimezone } from "@/utils/date";
import { getBaseUrl } from "@/utils/get-base-url";
import { type ImeStats, readImeStats, readTypingTextarea, resetImeStats } from "../../_lib/atoms/ref";
import { useBuiltMapState, useSceneState } from "../../_lib/atoms/state";
import { playYTPlayer } from "../../_lib/atoms/yt-player";
import { ResultScore } from "./end/result-score";
import { LyricsContainer } from "./play/lyrics-container";

export const ViewArea = () => {
  const scene = useSceneState();
  const map = useBuiltMapState();

  const onClick = () => {
    if (scene === "ready" && map !== null) {
      playYTPlayer();
      const textarea = readTypingTextarea();
      if (textarea) {
        textarea.focus();
      }
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "w-full bg-black/80 font-bold text-2xl sm:text-3xl lg:text-4xl",
        scene === "ready" ? "cursor-pointer" : "cursor-default",
      )}
      style={{
        fontFamily: "Yu Gothic Ui",
        textShadow: "0px 0px 10px rgba(0, 0, 0, 1)",
      }}
    >
      <SceneView />
    </div>
  );
};

const SceneView = () => {
  const scene = useSceneState();
  const map = useBuiltMapState();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (scene) {
        case "ready":
          if (e.key === "Enter") {
            playYTPlayer();
            const textarea = readTypingTextarea();
            if (textarea) {
              textarea.focus();
            }
            e.preventDefault();
          }
          break;
        case "play":
          if (e.key === "Tab") {
            e.preventDefault();
            const textarea = readTypingTextarea();
            if (textarea) {
              textarea.focus();
            }
          }
          break;
      }
    };

    const handleVisibilitychange = () => {
      if (document.visibilityState === "hidden") {
        const stats = readImeStats();
        void sendImeStats(stats);
      }
    };
    const handleBeforeunload = () => {
      const stats = readImeStats();
      void sendImeStats(stats);
    };

    if (scene === "play") {
      window.addEventListener("beforeunload", handleBeforeunload);
      window.addEventListener("visibilitychange", handleVisibilitychange);
    }

    if (map !== null) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("beforeunload", handleBeforeunload);
      window.removeEventListener("visibilitychange", handleVisibilitychange);
    };
  }, [scene, map]);

  return (
    <div className="ml-6 md:ml-20 xl:ml-32">
      <LyricsContainer className={scene === "ready" || scene === "end" ? "invisible" : "visible"} />
      {scene === "end" && <ResultScore className="absolute top-2" />}
    </div>
  );
};

const sendImeStats = (stats: ImeStats) => {
  const session = getSession();
  if (!session) return;
  if (Object.values(stats).every((v) => v === 0)) return;

  const url = `${getBaseUrl()}/api/internal/user-stats/ime/increment`;
  const timezone = getTimezone();
  const body = new Blob([JSON.stringify({ ...stats, timezone })], {
    type: "application/json",
  });
  navigator.sendBeacon(url, body);

  resetImeStats();
};
