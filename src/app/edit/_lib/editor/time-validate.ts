import { readYTPlayer } from "../atoms/state";

export const timeValidate = (time: number) => {
  const YTPlayer = readYTPlayer();
  if (!YTPlayer) return 0;

  const duration = YTPlayer.getDuration();
  if (time <= 0) {
    return 0.001;
  }

  if (time >= duration) {
    return duration - 0.001;
  }

  return time;
};
