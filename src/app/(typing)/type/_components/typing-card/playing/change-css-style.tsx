import { useBuiltMapState, useChangeCSSCountState } from "@/app/(typing)/type/_lib/atoms/state";

export const ChangeCSS = () => {
  const map = useBuiltMapState();
  const changeCSSCount = useChangeCSSCountState();

  if (changeCSSCount === null) {
    return;
  }
  const changeCSS = map?.lines[changeCSSCount]?.options?.changeCSS;
  if (!changeCSS) return;
  return <style>{changeCSS}</style>;
};
