import { readTypingTextarea } from "../atoms/ref";
import { readBuiltMap, readUtilityParams, setSkipRemainTime } from "../atoms/state";
import { seekYTPlayer } from "../atoms/yt-player";

const SKIP_BUFFER_TIME = 3;

export const handleSkip = () => {
  const map = readBuiltMap();
  if (!map) return;
  const { count } = readUtilityParams();

  const nextLine = map.lines[count];
  const nextChunk = nextLine?.[0];
  if (!nextChunk) return;

  const nextStartTime = Number(nextChunk.startTime);

  const seekTime = nextStartTime - SKIP_BUFFER_TIME;

  seekYTPlayer(seekTime);

  setSkipRemainTime(null);

  const textarea = readTypingTextarea();
  if (textarea) {
    textarea.focus();
  }
};
