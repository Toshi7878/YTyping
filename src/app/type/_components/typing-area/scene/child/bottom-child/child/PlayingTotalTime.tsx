import { Box } from "@chakra-ui/react";
import VideoDurationTimeText from "./child/VideoDurationTimeText";
import VideoCurrentTimeText from "./child/VideoCurrentTimeText";

const PlayingTotalTime = () => {
  return (
    <Box fontSize="2xl" fontFamily="mono" id="movie_time">
      <VideoCurrentTimeText /> / <VideoDurationTimeText />
    </Box>
  );
};

export default PlayingTotalTime;
