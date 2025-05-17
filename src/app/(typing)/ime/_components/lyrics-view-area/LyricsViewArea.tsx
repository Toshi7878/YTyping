import { Box } from "@chakra-ui/react";
import { useSceneState } from "../../atom/stateAtoms";
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

  if (scene === "ready" || scene === "play") {
    return <LyricsContainer />;
  }

  if (scene === "end") {
    return "end";
  }

  return null;
};

export default LyricsViewArea;
