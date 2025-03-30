import { useChangeCSSCountState, useMapState } from "@/app/type/atoms/stateAtoms";

const ChangeCSS = () => {
  const map = useMapState();
  const changeCSSCount = useChangeCSSCountState();

  if (changeCSSCount === null) {
    return;
  }
  const changeCSS = map.mapData[changeCSSCount].options?.changeCSS;

  return <style>{changeCSS}</style>;
};

export default ChangeCSS;
