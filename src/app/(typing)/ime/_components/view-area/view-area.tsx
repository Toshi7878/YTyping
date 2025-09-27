import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { getBaseUrl } from "@/utils/get-base-url";
import { useInputTextarea, usePlayer, useUserStats } from "../../_lib/atoms/read-atoms";
import { useMapState, useSceneState } from "../../_lib/atoms/state-atoms";
import { ResultScore } from "./end/result-score";
import { LyricsContainer } from "./play/lyrics-container";

export const ViewArea = () => {
  const { readPlayer } = usePlayer();
  const { readInputTextarea } = useInputTextarea();
  const scene = useSceneState();
  const map = useMapState();

  const onClick = () => {
    if (scene === "ready" && map !== null) {
      readPlayer().playVideo();
      readInputTextarea().focus();
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "w-full bg-black/80 text-2xl font-bold sm:text-3xl lg:text-4xl",
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
  const { readPlayer } = usePlayer();
  const map = useMapState();
  const { readInputTextarea } = useInputTextarea();
  const { readUserStats, resetUserStats } = useUserStats();
  const { data: session } = useSession();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (scene) {
        case "ready":
          if (e.key === "Enter") {
            readPlayer().playVideo();
            readInputTextarea().focus();
            e.preventDefault();
          }
          break;
        case "play":
          if (e.key === "Tab") {
            e.preventDefault();
            readInputTextarea().focus();
          }
          break;
      }
    };

    const handleVisibilitychange = () => {
      if (document.visibilityState === "hidden") {
        const url = `${getBaseUrl()}/api/user-stats/ime/increment`;
        const body = new Blob([JSON.stringify({ ...readUserStats(), userId: Number(session?.user.id ?? 0) })], {
          type: "application/json",
        });
        navigator.sendBeacon(url, body);

        resetUserStats();
      }
    };
    const handleBeforeunload = () => {
      const url = `${getBaseUrl()}/api/user-stats/ime/increment`;
      const body = new Blob([JSON.stringify({ ...readUserStats(), userId: Number(session?.user.id ?? 0) })], {
        type: "application/json",
      });

      navigator.sendBeacon(url, body);

      resetUserStats();
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
  }, [scene, readPlayer, map, readInputTextarea, readUserStats, resetUserStats, session?.user.id]);

  return (
    <div className="ml-6 md:ml-20 xl:ml-32">
      <LyricsContainer className={scene === "ready" || scene === "end" ? "invisible" : "visible"} />
      {scene === "end" && <ResultScore className="absolute top-2" />}
    </div>
  );
};
