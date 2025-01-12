import { Box } from "@chakra-ui/react";
import VideoCurrentTimeText from "./child/VideoCurrentTimeText";
import VideoDurationTimeText from "./child/VideoDurationTimeText";

const PlayingTotalTime = () => {
  return (
    <Box fontFamily="mono" id="movie_time" userSelect="none">
      <VideoCurrentTimeText /> / <VideoDurationTimeText />
    </Box>
  );
};

export default PlayingTotalTime;
