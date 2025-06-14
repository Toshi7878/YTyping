import VideoCurrentTimeText from "./child/VideoCurrentTimeText";
import VideoDurationTimeText from "./child/VideoDurationTimeText";

const PlayingTotalTime = () => {
  return (
    <div className="font-mono" id="movie_time">
      <VideoCurrentTimeText /> / <VideoDurationTimeText />
    </div>
  );
};

export default PlayingTotalTime;
