import { useChangeCSSCountAtom, useMapAtom } from "@/app/type/atoms/stateAtoms";
import { CreateMap } from "@/lib/instanceMapData";

const PlayingChangeCSS = () => {
  const map = useMapAtom() as CreateMap;
  const changeCSSCount = useChangeCSSCountAtom();

  if (changeCSSCount === null) {
    return;
  }
  const changeCSS = map.mapData[changeCSSCount].options?.changeCSS || "";

  return <style>{changeCSS}</style>;
};

export default PlayingChangeCSS;
