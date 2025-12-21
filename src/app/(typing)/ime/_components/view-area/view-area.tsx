import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { getBaseUrl } from "@/utils/get-base-url";
import { readTypingTextarea, readUserStats, resetUserStats } from "../../_lib/atoms/ref";
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
  const { data: session } = useSession();

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
        sendUserStats(Number(session?.user.id ?? 0));
      }
    };
    const handleBeforeunload = () => {
      sendUserStats(Number(session?.user.id ?? 0));
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
  }, [scene, map, session?.user.id]);

  return (
    <div className="ml-6 md:ml-20 xl:ml-32">
      <LyricsContainer className={scene === "ready" || scene === "end" ? "invisible" : "visible"} />
      {scene === "end" && <ResultScore className="absolute top-2" />}
    </div>
  );
};

const sendUserStats = (userId: number) => {
  const url = `${getBaseUrl()}/api/user-stats/ime/increment`;
  const body = new Blob([JSON.stringify({ ...readUserStats(), userId })], {
    type: "application/json",
  });
  navigator.sendBeacon(url, body);

  resetUserStats();
};
