import { usePlayer } from "../../atoms/refAtoms";

export const useTimeValidate = () => {
  const { readPlayer } = usePlayer();

  return (time: number) => {
    const duration = readPlayer().getDuration();
    if (0 >= time) {
      return 0.001;
    } else if (duration > time) {
      return duration - 0.001;
    } else {
      return time;
    }
  };
};

export default useTimeValidate;
