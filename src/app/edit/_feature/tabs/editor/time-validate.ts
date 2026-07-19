import { YTPlayer } from "../../youtube-player";

export const timeValidate = (time: number) => {
  if (time <= 0) {
    return 0.001;
  }

  const duration = YTPlayer.getDuration() ?? 0;
  if (time >= duration) {
    return duration - 0.001;
  }

  return time;
};
