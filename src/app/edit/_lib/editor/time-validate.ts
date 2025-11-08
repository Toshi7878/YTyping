import { getYTDuration } from "../atoms/state";

export const timeValidate = (time: number) => {
  if (time <= 0) {
    return 0.001;
  }

  const duration = getYTDuration() ?? 0;
  if (time >= duration) {
    return duration - 0.001;
  }

  return time;
};
