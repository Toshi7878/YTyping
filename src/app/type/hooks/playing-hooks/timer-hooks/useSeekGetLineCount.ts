import { mapAtom } from "@/app/type/atoms/stateAtoms";
import { CreateMap } from "@/lib/instanceMapData";
import { useStore } from "jotai";

export const useGetSeekLineCount = () => {
  const typeAtomStore = useStore();

  return (newTime: number): number => {
    const map = typeAtomStore.get(mapAtom) as CreateMap;
    const index = map.mapData.findIndex((line) => line.time >= newTime);
    return Math.max(index);
  };
};
