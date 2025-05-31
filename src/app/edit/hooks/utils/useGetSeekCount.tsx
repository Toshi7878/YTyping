import { useReadMap } from "../../atoms/mapReducerAtom";

export const useGetSeekCount = () => {
  const readMap = useReadMap();

  return (time: number) => {
    let count = 0;

    const map = readMap();
    for (let i = 0; i < map.length; i++) {
      if (Number(map[i]["time"]) - time >= 0) {
        count = i - 1;
        break;
      }
    }

    if (count < 0) {
      count = 0;
    }

    return count;
  };
};
