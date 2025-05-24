import { Box } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useInputTextarea, usePlayer, useUserStats } from "../../atom/refAtoms";
import { useMapState, useSceneState } from "../../atom/stateAtoms";
import ResultScore from "./end/ResultScore";
import LyricsContainer from "./play/LyricsContainer";

const ViewArea = () => {
  return (
    <Box
      fontFamily="Yu Gothic Ui"
      bg="rgba(0, 0, 0, 0.8)"
      width="100%"
      fontWeight="bold"
      textShadow="0px 0px 10px rgba(0, 0, 0, 1)"
      fontSize="4xl"
    >
      <SceneView />
      {/* <div id="music-title-container">
        <img src="/assets/img/music.png" alt="音楽アイコン" />
        <span id="title">{title || ""}</span>
      </div> */}

      {/* <div id="font-size-container">
        <img src="assets\img\control-090.png" id="font-size-arrow-top" className="arrow-highlight mb-2 p-1" />
        <img src="assets\img\control-270.png" id="font-size-arrow-down" className="arrow-highlight p-1" />
      </div> */}
    </Box>
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
      if (e.key === "Enter") {
        readPlayer().playVideo();
        readInputTextarea().focus();
        e.preventDefault();
      }
    };

    const handleVisibilitychange = () => {
      if (document.visibilityState === "hidden") {
        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_API_URL}/api/update-user-ime-typing-stats`,
          JSON.stringify({ ...readUserStats(), userId: Number(session?.user.id ?? 0) })
        );

        resetUserStats();
      }
    };
    const handleBeforeunload = () => {
      navigator.sendBeacon(
        `${process.env.NEXT_PUBLIC_API_URL}/api/update-user-ime-typing-stats`,
        JSON.stringify({ ...readUserStats(), userId: Number(session?.user.id ?? 0) })
      );

      resetUserStats();
    };

    if (scene === "play") {
      window.addEventListener("beforeunload", handleBeforeunload);
      window.addEventListener("visibilitychange", handleVisibilitychange);
    }

    if (scene === "ready" && map !== null) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("beforeunload", handleBeforeunload);
      window.removeEventListener("visibilitychange", handleVisibilitychange);
    };
  }, [scene, readPlayer, map, readInputTextarea, readUserStats, resetUserStats]);

  return (
    <Box ml={32}>
      <LyricsContainer visibility={scene === "ready" || scene === "end" ? "hidden" : "visible"} />
      {scene === "end" && <ResultScore position="absolute" top="2" />}
    </Box>
  );
};

export default ViewArea;
