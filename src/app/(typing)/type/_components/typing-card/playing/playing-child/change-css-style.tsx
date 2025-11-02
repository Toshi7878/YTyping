import { useChangeCSSCountState, useMapState } from "@/app/(typing)/type/_lib/atoms/state-atoms";

export const ChangeCSS = () => {
  const map = useMapState();
  const changeCSSCount = useChangeCSSCountState();

  if (changeCSSCount === null) {
    return;
  }
  const changeCSS = map?.mapData[changeCSSCount]?.options?.changeCSS;
  if (!changeCSS) return;
  return <style>{changeCSS}</style>;
};
