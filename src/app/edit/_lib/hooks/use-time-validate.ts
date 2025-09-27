import { usePlayer } from "../atoms/read-atoms";

export const useTimeValidate = () => {
  const { readPlayer } = usePlayer();

  return (time: number) => {
    const duration = readPlayer().getDuration();
    if (time <= 0) {
      return 0.001;
    }

    if (time >= duration) {
      return duration - 0.001;
    }

    return time;
  };
};
