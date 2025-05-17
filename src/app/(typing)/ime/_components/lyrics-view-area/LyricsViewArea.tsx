import { Box } from "@chakra-ui/react";
import { useEffect } from "react";
import { usePlayer } from "../../atom/refAtoms";
import { useSceneState } from "../../atom/stateAtoms";
import ResultScore from "./end/ResultScore";
import LyricsContainer from "./play/LyricsContainer";

const LyricsViewArea = () => {
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        readPlayer().playVideo();
      }
    };
    if (scene === "ready") {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scene, readPlayer]);
  return (
    <Box ml={32}>
      <LyricsContainer visibility={scene === "ready" || scene === "play" ? "visible" : "hidden"} />
      {scene === "end" && <ResultScore position="absolute" top="2" />}
    </Box>
  );
};

export default LyricsViewArea;
