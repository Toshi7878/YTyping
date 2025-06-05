import { Box } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useInputTextarea, usePlayer, useUserStats } from "../../atom/refAtoms";
import { useMapState, useSceneState } from "../../atom/stateAtoms";
import ResultScore from "./end/ResultScore";
import LyricsContainer from "./play/LyricsContainer";

const ViewArea = () => {
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
    <Box
      onClick={onClick}
      cursor={scene === "ready" ? "pointer" : "default"}
      fontFamily="Yu Gothic Ui"
      bg="rgba(0, 0, 0, 0.8)"
      width="100%"
      fontWeight="bold"
      textShadow="0px 0px 10px rgba(0, 0, 0, 1)"
      fontSize={{ base: "2xl", sm: "3xl", lg: "4xl" }}
    >
      <SceneView />
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
        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_API_URL}/api/update-user-ime-typing-stats`,
          JSON.stringify({ ...readUserStats(), userId: Number(session?.user.id ?? 0) }),
        );

        resetUserStats();
      }
    };
    const handleBeforeunload = () => {
      navigator.sendBeacon(
        `${process.env.NEXT_PUBLIC_API_URL}/api/update-user-ime-typing-stats`,
        JSON.stringify({ ...readUserStats(), userId: Number(session?.user.id ?? 0) }),
      );

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
    <Box ml={{ base: 6, md: 20, xl: 32 }}>
      <LyricsContainer visibility={scene === "ready" || scene === "end" ? "hidden" : "visible"} />
      {scene === "end" && <ResultScore position="absolute" top="2" />}
    </Box>
  );
};

export default ViewArea;
